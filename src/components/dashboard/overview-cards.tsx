"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/app-context';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle
} from 'lucide-react';

export function OverviewCards() {
  const { sessions, clients, transactions, goals } = useApp();

  // Obter mês atual
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  // 1. Percentual da meta atingida
  const currentGoal = goals.find(goal => goal.month === currentMonth) || goals[0];
  const goalProgress = currentGoal ? (currentGoal.current / currentGoal.target) * 100 : 0;

  // 2. Receita bruta do período atual
  const currentMonthRevenue = transactions
    .filter(t => {
      const transactionDate = new Date(t.transactionDate || t.createdAt);
      const transactionMonth = transactionDate.toISOString().slice(0, 7);
      return t.type === 'receita' && transactionMonth === currentMonth;
    })
    .reduce((sum, t) => sum + (t.grossValue || t.value), 0);

  // 3. Dias disponíveis para meta
  const availableDays = currentGoal?.availableDays || 22;

  // 4. Agendamentos do mês atual
  const monthlyScheduledSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    const sessionMonth = sessionDate.toISOString().slice(0, 7);
    return sessionMonth === currentMonth;
  });

  // Alertas IA (manter os existentes)
  const pendingClients = clients.filter(client => 
    client.status === 'novo-contato' || client.status === 'em-conversa'
  );

  const todaySessions = sessions.filter(session => {
    const today = new Date();
    const sessionDate = new Date(session.date);
    return sessionDate.toDateString() === today.toDateString();
  });

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
    <div className="space-y-6">
      {/* Cards principais */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Percentual da Meta Atingida */}
        <Card className="border border-border">
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

        {/* 2. Receita Bruta do Período Atual */}
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Bruta</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {currentMonthRevenue.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Período atual
            </p>
          </CardContent>
        </Card>

        {/* 3. Dias Disponíveis para Meta */}
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dias Disponíveis</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableDays}</div>
            <p className="text-xs text-muted-foreground">
              Para atingir a meta
            </p>
          </CardContent>
        </Card>

        {/* 4. Agendamentos do Mês Atual */}
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyScheduledSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Sessões do mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas IA */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
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