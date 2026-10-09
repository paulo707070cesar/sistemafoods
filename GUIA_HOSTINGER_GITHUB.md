# 🌐 Guia de Publicação na Hostinger através do GitHub

> ⚠️ **LEIA PRIMEIRO:** este guia descreve a publicação **estática** (apenas `dist/`).
> Ele **não** coloca no ar o servidor Node, e portanto o sistema sobe em modo local, sem login e sem dados compartilhados.
> Para o sistema completo, use **[DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md)**.
>
> Além disso, o deploy por FTP **só funciona depois** de cadastrar os segredos
> `HOSTINGER_FTP_SERVER`, `HOSTINGER_FTP_USERNAME` e `HOSTINGER_FTP_PASSWORD` em
> **Settings → Secrets and variables → Actions** no GitHub. Sem eles o workflow falha de forma explícita.

Este guia passo a passo ensina como enviar o **Sistema Food — Bar & Restaurante** para a **Hostinger** utilizando o **GitHub**, garantindo que o sistema funcione com carregamento ultra-rápido, suporte a SPA (sem erros 404 ao recarregar a página) e certificado SSL gratuito.

---

## 📋 Pré-requisitos
1. Uma conta na [Hostinger](https://www.hostinger.com.br/) com plano de Hospedagem Web, Cloud ou VPS.
2. Uma conta no [GitHub](https://github.com/).
3. O código deste projeto no seu computador.

---

## 🚀 Passo 1: Enviar o Projeto para o seu GitHub

Se ainda não enviou este projeto para o seu GitHub, faça o seguinte no seu terminal ou Git Bash:

```bash
# 1. Inicialize o repositório git (caso ainda não esteja inicializado)
git init

# 2. Adicione todos os arquivos
git add .

# 3. Crie o primeiro commit
git commit -m "feat: Sistema Food completo com suporte a Hostinger e Desktop"

# 4. Conecte ao seu repositório no GitHub (substitua pela sua URL)
git remote add origin https://github.com/SEU-USUARIO/sistema-food.git

# 5. Defina a branch principal como main e envie os arquivos
git branch -M main
git push -u origin main
```

---

## ⚡ Passo 2: Configurar o Deploy na Hostinger (3 Métodos Disponíveis)

### 🥇 Método A: Integração Git Nativa no hPanel da Hostinger (Mais Simples e Recomendado)

A Hostinger possui um gerenciador de **Git** integrado diretamente no painel de controle (hPanel):

1. Acesse o **hPanel da Hostinger** (`hpanel.hostinger.com`).
2. Vá em **Sites** -> clique em **Gerenciar** no seu domínio.
3. Na barra de busca lateral, digite **Git** ou role até a seção **Avançado -> Git**.
4. Configure a implantação:
   - **Repositório**: Cole a URL do seu GitHub (ex: `https://github.com/SEU-USUARIO/sistema-food.git`).
   - **Branch**: Digite `main`.
   - **Diretório de Instalação**: Deixe vazio ou coloque `/public_html`.
5. Clique em **Criar**.
6. A Hostinger clonará o repositório. Para fazer a build:
   - Se sua hospedagem tiver terminal **SSH**, acesse o SSH e execute:
     ```bash
     cd public_html
     npm install
     npm run build
     cp -r dist/* .
     ```
   - Ou utilize o **Método B** (GitHub Actions automático).

---

### 🥈 Método B: Deploy Automático via GitHub Actions (CI/CD Profissional)

O projeto já inclui o arquivo pronto `.github/workflows/deploy-hostinger.yml`. Toda vez que você der `git push`, o GitHub compila o sistema e envia automaticamente para a Hostinger via FTP!

#### Como ativar:
1. No hPanel da Hostinger, vá em **Acesso FTP** e anote:
   - **Host do FTP** (ex: `ftp.seusite.com.br` ou IP da Hostinger)
   - **Usuário FTP**
   - **Senha do FTP**
2. No seu repositório no **GitHub**, acesse:
   - **Settings** -> **Secrets and variables** -> **Actions**.
3. Clique em **New repository secret** e adicione 3 segredos:
   - `HOSTINGER_FTP_SERVER` -> Host do seu FTP
   - `HOSTINGER_FTP_USERNAME` -> Seu usuário do FTP
   - `HOSTINGER_FTP_PASSWORD` -> Sua senha do FTP
4. Pronto! A partir de agora, qualquer alteração que você enviar para a branch `main` será compilada pelo GitHub e publicada diretamente na sua Hostinger sem você precisar fazer nada manualmente.

---

### 🥉 Método C: Build Local e Envio Rápido via Gerenciador de Arquivos

Se preferir não usar automações de CI/CD:

1. No seu computador, execute no terminal:
   ```bash
   npm run build
   ```
2. Uma pasta chamada `dist/` será gerada com todos os arquivos prontos e otimizados (incluindo o `.htaccess`).
3. Compacte os arquivos de dentro da pasta `dist/` em um arquivo `.zip`.
4. No hPanel da Hostinger, abra o **Gerenciador de Arquivos** (`File Manager`).
5. Acesse a pasta `public_html/`.
6. Faça o upload do `.zip` e clique em **Extrair**.
7. Pronto! Seu sistema estará no ar no seu domínio.

---

## 🔒 Passo 3: Ativar SSL Gratuito na Hostinger
1. No hPanel, vá em **Segurança -> SSL**.
2. Clique em **Instalar SSL** (fornecido gratuitamente pela Let's Encrypt na Hostinger).
3. O arquivo `public/.htaccess` incluído no projeto já força o redirecionamento automático para `https://` seguro.

---

## 🛠️ Arquivo `.htaccess` já incluso
O projeto já conta com o arquivo `public/.htaccess` configurado com:
- ✅ **Roteamento SPA**: Evita erros 404 ao recarregar a página em rotas internas.
- ✅ **Compressão Gzip**: Carregamento 70% mais rápido em celulares e tablets.
- ✅ **Cache de Assets**: Economiza largura de banda do servidor e acelera navegação da equipe.
- ✅ **Cabeçalhos de Segurança HTTP**: Proteção contra MIME-sniffing e clickjacking.
