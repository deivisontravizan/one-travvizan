"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/app-context';
import { Goal } from '@/lib/types';
import { toast } from 'sonner';
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  DollarSign,
  Edit,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface GoalFormProps {
  goal?: Goal;
  onSave: (goalData: Omit<Goal, 'id'>) => Promise<void>;
  onCancel: () => void;
}

function GoalForm({ goal, onSave, onCancel }: GoalFormProps) {
  const { user, transactions } = useApp();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    month: goal?.month || new Date().toISOString().slice(0, 7), // YYYY-MM
    target: goal?.target.toString() || ''
  });

  const calculateCurrentValue = (month: string) => {
    const [year, monthNum] = month.split('-');
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getFullYear() === parseInt(year) &&
             transactionDate.getMonth() === parseInt(monthNum) - 1 &&
             t.type === 'receita';
    });
    
    return monthlyTransactions.reduce((sum, t) => sum + t.value, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.month) {
      toast.error('Mês é obrigatório');
      return;
    }
    
    if (!formData.target.trim()) {
      toast.error('Meta de faturamento é obrigatória');
      return;
    }
    
    const targetValue = parseFloat(formData.target.replace(',', '.'));
    if (isNaN(targetValue) || targetValue <= 0) {
      toast.error('Meta deve ser um valor válido maior que zero');
      return;
    }

    setSaving(true);

    try {
      const current = calculateCurrentValue(formData.month);
      const percentage = targetValue > 0 ? (current / targetValue) * 100 : 0;

      const goalData: Omit<Goal, 'id'> = {
        tattooerId: user?.id || '1',
        month: formData.month,
        target: targetValue,
        current,
        percentage
      };

      await onSave(goalData);
      toast.success(goal ? 'Meta atualizada com sucesso!' : 'Meta criada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      toast.error('Erro ao salvar meta. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const previewCurrent = calculateCurrentValue(formData.month);
  const previewTarget = parseFloat(formData.target.replace(',', '.')) || 0;
  const previewPercentage = previewTarget > 0 ? (previewCurrent / previewTarget) * 100 : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="month">Mês *</Label>
        <Input
          id="month"
          type="month"
          value={formData.month}
          onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
          required
          className={!formData.month ? 'border-red-300' : ''}
        />
      </div>

      <div>
        <Label htmlFor="target">Meta de Faturamento (R$) *</Label>
        <Input
          id="target"
          type="text"
          value={formData.target}
          onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
          placeholder="8000,00"
          required
          className={!formData.target.trim() ? 'border-red-300' : ''}
        />
      </div>

      {/* Preview da Meta */}
      {formData.month && formData.target && previewTarget > 0 && (
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <h4 className="font-medium text-sm">Preview da Meta</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso atual:</span>
              <span className="font-medium">{previewPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(previewPercentage, 100)} className="h-2" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Atual: </span>
                <span className="font-medium">R$ {previewCurrent.toLocaleString('pt-BR')}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Meta: </span>
                <span className="font-medium">R$ {previewTarget.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {goal ? 'Atualizar Meta' : 'Criar Meta'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function GoalsPanel() {
  const { goals, updateGoal, transactions } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentGoal = goals.find(g => g.month === currentMonth);

  // Recalcular progresso das metas baseado nas transações atuais
  const recalculateGoalProgress = (goal: Goal) => {
    const [year, monthNum] = goal.month.split('-');
    const monthlyRevenue = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getFullYear() === parseInt(year) &&
             transactionDate.getMonth() === parseInt(monthNum) - 1 &&
             t.type === 'receita';
    }).reduce((sum, t) => sum + t.value, 0);

    return {
      ...goal,
      current: monthlyRevenue,
      percentage: goal.target > 0 ? (monthlyRevenue / goal.target) * 100 : 0
    };
  };

  const handleSaveGoal = async (goalData: Omit<Goal, 'id'>) => {
    try {
      await updateGoal(goalData);
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
          <h2 className="text-2xl font-bold">Metas</h2>
          <p className="text-muted-foreground">Acompanhe seu progresso mensal</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewGoal}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Editar Meta' : 'Criar Nova Meta'}
              </DialogTitle>
            </DialogHeader>
            <GoalForm
              goal={editingGoal || undefined}
              onSave={handleSaveGoal}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingGoal(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Meta Atual */}
      {currentGoal && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Meta de {formatMonth(currentGoal.month)}
              </CardTitle>
              <div className="flex items-center gap-2">
                {recalculateGoalProgress(currentGoal).percentage >= 100 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditGoal(currentGoal)}
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
                  {recalculateGoalProgress(currentGoal).percentage.toFixed(1)}%
                </span>
              </div>
              
              <Progress 
                value={Math.min(recalculateGoalProgress(currentGoal).percentage, 100)} 
                className="h-3"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Atual</p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(recalculateGoalProgress(currentGoal).current)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Meta</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(currentGoal.target)}
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {recalculateGoalProgress(currentGoal).percentage >= 100 ? (
                    <span className="text-green-600 font-medium">🎉 Meta atingida! Parabéns!</span>
                  ) : (
                    <>Faltam {formatCurrency(Math.max(0, currentGoal.target - recalculateGoalProgress(currentGoal).current))} para atingir a meta</>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                  const updatedGoal = recalculateGoalProgress(goal);
                  const isCurrentMonth = goal.month === currentMonth;
                  
                  return (
                    <div
                      key={goal.id}
                      className={`p-4 border rounded-lg ${
                        isCurrentMonth ? 'border-primary/20 bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{formatMonth(goal.month)}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={updatedGoal.percentage >= 100 ? 'default' : 'secondary'}>
                            {updatedGoal.percentage.toFixed(1)}%
                          </Badge>
                          {updatedGoal.percentage >= 100 && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditGoal(goal)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <Progress value={Math.min(updatedGoal.percentage, 100)} className="mb-3" />
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Atual</p>
                          <p className="font-medium">{formatCurrency(updatedGoal.current)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Meta</p>
                          <p className="font-medium">{formatCurrency(goal.target)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Diferença</p>
                          <p className={`font-medium ${
                            updatedGoal.current >= goal.target ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {updatedGoal.current >= goal.target ? '+' : ''}
                            {formatCurrency(updatedGoal.current - goal.target)}
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
              <h3 className="font-medium mb-2">Nenhuma meta definida</h3>
              <p className="text-sm mb-4">
                Defina suas metas mensais para acompanhar seu progresso
              </p>
              <Button onClick={handleNewGoal}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Meta
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Média Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.length > 0 
                ? formatCurrency(goals.reduce((sum, g) => sum + recalculateGoalProgress(g).current, 0) / goals.length)
                : 'R$ 0'
              }
            </div>
            <p className="text-xs text-muted-foreground">Últimos {goals.length} meses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {goals.length > 0
                ? Math.round((goals.filter(g => recalculateGoalProgress(g).percentage >= 100).length / goals.length) * 100)
                : 0
              }%
            </div>
            <p className="text-xs text-muted-foreground">Metas atingidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Melhor Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {goals.length > 0
                ? Math.max(...goals.map(g => recalculateGoalProgress(g).percentage)).toFixed(0)
                : 0
              }%
            </div>
            <p className="text-xs text-muted-foreground">Maior progresso</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}