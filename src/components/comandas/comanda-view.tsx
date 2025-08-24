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
import { Comanda, ComandaClient, ComandaPayment } from '@/lib/types';
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
  Filter
} from 'lucide-react';

interface PaymentFormProps {
  comandaClient: ComandaClient;
  onSave: (payment: Omit<ComandaPayment, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}

function PaymentForm({ comandaClient, onSave, onCancel }: PaymentFormProps) {
  const { taxSettings } = useApp();
  const [saving, setSaving] = useState(false);
  const [payments, setPayments] = useState<Array<{
    method: ComandaPayment['method'];
    value: string;
    installments: number;
    feesPaidByClient: boolean;
  }>>([{
    method: 'dinheiro',
    value: '',
    installments: 1,
    feesPaidByClient: false
  }]);

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

  // CORREÇÃO: Calcular valores para um pagamento específico com lógica correta
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

  // Calcular totais consolidados
  const calculateTotals = () => {
    return payments.reduce((totals, payment) => {
      const { grossValue, netValue, fees } = calculatePaymentValues(payment);
      return {
        totalGross: totals.totalGross + grossValue,
        totalNet: totals.totalNet + netValue,
        totalFees: totals.totalFees + fees
      };
    }, { totalGross: 0, totalNet: 0, totalFees: 0 });
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
      
      toast.success('Pagamentos registrados com sucesso!');
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

  const totals = calculateTotals();
  const remainingValue = comandaClient.value - totals.totalNet;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">{comandaClient.clientName}</h4>
        <p className="text-sm text-muted-foreground">{comandaClient.description}</p>
        <p className="text-lg font-bold mt-2">
          {comandaClient.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
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

      {/* Resumo consolidado */}
      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Resumo Consolidado</h4>
        <div className="space-y-1 text-sm">
          <p className="text-green-700 dark:text-green-300">
            Total líquido: {totals.totalNet.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-green-700 dark:text-green-300">
            Valor restante: {remainingValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          {remainingValue > 0 && (
            <p className="text-orange-600 text-xs">
              ⚠️ Ainda falta receber {remainingValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Registrar Pagamentos
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

  // CORREÇÃO: Verificar se a comanda está aberta
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
    
    // CORREÇÃO: Validar se comanda está aberta
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
  const { comandas, sessions, addComanda, addComandaClient, addComandaPayment, reopenComanda, closeComanda } = useApp();
  const { user } = useAuth();
  const [isComandaFormOpen, setIsComandaFormOpen] = useState(false);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedComanda, setSelectedComanda] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<ComandaClient | null>(null);
  const [newComandaValue, setNewComandaValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [closingComanda, setClosingComanda] = useState<string | null>(null);
  
  // Estados para filtro de data
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // CORREÇÃO CRÍTICA: Função para obter data atual garantindo que seja sempre hoje
  const getTodayDate = () => {
    const now = new Date();
    // Garantir que seja sempre a data local atual
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    console.log('Data de hoje calculada:', {
      original: now,
      today: today,
      formatted: today.toLocaleDateString('pt-BR'),
      iso: today.toISOString().split('T')[0]
    });
    
    return today;
  };

  // CORREÇÃO CRÍTICA: Função para comparar datas de forma mais robusta
  const isSameDate = (date1: Date, date2: Date) => {
    try {
      // Normalizar ambas as datas para comparação
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      
      const d1Year = d1.getFullYear();
      const d1Month = d1.getMonth();
      const d1Day = d1.getDate();
      
      const d2Year = d2.getFullYear();
      const d2Month = d2.getMonth();
      const d2Day = d2.getDate();
      
      const result = d1Year === d2Year && d1Month === d2Month && d1Day === d2Day;
      
      console.log('Comparação de datas:', {
        date1: d1.toLocaleDateString('pt-BR'),
        date2: d2.toLocaleDateString('pt-BR'),
        result: result
      });
      
      return result;
    } catch (error) {
      console.error('Erro ao comparar datas:', error);
      return false;
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Função para calcular total pago
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

  // Função para calcular totais de clientes
  const calculateClientTotals = (filteredClients: ComandaClient[]) => {
    try {
      const totalClients = filteredClients.reduce((sum, client) => {
        if (!client || typeof client.value !== 'number') return sum;
        return sum + client.value;
      }, 0);

      const totalPaid = filteredClients.reduce((sum, client) => {
        if (!client) return sum;
        return sum + calculateTotalPaid(client);
      }, 0);

      return { totalClients, totalPaid, totalPendente: totalClients - totalPaid };
    } catch (error) {
      console.error('Erro ao calcular totais:', error);
      return { totalClients: 0, totalPaid: 0, totalPendente: 0 };
    }
  };

  // CORREÇÃO CRÍTICA: Função para filtrar clientes da comanda por data da sessão
  const getClientsForComandaDate = useMemo(() => {
    return (comanda: Comanda) => {
      try {
        if (!comanda || !comanda.date || !comanda.clients || !Array.isArray(comanda.clients)) {
          console.log('Comanda inválida ou sem clientes:', comanda?.id);
          return [];
        }

        console.log(`Filtrando clientes para comanda ${comanda.id}:`, {
          comandaDate: comanda.date.toLocaleDateString('pt-BR'),
          totalClients: comanda.clients.length,
          totalSessions: sessions.length
        });
        
        const filteredClients = comanda.clients.filter(client => {
          try {
            // Se não tem sessionId, incluir o cliente (cliente avulso)
            if (!client.sessionId) {
              console.log(`Cliente ${client.clientName} incluído (sem sessão)`);
              return true;
            }
            
            // Buscar a sessão correspondente
            const session = sessions.find(s => s && s.id === client.sessionId);
            if (!session || !session.date) {
              console.log(`Sessão não encontrada para cliente ${client.clientName}, incluindo por segurança`);
              return true;
            }
            
            // CORREÇÃO: Comparar datas de forma mais robusta
            const sessionDate = new Date(session.date);
            const comandaDate = new Date(comanda.date);
            const isSame = isSameDate(sessionDate, comandaDate);
            
            console.log(`Cliente ${client.clientName}:`, {
              sessionDate: sessionDate.toLocaleDateString('pt-BR'),
              comandaDate: comandaDate.toLocaleDateString('pt-BR'),
              incluir: isSame
            });
            
            return isSame;
          } catch (error) {
            console.error('Erro ao filtrar cliente:', error);
            return true; // Em caso de erro, incluir o cliente
          }
        });

        console.log(`Resultado: ${filteredClients.length} clientes filtrados para comanda ${comanda.id}`);
        return filteredClients;
      } catch (error) {
        console.error('Erro ao filtrar clientes da comanda:', error);
        return [];
      }
    };
  }, [sessions]);

  // Filtro de data
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
      // CORREÇÃO: Garantir que sempre use a data de hoje
      const todayDate = getTodayDate();
      
      console.log('Criando comanda para hoje:', {
        date: todayDate.toLocaleDateString('pt-BR'),
        iso: todayDate.toISOString().split('T')[0]
      });

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

  // Aplicar filtros
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

  // CORREÇÃO: Verificar se existe comanda para hoje
  const todayComanda = useMemo(() => {
    const today = getTodayDate();
    return comandas.find(comanda => {
      if (!comanda || !comanda.date) return false;
      return isSameDate(new Date(comanda.date), today);
    });
  }, [comandas]);

  console.log('Estado atual das comandas:', {
    totalComandas: comandas.length,
    comandaDeHoje: todayComanda ? 'Encontrada' : 'Não encontrada',
    dataHoje: todayDate.toLocaleDateString('pt-BR'),
    sessoes: sessions.length
  });

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

      {/* DEBUG: Informações para diagnóstico */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Debug - Integração Agenda → Comandas</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>Data de hoje: {todayDate.toLocaleDateString('pt-BR')}</p>
              <p>Total de comandas: {comandas.length}</p>
              <p>Total de sessões: {sessions.length}</p>
              <p>Comanda de hoje: {todayComanda ? `Encontrada (${todayComanda.clients.length} clientes)` : 'Não encontrada'}</p>
              <p>Sessões de hoje: {sessions.filter(s => isSameDate(new Date(s.date), todayDate)).length}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comandas Abertas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-green-600">
          Comandas Abertas {selectedDate && `- ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}`}
        </h3>
        
        {openComandas.length > 0 ? (
          <div className="grid gap-4">
            {openComandas.map((comanda) => {
              if (!comanda || !comanda.id) return null;

              const filteredClients = getClientsForComandaDate(comanda);
              const { totalClients, totalPaid, totalPendente } = calculateClientTotals(filteredClients);
              
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
                            {filteredClients.length} clientes
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
                      {filteredClients.map((client) => {
                        if (!client || !client.id) return null;

                        const clientTotalPaid = calculateTotalPaid(client);
                        const hasMultiplePayments = client.payments && client.payments.length > 1;
                        
                        return (
                          <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{client.clientName || 'Cliente sem nome'}</p>
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
                              {client.status === 'finalizado' ? (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Pago
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedClient(client);
                                    setIsPaymentFormOpen(true);
                                  }}
                                >
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  {clientTotalPaid > 0 ? 'Completar' : 'Pagar'}
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

              const filteredClients = getClientsForComandaDate(comanda);
              const { totalClients, totalPaid } = calculateClientTotals(filteredClients);
              
              return (
                <Card key={comanda.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          Comanda {new Date(comanda.date).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {filteredClients.length} clientes • {formatCurrency(totalPaid)} líquido
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
              onSave={handleSavePayment}
              onCancel={() => {
                setIsPaymentFormOpen(false);
                setSelectedClient(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}