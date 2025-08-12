"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialPeriod } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface FinancialChartProps {
  data: FinancialPeriod[];
  selectedYear: number;
}

const months = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export function FinancialChart({ data, selectedYear }: FinancialChartProps) {
  // Preparar dados para o gráfico
  const chartData = months.map((monthName, index) => {
    const monthData = data.find(d => d.year === selectedYear && d.month === index + 1);
    
    return {
      month: monthName,
      faturamento: monthData?.grossRevenue || 0,
      despesas: monthData?.totalExpenses || 0,
      lucro: monthData?.netProfit || 0
    };
  });

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${label}/${selectedYear}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Evolução Financeira {selectedYear}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="faturamento" 
                name="Faturamento" 
                fill="#10b981" 
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="despesas" 
                name="Despesas" 
                fill="#ef4444" 
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="lucro" 
                name="Lucro" 
                fill="#3b82f6" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>• <span className="text-green-600">Faturamento:</span> Receitas automáticas da Agenda e Comandas</p>
          <p>• <span className="text-red-600">Despesas:</span> Gastos registrados manualmente</p>
          <p>• <span className="text-blue-600">Lucro:</span> Faturamento - Despesas</p>
        </div>
      </CardContent>
    </Card>
  );
}