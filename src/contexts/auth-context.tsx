"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signUp: (email: string, password: string, userData: { name: string; studio?: string }) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: AuthError }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar ou criar perfil do usuário na tabela tattooers
  const fetchOrCreateUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      // Primeiro, tentar buscar o perfil existente
      const { data: existingProfile, error: fetchError } = await supabase
        .from('tattooers')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (existingProfile && !fetchError) {
        return {
          id: existingProfile.id,
          name: existingProfile.name,
          email: existingProfile.email,
          role: existingProfile.role,
          plan: existingProfile.plan,
          avatar: existingProfile.avatar,
          studio: existingProfile.studio
        };
      }

      // Se não existe, criar novo perfil
      const { data: newProfile, error: createError } = await supabase
        .from('tattooers')
        .insert({
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
          email: supabaseUser.email || '',
          role: 'tatuador',
          plan: 'solo',
          studio: supabaseUser.user_metadata?.studio || null
        })
        .select()
        .single();

      if (createError) {
        console.error('Erro ao criar perfil:', createError);
        return null;
      }

      return {
        id: newProfile.id,
        name: newProfile.name,
        email: newProfile.email,
        role: newProfile.role,
        plan: newProfile.plan,
        avatar: newProfile.avatar,
        studio: newProfile.studio
      };
    } catch (error) {
      console.error('Erro ao buscar/criar perfil:', error);
      return null;
    }
  };

  // Monitorar mudanças na autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      setSession(session);
      setSupabaseUser(session?.user || null);

      if (session?.user) {
        // Usuário logado - buscar perfil
        const userProfile = await fetchOrCreateUserProfile(session.user);
        setUser(userProfile);
      } else {
        // Usuário deslogado
        setUser(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Função de login
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Erro no login:', error);
        toast.error('Erro ao fazer login: ' + error.message);
        return { error };
      }

      toast.success('Login realizado com sucesso!');
      return { error: undefined };
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      toast.error('Erro inesperado ao fazer login');
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Função de cadastro
  const signUp = async (email: string, password: string, userData: { name: string; studio?: string }) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            studio: userData.studio
          }
        }
      });

      if (error) {
        console.error('Erro no cadastro:', error);
        toast.error('Erro ao criar conta: ' + error.message);
        return { error };
      }

      if (data.user && !data.session) {
        toast.success('Conta criada! Verifique seu email para confirmar.');
      } else {
        toast.success('Conta criada com sucesso!');
      }

      return { error: undefined };
    } catch (error) {
      console.error('Erro inesperado no cadastro:', error);
      toast.error('Erro inesperado ao criar conta');
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no logout:', error);
        toast.error('Erro ao fazer logout');
      } else {
        toast.success('Logout realizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro inesperado no logout:', error);
      toast.error('Erro inesperado ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar perfil
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tattooers')
        .update({
          name: updates.name,
          avatar: updates.avatar,
          studio: updates.studio,
          plan: updates.plan,
          role: updates.role
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast.error('Erro ao atualizar perfil');
        return;
      }

      // Atualizar estado local
      setUser({
        ...user,
        ...updates
      });

      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro inesperado ao atualizar perfil:', error);
      toast.error('Erro inesperado ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  // Reset de senha
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error('Erro ao resetar senha:', error);
        toast.error('Erro ao enviar email de recuperação');
        return { error };
      }

      toast.success('Email de recuperação enviado!');
      return { error: undefined };
    } catch (error) {
      console.error('Erro inesperado ao resetar senha:', error);
      toast.error('Erro inesperado ao resetar senha');
      return { error: error as AuthError };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}