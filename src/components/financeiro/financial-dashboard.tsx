"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useApp } from '@/contexts/app-context';
import { Transaction } from '@/lib/types';
import { toast } from 'sonner';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  CreditCard,
  Banknote,
  PiggyBank,
  Calculator,
  Loader2
} from 'lucide-react';

interface TransactionFormProps {
  onSave: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  onCancel: () => void;
}

function TransactionForm({ onSave, onCancel }: TransactionFormProps) {
  const { user } = useApp();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    type: 'receita' as Transaction['type'],
    description: '',
    value: '',
    category: '',
    paymentMethod: '' as Transaction['paymentMethod'] | '',
    installments: '1',
    grossValue: '',
    fees: ''
  });

  // Taxas padrão de cartão
  const cardRates = {
    'credito-vista': 3.5,
    'credito-parcelado': 4.5,
    'debito': 2.5,
    'pix': 0
  };

  const calculateCardFees = () => {
    if (!formData.grossValue || !formData.paymentMethod) return;
    
    const grossValue = parseFloat(formData.grossValue.replace(',', '.'));
    if (isNaN(grossValue)) return;

    let rate = 0;
    switch (formData.paymentMethod) {
      case 'credito-vista':
        rate = cardRates['credito-vista'];
        break;
      case 'credito-parcelado':
        rate = cardRates['credito-parcelado'];
        break;
      case 'debito':
        rate = cardRates['debito'];
        break;
      case 'pix':
        rate = cardRates['pix'];
        break;
    }

    const fees = (grossValue * rate) / 100;
    const netValue = grossValue - fees;

    setFormData(prev => ({
      ...prev,
      fees: fees.toFixed(2),
      value: netValue.toFixed(2)
    }));
  };

  React.useEffect(() => {
    if (formData.type === 'receita' && formData.grossValue && formData.paymentMethod) {
      calculateCardFees();
    }
  }, [formData.grossValue, formData.paymentMethod]);

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
      const transaction: Omit<Transaction, 'id'> = {
        tattooerId: user?.id || '1',
        type: formData.type,
        description: formData.description,
        value: parseFloat(formData.value.replace(',', '.')),
        date: new Date(),
        category: formData.category,
        paymentMethod: formData.paymentMethod || undefined,
        grossValue: formData.grossValue ? parseFloat(formData.grossValue.replace(',', '.')) : undefined,
        fees: formData.fees ? parseFloat(formData.fees.replace(',', '.')) : undefined,
        installments: formData.installments ? parseInt(formData.installments) : undefined
      };

      await onSave(transaction);
      toast.success('Transação adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      toast.error('Erro ao adicionar transação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const revenueCategories = [
    'Tatuagem',
    'Retoque',
    'Desenho',
    'Consultoria',
    'Produtos',
    'Outros'
  ];

  const expenseCategories = [
    'Material',
    'Aluguel',
    'Energia',
    'Internet',
    'Marketing',
    'Transporte',
    'Alimentação',
    'Outros'
  ];

  const paymentMethods = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'pix', label: 'PIX' },
    { value: 'debito', label: 'Cartão de Débito' },
    { value: 'credito-vista', label: 'Cartão de Crédito à Vista' },
    { value: 'credito-parcelado', label: 'Cartão de Crédito Parcelado' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Tipo de Transação</Label>
        <Select value={formData.type} onValueChange={(value: Transaction['type']) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="receita">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Receita
              </div>
            </SelectItem>
            <SelectItem value="despesa">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                Despesa
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Descrição *</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Ex: Tatuagem fine line braço"
          required
        />
      </div>

      {formData.type === 'receita' && (
        <>
          <div>
            <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
            <Select value={formData.paymentMethod || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value as Transaction['paymentMethod'] }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map(method => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.paymentMethod && ['credito-vista', 'credito-parcelado', 'debito', 'pix'].includes(formData.paymentMethod) && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">
                  Calculadora de Taxas
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="grossValue">Valor Bruto (R$)</Label>
                  <Input
                    id="grossValue"
                    value={formData.grossValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, grossValue: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>
                
                <div>
                  <Label>Taxa ({cardRates[formData.paymentMethod as keyof typeof cardRates]}%)</Label>
                  <Input
                    value={formData.fees}
                    readOnly
                    placeholder="0,00"
                    className="bg-muted"
                  />
                </div>
                
                <div>
                  <Label>Valor Líquido</Label>
                  <Input
                    value={formData.value}
                    readOnly
                    placeholder="0,00"
                    className="bg-muted font-medium"
                  />
                </div>
              </div>

              {formData.paymentMethod === 'credito-parcelado' && (
                <div className="mt-4">
                  <Label htmlFor="installments">Número de Parcelas</Label>
                  <Select value={formData.installments} onValueChange={(value) => setFormData(prev => ({ ...prev, installments: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}x
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {(!formData.paymentMethod || !['credito-vista', 'credito-parcelado', 'debito', 'pix'].includes(formData.paymentMethod)) && (
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
      )}

      <div>
        <Label htmlFor="category">Categoria *</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {(formData.type === 'receita' ? revenueCategories : expenseCategories).map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Adicionar Transação
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function FinancialDashboard() {
  const { transactions, addTransaction } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyRevenue = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             t.type === 'receita';
    })
    .reduce((sum, t) => sum + t.value, 0);

  const monthlyExpenses = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             t.type === 'despesa';
    })
    .reduce((sum, t) => sum + t.value, 0);

  const netProfit = monthlyRevenue - monthlyExpenses;

  const totalCardFees = transactions
    .filter(t => t.fees && t.type === 'receita')
    .reduce((sum, t) => sum + (t.fees || 0), 0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSaveTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    try {
      await addTransaction(transactionData);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financeiro</h2>
          <p className="text-muted-foreground">Controle suas receitas e despesas</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Transação</DialogTitle>
            </DialogHeader>
            <TransactionForm
              onSave={handleSaveTransaction}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Métricas Financeiras */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.type === 'receita').length} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Mensais</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(monthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.type === 'despesa').length} transações
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
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxas de Cartão</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalCardFees)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total em taxas pagas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'receita' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                      }`}>
                        {transaction.type === 'receita' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{transaction.category}</span>
                          {transaction.paymentMethod && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{transaction.paymentMethod.replace('-', ' ')}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.value)}
                      </p>
                      {transaction.fees && (
                        <p className="text-xs text-muted-foreground">
                          Taxa: {formatCurrency(transaction.fees)}
                        </p>
                      )}
                      {transaction.grossValue && (
                        <p className="text-xs text-muted-foreground">
                          Bruto: {formatCurrency(transaction.grossValue)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">Nenhuma transação registrada</h3>
              <p className="text-sm mb-4">
                Comece adicionando suas receitas e despesas
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Primeira Transação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}