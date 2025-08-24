"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { Session, Client } from '@/lib/types';
import { toast } from 'sonner';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  User,
  DollarSign,
  MapPin,
  Loader2,
  UserPlus,
  ImageIcon,
  X,
  Upload,
  Eye
} from 'lucide-react';

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

interface SessionCardProps {
  session: Session;
  clientName: string;
}

function SessionCard({ session, clientName }: SessionCardProps) {
  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'confirmado': return 'bg-green-500';
      case 'agendado': return 'bg-blue-500';
      case 'realizado': return 'bg-purple-500';
      case 'cancelado': return 'bg-red-500';
      case 'reagendado': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Session['status']) => {
    switch (status) {
      case 'confirmado': return 'Confirmado';
      case 'agendado': return 'Agendado';
      case 'realizado': return 'Realizado';
      case 'cancelado': return 'Cancelado';
      case 'reagendado': return 'Reagendado';
      default: return status;
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="p-2 mb-1 bg-muted/50 rounded cursor-pointer hover:bg-muted transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(session.status)}`} />
            <span className="text-xs font-medium truncate">{clientName}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(session.date).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })} - {session.duration}h
          </div>
          {session.signalValue && (
            <div className="text-xs text-green-600 font-medium">
              Sinal: {formatCurrency(session.signalValue)}
            </div>
          )}
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Sessão - {clientName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Cliente</label>
              <p className="text-sm text-muted-foreground">{clientName}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Badge variant="outline" className="text-xs">
                {getStatusText(session.status)}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Data e Hora</label>
              <p className="text-sm text-muted-foreground">
                {new Date(session.date).toLocaleDateString('pt-BR')} às{' '}
                {new Date(session.date).toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Duração</label>
              <p className="text-sm text-muted-foreground">{session.duration} horas</p>
            </div>
          </div>

          {/* Valores */}
          {(session.totalValue || session.signalValue) && (
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Valores</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {session.totalValue && (
                  <div>
                    <label className="text-green-700 dark:text-green-300">Valor Total</label>
                    <p className="font-bold text-green-800 dark:text-green-200">
                      {formatCurrency(session.totalValue)}
                    </p>
                  </div>
                )}
                {session.signalValue && (
                  <div>
                    <label className="text-green-700 dark:text-green-300">Sinal Pago</label>
                    <p className="font-bold text-green-800 dark:text-green-200">
                      {formatCurrency(session.signalValue)}
                    </p>
                  </div>
                )}
                {session.pendingValue && (
                  <div>
                    <label className="text-orange-700 dark:text-orange-300">Valor Pendente</label>
                    <p className="font-bold text-orange-800 dark:text-orange-200">
                      {formatCurrency(session.pendingValue)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Descrição</label>
            <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
          </div>

          {/* Imagens de Referência */}
          {session.referenceImages && session.referenceImages.length > 0 && (
            <div>
              <label className="text-sm font-medium">Imagens de Referência</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {session.referenceImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Referência ${index + 1}`}
                      className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded flex items-center justify-center transition-all">
                      <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              <User className="h-4 w-4 mr-2" />
              Ver Cliente
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Clock className="h-4 w-4 mr-2" />
              Reagendar
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <DollarSign className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface NewSessionDialogProps {
  selectedDate?: Date;
}

function NewSessionDialog({ selectedDate }: NewSessionDialogProps) {
  const { clients, addSession, addClient } = useApp();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientType, setClientType] = useState<'existing' | 'new'>('existing');
  
  const [sessionData, setSessionData] = useState({
    clientId: '',
    date: selectedDate ? selectedDate.toISOString().slice(0, 16) : '',
    duration: '2',
    value: '',
    totalValue: '',
    signalValue: '',
    description: '',
    status: 'agendado' as Session['status']
  });

  const [newClientData, setNewClientData] = useState({
    name: '',
    whatsapp: '',
    instagram: '',
    style: 'Fine Line'
  });

  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');

  const resetForm = () => {
    setSessionData({
      clientId: '',
      date: selectedDate ? selectedDate.toISOString().slice(0, 16) : '',
      duration: '2',
      value: '',
      totalValue: '',
      signalValue: '',
      description: '',
      status: 'agendado'
    });
    setNewClientData({
      name: '',
      whatsapp: '',
      instagram: '',
      style: 'Fine Line'
    });
    setClientType('existing');
    setReferenceImages([]);
    setImageInput('');
  };

  // Calcular valor pendente automaticamente
  const calculatePendingValue = () => {
    const total = parseFloat(sessionData.totalValue.replace(',', '.')) || 0;
    const signal = parseFloat(sessionData.signalValue.replace(',', '.')) || 0;
    return total - signal;
  };

  const addReferenceImage = () => {
    if (imageInput.trim() && !referenceImages.includes(imageInput.trim())) {
      setReferenceImages(prev => [...prev, imageInput.trim()]);
      setImageInput('');
    }
  };

  const removeReferenceImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!sessionData.date) {
      toast.error('Data e hora são obrigatórios');
      return;
    }
    
    if (!sessionData.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    if (clientType === 'existing' && !sessionData.clientId) {
      toast.error('Selecione um cliente');
      return;
    }

    if (clientType === 'new') {
      if (!newClientData.name.trim() || !newClientData.whatsapp.trim()) {
        toast.error('Nome e WhatsApp são obrigatórios para novo cliente');
        return;
      }
    }

    // Validação de valores
    const totalValue = parseFloat(sessionData.totalValue.replace(',', '.')) || 0;
    const signalValue = parseFloat(sessionData.signalValue.replace(',', '.')) || 0;
    
    if (signalValue > totalValue) {
      toast.error('Valor do sinal não pode ser maior que o valor total');
      return;
    }

    // ✅ CORREÇÃO: Logs de debug para rastrear o problema
    console.log('🔍 DEBUG - Dados da sessão antes de criar:', {
      signalValueString: sessionData.signalValue,
      signalValueParsed: signalValue,
      totalValue: totalValue,
      condicaoAtendida: signalValue && signalValue > 0,
      date: sessionData.date,
      dateParsed: new Date(sessionData.date)
    });

    setSaving(true);

    try {
      let clientId = sessionData.clientId;

      // Se for um novo cliente, criar primeiro
      if (clientType === 'new') {
        await addClient({
          name: newClientData.name,
          whatsapp: newClientData.whatsapp,
          instagram: newClientData.instagram,
          style: newClientData.style,
          status: 'novo-contato',
          totalPaid: 0,
          references: [],
          anamnese: {},
          observations: '',
          tags: []
        });
        
        // Buscar o cliente recém-criado pelo nome e whatsapp
        const newClient = clients.find(c => 
          c.name === newClientData.name && c.whatsapp === newClientData.whatsapp
        );
        
        if (newClient) {
          clientId = newClient.id;
        } else {
          // Se não encontrou, usar o último cliente da lista (mais recente)
          const sortedClients = [...clients].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          clientId = sortedClients[0]?.id || '';
        }
      }

      if (!clientId) {
        toast.error('Erro ao identificar o cliente. Tente novamente.');
        return;
      }

      const pendingValue = calculatePendingValue();

      const session: Omit<Session, 'id'> = {
        clientId,
        tattooerId: user?.id || '',
        date: new Date(sessionData.date),
        duration: parseInt(sessionData.duration),
        value: totalValue || parseFloat(sessionData.value.replace(',', '.')) || 0,
        totalValue: totalValue || undefined,
        signalValue: signalValue || undefined,
        pendingValue: pendingValue > 0 ? pendingValue : undefined,
        status: sessionData.status,
        description: sessionData.description,
        photos: [],
        referenceImages: referenceImages.length > 0 ? referenceImages : undefined
      };

      // ✅ CORREÇÃO: Log adicional antes de chamar addSession
      console.log('🚀 Criando sessão com dados:', session);

      await addSession(session);
      
      // Se há valor de sinal, registrar automaticamente na comanda
      if (signalValue > 0) {
        toast.success(`Sessão agendada! Sinal de ${signalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} será registrado na comanda e no financeiro.`);
      } else {
        toast.success('Sessão agendada com sucesso!');
      }
      
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      toast.error('Erro ao agendar sessão. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Sessão
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar Nova Sessão</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Cliente */}
          <div>
            <Label>Tipo de Cliente</Label>
            <Select value={clientType} onValueChange={(value: 'existing' | 'new') => setClientType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="existing">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Cliente Existente
                  </div>
                </SelectItem>
                <SelectItem value="new">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Novo Cliente
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cliente Existente */}
          {clientType === 'existing' && (
            <div>
              <Label htmlFor="client">Cliente *</Label>
              <Select value={sessionData.clientId} onValueChange={(value) => setSessionData(prev => ({ ...prev, clientId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Novo Cliente */}
          {clientType === 'new' && (
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
              <div className="col-span-2">
                <Label className="text-sm font-medium">Dados do Novo Cliente</Label>
              </div>
              <div>
                <Label htmlFor="new-client-name">Nome *</Label>
                <Input
                  id="new-client-name"
                  value={newClientData.name}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="new-client-whatsapp">WhatsApp *</Label>
                <Input
                  id="new-client-whatsapp"
                  value={newClientData.whatsapp}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="11999999999"
                  required
                />
              </div>
              <div>
                <Label htmlFor="new-client-instagram">Instagram</Label>
                <Input
                  id="new-client-instagram"
                  value={newClientData.instagram}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, instagram: e.target.value }))}
                  placeholder="@usuario"
                />
              </div>
              <div>
                <Label htmlFor="new-client-style">Estilo</Label>
                <Select value={newClientData.style} onValueChange={(value) => setNewClientData(prev => ({ ...prev, style: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Fine Line', 'Realismo', 'Old School', 'New School', 'Blackwork', 'Aquarela', 'Minimalista', 'Geométrico'].map(style => (
                      <SelectItem key={style} value={style}>{style}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Dados da Sessão */}
          <div>
            <Label htmlFor="date">Data e Hora *</Label>
            <Input
              id="date"
              type="datetime-local"
              value={sessionData.date}
              onChange={(e) => setSessionData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duração (horas) *</Label>
              <Select value={sessionData.duration} onValueChange={(value) => setSessionData(prev => ({ ...prev, duration: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora</SelectItem>
                  <SelectItem value="2">2 horas</SelectItem>
                  <SelectItem value="3">3 horas</SelectItem>
                  <SelectItem value="4">4 horas</SelectItem>
                  <SelectItem value="5">5 horas</SelectItem>
                  <SelectItem value="6">6 horas</SelectItem>
                  <SelectItem value="8">8 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={sessionData.status} onValueChange={(value: Session['status']) => setSessionData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Valores */}
          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
            <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">Valores da Tatuagem</Label>
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div>
                <Label htmlFor="totalValue">Valor Total (R$)</Label>
                <Input
                  id="totalValue"
                  type="text"
                  value={sessionData.totalValue}
                  onChange={(e) => setSessionData(prev => ({ ...prev, totalValue: e.target.value }))}
                  placeholder="0,00"
                />
              </div>

              <div>
                <Label htmlFor="signalValue">Valor do Sinal (R$)</Label>
                <Input
                  id="signalValue"
                  type="text"
                  value={sessionData.signalValue}
                  onChange={(e) => setSessionData(prev => ({ ...prev, signalValue: e.target.value }))}
                  placeholder="0,00"
                />
              </div>

              <div>
                <Label>Valor Pendente (R$)</Label>
                <div className="p-2 bg-muted rounded border text-sm text-muted-foreground">
                  {calculatePendingValue().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            </div>
            
            {sessionData.signalValue && parseFloat(sessionData.signalValue.replace(',', '.')) > 0 && (
              <div className="mt-3 p-3 bg-green-100 dark:bg-green-900 rounded border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  💡 O valor do sinal será registrado automaticamente na comanda do dia do atendimento e no financeiro.
                </p>
              </div>
            )}
          </div>

          {/* Valor Alternativo (para compatibilidade) */}
          {!sessionData.totalValue && (
            <div>
              <Label htmlFor="value">Valor da Sessão (R$)</Label>
              <Input
                id="value"
                type="text"
                value={sessionData.value}
                onChange={(e) => setSessionData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="0,00"
              />
            </div>
          )}

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={sessionData.description}
              onChange={(e) => setSessionData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Tatuagem fine line no braço"
              required
            />
          </div>

          {/* Imagens de Referência */}
          <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950">
            <Label className="text-sm font-medium text-purple-800 dark:text-purple-200">Imagens de Referência</Label>
            
            <div className="mt-3 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  placeholder="Cole a URL da imagem de referência"
                  className="flex-1"
                />
                <Button type="button" onClick={addReferenceImage} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              {referenceImages.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {referenceImages.length} imagem(ns) adicionada(s):
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {referenceImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Referência ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeReferenceImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Agendar Sessão
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={saving}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CalendarView() {
  const { sessions, clients } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Cliente não encontrado';
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }
    
    // Dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
    }
    
    return days;
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Agenda</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'month' ?'default' : 'outline'}
              size="sm"
              onClick={() => setView('month')}
            >
              Mês
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
            >
              Semana
            </Button>
            <Button
              variant={view === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('day')}
            >
              Dia
            </Button>
          </div>
        </div>
        
        <NewSessionDialog />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoje
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {view === 'month' && (
            <div className="grid grid-cols-7 gap-1">
              {/* Cabeçalho dos dias da semana */}
              {daysOfWeek.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Dias do calendário */}
              {days.map((day, index) => {
                const daySessions = getSessionsForDate(day.date);
                const isToday = day.date.toDateString() === today.toDateString();
                
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-1 border rounded ${
                      day.isCurrentMonth 
                        ? 'bg-background' 
                        : 'bg-muted/30'
                    } ${
                      isToday 
                        ? 'ring-2 ring-primary' 
                        : ''
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      day.isCurrentMonth 
                        ? 'text-foreground' 
                        : 'text-muted-foreground'
                    } ${
                      isToday 
                        ? 'text-primary' 
                        : ''
                    }`}>
                      {day.date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {daySessions.map(session => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          clientName={getClientName(session.clientId)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {view === 'week' && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Visualização semanal em desenvolvimento</p>
            </div>
          )}
          
          {view === 'day' && (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Visualização diária em desenvolvimento</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo do dia */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sessões Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getSessionsForDate(today).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {getSessionsForDate(today).reduce((sum, s) => sum + (s.totalValue || s.value), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Próxima Sessão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {sessions.length > 0 ? getClientName(sessions[0].clientId) : 'Nenhuma'}
            </div>
            <p className="text-xs text-muted-foreground">
              {sessions.length > 0 ? 
                new Date(sessions[0].date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) :
                'Agenda livre'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sinais Recebidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {getSessionsForDate(today).reduce((sum, s) => sum + (s.signalValue || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">Valores de entrada hoje</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}