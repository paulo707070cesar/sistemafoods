# Sistema Food — Gestão de Bar e Restaurante

Aplicação React/Vite para PDV, mesas, comandas, caixa, estoque, KDS e cardápio digital, com servidor Node/Express e banco SQLite local.

> **Status:** interface funcional e backend inicial com autenticação real já implementados. Pagamentos, sincronização multiusuário e emissão fiscal ainda precisam de integração antes do uso comercial.

## Requisitos

- Node.js 22.5 ou superior (usa o módulo nativo `node:sqlite`)
- npm

## Desenvolvimento

O Vite serve a interface e encaminha `/api` para o backend Node. Rode os dois processos:

```bash
# Terminal 1 — API (porta 3001)
# Crie o .env com PORT=3001 para não conflitar com o Vite
node server.js

# Terminal 2 — interface (porta 3000)
npm run dev
```

Acesse `http://127.0.0.1:3000`. O alvo do proxy pode ser alterado com `API_PROXY_TARGET`.

Use `npm run dev:lan` somente quando precisar expor o servidor de desenvolvimento na rede local.

## Verificações

```bash
npm run lint
npm run build
```

## API de autenticação

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/health` e `/api/health` | Estado do serviço, do banco e da configuração de login |
| POST | `/api/auth/login` | Autentica e define cookie de sessão `HttpOnly` |
| GET | `/api/auth/me` | Retorna o usuário da sessão atual (exige login) |
| POST | `/api/auth/logout` | Encerra a sessão (exige login) |

Detalhes de segurança já aplicados:

- Senhas armazenadas com `scrypt` e salt individual; nunca em texto puro.
- Sessões guardadas apenas como hash SHA-256 do token, com expiração de 8 horas.
- Cookie `HttpOnly` e `SameSite=Lax`; `Secure` conforme HTTPS ou `SESSION_COOKIE_SECURE`.
- Limite de 5 tentativas de login por IP a cada 15 minutos.
- Registro de auditoria de login e logout.
- Comparação de senha em tempo constante (`timingSafeEqual`).

### Configuração inicial

1. Copie `.env.example` para `.env`.
2. Defina `ADMIN_EMAIL` e `ADMIN_PASSWORD` (mínimo de 12 caracteres). O usuário é criado apenas na primeira execução, quando a tabela de usuários está vazia.
3. Ajuste `PORT`, `HOST`, `DB_PATH`, `TRUST_PROXY` e `SESSION_COOKIE_SECURE`.

Nunca versione o arquivo `.env`. O banco em `data/` também está ignorado pelo Git.

### Teste de fumaça

Com o servidor em execução:

```bash
BASE_URL=http://127.0.0.1:3001 SMOKE_EMAIL=admin@exemplo.com SMOKE_PASSWORD=... npm run test:api
BASE_URL=http://127.0.0.1:3001 SMOKE_EMAIL=admin@exemplo.com SMOKE_PASSWORD=... npm run test:state
BASE_URL=http://127.0.0.1:3001 SMOKE_EMAIL=admin@exemplo.com SMOKE_PASSWORD=... npm run test:sync
```

Cada suíte cobre, respectivamente, autenticação, regras de negócio e sincronização entre terminais.

No Windows, defina as variáveis com `$env:BASE_URL='...'` antes de executar, ou use o `.env`.

## Estado de negócio compartilhado

Mesas, comandas, produtos, estoque, transações e pedidos digitais vivem no SQLite do servidor, não mais no `localStorage`.

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/state` | Estado completo com revisão e resumo calculado |
| POST | `/api/state/actions` | Aplica uma ou mais ações de negócio |
| GET | `/api/state/events` | Canal SSE com avisos de alteração em tempo real |

Arquitetura:

