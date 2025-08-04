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
}

export interface AIResponse {
  type: 'whatsapp' | 'instagram' | 'suggestion';
  content: string;
  context?: string;
}