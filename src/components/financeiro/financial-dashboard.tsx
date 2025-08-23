"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { Transaction, ExpenseCategory } from '@/lib/types';
import { PeriodSelector } from './period-selector';
import { ExpenseCategories } from './expense-categories';
import { FinancialChart } from './financial-chart';
import { toast } from 'sonner';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  PiggyBank,
  CreditCard,
  Calculator,
  Loader2,
  AlertCircle,
  Calendar,
  Receipt
} from 'lucide-react';

interface ExpenseFormProps {
  categories: ExpenseCategory[];
  onSave: (expense: Omit<Transaction, 'id'>) => Promise<void>;
  onCancel: () => void;
  onCreateCategory: (category: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

function ExpenseForm({ categories, onSave, onCancel, onCreateCategory }: ExpenseFormProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    value: '',
    category: '',
    date: new Date().toISOString().slice(0, 10)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }
    
    if (!formData.value) {
      toast.error('Valor é obrigatório');
      return;
    }
    
    if (!formData.category) {
      toast.error('Categoria é obrigatória');
      return;
    }

    setSaving(true);

    try {
      const expense: Omit<Transaction, 'id'> = {
        tattooerId: user?.id || '',
        type: 'despesa',
        description: formData.description,
        value: parseFloat(formData.value.replace(',', '.')),
        date: new Date(formData.date),
        category: formData.category
      };

      await onSave(expense);
      toast.success('Despesa registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      toast.error('Erro ao registrar despesa. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    try {
      await onCreateCategory({
        name: newCategoryName.trim(),
        tattooerId: user?.id || ''
      });
      
      setFormData(prev => ({ ...prev, category: newCategoryName.trim() }));
      setNewCategoryName('');
      setIsCreatingCategory(false);
      toast.success('Categoria criada!');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="description">Descrição *</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Ex: Compra de material, aluguel do estúdio..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="value">Valor (R$) *</Label>
          <Input
            id="value"
            value={formData.value}
            onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
            placeholder="0,00"
            required
          />
        </div>

        <div>
          <Label htmlFor="date">Data *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">Categoria *</Label>
        <div className="flex gap-2">
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isCreatingCategory} onOpenChange={setIsCreatingCategory}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Categoria</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newCategory">Nome da Categoria</Label>
                  <Input
                    id="newCategory"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ex: Material, Marketing..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateCategory} className="flex-1">
                    Criar Categoria
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreatingCategory(false);
                      setNewCategoryName('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Registrar Despesa
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function FinancialDashboard() {
  const { transactions, addTransaction, sessions, comandas } = useApp();
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([
    // Categorias padrão
    { id: '1', name: 'Material', tattooerId: '1', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', name: 'Aluguel', tattooerId: '1', createdAt: new Date(), updatedAt: new Date() },
    { id: '3', name: 'Marketing', tattooerId: '1', createdAt: new Date(), updatedAt: new Date() },
    { id: '4', name: 'Transporte', tattooerId: '1', createdAt: new Date(), updatedAt: new Date() }
  ]);

  // Calcular receitas automáticas da Agenda
  const revenueFromAgenda = useMemo(() => {
    return sessions
      .filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.getFullYear() === selectedYear &&
               sessionDate.getMonth() + 1 === selectedMonth &&
               session.status === 'realizado';
      })
      .reduce((sum, session) => sum + session.value, 0);
  }, [sessions, selectedYear, selectedMonth]);

  // Calcular receitas automáticas das Comandas
  const revenueFromComandas = useMemo(() => {
    return comandas
      .filter(comanda => {
        const comandaDate = new Date(comanda.date);
        return comandaDate.getFullYear() === selectedYear &&
               comandaDate.getMonth() + 1 === selectedMonth &&
               comanda.status === 'fechada';
      })
      .reduce((sum, comanda) => {
        return sum + comanda.clients
          .filter(client => client.payment)
          .reduce((clientSum, client) => clientSum + (client.payment?.netValue || 0), 0);
      }, 0);
  }, [comandas, selectedYear, selectedMonth]);

  // Calcular despesas do período
  const monthlyExpenses = useMemo(() => {
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === selectedYear &&
               transactionDate.getMonth() + 1 === selectedMonth &&
               t.type === 'despesa';
      })
      .reduce((sum, t) => sum + t.value, 0);
  }, [transactions, selectedYear, selectedMonth]);

  // Totais do período
  const grossRevenue = revenueFromAgenda + revenueFromComandas;
  const netProfit = grossRevenue - monthlyExpenses;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSaveExpense = async (expenseData: Omit<Transaction, 'id'>) => {
    try {
      await addTransaction(expenseData);
      setIsExpenseFormOpen(false);
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      throw error;
    }
  };

  const handleCreateCategory = async (categoryData: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCategory: ExpenseCategory = {
        id: Date.now().toString(),
        ...categoryData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setExpenseCategories(prev => [...prev, newCategory]);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  };

  const handleUpdateCategory = async (id: string, updates: Partial<ExpenseCategory>) => {
    setExpenseCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, ...updates, updatedAt: new Date() } : cat
    ));
  };

  const handleDeleteCategory = async (id: string) => {
    setExpenseCategories(prev => prev.filter(cat => cat.id !== id));
  };

  // Dados para o gráfico (últimos 12 meses)
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

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

      // Despesas
      const expenses = transactions
        .filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getFullYear() === year &&
                 transactionDate.getMonth() + 1 === month &&
                 t.type === 'despesa';
        })
        .reduce((sum, t) => sum + t.value, 0);

      const grossRev = agendaRevenue + comandaRevenue;

      data.push({
        year,
        month,
        grossRevenue: grossRev,
        totalExpenses: expenses,
        netProfit: grossRev - expenses,
        revenueFromAgenda: agendaRevenue,
        revenueFromComandas: comandaRevenue
      });
    }
    return data;
  }, [sessions, comandas, transactions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financeiro</h2>
          <p className="text-muted-foreground">Acompanhe faturamento e gerencie despesas</p>
        </div>
        
        <Dialog open={isExpenseFormOpen} onOpenChange={setIsExpenseFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Despesa</DialogTitle>
            </DialogHeader>
            <ExpenseForm
              categories={expenseCategories}
              onSave={handleSaveExpense}
              onCancel={() => setIsExpenseFormOpen(false)}
              onCreateCategory={handleCreateCategory}
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

      {/* Aviso sobre receitas automáticas */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200 text-sm">
                💡 Receitas são registradas automaticamente
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                O faturamento é calculado automaticamente a partir de sessões realizadas na Agenda e comandas fechadas. 
                Registre apenas suas despesas aqui.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Financeiras */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Bruto</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(grossRevenue)}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Agenda: {formatCurrency(revenueFromAgenda)}</p>
              <p>Comandas: {formatCurrency(revenueFromComandas)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(monthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.type === 'despesa').length} lançamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <PiggyBank className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Faturamento - Despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <Calculator className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Lucro / Faturamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução */}
      <FinancialChart data={chartData} selectedYear={selectedYear} />

      {/* Gerenciamento de Categorias */}
      <ExpenseCategories
        categories={expenseCategories}
        onCreateCategory={handleCreateCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Lista de Despesas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Despesas do Período</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getFullYear() === selectedYear &&
                   transactionDate.getMonth() + 1 === selectedMonth &&
                   t.type === 'despesa';
          }).length > 0 ? (
            <div className="space-y-4">
              {transactions
                .filter(t => {
                  const transactionDate = new Date(t.date);
                  return transactionDate.getFullYear() === selectedYear &&
                         transactionDate.getMonth() + 1 === selectedMonth &&
                         t.type === 'despesa';
                })
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{transaction.category}</Badge>
                          <span>•</span>
                          <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        -{formatCurrency(transaction.value)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">Nenhuma despesa registrada</h3>
              <p className="text-sm mb-4">
                Registre suas despesas para acompanhar o lucro líquido
              </p>
              <Button onClick={() => setIsExpenseFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Primeira Despesa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}