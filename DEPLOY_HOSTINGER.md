# 🚀 Deploy do Sistema Food na Hostinger

O Sistema Food tem **duas partes**:

1. **Interface** (React/Vite) — arquivos estáticos gerados em `dist/` pelo `npm run build`.
2. **Servidor** (Node/Express + SQLite) — `server.js`, `server/` e `shared/`.

O servidor é obrigatório para login, dados compartilhados entre terminais e sincronização em tempo real.

> ⚠️ **Atenção:** enviar somente `dist/` por FTP publica apenas a interface. Nesse caso o sistema abre em **modo local** (dados no navegador), sem login e sem compartilhamento entre caixa, garçons e KDS.

## Requisitos

- **Node.js 22.5 ou superior** no servidor (o sistema usa o módulo nativo `node:sqlite`).
- Um domínio apontando para a hospedagem.
- HTTPS ativo (obrigatório para o cookie de sessão seguro).

## Variáveis de ambiente

| Variável | Valor em produção | Observação |
| --- | --- | --- |
| `NODE_ENV` | `production` | Ativa verificações e HSTS |
| `PORT` | porta interna (ex.: `3000`) | Em VPS, use a porta do proxy reverso |
| `HOST` | `127.0.0.1` | Use `0.0.0.0` só se não houver proxy na frente |
| `TRUST_PROXY` | `true` | Necessário atrás de nginx ou proxy da Hostinger |
| `SESSION_COOKIE_SECURE` | `true` | Exige HTTPS |
| `DB_PATH` | `/var/lib/sistema-food/sistema-food.sqlite` | Fora da pasta do código |
| `ADMIN_EMAIL` | seu e-mail | Usado só na primeira execução |
| `ADMIN_PASSWORD` | senha forte (mínimo 12 caracteres) | Usada só na primeira execução |

> Use aspas quando o valor tiver `#`, espaço ou `!`. Sem aspas, o `#` é tratado como comentário e corta a senha.

---

## Caminho A — VPS ou Cloud com SSH (recomendado)

> ⚠️ **Importante:** a branch em produção é `feat/backend-vps`, **não** a `main`.
> A `main` é publicada automaticamente pela Hostinger e serve apenas a interface estática.
> O backend fica na branch até estar validado.

### Instalação em um comando

Conectado à VPS por SSH:

```bash
sudo apt-get update && sudo apt-get install -y git
git clone --branch feat/backend-vps https://github.com/paulo707070cesar/sistemafoods.git /tmp/sistema-food
sudo bash /tmp/sistema-food/deploy/instalar-vps.sh
```

O instalador faz tudo: instala o Node.js 22, cria usuário e pastas, baixa o código, compila a interface, gera as credenciais do administrador, registra o serviço systemd e valida a API. É idempotente — rode de novo para atualizar.

Com domínio e HTTPS:

```bash
sudo bash /tmp/sistema-food/deploy/instalar-vps.sh seudominio.com.br
sudo certbot --nginx -d seudominio.com.br
```

### Instalação manual (passo a passo)

```bash
# 1. Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Usuário e pastas
sudo useradd --system --create-home --shell /usr/sbin/nologin sistemafood
sudo mkdir -p /opt/sistema-food /var/lib/sistema-food /etc/sistema-food
sudo chown -R sistemafood:sistemafood /opt/sistema-food /var/lib/sistema-food

# 3. Código (branch do backend)
sudo -u sistemafood git clone --branch feat/backend-vps https://github.com/paulo707070cesar/sistemafoods.git /opt/sistema-food
cd /opt/sistema-food

# 4. Dependências e build
sudo -u sistemafood npm ci
sudo -u sistemafood npm run build

# 5. Variáveis de ambiente
sudo tee /etc/sistema-food/ambiente.conf > /dev/null <<'EOF'
ADMIN_EMAIL="seu-email@exemplo.com"
ADMIN_PASSWORD="TroqueEstaSenhaForte123"
EOF
sudo chmod 600 /etc/sistema-food/ambiente.conf
sudo chown root:root /etc/sistema-food/ambiente.conf

# 6. Serviço
sudo cp deploy/sistema-food.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now sistema-food
sudo systemctl status sistema-food

# 7. Proxy reverso e HTTPS
sudo cp deploy/nginx-sistema-food.conf /etc/nginx/sites-available/sistema-food
sudo nano /etc/nginx/sites-available/sistema-food   # ajuste server_name
sudo ln -s /etc/nginx/sites-available/sistema-food /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d seudominio.com.br
```

