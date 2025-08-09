import { supabase } from './supabase';
import { Client, Session, Transaction, Goal, TaxSettings, Comanda } from './types';

// Clientes
export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data?.map(client => ({
    ...client,
    createdAt: new Date(client.created_at),
    updatedAt: new Date(client.updated_at),
    totalPaid: parseFloat(client.total_paid || '0'),
    references: client.client_references || [],
    sessions: []
  })) || [];
}

export async function createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'sessions'>) {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      tattooerid: '1', // TODO: usar ID do usuário logado
      name: client.name,
      whatsapp: client.whatsapp,
      instagram: client.instagram,
      style: client.style,
      client_references: client.references,
      anamnese: client.anamnese,
      observations: client.observations,
      total_paid: client.totalPaid,
      status: client.status,
      tags: client.tags
    })
    .select()
    .single();
  
  if (error) throw error;
  return {
    ...data,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    totalPaid: parseFloat(data.total_paid || '0'),
    references: data.client_references || [],
    sessions: []
  };
}

export async function updateClient(id: string, updates: Partial<Client>) {
  const { data, error } = await supabase
    .from('clients')
    .update({
      name: updates.name,
      whatsapp: updates.whatsapp,
      instagram: updates.instagram,
      style: updates.style,
      client_references: updates.references,
      anamnese: updates.anamnese,
      observations: updates.observations,
      total_paid: updates.totalPaid,
      status: updates.status,
      tags: updates.tags,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return {
    ...data,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    totalPaid: parseFloat(data.total_paid || '0'),
    references: data.client_references || [],
    sessions: []
  };
}

// Sessões
export async function getSessions() {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('session_date', { ascending: true });
  
  if (error) throw error;
  return data?.map(session => ({
    id: session.id,
    clientId: session.client_id,
    tattooerId: session.tattooerid,
    date: new Date(session.session_date),
    duration: session.duration,
    value: parseFloat(session.value),
    status: session.status,
    description: session.description,
    photos: session.photos || []
  })) || [];
}

export async function createSession(session: Omit<Session, 'id'>) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      client_id: session.clientId,
      tattooerid: session.tattooerId,
      session_date: session.date.toISOString(),
      duration: session.duration,
      value: session.value,
      status: session.status,
      description: session.description,
      photos: session.photos || []
    })
    .select()
    .single();
  
  if (error) throw error;
  return {
    id: data.id,
    clientId: data.client_id,
    tattooerId: data.tattooerid,
    date: new Date(data.session_date),
    duration: data.duration,
    value: parseFloat(data.value),
    status: data.status,
    description: data.description,
    photos: data.photos || []
  };
}

export async function updateSession(id: string, updates: Partial<Session>) {
  const { data, error } = await supabase
    .from('sessions')
    .update({
      client_id: updates.clientId,
      session_date: updates.date?.toISOString(),
      duration: updates.duration,
      value: updates.value,
      status: updates.status,
      description: updates.description,
      photos: updates.photos,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return {
    id: data.id,
    clientId: data.client_id,
    tattooerId: data.tattooerid,
    date: new Date(data.session_date),
    duration: data.duration,
    value: parseFloat(data.value),
    status: data.status,
    description: data.description,
    photos: data.photos || []
  };
}

// Transações
export async function getTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false });
  
  if (error) throw error;
  return data?.map(transaction => ({
    id: transaction.id,
    type: transaction.type,
    description: transaction.description,
    value: parseFloat(transaction.value),
    date: new Date(transaction.transaction_date),
    category: transaction.category,
    tattooerId: transaction.tattooerid,
    sessionId: transaction.session_id,
    comandaId: transaction.comanda_id,
    paymentMethod: transaction.payment_method,
    grossValue: transaction.gross_value ? parseFloat(transaction.gross_value) : undefined,
    fees: transaction.fees ? parseFloat(transaction.fees) : undefined,
    installments: transaction.installments
  })) || [];
}

export async function createTransaction(transaction: Omit<Transaction, 'id'>) {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      tattooerid: transaction.tattooerId,
      type: transaction.type,
      description: transaction.description,
      value: transaction.value,
      transaction_date: transaction.date.toISOString(),
      category: transaction.category,
      session_id: transaction.sessionId,
      comanda_id: transaction.comandaId,
      payment_method: transaction.paymentMethod,
      gross_value: transaction.grossValue,
      fees: transaction.fees,
      installments: transaction.installments
    })
    .select()
    .single();
  
  if (error) throw error;
  return {
    id: data.id,
    type: data.type,
    description: data.description,
    value: parseFloat(data.value),
    date: new Date(data.transaction_date),
    category: data.category,
    tattooerId: data.tattooerid,
    sessionId: data.session_id,
    comandaId: data.comanda_id,
    paymentMethod: data.payment_method,
    grossValue: data.gross_value ? parseFloat(data.gross_value) : undefined,
    fees: data.fees ? parseFloat(data.fees) : undefined,
    installments: data.installments
  };
}

// Metas
export async function getGoals() {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .order('month', { ascending: false });
  
  if (error) throw error;
  return data?.map(goal => ({
    id: goal.id,
    tattooerId: goal.tattooerid,
    month: goal.month,
    target: parseFloat(goal.target),
    current: parseFloat(goal.current_value || '0'),
    percentage: parseFloat(goal.percentage || '0')
  })) || [];
}

export async function createOrUpdateGoal(goal: Omit<Goal, 'id'>) {
  const { data, error } = await supabase
    .from('goals')
    .upsert({
      tattooerid: goal.tattooerId,
      month: goal.month,
      target: goal.target,
      current_value: goal.current,
      percentage: goal.percentage
    }, {
      onConflict: 'tattooerid,month'
    })
    .select()
    .single();
  
  if (error) throw error;
  return {
    id: data.id,
    tattooerId: data.tattooerid,
    month: data.month,
    target: parseFloat(data.target),
    current: parseFloat(data.current_value || '0'),
    percentage: parseFloat(data.percentage || '0')
  };
}

// Configurações de Taxa
export async function getTaxSettings() {
  const { data, error } = await supabase
    .from('tax_settings')
    .select('*')
    .eq('tattooerid', '1') // TODO: usar ID do usuário logado
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  
  if (!data) return null;
  
  return {
    id: data.id,
    tattooerId: data.tattooerid,
    creditCardCashRate: parseFloat(data.credit_card_cash_rate),
    creditCardInstallmentRate: parseFloat(data.credit_card_installment_rate),
    debitCardRate: parseFloat(data.debit_card_rate),
    pixRate: parseFloat(data.pix_rate),
    updatedAt: new Date(data.updated_at)
  };
}

export async function createOrUpdateTaxSettings(settings: TaxSettings) {
  const { data, error } = await supabase
    .from('tax_settings')
    .upsert({
      tattooerid: settings.tattooerId,
      credit_card_cash_rate: settings.creditCardCashRate,
      credit_card_installment_rate: settings.creditCardInstallmentRate,
      debit_card_rate: settings.debitCardRate,
      pix_rate: settings.pixRate,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'tattooerid'
    })
    .select()
    .single();
  
  if (error) throw error;
  return {
    id: data.id,
    tattooerId: data.tattooerid,
    creditCardCashRate: parseFloat(data.credit_card_cash_rate),
    creditCardInstallmentRate: parseFloat(data.credit_card_installment_rate),
    debitCardRate: parseFloat(data.debit_card_rate),
    pixRate: parseFloat(data.pix_rate),
    updatedAt: new Date(data.updated_at)
  };
}