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
  status: 'novo-contato' | 'em-conversa' | 'orcamento-enviado' | 'agendamento-realizado' | 'cliente-fidelizado' | 'cancelado';
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
  status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado' | 'reagendado';
  description: string;
  photos?: string[];
}

export interface Goal {
  id: string;
  tattooerId: string;
  month: string;
  target: number;
  current: number;
  percentage: number;
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
  payment?: ComandaPayment;
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
  creditCardInstallmentRate: number; // Taxa cartão crédito parcelado
  debitCardRate: number; // Taxa cartão débito
  pixRate: number; // Taxa PIX
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