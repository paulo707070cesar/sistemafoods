const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const isElectronRuntime = Boolean(app) && typeof app.whenReady === 'function';
const isDev = isElectronRuntime ? (process.env.NODE_ENV === 'development' || !app.isPackaged) : true;

let mainWindow = null;
let serverModule = null;
let httpServer = null;
let appOrigin = null;

/** Escreve uma linha de registro na pasta de dados do usuário. */
function logToFile(fileName, message) {
  try {
    const dir = app.getPath('userData');
    fs.appendFileSync(path.join(dir, fileName), `[${new Date().toISOString()}] ${message}\n`, 'utf8');
  } catch {
    // Sem acesso ao disco: ignora o registro.
  }
}

/** Registra falhas de inicialização em arquivo, facilitando o suporte. */
function logFailure(scope, error) {
  const message = `${scope}: ${error?.stack || error?.message || error}`;
  logToFile('erros.log', message);
  console.error(message);
}

/**
 * Verifica se já existe usuário cadastrado no banco local.
 * Se não for possível verificar, assume que existe para não sobrescrever dados.
 */
function databaseHasUsers(dbPath) {
  if (!fs.existsSync(dbPath)) return false;

  try {
    const { DatabaseSync } = require('node:sqlite');
    const database = new DatabaseSync(dbPath, { readOnly: true });
    try {
      const row = database.prepare('SELECT COUNT(*) AS total FROM users').get();
      return Number(row?.total || 0) > 0;
    } finally {
      database.close();
    }
  } catch {
    return true;
  }
}

/**
 * Inicia o servidor local embutido: API, estado compartilhado e arquivos da interface.
 * Se algo falhar, o aplicativo continua abrindo em modo local (sem servidor).
 */
