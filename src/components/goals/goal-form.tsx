"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Goal } from '@/lib/types';
import { toast } from 'sonner';
import {
  Target,
  Calendar,
  DollarSign,
  Percent,
  Loader2,
  Info
} from 'lucide-react';

interface GoalFormProps {
  goal?: Goal;
  month: string; // YYYY-MM format
  onSave: (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
}

export function GoalForm({ goal, month, onSave, onCancel, isEditing = false }: GoalFormProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    target: goal?.target.toString() || '',
    availableDays: goal?.availableDays.toString() || '',
    desiredTicketAverage: goal?.desiredTicketAverage?.toString() || '',
    expectedConversion: goal?.expectedConversion?.toString() || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.target.trim()) {
      toast.error('Meta de faturamento é obrigatória');
      return;
    }
    
    if (!formData.availableDays.trim()) {
      toast.error('Dias disponíveis é obrigatório');
      return;
    }
    
    const targetValue = parseFloat(formData.target.replace(',', '.'));
    if (isNaN(targetValue) || targetValue <= 0) {
      toast.error('Meta deve ser um valor válido maior que zero');
      return;
    }

    const availableDaysValue = parseInt(formData.availableDays);
    if (isNaN(availableDaysValue) || availableDaysValue <= 0 || availableDaysValue > 31) {
      toast.error('Dias disponíveis deve ser um número entre 1 e 31');
      return;
    }

    // Validações opcionais
    let desiredTicketAverage: number | undefined;
    if (formData.desiredTicketAverage.trim()) {
      desiredTicketAverage = parseFloat(formData.desiredTicketAverage.replace(',', '.'));
      if (isNaN(desiredTicketAverage) || desiredTicketAverage <= 0) {
        toast.error('Ticket médio deve ser um valor válido maior que zero');
        return;
      }
    }

    let expectedConversion: number | undefined;
    if (formData.expectedConversion.trim()) {
      expectedConversion = parseFloat(formData.expectedConversion.replace(',', '.'));
      if (isNaN(expectedConversion) || expectedConversion <= 0 || expectedConversion > 100) {
        toast.error('Conversão esperada deve ser um valor entre 0 e 100');
        return;
      }
    }

    setSaving(true);

    try {
      const goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> = {
        tattooerId: '1', // TODO: pegar do contexto
        month,
        target: targetValue,
        current: goal?.current || 0,
        percentage: goal?.percentage || 0,
        availableDays: availableDaysValue,
        desiredTicketAverage,
        expectedConversion
      };

      await onSave(goalData);
      toast.success(isEditing ? 'Meta atualizada com sucesso!' : 'Meta criada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      toast.error('Erro ao salvar meta. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const formatMonth = (monthStr: string) => {
    const [year, monthNum] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {isEditing ? 'Editar Meta' : 'Configurar Meta'} - {formatMonth(month)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campos Obrigatórios */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Campos Obrigatórios</h4>
            
            <div>
              <Label htmlFor="target">Meta de Faturamento (R$) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="target"
                  type="text"
                  value={formData.target}
                  onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                  placeholder="8000,00"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="availableDays">Dias Disponíveis para Atender *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="availableDays"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.availableDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, availableDays: e.target.value }))}
                  placeholder="22"
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Quantos dias do mês você pretende atender clientes
              </p>
            </div>
          </div>

          {/* Campos Opcionais */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Campos Opcionais</h4>
            
            <div>
              <Label htmlFor="desiredTicketAverage">Ticket Médio Desejado (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="desiredTicketAverage"
                  type="text"
                  value={formData.desiredTicketAverage}
                  onChange={(e) => setFormData(prev => ({ ...prev, desiredTicketAverage: e.target.value }))}
                  placeholder="400,00"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Se vazio, será usado o ticket médio real do período
              </p>
            </div>

            <div>
              <Label htmlFor="expectedConversion">Conversão Esperada (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="expectedConversion"
                  type="text"
                  value={formData.expectedConversion}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedConversion: e.target.value }))}
                  placeholder="25,0"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Se vazio, será usada a conversão real do CRM no período
              </p>
            </div>
          </div>

          {/* Informações */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Como funcionam os cálculos:
                </p>
                <ul className="text-blue-600 dark:text-blue-300 space-y-1 text-xs">
                  <li>• <strong>Vendas/dia:</strong> Meta ÷ Dias disponíveis</li>
                  <li>• <strong>Tatuagens necessárias:</strong> Meta ÷ Ticket médio (desejado ou real)</li>
                  <li>• <strong>Leads necessários:</strong> Tatuagens ÷ Taxa de conversão</li>
                  <li>• <strong>Taxa de conversão real:</strong> Calculada automaticamente do CRM</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Atualizar Meta' : 'Criar Meta'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}