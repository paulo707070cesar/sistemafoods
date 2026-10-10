import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Settings,
  QrCode,
  CreditCard,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Info,
  KeyRound,
  Percent,
  ExternalLink,
  Building2,
  Sparkles,
  LockKeyhole,
  CircleCheck
} from 'lucide-react';
import { useFoodSystem, DEFAULT_PAYMENT_SETTINGS } from '../context/FoodSystemContext';
import { PaymentSettings, PixKeyType } from '../types';
import { buildPixPayload, pixStatus, surchargeFor, validatePixSettings } from '../utils/pix';

const PIX_KEY_TYPES: { value: PixKeyType; label: string; exemplo: string }[] = [
  { value: 'cpf', label: 'CPF', exemplo: '123.456.789-01' },
  { value: 'cnpj', label: 'CNPJ', exemplo: '12.345.678/0001-90' },
  { value: 'email', label: 'E-mail', exemplo: 'financeiro@restaurante.com.br' },
  { value: 'telefone', label: 'Telefone', exemplo: '(11) 98888-7777' },
  { value: 'aleatoria', label: 'Chave aleatória', exemplo: '123e4567-e89b-12d3-a456-426614174000' }
];

/** Mostra apenas o começo e o fim de uma credencial secreta. */
function maskSecret(value: string): string {
  const texto = String(value ?? '');
  if (!texto) return 'não informado';
  if (texto.length <= 10) return '••••••';
  return `${texto.slice(0, 6)}••••••${texto.slice(-4)}`;
}

const campoBase =
  'w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all';

