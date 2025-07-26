"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/contexts/app-context';
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  Target,
  Brain,
  Settings,
  User,
  Building2,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from 'next-themes';

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Visão geral'
  },
  {
    id: 'clients',
    label: 'Clientes',
    icon: Users,
    description: 'CRM e gestão'
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
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      {/* Header */}
      <div className="p-6">
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

      <Separator />

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
                  isActive && "bg-primary/10 text-primary border-primary/20"
                )}
                onClick={() => setCurrentView(item.id)}
              >
                <Icon className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />

      {/* Bottom Section */}
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Tema</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8 w-8 p-0"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => setCurrentView(item.id)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}