- As regras ficam em [shared/businessLogic.js](shared/businessLogic.js), um módulo puro usado pelo servidor; o mesmo arquivo está pronto para ser consumido pelo cliente.
- O servidor é a autoridade: recalcula subtotal, taxa de serviço e total, valida estoque e recusa operações inválidas com HTTP 409.
- O `localStorage` continua servindo apenas como cache local e como modo de operação quando não há servidor (Electron via `file://`).
- A interface aplica a alteração localmente para resposta imediata e adota em seguida o estado devolvido pelo servidor, corrigindo divergências.
- Cada ação aceita avança a revisão do estado e é transmitida aos demais terminais via SSE.
- Ações que afetam dinheiro ou inventário são registradas em `audit_logs`.

Ações disponíveis: `addItem`, `removeItem`, `updateItemQty`, `setItemObservation`, `clearOrder`, `toggleServiceTax`, `setDiscount`, `updateTableStatus`, `transferTable`, `openComanda`, `addStock`, `removeStock`, `addProduct`, `updateProductPrice`, `submitDigitalOrder`, `acceptDigitalOrder`, `rejectDigitalOrder`, `updateDigitalOrderStatus`, `sendOrderToKitchen`, `processPayment`.

## Servidor de produção

```bash
npm run build
npm start
```

Guia completo de publicação: **[DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md)**.

O servidor Express entrega `dist/` com cache imutável para assets, `no-store` para o HTML, cabeçalhos de segurança, CSP e HSTS quando servido por HTTPS.

- Para uso somente local, mantenha `HOST=127.0.0.1`.
- Para acesso pela rede local, use `HOST=0.0.0.0` e restrinja o firewall.
- Atrás de proxy reverso, defina `TRUST_PROXY=true` e `SESSION_COOKIE_SECURE=true`.

## Desktop Electron

```bash
npm run electron:dev
npm run dist:win
```

O aplicativo desktop inicia um **servidor local embutido** ao abrir:

- Serve a interface em `http://127.0.0.1` em uma porta livre escolhida pelo sistema.
- Usa banco próprio em `%APPDATA%\sistema-food-bar-restaurante\dados\sistema-food.sqlite`.
- Escuta em `0.0.0.0`, permitindo que tablets da rede acessem pelo endereço mostrado no menu **Ajuda → Endereço para tablets e celulares**.
- Na primeira execução gera e exibe as credenciais do administrador. A senha não é mostrada novamente.
- Registra a inicialização em `inicializacao.log` e falhas em `erros.log`, ambos em `%APPDATA%\sistema-food-bar-restaurante`.
- Se o servidor não subir, abre em modo local e avisa na tela, sem travar o aplicativo.

Para inspecionar o processo principal em caso de problema:

```bash
npm run electron:dev
```

O instalador deve ser testado em uma máquina limpa antes da distribuição. Assine o executável e configure atualização automática antes de entregar aos clientes.

## Limitações atuais para produção

- As regras existem em dois lugares: no módulo compartilhado (servidor) e no código do contexto (caminho local). O próximo passo é fazer o cliente consumir `shared/businessLogic.js` diretamente e eliminar a duplicação.
- O estado é gravado como um documento JSON em `app_state`. Funciona bem para uma loja, mas precisa ser normalizado em tabelas relacionais para múltiplas lojas ou volume alto.
- Sem servidor acessível, o terminal opera isolado (modo local) e as alterações não são compartilhadas.
- Não há fila offline com idempotência: se o servidor cair no meio de uma operação, a alteração local não é reenviada automaticamente.
- A resolução de conflitos é "última revisão do servidor vence"; conflitos simultâneos de edição não são detectados.
- PIX, cartão e TEF continuam demonstrativos: não processam dinheiro real.
- Limite de tentativas de login é em memória e não é compartilhado entre múltiplas instâncias.
- Faltam emissão fiscal (NFC-e/SAT), backups automatizados, monitoramento e testes automatizados de interface.

Esses pontos devem ser tratados antes de processar pagamentos reais ou dados de clientes.