async function startEmbeddedServer() {
  const dataDir = path.join(app.getPath('userData'), 'dados');
  fs.mkdirSync(dataDir, { recursive: true });

  const dbPath = path.join(dataDir, 'sistema-food.sqlite');
  const serverEntry = path.join(__dirname, '..', 'server.js');
  const distDir = path.join(__dirname, '..', 'dist');

  if (!fs.existsSync(serverEntry) || !fs.existsSync(path.join(distDir, 'index.html'))) {
    return { error: 'Arquivos do servidor não encontrados nesta instalação.' };
  }

  const precisaCriarAdmin = !databaseHasUsers(dbPath);

  // As credenciais só são usadas quando ainda não há usuário cadastrado;
  // caso contrário, o próprio servidor ignora os valores.
  const senha = crypto.randomBytes(9).toString('base64url');
  const credenciais = { email: 'dono@sistemafood.local', senha };
  process.env.ADMIN_EMAIL = credenciais.email;
  process.env.ADMIN_PASSWORD = senha;

  process.env.NODE_ENV = 'production';
  process.env.DB_PATH = dbPath;
  process.env.DIST_PATH = distDir;
  process.env.SESSION_COOKIE_SECURE = 'false';
  process.env.TRUST_PROXY = 'false';

  const loaded = await import(pathToFileURL(serverEntry).href);
  const started = await loaded.startServer(0, '0.0.0.0');

  serverModule = loaded;
  httpServer = started.server;
  appOrigin = `http://127.0.0.1:${started.port}`;

  logToFile('inicializacao.log', `Servidor ativo em ${appOrigin} | banco: ${dbPath}`);

  return {
    url: appOrigin,
    port: started.port,
    credenciais: precisaCriarAdmin ? credenciais : null
  };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#070a12',
    title: 'Sistema Food — Bar & Restaurante',
    icon: path.join(__dirname, '../public/icon.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    },
    autoHideMenuBar: false,
    show: false
  });

  const template = [
    {
      label: 'Sistema',
      submenu: [
        {
          label: 'Alternar Tela Cheia (Modo KDS / PDV)',
          accelerator: 'F11',
          click: () => {
            const isFullScreen = mainWindow.isFullScreen();
            mainWindow.setFullScreen(!isFullScreen);
          }
        },
        {
          label: 'Recarregar Tela',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.webContents.reload()
        },
        { type: 'separator' },
        {
          label: 'Sair do Sistema',
          accelerator: 'Alt+F4',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Visualização',
      submenu: [
        { role: 'resetZoom', label: 'Zoom Padrão (100%)' },
        { role: 'zoomIn', label: 'Aumentar Zoom' },
        { role: 'zoomOut', label: 'Diminuir Zoom' },
        ...(isDev ? [
          { type: 'separator' },
          { role: 'toggledevtools', label: 'Ferramentas de Desenvolvedor (F12)' }
        ] : [])
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Endereço para tablets e celulares',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acesso pela rede local',
              message: 'Endereço deste servidor na rede',
              detail: appOrigin
                ? `${appOrigin}\n\nNo tablet, abra este endereço no navegador.\nSe não abrir, libere a porta no firewall do Windows.`
                : 'O servidor local não está ativo nesta execução. Reinicie o aplicativo.',
              buttons: ['OK']
            });
          }
        },
        {
          label: 'Sobre o Sistema Food',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Sistema Food — Bar & Restaurante',
              message: 'Sistema Food Pro — Versão Desktop Nativa',
              detail: 'Versão 2.5.0\nArquitetura Híbrida: Servidor Local (Wi-Fi 5G) e Sincronização em Nuvem.\nDesenvolvido para Bares, Restaurantes, Hamburguerias e Pizzarias.',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  // Preferência: servir por HTTP para habilitar login, dados compartilhados e tablets.
  if (appOrigin) {
    mainWindow.loadURL(appOrigin);
  } else if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Impede navegação para fora da aplicação.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const isLocalFile = url.startsWith('file://');
    const isAppOrigin = appOrigin && url.startsWith(appOrigin);
    const isDevServer = Boolean(isDev && process.env.VITE_DEV_SERVER_URL && url.startsWith(process.env.VITE_DEV_SERVER_URL));
    if (isLocalFile || isAppOrigin || isDevServer) return;

    event.preventDefault();
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Sem servidor local: avisa o operador de forma explícita.
  mainWindow.webContents.on('did-finish-load', () => {
    if (!appOrigin) {
      dialog.showMessageBox(mainWindow, {
        type: 'warning',
        title: 'Servidor local indisponível',
        message: 'O sistema abriu em modo local.',
        detail: 'Os dados ficarão apenas neste computador e o acesso remoto não funcionará.\nFeche e abra o aplicativo novamente.',
        buttons: ['OK']
      });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function stopEmbeddedServer() {
  try {
    httpServer?.close();
  } catch {
    // Servidor já encerrado.
  }
  try {
    serverModule?.closeDatabase();
  } catch {
    // Banco já encerrado.
  }
  httpServer = null;
  serverModule = null;
}

if (!isElectronRuntime) {
  console.log('Sistema Food: executando fora do Electron. Use "npm start" para o servidor web.');
} else {
  process.on('uncaughtException', error => logFailure('uncaughtException', error));
  process.on('unhandledRejection', reason => logFailure('unhandledRejection', reason));

  app.whenReady().then(async () => {
    let credenciais = null;

    try {
      const result = await startEmbeddedServer();
      credenciais = result?.credenciais ?? null;
      if (result?.error) {
        logFailure('servidor embutido', result.error);
      }
    } catch (error) {
      logFailure('falha ao iniciar o servidor embutido', error);
    }

    createWindow();

    if (credenciais) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Primeiro acesso criado',
        message: 'Guarde estas credenciais de administrador',
        detail: `E-mail: ${credenciais.email}\nSenha:  ${credenciais.senha}\n\nUse em "Nuvem / Acesso Remoto" no menu superior.\nA senha não será exibida novamente.`,
        buttons: ['Entendi']
      });
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  }).catch(error => logFailure('app.whenReady', error));

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    stopEmbeddedServer();
  });
}
