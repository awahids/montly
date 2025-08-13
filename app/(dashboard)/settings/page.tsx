'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { profileSchema } from '@/lib/validation';
import { Category } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CategoryFormDialog, CategoryFormValues } from '@/components/settings/category-form-dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';

const profileFormSchema = profileSchema;
type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [search, setSearch] = useState('');
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: '', defaultCurrency: 'IDR' },
  });

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        profileForm.reset({
          name: data.name,
          defaultCurrency: data.defaultCurrency || 'IDR',
        });
        setEmail(data.email);
      });
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories);
  }, [profileForm]);

  async function onProfileSubmit(values: ProfileFormValues) {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const { error } = await res.json();
      toast({ description: error || 'Failed to update profile', variant: 'destructive' });
      return;
    }
    toast({ description: 'Profile updated' });
    profileForm.reset(values);
  }

  async function handleSaveCategory(values: CategoryFormValues) {
    if (editingCategory) {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        const updated = await res.json();
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        toast({ description: 'Category saved' });
      } else {
        const { error } = await res.json();
        toast({ description: error || 'Failed to save', variant: 'destructive' });
      }
    } else {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        const created = await res.json();
        setCategories((prev) => [...prev, created]);
        toast({ description: 'Category saved' });
      } else {
        const { error } = await res.json();
        toast({ description: error || 'Failed to save', variant: 'destructive' });
      }
    }
  }

  async function handleDeleteCategory(id: string) {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast({ description: 'Category deleted' });
    } else {
      const { error } = await res.json();
      toast({ description: error || 'Failed to delete', variant: 'destructive' });
    }
    setDeleteId(null);
  }

  const filtered = categories.filter((c) => {
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your profile and categories.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile & Preferences</CardTitle>
          </CardHeader>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel>Email</FormLabel>
                  <Input value={email} readOnly disabled />
                </div>
                <FormField
                  control={profileForm.control}
                  name="defaultCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default currency</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IDR">IDR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={!profileForm.formState.isDirty}>
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Categories</CardTitle>
            <Button
              onClick={() => {
                setEditingCategory(undefined);
                setCategoryDialogOpen(true);
              }}
            >
              Add Category
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <ToggleGroup type="single" value={typeFilter} onValueChange={(v) => setTypeFilter((v as any) || 'all')}>
                <ToggleGroupItem value="all">All</ToggleGroupItem>
                <ToggleGroupItem value="expense">Expense</ToggleGroupItem>
                <ToggleGroupItem value="income">Income</ToggleGroupItem>
              </ToggleGroup>
              <Input
                placeholder="Search category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ml-auto w-full sm:w-64"
              />
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                No categories found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="hidden md:table">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead className="w-24"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.icon}</TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell className="capitalize">{c.type}</TableCell>
                        <TableCell>
                          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: c.color }} />
                        </TableCell>
                        <TableCell className="space-x-2 text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingCategory(c);
                              setCategoryDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeleteId(c.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="space-y-2 md:hidden">
                  {filtered.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <span>{c.icon}</span>
                        <div>
                          <p className="font-medium leading-none">{c.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{c.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingCategory(c);
                            setCategoryDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteId(c.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CategoryFormDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        initialData={editingCategory}
        onSubmit={handleSaveCategory}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDeleteCategory(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
