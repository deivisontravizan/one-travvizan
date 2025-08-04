"use client";

import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileHeader } from '@/components/layout/mobile-sidebar';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { ClientList } from '@/components/cadastro/client-list';
import { CRMVisual } from '@/components/crm/crm-visual';
import { CalendarView } from '@/components/agenda/calendar-view';
import { FinancialDashboard } from '@/components/financeiro/financial-dashboard';
import { GoalsPanel } from '@/components/goals/goals-panel';
import { AIAssistant } from '@/components/ai/ai-assistant';
import { useApp } from '@/contexts/app-context';

function DashboardView() {
  return (
    <div className="space-y-6">
      <div className="hidden lg:block">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>
      <OverviewCards />
      <QuickActions />
    </div>
  );
}

function CadastroView() {
  return <ClientList />;
}

function CRMView() {
  return <CRMVisual />;
}

function AgendaView() {
  return <CalendarView />;
}

function FinanceiroView() {
  return <FinancialDashboard />;
}

function MetasView() {
  return <GoalsPanel />;
}

function IAView() {
  return <AIAssistant />;
}

function ProfileView() {
  return (
    <div className="space-y-6">
      <div className="hidden lg:block">
        <h2 className="text-2xl font-bold">Perfil</h2>
      </div>
      <div className="text-center py-12 text-muted-foreground">
        <p>Configurações de perfil em desenvolvimento</p>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-6">
      <div className="hidden lg:block">
        <h2 className="text-2xl font-bold">Configurações</h2>
      </div>
      <div className="text-center py-12 text-muted-foreground">
        <p>Configurações do sistema em desenvolvimento</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { currentView } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'cadastro':
        return <CadastroView />;
      case 'crm':
        return <CRMView />;
      case 'agenda':
        return <AgendaView />;
      case 'financeiro':
        return <FinanceiroView />;
      case 'metas':
        return <MetasView />;
      case 'ia':
        return <IAView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar Desktop */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <MobileHeader />
          
          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {renderView()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}