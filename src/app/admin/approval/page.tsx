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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { Check, X, CheckSquare, XSquare } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { type Video } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminApprovalPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const videosRef = collection(firestore, 'videos');
  const pendingVideosQuery = query(videosRef, where('status', '==', 'Pending'));
  const {
    data: pendingVideos,
    loading,
    error,
  } = useCollection(pendingVideosQuery);

  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null);

  const handleUpdateStatus = (
    videoId: string,
    newStatus: 'Approved' | 'Rejected'
  ) => {
    const videoDoc = doc(firestore, 'videos', videoId);
    updateDoc(videoDoc, { status: newStatus })
      .then(() => {
        toast({
          title: `Video ${newStatus}`,
          description: `The video has been successfully ${newStatus.toLowerCase()}.`,
        });
      })
      .catch((e) => {
        const permissionError = new FirestorePermissionError({
          path: videoDoc.path,
          operation: 'update',
          requestResourceData: { status: newStatus },
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Error updating status',
          description: e.message || 'Could not update the video status.',
        });
      });
  };

  const handleSelectVideo = (videoId: string, checked: boolean) => {
    const newSelected = new Set(selectedVideos);
    if (checked) {
      newSelected.add(videoId);
    } else {
      newSelected.delete(videoId);
    }
    setSelectedVideos(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && pendingVideos) {
      setSelectedVideos(new Set(pendingVideos.map(v => v.id)));
    } else {
      setSelectedVideos(new Set());
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedVideos.size === 0) {
      toast({
        variant: 'destructive',
        title: 'No videos selected',
        description: 'Please select videos to perform bulk actions.',
      });
      return;
    }

    setBulkAction(action);
    try {
      const promises = Array.from(selectedVideos).map(videoId =>
        updateDoc(doc(firestore, 'videos', videoId), {
          status: action === 'approve' ? 'Approved' : 'Rejected'
        })
      );

      await Promise.all(promises);

      toast({
        title: `Bulk ${action} completed`,
        description: `${selectedVideos.size} videos have been ${action === 'approve' ? 'approved' : 'rejected'}.`,
      });

      setSelectedVideos(new Set());
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Bulk action failed',
        description: 'Some videos could not be updated. Please try again.',
      });
    } finally {
      setBulkAction(null);
    }
  };

  const renderLoading = () => (
    <TableBody>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="hidden sm:table-cell">
            <Skeleton className="h-16 w-28 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16 rounded-full" />
          </TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          Approval Queue
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Review and approve new video submissions.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Pending Videos</CardTitle>
          <CardDescription>
            {loading
              ? 'Loading...'
              : `${pendingVideos?.length || 0} videos awaiting your review.`}
          </CardDescription>
          {pendingVideos && pendingVideos.length > 0 && (
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectedVideos.size === pendingVideos.length && pendingVideos.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  Select All ({selectedVideos.size} selected)
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('approve')}
                  disabled={selectedVideos.size === 0 || bulkAction === 'approve'}
                  className="flex items-center gap-2"
                >
                  <CheckSquare className="h-4 w-4" />
                  Approve Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('reject')}
                  disabled={selectedVideos.size === 0 || bulkAction === 'reject'}
                  className="flex items-center gap-2"
                >
                  <XSquare className="h-4 w-4" />
                  Reject Selected
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <span className="sr-only">Select</span>
                </TableHead>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead className="hidden md:table-cell">Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            {loading ? (
              renderLoading()
            ) : (
              <TableBody>
                {error && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-destructive">
                      Error: {error.message}
                    </TableCell>
                  </TableRow>
                )}
                {pendingVideos && pendingVideos.length > 0 ? (
                  pendingVideos.map((video) => (
                    <TableRow key={video.id} className="transition-colors hover:bg-muted/50">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedVideos.has(video.id)}
                          onChange={(e) => handleSelectVideo(video.id, e.target.checked)}
                          className="rounded"
                        />
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
                        {formatDistanceToNow(new Date((video as Video).uploadedAt || Date.now()), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{(video as Video).status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateStatus(video.id, 'Approved')}
                            aria-label={`Approve video ${(video as Video).title}`}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleUpdateStatus(video.id, 'Rejected')}
                            aria-label={`Reject video ${(video as Video).title}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No pending videos.
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
