"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/app-context';
import { Goal, GoalMetrics } from '@/lib/types';
import { GoalForm } from './goal-form';
import { GoalMetricsDisplay } from './goal-metrics';
import { PeriodSelector } from '../financeiro/period-selector';
import { toast } from 'sonner';
import {
  Target,
  Plus,
  Edit,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';

export function GoalsPanel() {
  const { goals, updateGoal, transactions, sessions, comandas, clients } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const selectedMonthStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;
  const isCurrentMonth = selectedMonthStr === currentMonth;
  
  const selectedGoal = goals.find(g => g.month === selectedMonthStr);

  // Calcular métricas operacionais
  const goalMetrics = useMemo((): GoalMetrics => {
    if (!selectedGoal) {
      return {
        target: 0,
        current: 0,
        percentage: 0,
        remainingDays: 0,
        dailySalesNeeded: 0,
        tattoosNeeded: 0,
        realConversionRate: 0,
        expectedConversionRate: 0,
        leadsNeeded: 0,
        realTicketAverage: 0,
        necessaryTicketAverage: 0
      };
    }

    // Calcular faturamento atual do período
    const currentRevenue = calculatePeriodRevenue(selectedYear, selectedMonth);
    
    // Calcular dias restantes (apenas para mês atual)
    const now = new Date();
    const endOfMonth = new Date(selectedYear, selectedMonth, 0);
    const remainingDays = isCurrentMonth ? Math.max(0, endOfMonth.getDate() - now.getDate()) : 0;

    // Calcular vendas necessárias por dia
    const dailySalesNeeded = selectedGoal.availableDays > 0 ? selectedGoal.target / selectedGoal.availableDays : 0;

    // Calcular ticket médio real do período
    const periodSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.getFullYear() === selectedYear &&
             sessionDate.getMonth() + 1 === selectedMonth &&
             session.status === 'realizado';
    });
    
    const realTicketAverage = periodSessions.length > 0 
      ? periodSessions.reduce((sum, s) => sum + s.value, 0) / periodSessions.length 
      : 0;

    // Usar ticket médio desejado ou real
    const ticketAverage = selectedGoal.desiredTicketAverage || realTicketAverage || 400; // fallback para R$ 400

    // Calcular número de tatuagens necessárias
    const tattoosNeeded = Math.ceil(selectedGoal.target / ticketAverage);

    // Calcular taxa de conversão real do CRM no período
    const periodClients = clients.filter(client => {
      const createdDate = new Date(client.createdAt);
      return createdDate.getFullYear() === selectedYear &&
             createdDate.getMonth() + 1 === selectedMonth;
    });

    const closedClients = periodClients.filter(c => 
      ['agendamento-realizado', 'cliente-fidelizado'].includes(c.status)
    );

    const realConversionRate = periodClients.length > 0 
      ? (closedClients.length / periodClients.length) * 100 
      : 0;

    // Usar conversão esperada ou real
    const expectedConversionRate = selectedGoal.expectedConversion || realConversionRate || 25; // fallback para 25%

    // Calcular leads necessários
    const leadsNeeded = expectedConversionRate > 0 
      ? Math.ceil(tattoosNeeded / (expectedConversionRate / 100)) 
      : 0;

    // Calcular ticket médio necessário
    const necessaryTicketAverage = tattoosNeeded > 0 ? selectedGoal.target / tattoosNeeded : 0;

    const percentage = selectedGoal.target > 0 ? (currentRevenue / selectedGoal.target) * 100 : 0;

    return {
      target: selectedGoal.target,
      current: currentRevenue,
      percentage,
      remainingDays,
      dailySalesNeeded,
      tattoosNeeded,
      realConversionRate,
      expectedConversionRate,
      leadsNeeded,
      realTicketAverage,
      necessaryTicketAverage
    };
  }, [selectedGoal, selectedYear, selectedMonth, sessions, clients, isCurrentMonth]);

  const calculatePeriodRevenue = (year: number, month: number) => {
    // Receitas da Agenda
    const agendaRevenue = sessions
      .filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.getFullYear() === year &&
               sessionDate.getMonth() + 1 === month &&
               session.status === 'realizado';
      })
      .reduce((sum, session) => sum + session.value, 0);

    // Receitas das Comandas
    const comandaRevenue = comandas
      .filter(comanda => {
        const comandaDate = new Date(comanda.date);
        return comandaDate.getFullYear() === year &&
               comandaDate.getMonth() + 1 === month &&
               comanda.status === 'fechada';
      })
      .reduce((sum, comanda) => {
        return sum + comanda.clients
          .filter(client => client.payment)
          .reduce((clientSum, client) => clientSum + (client.payment?.netValue || 0), 0);
      }, 0);

    return agendaRevenue + comandaRevenue;
  };

  const handleSaveGoal = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Recalcular current e percentage com dados atuais
      const currentRevenue = calculatePeriodRevenue(selectedYear, selectedMonth);
      const percentage = goalData.target > 0 ? (currentRevenue / goalData.target) * 100 : 0;

      const updatedGoalData = {
        ...goalData,
        current: currentRevenue,
        percentage
      };

      await updateGoal(updatedGoalData);
      setIsFormOpen(false);
      setEditingGoal(null);
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      throw error;
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleNewGoal = () => {
    setEditingGoal(null);
    setIsFormOpen(true);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="hidden lg:block">
          <h2 className="text-2xl font-bold">Metas Operacionais</h2>
          <p className="text-muted-foreground">Configure metas e acompanhe cálculos operacionais</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewGoal}>
              <Plus className="h-4 w-4 mr-2" />
              {selectedGoal ? 'Editar Meta' : 'Nova Meta'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Editar Meta' : 'Criar Nova Meta'}
              </DialogTitle>
            </DialogHeader>
            <GoalForm
              goal={editingGoal || undefined}
              month={selectedMonthStr}
              onSave={handleSaveGoal}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingGoal(null);
              }}
              isEditing={!!editingGoal}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Seletor de Período */}
      <PeriodSelector
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onPeriodChange={(year, month) => {
          setSelectedYear(year);
          setSelectedMonth(month);
        }}
      />

      {/* Meta Atual */}
      {selectedGoal ? (
        <div className="space-y-6">
          {/* Resumo da Meta */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Meta de {formatMonth(selectedGoal.month)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {goalMetrics.percentage >= 100 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditGoal(selectedGoal)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Progresso</span>
                  <span className="text-sm font-medium">
                    {goalMetrics.percentage.toFixed(1)}%
                  </span>
                </div>
                
                <Progress 
                  value={Math.min(goalMetrics.percentage, 100)} 
                  className="h-3"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Atual</p>
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(goalMetrics.current)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Meta</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(goalMetrics.target)}
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {goalMetrics.percentage >= 100 ? (
                      <span className="text-green-600 font-medium">🎉 Meta atingida! Parabéns!</span>
                    ) : (
                      <>Faltam {formatCurrency(Math.max(0, goalMetrics.target - goalMetrics.current))} para atingir a meta</>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas Operacionais */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Métricas Operacionais
            </h3>
            <GoalMetricsDisplay metrics={goalMetrics} isCurrentMonth={isCurrentMonth} />
          </div>

          {/* Configurações da Meta */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Meta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Dias Disponíveis</p>
                  <p className="font-medium">{selectedGoal.availableDays} dias</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ticket Médio Desejado</p>
                  <p className="font-medium">
                    {selectedGoal.desiredTicketAverage 
                      ? formatCurrency(selectedGoal.desiredTicketAverage)
                      : 'Automático'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Conversão Esperada</p>
                  <p className="font-medium">
                    {selectedGoal.expectedConversion 
                      ? `${selectedGoal.expectedConversion}%`
                      : 'Automática'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Última Atualização</p>
                  <p className="font-medium">
                    {selectedGoal.updatedAt 
                      ? new Date(selectedGoal.updatedAt).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <Target className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
          <h3 className="font-medium mb-2">Nenhuma meta definida para {formatMonth(selectedMonthStr)}</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Configure sua meta mensal e acompanhe os cálculos operacionais
          </p>
          <Button onClick={handleNewGoal}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Meta do Mês
          </Button>
        </div>
      )}

      {/* Histórico de Metas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Metas</CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals
                .sort((a, b) => b.month.localeCompare(a.month))
                .map((goal) => {
                  const isCurrentGoal = goal.month === selectedMonthStr;
                  const revenue = calculatePeriodRevenue(
                    parseInt(goal.month.split('-')[0]),
                    parseInt(goal.month.split('-')[1])
                  );
                  const percentage = goal.target > 0 ? (revenue / goal.target) * 100 : 0;
                  
                  return (
                    <div
                      key={goal.id}
                      className={`p-4 border rounded-lg ${
                        isCurrentGoal ? 'border-primary/20 bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{formatMonth(goal.month)}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={percentage >= 100 ? 'default' : 'secondary'}>
                            {percentage.toFixed(1)}%
                          </Badge>
                          {percentage >= 100 && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const [year, month] = goal.month.split('-');
                              setSelectedYear(parseInt(year));
                              setSelectedMonth(parseInt(month));
                            }}
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                      
                      <Progress value={Math.min(percentage, 100)} className="mb-3" />
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Atual</p>
                          <p className="font-medium">{formatCurrency(revenue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Meta</p>
                          <p className="font-medium">{formatCurrency(goal.target)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Diferença</p>
                          <p className={`font-medium ${
                            revenue >= goal.target ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {revenue >= goal.target ? '+' : ''}
                            {formatCurrency(revenue - goal.target)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">Nenhuma meta histórica</h3>
              <p className="text-sm mb-4">
                Crie metas mensais para acompanhar seu histórico de performance
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}