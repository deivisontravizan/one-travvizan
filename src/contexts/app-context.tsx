"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Client, Session, Goal, Transaction, Comanda, TaxSettings } from '@/lib/types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  clients: Client[];
  setClients: (clients: Client[]) => void;
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  comandas: Comanda[];
  setComandasState: (comandas: Comanda[]) => void;
  taxSettings: TaxSettings | null;
  setTaxSettings: (settings: TaxSettings) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
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

  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'Maria Santos',
      whatsapp: '11999999999',
      instagram: '@maria_santos',
      style: 'Fine Line',
      references: [],
      anamnese: {},
      observations: 'Cliente interessada em tatuagem delicada no pulso',
      sessions: [],
      totalPaid: 0,
      status: 'novo-contato',
      tags: ['lead-quente'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Pedro Costa',
      whatsapp: '11888888888',
      instagram: '@pedro_costa',
      style: 'Realismo',
      references: [],
      anamnese: {},
      observations: 'Quer fazer uma tatuagem do seu cachorro',
      sessions: [],
      totalPaid: 800,
      status: 'em-conversa',
      tags: ['cliente-fiel'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      clientId: '2',
      tattooerId: '1',
      date: new Date(2024, 11, 20, 14, 0),
      duration: 3,
      value: 800,
      status: 'agendado',
      description: 'Tatuagem realismo - cachorro'
    }
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      tattooerId: '1',
      month: '2024-12',
      target: 8000,
      current: 3200,
      percentage: 40
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'receita',
      description: 'Sessão - Pedro Costa',
      value: 800,
      date: new Date(),
      category: 'Tatuagem',
      tattooerId: '1',
      sessionId: '1'
    }
  ]);

  const [comandas, setComandasState] = useState<Comanda[]>([]);

  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>({
    id: '1',
    tattooerId: '1',
    creditCardCashRate: 3.5,
    creditCardInstallmentRate: 4.5,
    debitCardRate: 2.5,
    pixRate: 0,
    updatedAt: new Date()
  });

  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      clients,
      setClients,
      sessions,
      setSessions,
      goals,
      setGoals,
      transactions,
      setTransactions,
      comandas,
      setComandasState,
      taxSettings,
      setTaxSettings,
      currentView,
      setCurrentView
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