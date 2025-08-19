'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { Debt } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DebtsPage() {
  const { user, debts, setDebts, loading, setLoading } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ contact: '', amount: '', note: '', type: 'debt' });
  const [files, setFiles] = useState<File[]>([]);
  const [editing, setEditing] = useState<Debt | null>(null);
  const [existing, setExisting] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchDebts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/debts');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        setDebts(data);
      } catch (e) {
        toast.error('Failed to fetch debts');
      }
      setLoading(false);
    };
    fetchDebts();
  }, [user, setDebts, setLoading]);

  const handleSubmit = async () => {
    const uploaded: string[] = [];
    for (const file of files) {
      const path = `${user?.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('debts').upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from('debts').getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
    }
    const payload = {
      contact: form.contact,
      amount: Number(form.amount),
      note: form.note,
      type: form.type as 'debt' | 'credit',
      attachments: [...existing, ...uploaded],
    };
    const res = await fetch(
      editing ? `/api/debts/${editing.id}` : '/api/debts',
      {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    if (res.ok) {
      if (editing) {
        setDebts(debts.map((d) => (d.id === editing.id ? data : d)));
        toast.success('Debt updated');
      } else {
        setDebts([...debts, data]);
        toast.success('Debt added');
      }
      setDialogOpen(false);
      setForm({ contact: '', amount: '', note: '', type: 'debt' });
      setFiles([]);
      setExisting([]);
      setEditing(null);
    } else {
      toast.error(data.error || 'Failed to save debt');
    }
  };

  const share = (shareId: string) => {
    const url = `${window.location.origin}/debt/${shareId}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied');
  };

  const view = (shareId: string) => {
    window.open(`/debt/${shareId}`, '_blank');
  };

  const openEdit = (d: Debt) => {
    setForm({
      contact: d.contact,
      amount: String(d.amount),
      note: d.note || '',
      type: d.type,
    });
    setExisting(d.attachments || []);
    setFiles([]);
    setEditing(d);
    setDialogOpen(true);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Debts</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setForm({ contact: '', amount: '', note: '', type: 'debt' });
            setFiles([]);
            setExisting([]);
            setDialogOpen(true);
          }}
        >
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {debts.map((d: Debt) => (
          <div
            key={d.id}
            className="border rounded p-3 flex justify-between items-center"
          >
            <div>
              <div className="font-medium">{d.contact}</div>
              <div className="text-sm text-muted-foreground">
                {d.type === 'debt' ? 'You owe' : 'Owed to you'} {d.amount}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEdit(d)}
              >
                Edit
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => view(d.shareId)}
              >
                Detail
              </Button>
              <Button size="sm" onClick={() => share(d.shareId)}>
                Share
              </Button>
            </div>
          </div>
        ))}
        {!loading && debts.length === 0 && (
          <p className="text-sm text-muted-foreground">No debts recorded.</p>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Debt' : 'Add Debt'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <Input
              placeholder="Note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
            <Select
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debt">Hutang</SelectItem>
                <SelectItem value="credit">Piutang</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="pt-4">
            <Button onClick={handleSubmit} className="w-full">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
