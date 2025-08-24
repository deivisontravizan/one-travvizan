"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { Comanda, ComandaClient, ComandaPayment, Session, Client } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Receipt,
  Plus,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Loader2,
  Edit,
  Trash2,
  Lock,
  CalendarIcon,
  X,
  Filter,
  Users,
  UserCheck,
  Info
} from 'lucide-react';

interface PaymentFormProps {
  comandaClient: ComandaClient;
  onSave: (payment: Omit<ComandaPayment, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
  sessionInfo?: {
    signalPaid: number;
    remainingValue: number;
    totalValue: number;
  };
}

function PaymentForm({ comandaClient, onSave, onCancel, sessionInfo }: PaymentFormProps) {
  const { taxSettings } = useApp();
  const [saving, setSaving] = useState(false);
  
  // ✅ CORREÇÃO: Calcular valor restante corretamente
  const calculateRemainingValue = () => {
    const totalPaid = calculateTotalPaid(comandaClient);
    const signalPaid = sessionInfo?.signalPaid || 0;
    const totalValue = comandaClient.value;
    
    // Se há informação de sessão, usar o valor restante da sessão
    if (sessionInfo) {
      return sessionInfo.remainingValue;
    }
    
    // Senão, calcular baseado no valor total menos o que já foi pago
    return totalValue - totalPaid;
  };

  const remainingValue = calculateRemainingValue();
  
  const [payments, setPayments] = useState<Array<{
    method: ComandaPayment['method'];
    value: string;
    installments: number;
    feesPaidByClient: boolean;
  }>>([{
    method: 'dinheiro',
    value: remainingValue > 0 ? remainingValue.toFixed(2).replace('.', ',') : '',
    installments: 1,
    feesPaidByClient: false
  }]);

  // Função para calcular total pago de um cliente
  const calculateTotalPaid = (client: ComandaClient) => {
    try {
      if (!client || !client.payments || !Array.isArray(client.payments)) {
        return 0;
      }
      return client.payments.reduce((sum, payment) => {
        if (!payment || typeof payment.netValue !== 'number') {
          return sum;
        }
        return sum + payment.netValue;
      }, 0);
    } catch (error) {
      console.error('Erro ao calcular total pago:', error);
      return 0;
    }
  };

  // Função para obter taxa configurada
  const getCardRate = (method: string, installments?: number) => {
    if (!taxSettings) {
      const defaultRates = {
        'credito-vista': 3.5,
        'credito-parcelado': 4.5,
        'debito': 2.5,
        'pix': 0
      };
      return defaultRates[method as keyof typeof defaultRates] || 0;
    }

    switch (method) {
      case 'credito-vista':
        return taxSettings.creditCardCashRate;
      case 'credito-parcelado':
        if (installments === 2) {
          return taxSettings.installmentRates?.twoInstallments || taxSettings.creditCardInstallmentRate;
        } else if (installments === 3) {
          return taxSettings.installmentRates?.threeInstallments || taxSettings.creditCardInstallmentRate;
        } else if (installments === 4) {
          return taxSettings.installmentRates?.fourInstallments || taxSettings.creditCardInstallmentRate;
        } else if (installments === 5) {
          return taxSettings.installmentRates?.fiveInstallments || taxSettings.creditCardInstallmentRate;
        } else if (installments === 6) {
          return taxSettings.installmentRates?.sixInstallments || taxSettings.creditCardInstallmentRate;
        } else if (installments === 7) {
          return taxSettings.installmentRates?.sevenInstallments || taxSettings.creditCardInstallmentRate;
        } else if (installments === 8) {
          return taxSettings.installmentRates?.eightInstallments || taxSettings.creditCardInstallmentRate;
        } else if (installments === 9) {
          return taxSettings.installmentRates?.nineInstallments || taxSettings.creditCardInstallmentRate;
        } else if (installments === 10) {
          return taxSettings.installmentRates?.tenInstallments || taxSettings.creditCardInstallmentRate;
        } else if (installments === 11) {
          return taxSettings.installmentRates?.elevenInstallments || taxSettings.creditCardInstallmentRate;
        } else if (installments === 12) {
          return taxSettings.installmentRates?.twelveInstallments || taxSettings.creditCardInstallmentRate;
        }
        return taxSettings.creditCardInstallmentRate;
      case 'debito':
        return taxSettings.debitCardRate;
      case 'pix':
        return taxSettings.pixRate;
      default:
        return 0;
    }
  };

  // Calcular valores para um pagamento específico
  const calculatePaymentValues = (payment: typeof payments[0]) => {
    const value = parseFloat(payment.value.replace(',', '.'));
    if (isNaN(value) || value <= 0) return { grossValue: 0, netValue: 0, fees: 0 };

    let rate = 0;
    if (['credito-vista', 'credito-parcelado', 'debito', 'pix'].includes(payment.method)) {
      rate = getCardRate(payment.method, payment.installments);
    }

    let grossValue: number;
    let netValue: number;
    let fees: number;

    if (payment.feesPaidByClient) {
      // Cliente paga as taxas: valor informado é líquido, calcular bruto
      netValue = value;
      fees = (value * rate) / (100 - rate);
      grossValue = netValue + fees;
    } else {
      // Estabelecimento paga as taxas: valor informado é bruto, calcular líquido
      grossValue = value;
      fees = (grossValue * rate) / 100;
      netValue = grossValue - fees;
    }

    return { grossValue, netValue, fees };
  };

  const addPaymentMethod = () => {
    setPayments(prev => [...prev, {
      method: 'dinheiro',
      value: '',
      installments: 1,
      feesPaidByClient: false
    }]);
  };

  const removePaymentMethod = (index: number) => {
    if (payments.length > 1) {
      setPayments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updatePayment = (index: number, updates: Partial<typeof payments[0]>) => {
    setPayments(prev => prev.map((payment, i) => 
      i === index ? { ...payment, ...updates } : payment
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar se todos os pagamentos têm valor
    const hasEmptyValues = payments.some(p => !p.value || parseFloat(p.value.replace(',', '.')) <= 0);
    if (hasEmptyValues) {
      toast.error('Todos os pagamentos devem ter valor maior que zero');
      return;
    }

    setSaving(true);

    try {
      // Processar cada pagamento
      for (const payment of payments) {
        const { grossValue, netValue, fees } = calculatePaymentValues(payment);

        const paymentData: Omit<ComandaPayment, 'id' | 'createdAt'> = {
          comandaClientId: comandaClient.id,
          method: payment.method,
          grossValue,
          netValue,
          fees,
          installments: payment.method === 'credito-parcelado' ? payment.installments : undefined,
          feesPaidByClient: payment.feesPaidByClient
        };

        await onSave(paymentData);
      }
      
      toast.success('Pagamento registrado com sucesso! Cliente marcado como PAGO.');
      onCancel(); // Fechar o modal
    } catch (error) {
      console.error('Erro ao salvar pagamentos:', error);
      toast.error('Erro ao registrar pagamentos. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const paymentMethods = [
    { value: 'dinheiro', label: 'Dinheiro', icon: Banknote },
    { value: 'pix', label: 'PIX', icon: Smartphone },
    { value: 'debito', label: 'Cartão de Débito', icon: CreditCard },
    { value: 'credito-vista', label: 'Cartão de Crédito à Vista', icon: CreditCard },
    { value: 'credito-parcelado', label: 'Cartão de Crédito Parcelado', icon: CreditCard }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">{comandaClient.clientName}</h4>
        <p className="text-sm text-muted-foreground">{comandaClient.description}</p>
        <p className="text-lg font-bold mt-2">
          {comandaClient.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>

      {/* ✅ INFORMAÇÕES DE PAGAMENTO CONSOLIDADAS */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-blue-600" />
          <h4 className="font-medium text-blue-800 dark:text-blue-200">Resumo do Pagamento</h4>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <label className="text-blue-700 dark:text-blue-300">Valor Total</label>
            <p className="font-bold text-blue-800 dark:text-blue-200">
              {comandaClient.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          {sessionInfo && sessionInfo.signalPaid > 0 && (
            <div>
              <label className="text-green-700 dark:text-green-300">Sinal Já Pago</label>
              <p className="font-bold text-green-800 dark:text-green-200">
                {sessionInfo.signalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          )}
          <div>
            <label className="text-orange-700 dark:text-orange-300">Valor a Pagar</label>
            <p className="font-bold text-orange-800 dark:text-orange-200">
              {remainingValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>
        <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900 rounded text-xs text-blue-800 dark:text-blue-200">
          💡 O valor foi pré-preenchido com o valor restante a pagar.
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Formas de Pagamento</h4>
          <Button type="button" variant="outline" size="sm" onClick={addPaymentMethod}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Forma
          </Button>
        </div>

        {payments.map((payment, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-medium text-sm">Pagamento {index + 1}</h5>
              {payments.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePaymentMethod(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`method-${index}`}>Forma de Pagamento</Label>
                <Select 
                  value={payment.method} 
                  onValueChange={(value: ComandaPayment['method']) => 
                    updatePayment(index, { method: value })
                  }
                >
                  <SelectTrigger id={`method-${index}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(method => {
                      const Icon = method.icon;
                      return (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {method.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor={`value-${index}`}>Valor (R$)</Label>
                <Input
                  id={`value-${index}`}
                  value={payment.value}
                  onChange={(e) => updatePayment(index, { value: e.target.value })}
                  placeholder="0,00"
                />
              </div>
            </div>

            {['credito-vista', 'credito-parcelado', 'debito', 'pix'].includes(payment.method) && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`fees-${index}`}
                    checked={payment.feesPaidByClient}
                    onCheckedChange={(checked) => updatePayment(index, { feesPaidByClient: checked })}
                  />
                  <Label htmlFor={`fees-${index}`} className="text-sm">Cliente paga as taxas</Label>
                </div>

                {payment.method === 'credito-parcelado' && (
                  <div>
                    <Label htmlFor={`installments-${index}`}>Número de Parcelas</Label>
                    <Select 
                      value={payment.installments.toString()} 
                      onValueChange={(value) => updatePayment(index, { installments: parseInt(value) })}
                    >
                      <SelectTrigger id={`installments-${index}`}>
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

                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Valor líquido: {calculatePaymentValues(payment).netValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Registrar Pagamento
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

interface ClientFormProps {
  comandaId: string;
  onSave: (client: Omit<ComandaClient, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}

function ClientForm({ comandaId, onSave, onCancel }: ClientFormProps) {
  const { clients, comandas } = useApp();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    description: '',
    value: ''
  });

  const selectedComanda = comandas.find(c => c.id === comandaId);
  const isComandaOpen = selectedComanda?.status === 'aberta';

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setFormData(prev => ({
      ...prev,
      clientId,
      clientName: client?.name || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isComandaOpen) {
      toast.error('Não é possível adicionar clientes a uma comanda fechada');
      return;
    }
    
    if (!formData.clientName.trim()) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }
    
    if (!formData.value || parseFloat(formData.value.replace(',', '.')) <= 0) {
      toast.error('Valor deve ser maior que zero');
      return;
    }

    setSaving(true);

    try {
      const client: Omit<ComandaClient, 'id' | 'createdAt'> = {
        comandaId,
        clientId: formData.clientId || undefined,
        clientName: formData.clientName,
        description: formData.description,
        value: parseFloat(formData.value.replace(',', '.')),
        status: 'pendente',
        payments: []
      };

      await onSave(client);
      toast.success('Cliente adicionado à comanda!');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error('Erro ao adicionar cliente. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (!isComandaOpen) {
    return (
      <div className="text-center py-8">
        <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="font-medium mb-2">Comanda Fechada</h3>
        <p className="text-sm text-muted-foreground">
          Não é possível adicionar clientes a uma comanda fechada.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="clientSelect">Cliente Cadastrado (Opcional)</Label>
        <Select value={formData.clientId} onValueChange={handleClientSelect}>
          <SelectTrigger id="clientSelect">
            <SelectValue placeholder="Selecione um cliente ou digite um novo" />
          </SelectTrigger>
          <SelectContent>
            {clients.map(client => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="clientName">Nome do Cliente *</Label>
        <Input
          id="clientName"
          value={formData.clientName}
          onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
          placeholder="Nome do cliente"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição do Serviço *</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Ex: Tatuagem fine line braço"
          required
        />
      </div>

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

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Adicionar Cliente
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function ComandaView() {
  const { comandas, sessions, clients, transactions, addComanda, addComandaClient, addComandaPayment, reopenComanda, closeComanda } = useApp();
  const { user } = useAuth();
  const [isComandaFormOpen, setIsComandaFormOpen] = useState(false);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedComanda, setSelectedComanda] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<ComandaClient | null>(null);
  const [selectedSessionInfo, setSelectedSessionInfo] = useState<{
    signalPaid: number;
    remainingValue: number;
    totalValue: number;
  } | undefined>(undefined);
  const [newComandaValue, setNewComandaValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [closingComanda, setClosingComanda] = useState<string | null>(null);
  
  // Estados para filtro de data
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const getTodayDate = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return today;
  };

  const isSameDate = (date1: Date, date2: Date) => {
    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      
      const d1Year = d1.getFullYear();
      const d1Month = d1.getMonth();
      const d1Day = d1.getDate();
      
      const d2Year = d2.getFullYear();
      const d2Month = d2.getMonth();
      const d2Day = d2.getDate();
      
      return d1Year === d2Year && d1Month === d2Month && d1Day === d2Day;
    } catch (error) {
      console.error('Erro ao comparar datas:', error);
      return false;
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // ✅ CORREÇÃO: Função para calcular total pago corretamente
  const calculateTotalPaid = (client: ComandaClient) => {
    try {
      if (!client || !client.payments || !Array.isArray(client.payments)) {
        return 0;
      }
      return client.payments.reduce((sum, payment) => {
        if (!payment || typeof payment.netValue !== 'number') {
          return sum;
        }
        return sum + payment.netValue;
      }, 0);
    } catch (error) {
      console.error('Erro ao calcular total pago:', error);
      return 0;
    }
  };

  // ✅ CORREÇÃO: Função para verificar se cliente está totalmente pago
  const isClientFullyPaid = (client: ComandaClient) => {
    const totalPaid = calculateTotalPaid(client);
    const tolerance = 0.01; // Tolerância para diferenças de centavos
    return Math.abs(totalPaid - client.value) < tolerance;
  };

  const getSignalPaidForSession = (sessionId: string) => {
    try {
      const signalTransactions = transactions.filter(transaction => 
        transaction.sessionId === sessionId && 
        transaction.category === 'Sinal' &&
        transaction.type === 'receita'
      );
      
      return signalTransactions.reduce((sum, transaction) => sum + transaction.value, 0);
    } catch (error) {
      console.error('Erro ao buscar sinal pago:', error);
      return 0;
    }
  };

  const getScheduledSessionsForDate = (date: Date) => {
    try {
      return sessions.filter(session => {
        if (!session || !session.date) return false;
        return isSameDate(new Date(session.date), date);
      });
    } catch (error) {
      console.error('Erro ao buscar sessões agendadas:', error);
      return [];
    }
  };

  const convertSessionToComandaClient = (session: Session): ComandaClient => {
    const client = clients.find(c => c.id === session.clientId);
    const clientName = client?.name || 'Cliente não encontrado';
    
    return {
      id: `session-${session.id}`,
      comandaId: '',
      clientId: session.clientId,
      clientName: clientName,
      sessionId: session.id,
      description: session.description,
      value: session.totalValue || session.value,
      status: 'pendente',
      payments: [],
      createdAt: new Date()
    };
  };

  const getCombinedClientsForDate = (comanda: Comanda) => {
    try {
      if (!comanda || !comanda.date) {
        return [];
      }

      const comandaClients = comanda.clients || [];
      const scheduledSessions = getScheduledSessionsForDate(comanda.date);
      const sessionClients = scheduledSessions.map(session => convertSessionToComandaClient(session));
      
      const filteredSessionClients = sessionClients.filter(sessionClient => {
        return !comandaClients.some(comandaClient => 
          comandaClient.sessionId === sessionClient.sessionId
        );
      });

      return [...comandaClients, ...filteredSessionClients];
    } catch (error) {
      console.error('Erro ao combinar clientes:', error);
      return comanda.clients || [];
    }
  };

  const calculateClientTotals = (combinedClients: ComandaClient[]) => {
    try {
      const totalClients = combinedClients.reduce((sum, client) => {
        if (!client || typeof client.value !== 'number') return sum;
        return sum + client.value;
      }, 0);

      const totalPaid = combinedClients.reduce((sum, client) => {
        if (!client) return sum;
        return sum + calculateTotalPaid(client);
      }, 0);

      return { totalClients, totalPaid, totalPendente: totalClients - totalPaid };
    } catch (error) {
      console.error('Erro ao calcular totais:', error);
      return { totalClients: 0, totalPaid: 0, totalPendente: 0 };
    }
  };

  const filterComandsByDate = useMemo(() => {
    return (comandas: Comanda[]) => {
      try {
        if (!comandas || !Array.isArray(comandas)) {
          return [];
        }

        if (!selectedDate) return comandas;
        
        return comandas.filter(comanda => {
          try {
            if (!comanda || !comanda.date) {
              return false;
            }
            return isSameDate(new Date(comanda.date), selectedDate);
          } catch (error) {
            console.error('Erro ao filtrar comanda por data:', error);
            return false;
          }
        });
      } catch (error) {
        console.error('Erro ao filtrar comandas:', error);
        return [];
      }
    };
  }, [selectedDate]);

  const handleCreateComanda = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComandaValue || parseFloat(newComandaValue.replace(',', '.')) < 0) {
      toast.error('Valor de abertura deve ser maior ou igual a zero');
      return;
    }

    setSaving(true);

    try {
      const todayDate = getTodayDate();
      
      const comanda: Omit<Comanda, 'id' | 'createdAt' | 'updatedAt'> = {
        date: todayDate,
        tattooerId: user?.id || '',
        openingValue: parseFloat(newComandaValue.replace(',', '.')),
        status: 'aberta',
        clients: []
      };

      await addComanda(comanda);
      setNewComandaValue('');
      setIsComandaFormOpen(false);
      toast.success(`Comanda criada para hoje (${todayDate.toLocaleDateString('pt-BR')})!`);
    } catch (error) {
      console.error('Erro ao criar comanda:', error);
      toast.error('Erro ao criar comanda. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClient = async (clientData: Omit<ComandaClient, 'id' | 'createdAt'>) => {
    try {
      await addComandaClient(clientData);
      setIsClientFormOpen(false);
      setSelectedComanda('');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      throw error;
    }
  };

  const handleSavePayment = async (paymentData: Omit<ComandaPayment, 'id' | 'createdAt'>) => {
    try {
      await addComandaPayment(paymentData);
      setIsPaymentFormOpen(false);
      setSelectedClient(null);
      setSelectedSessionInfo(undefined);
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
      throw error;
    }
  };

  const handleReopenComanda = async (comandaId: string) => {
    try {
      await reopenComanda(comandaId);
      toast.success('Comanda reaberta para edição!');
    } catch (error) {
      console.error('Erro ao reabrir comanda:', error);
      toast.error('Erro ao reabrir comanda. Tente novamente.');
    }
  };

  const handleCloseComanda = async (comandaId: string) => {
    if (!comandaId) {
      toast.error('ID da comanda é inválido');
      return;
    }

    setClosingComanda(comandaId);

    try {
      await closeComanda(comandaId);
      toast.success('Comanda fechada com sucesso!');
    }  catch (error) {
      console.error('Erro ao fechar comanda:', error);
      toast.error('Erro ao fechar comanda. Tente novamente.');
    } finally {
      setClosingComanda(null);
    }
  };

  const handlePaymentForScheduledClient = async (client: ComandaClient, comandaId: string) => {
    try {
      const existingComanda = comandas.find(c => c.id === comandaId);
      
      if (!existingComanda) {
        toast.error('Comanda não encontrada. Tente novamente.');
        return;
      }

      const clientAlreadyExists = existingComanda.clients?.some(c => 
        c.sessionId === client.sessionId && c.clientName === client.clientName
      );

      if (clientAlreadyExists) {
        const existingClient = existingComanda.clients?.find(c => 
          c.sessionId === client.sessionId && c.clientName === client.clientName
        );
        
        if (existingClient) {
          let sessionInfo = undefined;
          if (client.sessionId) {
            const signalPaid = getSignalPaidForSession(client.sessionId);
            const totalValue = client.value;
            const remainingValue = totalValue - signalPaid;
            
            sessionInfo = {
              signalPaid,
              totalValue,
              remainingValue: remainingValue > 0 ? remainingValue : 0
            };
          }
          
          setSelectedClient(existingClient);
          setSelectedSessionInfo(sessionInfo);
          setIsPaymentFormOpen(true);
        }
        return;
      }

      if (client.id.startsWith('session-')) {
        const clientData: Omit<ComandaClient, 'id' | 'createdAt'> = {
          comandaId: comandaId,
          clientId: client.clientId,
          clientName: client.clientName,
          sessionId: client.sessionId,
          description: client.description,
          value: client.value,
          status: 'pendente',
          payments: []
        };

        await addComandaClient(clientData);
        
        let sessionInfo = undefined;
        if (client.sessionId) {
          const signalPaid = getSignalPaidForSession(client.sessionId);
          const totalValue = client.value;
          const remainingValue = totalValue - signalPaid;
          
          sessionInfo = {
            signalPaid,
            totalValue,
            remainingValue: remainingValue > 0 ? remainingValue : 0
          };
        }
        
        setSelectedClient(client);
        setSelectedSessionInfo(sessionInfo);
        setIsPaymentFormOpen(true);
        
      } else {
        setSelectedClient(client);
        setSelectedSessionInfo(undefined);
        setIsPaymentFormOpen(true);
      }
    } catch (error) {
      console.error('Erro ao processar pagamento do cliente agendado:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    }
  };

  const filteredComandas = useMemo(() => {
    try {
      return filterComandsByDate(comandas || []);
    } catch (error) {
      console.error('Erro ao filtrar comandas:', error);
      return [];
    }
  }, [comandas, filterComandsByDate]);

  const openComandas = useMemo(() => {
    try {
      return filteredComandas.filter(c => c && c.status === 'aberta');
    } catch (error) {
      console.error('Erro ao filtrar comandas abertas:', error);
      return [];
    }
  }, [filteredComandas]);

  const closedComandas = useMemo(() => {
    try {
      return filteredComandas.filter(c => c && c.status === 'fechada');
    } catch (error) {
      console.error('Erro ao filtrar comandas fechadas:', error);
      return [];
    }
  }, [filteredComandas]);

  const todayDate = getTodayDate();

  const todayComanda = useMemo(() => {
    const today = getTodayDate();
    return comandas.find(comanda => {
      if (!comanda || !comanda.date) return false;
      return isSameDate(new Date(comanda.date), today);
    });
  }, [comandas]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comandas</h2>
          <p className="text-muted-foreground">Gerencie o caixa diário</p>
        </div>
        
        <Dialog open={isComandaFormOpen} onOpenChange={setIsComandaFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Comanda
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Criar Nova Comanda - Hoje ({todayDate.toLocaleDateString('pt-BR')})
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateComanda} className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Esta comanda será criada para <strong>hoje ({todayDate.toLocaleDateString('pt-BR')})</strong> e mostrará os clientes agendados para esta data.
                </p>
              </div>
              <div>
                <Label htmlFor="openingValue">Valor de Abertura (R$)</Label>
                <Input
                  id="openingValue"
                  value={newComandaValue}
                  onChange={(e) => setNewComandaValue(e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Criar Comanda para Hoje
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsComandaFormOpen(false)} disabled={saving}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtro de Data */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Filtrar por data:</Label>
            </div>
            
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            {selectedDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(undefined)}
                className="h-8 px-2"
              >
                <X className="h-4 w-4" />
                Limpar filtro
              </Button>
            )}

            <div className="text-sm text-muted-foreground">
              {selectedDate 
                ? `Mostrando comandas de ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}`
                : `Mostrando todas as comandas (${comandas?.length || 0} total)`
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comandas Abertas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-green-600">
          Comandas Abertas {selectedDate && `- ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}`}
        </h3>
        
        {openComandas.length > 0 ? (
          <div className="grid gap-4">
            {openComandas.map((comanda) => {
              if (!comanda || !comanda.id) return null;

              const combinedClients = getCombinedClientsForDate(comanda);
              const { totalClients, totalPaid, totalPendente } = calculateClientTotals(combinedClients);
              
              return (
                <Card key={comanda.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Receipt className="h-5 w-5" />
                          Comanda {new Date(comanda.date).toLocaleDateString('pt-BR')}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Abertura: {formatCurrency(comanda.openingValue || 0)}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={closingComanda === comanda.id}
                            >
                              {closingComanda === comanda.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Lock className="h-4 w-4 mr-1" />
                              )}
                              {closingComanda === comanda.id ? 'Fechando...' : 'Fechar'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Fechar Comanda</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja fechar esta comanda? Esta ação não poderá ser desfeita facilmente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleCloseComanda(comanda.id)}
                                disabled={closingComanda === comanda.id}
                              >
                                {closingComanda === comanda.id ? 'Fechando...' : 'Fechar Comanda'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                
                        <div>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Aberta
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {combinedClients.length} clientes
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Serviços</p>
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(totalClients)}
                        </p>
                      </div>
                      
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Líquido</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(totalPaid)}
                        </p>
                      </div>
                      
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <p className="text-sm text-muted-foreground">Pendente</p>
                        <p className="text-lg font-bold text-orange-600">
                          {formatCurrency(totalPendente)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {combinedClients.map((client) => {
                        if (!client || !client.id) return null;

                        const clientTotalPaid = calculateTotalPaid(client);
                        const hasMultiplePayments = client.payments && client.payments.length > 1;
                        const isFromSession = client.id.startsWith('session-');
                        const signalPaid = client.sessionId ? getSignalPaidForSession(client.sessionId) : 0;
                        
                        // ✅ CORREÇÃO: Verificar se está totalmente pago
                        const isFullyPaid = isClientFullyPaid(client);
                        
                        return (
                          <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{client.clientName || 'Cliente sem nome'}</p>
                                {isFromSession && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Users className="h-3 w-3 mr-1" />
                                    Agendado
                                  </Badge>
                                )}
                                {!isFromSession && (
                                  <Badge variant="outline" className="text-xs">
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Na Comanda
                                  </Badge>
                                )}
                                {signalPaid > 0 && (
                                  <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                    Sinal: {formatCurrency(signalPaid)}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{client.description || 'Sem descrição'}</p>
                              {hasMultiplePayments && (
                                <p className="text-xs text-blue-600">
                                  {client.payments.length} formas de pagamento
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-bold">{formatCurrency(client.value || 0)}</p>
                                {clientTotalPaid > 0 && (
                                  <p className="text-xs text-green-600">
                                    Líquido: {formatCurrency(clientTotalPaid)}
                                  </p>
                                )}
                              </div>
                              {/* ✅ CORREÇÃO: Mostrar status correto */}
                              {isFullyPaid ? (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  PAGO
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    handlePaymentForScheduledClient(client, comanda.id);
                                  }}
                                >
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  Pagar
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setSelectedComanda(comanda.id);
                          setIsClientFormOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Cliente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">
                {selectedDate 
                  ? `Nenhuma comanda aberta em ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}`
                  : 'Nenhuma comanda aberta'
                }
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedDate 
                  ? 'Tente selecionar outra data ou limpar o filtro'
                  : 'Crie uma nova comanda para começar o dia'
                }
              </p>
              {!selectedDate && (
                <Button onClick={() => setIsComandaFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Primeira Comanda
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Comandas Fechadas */}
      {closedComandas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">
            Comandas Fechadas {selectedDate && `- ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}`}
          </h3>
          
          <div className="grid gap-4">
            {closedComandas.slice(0, 10).map((comanda) => {
              if (!comanda || !comanda.id) return null;

              const combinedClients = getCombinedClientsForDate(comanda);
              const { totalClients, totalPaid } = calculateClientTotals(combinedClients);
              
              return (
                <Card key={comanda.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          Comanda {new Date(comanda.date).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {combinedClients.length} clientes • {formatCurrency(totalPaid)} líquido
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReopenComanda(comanda.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Fechada
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Dialog para adicionar cliente */}
      <Dialog open={isClientFormOpen} onOpenChange={setIsClientFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Cliente à Comanda</DialogTitle>
          </DialogHeader>
          <ClientForm
            comandaId={selectedComanda}
            onSave={handleSaveClient}
            onCancel={() => {
              setIsClientFormOpen(false);
              setSelectedComanda('');
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para registrar pagamento */}
      <Dialog open={isPaymentFormOpen} onOpenChange={setIsPaymentFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <PaymentForm
              comandaClient={selectedClient}
              sessionInfo={selectedSessionInfo}
              onSave={handleSavePayment}
              onCancel={() => {
                setIsPaymentFormOpen(false);
                setSelectedClient(null);
                setSelectedSessionInfo(undefined);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}