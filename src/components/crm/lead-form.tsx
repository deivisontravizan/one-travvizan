"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useApp } from '@/contexts/app-context';
import { Client } from '@/lib/types';
import { toast } from 'sonner';
import {
  Plus,
  UserPlus,
  Loader2,
  Phone,
  Instagram,
  MessageSquare
} from 'lucide-react';

const tattooStyles = [
  'Fine Line',
  'Realismo',
  'Old School',
  'New School',
  'Blackwork',
  'Aquarela',
  'Minimalista',
  'Geométrico',
  'Tribal',
  'Japonês',
  'Lettering',
  'Pontilhismo'
];

interface LeadFormProps {
  onSave: (leadData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'sessions'>) => Promise<void>;
  onCancel: () => void;
}

function LeadForm({ onSave, onCancel }: LeadFormProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    instagram: '',
    style: '',
    observations: '',
    status: 'novo-contato' as Client['status']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    
    if (!formData.whatsapp.trim()) {
      toast.error('WhatsApp é obrigatório');
      return;
    }
    
    if (!formData.style) {
      toast.error('Estilo desejado é obrigatório');
      return;
    }

    setSaving(true);

    try {
      const leadData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'sessions'> = {
        name: formData.name,
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
        style: formData.style,
        observations: formData.observations,
        status: formData.status,
        totalPaid: 0,
        references: [],
        anamnese: {},
        tags: ['lead-crm']
      };

      await onSave(leadData);
      toast.success('Lead adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
      toast.error('Erro ao adicionar lead. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Maria Silva"
            required
            className={!formData.name.trim() ? 'border-red-300' : ''}
          />
        </div>
        
        <div>
          <Label htmlFor="whatsapp">WhatsApp *</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
            placeholder="Ex: 11999999999"
            required
            className={!formData.whatsapp.trim() ? 'border-red-300' : ''}
          />
        </div>
        
        <div>
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={formData.instagram}
            onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
            placeholder="Ex: @maria_silva"
          />
        </div>
        
        <div>
          <Label htmlFor="style">Estilo Desejado *</Label>
          <Select value={formData.style} onValueChange={(value) => setFormData(prev => ({ ...prev, style: value }))}>
            <SelectTrigger className={!formData.style ? 'border-red-300' : ''}>
              <SelectValue placeholder="Selecione o estilo" />
            </SelectTrigger>
            <SelectContent>
              {tattooStyles.map(style => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status Inicial</Label>
        <Select value={formData.status} onValueChange={(value: Client['status']) => setFormData(prev => ({ ...prev, status: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="novo-contato">Novo Contato</SelectItem>
            <SelectItem value="em-conversa">Em Conversa</SelectItem>
            <SelectItem value="orcamento-enviado">Orçamento Enviado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="observations">Observações</Label>
        <Textarea
          id="observations"
          value={formData.observations}
          onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
          placeholder="Descreva detalhes sobre o interesse do lead, projeto desejado, etc."
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Adicionar Lead
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function NewLeadDialog() {
  const { addClient } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = async (leadData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'sessions'>) => {
    try {
      await addClient(leadData);
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Lead
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Adicionar Novo Lead
          </DialogTitle>
        </DialogHeader>
        
        <LeadForm
          onSave={handleSave}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

interface ConvertToClientDialogProps {
  client: Client;
  onConvert: (clientId: string) => Promise<void>;
}

export function ConvertToClientDialog({ client, onConvert }: ConvertToClientDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [converting, setConverting] = useState(false);

  const handleConvert = async () => {
    setConverting(true);
    try {
      await onConvert(client.id);
      toast.success(`${client.name} convertido para cliente com sucesso!`);
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao converter lead:', error);
      toast.error('Erro ao converter lead. Tente novamente.');
    } finally {
      setConverting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          Converter
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Converter Lead para Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">{client.name}</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                {client.whatsapp}
              </div>
              {client.instagram && (
                <div className="flex items-center gap-2">
                  <Instagram className="h-3 w-3" />
                  {client.instagram}
                </div>
              )}
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3 w-3" />
                {client.style}
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Ao converter este lead para cliente, ele será movido para o status "Cliente Fidelizado" 
            e aparecerá no módulo de Cadastro de Clientes com todos os dados preservados.
          </p>
          
          <div className="flex gap-2">
            <Button onClick={handleConvert} className="flex-1" disabled={converting}>
              {converting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Converter para Cliente
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={converting}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}