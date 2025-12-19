'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const albumSchema = z.object({
  name: z.string().min(1, 'Album name is required'),
  description: z.string().optional(),
});

type AlbumFormValues = z.infer<typeof albumSchema>;

interface Album {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  _count?: {
    galleries: number;
  };
}

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const form = useForm<AlbumFormValues>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    setIsFetching(true);
    try {
      const response = await fetch('/api/admin/website-landing/gallery/albums');
      if (response.ok) {
        const data = await response.json();
        setAlbums(data);
      }
    } catch (error) {
      console.error('Failed to fetch albums:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (values: AlbumFormValues) => {
    setIsLoading(true);
    try {
      const url = editingId ? `/api/admin/website-landing/gallery/albums/${editingId}` : '/api/admin/website-landing/gallery/albums';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        await fetchAlbums();
        setIsOpen(false);
        form.reset();
        setEditingId(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save album');
      }
    } catch (error) {
      console.error('Failed to save album:', error);
      alert('Failed to save album');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (album: Album) => {
    setEditingId(album.id);
    form.reset({
      name: album.name,
      description: album.description || '',
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    setConfirmDelete(id);
  };

  const confirmDeleteAlbum = async () => {
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/admin/website-landing/gallery/albums/${confirmDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAlbums();
        setConfirmDelete(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete album');
        setConfirmDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete album:', error);
      alert('Failed to delete album');
      setConfirmDelete(null);
    }
  };

  const handleOpenDialog = () => {
    setEditingId(null);
    form.reset({
      name: '',
      description: '',
    });
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gallery Albums</h2>
          <p className="text-muted-foreground">Manage photo album categories</p>
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Album
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Album Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-20">Photos</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Loading albums...
                </TableCell>
              </TableRow>
            ) : albums.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  No albums yet. Create one to get started!
                </TableCell>
              </TableRow>
            ) : (
              albums.map((album) => (
                <TableRow key={album.id}>
                  <TableCell className="font-medium">{album.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {album.description || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {album._count?.galleries || 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(album)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(album.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Album' : 'Create New Album'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the album details below.'
                : 'Create a new album to organize photos.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Album Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., School Events 2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Album description or details" {...field} />
                    </FormControl>
                    <FormDescription>
                      Brief description to help identify the album
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : editingId ? 'Update Album' : 'Create Album'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Album"
        description="Are you sure you want to delete this album? This action cannot be undone."
        confirmText="Delete Album"
        onConfirm={confirmDeleteAlbum}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
