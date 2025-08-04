"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useApp } from '@/contexts/app-context';
import { Client } from '@/lib/types';
import {
  Plus,
  Upload,
  X,
  User,
  Phone,
  Instagram,
  Palette,
  FileText,
  Tag
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

const commonTags = [
  'lead-quente',
  'cliente-fiel',
  'primeira-tattoo',
  'orçamento-alto',
  'reagendamento',
  'indicação',
  'redes-sociais',
  'convenção'
];

const anamneseQuestions = [
  { id: 'age', label: 'Idade', type: 'number' },
  { id: 'allergies', label: 'Possui alguma alergia?', type: 'text' },
  { id: 'medications', label: 'Toma algum medicamento?', type: 'text' },
  { id: 'skin_conditions', label: 'Problemas de pele?', type: 'text' },
  { id: 'previous_tattoos', label: 'Quantas tatuagens possui?', type: 'number' },
  { id: 'pain_tolerance', label: 'Tolerância à dor (1-10)', type: 'number' },
  { id: 'healing_issues', label: 'Problemas de cicatrização?', type: 'text' },
  { id: 'pregnancy', label: 'Está grávida ou amamentando?', type: 'select', options: ['Não', 'Grávida', 'Amamentando'] }
];

interface ClientFormProps {
  client?: Client;
  onSave: (client: Partial<Client>) => void;
  onCancel: () => void;
}

export function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    whatsapp: client?.whatsapp || '',
    instagram: client?.instagram || '',
    style: client?.style || '',
    observations: client?.observations || '',
    anamnese: client?.anamnese || {},
    tags: client?.tags || [],
    references: client?.references || []
  });

  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnamneseChange = (questionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      anamnese: {
        ...prev.anamnese,
        [questionId]: value
      }
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      status: client?.status || 'novo-contato',
      totalPaid: client?.totalPaid || 0,
      sessions: client?.sessions || [],
      createdAt: client?.createdAt || new Date(),
      updatedAt: new Date()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Maria Silva"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="whatsapp">WhatsApp *</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                placeholder="Ex: 11999999999"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                placeholder="Ex: @maria_silva"
              />
            </div>
            
            <div>
              <Label htmlFor="style">Estilo Desejado *</Label>
              <Select value={formData.style} onValueChange={(value) => handleInputChange('style', value)}>
                <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Anamnese */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Anamnese
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anamneseQuestions.map(question => (
              <div key={question.id}>
                <Label htmlFor={question.id}>{question.label}</Label>
                {question.type === 'select' ? (
                  <Select 
                    value={formData.anamnese[question.id] || ''} 
                    onValueChange={(value) => handleAnamneseChange(question.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options?.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={question.id}
                    type={question.type}
                    value={formData.anamnese[question.id] || ''}
                    onChange={(e) => handleAnamneseChange(question.id, e.target.value)}
                    placeholder={question.type === 'number' ? '0' : 'Digite aqui...'}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Observações e Tags */}
      <Card>
        
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Observações e Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => handleInputChange('observations', e.target.value)}
              placeholder="Descreva detalhes importantes sobre o cliente, projeto desejado, etc."
              rows={3}
            />
          </div>
          
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2 mb-3">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Nova tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(newTag))}
              />
              <Button type="button" onClick={() => addTag(newTag)}>
                Adicionar
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {commonTags.map(tag => (
                <Button
                  key={tag}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTag(tag)}
                  disabled={formData.tags.includes(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Referências Visuais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">Arraste imagens aqui ou clique para selecionar</p>
            <Button type="button" variant="outline">
              Selecionar Arquivos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          {client ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function NewClientDialog() {
  const { clients, setClients } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = (clientData: Partial<Client>) => {
    const newClient: Client = {
      id: Date.now().toString(),
      ...clientData
    } as Client;

    setClients([...clients, newClient]);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
        </DialogHeader>
        
        <ClientForm
          onSave={handleSave}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}