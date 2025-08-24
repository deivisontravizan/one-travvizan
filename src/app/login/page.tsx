"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">One Travizan</h1>
          </CardTitle>
          <p className="text-muted-foreground">Sistema completo para gestão de estúdios de tatuagem</p>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
            }}
            theme="light"
          />
        </CardContent>
      </Card>
    </div>
  );
}