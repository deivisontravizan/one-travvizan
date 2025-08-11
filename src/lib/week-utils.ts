export function getISOWeek(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

export function getISOWeekYear(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  return target.getFullYear();
}

export function getWeekStartDate(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4);
  const jan4Day = (jan4.getDay() + 6) % 7;
  const weekStart = new Date(jan4);
  weekStart.setDate(jan4.getDate() - jan4Day + (week - 1) * 7);
  return weekStart;
}

export function getWeekEndDate(year: number, week: number): Date {
  const startDate = getWeekStartDate(year, week);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  return endDate;
}

export function getCurrentWeekPeriod(): { year: number; month: number; weekISO: number } {
  const now = new Date();
  return {
    year: getISOWeekYear(now),
    month: now.getMonth() + 1,
    weekISO: getISOWeek(now)
  };
}

export function getPreviousWeekPeriod(year: number, week: number): { year: number; month: number; weekISO: number } {
  if (week === 1) {
    const prevYear = year - 1;
    const lastWeekOfPrevYear = getISOWeek(new Date(prevYear, 11, 31));
    return {
      year: prevYear,
      month: 12,
      weekISO: lastWeekOfPrevYear
    };
  }
  
  const prevWeek = week - 1;
  const startDate = getWeekStartDate(year, prevWeek);
  return {
    year,
    month: startDate.getMonth() + 1,
    weekISO: prevWeek
  };
}

export function getNextWeekPeriod(year: number, week: number): { year: number; month: number; weekISO: number } {
  const nextWeek = week + 1;
  const startDate = getWeekStartDate(year, nextWeek);
  const nextYear = startDate.getFullYear();
  
  if (nextYear > year) {
    return {
      year: nextYear,
      month: 1,
      weekISO: 1
    };
  }
  
  return {
    year,
    month: startDate.getMonth() + 1,
    weekISO: nextWeek
  };
}

export function formatWeekPeriod(year: number, week: number): string {
  const startDate = getWeekStartDate(year, week);
  const endDate = getWeekEndDate(year, week);
  
  return `Semana ${week}/${year} (${startDate.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit' 
  })} - ${endDate.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit' 
  })})`;
}

export function isCurrentWeek(year: number, week: number): boolean {
  const current = getCurrentWeekPeriod();
  return current.year === year && current.weekISO === week;
}