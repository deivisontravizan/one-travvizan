"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { TaxSettings } from '@/lib/types';
import { toast } from 'sonner';
import {
  Settings,
  CreditCard,
  Smartphone,
  DollarSign,
  Calculator,
  Save,
  Loader2,
  Info
} from 'lucide-react';

export function TaxSettingsComponent() {
  const { taxSettings, updateTaxSettings } = useApp();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    creditCardCashRate: '3.5',
    creditCardInstallmentRate: '4.5',
    debitCardRate: '2.5',
    pixRate: '0'
  });

  // Carregar configurações existentes
  useEffect(() => {
    if (taxSettings) {
      setFormData({
        creditCardCashRate: taxSettings.creditCardCashRate.toString(),
        creditCardInstallmentRate: taxSettings.creditCardInstallmentRate.toString(),
        debitCardRate: taxSettings.debitCardRate.toString(),
        pixRate: taxSettings.pixRate.toString()
      });
    }
  }, [taxSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setSaving(true);

    try {
      const settings: TaxSettings = {
        id: taxSettings?.id || '',
        tattooerId: user.id,
        creditCardCashRate: parseFloat(formData.creditCardCashRate),
        creditCardInstallmentRate: parseFloat(formData.creditCardInstallmentRate),
        debitCardRate: parseFloat(formData.debitCardRate),
        pixRate: parseFloat(formData.pixRate),
        installmentRates: {
          twoInstallments: 4.0,
          threeInstallments: 4.5,
          fourInstallments: 5.0,
          fiveInstallments: 5.5,
          sixInstallments: 6.0,
          sevenInstallments: 6.5,
          eightInstallments: 7.0,
          nineInstallments: 7.5,
          tenInstallments: 8.0,
          elevenInstallments: 8.5,
          twelveInstallments: 9.0
        },
        updatedAt: new Date()
      };

      await updateTaxSettings(settings);
      toast.success('Configurações de taxa atualizadas!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Permitir apenas números e vírgula/ponto
    const cleanValue = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setFormData(prev => ({
      ...prev,
      [field]: cleanValue
    }));
  };

  const calculateNetValue = (grossValue: number, rate: number) => {
    const fees = (grossValue * rate) / 100;
    return grossValue - fees;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações de Taxa</h2>
        <p className="text-muted-foreground">
          Configure as taxas das maquininhas para cálculo automático dos valores líquidos
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200 text-sm">
                💡 Como funciona
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Essas taxas são usadas nas Comandas para calcular automaticamente o valor líquido que você recebe após as taxas da maquininha.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Cartão de Crédito
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="creditCardCashRate">Taxa à Vista (%)</Label>
                <Input
                  id="creditCardCashRate"
                  value={formData.creditCardCashRate}
                  onChange={(e) => handleInputChange('creditCardCashRate', e.target.value)}
                  placeholder="3.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Exemplo: R$ 100 → Líquido: R$ {calculateNetValue(100, parseFloat(formData.creditCardCashRate) || 0).toFixed(2)}
                </p>
              </div>

              <div>
                <Label htmlFor="creditCardInstallmentRate">Taxa Parcelado (%)</Label>
                <Input
                  id="creditCardInstallmentRate"
                  value={formData.creditCardInstallmentRate}
                  onChange={(e) => handleInputChange('creditCardInstallmentRate', e.target.value)}
                  placeholder="4.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Exemplo: R$ 100 → Líquido: R$ {calculateNetValue(100, parseFloat(formData.creditCardInstallmentRate) || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Cartão de Débito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="debitCardRate">Taxa Débito (%)</Label>
              <Input
                id="debitCardRate"
                value={formData.debitCardRate}
                onChange={(e) => handleInputChange('debitCardRate', e.target.value)}
                placeholder="2.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: R$ 100 → Líquido: R$ {calculateNetValue(100, parseFloat(formData.debitCardRate) || 0).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              PIX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="pixRate">Taxa PIX (%)</Label>
              <Input
                id="pixRate"
                value={formData.pixRate}
                onChange={(e) => handleInputChange('pixRate', e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: R$ 100 → Líquido: R$ {calculateNetValue(100, parseFloat(formData.pixRate) || 0).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Simulador de Taxa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">Crédito à Vista</p>
                <p className="text-muted-foreground">Taxa: {formData.creditCardCashRate}%</p>
                <p className="font-bold text-green-600">
                  R$ 100 → R$ {calculateNetValue(100, parseFloat(formData.creditCardCashRate) || 0).toFixed(2)}
                </p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">Crédito Parcelado</p>
                <p className="text-muted-foreground">Taxa: {formData.creditCardInstallmentRate}%</p>
                <p className="font-bold text-green-600">
                  R$ 100 → R$ {calculateNetValue(100, parseFloat(formData.creditCardInstallmentRate) || 0).toFixed(2)}
                </p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">Débito</p>
                <p className="text-muted-foreground">Taxa: {formData.debitCardRate}%</p>
                <p className="font-bold text-green-600">
                  R$ 100 → R$ {calculateNetValue(100, parseFloat(formData.debitCardRate) || 0).toFixed(2)}
                </p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">PIX</p>
                <p className="text-muted-foreground">Taxa: {formData.pixRate}%</p>
                <p className="font-bold text-green-600">
                  R$ 100 → R$ {calculateNetValue(100, parseFloat(formData.pixRate) || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </form>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <p>
              <strong>Taxas Variáveis:</strong> As taxas podem variar conforme sua maquininha e plano contratado. 
              Consulte sua operadora para valores exatos.
            </p>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <p>
              <strong>Cálculo Automático:</strong> Nas comandas, o sistema calculará automaticamente o valor líquido 
              baseado nessas configurações.
            </p>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <p>
              <strong>Atualização:</strong> Você pode alterar essas configurações a qualquer momento. 
              As mudanças afetarão apenas novos lançamentos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}