import { supabase } from './supabase';
import { Client, Session, Transaction, Goal, TaxSettings, Comanda, ComandaClient, ComandaPayment } from './types';

// Função para obter o ID do usuário atual
const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

// ==================== CLIENTES ====================

export async function getClients(): Promise<Client[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('tattooerid', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(client => ({
      i: client.id,
      name: client.name,
      whatsapp: client.whatsapp,
      instagram: client.instagram,
      style: client.style,
      references: client.client_references || [],
      anamnese: client.anamnese || {},
      observations: client.observations || '',
      totalPaid: parseFloat(client.total_paid || '0'),
      status: client.status,
      tags: client.tags || [],
      createdAt: new Date(client.created_at),
      updatedAt: new Date(client.updated_at),
      sessions: [] // Será carregado separadamente se necessário
    })) || [];
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    throw error;
  }
}

export async function createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'sessions'>): Promise<Client> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');
    
    const { data, error } = await supabase
      .from('clients')
      .insert({
        tattooerid: userId,
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
      id: data.id,
      name: data.name,
      whatsapp: data.whatsapp,
      instagram: data.instagram,
      style: data.style,
      references: data.client_references || [],
      anamnese: data.anamnese || {},
      observations: data.observations || '',
      totalPaid: parseFloat(data.total_paid || '0'),
      status: data.status,
      tags: data.tags || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      sessions: []
    };
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw error;
  }
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.whatsapp !== undefined) updateData.whatsapp = updates.whatsapp;
    if (updates.instagram !== undefined) updateData.instagram = updates.instagram;
    if (updates.style !== undefined) updateData.style = updates.style;
    if (updates.references !== undefined) updateData.client_references = updates.references;
    if (updates.anamnese !== undefined) updateData.anamnese = updates.anamnese;
    if (updates.observations !== undefined) updateData.observations = updates.observations;
    if (updates.totalPaid !== undefined) updateData.total_paid = updates.totalPaid;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    
    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .eq('tattooerid', userId) // Garantir que só atualiza próprios clientes
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      whatsapp: data.whatsapp,
      instagram: data.instagram,
      style: data.style,
      references: data.client_references || [],
      anamnese: data.anamnese || {},
      observations: data.observations || '',
      totalPaid: parseFloat(data.total_paid || '0'),
      status: data.status,
      tags: data.tags || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      sessions: []
    };
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw error;
  }
}

export async function deleteClient(id: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('tattooerid', userId); // Garantir que só deleta próprios clientes
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    throw error;
  }
}

// ==================== SESSÕES ====================

export async function getSessions(): Promise<Session[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('tattooerid', userId)
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
  } catch (error) {
    console.error('Erro ao buscar sessões:', error);
    throw error;
  }
}

export async function createSession(session: Omit<Session, 'id'>): Promise<Session> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        client_id: session.clientId,
        tattooerid: userId,
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
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    throw error;
  }
}

export async function updateSession(id: string, updates: Partial<Session>): Promise<Session> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
    if (updates.date !== undefined) updateData.session_date = updates.date.toISOString();
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.value !== undefined) updateData.value = updates.value;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.photos !== undefined) updateData.photos = updates.photos;
    
    const { data, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', id)
      .eq('tattooerid', userId)
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
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error);
    throw error;
  }
}

// ==================== TRANSAÇÕES ====================

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('tattooerid', userId)
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
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    throw error;
  }
}

export async function createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        tattooerid: userId,
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
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    throw error;
  }
}

// ==================== METAS ====================

export async function getGoals(): Promise<Goal[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('tattooerid', userId)
      .order('month', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(goal => ({
      id: goal.id,
      tattooerId: goal.tattooerid,
      month: goal.month,
      target: parseFloat(goal.target),
      current: parseFloat(goal.current_value || '0'),
      percentage: parseFloat(goal.percentage || '0'),
      availableDays: 22, // Valor padrão - pode ser configurável
      createdAt: new Date(goal.created_at),
      updatedAt: new Date(goal.updated_at)
    })) || [];
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    throw error;
  }
}

export async function createOrUpdateGoal(goal: Omit<Goal, 'id'>): Promise<Goal> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('goals')
      .upsert({
        tattooerid: userId,
        month: goal.month,
        target: goal.target,
        current_value: goal.current,
        percentage: goal.percentage,
        updated_at: new Date().toISOString()
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
      percentage: parseFloat(data.percentage || '0'),
      availableDays: 22,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Erro ao criar/atualizar meta:', error);
    throw error;
  }
}

// ==================== CONFIGURAÇÕES DE TAXA ====================

