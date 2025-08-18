'use client';

import { useEffect, useState } from 'react';
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
    const payload = {
      contact: form.contact,
      amount: Number(form.amount),
      note: form.note,
      type: form.type as 'debt' | 'credit',
    };
    const res = await fetch('/api/debts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      setDebts([...debts, data]);
      toast.success('Debt added');
      setDialogOpen(false);
      setForm({ contact: '', amount: '', note: '', type: 'debt' });
    } else {
      toast.error(data.error || 'Failed to save debt');
    }
  };

  const share = (id: string) => {
    const url = `${window.location.origin}/debt/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Debts</h1>
        <Button onClick={() => setDialogOpen(true)}>Add</Button>
      </div>
      <div className="space-y-2">
        {debts.map((d: Debt) => (
          <div key={d.id} className="border rounded p-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{d.contact}</div>
              <div className="text-sm text-muted-foreground">
                {d.type === 'debt' ? 'You owe' : 'Owed to you'} {d.amount}
              </div>
            </div>
            <Button variant="secondary" onClick={() => share(d.id)}>
              Share
            </Button>
          </div>
        ))}
        {!loading && debts.length === 0 && (
          <p className="text-sm text-muted-foreground">No debts recorded.</p>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Debt</DialogTitle>
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
