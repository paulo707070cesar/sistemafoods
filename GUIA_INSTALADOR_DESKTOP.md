# 💻 Guia do Instalador Desktop para Computador (Windows / Linux / Mac)

O **Sistema Food — Bar & Restaurante** possui suporte nativo para rodar como aplicativo executável de computador via **Electron**, ideal para caixas físicos, monitores KDS da cozinha e terminais de salão sem depender do navegador web.

---

## 📦 Tipos de Executáveis Disponíveis

1. **Instalador Completo Windows (`Setup.exe`)**:
   - Cria atalho na Área de Trabalho e no Menu Iniciar.
   - Assistente de instalação em português (NSIS).
   - Permite escolher a pasta de destino (ex: `C:\Arquivos de Programas\Sistema Food`).
   - Desinstalador automático incluso no Painel de Controle do Windows.

2. **Versão Portátil (`Portable .exe`)**:
   - Não requer instalação no computador.
   - Pode ser transportado e executado direto de um Pen Drive.
   - Ideal para computadores com permissões restritas.

---

## ⚡ Método Mais Rápido (1 Clique no Windows)

O projeto inclui o script automatizado **`gerar-instalador-windows.bat`**:

1. Dê um duplo clique no arquivo:
   ```text
   gerar-instalador-windows.bat
   ```
2. O script irá:
   - Verificar se o Node.js está instalado.
   - Instalar automaticamente todas as dependências.
   - Compilar o código do sistema.
   - Gerar o instalador `.exe` do Windows.
   - Abrir automaticamente a pasta `dist-electron\` onde o arquivo instalador estará pronto!
3. Basta dar dois cliques no instalador gerado e instalar no computador do caixa ou da cozinha!

---

## 🛠️ Método Manual via Terminal / Linha de Comando

Se preferir executar os comandos manualmente no terminal:

### 1. Instalar as dependências
```bash
npm install
```

### 2. Gerar o Instalador Windows (.exe)
```bash
npm run dist:win
```
O instalador será gerado na pasta:
```text
dist-electron/Sistema Food - Bar & Restaurante Setup 2.5.0.exe
```

### 3. Gerar a Versão Portátil (Sem Instalação)
```bash
npm run dist:portable
```

### 4. Executar em Modo Desktop durante o Desenvolvimento
Para testar a janela desktop sem gerar o instalador final:
```bash
# Terminal 1: Inicia o servidor Vite
npm run dev

# Terminal 2: Abre a janela do Electron
npm run electron:dev
```

---

## 🌟 Recursos Exclusivos da Versão Desktop

- **Servidor local embutido**: ao abrir, o aplicativo inicia automaticamente o servidor da API e do estado compartilhado, e carrega a interface por `http://127.0.0.1` em uma porta livre escolhida pelo sistema.
- **Login real e dados compartilhados**: autenticação, mesas, comandas, estoque e caixa passam a ficar no banco SQLite do servidor, não mais isolados no navegador.
- **Tablets e celulares na rede local**: o servidor escuta em `0.0.0.0`. Use o menu **Ajuda → Endereço para tablets e celulares** para ver o endereço e abrir no dispositivo.
- **Modo Tela Cheia (Kiosk)**: pressione **F11** para preencher 100% da tela do monitor, transformando qualquer computador antigo em um terminal profissional de PDV ou monitor KDS de cozinha.
- **Operação 100% Offline**: roda localmente sem conexão com a internet externa. Os pedidos, pagamentos e comandas comunicam-se pela rede local Wi-Fi com os tablets dos garçons e celulares dos clientes.
- **Prevenção de Fechamento Acidental**: teclas de atalho seguras e janela otimizada para toque (Touchscreen).
- **Sem Barra de Endereços do Navegador**: o operador de caixa ou garçom não consegue navegar em outros sites ou fechar abas por engano.

## 🔑 Primeiro acesso e dados do servidor desktop

- Na primeira execução, o aplicativo cria um usuário administrador e mostra **e-mail e senha em uma janela**. Guarde essas credenciais: a senha não é exibida novamente.
- As credenciais são usadas em **Nuvem / Acesso Remoto**, no menu superior da interface.
- O banco fica em `%APPDATA%\sistema-food-bar-restaurante\dados\sistema-food.sqlite`. Faça backup desse arquivo.
- O servidor usa uma porta livre aleatória a cada execução. Se o Windows Firewall perguntar, autorize o acesso em **Redes privadas** para os tablets conseguirem conectar.
- Se o servidor não conseguir iniciar, o aplicativo abre em **modo local** e avisa na tela; nesse caso os dados ficam apenas naquele computador.
