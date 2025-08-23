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
    pixRate: taxSettings?.pixRate.toString() || '0',
    // Configurações de parcelamento até 12x
    twoInstallments: taxSettings?.installmentRates?.twoInstallments.toString() || '4.0',
    threeInstallments: taxSettings?.installmentRates?.threeInstallments.toString() || '4.5',
    fourInstallments: taxSettings?.installmentRates?.fourInstallments.toString() || '5.0',
    fiveInstallments: taxSettings?.installmentRates?.fiveInstallments.toString() || '5.5',
    sixInstallments: taxSettings?.installmentRates?.sixInstallments.toString() || '6.0',
    sevenInstallments: taxSettings?.installmentRates?.sevenInstallments.toString() || '6.5',
    eightInstallments: taxSettings?.installmentRates?.eightInstallments.toString() || '7.0',
    nineInstallments: taxSettings?.installmentRates?.nineInstallments.toString() || '7.5',
    tenInstallments: taxSettings?.installmentRates?.tenInstallments.toString() || '8.0',
    elevenInstallments: taxSettings?.installmentRates?.elevenInstallments.toString() || '8.5',
    twelveInstallments: taxSettings?.installmentRates?.twelveInstallments.toString() || '9.0'
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
        installmentRates: {
          twoInstallments: parseFloat(formData.twoInstallments) || 0,
          threeInstallments: parseFloat(formData.threeInstallments) || 0,
          fourInstallments: parseFloat(formData.fourInstallments) || 0,
          fiveInstallments: parseFloat(formData.fiveInstallments) || 0,
          sixInstallments: parseFloat(formData.sixInstallments) || 0,
          sevenInstallments: parseFloat(formData.sevenInstallments) || 0,
          eightInstallments: parseFloat(formData.eightInstallments) || 0,
          nineInstallments: parseFloat(formData.nineInstallments) || 0,
          tenInstallments: parseFloat(formData.tenInstallments) || 0,
          elevenInstallments: parseFloat(formData.elevenInstallments) || 0,
          twelveInstallments: parseFloat(formData.twelveInstallments) || 0
        },
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
          {/* Taxas básicas */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Taxas Básicas</h4>
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
          </div>

          {/* Taxas de parcelamento */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Taxas de Parcelamento</h4>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="two-installments" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  2x (%)
                </Label>
                <Input
                  id="two-installments"
                  type="number"
                  step="0.1"
                  value={formData.twoInstallments}
                  onChange={(e) => handleInputChange('twoInstallments', e.target.value)}
                  placeholder="4.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="three-installments" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  3x (%)
                </Label>
                <Input
                  id="three-installments"
                  type="number"
                  step="0.1"
                  value={formData.threeInstallments}
                  onChange={(e) => handleInputChange('threeInstallments', e.target.value)}
                  placeholder="4.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="four-installments" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  4x (%)
                </Label>
                <Input
                  id="four-installments"
                  type="number"
                  step="0.1"
                  value={formData.fourInstallments}
                  onChange={(e) => handleInputChange('fourInstallments', e.target.value)}
                  placeholder="5.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="five-installments" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  5x (%)
                </Label>
                <Input
                  id="five-installments"
                  type="number"
                  step="0.1"
                  value={formData.fiveInstallments}
                  onChange={(e) => handleInputChange('fiveInstallments', e.target.value)}
                  placeholder="5.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="six-installments" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  6x (%)
                </Label>
                <Input
                  id="six-installments"
                  type="number"
                  step="0.1"
                  value={formData.sixInstallments}
                  onChange={(e) => handleInputChange('sixInstallments', e.target.value)}
                  placeholder="6.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seven-installments" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  7x (%)
                </Label>
                <Input
                  id="seven-installments"
                  type="number"
                  step="0.1"
                  value={formData.sevenInstallments}
                  onChange={(e) => handleInputChange('sevenInstallments', e.target.value)}
                  placeholder="6.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eight-installments" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  8x (%)
                </Label>
                <Input
                  id="eight-installments"
                  type="number"
                  step="0.1"
                  value={formData.eightInstallments}
                  onChange={(e) => handleInputChange('eightInstallments', e.target.value)}
                  placeholder="7.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nine-installments" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  9x (%)
                </Label>
                <Input
                  id="nine-installments"
                  type="number"
                  step="0.1"
                  value={formData.nineInstallments}
                  onChange={(e) => handleInputChange('nineInstallments', e.target.value)}
                  placeholder="7.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ten-installments" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  10x (%)
                </Label>
                <Input
                  id="ten-installments"
                  type="number"
                  step="0.1"
                  value={formData.tenInstallments}
                  onChange={(e) => handleInputChange('tenInstallments', e.target.value)}
                  placeholder="8.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eleven-installments" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  11x (%)
                </Label>
                <Input
                  id="eleven-installments"
                  type="number"
                  step="0.1"
                  value={formData.elevenInstallments}
                  onChange={(e) => handleInputChange('elevenInstallments', e.target.value)}
                  placeholder="8.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twelve-installments" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  12x (%)
                </Label>
                <Input
                  id="twelve-installments"
                  type="number"
                  step="0.1"
                  value={formData.twelveInstallments}
                  onChange={(e) => handleInputChange('twelveInstallments', e.target.value)}
                  placeholder="9.0"
                />
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Exemplo de Cálculo</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Para um serviço de R$ 100,00:
            </p>
            <div className="space-y-1 text-sm">
              <p>• Cartão à vista: Taxa R$ {(100 * (parseFloat(formData.creditCardCashRate) || 0) / 100).toFixed(2)} | Líquido R$ {(100 - (100 * (parseFloat(formData.creditCardCashRate) || 0) / 100)).toFixed(2)}</p>
              <p>• Débito: Taxa R$ {(100 * (parseFloat(formData.debitCardRate) || 0) / 100).toFixed(2)} | Líquido R$ {(100 - (100 * (parseFloat(formData.debitCardRate) || 0) / 100)).toFixed(2)}</p>
              <p>• 2x no cartão: Taxa R$ {(100 * (parseFloat(formData.twoInstallments) || 0) / 100).toFixed(2)} | Líquido R$ {(100 - (100 * (parseFloat(formData.twoInstallments) || 0) / 100)).toFixed(2)}</p>
              <p>• 12x no cartão: Taxa R$ {(100 * (parseFloat(formData.twelveInstallments) || 0) / 100).toFixed(2)} | Líquido R$ {(100 - (100 * (parseFloat(formData.twelveInstallments) || 0) / 100)).toFixed(2)}</p>
            </div>
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