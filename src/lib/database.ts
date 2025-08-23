import { supabase } from '@/lib/supabase';
import { Client, Session, Goal, Transaction, Comanda, ComandaClient, ComandaPayment, TaxSettings } from '@/lib/types';

// Funções para Clientes
export async function getClients(): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }

    return (data || []).map(client => ({
      id: client.id,
      name: client.name,
      whatsapp: client.whatsapp,
      instagram: client.instagram || '',
      style: client.style,
      references: client.client_references || [],
      anamnese: client.anamnese || {},
      observations: client.observations || '',
      sessions: [],
      totalPaid: client.total_paid || 0,
      status: client.status,
      tags: client.tags || [],
      createdAt: new Date(client.created_at),
      updatedAt: new Date(client.updated_at),
      weekMovements: []
    }));
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
}

export async function createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'sessions'>): Promise<Client> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({
        tattooerid: user.id,
        name: clientData.name,
        whatsapp: clientData.whatsapp,
        instagram: clientData.instagram || null,
        style: clientData.style,
        client_references: clientData.references || [],
        anamnese: clientData.anamnese || {},
        observations: clientData.observations || '',
        total_paid: clientData.totalPaid || 0,
        status: clientData.status,
        tags: clientData.tags || []
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      whatsapp: data.whatsapp,
      instagram: data.instagram || '',
      style: data.style,
      references: data.client_references || [],
      anamnese: data.anamnese || {},
      observations: data.observations || '',
      sessions: [],
      totalPaid: data.total_paid || 0,
      status: data.status,
      tags: data.tags || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      weekMovements: []
    };
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw error;
  }
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  try {
    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.whatsapp) updateData.whatsapp = updates.whatsapp;
    if (updates.instagram !== undefined) updateData.instagram = updates.instagram;
    if (updates.style) updateData.style = updates.style;
    if (updates.references) updateData.client_references = updates.references;
    if (updates.anamnese) updateData.anamnese = updates.anamnese;
    if (updates.observations !== undefined) updateData.observations = updates.observations;
    if (updates.totalPaid !== undefined) updateData.total_paid = updates.totalPaid;
    if (updates.status) updateData.status = updates.status;
    if (updates.tags) updateData.tags = updates.tags;

    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      whatsapp: data.whatsapp,
      instagram: data.instagram || '',
      style: data.style,
      references: data.client_references || [],
      anamnese: data.anamnese || {},
      observations: data.observations || '',
      sessions: [],
      totalPaid: data.total_paid || 0,
      status: data.status,
      tags: data.tags || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      weekMovements: []
    };
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw error;
  }
}

// Funções para Sessões
export async function getSessions(): Promise<Session[]> {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('session_date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar sessões:', error);
      throw error;
    }

    return (data || []).map(session => ({
      id: session.id,
      clientId: session.client_id,
      tattooerId: session.tattooerid,
      date: new Date(session.session_date),
      duration: session.duration,
      value: session.value,
      status: session.status,
      description: session.description,
      photos: session.photos || []
    }));
  } catch (error) {
    console.error('Erro ao buscar sessões:', error);
    return [];
  }
}

export async function createSession(sessionData: Omit<Session, 'id'>): Promise<Session> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        client_id: sessionData.clientId,
        tattooerid: user.id,
        session_date: sessionData.date.toISOString(),
        duration: sessionData.duration,
        value: sessionData.value,
        status: sessionData.status,
        description: sessionData.description,
        photos: sessionData.photos || []
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar sessão:', error);
      throw error;
    }

    return {
      id: data.id,
      clientId: data.client_id,
      tattooerId: data.tattooerid,
      date: new Date(data.session_date),
      duration: data.duration,
      value: data.value,
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
    const updateData: any = {};
    
    if (updates.date) updateData.session_date = updates.date.toISOString();
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.value !== undefined) updateData.value = updates.value;
    if (updates.status) updateData.status = updates.status;
    if (updates.description) updateData.description = updates.description;
    if (updates.photos) updateData.photos = updates.photos;

    const { data, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar sessão:', error);
      throw error;
    }

    return {
      id: data.id,
      clientId: data.client_id,
      tattooerId: data.tattooerid,
      date: new Date(data.session_date),
      duration: data.duration,
      value: data.value,
      status: data.status,
      description: data.description,
      photos: data.photos || []
    };
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error);
    throw error;
  }
}

