"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/app-context';
import { Comanda, ComandaClient, ComandaPayment } from '@/lib/types';
import { toast } from 'sonner';
import {
  Receipt,
  Plus,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Calculator,
  CreditCard,
  Banknote,
  Smartphone,
  Loader2
} from 'lucide-react';

interface PaymentFormProps {
  comandaClient: ComandaClient;
  onSave: (payment: Omit<ComandaPayment, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}

function PaymentForm({ comandaClient, onSave, onCancel }: PaymentFormProps) {
  const { taxSettings } = useApp();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    method: 'dinheiro' as ComandaPayment['method'],
    grossValue: comandaClient.value.toString(),
    netValue: comandaClient.value.toString(),
    fees: '0',
    installments: 1,
    feesPaidByClient: false
  });

  // Usar taxas das configurações ou valores padrão
  const getCardRate = (method: string, installments?: number) => {
    if (!taxSettings) {
      // Valores padrão caso não haja configurações
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

  const calculateFees = () => {
    const grossValue = parseFloat(formData.grossValue.replace(',', '.'));
    if (isNaN(grossValue)) return;

    let rate = 0;
    if (['credito-vista', 'credito-parcelado', 'debito', 'pix'].includes(formData.method)) {
      rate = getCardRate(formData.method, formData.installments);
    }

    const fees = (grossValue * rate) / 100;
    const netValue = formData.feesPaidByClient ? grossValue : grossValue - fees;

    setFormData(prev => ({
      ...prev,
      fees: fees.toFixed(2),
      netValue: netValue.toFixed(2)
    }));
  };

  React.useEffect(() => {
    if (['credito-vista', 'credito-parcelado', 'debito', 'pix'].includes(formData.method)) {
      calculateFees();
    } else {
      setFormData(prev => ({
        ...prev,
        fees: '0',
        netValue: prev.grossValue
      }));
    }
  }, [formData.method, formData.grossValue, formData.feesPaidByClient, formData.installments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.grossValue) {
      toast.error('Valor é obrigatório');
      return;
    }

    setSaving(true);

    try {
      const payment: Omit<ComandaPayment, 'id' | 'createdAt'> = {
        comandaClientId: comandaClient.id,
        method: formData.method,
        grossValue: parseFloat(formData.grossValue.replace(',', '.')),
        netValue: parseFloat(formData.netValue.replace(',', '.')),
        fees: parseFloat(formData.fees.replace(',', '.')),
        installments: formData.method === 'credito-parcelado' ? formData.installments : undefined,
        feesPaidByClient: formData.feesPaidByClient
      };

      await onSave(payment);
      toast.success('Pagamento registrado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
      toast.error('Erro ao registrar pagamento. Tente novamente.');
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

  const currentRate = getCardRate(formData.method, formData.installments);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">{comandaClient.clientName}</h4>
        <p className="text-sm text-muted-foreground">{comandaClient.description}</p>
        <p className="text-lg font-bold mt-2">
          {comandaClient.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>

      <div>
        <Label>Forma de Pagamento</Label>
        <Select value={formData.method} onValueChange={(value: ComandaPayment['method']) => setFormData(prev => ({ ...prev, method: value }))}>
          <SelectTrigger>
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

      {['credito-vista', 'credito-parcelado', 'debito', 'pix'].includes(formData.method) && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800 dark:text-blue-200">
              Calculadora de Taxas
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              <Label>Taxa ({currentRate}%)</Label>
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
                value={formData.netValue}
                readOnly
                placeholder="0,00"
                className="bg-muted font-medium"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="feesPaidByClient"
              checked={formData.feesPaidByClient}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, feesPaidByClient: checked }))}
            />
            <Label htmlFor="feesPaidByClient" className="text-sm">
              Cliente paga as taxas
            </Label>
          </div>

          {formData.method === 'credito-parcelado' && (
            <div>
              <Label htmlFor="installments">Número de Parcelas</Label>
              <Select value={formData.installments.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, installments: parseInt(value) }))}>
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
  const { clients } = useApp();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    description: '',
    value: ''
  });

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
    
    if (!formData.clientName.trim()) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }
    
    if (!formData.value) {
      toast.error('Valor é obrigatório');
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
        status: 'pendente'
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="clientSelect">Cliente Cadastrado (Opcional)</Label>
        <Select value={formData.clientId} onValueChange={handleClientSelect}>
          <SelectTrigger>
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
  const { comandas, addComanda, addComandaClient, addComandaPayment } = useApp();
  const [isComandaFormOpen, setIsComandaFormOpen] = useState(false);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedComanda, setSelectedComanda] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<ComandaClient | null>(null);
  const [newComandaValue, setNewComandaValue] = useState('');
  const [saving, setSaving] = useState(false);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleCreateComanda = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComandaValue) {
      toast.error('Valor de abertura é obrigatório');
      return;
    }

    setSaving(true);

    try {
      const comanda: Omit<Comanda, 'id' | 'createdAt' | 'updatedAt'> = {
        date: new Date(),
        tattooerId: '1', // TODO: pegar do contexto
        openingValue: parseFloat(newComandaValue.replace(',', '.')),
        status: 'aberta',
        clients: []
      };

      await addComanda(comanda);
      setNewComandaValue('');
      setIsComandaFormOpen(false);
      toast.success('Comanda criada com sucesso!');
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

  const openComandas = comandas.filter(c => c.status === 'aberta');
  const closedComandas = comandas.filter(c => c.status === 'fechada');

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
              <DialogTitle>Criar Nova Comanda</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateComanda} className="space-y-4">
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
                  Criar Comanda
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsComandaFormOpen(false)} disabled={saving}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Comandas Abertas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-green-600">Comandas Abertas</h3>
        
        {openComandas.length > 0 ? (
          <div className="grid gap-4">
            {openComandas.map((comanda) => {
              const totalClients = comanda.clients.reduce((sum, client) => sum + client.value, 0);
              const totalPaid = comanda.clients
                .filter(client => client.payment)
                .reduce((sum, client) => sum + (client.payment?.netValue || 0), 0);
              
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
                          Abertura: {formatCurrency(comanda.openingValue)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Aberta
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {comanda.clients.length} clientes
                        </p>
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
                        <p className="text-sm text-muted-foreground">Total Recebido</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(totalPaid)}
                        </p>
                      </div>
                      
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <p className="text-sm text-muted-foreground">Pendente</p>
                        <p className="text-lg font-bold text-orange-600">
                          {formatCurrency(totalClients - totalPaid)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {comanda.clients.map((client) => (
                        <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{client.clientName}</p>
                            <p className="text-sm text-muted-foreground">{client.description}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-bold">{formatCurrency(client.value)}</p>
                              {client.payment && (
                                <p className="text-xs text-green-600">
                                  Pago: {formatCurrency(client.payment.netValue)}
                                </p>
                              )}
                            </div>
                            {client.payment ? (
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
                                Pagar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      
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
              <h3 className="font-medium mb-2">Nenhuma comanda aberta</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie uma nova comanda para começar o dia
              </p>
              <Button onClick={() => setIsComandaFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Primeira Comanda
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Comandas Fechadas */}
      {closedComandas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">Comandas Fechadas</h3>
          
          <div className="grid gap-4">
            {closedComandas.slice(0, 5).map((comanda) => {
              const totalClients = comanda.clients.reduce((sum, client) => sum + client.value, 0);
              const totalPaid = comanda.clients
                .filter(client => client.payment)
                .reduce((sum, client) => sum + (client.payment?.netValue || 0), 0);
              
              return (
                <Card key={comanda.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          Comanda {new Date(comanda.date).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {comanda.clients.length} clientes • {formatCurrency(totalPaid)} recebido
                        </p>
                      </div>
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Fechada
                      </Badge>
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
            onCancel={() => setIsClientFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para registrar pagamento */}
      <Dialog open={isPaymentFormOpen} onOpenChange={setIsPaymentFormOpen}>
        <DialogContent className="max-w-2xl">
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