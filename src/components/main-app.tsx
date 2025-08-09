"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/app-context';
import { CalendarView } from '@/components/agenda/calendar-view';
import { FinancialDashboard } from '@/components/financeiro/financial-dashboard';
import { GoalsPanel } from '@/components/goals/goals-panel';
import { CRMVisual } from '@/components/crm/crm-visual';
import { NewClientDialog } from '@/components/clients/client-form';
import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  Target,
  TrendingUp,
  UserCheck,
  Clock,
  PiggyBank,
  Menu,
  X
} from 'lucide-react';

export function MainApp() {
  const { clients, sessions, transactions, goals, loading } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Calcular métricas do dashboard
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyRevenue = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             t.type === 'receita';
    })
    .reduce((sum, t) => sum + t.value, 0);

  const monthlyExpenses = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             t.type === 'despesa';
    })
    .reduce((sum, t) => sum + t.value, 0);

  const netProfit = monthlyRevenue - monthlyExpenses;

  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });

  const currentGoal = goals.find(g => g.month === new Date().toISOString().slice(0, 7));
  const goalProgress = currentGoal ? (monthlyRevenue / currentGoal.target) * 100 : 0;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'crm', label: 'CRM', icon: UserCheck },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'metas', label: 'Metas', icon: Target }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">One Travizan</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r transition-transform duration-200 ease-in-out lg:transition-none`}>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-primary hidden lg:block">One Travizan</h1>
          </div>
          
          <nav className="px-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-4 lg:p-8">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold">Dashboard</h2>
                    <p className="text-muted-foreground">Visão geral do seu negócio</p>
                  </div>
                  <NewClientDialog />
                </div>

                {/* Métricas Principais */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl lg:text-2xl font-bold text-green-600">
                        {formatCurrency(monthlyRevenue)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {currentGoal ? `${goalProgress.toFixed(0)}% da meta` : 'Sem meta definida'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                      <PiggyBank className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-xl lg:text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(netProfit)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Receitas - Despesas
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
                      <Clock className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl lg:text-2xl font-bold text-purple-600">
                        {todaySessions.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(todaySessions.reduce((sum, s) => sum + s.value, 0))}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                      <Users className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl lg:text-2xl font-bold text-orange-600">
                        {clients.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {clients.filter(c => c.status === 'cliente-fidelizado').length} fidelizados
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Resumo Rápido */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Próximas Sessões</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {sessions.slice(0, 3).map((session) => {
                          const client = clients.find(c => c.id === session.clientId);
                          return (
                            <div key={session.id} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{client?.name || 'Cliente não encontrado'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(session.date).toLocaleDateString('pt-BR')} às{' '}
                                  {new Date(session.date).toLocaleTimeString('pt-BR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                              <Badge variant="outline">{session.status}</Badge>
                            </div>
                          );
                        })}
                        
                        {sessions.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">
                            Nenhuma sessão agendada
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Clientes Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {clients.slice(0, 3).map((client) => (
                          <div key={client.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{client.name}</p>
                              <p className="text-xs text-muted-foreground">{client.style}</p>
                            </div>
                            <Badge variant="outline">{client.status}</Badge>
                          </div>
                        ))}
                        
                        {clients.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">
                            Nenhum cliente cadastrado
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Meta do Mês */}
                {currentGoal && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Meta do Mês
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Progresso:</span>
                          <span className="font-medium">{goalProgress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div 
                            className="bg-primary h-3 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(goalProgress, 100)}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Atual: </span>
                            <span className="font-medium">{formatCurrency(monthlyRevenue)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Meta: </span>
                            <span className="font-medium">{formatCurrency(currentGoal.target)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'agenda' && <CalendarView />}
            {activeTab === 'clients' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Clientes</h2>
                  <NewClientDialog />
                </div>
                
                <div className="grid gap-4">
                  {clients.map((client) => (
                    <Card key={client.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{client.name}</h3>
                            <p className="text-sm text-muted-foreground">{client.whatsapp}</p>
                            <p className="text-sm text-muted-foreground">{client.style}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{client.status}</Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatCurrency(client.totalPaid)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {clients.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="font-medium mb-2">Nenhum cliente cadastrado</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Comece cadastrando seu primeiro cliente
                        </p>
                        <NewClientDialog />
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'crm' && <CRMVisual />}
            {activeTab === 'financeiro' && <FinancialDashboard />}
            {activeTab === 'metas' && <GoalsPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}