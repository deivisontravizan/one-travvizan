"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/app-context';
import { Client, PeriodMetrics } from '@/lib/types';
import { NewLeadDialog, ConvertToClientDialog } from './lead-form';
import { PeriodFilter, PeriodSelection } from './period-filter';
import { getCurrentWeekPeriod } from '@/lib/week-utils';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { toast } from 'sonner';
import {
  Phone,
  Instagram,
  Eye,
  MessageSquare,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  Target,
  GripVertical,
  Loader2,
  UserPlus,
  CheckCircle,
  Filter,
  X
} from 'lucide-react';

const columns = [
  { 
    id: 'novo-contato', 
    title: 'Novo Contato', 
    color: 'bg-blue-500',
    description: 'Leads que acabaram de chegar'
  },
  { 
    id: 'em-conversa', 
    title: 'Em Conversa', 
    color: 'bg-yellow-500',
    description: 'Negociação em andamento'
  },
  { 
    id: 'orcamento-enviado', 
    title: 'Orçamento Enviado', 
    color: 'bg-orange-500',
    description: 'Aguardando resposta do cliente'
  },
  { 
    id: 'agendamento-realizado', 
    title: 'Agendado', 
    color: 'bg-green-500',
    description: 'Sessão confirmada'
  },
  { 
    id: 'desqualificado', 
    title: 'Desqualificado', 
    color: 'bg-red-500',
    description: 'Lead não qualificado'
  }
];

interface ClientCardProps {
  client: Client;
  onStatusChange: (clientId: string, newStatus: Client['status']) => Promise<void>;
  onConvertToClient: (clientId: string) => Promise<void>;
  index: number;
}

