"use client";

import React, { useState } from 'react';
import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Tattoo Studio Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gerencie seu estúdio de tatuagem de forma profissional
          </p>
        </div>

        {mode === 'login' ? (
          <LoginForm onToggleMode={toggleMode} />
        ) : (
          <SignupForm onToggleMode={toggleMode} />
        )}

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2024 Tattoo Studio Manager. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}