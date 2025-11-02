'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Search, CheckSquare, Square } from 'lucide-react';
import Image from 'next/image';
import { useCollection, useFirestore } from '@/firebase';
import { collection, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { useState } from 'react';
import { type Video } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminVideosPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const videosRef = collection(firestore, 'videos');
  const { data: videos, loading, error } = useCollection(videosRef);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');

  const handleDelete = (videoId: string, videoTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${videoTitle}"?`)) return;
    const docRef = doc(firestore, 'videos', videoId);
    deleteDoc(docRef)
      .then(() => {
        toast({ title: 'Video Deleted', description: `"${videoTitle}" has been removed.` });
      })
      .catch((e) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Error', description: e.message });
      });
  };

  const handleSelectVideo = (videoId: string) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
    } else {
      newSelected.add(videoId);
    }
    setSelectedVideos(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedVideos.size === videos?.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(videos?.map(v => v.id) || []));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVideos.size === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedVideos.size} video(s)?`)) return;

    try {
      const batch = writeBatch(firestore);
      selectedVideos.forEach(videoId => {
        const docRef = doc(firestore, 'videos', videoId);
        batch.delete(docRef);
      });
      await batch.commit();

      toast({
        title: 'Videos Deleted',
        description: `${selectedVideos.size} video(s) have been removed.`
      });
      setSelectedVideos(new Set());
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete videos. Please try again.'
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedVideos.size === 0) return;

    try {
      const batch = writeBatch(firestore);
      selectedVideos.forEach(videoId => {
        const docRef = doc(firestore, 'videos', videoId);
        if (action === 'approve') {
          batch.update(docRef, { status: 'Approved' });
        } else if (action === 'reject') {
          batch.update(docRef, { status: 'Rejected' });
        }
      });
      await batch.commit();

      toast({
        title: 'Bulk Action Completed',
        description: `${selectedVideos.size} video(s) have been ${action}d.`
      });
      setSelectedVideos(new Set());
    } catch (error) {
      console.error('Bulk action error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to perform bulk action. Please try again.'
      });
    }
  };

  const renderLoading = () => (
    <TableBody>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="hidden sm:table-cell">
            <Skeleton className="h-16 w-28 rounded-md" />
          </TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-headline font-bold tracking-tight">
            Video Management
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Manage your video library.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Upload Video
          </Button>
          {selectedVideos.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedVideos.size} selected
              </span>
              <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                Delete Selected
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('approve')}>
                Approve Selected
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('reject')}>
                Reject Selected
              </Button>
            </div>
          )}
        </div>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Videos</CardTitle>
              <CardDescription>
                A list of all videos in your app.
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search videos..." className="pl-8 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-6 w-6 p-0"
                  >
                    {selectedVideos.size === videos?.length && videos?.length > 0 ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead className="hidden md:table-cell">Views</TableHead>
                <TableHead className="hidden md:table-cell">Uploaded</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            {loading ? renderLoading() : (
              <TableBody>
                {error && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-destructive">
                      Error: {error.message}
                    </TableCell>
                  </TableRow>
                )}
                {videos && videos.length > 0 ? (
                  videos.map((video) => (
                    <TableRow key={video.id} className="transition-colors hover:bg-muted/50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSelectVideo(video.id)}
                          className="h-6 w-6 p-0"
                        >
                          {selectedVideos.has(video.id) ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Image
                          alt={(video as Video).title}
                          className="aspect-video rounded-md object-cover"
                          height="64"
                          src={(video as Video).thumbnailUrl}
                          width="114"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {(video as Video).title}
                      </TableCell>
                      <TableCell>{(video as Video).channel}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {(video as Video).views.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDistanceToNow(new Date((video as Video).uploadedAt || Date.now()), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(video.id, (video as Video).title)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                   <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No videos found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            )}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
