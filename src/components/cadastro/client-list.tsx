"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientForm } from '@/components/clients/client-form';
import { useApp } from '@/contexts/app-context';
import { Client } from '@/lib/types';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Phone,
  Instagram,
  Calendar,
  DollarSign,
  FileText,
  User,
  Clock,
  Tag
} from 'lucide-react';

interface ClientDetailViewProps {
  client: Client;
  onEdit: () => void;
}

function ClientDetailView({ client, onEdit }: ClientDetailViewProps) {
  const { sessions } = useApp();
  
  const clientSessions = sessions.filter(s => s.clientId === client.id);
  const totalSessions = clientSessions.length;
  const completedSessions = clientSessions.filter(s => s.status === 'realizado').length;
  const totalPaid = clientSessions
    .filter(s => s.status === 'realizado')
    .reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl lg:text-2xl font-bold">{client.name}</h3>
          <p className="text-muted-foreground text-sm">Cliente desde {client.createdAt.toLocaleDateString('pt-BR')}</p>
        </div>
        <Button onClick={onEdit} size="sm" className="w-full lg:w-auto">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="info" className="text-xs lg:text-sm">Informações</TabsTrigger>
          <TabsTrigger value="anamnese" className="text-xs lg:text-sm">Anamnese</TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs lg:text-sm">Sessões</TabsTrigger>
          <TabsTrigger value="financeiro" className="text-xs lg:text-sm">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base lg:text-lg">Dados Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{client.whatsapp}</span>
                </div>
                {client.instagram && (
                  <div className="flex items-center gap-3">
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{client.instagram}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs">{client.style}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base lg:text-lg">Status e Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Status Atual</label>
                  <Badge className="ml-2 text-xs">{client.status}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {client.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base lg:text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{client.observations || 'Nenhuma observação registrada.'}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anamnese" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base lg:text-lg">Ficha de Anamnese</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(client.anamnese).length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {Object.entries(client.anamnese).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-sm font-medium capitalize">{key.replace('_', ' ')}</label>
                      <p className="text-sm text-muted-foreground">{value || 'Não informado'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Anamnese não preenchida.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="text-xl lg:text-2xl font-bold">{totalSessions}</div>
                <p className="text-xs text-muted-foreground">Total de Sessões</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xl lg:text-2xl font-bold text-green-600">{completedSessions}</div>
                <p className="text-xs text-muted-foreground">Sessões Realizadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xl lg:text-2xl font-bold">
                  {totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Taxa de Conclusão</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base lg:text-lg">Histórico de Sessões</CardTitle>
            </CardHeader>
            <CardContent>
              {clientSessions.length > 0 ? (
                <div className="space-y-3">
                  {clientSessions.map((session) => (
                    <div key={session.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-3 border rounded-lg gap-2">
                      <div>
                        <p className="font-medium text-sm">{session.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.date).toLocaleDateString('pt-BR')} • {session.duration}h
                        </p>
                      </div>
                      <div className="text-left lg:text-right">
                        <p className="font-medium text-sm">R$ {session.value.toLocaleString('pt-BR')}</p>
                        <Badge variant="outline" className="text-xs">
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma sessão registrada.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base lg:text-lg">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Pago:</span>
                  <span className="font-medium text-green-600 text-sm">
                    R$ {totalPaid.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Ticket Médio:</span>
                  <span className="font-medium text-sm">
                    R$ {completedSessions > 0 ? (totalPaid / completedSessions).toLocaleString('pt-BR') : '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Última Sessão:</span>
                  <span className="text-muted-foreground text-sm">
                    {clientSessions.length > 0 ? 
                      new Date(clientSessions[clientSessions.length - 1].date).toLocaleDateString('pt-BR') :
                      'Nunca'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base lg:text-lg">Valor do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Lifetime Value (LTV)</label>
                  <div className="text-xl lg:text-2xl font-bold text-blue-600">
                    R$ {totalPaid.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Classificação</label>
                  <Badge className="ml-2 text-xs" variant={totalPaid > 1000 ? 'default' : 'secondary'}>
                    {totalPaid > 1000 ? 'Cliente Premium' : 'Cliente Regular'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function ClientList() {
  const { clients, setClients } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.whatsapp.includes(searchTerm) ||
    client.style.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveClient = (clientData: Partial<Client>) => {
    if (editingClient) {
      // Editar cliente existente
      setClients(clients.map(client =>
        client.id === editingClient.id
          ? { ...client, ...clientData, updatedAt: new Date() }
          : client
      ));
    } else {
      // Criar novo cliente
      const newClient: Client = {
        id: Date.now().toString(),
        ...clientData
      } as Client;
      setClients([...clients, newClient]);
    }
    
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
    setSelectedClient(null);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="hidden lg:block">
          <h2 className="text-2xl font-bold">Cadastro de Clientes</h2>
          <p className="text-muted-foreground">Gerencie os dados completos dos seus clientes</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="w-full lg:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, WhatsApp ou estilo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" className="w-full lg:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <div className="grid gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                  </div>
                  
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="font-medium text-sm lg:text-base">{client.name}</h3>
                    <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 text-xs lg:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {client.whatsapp}
                      </span>
                      {client.instagram && (
                        <span className="flex items-center gap-1">
                          <Instagram className="h-3 w-3" />
                          {client.instagram}
                        </span>
                      )}
                      <Badge variant="outline" className="text-xs w-fit">
                        {client.style}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-4">
                  <div className="text-left lg:text-right">
                    <p className="text-sm font-medium">R$ {client.totalPaid.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-muted-foreground">Total pago</p>
                  </div>
                  
                  <div className="flex gap-2 w-full lg:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedClient(client)}
                      className="flex-1 lg:flex-none"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      <span className="lg:inline">Ver Detalhes</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClient(client)}
                      className="lg:px-3"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {client.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {client.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredClients.length === 0 && (
          <Card>
            <CardContent className="p-8 lg:p-12 text-center">
              <User className="h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece cadastrando seu primeiro cliente'}
              </p>
              <Button onClick={() => setIsFormOpen(true)} className="w-full lg:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Cliente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Detalhes do Cliente */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-[95vw] lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <ClientDetailView
              client={selectedClient}
              onEdit={() => handleEditClient(selectedClient)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
            </DialogTitle>
          </DialogHeader>
          <ClientForm
            client={editingClient || undefined}
            onSave={handleSaveClient}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingClient(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}