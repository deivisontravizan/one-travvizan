"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useApp } from '@/contexts/app-context';
import { Client } from '@/lib/types';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
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
  GripVertical
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
  onStatusChange: (clientId: string, newStatus: Client['status']) => void;
  index: number;
}

function ClientCard({ client, onStatusChange, index }: ClientCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = (newStatus: Client['status']) => {
    onStatusChange(client.id, newStatus);
    setIsOpen(false);
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
            }`}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm flex-1">{client.name}</h4>
                    <div className="flex items-center gap-1">
                      {urgency === 'high' && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                      <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </div>
                      <Eye 
                        className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(true);
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {client.whatsapp}
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
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Draggable>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ações de CRM - {client.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-2">
                {columns.map((column) => (
                  <Button
                    key={column.id}
                    variant={client.status === column.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange(column.id as Client['status'])}
                    className="text-xs justify-start"
                    disabled={client.status === column.id}
                  >
                    <div className={`w-2 h-2 rounded-full ${column.color} mr-2`} />
                    {column.title}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
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
  const { clients, setClients } = useApp();

  const handleStatusChange = (clientId: string, newStatus: Client['status']) => {
    setClients(clients.map(client => 
      client.id === clientId 
        ? { ...client, status: newStatus, updatedAt: new Date() }
        : client
    ));
  };

  const handleDragEnd = (result: DropResult) => {
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
    handleStatusChange(draggableId, newStatus);
  };

  const getClientsByStatus = (status: Client['status']) => {
    return clients.filter(client => client.status === status);
  };

  const totalClients = clients.length;
  const conversionRate = totalClients > 0 ? 
    (getClientsByStatus('agendamento-realizado').length / totalClients) * 100 : 0;
  
  const urgentClients = clients.filter(client => {
    const daysSinceUpdate = Math.floor(
      (new Date().getTime() - client.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceUpdate > 3 && !['cliente-fidelizado', 'cancelado'].includes(client.status);
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">CRM Visual</h2>
          <p className="text-muted-foreground">Arraste os cards para mover leads no funil de vendas</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{totalClients}</div>
                <p className="text-xs text-muted-foreground">Total de Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{conversionRate.toFixed(0)}%</div>
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
                <div className="text-2xl font-bold">{urgentClients}</div>
                <p className="text-xs text-muted-foreground">Leads Urgentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{getClientsByStatus('cliente-fidelizado').length}</div>
                <p className="text-xs text-muted-foreground">Clientes Fidelizados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

      {urgentClients > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">
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
            <GripVertical className="h-4 w-4 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">
                💡 Dica: Arraste os cards entre as colunas para mover leads no funil
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Use o ícone de arrastar (⋮⋮) ou clique no card para ver mais opções.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}