import type { PaymentChannelStatus, PixKeyType, PixSettings } from '../types';

/**
 * Geração do "PIX Copia e Cola" no padrão EMV® QRCPS MPM definido pelo Banco Central.
 * O resultado é um BR Code estático, aceito por qualquer aplicativo de banco.
 */

const GUI = 'br.gov.bcb.pix';
const CURRENCY_BRL = '986';
const COUNTRY = 'BR';
const MAX_NAME = 25;
const MAX_CITY = 15;
const MAX_KEY = 77;
const MAX_TXID = 25;

/** CRC16/CCITT-FALSE: polinômio 0x1021, inicial 0xFFFF, sem reflexão. */
export function crc16(payload: string): string {
  let crc = 0xffff;

  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** Monta um campo no formato ID + tamanho (2 dígitos) + valor. */
function field(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, '0')}${value}`;
}

/** Remove acentos e caracteres que o padrão não aceita. */
export function sanitizeText(value: string): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 .,'-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

export function onlyDigits(value: string): string {
  return String(value ?? '').replace(/\D/g, '');
}

/** Ajusta a chave ao formato esperado pelo Banco Central para cada tipo. */
export function normalizePixKey(keyType: PixKeyType, key: string): string {
  const raw = String(key ?? '').trim();

  switch (keyType) {
    case 'cpf':
    case 'cnpj':
      return onlyDigits(raw);
    case 'telefone': {
      const digits = onlyDigits(raw);
      if (!digits) return '';
      return digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
    }
    case 'email':
      return raw.toLowerCase();
    default:
      return raw;
  }
}

/** Valida a chave de acordo com o tipo, devolvendo a mensagem de erro ou null. */
export function validatePixKey(keyType: PixKeyType, key: string): string | null {
  const normalized = normalizePixKey(keyType, key);
  if (!normalized) return 'Informe a chave PIX.';

  switch (keyType) {
    case 'cpf':
      if (normalized.length !== 11) return 'CPF deve ter 11 dígitos.';
      return null;
    case 'cnpj':
      if (normalized.length !== 14) return 'CNPJ deve ter 14 dígitos.';
      return null;
    case 'telefone': {
      const digits = onlyDigits(normalized);
      // 55 + DDD (2) + número (8 ou 9)
      if (digits.length < 12 || digits.length > 13) return 'Telefone deve ter DDD + número (10 ou 11 dígitos).';
      return null;
    }
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized)) return 'E-mail inválido.';
      return null;
    default:
      // Chave aleatória (EVP): UUID com 36 caracteres, ou 32 caracteres alfanuméricos.
      if (normalized.length !== 36 && normalized.length !== 32) {
        return 'Chave aleatória deve ter 36 caracteres (formato UUID) ou 32 caracteres.';
      }
      return null;
  }
}

export function validatePixSettings(pix: PixSettings): string | null {
  if (!pix.enabled) return null;

  const keyError = validatePixKey(pix.keyType, pix.key);
  if (keyError) return keyError;

  const name = sanitizeText(pix.merchantName);
  if (name.length < 2) return 'Informe o nome do recebedor.';
  if (name.length > MAX_NAME) return `Nome do recebedor deve ter no máximo ${MAX_NAME} caracteres.`;

  const city = sanitizeText(pix.merchantCity);
  if (city.length < 2) return 'Informe a cidade do recebedor.';
  if (city.length > MAX_CITY) return `Cidade deve ter no máximo ${MAX_CITY} caracteres.`;

  if (!Number.isFinite(pix.surchargePercent) || pix.surchargePercent < 0 || pix.surchargePercent > 100) {
    return 'Acréscimo do PIX deve ficar entre 0 e 100.';
  }

  return null;
}

export function pixStatus(pix: PixSettings): PaymentChannelStatus {
  if (!pix.enabled) return 'nao_configurado';
  return validatePixSettings(pix) ? 'incompleto' : 'pronto';
}

/**
 * Monta o BR Code estático.
 * Devolve null quando a configuração está incompleta ou o valor é inválido.
 */
export function buildPixPayload(
  pix: PixSettings,
  options: { amount?: number; txid?: string } = {}
): string | null {
  // Sem o PIX habilitado não existe cobrança a gerar.
  if (!pix.enabled) return null;
  if (validatePixSettings(pix)) return null;

  const key = normalizePixKey(pix.keyType, pix.key).slice(0, MAX_KEY);
  const name = sanitizeText(pix.merchantName).slice(0, MAX_NAME);
  const city = sanitizeText(pix.merchantCity).slice(0, MAX_CITY);

  // O txid aceita apenas letras e números; "*" é usado quando não há identificador.
  const rawTxid = String(options.txid ?? '').replace(/[^A-Za-z0-9]/g, '').slice(0, MAX_TXID);
  const txid = rawTxid || '***';

  const merchantAccount = field('00', GUI) + field('01', key);

  let payload = '';
  payload += field('00', '01');
  payload += field('26', merchantAccount);
  payload += field('52', '0000');
  payload += field('53', CURRENCY_BRL);

  const amount = Number(options.amount);
  if (Number.isFinite(amount) && amount > 0) {
    payload += field('54', amount.toFixed(2));
  }

  payload += field('58', COUNTRY);
  payload += field('59', name);
  payload += field('60', city);
  payload += field('62', field('05', txid));
  payload += '6304';

  return payload + crc16(payload);
}

/** Estimativa do acréscimo aplicado sobre um valor, para exibir ao operador. */
export function surchargeFor(percent: number, amount: number): number {
  if (!Number.isFinite(percent) || percent <= 0) return 0;
  return Number(((amount * percent) / 100).toFixed(2));
}
