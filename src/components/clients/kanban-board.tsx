"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { NewClientDialog } from '@/components/clients/client-form';
import { useApp } from '@/contexts/app-context';
import { Client } from '@/lib/types';
import {
  Plus,
  Phone,
  Instagram,
  Eye,
  MessageSquare,
  Calendar,
  DollarSign
} from 'lucide-react';

const columns = [
  { id: 'novo-contato', title: 'Novo Contato', color: 'bg-blue-500' },
  { id: 'em-conversa', title: 'Em Conversa', color: 'bg-yellow-500' },
  { id: 'orcamento-enviado', title: 'Orçamento Enviado', color: 'bg-orange-500' },
  { id: 'agendamento-realizado', title: 'Agendamento Realizado', color: 'bg-green-500' },
  { id: 'cliente-fidelizado', title: 'Cliente Fidelizado', color: 'bg-purple-500' },
  { id: 'cancelado', title: 'Cancelado/Perdido', color: 'bg-red-500' }
];

interface ClientCardProps {
  client: Client;
  onStatusChange: (clientId: string, newStatus: Client['status']) => void;
}

function ClientCard({ client, onStatusChange }: ClientCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = (newStatus: Client['status']) => {
    onStatusChange(client.id, newStatus);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow mb-3">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{client.name}</h4>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                {client.whatsapp}
              </div>
              
              {client.instagram && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Instagram className="h-3 w-3" />
                  {client.instagram}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {client.style}
                </Badge>
                {client.totalPaid > 0 && (
                  <span className="text-xs font-medium text-green-600">
                    R$ {client.totalPaid}
                  </span>
                )}
              </div>
              
              {client.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {client.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <p className="text-sm text-muted-foreground">{client.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">WhatsApp</label>
              <p className="text-sm text-muted-foreground">{client.whatsapp}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Instagram</label>
              <p className="text-sm text-muted-foreground">{client.instagram || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Estilo</label>
              <p className="text-sm text-muted-foreground">{client.style}</p>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="text-sm font-medium">Observações</label>
            <p className="text-sm text-muted-foreground mt-1">{client.observations}</p>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium mb-2 block">Alterar Status</label>
            <div className="grid grid-cols-2 gap-2">
              {columns.map((column) => (
                <Button
                  key={column.id}
                  variant={client.status === column.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusChange(column.id as Client['status'])}
                  className="text-xs"
                >
                  {column.title}
                </Button>
              ))}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="flex gap-2">
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
  );
}

export function KanbanBoard() {
  const { clients, setClients } = useApp();

  const handleStatusChange = (clientId: string, newStatus: Client['status']) => {
    setClients(clients.map(client => 
      client.id === clientId 
        ? { ...client, status: newStatus, updatedAt: new Date() }
        : client
    ));
  };

  const getClientsByStatus = (status: Client['status']) => {
    return clients.filter(client => client.status === status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestão de Clientes</h2>
        <NewClientDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {columns.map((column) => {
          const columnClients = getClientsByStatus(column.id as Client['status']);
          
          return (
            <div key={column.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-medium text-sm">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {columnClients.length}
                </Badge>
              </div>
              
              <div className="space-y-2 min-h-[200px]">
                {columnClients.map((client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    onStatusChange={handleStatusChange}
                  />
                ))}
                
                {columnClients.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Nenhum cliente
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}