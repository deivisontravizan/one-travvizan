import { supabase } from '@/lib/supabase';
import { Client, Session, Goal, Transaction, Comanda, ComandaClient, ComandaPayment, TaxSettings } from '@/lib/types';

// Função simples para formatar data
const formatDateForDatabase = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// CORREÇÃO: Função para converter string de data do banco para Date local
const parseLocalDate = (dateString: string): Date => {
  // Dividir a string de data em partes
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Criar Date local (sem conversão UTC)
  // month - 1 porque Date() usa meses de 0-11
  return new Date(year, month - 1, day);
};

// NOVA: Função para converter datetime do banco para Date local (para sessões)
const parseLocalDateTime = (dateTimeString: string): Date => {
  // Para sessões que têm timestamp completo, manter o horário mas garantir timezone local
  const date = new Date(dateTimeString);
  
  // Se a data parece estar em UTC, ajustar para local
  // Verificar se a diferença é exatamente o offset do timezone
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000; // em milliseconds
  
  // Retornar a data ajustada se necessário
  return new Date(date.getTime() + timezoneOffset);
};

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

    // Validações
    if (!clientData.name?.trim()) {
      throw new Error('Nome do cliente é obrigatório');
    }
    if (!clientData.whatsapp?.trim()) {
      throw new Error('WhatsApp do cliente é obrigatório');
    }
    if (!clientData.style?.trim()) {
      throw new Error('Estilo é obrigatório');
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
    if (!id) {
      throw new Error('ID do cliente é obrigatório');
    }

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
      date: new Date(session.session_date), // ✅ CORREÇÃO: Manter como está pois sessões precisam do horário
      duration: session.duration,
      value: session.value,
      totalValue: session.total_value,
      signalValue: session.signal_value,
      pendingValue: session.pending_value,
      status: session.status,
      description: session.description,
      photos: session.photos || [],
      referenceImages: session.reference_images || []
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

    // Validações robustas
    if (!sessionData.clientId) {
      throw new Error('Cliente é obrigatório');
    }
    if (!sessionData.description?.trim()) {
      throw new Error('Descrição da sessão é obrigatória');
    }
    if (!sessionData.value || sessionData.value <= 0) {
      throw new Error('Valor da sessão deve ser maior que zero');
    }
    if (!sessionData.duration || sessionData.duration <= 0) {
      throw new Error('Duração da sessão deve ser maior que zero');
    }

    // ✅ CORREÇÃO CRÍTICA: Log de debug para verificar dados recebidos
    console.log('🔍 DEBUG - createSession recebeu:', {
      signalValue: sessionData.signalValue,
      totalValue: sessionData.totalValue,
      value: sessionData.value,
      date: sessionData.date,
      clientId: sessionData.clientId
    });

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        client_id: sessionData.clientId,
        tattooerid: user.id,
        session_date: sessionData.date.toISOString(),
        duration: sessionData.duration,
        value: sessionData.value,
        total_value: sessionData.totalValue,
        signal_value: sessionData.signalValue,
        pending_value: sessionData.pendingValue,
        status: sessionData.status,
        description: sessionData.description,
        photos: sessionData.photos || [],
        reference_images: sessionData.referenceImages || []
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar sessão:', error);
      throw error;
    }

    const newSession = {
      id: data.id,
      clientId: data.client_id,
      tattooerId: data.tattooerid,
      date: new Date(data.session_date),
      duration: data.duration,
      value: data.value,
      totalValue: data.total_value,
      signalValue: data.signal_value,
      pendingValue: data.pending_value,
      status: data.status,
      description: data.description,
      photos: data.photos || [],
      referenceImages: data.reference_images || []
    };

    // ✅ CORREÇÃO CRÍTICA: Usar sessionData.signalValue (que já vem parseado) em vez de string
    // INTEGRAÇÃO AGENDA → COMANDAS: Se há sinal, criar entrada automática na comanda
    if (sessionData.signalValue && sessionData.signalValue > 0) {
      try {
        console.log('✅ Sessão com sinal detectada, integrando com comanda...', {
          signalValue: sessionData.signalValue,
          condicaoAtendida: true
        });
        
        // Buscar cliente para obter o nome
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('name')
          .eq('id', sessionData.clientId)
          .single();

        if (clientError) {
          console.error('Erro ao buscar dados do cliente:', clientError);
          throw new Error('Cliente não encontrado');
        }

        const clientName = clientData?.name || 'Cliente não encontrado';
        const sessionDate = new Date(sessionData.date);
        const dateString = formatDateForDatabase(sessionDate);

        console.log('📅 Data formatada para busca de comanda:', {
          sessionDate: sessionDate,
          dateString: dateString,
          sessionDateString: sessionDate.toLocaleDateString('pt-BR')
        });

        // Verificar se existe comanda aberta para o dia
        const { data: existingComanda } = await supabase
          .from('comandas')
          .select('*')
          .eq('tattooerid', user.id)
          .eq('comanda_date', dateString)
          .eq('status', 'aberta')
          .single();

        let comandaId = existingComanda?.id;

        // Se não existe comanda aberta, criar uma nova
        if (!existingComanda) {
          console.log('🆕 Criando nova comanda para o dia:', dateString);
          const { data: newComanda, error: comandaError } = await supabase
            .from('comandas')
            .insert({
              tattooerid: user.id,
              comanda_date: dateString,
              opening_value: 0,
              status: 'aberta'
            })
            .select()
            .single();

          if (comandaError) {
            console.error('Erro ao criar comanda automática:', comandaError);
            throw new Error('Erro ao criar comanda automática');
          } else {
            comandaId = newComanda.id;
            console.log('✅ Nova comanda criada:', comandaId);
          }
        } else {
          console.log('📋 Comanda existente encontrada:', existingComanda.id);
        }

        // Verificar se cliente já existe na comanda para evitar duplicatas
        if (comandaId) {
          const { data: existingClient } = await supabase
            .from('comanda_clients')
            .select('id')
            .eq('comanda_id', comandaId)
            .eq('session_id', newSession.id)
            .single();

          if (!existingClient) {
            console.log('👤 Adicionando cliente à comanda:', comandaId);
            const { error: clientError } = await supabase
              .from('comanda_clients')
              .insert({
                comanda_id: comandaId,
                client_id: sessionData.clientId,
                client_name: clientName,
                session_id: newSession.id,
                description: `Sinal - ${sessionData.description}`,
                value: sessionData.signalValue,
                status: 'pendente'
              });

            if (clientError) {
              console.error('Erro ao adicionar cliente à comanda:', clientError);
              throw new Error('Erro ao adicionar cliente à comanda');
            } else {
              console.log('✅ Cliente adicionado à comanda com sucesso');
            }
          } else {
            console.log('⚠️ Cliente já existe na comanda, pulando duplicata');
          }
        }

        // ✅ NOVA FUNCIONALIDADE: INTEGRAÇÃO AGENDA → FINANCEIRO
        // Criar transação automática para o sinal
        try {
          console.log('💰 Criando transação automática para o sinal...');
          
          const transactionDescription = `Sinal - ${clientName} - ${sessionData.description}`;
          
          const { error: transactionError } = await supabase
            .from('transactions')
            .insert({
              tattooerid: user.id,
              type: 'receita',
              description: transactionDescription,
              value: sessionData.signalValue,
              transaction_date: sessionData.date.toISOString(),
              category: 'Sinal',
              session_id: newSession.id,
              payment_method: 'dinheiro', // Padrão para sinais
              gross_value: sessionData.signalValue,
              fees: 0,
              installments: 1
            });

          if (transactionError) {
            console.error('Erro ao criar transação automática do sinal:', transactionError);
            throw new Error('Erro ao criar transação automática do sinal');
          } else {
            console.log('✅ Transação automática do sinal criada com sucesso');
          }
        } catch (financialError) {
          console.error('Erro na integração Agenda → Financeiro:', financialError);
          // Não falhar a criação da sessão por causa da integração financeira
          console.warn('Sessão e comanda criadas, mas integração financeira falhou');
        }

      } catch (integrationError) {
        console.error('Erro na integração Agenda → Comandas:', integrationError);
        // Não falhar a criação da sessão por causa da integração
        console.warn('Sessão criada, mas integração com comanda falhou');
      }
    } else {
      console.log('ℹ️ Sessão sem sinal ou sinal = 0, pulando integração automática', {
        signalValue: sessionData.signalValue,
        condicaoAtendida: false
      });
    }

    return newSession;
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    throw error;
  }
}

