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
    <div className="grid gap-4 md:grid-cols-2">
      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActionButtons.map((button, index) => {
            const Icon = button.icon;
            return (
              <Button
                key={index}
                variant={button.variant}
                className="w-full justify-start gap-3 h-12"
                onClick={button.action}
              >
                <Icon className="h-5 w-5" />
                {button.label}
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Próximas Sessões */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Próximas Sessões
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Cliente #{session.clientId}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.date).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(session.date).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ {session.value}</p>
                    <p className="text-sm text-muted-foreground">{session.duration}h</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma sessão agendada</p>
              <Button 
                variant="outline" 
                className="mt-3"
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