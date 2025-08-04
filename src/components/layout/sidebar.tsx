"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useApp } from '@/contexts/app-context';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  DollarSign,
  Target,
  Brain,
  Settings,
  User,
  Building2,
  Workflow
} from 'lucide-react';

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Visão geral'
  },
  {
    id: 'cadastro',
    label: 'Cadastro',
    icon: UserPlus,
    description: 'Dados dos clientes'
  },
  {
    id: 'crm',
    label: 'CRM Visual',
    icon: Workflow,
    description: 'Funil de vendas'
  },
  {
    id: 'agenda',
    label: 'Agenda',
    icon: Calendar,
    description: 'Agendamentos'
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: DollarSign,
    description: 'Vendas e despesas'
  },
  {
    id: 'metas',
    label: 'Metas',
    icon: Target,
    description: 'Produtividade'
  },
  {
    id: 'ia',
    label: 'IA Assistant',
    icon: Brain,
    description: 'Inteligência artificial'
  }
];

const bottomItems = [
  {
    id: 'profile',
    label: 'Perfil',
    icon: User
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: Settings
  }
];

export function Sidebar() {
  const { currentView, setCurrentView, user } = useApp();

  return (
    <aside className="hidden lg:flex h-full w-64 flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">One Travizan</h1>
            <p className="text-xs text-muted-foreground">O único sistema que o tatuador precisa</p>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.plan}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-12",
                  isActive && "bg-primary/10 text-primary"
                )}
                onClick={() => setCurrentView(item.id)}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Bottom Section */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center justify-between mb-3" suppressHydrationWarning>
          <span className="text-xs text-muted-foreground">Tema</span>
          <ThemeToggle />
        </div>
        
        <div className="space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 h-10"
                onClick={() => setCurrentView(item.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}