"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useApp } from '@/contexts/app-context';
import { CalendarView } from '@/components/agenda/calendar-view';
import { FinancialDashboard } from '@/components/financeiro/financial-dashboard';
import { GoalsPanel } from '@/components/goals/goals-panel';
import { CRMVisual } from '@/components/crm/crm-visual';
import { ComandaView } from '@/components/comandas/comanda-view';
import { NewClientDialog } from '@/components/clients/client-form';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { TaxSettingsComponent } from '@/components/settings/tax-settings';
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
  X,
  Receipt,
  Settings,
  User
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

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'comandas', label: 'Comandas', icon: Receipt },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'crm', label: 'CRM', icon: UserCheck },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'metas', label: 'Metas', icon: Target },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden bg-background border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">One Travizan</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-background border-r transition-transform duration-200 ease-in-out lg:transition-none`}>
          <div className="p-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary hidden lg:block">One Travizan</h1>
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
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

                {/* Usar o componente OverviewCards com os indicadores ajustados */}
                <OverviewCards />

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
              </div>
            )}

            {activeTab === 'comandas' && <ComandaView />}
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
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Perfil</h2>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">Perfil em desenvolvimento...</p>
                  </CardContent>
                </Card>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Configurações</h2>
                <TaxSettingsComponent />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}