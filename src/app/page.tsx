"use client";

import React, { useState } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { AppProvider } from '@/contexts/app-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { CalendarView } from '@/components/agenda/calendar-view';
import { ComandaView } from '@/components/comandas/comanda-view';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { useApp } from '@/contexts/app-context';
import { toast } from 'sonner';
import {
  Calendar,
  Receipt,
  Users,
  BarChart3,
  Settings,
  LogOut,
  User,
  Palette,
  DollarSign,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';

// Componente de Sidebar
function Sidebar({ currentView, setCurrentView }: { currentView: string; setCurrentView: (view: string) => void }) {
  const { user, signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'comandas', label: 'Comandas', icon: Receipt },
    { id: 'configuracoes', label: 'Configurações', icon: Settings }
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="w-64 bg-card border-r h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Palette className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="font-bold">TattooManager</h1>
            <p className="text-xs text-muted-foreground">v1.0</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        {user?.studio && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              {user.studio}
            </Badge>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentView === item.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentView(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="mr-3 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}

// Componente de Dashboard
function Dashboard() {
  const { clients, sessions, goals, transactions } = useApp();

  // Calcular métricas
  const today = new Date();
  const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate.toDateString() === today.toDateString();
  });

  const thisMonthGoal = goals.find(goal => goal.month === thisMonth);
  const thisMonthRevenue = sessions
    .filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.getMonth() === today.getMonth() && 
             sessionDate.getFullYear() === today.getFullYear();
    })
    .reduce((sum, session) => sum + (session.totalValue || session.value), 0);

  const newClients = clients.filter(client => client.status === 'novo-contato').length;
  const activeClients = clients.filter(client => 
    ['em-conversa', 'orcamento-enviado', 'agendamento-realizado'].includes(client.status)
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySessions.length}</div>
            <p className="text-xs text-muted-foreground">
              {todaySessions.reduce((sum, s) => sum + (s.totalValue || s.value), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newClients}</div>
            <p className="text-xs text-muted-foreground">
              {activeClients} em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {thisMonthRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">
              {sessions.filter(s => {
                const date = new Date(s.date);
                return date.getMonth() === today.getMonth();
              }).length} sessões
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta do Mês</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {thisMonthGoal ? `${thisMonthGoal.percentage.toFixed(0)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              {thisMonthGoal ? 
                `${thisMonthGoal.target.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} meta` :
                'Nenhuma meta definida'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessões de hoje */}
      <Card>
        <CardHeader>
          <CardTitle>Agenda de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          {todaySessions.length > 0 ? (
            <div className="space-y-3">
              {todaySessions.map((session) => {
                const client = clients.find(c => c.id === session.clientId);
                return (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{client?.name || 'Cliente não encontrado'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {session.duration}h
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {(session.totalValue || session.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                      <Badge variant="outline">{session.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma sessão agendada para hoje</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal da aplicação
function AppContent() {
  const { currentView, setCurrentView } = useApp();

  const renderContent = () => {
    switch (currentView) {
      case 'agenda':
        return <CalendarView />;
      case 'comandas':
        return <ComandaView />;
      case 'clientes':
        return (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Módulo de Clientes</h3>
            <p className="text-muted-foreground">Em desenvolvimento</p>
          </div>
        );
      case 'configuracoes':
        return (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Configurações</h3>
            <p className="text-muted-foreground">Em desenvolvimento</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

// Página principal
export default function HomePage() {
  return (
    <AuthProvider>
      <ProtectedRoute fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Bem-vindo ao TattooManager</h1>
            <p className="text-muted-foreground mb-6">Faça login para acessar o sistema</p>
            <Button onClick={() => window.location.href = '/login'}>
              Fazer Login
            </Button>
          </div>
        </div>
      }>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}