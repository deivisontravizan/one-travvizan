"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/app-context';
import { TaxSettings } from '@/lib/types';
import {
  CreditCard,
  Smartphone,
  Banknote,
  Calculator,
  Save,
  Loader2
} from 'lucide-react';

export function TaxSettingsForm() {
  const { taxSettings, updateTaxSettings, user } = useApp();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    creditCardCashRate: taxSettings?.creditCardCashRate.toString() || '3.5',
    creditCardInstallmentRate: taxSettings?.creditCardInstallmentRate.toString() || '4.5',
    debitCardRate: taxSettings?.debitCardRate.toString() || '2.5',
    pixRate: taxSettings?.pixRate.toString() || '0'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const newSettings: TaxSettings = {
        id: taxSettings?.id || Date.now().toString(),
        tattooerId: user?.id || '1',
        creditCardCashRate: parseFloat(formData.creditCardCashRate) || 0,
        creditCardInstallmentRate: parseFloat(formData.creditCardInstallmentRate) || 0,
        debitCardRate: parseFloat(formData.debitCardRate) || 0,
        pixRate: parseFloat(formData.pixRate) || 0,
        updatedAt: new Date()
      };

      await updateTaxSettings(newSettings);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Configuração de Taxas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="credit-cash" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Cartão de Crédito à Vista (%)
              </Label>
              <Input
                id="credit-cash"
                type="number"
                step="0.1"
                value={formData.creditCardCashRate}
                onChange={(e) => handleInputChange('creditCardCashRate', e.target.value)}
                placeholder="3.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit-installment" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Cartão de Crédito Parcelado (%)
              </Label>
              <Input
                id="credit-installment"
                type="number"
                step="0.1"
                value={formData.creditCardInstallmentRate}
                onChange={(e) => handleInputChange('creditCardInstallmentRate', e.target.value)}
                placeholder="4.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="debit" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Cartão de Débito (%)
              </Label>
              <Input
                id="debit"
                type="number"
                step="0.1"
                value={formData.debitCardRate}
                onChange={(e) => handleInputChange('debitCardRate', e.target.value)}
                placeholder="2.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pix" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                PIX (%)
              </Label>
              <Input
                id="pix"
                type="number"
                step="0.1"
                value={formData.pixRate}
                onChange={(e) => handleInputChange('pixRate', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Exemplo de Cálculo</h4>
            <p className="text-sm text-muted-foreground">
              Para um serviço de R$ 100,00 no cartão de crédito à vista:
            </p>
            <p className="text-sm">
              • Taxa: R$ {(100 * (parseFloat(formData.creditCardCashRate) || 0) / 100).toFixed(2)}
            </p>
            <p className="text-sm">
              • Valor líquido: R$ {(100 - (100 * (parseFloat(formData.creditCardCashRate) || 0) / 100)).toFixed(2)}
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}