// Funções para Transações
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar transações:', error);
      throw error;
    }

    return (data || []).map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      description: transaction.description,
      value: transaction.value,
      date: new Date(transaction.transaction_date),
      category: transaction.category,
      tattooerId: transaction.tattooerid,
      sessionId: transaction.session_id,
      comandaId: transaction.comanda_id,
      paymentMethod: transaction.payment_method,
      grossValue: transaction.gross_value,
      fees: transaction.fees,
      installments: transaction.installments
    }));
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return [];
  }
}

export async function createTransaction(transactionData: Omit<Transaction, 'id'>): Promise<Transaction> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        tattooerid: user.id,
        type: transactionData.type,
        description: transactionData.description,
        value: transactionData.value,
        transaction_date: transactionData.date.toISOString(),
        category: transactionData.category,
        session_id: transactionData.sessionId,
        comanda_id: transactionData.comandaId,
        payment_method: transactionData.paymentMethod,
        gross_value: transactionData.grossValue,
        fees: transactionData.fees,
        installments: transactionData.installments
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar transação:', error);
      throw error;
    }

    return {
      id: data.id,
      type: data.type,
      description: data.description,
      value: data.value,
      date: new Date(data.transaction_date),
      category: data.category,
      tattooerId: data.tattooerid,
      sessionId: data.session_id,
      comandaId: data.comanda_id,
      paymentMethod: data.payment_method,
      grossValue: data.gross_value,
      fees: data.fees,
      installments: data.installments
    };
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    throw error;
  }
}

// Funções para Metas
export async function getGoals(): Promise<Goal[]> {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar metas:', error);
      throw error;
    }

    return (data || []).map(goal => ({
      id: goal.id,
      tattooerId: goal.tattooerid,
      month: goal.month,
      target: goal.target,
      current: goal.current_value,
      percentage: goal.percentage,
      availableDays: 22,
      createdAt: new Date(goal.created_at),
      updatedAt: new Date(goal.updated_at)
    }));
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    return [];
  }
}

export async function createOrUpdateGoal(goalData: Omit<Goal, 'id'>): Promise<Goal> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se já existe uma meta para o mês
    const { data: existingGoal } = await supabase
      .from('goals')
      .select('*')
      .eq('tattooerid', user.id)
      .eq('month', goalData.month)
      .single();

    let data, error;

    if (existingGoal) {
      // Atualizar meta existente
      ({ data, error } = await supabase
        .from('goals')
        .update({
          target: goalData.target,
          current_value: goalData.current,
          percentage: goalData.percentage
        })
        .eq('id', existingGoal.id)
        .select()
        .single());
    } else {
      // Criar nova meta
      ({ data, error } = await supabase
        .from('goals')
        .insert({
          tattooerid: user.id,
          month: goalData.month,
          target: goalData.target,
          current_value: goalData.current,
          percentage: goalData.percentage
        })
        .select()
        .single());
    }

    if (error) {
      console.error('Erro ao salvar meta:', error);
      throw error;
    }

    return {
      id: data.id,
      tattooerId: data.tattooerid,
      month: data.month,
      target: data.target,
      current: data.current_value,
      percentage: data.percentage,
      availableDays: 22,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Erro ao salvar meta:', error);
    throw error;
  }
}

// Funções para Configurações de Taxa
export async function getTaxSettings(): Promise<TaxSettings | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('tax_settings')
      .select('*')
      .eq('tattooerid', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar configurações de taxa:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      tattooerId: data.tattooerid,
      creditCardCashRate: data.credit_card_cash_rate,
      creditCardInstallmentRate: data.credit_card_installment_rate,
      debitCardRate: data.debit_card_rate,
      pixRate: data.pix_rate,
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
    return null;
  }
}

