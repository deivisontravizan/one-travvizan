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
  UserPlus
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
        </div>
      </DialogTrigger>

      <DialogContent>
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
            <div>
              <label className="text-sm font-medium">Valor</label>
              <p className="text-sm text-muted-foreground">R$ {session.value.toLocaleString('pt-BR')}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Descrição</label>
            <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
          </div>

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
    description: '',
    status: 'agendado' as Session['status']
  });

  const [newClientData, setNewClientData] = useState({
    name: '',
    whatsapp: '',
    instagram: '',
    style: 'Fine Line'
  });

  const resetForm = () => {
    setSessionData({
      clientId: '',
      date: selectedDate ? selectedDate.toISOString().slice(0, 16) : '',
      duration: '2',
      value: '',
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!sessionData.date) {
      toast.error('Data e hora são obrigatórios');
      return;
    }
    
    if (!sessionData.value) {
      toast.error('Valor é obrigatório');
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

      const session: Omit<Session, 'id'> = {
        clientId,
        tattooerId: user?.id || '',
        date: new Date(sessionData.date),
        duration: parseInt(sessionData.duration),
        value: parseFloat(sessionData.value.replace(',', '.')),
        status: sessionData.status,
        description: sessionData.description,
        photos: []
      };

      await addSession(session);
      toast.success('Sessão agendada com sucesso!');
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
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agendar Nova Sessão</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="value">Valor (R$) *</Label>
              <Input
                id="value"
                type="text"
                value={sessionData.value}
                onChange={(e) => setSessionData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="0,00"
                required
              />
            </div>
          </div>

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
              {getSessionsForDate(today).reduce((sum, s) => sum + s.value, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
            <CardTitle className="text-sm">Slots Livres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">6</div>
            <p className="text-xs text-muted-foreground">Horários disponíveis hoje</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}