Teste local no servidor:

```bash
curl -s http://127.0.0.1:3000/api/health
```

---

## Caminho B — Hospedagem com Node.js no hPanel

Use quando o plano oferece a seção **Node.js** no hPanel (Cloud ou compartilhada com suporte a Node).

1. **Envie o código** para a pasta do aplicativo (ex.: `~/nodejs` ou `~/public_html/app`) usando a integração **Git** do hPanel ou FTP.
   - Envie o projeto completo: `server.js`, `server/`, `shared/`, `src/`, `public/`, `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig.json`.
   - **Não** envie `node_modules/`, `dist/`, `data/`, `.env` nem `dist-electron/`.
2. No hPanel, em **Node.js**, aponte:
   - **Application root**: a pasta escolhida acima.
   - **Application startup file**: `server.js`.
   - **Node.js version**: 22 ou superior.
3. Rode **Run NPM Install**.
4. Rode o build (via SSH ou pelo terminal do hPanel):
   ```bash
   npm run build
   ```
5. Cadastre as variáveis de ambiente da tabela acima na seção Node.js do hPanel.
6. Inicie/reinicie o aplicativo.
7. Ative o **SSL** em Segurança → SSL.

Confirme com: `https://seudominio.com.br/api/health` → deve responder `{"status":"ok", ...}`.

---

## Primeiro acesso

O usuário administrador é criado na primeira execução, quando ainda não existe nenhum usuário no banco:

- Com `ADMIN_EMAIL` e `ADMIN_PASSWORD` definidos, essas credenciais são usadas.
- Sem elas, nenhum usuário é criado e o login fica indisponível.

Use as credenciais em **Nuvem / Acesso Remoto**, no menu superior. Troque a senha depois do primeiro acesso.

---

## Atualizações

```bash
cd /opt/sistema-food
sudo -u sistemafood git pull
sudo -u sistemafood npm ci
sudo -u sistemafood npm run build
sudo systemctl restart sistema-food
```

---

## Backup

Todo o estado de negócio fica em um único arquivo SQLite:

```bash
sudo systemctl stop sistema-food
sudo cp /var/lib/sistema-food/sistema-food.sqlite /var/backups/sistema-food-$(date +%F).sqlite
sudo systemctl start sistema-food
```

Agende isso no cron. Como o banco usa WAL, pare o serviço ou copie também os arquivos `-wal` e `-shm`.

---

## Problemas comuns

| Sintoma | Causa provável |
| --- | --- |
| Página 503 | Nenhum aplicativo servindo o domínio, ou o processo Node parou |
| `/api/health` devolve HTML em vez de JSON | O domínio está servindo só os arquivos estáticos, sem o Node |
| Login diz "API indisponível" | O frontend foi publicado sem o servidor |
| `node:sqlite` não encontrado | Node.js abaixo de 22.5 |
| Login não persiste | `TRUST_PROXY` ou `SESSION_COOKIE_SECURE` mal configurados para o HTTPS |
| Dados não sincronizam entre telas | SSE bloqueado por proxy sem `proxy_buffering off` |

---

## Sobre o workflow do GitHub

`.github/workflows/deploy-hostinger.yml` compila o projeto e envia **apenas `dist/` por FTP**.
Ele serve para publicação estática e **não** publica o servidor Node. Para o sistema completo, use o Caminho A ou B.
