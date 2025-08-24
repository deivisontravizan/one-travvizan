"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Client, Session, Goal, Transaction, Comanda, ComandaClient, ComandaPayment, TaxSettings, ClientWeekMovement } from '@/lib/types';
import { getCurrentWeekPeriod, getISOWeek, getISOWeekYear } from '@/lib/week-utils';
import { useAuth } from '@/contexts/auth-context';
import { 
  getClients, 
  createClient, 
  updateClient,
  getSessions,
  createSession,
  updateSession,
  getTransactions,
  createTransaction,
  getGoals,
  createOrUpdateGoal,
  getTaxSettings,
  createOrUpdateTaxSettings,
  getComandas,
  createComanda,
  createComandaClient,
  createComandaPayment,
  updateComandaStatus
} from '@/lib/database';

interface AppContextType {
  clients: Client[];
  setClients: (clients: Client[]) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'sessions'>) => Promise<void>;
  updateClientData: (id: string, updates: Partial<Client>) => Promise<void>;
  updateClientStatus: (id: string, newStatus: Client['status']) => Promise<void>;
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Omit<Session, 'id'>) => Promise<void>;
  updateSessionData: (id: string, updates: Partial<Session>) => Promise<void>;
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  updateGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  comandas: Comanda[];
  setComandasState: (comandas: Comanda[]) => void;
  addComanda: (comanda: Omit<Comanda, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  addComandaClient: (client: Omit<ComandaClient, 'id' | 'createdAt'>) => Promise<void>;
  addComandaPayment: (payment: Omit<ComandaPayment, 'id' | 'createdAt'>) => Promise<void>;
  reopenComanda: (comandaId: string) => Promise<void>;
  closeComanda: (comandaId: string) => Promise<void>;
  taxSettings: TaxSettings | null;
  setTaxSettings: (settings: TaxSettings) => void;
  updateTaxSettings: (settings: TaxSettings) => Promise<void>;
  currentView: string;
  setCurrentView: (view: string) => void;
  loading: boolean;
  refreshData: () => Promise<void>;
  // Funções para movimentações semanais
  getClientsByPeriod: (year: number, month?: number, weekISO?: number) => Client[];
  addWeekMovement: (clientId: string, newStatus: Client['status'], previousStatus?: Client['status']) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [comandas, setComandasState] = useState<Comanda[]>([]);
  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Carregar dados do banco quando usuário estiver autenticado
  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Carregando dados para usuário:', user.email);
      
      const [clientsData, sessionsData, goalsData, transactionsData, taxSettingsData, comandasData] = await Promise.all([
        getClients(),
        getSessions(),
        getGoals(),
        getTransactions(),
        getTaxSettings(),
        getComandas() // Usar função do database.ts que já tem toda a lógica
      ]);

      console.log('Dados carregados:', {
        clients: clientsData.length,
        sessions: sessionsData.length,
        goals: goalsData.length,
        transactions: transactionsData.length,
        comandas: comandasData.length
      });

      setClients(clientsData);
      setSessions(sessionsData);
      
      // Garantir que as metas tenham todos os campos obrigatórios
      const goalsWithDefaults: Goal[] = goalsData.map((goal: any) => ({
        id: goal.id,
        tattooerId: goal.tattooerId,
        month: goal.month,
        target: goal.target,
        current: goal.current,
        percentage: goal.percentage,
        availableDays: goal.availableDays || 22,
        desiredTicketAverage: goal.desiredTicketAverage,
        expectedConversion: goal.expectedConversion,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt
      }));
      setGoals(goalsWithDefaults);
      
      setTransactions(transactionsData);
      setComandasState(comandasData); // Usar dados já processados do database.ts
      
      // Configurar taxSettings com estrutura completa
      if (taxSettingsData) {
        setTaxSettings(taxSettingsData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  // Carregar dados quando usuário mudar
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      // Limpar dados quando usuário deslogar
      setClients([]);
      setSessions([]);
      setGoals([]);
      setTransactions([]);
      setComandasState([]);
      setTaxSettings(null);
    }
  }, [user]);

  // Funções para clientes
  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'sessions'>) => {
    try {
      const newClient = await createClient(clientData);
      
      // Adicionar movimentação inicial
      await addWeekMovement(newClient.id, newClient.status);
      
      setClients(prev => [newClient, ...prev]);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  };

  const updateClientData = async (id: string, updates: Partial<Client>) => {
    try {
      const updatedClient = await updateClient(id, updates);
      setClients(prev => prev.map(client => 
        client.id === id ? updatedClient : client
      ));
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  };

  const updateClientStatus = async (id: string, newStatus: Client['status']) => {
    try {
      const client = clients.find(c => c.id === id);
      const previousStatus = client?.status;
      
      // Atualizar status do cliente
      await updateClientData(id, { status: newStatus });
      
      // Registrar movimentação semanal
      await addWeekMovement(id, newStatus, previousStatus);
      
    } catch (error) {
      console.error('Erro ao atualizar status do cliente:', error);
      throw error;
    }
  };

  // Funções para sessões
  const addSession = async (sessionData: Omit<Session, 'id'>) => {
    try {
      const newSession = await createSession(sessionData);
      setSessions(prev => [...prev, newSession]);
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      throw error;
    }
  };

  const updateSessionData = async (id: string, updates: Partial<Session>) => {
    try {
      const updatedSession = await updateSession(id, updates);
      setSessions(prev => prev.map(session => 
        session.id === id ? updatedSession : session
      ));
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      throw error;
    }
  };

  // Funções para transações
  const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    try {
      const newTransaction = await createTransaction(transactionData);
      setTransactions(prev => [newTransaction, ...prev]);
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      throw error;
    }
  };

  // Funções para comandas - usar apenas funções do database.ts
  const addComanda = async (comandaData: Omit<Comanda, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newComanda = await createComanda(comandaData);
      setComandasState(prev => [newComanda, ...prev]);
    } catch (error) {
      console.error('Erro ao criar comanda:', error);
      throw error;
    }
  };

  const addComandaClient = async (clientData: Omit<ComandaClient, 'id' | 'createdAt'>) => {
    try {
      const newClient = await createComandaClient(clientData);
      
      setComandasState(prev => prev.map(comanda => 
        comanda.id === clientData.comandaId 
          ? { ...comanda, clients: [...comanda.clients, newClient] }
          : comanda
      ));
    } catch (error) {
      console.error('Erro ao adicionar cliente à comanda:', error);
      throw error;
    }
  };

  const addComandaPayment = async (paymentData: Omit<ComandaPayment, 'id' | 'createdAt'>) => {
    try {
      const newPayment = await createComandaPayment(paymentData);
      
      setComandasState(prev => prev.map(comanda => ({
        ...comanda,
        clients: comanda.clients.map(client => {
          if (client.id === paymentData.comandaClientId) {
            const currentPayments = client.payments || [];
            const updatedPayments = [...currentPayments, newPayment];
            
            // Verificar se o valor total dos pagamentos cobre o valor do serviço
            const totalPaid = updatedPayments.reduce((sum, p) => sum + p.netValue, 0);
            const isFullyPaid = totalPaid >= client.value;
            
            return {
              ...client,
              payments: updatedPayments,
              payment: newPayment, // Manter compatibilidade
              status: isFullyPaid ? 'finalizado' as const : 'pendente' as const
            };
          }
          return client;
        })
      })));
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      throw error;
    }
  };

  const reopenComanda = async (comandaId: string) => {
    try {
      await updateComandaStatus(comandaId, 'aberta');
      setComandasState(prev => prev.map(comanda => 
        comanda.id === comandaId 
          ? { ...comanda, status: 'aberta' as const }
          : comanda
      ));
    } catch (error) {
      console.error('Erro ao reabrir comanda:', error);
      throw error;
    }
  };

  const closeComanda = async (comandaId: string) => {
    try {
      await updateComandaStatus(comandaId, 'fechada');
      setComandasState(prev => prev.map(comanda => 
        comanda.id === comandaId 
          ? { ...comanda, status: 'fechada' as const }
          : comanda
      ));
    } catch (error) {
      console.error('Erro ao fechar comanda:', error);
      throw error;
    }
  };

  // Funções para metas
  const updateGoal = async (goalData: Omit<Goal, 'id'>) => {
    try {
      const updatedGoal = await createOrUpdateGoal(goalData);
      
      setGoals(prev => {
        const existingIndex = prev.findIndex(g => g.month === goalData.month);
        if (existingIndex >= 0) {
          const newGoals = [...prev];
          newGoals[existingIndex] = {
            ...updatedGoal,
            availableDays: goalData.availableDays || 22,
            desiredTicketAverage: goalData.desiredTicketAverage,
            expectedConversion: goalData.expectedConversion
          };
          return newGoals;
        } else {
          return [{
            ...updatedGoal,
            availableDays: goalData.availableDays || 22,
            desiredTicketAverage: goalData.desiredTicketAverage,
            expectedConversion: goalData.expectedConversion
          }, ...prev];
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      throw error;
    }
  };

  // Funções para configurações de taxa
  const updateTaxSettings = async (settings: TaxSettings) => {
    try {
      const updatedSettings = await createOrUpdateTaxSettings(settings);
      setTaxSettings(updatedSettings);
    } catch (error) {
      console.error('Erro ao atualizar configurações de taxa:', error);
      throw error;
    }
  };

  // Funções para movimentações semanais
  const getClientsByPeriod = (year: number, month?: number, weekISO?: number): Client[] => {
    return clients.filter(client => {
      if (!client.weekMovements || client.weekMovements.length === 0) {
        // Se não há movimentações, incluir apenas se for criado no período
        const createdDate = new Date(client.createdAt);
        const createdYear = getISOWeekYear(createdDate);
        const createdWeek = getISOWeek(createdDate);
        const createdMonth = createdDate.getMonth() + 1;

        if (weekISO) {
          return createdYear === year && createdWeek === weekISO;
        } else if (month) {
          return createdYear === year && createdMonth === month;
        } else {
          return createdYear === year;
        }
      }

      // Verificar se há movimentações no período
      return client.weekMovements.some(movement => {
        if (weekISO) {
          return movement.year === year && movement.weekISO === weekISO;
        } else if (month) {
          return movement.year === year && movement.month === month;
        } else {
          return movement.year === year;
        }
      });
    });
  };

  const addWeekMovement = async (clientId: string, newStatus: Client['status'], previousStatus?: Client['status']) => {
    try {
      const now = new Date();
      const movement: ClientWeekMovement = {
        id: `${clientId}-${Date.now()}`,
        clientId,
        year: getISOWeekYear(now),
        month: now.getMonth() + 1,
        weekISO: getISOWeek(now),
        status: newStatus,
        movedAt: now,
        previousStatus
      };

      // Atualizar cliente com nova movimentação
      setClients(prev => prev.map(client => {
        if (client.id === clientId) {
          const weekMovements = client.weekMovements || [];
          return {
            ...client,
            weekMovements: [...weekMovements, movement]
          };
        }
        return client;
      }));

      // TODO: Salvar no banco de dados quando implementar tabela de movimentações
      console.log('Movimentação registrada:', movement);
      
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      clients,
      setClients,
      addClient,
      updateClientData,
      updateClientStatus,
      sessions,
      setSessions,
      addSession,
      updateSessionData,
      goals,
      setGoals,
      updateGoal,
      transactions,
      setTransactions,
      addTransaction,
      comandas,
      setComandasState,
      addComanda,
      addComandaClient,
      addComandaPayment,
      reopenComanda,
      closeComanda,
      taxSettings,
      setTaxSettings,
      updateTaxSettings,
      currentView,
      setCurrentView,
      loading,
      refreshData,
      getClientsByPeriod,
      addWeekMovement
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}