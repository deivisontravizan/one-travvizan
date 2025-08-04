"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/app-context';
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle
} from 'lucide-react';

export function OverviewCards() {
  const { sessions, clients, transactions, goals } = useApp();

  // Calcular métricas
  const todaySessions = sessions.filter(session => {
    const today = new Date();
    const sessionDate = new Date(session.date);
    return sessionDate.toDateString() === today.toDateString();
  });

  const pendingClients = clients.filter(client => 
    client.status === 'novo-contato' || client.status === 'em-conversa'
  );

  const monthlyRevenue = transactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.value, 0);

  const currentGoal = goals[0];
  const goalProgress = currentGoal ? (currentGoal.current / currentGoal.target) * 100 : 0;

  // Alertas IA
  const alerts = [
    {
      type: 'leads',
      message: `${pendingClients.length} leads aguardam resposta`,
      priority: pendingClients.length > 3 ? 'high' : 'medium'
    },
    {
      type: 'agenda',
      message: `${todaySessions.length} sessões hoje`,
      priority: 'low'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Sessões Hoje */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todaySessions.length}</div>
          <p className="text-xs text-muted-foreground">
            {todaySessions.length > 0 ? 'Próxima às 14:00' : 'Nenhuma sessão agendada'}
          </p>
        </CardContent>
      </Card>

      {/* Leads Pendentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leads Pendentes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingClients.length}</div>
          <div className="flex items-center gap-2 mt-1">
            {pendingClients.length > 3 && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Urgente
              </Badge>
            )}
            <p className="text-xs text-muted-foreground">
              Aguardando resposta
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Faturamento Mensal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R$ {monthlyRevenue.toLocaleString('pt-BR')}
          </div>
          <p className="text-xs text-muted-foreground">
            Este mês
          </p>
        </CardContent>
      </Card>

      {/* Meta do Mês */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Meta do Mês</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{goalProgress.toFixed(0)}%</div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${Math.min(goalProgress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            R$ {currentGoal?.current.toLocaleString('pt-BR')} de R$ {currentGoal?.target.toLocaleString('pt-BR')}
          </p>
        </CardContent>
      </Card>

      {/* Alertas IA */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{alert.message}</span>
                </div>
                <Badge 
                  variant={alert.priority === 'high' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {alert.priority === 'high' ? 'Urgente' : 'Normal'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}