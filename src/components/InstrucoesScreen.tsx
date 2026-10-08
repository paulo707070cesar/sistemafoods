import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  ReceiptText, 
  LayoutGrid, 
  CircleDollarSign, 
  Package, 
  ChefHat, 
  Calculator, 
  BarChart3, 
  Radio, 
  Layers, 
  Smartphone, 
  Cloud, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  Wifi, 
  WifiOff,
  ShieldCheck, 
  Users, 
  CreditCard, 
  Clock, 
  QrCode, 
  Printer, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Flame,
  FileText,
  BadgeAlert,
  Zap,
  Info,
  Server,
  ArrowLeft,
  Globe,
  Monitor,
  Download,
  Terminal,
  Copy,
  Check
} from 'lucide-react';
import { useFoodSystem } from '../context/FoodSystemContext';
import { ActiveScreen, AppInterfaceMode } from '../types';

type RoleFilter = 'todos' | 'garcom' | 'caixa' | 'cozinha' | 'estoque' | 'gerente' | 'dono' | 'cliente' | 'deploy';
type DetailTab = 'passos' | 'recursos' | 'faq' | 'offline';

interface GuideFAQ {
  q: string;
  a: string;
}

interface ScreenGuide {
  id: string;
  screenId?: ActiveScreen;
  modeId?: AppInterfaceMode;
  number: string;
  title: string;
  subtitle: string;
  role: string[];
  roleLabel: string;
  icon: React.ReactNode;
  summary: string;
  steps: string[];
  features: { label: string; desc: string }[];
  faq: GuideFAQ[];
  offlineTip: string;
  quickActionLabel: string;
}

