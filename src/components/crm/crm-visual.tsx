"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/app-context';
import { Client } from '@/lib/types';
import { NewLeadDialog, ConvertToClientDialog } from './lead-form';
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
  CheckCircle
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
    id: 'cliente-fidelizado', 
    title: 'Fidelizado', 
    color: 'bg-purple-500',
    description: 'Cliente recorrente'
  },
  { 
    id: 'cancelado', 
    title: 'Perdido', 
    color: 'bg-red-500',
    description: 'Negócio não fechado'
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
                    <span className="text-xs text-muted-foreground">
                      {Math.floor((new Date().getTime() - client.updatedAt.getTime()) / (1000 * 60 * 60 * 24))}d
                    </span>
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
  const { clients, updateClientData } = useApp();

  const handleStatusChange = async (clientId: string, newStatus: Client['status']) => {
    try {
      await updateClientData(clientId, { status: newStatus });
    } catch (error) {
      console.error('Erro ao atualizar status do cliente:', error);
      throw error;
    }
  };

  const handleConvertToClient = async (clientId: string) => {
    try {
      // Remove a tag de lead e muda status para cliente fidelizado
      const client = clients.find(c => c.id === clientId);
      if (client) {
        const updatedTags = client.tags.filter(tag => tag !== 'lead-crm');
        await updateClientData(clientId, { 
          status: 'cliente-fidelizado',
          tags: updatedTags
        });
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
    return clients.filter(client => client.status === status);
  };

  const totalClients = clients.length;
  const totalLeads = clients.filter(c => c.tags.includes('lead-crm')).length;
  const conversionRate = totalClients > 0 ? 
    (getClientsByStatus('agendamento-realizado').length / totalClients) * 100 : 0;
  
  const urgentClients = clients.filter(client => {
    const daysSinceUpdate = Math.floor(
      (new Date().getTime() - client.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceUpdate > 3 && !['cliente-fidelizado', 'cancelado'].includes(client.status);
  }).length;

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

      {/* Métricas do Funil - Responsivo */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-xl lg:text-2xl font-bold">{totalClients}</div>
                <p className="text-xs text-muted-foreground">Total de Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-xl lg:text-2xl font-bold">{totalLeads}</div>
                <p className="text-xs text-muted-foreground">Leads Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-xl lg:text-2xl font-bold">{conversionRate.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-xl lg:text-2xl font-bold">{urgentClients}</div>
                <p className="text-xs text-muted-foreground">Leads Urgentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funil de Vendas - Mobile com scroll horizontal */}
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
                    
                    <Droppable droppableId={column.id} isDropDisabled={false}>
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
        <div className="hidden lg:grid lg:grid-cols-6 gap-4">
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
                
                <Droppable droppableId={column.id} isDropDisabled={false}>
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
                💡 Dica: Adicione leads rapidamente e converta-os para clientes quando fecharem negócio
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Leads que chegam ao status "Agendado" podem ser convertidos para clientes com um clique.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}