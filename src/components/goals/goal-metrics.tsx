"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GoalMetrics } from '@/lib/types';
import {
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  Percent,
  Calculator,
  Clock
} from 'lucide-react';

interface GoalMetricsDisplayProps {
  metrics: GoalMetrics;
  isCurrentMonth: boolean;
}

export function GoalMetricsDisplay({ metrics, isCurrentMonth }: GoalMetricsDisplayProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Meta do Mês */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Meta do Mês</CardTitle>
          <Target className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(metrics.target)}
          </div>
          <p className="text-xs text-muted-foreground">
            Faturamento objetivo
          </p>
        </CardContent>
      </Card>

      {/* Atingido */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Atingido</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(metrics.current)}
          </div>
          <p className="text-xs text-muted-foreground">
            Faturamento atual
          </p>
        </CardContent>
      </Card>

      {/* % da Meta */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">% da Meta</CardTitle>
          <Percent className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getProgressColor(metrics.percentage)}`}>
            {formatPercent(metrics.percentage)}
          </div>
          <p className="text-xs text-muted-foreground">
            Progresso atual
          </p>
        </CardContent>
      </Card>

      {/* Dias Restantes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {isCurrentMonth ? 'Dias Restantes' : 'Dias do Período'}
          </CardTitle>
          <Calendar className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {isCurrentMonth ? Math.max(0, metrics.remainingDays) : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            {isCurrentMonth ? 'Para atingir meta' : 'Período encerrado'}
          </p>
        </CardContent>
      </Card>

      {/* Vendas/Dia Necessárias */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vendas/Dia Necessárias</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(metrics.dailySalesNeeded)}
          </div>
          <p className="text-xs text-muted-foreground">
            Para atingir a meta
          </p>
        </CardContent>
      </Card>

      {/* Tatuagens Necessárias */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tatuagens Necessárias</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {metrics.tattoosNeeded}
          </div>
          <p className="text-xs text-muted-foreground">
            Sessões no período
          </p>
        </CardContent>
      </Card>

      {/* Taxa de Conversão */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
          <Calculator className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {formatPercent(metrics.expectedConversionRate)}
          </div>
          <div className="text-xs text-muted-foreground">
            <p>Real: {formatPercent(metrics.realConversionRate)}</p>
            <Badge variant="outline" className="text-xs mt-1">
              {metrics.expectedConversionRate === metrics.realConversionRate ? 'Real' : 'Esperada'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Médio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {formatCurrency(metrics.necessaryTicketAverage)}
          </div>
          <div className="text-xs text-muted-foreground">
            <p>Real: {formatCurrency(metrics.realTicketAverage)}</p>
            <Badge variant="outline" className="text-xs mt-1">
              Necessário
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Leads Necessários - Card adicional */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-600" />
            Leads Necessários (Estimativa)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-indigo-600">
                {metrics.leadsNeeded}
              </div>
              <p className="text-sm text-muted-foreground">
                Baseado na taxa de conversão {metrics.expectedConversionRate === metrics.realConversionRate ? 'real' : 'esperada'} de {formatPercent(metrics.expectedConversionRate)}
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Fórmula: {metrics.tattoosNeeded} tatuagens ÷ {formatPercent(metrics.expectedConversionRate)} conversão</p>
              <p>= {metrics.leadsNeeded} leads necessários</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}