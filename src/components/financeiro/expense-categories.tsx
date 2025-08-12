"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ExpenseCategory } from '@/lib/types';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  Loader2
} from 'lucide-react';

interface ExpenseCategoriesProps {
  categories: ExpenseCategory[];
  onCreateCategory: (category: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateCategory: (id: string, updates: Partial<ExpenseCategory>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

interface CategoryFormProps {
  category?: ExpenseCategory;
  onSave: (categoryData: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    setSaving(true);

    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        tattooerId: '1' // TODO: pegar do contexto
      });
      
      toast.success(category ? 'Categoria atualizada!' : 'Categoria criada!');
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao salvar categoria');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome da Categoria *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Material, Aluguel, Marketing..."
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição (Opcional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descrição da categoria..."
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {category ? 'Atualizar' : 'Criar'} Categoria
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function ExpenseCategories({ 
  categories, 
  onCreateCategory, 
  onUpdateCategory, 
  onDeleteCategory 
}: ExpenseCategoriesProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreateCategory = async (categoryData: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await onCreateCategory(categoryData);
      setIsCreateOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateCategory = async (categoryData: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingCategory) return;
    
    try {
      await onUpdateCategory(editingCategory.id, categoryData);
      setEditingCategory(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteCategory(id);
      toast.success('Categoria excluída!');
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Categorias de Despesas
          </CardTitle>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Categoria</DialogTitle>
              </DialogHeader>
              <CategoryForm
                onSave={handleCreateCategory}
                onCancel={() => setIsCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {categories.length > 0 ? (
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{category.name}</Badge>
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Dialog 
                    open={editingCategory?.id === category.id} 
                    onOpenChange={(open) => setEditingCategory(open ? category : null)}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Categoria</DialogTitle>
                      </DialogHeader>
                      <CategoryForm
                        category={category}
                        onSave={handleUpdateCategory}
                        onCancel={() => setEditingCategory(null)}
                      />
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={deletingId === category.id}
                  >
                    {deletingId === category.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">Nenhuma categoria criada</h3>
            <p className="text-sm mb-4">
              Crie categorias para organizar suas despesas
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Primeira Categoria
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}