function ClientCard({ client, onStatusChange, onConvertToClient, index }: ClientCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: Client['status']) => {
    setUpdating(true);
    try {
      await onStatusChange(client.id, newStatus);
      setIsOpen(false);
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    } finally {
      setUpdating(false);
    }
  };

  const handleConvertToClient = async () => {
    setUpdating(true);
    try {
      await onConvertToClient(client.id);
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao converter cliente:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getUrgencyLevel = () => {
    const daysSinceUpdate = Math.floor(
      (new Date().getTime() - client.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceUpdate > 3) return 'high';
    if (daysSinceUpdate > 1) return 'medium';
    return 'low';
  };

  const urgency = getUrgencyLevel();
  const isLead = client.tags.includes('lead-crm');
  const canConvert = client.status === 'agendamento-realizado' && isLead;

  return (
    <>
      <Draggable draggableId={client.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="mb-3"
          >
            <Card className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
              snapshot.isDragging ? 'shadow-lg rotate-2 scale-105' : ''
            } ${
              urgency === 'high' ? 'ring-2 ring-red-200' : 
              urgency === 'medium' ? 'ring-1 ring-yellow-200' : ''
            } ${
              isLead ? 'border-l-4 border-l-blue-500' : ''
            }`}>
              <CardContent className="p-3 lg:p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-xs lg:text-sm flex-1 truncate">{client.name}</h4>
                      {isLead && (
                        <Badge variant="secondary" className="text-xs">Lead</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {urgency === 'high' && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                      {updating && <Loader2 className="h-3 w-3 animate-spin" />}
                      <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground hover:text-foreground" />
                      </div>
                      <Eye 
                        className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground hover:text-foreground cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(true);
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span className="truncate">{client.whatsapp}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {client.style}
                    </Badge>
                    <div className="text-xs text-muted-foreground text-right">
                      <div>{Math.floor((new Date().getTime() - client.updatedAt.getTime()) / (1000 * 60 * 60 * 24))}d</div>
                      <div className="text-xs opacity-75">
                        {client.createdAt.toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  
                  {client.tags.includes('lead-quente') && (
                    <Badge variant="destructive" className="text-xs">
                      🔥 Lead Quente
                    </Badge>
                  )}

                  {canConvert && (
                    <div className="pt-2">
                      <Button 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConvertToClient();
                        }}
                        disabled={updating}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Converter para Cliente
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Draggable>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Ações de CRM - {client.name}
              {isLead && <Badge variant="secondary" className="ml-2">Lead</Badge>}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 lg:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Cliente</label>
                <p className="text-sm text-muted-foreground">{client.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Estilo</label>
                <p className="text-sm text-muted-foreground">{client.style}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Data de Criação</label>
                <p className="text-sm text-muted-foreground">
                  {client.createdAt.toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Último Contato</label>
                <p className="text-sm text-muted-foreground">
                  {client.updatedAt.toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Status Atual</label>
                <Badge variant="outline">{client.status}</Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Observações</label>
              <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted/50 rounded">
                {client.observations || 'Nenhuma observação registrada.'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Mover no Funil de Vendas</label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {columns.map((column) => (
                  <Button
                    key={column.id}
                    variant={client.status === column.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange(column.id as Client['status'])}
                    className="text-xs justify-start"
                    disabled={client.status === column.id || updating}
                  >
                    <div className={`w-2 h-2 rounded-full ${column.color} mr-2`} />
                    {column.title}
                  </Button>
                ))}
              </div>
            </div>

            {canConvert && (
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    Pronto para conversão!
                  </span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-300 mb-3">
                  Este lead chegou ao status "Agendado" e pode ser convertido para cliente.
                </p>
                <Button 
                  onClick={handleConvertToClient}
                  disabled={updating}
                  className="w-full"
                >
                  {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <UserPlus className="h-4 w-4 mr-2" />
                  Converter para Cliente
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
              <Button size="sm" className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Agendar
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <DollarSign className="h-4 w-4 mr-2" />
                Orçamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function CRMVisual() {
  const { getClientsByPeriod, updateClientStatus } = useApp();
  
  // Estado do período selecionado
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodSelection>(() => {
    const current = getCurrentWeekPeriod();
    return {
      type: 'week',
      year: current.year,
      month: current.month,
      weekISO: current.weekISO
    };
  });

  // Estados para filtros adicionais
  const [statusFilter, setStatusFilter] = useState<Client['status'] | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Obter clientes do período selecionado
  const periodClients = useMemo(() => {
    return getClientsByPeriod(
      selectedPeriod.year,
      selectedPeriod.month,
      selectedPeriod.weekISO
    );
  }, [selectedPeriod, getClientsByPeriod]);

  // Aplicar filtros adicionais
  const filteredClients = useMemo(() => {
    let clients = [...periodClients];

    // Filtro por status específico
    if (statusFilter !== 'all') {
      clients = clients.filter(client => client.status === statusFilter);
    }

    // Filtro por mês e ano de criação
    if (selectedMonth !== 'all' || selectedYear !== 'all') {
      clients = clients.filter(client => {
        const clientDate = new Date(client.createdAt);
        const clientMonth = clientDate.getMonth() + 1;
        const clientYear = clientDate.getFullYear();
        
        const monthMatch = selectedMonth === 'all' || clientMonth === parseInt(selectedMonth);
        const yearMatch = selectedYear === 'all' || clientYear === parseInt(selectedYear);
        
        return monthMatch && yearMatch;
      });
    }

    return clients;
  }, [periodClients, statusFilter, selectedMonth, selectedYear]);

  // Calcular métricas do período
  const periodMetrics = useMemo((): PeriodMetrics => {
    const totalLeads = filteredClients.length;
    const leadsInFollowUp = filteredClients.filter(c => 
      ['em-conversa', 'orcamento-enviado'].includes(c.status)
    ).length;
    const leadsClosed = filteredClients.filter(c => 
      c.status === 'agendamento-realizado'
    ).length;
    const conversionRate = totalLeads > 0 ? (leadsClosed / totalLeads) * 100 : 0;

    return {
      totalLeads,
      leadsInFollowUp,
      leadsClosed,
      conversionRate
    };
  }, [filteredClients]);

  const handleStatusChange = async (clientId: string, newStatus: Client['status']) => {
    try {
      await updateClientStatus(clientId, newStatus);
    } catch (error) {
      console.error('Erro ao atualizar status do cliente:', error);
      throw error;
    }
  };

  const handleConvertToClient = async (clientId: string) => {
    try {
      // Remove a tag de lead e muda status para agendado (mantém no CRM)
      const client = filteredClients.find(c => c.id === clientId);
      if (client) {
        await updateClientStatus(clientId, 'agendamento-realizado');
        toast.success('Lead convertido para cliente com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao converter lead:', error);
      throw error;
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as Client['status'];
    await handleStatusChange(draggableId, newStatus);
  };

  const getClientsByStatus = (status: Client['status']) => {
    return filteredClients.filter(client => client.status === status);
  };

  const urgentClients = filteredClients.filter(client => {
    const daysSinceUpdate = Math.floor(
      (new Date().getTime() - client.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceUpdate > 3 && !['desqualificado'].includes(client.status);
  }).length;

  // Gerar opções de mês e ano
  const getAvailableMonths = () => {
    const months = [
      { value: '1', label: 'Janeiro' },
      { value: '2', label: 'Fevereiro' },
      { value: '3', label: 'Março' },
      { value: '4', label: 'Abril' },
      { value: '5', label: 'Maio' },
      { value: '6', label: 'Junho' },
      { value: '7', label: 'Julho' },
      { value: '8', label: 'Agosto' },
      { value: '9', label: 'Setembro' },
      { value: '10', label: 'Outubro' },
      { value: '11', label: 'Novembro' },
      { value: '12', label: 'Dezembro' }
    ];
    return months;
  };

  const getAvailableYears = () => {
    // Obter anos dos dados existentes
    const dataYears = new Set<number>();
    periodClients.forEach(client => {
      dataYears.add(new Date(client.createdAt).getFullYear());
    });

    // Adicionar anos padrão (ano atual e próximos/anteriores)
    const currentYear = new Date().getFullYear();
    const defaultYears = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
    
    // Combinar anos dos dados com anos padrão
    const allYears = new Set([...dataYears, ...defaultYears]);
    
    return Array.from(allYears).sort().reverse();
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setSelectedMonth('all');
    setSelectedYear('all');
  };

  const hasActiveFilters = statusFilter !== 'all' || selectedMonth !== 'all' || selectedYear !== 'all';

  // Contar clientes filtrados por mês/ano
  const getFilteredCount = (month?: string, year?: string) => {
    return periodClients.filter(client => {
      const clientDate = new Date(client.createdAt);
      const clientMonth = clientDate.getMonth() + 1;
      const clientYear = clientDate.getFullYear();
      
      const monthMatch = !month || month === 'all' || clientMonth === parseInt(month);
      const yearMatch = !year || year === 'all' || clientYear === parseInt(year);
      
      return monthMatch && yearMatch;
    }).length;
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="hidden lg:block">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">CRM Visual</h2>
            <p className="text-muted-foreground">Gerencie leads e arraste os cards para mover no funil de vendas</p>
          </div>
          <NewLeadDialog />
        </div>
      </div>

      {/* Botão mobile */}
      <div className="lg:hidden flex justify-end">
        <NewLeadDialog />
      </div>

      {/* Filtro de Período */}
      <PeriodFilter
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        metrics={periodMetrics}
      />

      {/* Filtros Adicionais para Follow-up */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Filtros para Follow-up</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Filtros rápidos por status */}
              <Button
                variant={statusFilter === 'em-conversa' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(statusFilter === 'em-conversa' ? 'all' : 'em-conversa')}
              >
                Em Conversa ({periodClients.filter(c => c.status === 'em-conversa').length})
              </Button>
              
              <Button
                variant={statusFilter === 'orcamento-enviado' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(statusFilter === 'orcamento-enviado' ? 'all' : 'orcamento-enviado')}
              >
                Orçamento Enviado ({periodClients.filter(c => c.status === 'orcamento-enviado').length})
              </Button>
            </div>

            {/* Filtros por Mês e Ano */}
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-medium">Filtrar por período de criação:</span>
              
              {/* Seletor de Mês */}
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Selecionar mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  {getAvailableMonths().map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label} ({getFilteredCount(month.value, selectedYear)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Seletor de Ano */}
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Selecionar ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os anos</SelectItem>
                  {getAvailableYears().map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year} ({getFilteredCount(selectedMonth, year.toString())})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <div className="text-sm text-muted-foreground">
                Mostrando {filteredClients.length} de {periodClients.length} leads
                {statusFilter !== 'all' && ` • Status: ${columns.find(c => c.id === statusFilter)?.title}`}
                {selectedMonth !== 'all' && ` • Mês: ${getAvailableMonths().find(m => m.value === selectedMonth)?.label}`}
                {selectedYear !== 'all' && ` • Ano: ${selectedYear}`}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ✅ CORREÇÃO: DragDropContext sem propriedade inexistente */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="lg:hidden">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4" style={{ width: `${columns.length * 280}px` }}>
              {columns.map((column) => {
                const columnClients = getClientsByStatus(column.id as Client['status']);
                const potentialValue = columnClients.reduce((sum, client) => sum + (client.totalPaid || 500), 0);
                
                return (
                  <div key={column.id} className="w-64 space-y-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${column.color}`} />
                          <CardTitle className="text-sm">{column.title}</CardTitle>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {columnClients.length} leads
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            R$ {potentialValue.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </CardHeader>
                    </Card>
                    
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-[300px] p-2 rounded-lg transition-colors ${
                            snapshot.isDraggingOver 
                              ? 'bg-muted/50 ring-2 ring-primary/20' 
                              : 'bg-transparent'
                          }`}
                        >
                          {columnClients.map((client, index) => (
                            <ClientCard
                              key={client.id}
                              client={client}
                              onStatusChange={handleStatusChange}
                              onConvertToClient={handleConvertToClient}
                              index={index}
                            />
                          ))}
                          {provided.placeholder}
                          
                          {columnClients.length === 0 && !snapshot.isDraggingOver && (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                              <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                                Arraste leads aqui
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-4">
          {columns.map((column) => {
            const columnClients = getClientsByStatus(column.id as Client['status']);
            const potentialValue = columnClients.reduce((sum, client) => sum + (client.totalPaid || 500), 0);
            
            return (
              <div key={column.id} className="space-y-3">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${column.color}`} />
                      <CardTitle className="text-sm">{column.title}</CardTitle>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {columnClients.length} leads
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        R$ {potentialValue.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  
                  </CardHeader>
                </Card>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[300px] p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver 
                          ? 'bg-muted/50 ring-2 ring-primary/20' 
                          : 'bg-transparent'
                      }`}
                    >
                      {columnClients.map((client, index) => (
                        <ClientCard
                          key={client.id}
                          client={client}
                          onStatusChange={handleStatusChange}
                          onConvertToClient={handleConvertToClient}
                          index={index}
                        />
                      ))}
                      {provided.placeholder}
                      
                      {columnClients.length === 0 && !snapshot.isDraggingOver && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                            Arraste leads aqui
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Alertas e Dicas */}
      {urgentClients > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200 text-sm lg:text-base">
                  Atenção: {urgentClients} leads precisam de follow-up urgente!
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  Leads sem contato há mais de 3 dias têm menor chance de conversão.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200 text-sm lg:text-base">
                💡 Dica: Use os filtros para follow-up rápido de leads em conversa e orçamentos enviados
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Os filtros por período e status ajudam a localizar rapidamente leads que precisam de atenção.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}