export async function updateSession(id: string, updates: Partial<Session>): Promise<Session> {
  try {
    if (!id) {
      throw new Error('ID da sessão é obrigatório');
    }

    const updateData: any = {};
    
    if (updates.date) updateData.session_date = updates.date.toISOString();
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.value !== undefined) updateData.value = updates.value;
    if (updates.totalValue !== undefined) updateData.total_value = updates.totalValue;
    if (updates.signalValue !== undefined) updateData.signal_value = updates.signalValue;
    if (updates.pendingValue !== undefined) updateData.pending_value = updates.pendingValue;
    if (updates.status) updateData.status = updates.status;
    if (updates.description) updateData.description = updates.description;
    if (updates.photos) updateData.photos = updates.photos;
    if (updates.referenceImages) updateData.reference_images = updates.referenceImages;

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
      totalValue: data.total_value,
      signalValue: data.signal_value,
      pendingValue: data.pending_value,
      status: data.status,
      description: data.description,
      photos: data.photos || [],
      referenceImages: data.reference_images || []
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

    // Validações
    if (!transactionData.description?.trim()) {
      throw new Error('Descrição da transação é obrigatória');
    }
    if (!transactionData.value || transactionData.value <= 0) {
      throw new Error('Valor da transação deve ser maior que zero');
    }
    if (!transactionData.category?.trim()) {
      throw new Error('Categoria da transação é obrigatória');
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

    // Validações
    if (!goalData.month?.trim()) {
      throw new Error('Mês da meta é obrigatório');
    }
    if (!goalData.target || goalData.target <= 0) {
      throw new Error('Valor da meta deve ser maior que zero');
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

    // Validações
    if (settings.creditCardCashRate < 0 || settings.creditCardCashRate > 100) {
      throw new Error('Taxa de cartão de crédito à vista deve estar entre 0% e 100%');
    }
    if (settings.debitCardRate < 0 || settings.debitCardRate > 100) {
      throw new Error('Taxa de cartão de débito deve estar entre 0% e 100%');
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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    console.log('Carregando comandas para usuário:', user.id);

    // Buscar apenas comandas do usuário logado
    const { data: comandasData, error: comandasError } = await supabase
      .from('comandas')
      .select('*')
      .eq('tattooerid', user.id)
      .order('comanda_date', { ascending: false });

    if (comandasError) {
      console.error('Erro ao buscar comandas:', comandasError);
      throw comandasError;
    }

    console.log(`Encontradas ${comandasData?.length || 0} comandas`);

    // Para cada comanda, buscar os clientes relacionados (já filtrados por RLS)
    const comandasWithClients = await Promise.all(
      (comandasData || []).map(async (comanda) => {
        console.log(`Carregando clientes para comanda ${comanda.id}`);
        
        // Buscar clientes da comanda (RLS garante que só vem do usuário correto)
        const { data: clientsData, error: clientsError } = await supabase
          .from('comanda_clients')
          .select('*')
          .eq('comanda_id', comanda.id)
          .order('created_at', { ascending: true });

        if (clientsError) {
          console.error('Erro ao buscar cl ientes da comanda:', clientsError);
          // Continuar sem os clientes em caso de erro
        }

        console.log(`Encontrados ${clientsData?.length || 0} clientes para comanda ${comanda.id}`);

        // Para cada cliente da comanda, buscar os pagamentos (já filtrados por RLS)
        const clientsWithPayments = await Promise.all(
          (clientsData || []).map(async (client) => {
            console.log(`Carregando pagamentos para cliente ${client.id}`);
            
            const { data: paymentsData, error: paymentsError } = await supabase
              .from('comanda_payments')
              .select('*')
              .eq('comanda_client_id', client.id)
              .order('created_at', { ascending: true });

            if (paymentsError) {
              console.error('Erro ao buscar pagamentos do cliente da comanda:', paymentsError);
              // Continuar sem os pagamentos em caso de erro
            }

            console.log(`Encontrados ${paymentsData?.length || 0} pagamentos para cliente ${client.id}`);

            const payments = (paymentsData || []).map(payment => ({
              id: payment.id,
              comandaClientId: payment.comanda_client_id,
              method: payment.method,
              grossValue: payment.gross_value,
              netValue: payment.net_value,
              fees: payment.fees,
              installments: payment.installments,
              feesPaidByClient: payment.fees_paid_by_client,
              createdAt: new Date(payment.created_at)
            }));

            return {
              id: client.id,
              comandaId: client.comanda_id,
              clientId: client.client_id,
              clientName: client.client_name,
              sessionId: client.session_id,
              description: client.description,
              value: client.value,
              status: client.status,
              payments: payments, // Obrigatório: múltiplos pagamentos
              createdAt: new Date(client.created_at)
            };
          })
        );

        // CORREÇÃO CRÍTICA: Usar parseLocalDate para manter timezone local
        console.log('Data original do banco:', comanda.comanda_date);
        const localDate = parseLocalDate(comanda.comanda_date);
        
        console.log('Data convertida para local:', localDate.toLocaleDateString('pt-BR'));

        return {
          id: comanda.id,
          date: localDate, // ✅ CORREÇÃO: Usar parseLocalDate em vez de new Date()
          tattooerId: comanda.tattooerid,
          openingValue: comanda.opening_value,
          closingValue: comanda.closing_value,
          status: comanda.status,
          clients: clientsWithPayments,
          createdAt: new Date(comanda.created_at),
          updatedAt: new Date(comanda.updated_at)
        };
      })
    );

    console.log('Comandas carregadas com sucesso:', comandasWithClients.length);
    return comandasWithClients;
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

    // Validações
    if (!comandaData.date) {
      throw new Error('Data da comanda é obrigatória');
    }
    if (comandaData.openingValue < 0) {
      throw new Error('Valor de abertura não pode ser negativo');
    }

    const dateForDB = formatDateForDatabase(comandaData.date);
    
    console.log('Criando comanda no banco:', {
      originalDate: comandaData.date,
      formattedDate: dateForDB,
      dateString: comandaData.date.toLocaleDateString('pt-BR')
    });

    const { data, error } = await supabase
      .from('comandas')
      .insert({
        tattooerid: user.id,
        comanda_date: dateForDB,
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

    console.log('Comanda criada com sucesso:', {
      id: data.id,
      date: data.comanda_date,
      originalDate: comandaData.date.toLocaleDateString('pt-BR')
    });

    // CORREÇÃO CRÍTICA: Usar parseLocalDate na resposta também
    return {
      id: data.id,
      date: parseLocalDate(data.comanda_date), // ✅ CORREÇÃO: Usar parseLocalDate
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
    // Validações
    if (!clientData.comandaId) {
      throw new Error('ID da comanda é obrigatório');
    }
    if (!clientData.clientName?.trim()) {
      throw new Error('Nome do cliente é obrigatório');
    }
    if (!clientData.description?.trim()) {
      throw new Error('Descrição do serviço é obrigatória');
    }
    if (!clientData.value || clientData.value <= 0) {
      throw new Error('Valor do serviço deve ser maior que zero');
    }

    // Verificar se a comanda pertence ao usuário (ownership)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data: comandaOwnership } = await supabase
      .from('comandas')
      .select('tattooerid')
      .eq('id', clientData.comandaId)
      .single();

    if (!comandaOwnership || comandaOwnership.tattooerid !== user.id) {
      throw new Error('Acesso negado: comanda não pertence ao usuário');
    }

    const { data, error } = await supabase
      .from('comanda_clients')
      .insert({
        comanda_id: clientData.comandaId,
        client_id: clientData.clientId,
        client_name: clientData.clientName,
        session_id: clientData.sessionId,
        description: clientData.description,
        value: clientData.value,
        status: clientData.status
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar cliente da comanda:', error);
      throw error;
    }

    return {
      id: data.id,
      comandaId: data.comanda_id,
      clientId: data.client_id,
      clientName: data.client_name,
      sessionId: data.session_id,
      description: data.description,
      value: data.value,
      status: data.status,
      payments: [], // Inicializar array vazio
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Erro ao criar cliente da comanda:', error);
    throw error;
  }
}

export async function createComandaPayment(paymentData: Omit<ComandaPayment, 'id' | 'createdAt'>): Promise<ComandaPayment> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Validações robustas
    if (!paymentData.comandaClientId) {
      throw new Error('ID do cliente da comanda é obrigatório');
    }
    if (!paymentData.method) {
      throw new Error('Método de pagamento é obrigatório');
    }
    if (!paymentData.grossValue || paymentData.grossValue <= 0) {
      throw new Error('Valor bruto deve ser maior que zero');
    }
    if (!paymentData.netValue || paymentData.netValue <= 0) {
      throw new Error('Valor líquido deve ser maior que zero');
    }

    // CORREÇÃO: Verificar ownership através do cliente da comanda com tipagem correta
    const { data: ownershipCheck } = await supabase
      .from('comanda_clients')
      .select(`
        id,
        value,
        comandas!inner(tattooerid)
      `)
      .eq('id', paymentData.comandaClientId)
      .single();

    // CORREÇÃO: Acessar tattooerid corretamente
    if (!ownershipCheck || (ownershipCheck.comandas as any).tattooerid !== user.id) {
      throw new Error('Acesso negado: cliente da comanda não pertence ao usuário');
    }

    const { data, error } = await supabase
      .from('comanda_payments')
      .insert({
        comanda_client_id: paymentData.comandaClientId,
        method: paymentData.method,
        gross_value: paymentData.grossValue,
        net_value: paymentData.netValue,
        fees: paymentData.fees,
        installments: paymentData.installments,
        fees_paid_by_client: paymentData.feesPaidByClient
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar pagamento da comanda:', error);
      throw error;
    }

    const newPayment = {
      id: data.id,
      comandaClientId: data.comanda_client_id,
      method: data.method,
      grossValue: data.gross_value,
      netValue: data.net_value,
      fees: data.fees,
      installments: data.installments,
      feesPaidByClient: data.fees_paid_by_client,
      createdAt: new Date(data.created_at)
    };

    // INTEGRAÇÃO COMANDAS → TRANSAÇÕES: Criar transação automática
    try {
      console.log('Pagamento da comanda criado, gerando transação automática...');
      
      // Buscar dados da comanda para obter informações adicionais
      const { data: comandaClientData, error: clientDataError } = await supabase
        .from('comanda_clients')
        .select('client_name, description, comanda_id')
        .eq('id', paymentData.comandaClientId)
        .single();

      if (clientDataError) {
        throw new Error('Erro ao buscar dados do cliente da comanda');
      }

      if (comandaClientData) {
        const transactionDescription = `Comanda - ${comandaClientData.client_name} - ${comandaClientData.description}`;
        
        // Criar transação automática
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            tattooerid: user.id,
            type: 'receita',
            description: transactionDescription,
            value: paymentData.netValue, // Usar valor líquido
            transaction_date: new Date().toISOString(),
            category: 'Comanda',
            comanda_id: comandaClientData.comanda_id,
            payment_method: paymentData.method,
            gross_value: paymentData.grossValue,
            fees: paymentData.fees,
            installments: paymentData.installments
          });

        if (transactionError) {
          console.error('Erro ao criar transação automática:', transactionError);
          throw new Error('Erro ao criar transação automática');
        } else {
          console.log('Transação automática criada com sucesso');
        }

        // ATUALIZAR STATUS DO CLIENTE AUTOMATICAMENTE
        try {
          // Buscar todos os pagamentos do cliente para calcular total pago
          const { data: allPayments } = await supabase
            .from('comanda_payments')
            .select('net_value')
            .eq('comanda_client_id', paymentData.comandaClientId);

          const totalPaid = (allPayments || []).reduce((sum, payment) => sum + payment.net_value, 0);
          const clientValue = ownershipCheck.value;
          
          // Determinar novo status baseado no valor pago
          const newStatus = totalPaid >= clientValue ? 'finalizado' : 'pendente';
          
          // Atualizar status do cliente
          const { error: statusError } = await supabase
            .from('comanda_clients')
            .update({ status: newStatus })
            .eq('id', paymentData.comandaClientId);

          if (statusError) {
            console.error('Erro ao atualizar status do cliente:', statusError);
          } else {
            console.log(`Status do cliente atualizado para: ${newStatus}`);
          }
        } catch (statusError) {
          console.error('Erro ao calcular/atualizar status do cliente:', statusError);
        }
      }
    } catch (integrationError) {
      console.error('Erro na integração Comandas → Transações:', integrationError);
      // Não falhar a criação do pagamento por causa da integração
      console.warn('Pagamento criado, mas integração com transações falhou');
    }

    return newPayment;
  } catch (error) {
    console.error('Erro ao criar pagamento da comanda:', error);
    throw error;
  }
}

export async function updateComandaStatus(comandaId: string, status: 'aberta' | 'fechada'): Promise<void> {
  try {
    if (!comandaId) {
      throw new Error('ID da comanda é obrigatório');
    }

    // Verificar ownership
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data: ownershipCheck } = await supabase
      .from('comandas')
      .select('tattooerid')
      .eq('id', comandaId)
      .single();

    if (!ownershipCheck || ownershipCheck.tattooerid !== user.id) {
      throw new Error('Acesso negado: comanda não pertence ao usuário');
    }

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

// Função auxiliar para buscar clientes de uma comanda específica
export async function getComandaClients(comandaId: string): Promise<ComandaClient[]> {
  try {
    if (!comandaId) {
      throw new Error('ID da comanda é obrigatório');
    }

    const { data, error } = await supabase
      .from('comanda_clients')
      .select('*')
      .eq('comanda_id', comandaId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar clientes da comanda:', error);
      throw error;
    }

    return (data || []).map(client => ({
      id: client.id,
      comandaId: client.comanda_id,
      clientId: client.client_id,
      clientName: client.client_name,
      sessionId: client.session_id,
      description: client.description,
      value: client.value,
      status: client.status,
      payments: [], // Será preenchido por outra função se necessário
      createdAt: new Date(client.created_at)
    }));
  } catch (error) {
    console.error('Erro ao buscar clientes da comanda:', error);
    return [];
  }
}

// Função auxiliar para buscar pagamentos de um cliente da comanda
export async function getComandaPayments(comandaClientId: string): Promise<ComandaPayment[]> {
  try {
    if (!comandaClientId) {
      throw new Error('ID do cliente da comanda é obrigatório');
    }

    const { data, error } = await supabase
      .from('comanda_payments')
      .select('*')
      .eq('comanda_client_id', comandaClientId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar pagamentos do cliente da comanda:', error);
      throw error;
    }

    return (data || []).map(payment => ({
      id: payment.id,
      comandaClientId: payment.comanda_client_id,
      method: payment.method,
      grossValue: payment.gross_value,
      netValue: payment.net_value,
      fees: payment.fees,
      installments: payment.installments,
      feesPaidByClient: payment.fees_paid_by_client,
      createdAt: new Date(payment.created_at)
    }));
  } catch (error) {
    console.error('Erro ao buscar pagamentos do cliente da comanda:', error);
    return [];
  }
}