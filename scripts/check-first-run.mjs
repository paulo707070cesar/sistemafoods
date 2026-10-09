// Confere a detecção de "primeiro acesso" usada pelo aplicativo desktop.
// Cria os próprios arquivos de teste em data/ e remove ao final.
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const dataDir = path.join(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });

const comUsuarios = path.join(dataDir, 'check-users.sqlite');
const semTabela = path.join(dataDir, 'check-empty.sqlite');
const inexistente = path.join(dataDir, 'check-missing.sqlite');

for (const arquivo of [comUsuarios, semTabela, inexistente]) {
  for (const sufixo of ['', '-shm', '-wal']) {
    fs.rmSync(`${arquivo}${sufixo}`, { force: true });
  }
}

const dbComUsuarios = new DatabaseSync(comUsuarios);
dbComUsuarios.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT)');
dbComUsuarios.prepare('INSERT INTO users (email) VALUES (?)').run('teste@local');
dbComUsuarios.close();

// Banco existente porém sem a tabela de usuários: não deve ser sobrescrito.
const dbVazio = new DatabaseSync(semTabela);
dbVazio.exec('CREATE TABLE outro (id INTEGER PRIMARY KEY)');
dbVazio.close();

function databaseHasUsers(dbPath) {
  if (!fs.existsSync(dbPath)) return false;
  try {
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

const casos = [
  ['banco com usuário', comUsuarios, true],
  ['banco inexistente', inexistente, false],
  ['banco sem tabela de usuários', semTabela, true]
];

let falhas = 0;
for (const [nome, arquivo, esperado] of casos) {
  const obtido = databaseHasUsers(arquivo);
  const ok = obtido === esperado;
  if (!ok) falhas += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${nome} -> ${obtido} (esperado ${esperado})`);
}

for (const arquivo of [comUsuarios, semTabela]) {
  for (const sufixo of ['', '-shm', '-wal']) {
    fs.rmSync(`${arquivo}${sufixo}`, { force: true });
  }
}

console.log(falhas === 0 ? '\n3/3 verificações aprovadas.' : `\n${falhas} falha(s).`);
process.exit(falhas === 0 ? 0 : 1);
