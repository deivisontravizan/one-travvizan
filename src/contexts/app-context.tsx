"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Client, Session, Goal, Transaction, Comanda, ComandaClient, ComandaPayment, TaxSettings, ClientWeekMovement } from '@/lib/types';
import { getCurrentWeekPeriod, getISOWeek, getISOWeekYear } from '@/lib/week-utils';
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
  createOrUpdateTaxSettings
} from '@/lib/database';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
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
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    role: 'tatuador',
    plan: 'solo',
    studio: 'Studio Ink'
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [comandas, setComandasState] = useState<Comanda[]>([]);
  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Carregar dados do banco ao inicializar
  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsData, sessionsData, goalsData, transactionsData, taxSettingsData] = await Promise.all([
        getClients(),
        getSessions(),
        getGoals(),
        getTransactions(),
        getTaxSettings()
      ]);

      setClients(clientsData);
      setSessions(sessionsData);
      
      // Garantir que as metas tenham todos os campos obrigatórios
      const goalsWithDefaults: Goal[] = goalsData.map(goal => ({
        id: goal.id || Date.now().toString(),
        tattooerId: goal.tattooerId || '1',
        month: goal.month || new Date().toISOString().slice(0, 7),
        target: goal.target || 0,
        current: goal.current || 0,
        percentage: goal.percentage || 0,
        availableDays: goal.availableDays || 22,
        desiredTicketAverage: goal.desiredTicketAverage,
        expectedConversion: goal.expectedConversion,
        createdAt: goal.createdAt || new Date(),
        updatedAt: goal.updatedAt || new Date()
      }));
      setGoals(goalsWithDefaults);
      
      setTransactions(transactionsData);
      setTaxSettings(taxSettingsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

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

  // Funções para comandas
  const addComanda = async (comandaData: Omit<Comanda, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Simular criação de comanda (substituir por função real do database)
      const newComanda: Comanda = {
        id: Date.now().toString(),
        ...comandaData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setComandasState(prev => [newComanda, ...prev]);
    } catch (error) {
      console.error('Erro ao criar comanda:', error);
      throw error;
    }
  };

  const addComandaClient = async (clientData: Omit<ComandaClient, 'id' | 'createdAt'>) => {
    try {
      // Simular criação de cliente da comanda (substituir por função real do database)
      const newClient: ComandaClient = {
        id: Date.now().toString(),
        ...clientData,
        createdAt: new Date()
      };
      
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
      // Simular criação de pagamento (substituir por função real do database)
      const newPayment: ComandaPayment = {
        id: Date.now().toString(),
        ...paymentData,
        createdAt: new Date()
      };
      
      setComandasState(prev => prev.map(comanda => ({
        ...comanda,
        clients: comanda.clients.map(client => 
          client.id === paymentData.comandaClientId
            ? { ...client, payment: newPayment, status: 'finalizado' as const }
            : client
        )
      })));
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
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
            id: updatedGoal.id || prev[existingIndex].id,
            tattooerId: updatedGoal.tattooerId || prev[existingIndex].tattooerId,
            month: updatedGoal.month || prev[existingIndex].month,
            target: updatedGoal.target || prev[existingIndex].target,
            current: updatedGoal.current || prev[existingIndex].current,
            percentage: updatedGoal.percentage || prev[existingIndex].percentage,
            availableDays: updatedGoal.availableDays || prev[existingIndex].availableDays || 22,
            desiredTicketAverage: updatedGoal.desiredTicketAverage,
            expectedConversion: updatedGoal.expectedConversion,
            createdAt: updatedGoal.createdAt || prev[existingIndex].createdAt || new Date(),
            updatedAt: updatedGoal.updatedAt || new Date()
          };
          return newGoals;
        } else {
          return [{
            id: updatedGoal.id || Date.now().toString(),
            tattooerId: updatedGoal.tattooerId || '1',
            month: updatedGoal.month || new Date().toISOString().slice(0, 7),
            target: updatedGoal.target || 0,
            current: updatedGoal.current || 0,
            percentage: updatedGoal.percentage || 0,
            availableDays: updatedGoal.availableDays || 22,
            desiredTicketAverage: updatedGoal.desiredTicketAverage,
            expectedConversion: updatedGoal.expectedConversion,
            createdAt: updatedGoal.createdAt || new Date(),
            updatedAt: updatedGoal.updatedAt || new Date()
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

      // TODO: Salvar no banco de dados
      console.log('Movimentação registrada:', movement);
      
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
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