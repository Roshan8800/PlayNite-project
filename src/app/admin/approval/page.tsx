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
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { Check, X } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { type Video } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

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

  const handleUpdateStatus = async (
    videoId: string,
    newStatus: 'Approved' | 'Rejected'
  ) => {
    try {
      const videoDoc = doc(firestore, 'videos', videoId);
      await updateDoc(videoDoc, { status: newStatus });
      toast({
        title: `Video ${newStatus}`,
        description: `The video has been successfully ${newStatus.toLowerCase()}.`,
      });
    } catch (e: any) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error updating status',
        description: e.message || 'Could not update the video status.',
      });
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
    <div className="space-y-8">
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
                    <TableCell colSpan={6} className="text-center text-destructive">
                      Error: {error.message}
                    </TableCell>
                  </TableRow>
                )}
                {pendingVideos && pendingVideos.length > 0 ? (
                  pendingVideos.map((video) => (
                    <TableRow key={video.id}>
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
                        {formatDistanceToNow(new Date((video as Video).uploadedAt), {
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
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleUpdateStatus(video.id, 'Rejected')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
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