export const InstrucoesScreen: React.FC = () => {
  const { 
    setActiveScreen, 
    setInterfaceMode, 
    openQRCodeModal, 
    playFeedbackSound, 
    addToast,
    localServerStatus,
    internetStatus
  } = useFoodSystem();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleFilter>('todos');
  const [activeGuideId, setActiveGuideId] = useState<string>('pdv');
  const [activeTab, setActiveTab] = useState<DetailTab>('passos');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [mobileViewDetail, setMobileViewDetail] = useState<boolean>(false);

  const guides: ScreenGuide[] = [
    {
      id: 'pdv',
      screenId: 'pdv',
      number: '1',
      title: 'PDV — Ponto de Venda & Pedidos',
      subtitle: 'Lançamento ágil de itens, upsell inteligente e envio para cozinha',
      role: ['garcom', 'caixa', 'gerente'],
      roleLabel: 'Garçom / Caixa / Gerência',
      icon: <ReceiptText className="w-5 h-5 text-orange-400" />,
      summary: 'Tela principal de atendimento presencial no salão e balcão. O garçom seleciona a mesa ou comanda, adiciona produtos com 1 toque, inclui observações personalizadas e finaliza os itens, que viajam via Wi-Fi diretamente para as telas do KDS na cozinha e bar.',
      steps: [
        'Selecione a Mesa ou Comanda no menu suspenso ou no topo da tela.',
        'Localize o item pelo campo de pesquisa rápida ou filtre pelas abas de categorias (Petiscos, Pratos Principais, Bebidas, Drinks, Pizzas, Sobremesas).',
        'Clique no produto para adicionar ao pedido ativo. Ao selecionar um Prato Principal, o Upsell Inteligente abrirá um pop-up sugerindo acompanhamentos ou bebidas combinadas.',
        'Para observações especiais (ex: "carne ao ponto", "sem gelo e limão", "alérgico a camarão"), clique no item na tabela e insira o recado para a cozinha.',
        'Ajuste se desejar a taxa de serviço (10%) ou conceda desconto com valor fixo.',
        'Clique em "Finalizar Pedido" para enviar os itens instantaneamente à cozinha via Wi-Fi local (latência < 2ms), ou "Fechar Conta" para gerar o resumo de conferência.'
      ],
      features: [
        { label: 'Upsell Inteligente', desc: 'Sugere automaticamente bebidas e guarnições ao lançar pratos principais, aumentando o ticket médio do garçom sem esforço.' },
        { label: 'Atalhos de 1 Toque', desc: 'Quatro botões com os pratos e drinks mais pedidos para lançamento ultra-rápido em horários de pico.' },
        { label: 'Controle de Taxa de Serviço', desc: 'Ativação ou desativação rápida dos 10% de serviço de acordo com a preferência do cliente.' },
        { label: 'Prévia de Conferência', desc: 'Emite o extrato prévio da comanda antes do cliente se levantar para ir ao caixa.' }
      ],
      faq: [
        {
          q: 'Como alterar a quantidade ou remover um item antes de enviar à cozinha?',
          a: 'Basta clicar nos botões "+ / -" ao lado da quantidade do produto na tabela do pedido à esquerda, ou clicar no ícone de lixeira vermelha para remover o item.'
        },
        {
          q: 'Se a internet cair, o garçom consegue continuar lançando pedidos no PDV?',
          a: 'Sim! O sistema opera em arquitetura Offline-First. Todos os pedidos são gravados no servidor local do restaurante (Food Node via Wi-Fi) e despachados normalmente ao KDS da cozinha.'
        },
        {
          q: 'O que acontece após clicar em "Finalizar Pedido"?',
          a: 'Uma animação de "voo Wi-Fi" confirma o envio dos itens, o KDS da cozinha apita emitindo aviso sonoro e a comanda da mesa é atualizada em tempo real.'
        }
      ],
      offlineTip: 'Totalmente operacional sem internet externa. Os dados trafegam exclusivamente pela rede Wi-Fi local Food_System_5G.',
      quickActionLabel: 'Abrir PDV Agora'
    },
    {
      id: 'mesas',
      screenId: 'mesas',
      number: '2',
      title: 'Mesas & Comandas (Mapa do Salão)',
      subtitle: 'Controle visual de ocupação, ambientes e alertas de pedidos digitais',
      role: ['garcom', 'gerente'],
      roleLabel: 'Garçom / Maitre / Gerente',
      icon: <LayoutGrid className="w-5 h-5 text-orange-400" />,
      summary: 'Visão gráfica panorâmica de todos os setores do restaurante (Salão Principal, Varanda, Deck Superior e Bar). Permite acompanhar o status de cada mesa, o tempo de permanência dos clientes, e emite alertas visuais e sonoros quando chegam pedidos feitos pelos celulares dos clientes via QR Code.',
      steps: [
        'Acompanhe o mapa de mesas por cores: Laranja (Ocupada), Cinza escuro (Livre) e Azul (Reservada).',
        'Filtre pelo ambiente desejado nas abas superiores (Salão Principal, Varanda, Deck Superior ou Bar).',
        'Atenção ao Alerta Digital: quando um cliente pedir pelo celular, um selo pulsante "NOVO PEDIDO" piscará sobre a mesa com toque sonoro de sino.',
        'Clique sobre o pedido pendente para abrir a Tela de Revisão: confira os itens e toque no botão grande "Aceitar e Enviar para Cozinha" ou "Recusar".',
        'No painel lateral de qualquer mesa ocupada, visualize os itens consumidos, o tempo aberta, o garçom responsável e o subtotal atual.',
        'Use os botões de ação: "Abrir no PDV" para adicionar mais itens, "Fechar Conta no Caixa", "Transferir Mesa" ou "Imprimir Placa QR".'
      ],
      features: [
        { label: 'Alerta de Pedido QR em Tempo Real', desc: 'Indicação luminosa imediata quando o cliente realiza um pedido pelo celular na mesa.' },
        { label: 'Tela de Revisão com 1 Toque', desc: 'Evita pedidos trocados permitindo que o garçom aprove ou recuse pedidos digitais em segundos.' },
        { label: 'Transferência de Mesa', desc: 'Se o cliente mudar de lugar, transfere toda a conta de uma mesa para outra sem duplicar itens.' },
        { label: 'Aba de Comandas Avulsas', desc: 'Gestão exclusiva de clientes em pé no balcão que consomem com cartões magnéticos/comandas.' }
      ],
      faq: [
        {
          q: 'Como atender ao chamado do cliente que clicou em "Chamar Garçom" no celular?',
          a: 'O sistema emite uma notificação sonoro-visual no tablet do salão informando o número exato da mesa (ex: "Mesa 04 chamou o garçom").'
        },
        {
          q: 'O que ocorre se o garçom recusar um pedido digital?',
          a: 'O sistema solicita um motivo (ex: item esgotado), notifica a tela do cliente imediatamente e não envia a solicitação para a cozinha.'
        },
        {
          q: 'Como gerar a placa com QR Code para colocar no display acrílico da mesa?',
          a: 'Selecione a mesa e clique no botão "Placa QR" no painel lateral ou no cabeçalho. O sistema gera a arte pronta com instruções para impressão.'
        }
      ],
      offlineTip: 'As atualizações do mapa de mesas sincronizam em milissegundos entre todos os tablets dos garçons via servidor local.',
      quickActionLabel: 'Ver Mapa de Mesas'
    },
    {
      id: 'caixa',
      screenId: 'caixa',
      number: '3',
      title: 'Caixa & Fechamento de Contas',
      subtitle: 'Liquidação rápida, divisão de conta, troco automático e PIX/Cartão',
      role: ['caixa', 'gerente'],
      roleLabel: 'Operador de Caixa / Gerente',
      icon: <CircleDollarSign className="w-5 h-5 text-emerald-400" />,
      summary: 'Módulo de finalização financeira e fechamento de comandas. Oferece divisão de valores por pessoa, calculadora de troco para dinheiro, integração com cartões de débito/crédito parcelados e confirmação de pagamentos PIX com baixa automática da mesa.',
      steps: [
        'Selecione a Mesa ou Comanda a ser paga na lista lateral esquerda.',
        'Conferência: revise a lista de consumos com o cliente na tela do caixa.',
        'Divisão de Conta: se a mesa for dividir, utilize os botões "+ / -" em "Dividir Conta (Pessoas)" para visualizar o valor individual por pagante.',
        'Escolha a forma de pagamento: Dinheiro, Cartão de Crédito, Cartão de Débito, PIX ou Vale Refeição.',
        'Em Dinheiro: clique nos botões rápidos de cédulas (R$ 50, R$ 100, R$ 200) ou digite o valor recebido para visualizar o troco calculado na hora.',
        'Em PIX: apresente o QR Code na tela para leitura do cliente ou use a chave copia-e-cola.',
        'Clique em "Confirmar Pagamento": a comanda é liquidada, a mesa fica livre no mapa e o comprovante fiscal/térmico é emitido.'
      ],
      features: [
        { label: 'Divisão por Pessoas com 1 Toque', desc: 'Divide centavos de forma justa para grupos e casais sem necessitar de calculadora externa.' },
        { label: 'Cálculo de Troco em Destaque', desc: 'Exibe o valor exato a devolver ao cliente em verde para evitar erros de caixa.' },
        { label: 'Reimpressão de Comprovante', desc: 'Permite reimprimir a qualquer momento os cupons de transações do turno.' },
        { label: 'Histórico Completo do Dia', desc: 'Lista todas as transações finalizadas com operador, horário e método de pagamento.' }
      ],
      faq: [
        {
          q: 'Como proceder se um cliente pagar parte em dinheiro e parte no cartão?',
          a: 'Você pode registrar o pagamento em etapas: abata o valor recebido em dinheiro e liquide o saldo remanescente no cartão.'
        },
        {
          q: 'Se o cliente pagar pelo PIX no próprio celular (autoatendimento), o que acontece no Caixa?',
          a: 'O sinal via Wi-Fi é recebido instantaneamente pelo terminal do caixa, gerando baixa automática da mesa e imprimindo o cupom.'
        },
        {
          q: 'É possível estornar um pagamento lançado errado?',
          a: 'Sim, na aba de histórico de transações, localize o comprovante e clique no botão de estorno assistido com justificativa.'
        }
      ],
      offlineTip: 'O caixa fecha contas localmente mesmo sem sinal de internet externo. Os recibos são emitidos na impressora térmica da rede.',
      quickActionLabel: 'Ir para o Caixa'
    },
    {
      id: 'estoque',
      screenId: 'estoque',
      number: '4',
      title: 'Controle de Estoque & Validade (PEPS)',
      subtitle: 'Inventário em tempo real, controle de validade e compras inteligentes',
      role: ['estoque', 'gerente'],
      roleLabel: 'Estoquista / Gerente / Compras',
      icon: <Package className="w-5 h-5 text-amber-400" />,
      summary: 'Central de controle físico dos insumos e bebidas do estabelecimento. Oferece alerta de estoque mínimo, registro de entradas (compras) e baixas (perdas/avarias), além do Controle de Validade PEPS (Primeiro que Entra, Primeiro que Sai) com contadores regressivos para evitar desperdício de insumos nobres.',
      steps: [
        'Consulte a tabela com Quantidade Atual, Quantidade Mínima e Status de Estoque de cada item.',
        'Use os filtros rápidos: "Todos", "Estoque Baixo" ou "Validade Próxima".',
        'Para dar Entrada (compras): clique no botão "Dar Entrada", selecione o item, informe a quantidade comprada e o fornecedor/NF.',
        'Para registrar Perdas ou Consumo: clique em "Dar Baixa" e indique o motivo (Vencimento, Avaria, Degustação).',
        'Controle de Validade: observe os selos vermelhos pulsantes como "Vence em 2d" ou "Vence em 4d".',
        'Cadastre novos itens clicando em "Cadastrar Produto" com preço de venda, custo e limite de estoque mínimo.'
      ],
      features: [
        { label: 'Alerta PEPS de Validade', desc: 'Notifica com antecedência de até 7 dias produtos perecíveis para incentivar seu preparo no cardápio do dia.' },
        { label: 'Baixa Automática por Venda', desc: 'Cada prato ou bebida faturada no PDV ou Celular deduz automaticamente a quantidade correspondente.' },
        { label: 'Histórico de Movimentações', desc: 'Auditoria de todas as entradas e saídas manuais com operador responsável, data e hora.' },
        { label: 'Filtro de Compra Imediata', desc: 'Isola em 1 clique os itens que estão zerados ou abaixo do estoque mínimo de segurança.' }
      ],
      faq: [
        {
          q: 'O que fazer quando o item atinge estoque zero durante o expediente?',
          a: 'O sistema bloqueia novas vendas daquele prato no PDV e exibe aviso de "Esgotado" no Cardápio Digital do cliente para evitar constrangimentos.'
        },
        {
          q: 'Como alterar a data de validade de um lote recebido?',
          a: 'Ao dar entrada no estoque, você pode preencher a data de validade na ficha do lote para que o sistema monitore a contagem regressiva.'
        }
      ],
      offlineTip: 'O banco de dados de estoque opera no servidor local SQLite, mantendo os saldos sincronizados sem necessitar de conexão externa.',
      quickActionLabel: 'Acessar Estoque'
    },
    {
      id: 'kds',
      screenId: 'kds',
      number: '5',
      title: 'KDS Cozinha & Bar (Kitchen Display)',
      subtitle: 'Monitor digital de preparo com cronômetro inteligente e alerta de atraso',
      role: ['cozinha', 'gerente'],
      roleLabel: 'Cozinheiros / Bartenders / Chef',
      icon: <ChefHat className="w-5 h-5 text-amber-400" />,
      summary: 'Sistema de exibição para monitores ou tablets instalados na bancada quente, fria e balcão do bar. Substitui comandas de papel por cartões digitais interativos com contagem regressiva. Se o tempo estipulado estourar (15 minutos), o cartão pisca em vermelho sinalizando prioridade máxima aos cozinheiros.',
      steps: [
        'A tela é organizada no fluxo Kanban de 3 estágios: "1. Recebidos", "2. Em Preparo" e "3. Prontos na Bancada".',
        'Quando um pedido entra pelo PDV ou QR Code, ele cai na coluna "1. Recebidos" com alerta sonoro.',
        'O cozinheiro clica em "Aceitar e Iniciar": o cartão vai para "2. Em Preparo" e o cronômetro inicia a contagem.',
        'Monitore a cor do cartão: Verde/Laranja = Dentro do tempo limite | Vermelho Pulsante = Atrasado (tempo estourou > 15 min).',
        'Finalização: quando o prato estiver montado na travessa, clique em "Pronto (Finalizar)". O garçom receberá notificação no salão para retirar.',
        'Ao entregar a travessa na mesa, clique em "Servir na Mesa" para arquivar o pedido do monitor.'
      ],
      features: [
        { label: 'Cronômetro com Alerta Vermelho', desc: 'Identifica visualmente comandas que ultrapassaram o tempo limite de 15 minutos com animação pulsante.' },
        { label: 'Filtro por Estação de Trabalho', desc: 'Alterne a visualização entre "Todos", "Cozinha" (fogão/grelha) ou "Bar & Bebidas" (drinks/chopp).' },
        { label: 'Impressão de Comanda Individual', desc: 'Botão de impressora em cada cartão para locais que utilizam suportes metálicos de bancada.' },
        { label: 'Notificação ao Salão', desc: 'Dispara aviso no tablet do garçom assim que a comida estiver liberada pelo cozinheiro.' }
      ],
      faq: [
        {
          q: 'O que acontece se o cozinheiro finalizar um prato por engano?',
          a: 'Ele pode consultar a coluna "3. Prontos" antes de despachar e reverter o status caso o prato precise de mais tempo na grelha.'
        },
        {
          q: 'Como a cozinha visualiza observações especiais (ex: "carne bem passada")?',
          a: 'As observações são exibidas em destaque laranja com ícone de atenção logo abaixo do nome do item na comanda.'
        }
      ],
      offlineTip: 'Os pedidos chegam no monitor KDS com latência instantânea de 1ms através do Wi-Fi local Food_System_5G.',
      quickActionLabel: 'Abrir Monitor KDS'
    },
    {
      id: 'fichas',
      screenId: 'fichas',
      number: '6',
      title: 'Fichas Técnicas & Lucratividade',
      subtitle: 'Engenharia de cardápio, custo dos insumos (CMV) e simulador de preços',
      role: ['gerente', 'dono'],
      roleLabel: 'Proprietário / Gerente / Chef Executivo',
      icon: <Calculator className="w-5 h-5 text-orange-400" />,
      summary: 'Módulo de inteligência financeira gastronômica. Exibe a ficha técnica detalhada de cada prato do restaurante, relacionando o custo exato de cada ingrediente, a margem de lucro bruta (em % e R$), o markup multiplicador e um simulador em tempo real para recalcular os preços de venda.',
      steps: [
        'Selecione qualquer prato ou drink na lista lateral esquerda para abrir sua ficha completa.',
        'Verifique os 3 indicadores no topo: Custo dos Insumos (CMV em R$), Lucro Bruto em Reais e Markup Multiplicador.',
        'Examine a composição exata da porção (ex: 450g de Picanha Bovina, 300g de Mandioca na Manteiga, sal de parrilla) e o custo unitário de cada um.',
        'Avalie a barra de rentabilidade: Verde = Margem de Lucro | Vermelho = Custo dos Insumos.',
        'Simulador de Preço: arraste o controle deslizante ou digite um novo valor de venda para ver a margem recalculada na hora.',
        'Clique em "Salvar Novo Preço no Cardápio" para atualizar instantaneamente o PDV e o Cardápio Digital do cliente.'
      ],
      features: [
        { label: 'Simulador de Margem em Tempo Real', desc: 'Permite descobrir qual o preço ideal de venda para atingir metas de 60% ou 70% de margem líquida.' },
        { label: 'Alerta de Margem Baixa', desc: 'Destaca itens com margem inferior a 45% que necessitam de renegociação com fornecedores.' },
        { label: 'Impressão de Ficha Operacional', desc: 'Permite imprimir a ficha com pesos e medidas para padronização e treinamento da equipe de cozinha.' },
        { label: 'Sincronização com Estoque', desc: 'O custo do prato é recalculado sempre que o preço de compra do insumo sofrer alteração na NF.' }
      ],
      faq: [
        {
          q: 'O que significa o indicador "Markup Multiplicador"?',
          a: 'É o fator pelo qual o custo é multiplicado para gerar o preço final. Por exemplo, um custo de R$ 30 com markup 3.0x resulta em preço de venda de R$ 90.'
        },
        {
          q: 'A alteração de preço afeta mesas que já estão com a comanda aberta?',
          a: 'Não. Os pedidos já lançados mantêm o preço original registrado no momento da compra, garantindo transparência ao cliente.'
        }
      ],
      offlineTip: 'Todos os cálculos matemáticos rodam no próprio tablet, sem depender de conexão com servidores na nuvem.',
      quickActionLabel: 'Ver Fichas Técnicas'
    },
    {
      id: 'dashboard',
      screenId: 'dashboard',
      number: '7',
      title: 'Painel Executivo do Dono (Dashboard)',
      subtitle: 'Resumo visual e intuitivo com faturamento, horários de pico e ranking de pratos',
      role: ['dono', 'gerente'],
      roleLabel: 'Proprietário / Sócio / Diretor',
      icon: <BarChart3 className="w-5 h-5 text-orange-400" />,
      summary: 'Dashboard visual desenhado especificamente para o proprietário tomar decisões rápidas sem se perder em relatórios complexos. Apresenta faturamento consolidado, ticket médio, horários de pico em gráfico de barras, divisão de vendas por categorias e o ranking dos 5 pratos campeões.',
      steps: [
        'Selecione o filtro temporal no topo da tela: "Hoje", "Esta Semana" ou "Este Mês".',
        'Analise os 4 cartões de KPIs principais: Faturamento Total (R$), Ticket Médio por Mesa, Atendimentos Concluídos e Alertas Críticos.',
        'Gráfico de Horários de Pico: identifique os turnos com maior volume de vendas (Almoço, Happy Hour, Jantar ou Fechamento) para dimensionar a escala de garçons.',
        'Gráfico de Rosca: confira o percentual que cada família de produtos (Pratos, Bebidas, Petiscos, Sobremesas) representou na receita do período.',
        'Ranking Top 5: confira os pratos mais pedidos com medalhas de ouro, prata e bronze, quantidade vendida e faturamento acumulado.'
      ],
      features: [
        { label: 'Visão Sem Poluição Visual', desc: 'Gráficos limpos de barras e rosca substituem planilhas maçantes com design escuro de alto contraste.' },
        { label: 'Filtros Rápidos Hoje/Semana/Mês', desc: 'Alterna a base temporal em 1 toque com recálculo instantâneo de faturamento e ticket médio.' },
        { label: 'Ranking dos Campeões de Venda', desc: 'Mapeia os carros-chefes do restaurante para planejamento de compras e promoções.' },
        { label: 'Radar de Estoque Crítico', desc: 'Sinaliza no próprio painel insumos que estão na iminência de faltar durante a noite.' }
      ],
      faq: [
        {
          q: 'Os números do Dashboard do tablet são sincronizados com o Dashboard Remoto da Nuvem?',
          a: 'Sim. Todas as transações do servidor local são enviadas para a Nuvem de forma automática ou via botão "Sincronizar Agora".'
        },
        {
          q: 'Como é calculado o Ticket Médio?',
          a: 'Dividindo o faturamento bruto total pela quantidade de mesas e comandas atendidas no período selecionado.'
        }
      ],
      offlineTip: 'O painel do tablet consolida os dados das vendas locais de forma imediata, mesmo se o restaurante estiver sem internet.',
      quickActionLabel: 'Abrir Painel do Dono'
    },
    {
      id: 'rede',
      screenId: 'rede',
      number: '8',
      title: 'Configuração de Rede & Servidor Local',
      subtitle: 'Painel da infraestrutura Wi-Fi 5GHz, status do Food Node e dispositivos conectados',
      role: ['gerente', 'dono'],
      roleLabel: 'Gerência / Suporte Técnico / Dono',
      icon: <Radio className="w-5 h-5 text-orange-400" />,
      summary: 'Painel central de conectividade da infraestrutura híbrida do restaurante. Mostra o estado do servidor local (Food Node), o status da rede Wi-Fi dedicada ("Food_System_5G"), a quantidade de tablets e smartphones conectados com seus respectivos pings em milissegundos, e ferramentas de reinício e simulação de contingência.',
      steps: [
        'Verifique o status do Servidor Local: deve constar "ONLINE" em verde com latência estimada em 0.8ms.',
        'Confira o SSID da rede: Food_System_5G (Wi-Fi 5GHz de baixa latência dedicada aos equipamentos do estabelecimento).',
        'Monitore a Tabela de Dispositivos Conectados: veja os Tablets dos Garçons, KDS da Cozinha, Celulares dos Clientes e Terminal do Caixa.',
        'Reinício Assistido: caso precise reiniciar a rede do restaurante, utilize o botão "Reiniciar Servidor Local".',
        'Simulador de Contingência: teste como o sistema reage em quedas de sinal usando os botões "Simular Queda Internet" ou "Desligar Servidor".'
      ],
      features: [
        { label: 'Monitor de Ping e Latência', desc: 'Exibe a velocidade de resposta de cada tablet do salão e da cozinha em tempo real.' },
        { label: 'Isolamento de Rede Segura', desc: 'A rede 5GHz garante que o tráfego de pedidos da equipe não sofra interferência de redes externas.' },
        { label: 'Ferramenta de Reinício Seguro', desc: 'Reinicia o serviço sem apagar contas abertas ou pedidos pendentes.' },
        { label: 'Simulador para Treinamento', desc: 'Permite à equipe vivenciar na prática a transição para o Modo Offline sem medo de perder dados.' }
      ],
      faq: [
        {
          q: 'O que fazer se a operadora de internet (fibra) parar de funcionar?',
          a: 'Absolutamente nada na operação física precisa parar! O servidor local assume 100% dos pedidos, mesas e comandas via Wi-Fi interno. Os dados irão para a nuvem assim que a internet retornar.'
        },
        {
          q: 'Os clientes conectados ao cardápio conseguem acessar dados confidenciais do caixa?',
          a: 'Não. Os celulares dos clientes comunicam-se exclusivamente pela API pública de cardápio digital através de rotas isoladas e seguras.'
        }
      ],
      offlineTip: 'O servidor local é o coração da operação: ele não depende da internet para manter os pedidos rodando.',
      quickActionLabel: 'Gerenciar Rede & Wi-Fi'
    },
    {
      id: 'sync_queue',
      screenId: 'sync_queue',
      number: '9',
      title: 'Fila de Sincronização (Modo Offline)',
      subtitle: 'Central de contingência para reenvio e auditoria de dados locais para a nuvem',
      role: ['gerente', 'dono'],
      roleLabel: 'Gerência / Dono',
      icon: <Layers className="w-5 h-5 text-orange-400" />,
      summary: 'Central de contingência da nuvem. Quando o restaurante opera no Modo Offline (sem internet externa), todos os pedidos realizados, pagamentos liquidados e baixas de estoque são enfileirados de forma segura no disco rígido do servidor local. Quando a internet volta, esta tela realiza o upload assistido para os servidores centrais.',
      steps: [
        'Se a conexão externa cair, o cabeçalho exibirá o aviso "Modo Offline — Restaurante funcionando via Wi-Fi Local".',
        'Acesse esta tela para visualizar a lista de todos os pacotes enfileirados aguardando transmissão à nuvem.',
        'Selecione a política de envio: "Sincronização Automática" (envia assim que detectar internet) ou "Manual".',
        'Clique em "Tentar Sincronizar Novamente" para forçar o disparo dos pacotes retidos.',
        'Acompanhe a barra de progresso e verifique o carimbo de data/hora no registro de "Última Sincronização".'
      ],
      features: [
        { label: 'Zero Perda de Vendas', desc: 'Garante que nenhuma comanda, PIX ou fechamento de caixa seja perdido durante apagões de internet.' },
        { label: 'Auditoria Detalhada de Pacotes', desc: 'Exibe o tipo (pedido, pagamento ou estoque), valor monetário e horário exato de cada transação.' },
        { label: 'Modo Automático vs Manual', desc: 'Permite ao gerente escolher se deseja envio contínuo ou em lotes ao final do expediente.' },
        { label: 'Resiliência a Reinicializações', desc: 'A fila persiste no banco de dados mesmo que os tablets ou o servidor sejam reiniciados.' }
      ],
      faq: [
        {
          q: 'Quantas horas de vendas a fila de sincronização suporta?',
          a: 'A fila comporta milhares de transações e pode operar por vários dias ininterruptos em modo offline sem estourar a capacidade.'
        },
        {
          q: 'O que significa se um pacote exibir o status "Falha"?',
          a: 'Significa que a conexão oscilou durante o upload. Basta clicar em "Tentar Sincronizar Novamente" para retransmitir com sucesso.'
        }
      ],
      offlineTip: 'Sempre que a internet estiver fora do ar, consulte esta tela para checar o volume de pacotes acumulados com segurança.',
      quickActionLabel: 'Ver Fila de Sincronização'
    },
    {
      id: 'cliente',
      modeId: 'mobile_customer',
      number: '10',
      title: 'Cardápio Digital do Cliente (Smartphone / QR Code)',
      subtitle: 'Autoatendimento na mesa com fotos, chamada de garçom e pagamento PIX/Cartão',
      role: ['cliente', 'garcom', 'gerente'],
      roleLabel: 'Cliente / Garçom / Salão',
      icon: <Smartphone className="w-5 h-5 text-orange-400" />,
      summary: 'Interface de autoatendimento mobile-first escaneada pelo cliente na mesa ao apontar a câmera para o QR Code. Apresenta cardápio ilustrado com fotos em alta definição, carrinho flutuante de compras, despacho de pedidos direto à cozinha via Wi-Fi, botões de chamar garçom e pagamento no próprio aparelho por PIX ou cartão.',
      steps: [
        'O cliente senta na mesa e escaneia o QR Code do display acrílico com a câmera do celular.',
        'Tela de Boas-Vindas: o cliente é recebido com a identificação da sua mesa (ex: "Mesa 05") e toca em "Abrir Cardápio".',
        'Navegação: o cliente navega por categorias (Petiscos, Bebidas, etc.), seleciona pratos e inclui notas especiais.',
        'Carrinho Flutuante: mostra o subtotal em tempo real. O cliente revisa e toca no botão "Enviar Pedido para a Cozinha".',
        'Confirmação Wi-Fi: uma animação avisa que o pedido foi despachado para a cozinha e abre a linha do tempo de status (Aguardando -> Preparo -> Pronto).',
        'Botões Rápidos a Qualquer Momento: o cliente pode tocar em "Chamar Garçom" ou em "Pedir a Conta / Pagar via PIX ou Cartão" sem esperar pelo atendente.'
      ],
      features: [
        { label: 'Chamar Garçom com 1 Toque', desc: 'Dispara um aviso com sino e notificação no tablet do salão informando o número da mesa.' },
        { label: 'Pagamento no Celular via PIX/Cartão', desc: 'Gera QR Code PIX ou dados de cartão com liquidação e baixa automática no caixa físico.' },
        { label: 'Linha do Tempo de Preparo', desc: 'O cliente acompanha em tempo real se o prato foi aceito, está na grelha ou pronto para ser servido.' },
        { label: 'Funcionamento em Wi-Fi Aberto', desc: 'Funciona mesmo se o cliente estiver sem plano de dados 4G, bastando conectar no Wi-Fi do local.' }
      ],
      faq: [
        {
          q: 'O cliente precisa baixar algum aplicativo na Play Store ou App Store?',
          a: 'Não! O cardápio digital é uma aplicação web instantânea (PWA) que abre diretamente no navegador padrão do smartphone.'
        },
        {
          q: 'O garçom precisa autorizar o pedido feito pelo cliente?',
          a: 'Sim, o tablet do salão exibe um alerta sonoro e abre a tela de revisão para que o garçom confira os itens antes de enviar à cozinha.'
        }
      ],
      offlineTip: 'O cardápio digital é servido pelo servidor local do restaurante. Funciona perfeitamente conectado à rede Wi-Fi local.',
      quickActionLabel: 'Simular Celular do Cliente'
    },
    {
      id: 'cloud',
      modeId: 'cloud_login',
      number: '11',
      title: 'Versão Nuvem & Acesso Remoto do Dono',
      subtitle: 'Acompanhamento do restaurante à distância pelo navegador ou celular do proprietário',
      role: ['dono', 'gerente'],
      roleLabel: 'Proprietário / Gerente Geral',
      icon: <Cloud className="w-5 h-5 text-blue-400" />,
      summary: 'Módulo online para o proprietário gerenciar e auditar o estabelecimento de qualquer lugar do mundo (de casa, viagens ou no celular). Conta com tela de login protegida e Dashboard Remoto sincronizado em tempo real com as vendas, ocupação de mesas e alertas de estoque do restaurante físico.',
      steps: [
        'Acesse a versão Nuvem clicando no botão azul "Acesso Nuvem" no cabeçalho do sistema.',
        'Tela de Login: digite seu e-mail e senha cadastrados (ou utilize o botão de acesso rápido de demonstração).',
        'Dashboard Remoto: visualize o faturamento do dia em tempo real espelhado do caixa do restaurante físico.',
        'Acompanhe as mesas atualmente ocupadas e a quantidade de pedidos sendo produzidos na cozinha.',
        'Receba alertas de estoque crítico para autorizar compras com fornecedores sem precisar ligar para o salão.',
        'Use o botão "Sincronizar Agora" para forçar a coleta dos últimos dados atualizados do servidor local.'
      ],
      features: [
        { label: 'Acesso de Qualquer Dispositivo', desc: 'Acessível por computadores, tablets ou celulares com qualquer navegador web moderno.' },
        { label: 'Espelhamento Seguro', desc: 'Comunicação criptografada entre o servidor local do restaurante e a nuvem central.' },
        { label: 'Configurações de Sincronização', desc: 'Permite alternar entre sincronização contínua ou envio programado em horários pré-definidos.' },
        { label: 'Histórico de Auditoria', desc: 'Exibe o registro da última sincronização com quantidade de pedidos e valores auditados.' }
      ],
      faq: [
        {
          q: 'Se o restaurante físico estiver sem internet, o que a Nuvem exibe?',
          a: 'O Dashboard Remoto exibe os últimos dados recebidos e sinaliza o aviso de que o restaurante físico está em contingência local.'
        },
        {
          q: 'Posso acessar a Nuvem enquanto outros funcionários usam o tablet no restaurante?',
          a: 'Sim, múltiplos acessos simultâneos são suportados sem conflitos de concorrência de dados.'
        }
      ],
      offlineTip: 'A versão Nuvem mantém o histórico protegido na nuvem mesmo em eventuais manutenções de hardware no local físico.',
      quickActionLabel: 'Entrar na Nuvem do Dono'
    },
    {
      id: 'conectividade',
      screenId: 'rede',
      number: '12',
      title: 'Indicadores de Conexão no Topo de Todas as Telas',
      subtitle: 'Entendendo os ícones de Wi-Fi Verde, Cinza, Nuvem Azul e avisos de contingência',
      role: ['garcom', 'caixa', 'cozinha', 'gerente', 'dono'],
      roleLabel: 'Toda a Equipe do Restaurante',
      icon: <Wifi className="w-5 h-5 text-emerald-400" />,
      summary: 'Guia visual da barra de status presente no topo de todas as telas (tablets e smartphones). Ensina toda a equipe a reconhecer instantaneamente o estado da infraestrutura de rede através de cores e ícones padronizados.',
      steps: [
        'Observe a cápsula de status no topo superior esquerdo do sistema.',
        'Ícone de Wi-Fi VERDE: Conectado com sucesso ao Servidor Local Food Node (operação local rápida com ping de 0.8ms).',
        'Ícone de Wi-Fi CINZA / Vermelho: Modo Offline ou perda de conexão Wi-Fi interna (os dados ficam seguros em fila local no aparelho).',
        'Ícone de Nuvem AZUL: Conectado e perfeitamente sincronizado com a Internet e Nuvem do Dono.',
        'Faixa Amarela Superior: surge apenas quando a internet externa cai, alertando: "Modo Offline — Restaurante funcionando via Wi-Fi Local. Sincronizará quando a internet voltar".'
      ],
      features: [
        { label: 'Feedback Visual Instantâneo', desc: 'Permite a qualquer garçom ou operador de caixa saber o estado da conexão sem perguntar ao suporte.' },
        { label: 'Animação de Voo Wi-Fi', desc: 'Mostra visualmente o pacote saindo do tablet e pousando na cozinha em 2 milissegundos.' },
        { label: 'Transição Transparente', desc: 'O garçom não precisa mudar nenhuma ação caso o restaurante perca internet externa: o sistema cuida de tudo.' }
      ],
      faq: [
        {
          q: 'Se o ícone da Nuvem estiver apagado, eu preciso parar de vender?',
          a: 'De maneira alguma! O Wi-Fi Verde garante que todas as operações físicas continuem rodando a toda velocidade.'
        }
      ],
      offlineTip: 'Projetado sob a filosofia de que o restaurante NUNCA pode parar por instabilidades de provedores de internet.',
      quickActionLabel: 'Conferir Status de Rede'
    },
    {
      id: 'qrcode_placas',
      screenId: 'mesas',
      number: '13',
      title: 'Gestão de Placas QR Code das Mesas',
      subtitle: 'Geração, impressão e posicionamento dos displays de autoatendimento',
      role: ['gerente', 'dono'],
      roleLabel: 'Gerência / Marketing',
      icon: <QrCode className="w-5 h-5 text-orange-400" />,
      summary: 'Ferramenta integrada de confecção de placas e totens acrílicos de mesa com QR Code. Permite selecionar qualquer mesa do restaurante (Mesa 01 a 12), gerar a arte padronizada com instruções para o cliente e imprimir em impressoras convencionais ou térmicas.',
      steps: [
        'Clique no botão "Placa QR Mesa" no cabeçalho ou no mapa de mesas.',
        'Escolha o número da mesa desejada (ex: Mesa 01, Mesa 05, etc.).',
        'O sistema gera o display com o QR Code oficial de alta resolução, o nome do restaurante e as instruções em 3 passos para o cliente.',
        'Clique em "Imprimir Placa da Mesa" ou "Baixar Imagem".',
        'Insira a impressão no display acrílico tipo T invertido ou adesivo resinado sobre a mesa física correspondente.'
      ],
      features: [
        { label: 'Design Padronizado Profissional', desc: 'Layout escuro com toques em laranja que valoriza a identidade visual do restaurante.' },
        { label: 'Instruções para o Cliente', desc: 'A arte já contém os passos: 1. Aponte a câmera, 2. Escolha os pratos, 3. Envie para a cozinha.' },
        { label: 'Identificador Único por Mesa', desc: 'Garante que os pedidos feitos pelo cliente caiam com a identificação exata da mesa sentada.' }
      ],
      faq: [
        {
          q: 'É necessário trocar o QR Code quando mudar o cardápio?',
          a: 'Não! O QR Code é dinâmico e direciona para o link fixo da mesa. Qualquer novo prato ou preço cadastrado no sistema reflete imediatamente no celular do cliente.'
        }
      ],
      offlineTip: 'O QR Code aponta para o endereço IP local do servidor do restaurante, abrindo mesmo com operadoras oscilando.',
      quickActionLabel: 'Gerar Placa QR Code'
    },
    {
      id: 'hostinger_github',
      screenId: 'dashboard',
      number: '14',
      title: 'Publicação na Hostinger via GitHub (Deploy Web)',
      subtitle: 'Hospedagem profissional com Git, .htaccess, SSL e suporte a SPA',
      role: ['dono', 'gerente', 'deploy'],
      roleLabel: 'Proprietário / Gerente / TI',
      icon: <Globe className="w-5 h-5 text-sky-400" />,
      summary: 'Passo a passo para publicar o Sistema Food no seu domínio próprio na Hostinger utilizando o GitHub. Inclui suporte nativo a roteamento SPA sem erro 404 via .htaccess, compressão Gzip para celulares e automação de deploy contínuo (CI/CD).',
      steps: [
        'Passo 1 (GitHub): No terminal da sua máquina, envie o código para o seu repositório: git add . -> git commit -m "Sistema Food" -> git push origin main.',
        'Passo 2 (Hostinger hPanel): Acesse hpanel.hostinger.com -> Vá em Sites -> Gerenciar -> Seção Avançado -> Git.',
        'Passo 3 (Conectar Repositório): Cole o link do seu GitHub (ex: https://github.com/SEU-USUARIO/sistema-food.git), escolha a branch main e clique em "Criar".',
        'Passo 4 (Build de Produção): O projeto já inclui o script npm run build configurado para gerar a pasta dist/ com o arquivo .htaccess de alta performance.',
        'Passo 5 (Certificado SSL): No hPanel da Hostinger, vá em Segurança -> SSL e ative o certificado gratuito Let\'s Encrypt com 1 clique.',
        'Passo 6 (Deploy Automático Opcional): Use o arquivo .github/workflows/deploy-hostinger.yml já incluso para publicar via FTP automaticamente a cada push!'
      ],
      features: [
        { label: 'Arquivo .htaccess Incluso', desc: 'Evita erro 404 ao recarregar a página e ativa cache de 1 ano para imagens e estilos.' },
        { label: 'GitHub Actions Pronto', desc: 'Workflow automatizado de CI/CD para compilar e enviar via FTP sem comandos manuais.' },
        { label: 'Compatível com Subdomínios', desc: 'Funciona tanto no domínio principal (ex: seurestaurante.com) quanto em subdomínio (ex: food.seurestaurante.com).' },
        { label: 'Suporte a PWA e Celulares', desc: 'Carregamento instantâneo para garçons e clientes mesmo em conexões 4G móveis.' }
      ],
      faq: [
        {
          q: 'O que fazer se a página der erro 404 ao atualizar (F5)?',
          a: 'O projeto já inclui o arquivo public/.htaccess com regras de RewriteRule ^ index.html [L]. Certifique-se de que o arquivo .htaccess foi copiado para a pasta public_html da Hostinger.'
        },
        {
          q: 'Posso usar o Gerenciador de Arquivos do hPanel em vez do Git?',
          a: 'Sim! Basta rodar "npm run build" no seu computador, compactar o conteúdo da pasta dist/ em .zip e descompactar dentro de public_html na Hostinger.'
        },
        {
          q: 'Onde encontro o arquivo com as instruções completas?',
          a: 'Consulte o arquivo GUIA_HOSTINGER_GITHUB.md na raiz do projeto para ver o passo a passo com prints e exemplos.'
        }
      ],
      offlineTip: 'A versão na Hostinger atua como o servidor Nuvem central para o dono acompanhar o faturamento à distância.',
      quickActionLabel: 'Ver Guia da Nuvem'
    },
    {
      id: 'instalador_desktop',
      screenId: 'pdv',
      number: '15',
      title: 'Instalador Desktop para Computador (Windows .EXE)',
      subtitle: 'Aplicativo executável nativo via Electron com atalhos e modo Kiosk F11',
      role: ['dono', 'gerente', 'caixa', 'deploy'],
      roleLabel: 'Proprietário / Gerente / Caixa',
      icon: <Monitor className="w-5 h-5 text-emerald-400" />,
      summary: 'Instalação do Sistema Food como programa nativo de computador para Windows (e Linux/Mac) via Electron. Não depende de navegador aberto, não permite que operadores fechem abas por engano, possui tela cheia para PDV/KDS e roda 100% offline no servidor local.',
      steps: [
        'Passo 1 (Método 1 Clique no Windows): Abra a pasta do projeto no Windows e dê dois cliques no arquivo "gerar-instalador-windows.bat".',
        'Passo 2 (Compilação Automática): O script verificará o Node.js, instalará os pacotes e executará o electron-builder para gerar o instalador.',
        'Passo 3 (Localizar o .EXE): A pasta "dist-electron/" se abrirá automaticamente com o arquivo "Sistema Food - Bar & Restaurante Setup 2.5.0.exe".',
        'Passo 4 (Instalação): Dê dois cliques no instalador. Ele criará o atalho na Área de Trabalho e no Menu Iniciar do Windows com assistente em português.',
        'Passo 5 (Versão Portátil): Se preferir rodar em um Pen Drive sem instalar, execute "npm run dist:portable".',
        'Passo 6 (Modo Tela Cheia): Ao abrir o programa no computador do caixa ou da cozinha, pressione F11 para entrar no modo Kiosk profissional!'
      ],
      features: [
        { label: 'Script .BAT de 1 Clique', desc: 'Arquivo gerar-instalador-windows.bat pronto para compilar o executável no Windows sem digitar comandos.' },
        { label: 'Atalhos no Windows', desc: 'Instalador oficial NSIS com atalho na Área de Trabalho e ícone personalizado do Sistema Food.' },
        { label: 'Modo Kiosk (F11)', desc: 'Trava a janela em tela cheia para monitores KDS de cozinha e terminais de caixa, impedindo saídas acidentais.' },
        { label: 'Operação 100% Offline', desc: 'Executa na velocidade máxima do hardware local sem depender de internet nem de abas de navegador.' }
      ],
      faq: [
        {
          q: 'Preciso de internet para usar a versão instalada no computador?',
          a: 'Não! A versão Desktop comunica-se diretamente com o servidor local e o banco de dados embutido através da rede Wi-Fi do restaurante.'
        },
        {
          q: 'Qual o comando de terminal para gerar o instalador manualmente?',
          a: 'Execute no terminal: npm run dist:win. O arquivo .exe será gerado na pasta dist-electron/.'
        },
        {
          q: 'Como testar a versão desktop antes de gerar o instalador final?',
          a: 'Inicie com: npm run dev em um terminal, e execute: npm run electron:dev em outro terminal.'
        }
      ],
      offlineTip: 'A versão Desktop é ideal para o terminal do caixa e tela KDS da cozinha: ultra-estável e à prova de quedas de conexão.',
      quickActionLabel: 'Abrir PDV Desktop'
    }
  ];

  const roleFilters: { id: RoleFilter; label: string }[] = [
    { id: 'todos', label: 'Todos os Módulos (15)' },
    { id: 'deploy', label: 'Hostinger & Instalador PC' },
    { id: 'garcom', label: 'Garçom & Salão' },
    { id: 'caixa', label: 'Operador de Caixa' },
    { id: 'cozinha', label: 'Cozinha & Bar (KDS)' },
    { id: 'estoque', label: 'Estoque & Compras' },
    { id: 'gerente', label: 'Gerência Geral' },
    { id: 'dono', label: 'Proprietário' },
    { id: 'cliente', label: 'Cliente (Mobile QR)' }
  ];

  const filteredGuides = guides.filter(g => {
    const matchRole = selectedRole === 'todos' || g.role.includes(selectedRole);
    const matchSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        g.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        g.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        g.steps.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        g.features.some(f => f.label.toLowerCase().includes(searchQuery.toLowerCase()) || f.desc.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        g.faq.some(item => item.q.toLowerCase().includes(searchQuery.toLowerCase()) || item.a.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchRole && matchSearch;
  });

  const activeGuide = guides.find(g => g.id === activeGuideId) || filteredGuides[0] || guides[0];

  const handleSelectGuide = (guide: ScreenGuide) => {
    playFeedbackSound('click');
    setActiveGuideId(guide.id);
    setMobileViewDetail(true);
    setOpenFaqIndex(0);
  };

  const handleExecuteQuickAction = (guide: ScreenGuide) => {
    playFeedbackSound('click');
    if (guide.id === 'qrcode_placas') {
      openQRCodeModal('Mesa 05');
      return;
    }
    if (guide.modeId) {
      setInterfaceMode(guide.modeId);
    } else if (guide.screenId) {
      setActiveScreen(guide.screenId);
    }
  };

  const handlePrintManual = () => {
    playFeedbackSound('click');
    addToast('info', 'Manual de Instruções', 'Preparando documento completo do manual para impressão ou exportação em PDF...');
    window.print?.();
  };

  // Find next guide index for the "Próxima Tela" helper
  const currentGuideIndex = guides.findIndex(g => g.id === activeGuide.id);
  const nextGuide = guides[(currentGuideIndex + 1) % guides.length];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0b101c] overflow-y-auto select-none">
      {/* Top Header Bar */}
      <div className="bg-[#121929] border-b border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/25">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base md:text-lg text-white tracking-tight">
                Manual de Instruções de Todas as Telas
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
                GUIA OPERACIONAL COMPLETO
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Guia oficial passo a passo: Salão, Caixa, Estoque, KDS, Fichas, Rede Wi-Fi 5G, Celular e Nuvem
            </span>
          </div>
        </div>

        {/* Right Tools & Connectivity Pill */}
        <div className="flex items-center gap-2">
          {/* Quick Status Capsule */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${localServerStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
              <span className="text-slate-300 font-mono text-[11px]">Wi-Fi 5G</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${internetStatus === 'online' ? 'bg-blue-400' : 'bg-amber-400'}`}></span>
              <span className="text-slate-300 font-mono text-[11px]">{internetStatus === 'online' ? 'Nuvem OK' : 'Offline'}</span>
            </div>
          </div>

          <button
            onClick={() => openQRCodeModal('Mesa 05')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-700 text-xs font-bold transition-colors pos-btn-press"
            title="Gerar Placa QR Code da Mesa"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gerar Placa QR</span>
          </button>

          <button
            onClick={handlePrintManual}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors pos-btn-press"
            title="Imprimir Guia para Treinamento da Equipe"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Imprimir Manual</span>
          </button>
        </div>
      </div>

      {/* Filter Strip & Search Bar */}
      <div className="bg-[#0e1526] px-4 py-2.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar dúvida, tela, atalho ou procedimento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Profile / Role Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          {roleFilters.map(rf => (
            <button
              key={rf.id}
              onClick={() => { playFeedbackSound('click'); setSelectedRole(rf.id); }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap pos-btn-press border ${
                selectedRole === rf.id
                  ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                  : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              {rf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="flex-1 grid grid-cols-12 gap-3 p-3 overflow-hidden">
        {/* Left Column (5 Colunas em Desktop / Toggle em Mobile): Lista de Todos os Módulos */}
        <div className={`col-span-12 lg:col-span-4 flex flex-col bg-[#121929]/95 rounded-2xl border border-slate-800/90 shadow-xl overflow-hidden ${
          mobileViewDetail ? 'hidden lg:flex' : 'flex'
        }`}>
          <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-400 text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-orange-400" />
              Telas & Módulos do Sistema ({filteredGuides.length})
            </span>
            <span className="text-[10px] text-orange-400 font-mono font-bold">Manual v2.5</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-1.5 space-y-1">
            {filteredGuides.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Nenhum módulo encontrado para a busca "{searchQuery}".
              </div>
            ) : (
              filteredGuides.map(g => {
                const isSelected = activeGuide.id === g.id;

                return (
                  <div
                    key={g.id}
                    onClick={() => handleSelectGuide(g)}
                    className={`p-3 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-orange-500/15 border border-orange-500/50 shadow-md'
                        : 'hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      {g.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs md:text-sm text-white truncate">
                          {g.number}. {g.title.split('—')[0].trim()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {g.subtitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-semibold text-orange-400/90 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                          {g.roleLabel.split('/')[0].trim()}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {g.steps.length} passos
                        </span>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 mt-2 transition-transform ${isSelected ? 'text-orange-400 translate-x-0.5' : 'text-slate-600'}`} />
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Contingency & Quick Info Widget */}
          <div className="p-3 bg-gradient-to-r from-amber-950/40 to-slate-900 border-t border-slate-800 text-xs text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium text-[11px]">Arquitetura Híbrida 100% Ativa</span>
            </div>
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">Wi-Fi 5G & Nuvem</span>
          </div>
        </div>

        {/* Right Column (7 Colunas em Desktop / Tela Cheia em Mobile): Detalhes Completos da Instrução */}
        <div className={`col-span-12 lg:col-span-8 flex flex-col bg-[#121929]/95 rounded-2xl border border-slate-800/90 shadow-xl overflow-hidden ${
          !mobileViewDetail ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Mobile Back Button to list */}
          <div className="lg:hidden p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setMobileViewDetail(false)}
              className="flex items-center gap-1.5 text-xs text-orange-400 font-bold hover:text-orange-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Lista de Telas</span>
            </button>
            <span className="text-xs text-slate-400 font-mono">
              Tela {activeGuide.number} de {guides.length}
            </span>
          </div>

          {/* Guide Header Banner */}
          <div className="p-4 sm:p-5 bg-gradient-to-b from-[#172036] to-[#121929] border-b border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shadow-md">
                  {activeGuide.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 font-mono px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                      MÓDULO {activeGuide.number}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Público: <strong className="text-slate-200">{activeGuide.roleLabel}</strong>
                    </span>
                  </div>
                  <h2 className="font-black text-lg sm:text-xl text-white tracking-tight mt-0.5">
                    {activeGuide.title}
                  </h2>
                </div>
              </div>

              {/* Direct Jump Action Button */}
              <button
                onClick={() => handleExecuteQuickAction(activeGuide)}
                className="py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/25 pos-btn-press transition-all"
              >
                <span>{activeGuide.quickActionLabel}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2">
              {activeGuide.summary}
            </p>

            {/* Sub-Tabs for Guide Detail */}
            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
              <button
                onClick={() => { playFeedbackSound('click'); setActiveTab('passos'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'passos'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>1. Passo a Passo Operacional ({activeGuide.steps.length})</span>
              </button>

              <button
                onClick={() => { playFeedbackSound('click'); setActiveTab('recursos'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'recursos'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>2. Recursos & Atalhos ({activeGuide.features.length})</span>
              </button>

              <button
                onClick={() => { playFeedbackSound('click'); setActiveTab('faq'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'faq'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>3. Perguntas Frequentes (FAQ) ({activeGuide.faq.length})</span>
              </button>

              <button
                onClick={() => { playFeedbackSound('click'); setActiveTab('offline'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'offline'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>4. Modo Offline & Wi-Fi</span>
              </button>
            </div>
          </div>

          {/* Guide Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Tab 1: Chronological Steps */}
            {activeTab === 'passos' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Fluxo de Operação Passo a Passo
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Siga na ordem indicada
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeGuide.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3 text-xs hover:border-slate-700 transition-colors"
                    >
                      <span className="w-7 h-7 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 font-mono font-black flex items-center justify-center shrink-0 text-xs shadow-xs">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-slate-200 leading-relaxed font-medium">
                          {step}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Advanced Features & Shortcuts */}
            {activeTab === 'recursos' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Recursos Avançados, Atalhos e Dicas de Ouro
                  </span>
                  <span className="text-[11px] text-amber-400 font-mono">
                    Produtividade máxima
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeGuide.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="bg-[#141b2e] border border-slate-800/90 rounded-2xl p-4 text-xs space-y-1.5 hover:border-orange-500/30 transition-all shadow-md"
                    >
                      <div className="font-extrabold text-orange-400 flex items-center gap-2 text-sm">
                        <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                        <span>{feat.label}</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Frequently Asked Questions (FAQ) */}
            {activeTab === 'faq' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-sky-400" />
                    Dúvidas Frequentes & Resolução Imediata de Problemas
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {activeGuide.faq.length} perguntas respondidas
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeGuide.faq.map((faqItem, idx) => {
                    const isOpen = openFaqIndex === idx;

                    return (
                      <div
                        key={idx}
                        className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden transition-colors"
                      >
                        <button
                          onClick={() => {
                            playFeedbackSound('click');
                            setOpenFaqIndex(isOpen ? null : idx);
                          }}
                          className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs font-bold text-slate-100 hover:text-orange-400 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-mono">
                              ?
                            </span>
                            {faqItem.q}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-orange-400' : ''}`} />
                        </button>

                        {isOpen && (
                          <div className="px-4 pb-3.5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                            {faqItem.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 4: Offline-First & Network Behavior */}
            {activeTab === 'offline' && (
              <div className="space-y-4">
                <div className="bg-emerald-950/25 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-emerald-200">
                  <Wifi className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <strong className="font-extrabold text-white text-sm block">
                      Comportamento em Modo Offline (Sem Internet Externa):
                    </strong>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {activeGuide.offlineTip}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-orange-400" />
                    <span>Como a Arquitetura Híbrida protege este módulo:</span>
                  </div>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Servidor Local Food Node:</strong> Roda no restaurante em máquina física conectada ao roteador Wi-Fi 5GHz.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Fila de Transmissão Inteligente:</strong> Se a fibra externa cair, os dados são acumulados localmente e sincronizados assim que o sinal voltar.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Zero Dependência de Nuvem no Salão:</strong> Nenhum garçom, cozinheiro ou caixa fica travado por lentidão de servidores remotos.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Bottom Navigation Guide Tour Bar */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-400">
                Você está vendo o guia do <strong className="text-orange-400">{activeGuide.title.split('—')[0].trim()}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExecuteQuickAction(activeGuide)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>Abrir Tela Agora</span>
                  <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
                </button>

                <button
                  onClick={() => handleSelectGuide(nextGuide)}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-orange-500/20"
                >
                  <span>Próximo Módulo ({nextGuide.number})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
