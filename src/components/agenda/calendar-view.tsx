"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useApp } from '@/contexts/app-context';
import { Session } from '@/lib/types';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  User,
  DollarSign,
  MapPin
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
          <DialogTitle>Detalhes da Sessão</DialogTitle>
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
              variant={view === 'month' ? 'default' : 'outline'}
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
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Sessão
        </Button>
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