export async function createOrUpdateTaxSettings(settings: TaxSettings): Promise<TaxSettings> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se já existem configurações
    const { data: existingSettings } = await supabase
      .from('tax_settings')
      .select('*')
      .eq('tattooerid', user.id)
      .single();

    let data, error;

    if (existingSettings) {
      // Atualizar configurações existentes
      ({ data, error } = await supabase
        .from('tax_settings')
        .update({
          credit_card_cash_rate: settings.creditCardCashRate,
          credit_card_installment_rate: settings.creditCardInstallmentRate,
          debit_card_rate: settings.debitCardRate,
          pix_rate: settings.pixRate
        })
        .eq('id', existingSettings.id)
        .select()
        .single());
    } else {
      // Criar novas configurações
      ({ data, error } = await supabase
        .from('tax_settings')
        .insert({
          tattooerid: user.id,
          credit_card_cash_rate: settings.creditCardCashRate,
          credit_card_installment_rate: settings.creditCardInstallmentRate,
          debit_card_rate: settings.debitCardRate,
          pix_rate: settings.pixRate
        })
        .select()
        .single());
    }

    if (error) {
      console.error('Erro ao salvar configurações de taxa:', error);
      throw error;
    }

    return {
      id: data.id,
      tattooerId: data.tattooerid,
      creditCardCashRate: data.credit_card_cash_rate,
      creditCardInstallmentRate: data.credit_card_installment_rate,
      debitCardRate: data.debit_card_rate,
      pixRate: data.pix_rate,
      installmentRates: settings.installmentRates,
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Erro ao salvar configurações de taxa:', error);
    throw error;
  }
}

// Funções para Comandas
export async function getComandas(): Promise<Comanda[]> {
  try {
    const { data, error } = await supabase
      .from('comandas')
      .select('*')
      .order('comanda_date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar comandas:', error);
      throw error;
    }

    return (data || []).map(comanda => ({
      id: comanda.id,
      date: new Date(comanda.comanda_date),
      tattooerId: comanda.tattooerid,
      openingValue: comanda.opening_value,
      closingValue: comanda.closing_value,
      status: comanda.status,
      clients: [],
      createdAt: new Date(comanda.created_at),
      updatedAt: new Date(comanda.updated_at)
    }));
  } catch (error) {
    console.error('Erro ao buscar comandas:', error);
    return [];
  }
}

export async function createComanda(comandaData: Omit<Comanda, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comanda> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('comandas')
      .insert({
        tattooerid: user.id,
        comanda_date: comandaData.date.toISOString().split('T')[0],
        opening_value: comandaData.openingValue,
        closing_value: comandaData.closingValue,
        status: comandaData.status
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar comanda:', error);
      throw error;
    }

    return {
      id: data.id,
      date: new Date(data.comanda_date),
      tattooerId: data.tattooerid,
      openingValue: data.opening_value,
      closingValue: data.closing_value,
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

export async function createComandaClient(clientData: Omit<ComandaClient, 'id' | 'createdAt'>): Promise<ComandaClient> {
  try {
    // Implementação placeholder - precisa ser implementada quando a tabela for criada
    throw new Error('Função não implementada - tabela comanda_clients não existe');
  } catch (error) {
    console.error('Erro ao criar cliente da comanda:', error);
    throw error;
  }
}

export async function createComandaPayment(paymentData: Omit<ComandaPayment, 'id' | 'createdAt'>): Promise<ComandaPayment> {
  try {
    // Implementação placeholder - precisa ser implementada quando a tabela for criada
    throw new Error('Função não implementada - tabela comanda_payments não existe');
  } catch (error) {
    console.error('Erro ao criar pagamento da comanda:', error);
    throw error;
  }
}

export async function updateComandaStatus(comandaId: string, status: 'aberta' | 'fechada'): Promise<void> {
  try {
    const { error } = await supabase
      .from('comandas')
      .update({ status })
      .eq('id', comandaId);

    if (error) {
      console.error('Erro ao atualizar status da comanda:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao atualizar status da comanda:', error);
    throw error;
  }
}