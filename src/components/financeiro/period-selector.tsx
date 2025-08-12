"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface PeriodSelectorProps {
  selectedYear: number;
  selectedMonth: number;
  onPeriodChange: (year: number, month: number) => void;
}

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function PeriodSelector({ selectedYear, selectedMonth, onPeriodChange }: PeriodSelectorProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const isCurrentPeriod = selectedYear === currentYear && selectedMonth === currentMonth;

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      onPeriodChange(selectedYear - 1, 12);
    } else {
      onPeriodChange(selectedYear, selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      onPeriodChange(selectedYear + 1, 1);
    } else {
      onPeriodChange(selectedYear, selectedMonth + 1);
    }
  };

  const handleCurrentMonth = () => {
    onPeriodChange(currentYear, currentMonth);
  };

  // Gerar lista de anos (5 anos para trás e 2 para frente)
  const years = [];
  for (let year = currentYear - 5; year <= currentYear + 2; year++) {
    years.push(year);
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          {/* Navegação de Período */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium text-sm lg:text-base">
                  {months[selectedMonth - 1]} {selectedYear}
                </p>
                {isCurrentPeriod && (
                  <p className="text-xs text-muted-foreground">Período atual</p>
                )}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Seletores */}
          <div className="flex gap-2">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => onPeriodChange(selectedYear, parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => onPeriodChange(parseInt(value), selectedMonth)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botão Período Atual */}
          {!isCurrentPeriod && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCurrentMonth}
            >
              Mês Atual
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}