export async function getTaxSettings(): Promise<TaxSettings | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');
    
    const { data, error } = await supabase
      .from('tax_settings')
      .select('*')
      .eq('tattooerid', userId)
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
      installmentRates: {
        twoInstallments: 4.0,
        threeInstallments: 4.5,
        fourInstallments: 5.0,
        fiveInstallments: 5.5,
        sixInstallments: 6.0,
        sevenInstallments: 6.5,
        eightInstallments: 7.0,
        nineInstallments: 7.5,
        tenInstallments: 8.0,
        elevenInstallments: 8.5,
        twelveInstallments: 9.0
      },
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Erro ao buscar configurações de taxa:', error);
    throw error;
  }
}

export async function createOrUpdateTaxSettings(settings: TaxSettings): Promise<TaxSettings> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('tax_settings')
      .upsert({
        tattooerid: userId,
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
      installmentRates: settings.installmentRates,
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Erro ao criar/atualizar configurações de taxa:', error);
    throw error;
  }
}

// ==================== COMANDAS ====================

export async function getComandas(): Promise<Comanda[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const { data: comandasData, error: comandasError } = await supabase
      .from('comandas')
      .select(`
        *,
        comanda_clients (
          *,
          comanda_payments (*)
        )
      `)
      .eq('tattooerid', userId)
      .order('comanda_date', { ascending: false });
    
    if (comandasError) throw comandasError;
    
    return comandasData?.map(comanda => ({
      id: comanda.id,
      date: new Date(comanda.comanda_date),
      tattooerId: comanda.tattooerid,
      openingValue: parseFloat(comanda.opening_value),
      closingValue: comanda.closing_value ? parseFloat(comanda.closing_value) : undefined,
      status: comanda.status,
      clients: comanda.comanda_clients?.map((client: any) => ({
        id: client.id,
        comandaId: client.comanda_id,
        clientId: client.client_id,
        clientName: client.client_name,
        sessionId: client.session_id,
        description: client.description,
        value: parseFloat(client.value),
        status: client.status,
        payments: client.comanda_payments?.map((payment: any) => ({
          id: payment.id,
          comandaClientId: payment.comanda_client_id,
          method: payment.method,
          grossValue: parseFloat(payment.gross_value),
          netValue: parseFloat(payment.net_value),
          fees: parseFloat(payment.fees),
          installments: payment.installments,
          feesPaidByClient: payment.fees_paid_by_client,
          createdAt: new Date(payment.created_at)
        })) || [],
        createdAt: new Date(client.created_at)
      })) || [],
      createdAt: new Date(comanda.created_at),
      updatedAt: new Date(comanda.updated_at)
    })) || [];
  } catch (error) {
    console.error('Erro ao buscar comandas:', error);
    throw error;
  }
}

export async function createComanda(comanda: Omit<Comanda, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comanda> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('comandas')
      .insert({
        tattooerid: userId,
        comanda_date: comanda.date.toISOString().split('T')[0], // Apenas a data
        opening_value: comanda.openingValue,
        closing_value: comanda.closingValue,
        status: comanda.status
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      date: new Date(data.comanda_date),
      tattooerId: data.tattooerid,
      openingValue: parseFloat(data.opening_value),
      closingValue: data.closing_value ? parseFloat(data.closing_value) : undefined,
      status: data.status,
      clients: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Erro ao criar comanda:', error);
    throw error;
  }
}

export async function createComandaClient(client: Omit<ComandaClient, 'id' | 'createdAt'>): Promise<ComandaClient> {
  try {
    const { data, error } = await supabase
      .from('comanda_clients')
      .insert({
        comanda_id: client.comandaId,
        client_id: client.clientId,
        client_name: client.clientName,
        session_id: client.sessionId,
        description: client.description,
        value: client.value,
        status: client.status
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      comandaId: data.comanda_id,
      clientId: data.client_id,
      clientName: data.client_name,
      sessionId: data.session_id,
      description: data.description,
      value: parseFloat(data.value),
      status: data.status,
      payments: [],
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Erro ao criar cliente da comanda:', error);
    throw error;
  }
}

export async function createComandaPayment(payment: Omit<ComandaPayment, 'id' | 'createdAt'>): Promise<ComandaPayment> {
  try {
    const { data, error } = await supabase
      .from('comanda_payments')
      .insert({
        comanda_client_id: payment.comandaClientId,
        method: payment.method,
        gross_value: payment.grossValue,
        net_value: payment.netValue,
        fees: payment.fees,
        installments: payment.installments,
        fees_paid_by_client: payment.feesPaidByClient
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      comandaClientId: data.comanda_client_id,
      method: data.method,
      grossValue: parseFloat(data.gross_value),
      netValue: parseFloat(data.net_value),
      fees: parseFloat(data.fees),
      installments: data.installments,
      feesPaidByClient: data.fees_paid_by_client,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Erro ao criar pagamento da comanda:', error);
    throw error;
  }
}

export async function updateComandaStatus(id: string, status: 'aberta' | 'fechada'): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('comandas')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('tattooerid', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar status da comanda:', error);
    throw error;
  }
}