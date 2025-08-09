"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Client, Session, Goal, Transaction, Comanda, TaxSettings } from '@/lib/types';
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
  taxSettings: TaxSettings | null;
  setTaxSettings: (settings: TaxSettings) => void;
  updateTaxSettings: (settings: TaxSettings) => Promise<void>;
  currentView: string;
  setCurrentView: (view: string) => void;
  loading: boolean;
  refreshData: () => Promise<void>;
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
      setGoals(goalsData);
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

  // Funções para metas
  const updateGoal = async (goalData: Omit<Goal, 'id'>) => {
    try {
      const updatedGoal = await createOrUpdateGoal(goalData);
      setGoals(prev => {
        const existingIndex = prev.findIndex(g => g.month === goalData.month);
        if (existingIndex >= 0) {
          const newGoals = [...prev];
          newGoals[existingIndex] = updatedGoal;
          return newGoals;
        } else {
          return [updatedGoal, ...prev];
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

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      clients,
      setClients,
      addClient,
      updateClientData,
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
      taxSettings,
      setTaxSettings,
      updateTaxSettings,
      currentView,
      setCurrentView,
      loading,
      refreshData
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