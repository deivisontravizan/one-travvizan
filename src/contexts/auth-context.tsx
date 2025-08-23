"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signUp: (email: string, password: string, userData: { name: string; role?: string; plan?: string }) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar perfil do usuário da tabela tattooers
  const loadUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('tattooers')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Erro ao carregar perfil:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        plan: data.plan,
        avatar: data.avatar,
        studio: data.studio
      };
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
      return null;
    }
  };

  // Criar perfil na tabela tattooers após signup
  const createUserProfile = async (supabaseUser: SupabaseUser, userData: { name: string; role?: string; plan?: string }): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('tattooers')
        .insert({
          id: supabaseUser.id,
          name: userData.name,
          email: supabaseUser.email!,
          role: userData.role || 'tatuador',
          plan: userData.plan || 'solo'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar perfil:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        plan: data.plan,
        avatar: data.avatar,
        studio: data.studio
      };
    } catch (error) {
      console.error('Erro ao criar perfil do usuário:', error);
      return null;
    }
  };

  // Monitorar mudanças de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      setSession(session);
      setSupabaseUser(session?.user || null);

      if (session?.user) {
        // Usuário logado - carregar perfil
        const userProfile = await loadUserProfile(session.user);
        setUser(userProfile);
      } else {
        // Usuário deslogado
        setUser(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Verificar sessão inicial
  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao obter sessão:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setSession(session);
        setSupabaseUser(session.user);
        const userProfile = await loadUserProfile(session.user);
        setUser(userProfile);
      }
      
      setLoading(false);
    };

    getInitialSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Erro no login:', error);
        return { error };
      }

      return {};
    } catch (error) {
      console.error('Erro no login:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: { name: string; role?: string; plan?: string }) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'tatuador',
            plan: userData.plan || 'solo'
          }
        }
      });

      if (error) {
        console.error('Erro no cadastro:', error);
        return { error };
      }

      // Se o usuário foi criado, criar perfil na tabela tattooers
      if (data.user) {
        await createUserProfile(data.user, userData);
      }

      return {};
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no logout:', error);
        throw error;
      }

      setUser(null);
      setSupabaseUser(null);
      setSession(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tattooers')
        .update({
          name: updates.name,
          role: updates.role,
          plan: updates.plan,
          avatar: updates.avatar,
          studio: updates.studio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        throw error;
      }

      // Atualizar estado local
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
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
      updateProfile
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