"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useApp } from '@/contexts/app-context';
import { Comanda, ComandaClient, ComandaPayment, Session } from '@/lib/types';
import {
  DollarSign,
  Plus,
  Clock,
  User,
  CreditCard,
  Smartphone,
  Banknote,
  Calculator,
  CheckCircle,
  XCircle,
  Calendar,
  Receipt,
  Settings
} from 'lucide-react';

interface AbrirCaixaDialogProps {
  onOpen: (value: number) => void;
}

function AbrirCaixaDialog({ onOpen }: AbrirCaixaDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openingValue, setOpeningValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(openingValue.replace(',', '.'));
    if (!isNaN(value) && value >= 0) {
      onOpen(value);
      setIsOpen(false);
      setOpeningValue('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <DollarSign className="h-5 w-5 mr-2" />
          Abrir Caixa
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir Caixa do Dia</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="opening-value">Valor inicial em caixa</Label>
            <Input
              id="opening-value"
              type="text"
              placeholder="0,00"
              value={openingValue}
              onChange={(e) => setOpeningValue(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Digite o valor que você tem em dinheiro para iniciar o dia
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Abrir Caixa
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AdicionarClienteDialogProps {
  comandaId: string;
  onAdd: (client: Omit<ComandaClient, 'id' | 'createdAt'>) => void;
}

function AdicionarClienteDialog({ comandaId, onAdd }: AdicionarClienteDialogProps) {
  const { clients, sessions } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [clientType, setClientType] = useState<'agendado' | 'avulso'>('agendado');
  const [selectedSession, setSelectedSession] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');

  const today = new Date();
  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate.toDateString() === today.toDateString() && 
           session.status !== 'cancelado';
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (clientType === 'agendado' && selectedSession) {
      const session = sessions.find(s => s.id === selectedSession);
      const client = clients.find(c => c.id === session?.clientId);
      
      if (session && client) {
        onAdd({
          comandaId,
          clientId: client.id,
          clientName: client.name,
          sessionId: session.id,
          description: session.description,
          value: session.value,
          status: 'pendente'
        });
      }
    } else if (clientType === 'avulso') {
      const numValue = parseFloat(value.replace(',', '.'));
      if (clientName && description && !isNaN(numValue)) {
        onAdd({
          comandaId,
          clientName,
          description,
          value: numValue,
          status: 'pendente'
        });
      }
    }
    
    setIsOpen(false);
    setSelectedSession('');
    setClientName('');
    setDescription('');
    setValue('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Cliente
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Cliente à Comanda</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tipo de Cliente</Label>
            <Select value={clientType} onValueChange={(value: 'agendado' | 'avulso') => setClientType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agendado">Cliente Agendado</SelectItem>
                <SelectItem value="avulso">Cliente Avulso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {clientType === 'agendado' ? (
            <div>
              <Label>Sessão Agendada</Label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma sessão" />
                </SelectTrigger>
                <SelectContent>
                  {todaySessions.map(session => {
                    const client = clients.find(c => c.id === session.clientId);
                    return (
                      <SelectItem key={session.id} value={session.id}>
                        {client?.name} - {session.description} - R$ {session.value.toLocaleString('pt-BR')}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {todaySessions.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Nenhuma sessão agendada para hoje
                </p>
              )}
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="client-name">Nome do Cliente</Label>
                <Input
                  id="client-name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Digite o nome do cliente"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição do Serviço</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Tatuagem fine line no braço"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="value">Valor</Label>
                <Input
                  id="value"
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>
            </>
          )}
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Adicionar
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface FecharComandaDialogProps {
  client: ComandaClient;
  onClose: (payment: Omit<ComandaPayment, 'id' | 'createdAt'>) => void;
}

function FecharComandaDialog({ client, onClose }: FecharComandaDialogProps) {
  const { taxSettings } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'pix' | 'credito' | 'debito'>('dinheiro');
  const [installments, setInstallments] = useState(1);
  const [feesPaidByClient, setFeesPaidByClient] = useState(false);
  const [grossValue, setGrossValue] = useState(client.value.toString());

  const calculateFees = () => {
    const value = parseFloat(grossValue.replace(',', '.')) || 0;
    let rate = 0;

    if (!taxSettings) return 0;

    switch (paymentMethod) {
      case 'pix':
        rate = taxSettings.pixRate;
        break;
      case 'credito':
        rate = installments === 1 ? taxSettings.creditCardCashRate : taxSettings.creditCardInstallmentRate;
        break;
      case 'debito':
        rate = taxSettings.debitCardRate;
        break;
      default:
        rate = 0;
    }

    return (value * rate) / 100;
  };

  const fees = calculateFees();
  const netValue = feesPaidByClient ? parseFloat(grossValue.replace(',', '.')) || 0 : (parseFloat(grossValue.replace(',', '.')) || 0) - fees;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payment: Omit<ComandaPayment, 'id' | 'createdAt'> = {
      comandaClientId: client.id,
      method: paymentMethod,
      grossValue: parseFloat(grossValue.replace(',', '.')) || 0,
      netValue,
      fees,
      installments: paymentMethod === 'credito' ? installments : undefined,
      feesPaidByClient
    };

    onClose(payment);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          Finalizar
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar Atendimento - {client.clientName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Valor Bruto</Label>
            <Input
              type="text"
              value={grossValue}
              onChange={(e) => setGrossValue(e.target.value)}
              placeholder="0,00"
            />
          </div>

          <div>
            <Label>Forma de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Dinheiro
                  </div>
                </SelectItem>
                <SelectItem value="pix">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    PIX
                  </div>
                </SelectItem>
                <SelectItem value="credito">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Cartão de Crédito
                  </div>
                </SelectItem>
                <SelectItem value="debito">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Cartão de Débito
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === 'credito' && (
            <div>
              <Label>Parcelamento</Label>
              <Select value={installments.toString()} onValueChange={(value) => setInstallments(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">À vista</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                  <SelectItem value="3">3x</SelectItem>
                  <SelectItem value="4">4x</SelectItem>
                  <SelectItem value="5">5x</SelectItem>
                  <SelectItem value="6">6x</SelectItem>
                  <SelectItem value="12">12x</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {paymentMethod !== 'dinheiro' && fees > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fees-client"
                  checked={feesPaidByClient}
                  onCheckedChange={(checked) => setFeesPaidByClient(checked as boolean)}
                />
                <Label htmlFor="fees-client" className="text-sm">
                  Taxa repassada ao cliente
                </Label>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Valor Bruto:</span>
                  <span>R$ {(parseFloat(grossValue.replace(',', '.')) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxa ({taxSettings ? (paymentMethod === 'credito' ? (installments === 1 ? taxSettings.creditCardCashRate : taxSettings.creditCardInstallmentRate) : paymentMethod === 'debito' ? taxSettings.debitCardRate : taxSettings.pixRate) : 0}%):</span>
                  <span className="text-red-600">-R$ {fees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Valor Líquido:</span>
                  <span className="text-green-600">R$ {netValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Finalizar Pagamento
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ComandaView() {
  const { comandas, setComandasState, sessions, clients, transactions, setTransactions, user } = useApp();
  const [currentComanda, setCurrentComanda] = useState<Comanda | null>(null);

  const today = new Date();
  const todayComanda = comandas.find(c => 
    c.date.toDateString() === today.toDateString() && c.status === 'aberta'
  );

  useEffect(() => {
    if (todayComanda) {
      setCurrentComanda(todayComanda);
    }
  }, [todayComanda]);

  const handleOpenCaixa = (openingValue: number) => {
    const newComanda: Comanda = {
      id: Date.now().toString(),
      date: today,
      tattooerId: user?.id || '1',
      openingValue,
      status: 'aberta',
      clients: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setComandasState([...comandas, newComanda]);
    setCurrentComanda(newComanda);

    // Adicionar transação de abertura de caixa
    const openingTransaction = {
      id: `opening-${newComanda.id}`,
      type: 'receita' as const,
      description: 'Abertura de caixa',
      value: openingValue,
      date: new Date(),
      category: 'Caixa',
      tattooerId: user?.id || '1',
      comandaId: newComanda.id
    };

    setTransactions([...transactions, openingTransaction]);
  };

  const handleAddClient = (clientData: Omit<ComandaClient, 'id' | 'createdAt'>) => {
    if (!currentComanda) return;

    const newClient: ComandaClient = {
      ...clientData,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    const updatedComanda = {
      ...currentComanda,
      clients: [...currentComanda.clients, newClient],
      updatedAt: new Date()
    };

    setComandasState(comandas.map(c => c.id === currentComanda.id ? updatedComanda : c));
    setCurrentComanda(updatedComanda);
  };

  const handleCloseClient = (payment: Omit<ComandaPayment, 'id' | 'createdAt'>) => {
    if (!currentComanda) return;

    const clientIndex = currentComanda.clients.findIndex(c => c.id === payment.comandaClientId);
    if (clientIndex === -1) return;

    const updatedClients = [...currentComanda.clients];
    updatedClients[clientIndex] = {
      ...updatedClients[clientIndex],
      status: 'finalizado',
      payment: {
        ...payment,
        id: Date.now().toString(),
        createdAt: new Date()
      }
    };

    const updatedComanda = {
      ...currentComanda,
      clients: updatedClients,
      updatedAt: new Date()
    };

    setComandasState(comandas.map(c => c.id === currentComanda.id ? updatedComanda : c));
    setCurrentComanda(updatedComanda);

    // Adicionar transação financeira
    const transaction = {
      id: `payment-${payment.comandaClientId}-${Date.now()}`,
      type: 'receita' as const,
      description: `${updatedClients[clientIndex].clientName} - ${updatedClients[clientIndex].description}`,
      value: payment.netValue,
      grossValue: payment.grossValue,
      fees: payment.fees,
      date: new Date(),
      category: 'Tatuagem',
      tattooerId: user?.id || '1',
      comandaId: currentComanda.id,
      paymentMethod: payment.method,
      installments: payment.installments
    };

    setTransactions([...transactions, transaction]);
  };

  const handleCloseCaixa = () => {
    if (!currentComanda) return;

    const totalReceived = currentComanda.clients
      .filter(c => c.status === 'finalizado')
      .reduce((sum, c) => sum + (c.payment?.netValue || 0), 0);

    const closingValue = currentComanda.openingValue + totalReceived;

    const updatedComanda = {
      ...currentComanda,
      status: 'fechada' as const,
      closingValue,
      updatedAt: new Date()
    };

    setComandasState(comandas.map(c => c.id === currentComanda.id ? updatedComanda : c));
    setCurrentComanda(null);
  };

  const totalReceived = currentComanda?.clients
    .filter(c => c.status === 'finalizado')
    .reduce((sum, c) => sum + (c.payment?.netValue || 0), 0) || 0;

  const pendingClients = currentComanda?.clients.filter(c => c.status === 'pendente') || [];
  const finishedClients = currentComanda?.clients.filter(c => c.status === 'finalizado') || [];

  if (!currentComanda) {
    return (
      <div className="space-y-6">
        <div className="hidden lg:block">
          <h2 className="text-2xl font-bold">Comandas</h2>
          <p className="text-muted-foreground">Gestão do caixa diário</p>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Caixa não foi aberto hoje</h3>
            <p className="text-muted-foreground mb-6">
              Para começar a registrar atendimentos, abra o caixa do dia
            </p>
            <AbrirCaixaDialog onOpen={handleOpenCaixa} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="hidden lg:block">
          <h2 className="text-2xl font-bold">Comandas</h2>
          <p className="text-muted-foreground">
            Caixa aberto - {currentComanda.date.toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex gap-2">
          <AdicionarClienteDialog comandaId={currentComanda.id} onAdd={handleAddClient} />
          <Button variant="destructive" onClick={handleCloseCaixa}>
            Fechar Caixa
          </Button>
        </div>
      </div>

      {/* Resumo do Caixa */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Valor Inicial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {currentComanda.openingValue.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recebido Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalReceived.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total em Caixa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {(currentComanda.openingValue + totalReceived).toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clientes Pendentes */}
      {pendingClients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Atendimentos Pendentes ({pendingClients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{client.clientName}</h4>
                    <p className="text-sm text-muted-foreground">{client.description}</p>
                    <p className="text-sm font-medium">R$ {client.value.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="flex gap-2">
                    <FecharComandaDialog client={client} onClose={handleCloseClient} />
                    <Badge variant="outline">Pendente</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clientes Finalizados */}
      {finishedClients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Atendimentos Finalizados ({finishedClients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {finishedClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950">
                  <div>
                    <h4 className="font-medium">{client.clientName}</h4>
                    <p className="text-sm text-muted-foreground">{client.description}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm">
                        Bruto: R$ {client.payment?.grossValue.toLocaleString('pt-BR')}
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        Líquido: R$ {client.payment?.netValue.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="mb-2">
                      {client.payment?.method === 'dinheiro' && 'Dinheiro'}
                      {client.payment?.method === 'pix' && 'PIX'}
                      {client.payment?.method === 'credito' && `Crédito ${client.payment.installments}x`}
                      {client.payment?.method === 'debito' && 'Débito'}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {client.payment?.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {pendingClients.length === 0 && finishedClients.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Nenhum cliente na comanda</h3>
            <p className="text-muted-foreground mb-4">
              Adicione clientes agendados ou avulsos para começar
            </p>
            <AdicionarClienteDialog comandaId={currentComanda.id} onAdd={handleAddClient} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}