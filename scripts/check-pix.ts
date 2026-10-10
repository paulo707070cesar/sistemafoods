// Valida o gerador de PIX Copia e Cola.
// Uso: npx tsx scripts/check-pix.ts
import {
  buildPixPayload,
  crc16,
  normalizePixKey,
  pixStatus,
  validatePixKey
} from '../src/utils/pix.ts';
import type { PixSettings } from '../src/types';

const resultados: { nome: string; ok: boolean; detalhe?: string }[] = [];

function check(nome: string, condicao: boolean, detalhe = '') {
  resultados.push({ nome, ok: Boolean(condicao), detalhe });
  console.log(`${condicao ? 'PASS' : 'FAIL'}  ${nome}${detalhe ? ` — ${detalhe}` : ''}`);
}

/** Lê os campos TLV e confere se os tamanhos declarados batem. */
function parseTlv(payload: string): { id: string; value: string }[] {
  const campos: { id: string; value: string }[] = [];
  let index = 0;

  while (index < payload.length) {
    const id = payload.slice(index, index + 2);
    const tamanho = Number(payload.slice(index + 2, index + 4));
    if (!/^\d{2}$/.test(id) || Number.isNaN(tamanho)) {
      throw new Error(`TLV inválido na posição ${index}: "${payload.slice(index, index + 4)}"`);
    }
    const value = payload.slice(index + 4, index + 4 + tamanho);
    if (value.length !== tamanho) {
      throw new Error(`Campo ${id} declara ${tamanho} mas tem ${value.length}`);
    }
    campos.push({ id, value });
    index += 4 + tamanho;
  }

  return campos;
}

// 1. Vetor de teste conhecido do CRC16/CCITT-FALSE.
check('crc16("123456789") = 29B1', crc16('123456789') === '29B1', crc16('123456789'));

// 2. Normalização de chaves.
check('CPF recebe só dígitos', normalizePixKey('cpf', '123.456.789-01') === '12345678901');
check('CNPJ recebe só dígitos', normalizePixKey('cnpj', '12.345.678/0001-90') === '12345678000190');
check('telefone ganha +55', normalizePixKey('telefone', '(11) 98888-7777') === '+5511988887777');
check('telefone não duplica 55', normalizePixKey('telefone', '+55 11 98888-7777') === '+5511988887777');
check('e-mail em minúsculas', normalizePixKey('email', 'Dono@SistemaFood.com.BR') === 'dono@sistemafood.com.br');

// 3. Validações rejeitam entradas erradas.
check('CPF curto é recusado', validatePixKey('cpf', '123') !== null);
check('CNPJ curto é recusado', validatePixKey('cnpj', '123') !== null);
check('e-mail inválido é recusado', validatePixKey('email', 'sem-arroba') !== null);
check('aleatória curta é recusada', validatePixKey('aleatoria', 'abc') !== null);
check('chave válida é aceita', validatePixKey('email', 'dono@sistemafood.com.br') === null);

const pixBase: PixSettings = {
  enabled: true,
  keyType: 'email',
  key: 'dono@sistemafood.com.br',
  merchantName: 'Sistema Food Bar',
  merchantCity: 'São Paulo',
  surchargePercent: 0
};

// 4. Status reflete a configuração.
check('PIX desligado fica não configurado', pixStatus({ ...pixBase, enabled: false }) === 'nao_configurado');
check('PIX completo fica pronto', pixStatus(pixBase) === 'pronto');
check('PIX sem chave fica incompleto', pixStatus({ ...pixBase, key: '' }) === 'incompleto');

// 5. Estrutura do payload com valor.
const payload = buildPixPayload(pixBase, { amount: 123.45, txid: 'PEDIDO-42' });
check('payload é gerado', typeof payload === 'string' && payload.length > 0);

if (payload) {
  const campos = parseTlv(payload);
  const mapa = new Map(campos.map(campo => [campo.id, campo.value]));

  check('indicador de formato = 01', mapa.get('00') === '01');
  check('moeda = 986 (BRL)', mapa.get('53') === '986');
  check('país = BR', mapa.get('58') === 'BR');
  check('valor formatado com 2 casas', mapa.get('54') === '123.45', mapa.get('54') ?? '');
  check('nome sem acento e em maiúsculas', mapa.get('59') === 'SISTEMA FOOD BAR', mapa.get('59') ?? '');
  check('cidade sem acento e limitada a 15', mapa.get('60') === 'SAO PAULO', mapa.get('60') ?? '');

  const conta = parseTlv(mapa.get('26') ?? '');
  const contaMapa = new Map(conta.map(campo => [campo.id, campo.value]));
  check('GUI do PIX correto', contaMapa.get('00') === 'br.gov.bcb.pix', contaMapa.get('00') ?? '');
  check('chave embutida sem caracteres inválidos', contaMapa.get('01') === 'dono@sistemafood.com.br');

  const adicionais = parseTlv(mapa.get('62') ?? '');
  check('txid sem hífen', adicionais.find(c => c.id === '05')?.value === 'PEDIDO42');

  // 6. O CRC final confere com o recálculo do próprio conteúdo.
  const corpo = payload.slice(0, -4);
  const crcDeclarado = payload.slice(-4);
  check('CRC do rodapé confere', crc16(corpo) === crcDeclarado, `declarado=${crcDeclarado} calculado=${crc16(corpo)}`);
  check('CRC tem 4 dígitos hexadecimais', /^[0-9A-F]{4}$/.test(crcDeclarado));

  // 7. Um dígito alterado invalida o CRC (prova que o CRC cobre o conteúdo).
  const alterado = `${corpo.slice(0, 10)}${corpo[10] === '9' ? '8' : '9'}${corpo.slice(11)}`;
  check('alteração no conteúdo quebra o CRC', crc16(alterado) !== crcDeclarado);
}

// 8. Sem valor informado, o campo 54 não deve existir.
const semValor = buildPixPayload(pixBase, {});
if (semValor) {
  const mapa = new Map(parseTlv(semValor).map(campo => [campo.id, campo.value]));
  check('sem valor não inclui o campo 54', !mapa.has('54'));
  check('sem txid usa ***', parseTlv(mapa.get('62') ?? '').find(c => c.id === '05')?.value === '***');
}

// 9. Valor zerado ou negativo é ignorado.
const zero = buildPixPayload(pixBase, { amount: 0 });
check('valor zero não inclui o campo 54', Boolean(zero) && !new Map(parseTlv(zero!).map(c => [c.id, c.value])).has('54'));

// 10. Configuração incompleta não gera payload.
check('sem nome não gera payload', buildPixPayload({ ...pixBase, merchantName: '' }) === null);
check('desligado não gera payload', buildPixPayload({ ...pixBase, enabled: false }) === null);

const falhas = resultados.filter(r => !r.ok);
console.log(`\n${resultados.length - falhas.length}/${resultados.length} verificações aprovadas.`);
process.exit(falhas.length === 0 ? 0 : 1);
