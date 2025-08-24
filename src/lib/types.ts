export interface User {
  id: string;
  name: string;
  email: string;
  role: 'tatuador' | 'assistente' | 'gestor';
  plan: 'solo' | 'duo' | 'studio' | 'studio-pro';
  avatar?: string;
  studio?: string;
}

export interface Client {
  id: string;
  name: string;
  whatsapp: string;
  instagram?: string;
  style: string;
  references: string[];
  anamnese: Record<string, any>;
  observations: string;
  sessions: Session[];
  totalPaid: number;
  status: 'novo-contato' | 'em-conversa' | 'orcamento-enviado' | 'agendamento-realizado' | 'desqualificado';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  // Dados de movimentação semanal
  weekMovements?: ClientWeekMovement[];
}

export interface ClientWeekMovement {
  id: string;
  clientId: string;
  year: number;
  month: number;
  weekISO: number;
  status: Client['status'];
  movedAt: Date;
  previousStatus?: Client['status'];
}

export interface Session {
  id: string;
  clientId: string;
  tattooerId: string;
  date: Date;
  duration: number;
  value: number;
  // Novos campos para valores
  totalValue?: number; // Valor total da tatuagem
  signalValue?: number; // Valor do sinal (entrada)
  pendingValue?: number; // Valor pendente (calculado)
  status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado' | 'reagendado';
  description: string;
  photos?: string[];
  // Novo campo para imagens de referência
  referenceImages?: string[]; // URLs das imagens de referência
}

export interface Goal {
  id: string;
  tattooerId: string;
  month: string; // YYYY-MM format
  target: number; // Meta de faturamento
  current: number; // Valor atual atingido
  percentage: number; // Percentual atingido
  // Novos campos operacionais
  availableDays: number; // Dias disponíveis para atender
  desiredTicketAverage?: number; // Ticket médio desejado (opcional)
  expectedConversion?: number; // Conversão esperada em % (opcional)
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalMetrics {
  // Valores básicos
  target: number;
  current: number;
  percentage: number;
  remainingDays: number;
  
  // Cálculos operacionais
  dailySalesNeeded: number; // Vendas necessárias por dia
  tattoosNeeded: number; // Número de tatuagens necessárias
  realConversionRate: number; // Taxa de conversão real do CRM
  expectedConversionRate: number; // Taxa esperada ou real
  leadsNeeded: number; // Leads necessários
  realTicketAverage: number; // Ticket médio real do período
  necessaryTicketAverage: number; // Ticket médio necessário
}

export interface Transaction {
  id: string;
  type: 'receita' | 'despesa';
  description: string;
  value: number;
  date: Date;
  category: string;
  tattooerId: string;
  sessionId?: string;
  comandaId?: string;
  paymentMethod?: 'dinheiro' | 'pix' | 'credito-vista' | 'credito-parcelado' | 'debito';
  grossValue?: number;
  fees?: number;
  installments?: number;
  // Novos campos para controle automático
  isAutomatic?: boolean; // Se foi gerada automaticamente da Agenda/Comandas
  source?: 'agenda' | 'comanda' | 'manual'; // Origem da transação
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  tattooerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialPeriod {
  year: number;
  month: number;
  grossRevenue: number; // Faturamento bruto (Agenda + Comandas)
  totalExpenses: number; // Total de despesas
  netProfit: number; // Lucro líquido
  revenueFromAgenda: number; // Receita da Agenda
  revenueFromComandas: number; // Receita das Comandas
}

export interface Comanda {
  id: string;
  date: Date;
  tattooerId: string;
  openingValue: number;
  closingValue?: number;
  status: 'aberta' | 'fechada';
  clients: ComandaClient[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ComandaClient {
  id: string;
  comandaId: string;
  clientId?: string;
  clientName: string;
  sessionId?: string;
  description: string;
  value: number;
  status: 'pendente' | 'finalizado';
  payments: ComandaPayment[]; // Obrigatório: múltiplos pagamentos
  createdAt: Date;
}

export interface ComandaPayment {
  id: string;
  comandaClientId: string;
  method: 'dinheiro' | 'pix' | 'credito-vista' | 'credito-parcelado' | 'debito';
  grossValue: number;
  netValue: number;
  fees: number;
  installments?: number;
  feesPaidByClient: boolean;
  createdAt: Date;
}

export interface TaxSettings {
  id: string;
  tattooerId: string;
  creditCardCashRate: number; // Taxa cartão crédito à vista
  creditCardInstallmentRate: number; // Taxa cartão crédito parcelado (padrão)
  debitCardRate: number; // Taxa cartão débito
  pixRate: number; // Taxa PIX
  // Configurações de taxas por faixa de parcelamento até 12x
  installmentRates: {
    twoInstallments: number; // Taxa para 2x
    threeInstallments: number; // Taxa para 3x
    fourInstallments: number; // Taxa para 4x
    fiveInstallments: number; // Taxa para 5x
    sixInstallments: number; // Taxa para 6x
    sevenInstallments: number; // Taxa para 7x
    eightInstallments: number; // Taxa para 8x
    nineInstallments: number; // Taxa para 9x
    tenInstallments: number; // Taxa para 10x
    elevenInstallments: number; // Taxa para 11x
    twelveInstallments: number; // Taxa para 12x
  };
  updatedAt: Date;
}

export interface WeekPeriod {
  year: number;
  month: number;
  weekISO: number;
  startDate: Date;
  endDate: Date;
  label: string;
}

export interface PeriodMetrics {
  totalLeads: number;
  leadsInFollowUp: number;
  leadsClosed: number;
  conversionRate: number;
}