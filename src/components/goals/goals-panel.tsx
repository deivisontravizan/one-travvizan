"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/app-context';
import {
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  Edit,
  Check,
  X
} from 'lucide-react';

export function GoalsPanel() {
  const { goals, setGoals, transactions } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [newTarget, setNewTarget] = useState('');

  const currentGoal = goals[0];
  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  
  // Calcular receita atual do mês
  const currentMonthRevenue = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      const now = new Date();
      return t.type === 'receita' && 
             transactionDate.getMonth() === now.getMonth() &&
             transactionDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + t.value, 0);

  const progressPercentage = currentGoal ? (currentMonthRevenue / currentGoal.target) * 100 : 0;
  const remainingAmount = currentGoal ? currentGoal.target - currentMonthRevenue : 0;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const remainingDays = daysInMonth - currentDay;
  const dailyTarget = remainingDays > 0 ? remainingAmount / remainingDays : 0;

  const handleUpdateGoal = () => {
    if (newTarget && currentGoal) {
      const updatedGoal = {
        ...currentGoal,
        target: parseFloat(newTarget),
        current: currentMonthRevenue,
        percentage: (currentMonthRevenue / parseFloat(newTarget)) * 100
      };
      
      setGoals([updatedGoal]);
      setIsEditing(false);
      setNewTarget('');
    }
  };

  const getProgressColor = () => {
    if (progressPercentage >= 100) return 'bg-green-500';
    if (progressPercentage >= 75) return 'bg-blue-500';
    if (progressPercentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusMessage = () => {
    if (progressPercentage >= 100) return 'Meta alcançada! 🎉';
    if (progressPercentage >= 75) return 'Muito bem! Você está quase lá!';
    if (progressPercentage >= 50) return 'No caminho certo, continue assim!';
    return 'Vamos acelerar para alcançar a meta!';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Metas e Produtividade</h2>
        <Button
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar Meta
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Meta Principal */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Meta de {currentMonth}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="target">Nova Meta (R$)</Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="Ex: 8000"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateGoal}>
                    <Check className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold">
                    {progressPercentage.toFixed(0)}%
                  </div>
                  <p className="text-muted-foreground">{getStatusMessage()}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>R$ {currentMonthRevenue.toLocaleString('pt-BR')} / R$ {currentGoal?.target.toLocaleString('pt-BR')}</span>
                  </div>
                  <Progress value={Math.min(progressPercentage, 100)} className="h-3" />
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      R$ {currentMonthRevenue.toLocaleString('pt-BR')}
                    </div>
                    <p className="text-xs text-muted-foreground">Faturado</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      R$ {remainingAmount.toLocaleString('pt-BR')}
                    </div>
                    <p className="text-xs text-muted-foreground">Restante</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      R$ {dailyTarget.toLocaleString('pt-BR')}
                    </div>
                    <p className="text-xs text-muted-foreground">Meta/dia</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Dias restantes</span>
              <span className="font-medium">{remainingDays} dias</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sessões realizadas</span>
              <span className="font-medium">12 sessões</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Ticket médio</span>
              <span className="font-medium">R$ 650</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Taxa de conversão</span>
              <span className="font-medium">68%</span>
            </div>
          </CardContent>
        </Card>

        {/* Dicas IA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Dicas para Alcançar a Meta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm">💡 Você precisa de mais {Math.ceil(remainingAmount / 650)} sessões para alcançar sua meta</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm">🎯 Foque em clientes de ticket alto (R$ 800+)</p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <p className="text-sm">📱 Responda leads pendentes para aumentar conversões</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}