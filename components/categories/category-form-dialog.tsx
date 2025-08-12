'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Category } from '@/types';

const toCamel = (str: string) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

function keysToCamel<T>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamel(v)) as any;
  }
  if (obj && typeof obj === 'object' && obj.constructor === Object) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[toCamel(key)] = keysToCamel(value);
    }
    return result as T;
  }
  return obj as T;
}

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: 'expense' | 'income';
};

export function CategoryFormDialog({ open, onOpenChange, type = 'expense' }: CategoryFormDialogProps) {
  const { user, categories, setCategories } = useAppStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#000000');
  const [icon, setIcon] = useState('circle');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !name) return;
    setSubmitting(true);
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, name, type, color, icon }),
    });
    if (res.ok) {
      const data = await res.json();
      const newCategory: Category = keysToCamel<Category>(data);
      setCategories([...categories, newCategory]);
      onOpenChange(false);
      setName('');
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Icon</label>
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="icon name" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={submitting || !name}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

