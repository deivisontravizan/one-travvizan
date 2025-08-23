"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserMenu } from '@/components/layout/user-menu';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  DollarSign,
  Target,
  Settings,
  User,
  Building2,
  Workflow,
  Menu,
  X,
  Receipt
} from 'lucide-react';

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Visão geral'
  },
  {
    id: 'comandas',
    label: 'Comandas',
    icon: Receipt,
    description: 'Gestão do caixa'
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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { currentView, setCurrentView } = useApp();
  const { user } = useAuth();

  const handleNavigation = (viewId: string) => {
    setCurrentView(viewId);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex h-full flex-col bg-card">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">One Travizan</h1>
                  <p className="text-xs text-muted-foreground">Sistema para tatuadores</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
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
                    onClick={() => handleNavigation(item.id)}
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
                    className="w-full justify-start gap-3"
                    onClick={() => handleNavigation(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function MobileHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentView } = useApp();

  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => item.id === currentView);
    return currentItem?.label || 'Dashboard';
  };

  return (
    <>
      {/* Mobile Header - só aparece em telas pequenas */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="h-10 w-10 p-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{getCurrentPageTitle()}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </header>
      
      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
    </>
  );
}