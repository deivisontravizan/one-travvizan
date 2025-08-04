"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/app-context';
import {
  Plus,
  Calendar,
  MessageSquare,
  Instagram,
  Clock,
  Users,
  Workflow
} from 'lucide-react';

export function QuickActions() {
  const { setCurrentView, sessions } = useApp();

  // Próximas sessões
  const upcomingSessions = sessions
    .filter(session => new Date(session.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const quickActionButtons = [
    {
      label: 'Novo Cliente',
      icon: Plus,
      action: () => setCurrentView('cadastro'),
      variant: 'default' as const
    },
    {
      label: 'CRM Visual',
      icon: Workflow,
      action: () => setCurrentView('crm'),
      variant: 'outline' as const
    },
    {
      label: 'Agendar Sessão',
      icon: Calendar,
      action: () => setCurrentView('agenda'),
      variant: 'outline' as const
    },
    {
      label: 'IA Assistant',
      icon: MessageSquare,
      action: () => setCurrentView('ia'),
      variant: 'outline' as const
    }
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-3">
            {quickActionButtons.map((button, index) => {
              const Icon = button.icon;
              return (
                <Button
                  key={index}
                  variant={button.variant}
                  className="justify-start gap-2 lg:gap-3 h-10 lg:h-12 text-xs lg:text-sm"
                  onClick={button.action}
                >
                  <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="hidden sm:inline lg:inline">{button.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Próximas Sessões */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg flex items-center gap-2">
            <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
            Próximas Sessões
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">Cliente #{session.clientId}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.date).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(session.date).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-medium text-sm">R$ {session.value}</p>
                    <p className="text-xs text-muted-foreground">{session.duration}h</p>
                  </div>
                </div>
              ))}
            
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-8 w-8 lg:h-12 lg:w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Nenhuma sessão agendada</p>
              <Button 
                variant="outline" 
                className="mt-3"
                size="sm"
                onClick={() => setCurrentView('agenda')}
              >
                Agendar Sessão
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}