'use client';

import { VideoCard } from '@/components/video-card';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, writeBatch, getDocs, query } from 'firebase/firestore';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { History as HistoryIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function HistoryPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const historyCollectionRef = useMemo(
    () => (user ? collection(firestore, 'users', user.uid, 'history') : null),
    [firestore, user]
  );

  const {
    data: history,
    loading,
    error,
  } = useCollection(historyCollectionRef);

  const handleClearHistory = async () => {
    if (!historyCollectionRef) return;
    try {
      const batch = writeBatch(firestore);
      const q = query(historyCollectionRef);
      const snapshot = await getDocs(q);
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      toast({
        title: 'History Cleared',
        description: 'Your viewing history has been successfully cleared.',
      });
    } catch (e: any) {
      // This is a complex operation, so we'll just log a generic error
      // A more specific permission error would be hard to construct here.
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error clearing history',
        description: 'Could not clear your viewing history. Please try again.',
      });
    }
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
             <div key={i} className="space-y-2">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )
    }

    if (error) {
      return <p className="text-destructive">Error loading history: {error.message}</p>
    }

    if (!history || history.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[400px] animate-fade-in">
          <HistoryIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Viewing History</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Videos you watch will appear here.
          </p>
        </div>
      )
    }

    // `history` contains video IDs. We need to fetch video details.
    // For this implementation, we assume `history` contains the full video object.
    // A production app would fetch video details based on IDs.
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {history?.map((video: any, index) => (
          <div key={video.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`}}>
            <VideoCard video={video} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-headline font-bold tracking-tight">
            Viewing History
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Videos you've watched recently.
          </p>
        </div>
        <Button variant="destructive" onClick={handleClearHistory} disabled={!history || history.length === 0}>Clear History</Button>
      </header>
      
      {renderContent()}
    </div>
  );
}
