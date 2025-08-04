"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMounted } from '@/hooks/use-mounted';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        disabled
      >
        <Moon className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-8 w-8 p-0"
      title={`Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}