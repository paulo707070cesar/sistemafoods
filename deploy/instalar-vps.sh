#!/usr/bin/env bash
#
# Instalador do Sistema Food em VPS/Cloud (Debian/Ubuntu).
#
# Uso:
#   sudo bash deploy/instalar-vps.sh [dominio]
#
# Exemplos:
#   sudo bash deploy/instalar-vps.sh                      # só o aplicativo, na porta 3000
#   sudo bash deploy/instalar-vps.sh sistemafood.com.br    # com nginx e HTTPS
#
# O script é idempotente: pode ser executado novamente para atualizar o sistema.

set -euo pipefail

DOMINIO="${1:-}"
REPO_URL="${REPO_URL:-https://github.com/paulo707070cesar/sistemafoods.git}"
REPO_BRANCH="${REPO_BRANCH:-feat/backend-vps}"
APP_DIR="/opt/sistema-food"
DATA_DIR="/var/lib/sistema-food"
CONF_DIR="/etc/sistema-food"
CONF_FILE="${CONF_DIR}/ambiente.conf"
SERVICO="sistema-food"
USUARIO="sistemafood"
PORTA="3000"

log()  { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }
erro() { printf '\n\033[1;31mERRO: %s\033[0m\n' "$1" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || erro "Execute com sudo: sudo bash deploy/instalar-vps.sh"

# ---------------------------------------------------------------------------
# 1. Node.js 22.5+ (obrigatório: o sistema usa o módulo nativo node:sqlite)
# ---------------------------------------------------------------------------
log "Verificando Node.js"

node_ok() {
  command -v node >/dev/null 2>&1 || return 1
  local maior menor
  maior="$(node -p 'process.versions.node.split(".")[0]')"
  menor="$(node -p 'process.versions.node.split(".")[1]')"
  [ "$maior" -gt 22 ] && return 0
  [ "$maior" -eq 22 ] && [ "$menor" -ge 5 ] && return 0
  return 1
}

if node_ok; then
  echo "Node.js $(node -v) já atende ao requisito."
else
  echo "Instalando Node.js 22..."
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update -qq
    apt-get install -y -qq curl ca-certificates
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y -qq nodejs
  else
    erro "Gerenciador apt-get não encontrado. Instale o Node.js 22.5+ manualmente."
  fi
  node_ok || erro "Node.js instalado não atende ao requisito mínimo (22.5)."
fi

# ---------------------------------------------------------------------------
# 2. Usuário e diretórios
# ---------------------------------------------------------------------------
log "Preparando usuário e diretórios"

id -u "$USUARIO" >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin "$USUARIO"
mkdir -p "$APP_DIR" "$DATA_DIR" "$CONF_DIR"
chown -R "$USUARIO:$USUARIO" "$APP_DIR" "$DATA_DIR"

# ---------------------------------------------------------------------------
# 3. Código
# ---------------------------------------------------------------------------
log "Obtendo o código (branch ${REPO_BRANCH})"

if [ -d "$APP_DIR/.git" ]; then
  sudo -u "$USUARIO" git -C "$APP_DIR" fetch --quiet origin "$REPO_BRANCH"
  sudo -u "$USUARIO" git -C "$APP_DIR" checkout --quiet "$REPO_BRANCH"
  sudo -u "$USUARIO" git -C "$APP_DIR" reset --hard --quiet "origin/$REPO_BRANCH"
else
  rm -rf "$APP_DIR"
  sudo -u "$USUARIO" git clone --quiet --branch "$REPO_BRANCH" "$REPO_URL" "$APP_DIR"
fi

# ---------------------------------------------------------------------------
# 4. Dependências e build da interface
# ---------------------------------------------------------------------------
log "Instalando dependências e compilando a interface"
cd "$APP_DIR"
sudo -u "$USUARIO" npm ci --no-audit --no-fund
sudo -u "$USUARIO" npm run build

[ -f "$APP_DIR/dist/index.html" ] || erro "Build não gerou dist/index.html"

# ---------------------------------------------------------------------------
# 5. Credenciais do administrador (usadas apenas no primeiro acesso)
# ---------------------------------------------------------------------------
log "Configurando variáveis de ambiente"

if [ -f "$CONF_FILE" ]; then
  echo "Mantendo $CONF_FILE existente."
else
  ADMIN_EMAIL="${ADMIN_EMAIL:-admin@sistemafood.local}"
  ADMIN_PASSWORD="${ADMIN_PASSWORD:-$(head -c 18 /dev/urandom | base64 | tr -d '/+=' | head -c 16)}"

  cat > "$CONF_FILE" <<EOF
ADMIN_EMAIL="${ADMIN_EMAIL}"
ADMIN_PASSWORD="${ADMIN_PASSWORD}"
EOF
  chmod 600 "$CONF_FILE"
  chown root:root "$CONF_FILE"

  echo
  echo "-------------------------------------------------------------"
  echo " CREDENCIAIS DE ADMINISTRADOR (guarde agora)"
  echo "   E-mail: ${ADMIN_EMAIL}"
  echo "   Senha:  ${ADMIN_PASSWORD}"
  echo "-------------------------------------------------------------"
fi

# ---------------------------------------------------------------------------
# 6. Serviço systemd
# ---------------------------------------------------------------------------
log "Instalando o serviço ${SERVICO}"
cp "$APP_DIR/deploy/sistema-food.service" "/etc/systemd/system/${SERVICO}.service"
systemctl daemon-reload
systemctl enable --quiet "$SERVICO"
systemctl restart "$SERVICO"

sleep 3
systemctl is-active --quiet "$SERVICO" || {
  journalctl -u "$SERVICO" -n 40 --no-pager || true
  erro "O serviço não iniciou. Veja o log acima."
}

# ---------------------------------------------------------------------------
# 7. Verificação
# ---------------------------------------------------------------------------
log "Verificando a API"
if curl -fsS "http://127.0.0.1:${PORTA}/api/health" >/dev/null; then
  echo "API respondeu corretamente em http://127.0.0.1:${PORTA}"
else
  erro "A API não respondeu. Verifique: journalctl -u ${SERVICO} -n 40"
fi

# ---------------------------------------------------------------------------
# 8. Nginx e HTTPS (opcional)
# ---------------------------------------------------------------------------
if [ -n "$DOMINIO" ]; then
  log "Configurando nginx para ${DOMINIO}"

  apt-get install -y -qq nginx

  sed "s/seudominio.com.br/${DOMINIO}/g" \
    "$APP_DIR/deploy/nginx-sistema-food.conf" > "/etc/nginx/sites-available/${SERVICO}"
  ln -sf "/etc/nginx/sites-available/${SERVICO}" "/etc/nginx/sites-enabled/${SERVICO}"
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl reload nginx

  if command -v certbot >/dev/null 2>&1; then
    echo "Certbot já instalado."
  else
    apt-get install -y -qq certbot python3-certbot-nginx
  fi

  echo
  echo "Para emitir o certificado HTTPS, execute:"
  echo "  certbot --nginx -d ${DOMINIO}"
else
  echo
  echo "Nenhum domínio informado: o sistema está acessível apenas em http://127.0.0.1:${PORTA}."
  echo "Para publicar com HTTPS, rode novamente passando o domínio:"
  echo "  sudo bash deploy/instalar-vps.sh seudominio.com.br"
fi

log "Concluído"
echo "Serviço:   systemctl status ${SERVICO}"
echo "Logs:      journalctl -u ${SERVICO} -f"
echo "Banco:     ${DATA_DIR}/sistema-food.sqlite"
echo "Config:    ${CONF_FILE}"