export const ConfigPagamentosScreen: React.FC = () => {
  const { paymentSettings, updatePaymentSettings, addToast, playFeedbackSound } = useFoodSystem();

  const [draft, setDraft] = useState<PaymentSettings>(paymentSettings);
  const [mostrarToken, setMostrarToken] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [qrAberto, setQrAberto] = useState(false);
  const [qrImagem, setQrImagem] = useState<string | null>(null);

  // Reflete alterações feitas fora desta tela.
  useEffect(() => {
    setDraft(paymentSettings);
  }, [paymentSettings]);

  const alterado = JSON.stringify(draft) !== JSON.stringify(paymentSettings);
  const pixErro = validatePixSettings(draft.pix);
  const statusPix = pixStatus(draft.pix);
  const pixPreview = buildPixPayload(draft.pix, { amount: 1 });
  const mpPronto = draft.mercadoPago.enabled && Boolean(draft.mercadoPago.accessToken.trim());

  const setPix = (patch: Partial<PaymentSettings['pix']>) =>
    setDraft(prev => ({ ...prev, pix: { ...prev.pix, ...patch } }));

  const setMp = (patch: Partial<PaymentSettings['mercadoPago']>) =>
    setDraft(prev => ({ ...prev, mercadoPago: { ...prev.mercadoPago, ...patch } }));

  const handleSalvar = () => {
    if (draft.pix.enabled && pixErro) {
      playFeedbackSound('alert');
      addToast('error', 'PIX incompleto', pixErro);
      return;
    }
    if (draft.mercadoPago.enabled && !draft.mercadoPago.accessToken.trim()) {
      playFeedbackSound('alert');
      addToast('error', 'Mercado Pago incompleto', 'Informe o Access Token para habilitar o cartão.');
      return;
    }
    updatePaymentSettings(draft);
  };

  const handleRestaurar = () => {
    playFeedbackSound('alert');
    setDraft(DEFAULT_PAYMENT_SETTINGS);
    addToast('info', 'Padrões Restaurados', 'Revise os dados e clique em Salvar para aplicar.');
  };

  const abrirQrOffline = async () => {
    if (!pixPreview) return;
    try {
      const imagem = await QRCode.toDataURL(pixPreview, { errorCorrectionLevel: 'M', margin: 2, width: 420, color: { dark: '#0f172a', light: '#ffffff' } });
      setQrImagem(imagem);
      setQrAberto(true);
    } catch {
      addToast('error', 'QR Code indisponível', 'Não foi possível gerar o QR Code localmente.');
    }
  };

  const copiar = async (texto: string, titulo: string) => {
    try {
      await navigator.clipboard?.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
      addToast('success', titulo, 'Código copiado para a área de transferência.');
    } catch {
      addToast('warning', 'Não foi possível copiar', 'Copie manualmente o código exibido.');
    }
  };

  const badge = (status: 'nao_configurado' | 'incompleto' | 'pronto', ligado: boolean) => {
    if (!ligado) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-wider">
          Desligado
        </span>
      );
    }
    if (status === 'pronto') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Pronto
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" /> Incompleto
      </span>
    );
  };

  const tipoSelecionado = PIX_KEY_TYPES.find(t => t.value === draft.pix.keyType);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.10),_transparent_34%),#0b101c] overflow-y-auto select-none">
      {/* Cabeçalho */}
      <div className="bg-[#121929]/95 backdrop-blur border-b border-slate-800/80 px-4 md:px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-base md:text-lg text-white tracking-tight">
              Configurações de Recebimento
            </h1>
            <span className="text-xs text-slate-400">
              Chave PIX e Mercado Pago para receber por cartão
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {draft.updatedAt && !alterado && (
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Salvo em {new Date(draft.updatedAt).toLocaleString('pt-BR')}
            </span>
          )}
          {alterado && (
            <span className="text-[11px] text-amber-400 font-bold hidden sm:inline">
              Alterações não salvas
            </span>
          )}
          <button
            onClick={handleRestaurar}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restaurar padrão</span>
          </button>
          <button
            onClick={handleSalvar}
            disabled={!alterado}
            className="py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/25 pos-btn-press disabled:opacity-40 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Salvar</span>
          </button>
        </div>
      </div>

      <div className="p-3 md:p-6 space-y-5 max-w-[1500px] w-full mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* ---------------- PIX ---------------- */}
          <div className="bg-[#121929]/95 border border-slate-800/90 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col hover:border-slate-700 transition-colors">
            <div className="px-4 md:px-5 py-4 border-b border-slate-800/80 bg-gradient-to-r from-white/[0.025] to-transparent flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-white">PIX</span>
                {badge(statusPix, draft.pix.enabled)}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.pix.enabled}
                  onChange={e => setPix({ enabled: e.target.checked })}
                  className="w-4 h-4 accent-orange-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-300">Habilitar</span>
              </label>
            </div>

            <div className={`p-4 space-y-3.5 flex-1 ${draft.pix.enabled ? '' : 'opacity-60'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Tipo da chave</label>
                  <select
                    value={draft.pix.keyType}
                    onChange={e => setPix({ keyType: e.target.value as PixKeyType })}
                    className={campoBase}
                  >
                    {PIX_KEY_TYPES.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-slate-400" /> Chave PIX
                  </label>
                  <input
                    type="text"
                    value={draft.pix.key}
                    onChange={e => setPix({ key: e.target.value })}
                    placeholder={tipoSelecionado?.exemplo}
                    className={campoBase}
                  />
                </div>
              </div>

              {draft.pix.enabled && pixErro && (
                <div className="flex items-start gap-2 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{pixErro}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" /> Nome do recebedor
                  </label>
                  <input
                    type="text"
                    value={draft.pix.merchantName}
                    onChange={e => setPix({ merchantName: e.target.value })}
                    maxLength={25}
                    placeholder="SISTEMA FOOD"
                    className={campoBase}
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Aparece no app do banco (máx. 25)</span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Cidade</label>
                  <input
                    type="text"
                    value={draft.pix.merchantCity}
                    onChange={e => setPix({ merchantCity: e.target.value })}
                    maxLength={15}
                    placeholder="SAO PAULO"
                    className={campoBase}
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Exibida no app do banco (máx. 15)</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                  <Percent className="w-3 h-3 text-slate-400" /> Acréscimo no PIX (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={draft.pix.surchargePercent}
                  onChange={e => setPix({ surchargePercent: Number(e.target.value) })}
                  className={`${campoBase} max-w-[140px]`}
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Deixe 0 para não cobrar acréscimo. Em R$ 100,00 o acréscimo seria de{' '}
                  R$ {surchargeFor(draft.pix.surchargePercent, 100).toFixed(2)}.
                </span>
              </div>

              {/* Prévia do código gerado */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-300">Prévia do PIX Copia e Cola</span>
                  {pixPreview && (
                    <button
                      onClick={() => copiar(pixPreview, 'PIX de teste copiado')}
                      className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                    >
                      {copiado ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copiar teste de R$ 1,00
                    </button>
                  )}
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[10px] font-mono text-slate-400 break-all max-h-24 overflow-y-auto">
                  {pixPreview ?? 'Configure a chave, o nome e a cidade para gerar o código.'}
                </div>
                <span className="text-[10px] text-slate-500 mt-1.5 block">
                  Cole no aplicativo do seu banco para conferir se o recebedor aparece correto.
                </span>
              </div>
            </div>
          </div>

          {/* ---------------- Mercado Pago ---------------- */}
          <div className="bg-[#121929]/95 border border-slate-800/90 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col hover:border-slate-700 transition-colors">
            <div className="px-4 md:px-5 py-4 border-b border-slate-800/80 bg-gradient-to-r from-white/[0.025] to-transparent flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-sm text-white">Mercado Pago</span>
                {badge(mpPronto ? 'pronto' : 'incompleto', draft.mercadoPago.enabled)}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.mercadoPago.enabled}
                  onChange={e => setMp({ enabled: e.target.checked })}
                  className="w-4 h-4 accent-orange-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-300">Habilitar</span>
              </label>
            </div>

            <div className={`p-4 space-y-3.5 flex-1 ${draft.mercadoPago.enabled ? '' : 'opacity-60'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Ambiente</label>
                  <select
                    value={draft.mercadoPago.environment}
                    onChange={e => setMp({ environment: e.target.value as 'sandbox' | 'producao' })}
                    className={campoBase}
                  >
                    <option value="sandbox">Testes (sandbox)</option>
                    <option value="producao">Produção</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Parcelas máximas</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={draft.mercadoPago.maxInstallments}
                    onChange={e => setMp({ maxInstallments: Number(e.target.value) })}
                    className={campoBase}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Public Key</label>
                <input
                  type="text"
                  value={draft.mercadoPago.publicKey}
                  onChange={e => setMp({ publicKey: e.target.value })}
                  placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className={`${campoBase} font-mono`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-slate-400" /> Access Token
                  <span className="text-[10px] text-amber-400 font-normal">(credencial secreta)</span>
                </label>
                <div className="relative">
                  <input
                    type={mostrarToken ? 'text' : 'password'}
                    value={draft.mercadoPago.accessToken}
                    onChange={e => setMp({ accessToken: e.target.value })}
                    placeholder="APP_USR-..."
                    autoComplete="off"
                    className={`${campoBase} font-mono pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarToken(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    title={mostrarToken ? 'Ocultar' : 'Mostrar'}
                  >
                    {mostrarToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                  Armazenado neste dispositivo como: {maskSecret(draft.mercadoPago.accessToken)}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                  <Percent className="w-3 h-3 text-slate-400" /> Acréscimo no cartão (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={draft.mercadoPago.surchargePercent}
                  onChange={e => setMp({ surchargePercent: Number(e.target.value) })}
                  className={`${campoBase} max-w-[140px]`}
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Use para repassar a taxa da maquininha ao cliente. Deixe 0 para absorver.
                </span>
              </div>

              <a
                href="https://www.mercadopago.com.br/developers/panel/app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-400 hover:text-sky-300"
              >
                <ExternalLink className="w-3 h-3" />
                Obter as credenciais no painel do Mercado Pago
              </a>
            </div>
          </div>
        </div>

        {qrAberto && pixPreview && qrImagem && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="QR Code PIX">
           <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-[#121929] p-5 shadow-2xl">
             <div className="flex items-center justify-between mb-4"><div><h2 className="text-base font-black text-white">QR Code PIX</h2><p className="text-xs text-slate-400">Prévia de cobrança de R$ 1,00</p></div><button type="button" onClick={() => setQrAberto(false)} className="text-slate-400 hover:text-white" aria-label="Fechar QR Code">×</button></div>
             <div className="rounded-2xl bg-white p-4"><img className="w-full aspect-square" alt="QR Code PIX de teste" src={qrImagem} /></div>
             <button type="button" onClick={() => copiar(pixPreview, 'PIX de teste copiado')} className="mt-4 w-full rounded-xl bg-orange-500 py-3 text-xs font-extrabold text-white hover:bg-orange-600"><Copy className="inline-block w-4 h-4 mr-1.5 -mt-0.5" /> Copiar código PIX</button>
           </div>
         </div>
       )}
       {/* Avisos */}
        <div className="bg-[#121929]/90 border border-slate-800/90 rounded-3xl p-4 md:p-5 space-y-4 shadow-xl shadow-black/10">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-bold text-white">Sobre a segurança das credenciais</p>
              <p className="text-slate-400">
                O Access Token é uma credencial secreta: quem tiver acesso a ele consegue gerar cobranças em nome do
                restaurante. Nesta versão ele fica guardado apenas neste dispositivo. Quando o servidor estiver em
                operação, a credencial deve ficar só no servidor e nunca ser enviada aos tablets.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 pt-3 border-t border-slate-800">
            <Info className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-bold text-white">O que já funciona e o que ainda falta</p>
              <p className="text-slate-400">
                A chave PIX gera um código Copia e Cola válido, pronto para receber. Para o cartão do Mercado Pago,
                esta tela guarda as credenciais, mas a cobrança precisa ser criada pelo servidor: a chamada à API do
                Mercado Pago ainda não está implementada e exige o backend em execução.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
