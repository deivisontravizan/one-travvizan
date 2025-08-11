"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  getCurrentWeekPeriod, 
  getPreviousWeekPeriod, 
  getNextWeekPeriod, 
  formatWeekPeriod,
  isCurrentWeek,
  getWeekStartDate,
  getWeekEndDate
} from '@/lib/week-utils';
import { PeriodMetrics } from '@/lib/types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  Users,
  Target,
  CheckCircle
} from 'lucide-react';

export type PeriodType = 'week' | 'month' | 'year';

export interface PeriodSelection {
  type: PeriodType;
  year: number;
  month?: number;
  weekISO?: number;
}

interface PeriodFilterProps {
  selectedPeriod: PeriodSelection;
  onPeriodChange: (period: PeriodSelection) => void;
  metrics: PeriodMetrics;
}

export function PeriodFilter({ selectedPeriod, onPeriodChange, metrics }: PeriodFilterProps) {
  const [viewMode, setViewMode] = useState<'quick' | 'custom'>('quick');

  const currentWeek = getCurrentWeekPeriod();
  const isCurrentPeriod = selectedPeriod.type === 'week' && 
    isCurrentWeek(selectedPeriod.year, selectedPeriod.weekISO || 0);

  const handlePreviousPeriod = () => {
    if (selectedPeriod.type === 'week' && selectedPeriod.weekISO) {
      const prev = getPreviousWeekPeriod(selectedPeriod.year, selectedPeriod.weekISO);
      onPeriodChange({
        type: 'week',
        year: prev.year,
        month: prev.month,
        weekISO: prev.weekISO
      });
    } else if (selectedPeriod.type === 'month' && selectedPeriod.month) {
      const prevMonth = selectedPeriod.month === 1 ? 12 : selectedPeriod.month - 1;
      const prevYear = selectedPeriod.month === 1 ? selectedPeriod.year - 1 : selectedPeriod.year;
      onPeriodChange({
        type: 'month',
        year: prevYear,
        month: prevMonth
      });
    } else if (selectedPeriod.type === 'year') {
      onPeriodChange({
        type: 'year',
        year: selectedPeriod.year - 1
      });
    }
  };

  const handleNextPeriod = () => {
    if (selectedPeriod.type === 'week' && selectedPeriod.weekISO) {
      const next = getNextWeekPeriod(selectedPeriod.year, selectedPeriod.weekISO);
      onPeriodChange({
        type: 'week',
        year: next.year,
        month: next.month,
        weekISO: next.weekISO
      });
    } else if (selectedPeriod.type === 'month' && selectedPeriod.month) {
      const nextMonth = selectedPeriod.month === 12 ? 1 : selectedPeriod.month + 1;
      const nextYear = selectedPeriod.month === 12 ? selectedPeriod.year + 1 : selectedPeriod.year;
      onPeriodChange({
        type: 'month',
        year: nextYear,
        month: nextMonth
      });
    } else if (selectedPeriod.type === 'year') {
      onPeriodChange({
        type: 'year',
        year: selectedPeriod.year + 1
      });
    }
  };

  const handleCurrentWeek = () => {
    const current = getCurrentWeekPeriod();
    onPeriodChange({
      type: 'week',
      year: current.year,
      month: current.month,
      weekISO: current.weekISO
    });
  };

  const handlePreviousWeek = () => {
    const current = getCurrentWeekPeriod();
    const prev = getPreviousWeekPeriod(current.year, current.weekISO);
    onPeriodChange({
      type: 'week',
      year: prev.year,
      month: prev.month,
      weekISO: prev.weekISO
    });
  };

  const getPeriodLabel = () => {
    if (selectedPeriod.type === 'week' && selectedPeriod.weekISO) {
      return formatWeekPeriod(selectedPeriod.year, selectedPeriod.weekISO);
    } else if (selectedPeriod.type === 'month' && selectedPeriod.month) {
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      return `${monthNames[selectedPeriod.month - 1]} ${selectedPeriod.year}`;
    } else if (selectedPeriod.type === 'year') {
      return `Ano ${selectedPeriod.year}`;
    }
    return '';
  };

  const getPeriodDates = () => {
    if (selectedPeriod.type === 'week' && selectedPeriod.weekISO) {
      const startDate = getWeekStartDate(selectedPeriod.year, selectedPeriod.weekISO);
      const endDate = getWeekEndDate(selectedPeriod.year, selectedPeriod.weekISO);
      return `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`;
    }
    return '';
  };

  return (
    <div className="space-y-4">
      {/* Filtros Rápidos */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Navegação de Período */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPeriod}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium text-sm lg:text-base">{getPeriodLabel()}</p>
                  {selectedPeriod.type === 'week' && (
                    <p className="text-xs text-muted-foreground">{getPeriodDates()}</p>
                  )}
                </div>
                {isCurrentPeriod && (
                  <Badge variant="secondary" className="text-xs">Atual</Badge>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPeriod}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Filtros Rápidos */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={isCurrentPeriod ? "default" : "outline"}
                size="sm"
                onClick={handleCurrentWeek}
              >
                Semana Atual
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousWeek}
              >
                Semana Anterior
              </Button>

              <Select
                value={selectedPeriod.type}
                onValueChange={(value: PeriodType) => {
                  if (value === 'month') {
                    onPeriodChange({
                      type: 'month',
                      year: selectedPeriod.year,
                      month: selectedPeriod.month || new Date().getMonth() + 1
                    });
                  } else if (value === 'year') {
                    onPeriodChange({
                      type: 'year',
                      year: selectedPeriod.year
                    });
                  } else {
                    handleCurrentWeek();
                  }
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="year">Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas do Período */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-xl lg:text-2xl font-bold">{metrics.totalLeads}</div>
                <p className="text-xs text-muted-foreground">Total de Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-xl lg:text-2xl font-bold">{metrics.leadsInFollowUp}</div>
                <p className="text-xs text-muted-foreground">Em Follow-up</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-xl lg:text-2xl font-bold">{metrics.leadsClosed}</div>
                <p className="text-xs text-muted-foreground">Leads Fechados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-xl lg:text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Taxa Conversão</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}