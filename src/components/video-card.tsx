
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import type { Video } from '@/lib/types';
import { Clock, MoreVertical, PlayCircle, PlusCircle, ThumbsUp, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';


interface VideoCardProps {
  video: Video;
  variant?: 'default' | 'horizontal';
}

export function VideoCard({ video, variant = 'default' }: VideoCardProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const handleInteraction = async (
    e: React.MouseEvent,
    collectionName: string,
    successTitle: string,
    successDescription: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You need to be logged in to perform this action.',
      });
      return;
    }

    try {
      const docRef = doc(firestore, 'users', user.uid, collectionName, video.id);
      await setDoc(docRef, { ...video, addedAt: new Date().toISOString() });
      toast({
        title: successTitle,
        description: successDescription,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: `Could not add "${video.title}" to your list.`,
      });
    }
  };

  const handleWatchLater = (e: React.MouseEvent) => {
    handleInteraction(e, 'watchLater', 'Added to Watch Later', `"${video.title}" has been saved for later.`);
  };

  const handleLike = (e: React.MouseEvent) => {
    handleInteraction(e, 'likes', 'Video Liked', `You liked "${video.title}".`);
  };

  const uploadedAtDistance = formatDistanceToNow(new Date(video.uploadedAt), { addSuffix: true });


  if (variant === 'horizontal') {
    return (
      <Link href={`/video/${video.id}`} className="group block">
        <Card className="flex h-full overflow-hidden transition-all duration-200 hover:bg-card/80 hover:shadow-md">
          <div className="relative aspect-video w-40 flex-shrink-0">
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover"
              data-ai-hint={video.thumbnailHint}
            />
             <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle className="h-10 w-10 text-white/80" />
            </div>
          </div>
          <div className="flex-grow p-3 flex flex-col">
            <h3 className="font-semibold leading-tight line-clamp-2">{video.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{video.channel}</p>
            <p className="text-sm text-muted-foreground mt-1">{video.views} &bull; {uploadedAtDistance}</p>
          </div>
          <div className="p-2">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.preventDefault(); e.stopPropagation();}}>
                    <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleWatchLater}>
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Add to Watch Later</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLike}>
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  <span>Like Video</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/video/${video.id}`} className="group block">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-video">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={video.thumbnailHint}
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle className="h-12 w-12 text-white/80" />
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{video.duration}</span>
          </div>
        </div>
        <div className="p-3 flex-grow flex flex-col">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 mt-1">
              <AvatarImage src={video.channelAvatarUrl} alt={video.channel} />
              <AvatarFallback>{video.channel.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-accent">
                {video.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{video.channel}</p>
              <p className="text-sm text-muted-foreground">{video.views} &bull; {uploadedAtDistance}</p>
            </div>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="-mr-2 -mt-1 h-8 w-8" onClick={(e) => { e.preventDefault(); e.stopPropagation();}}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleWatchLater}>
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Add to Watch Later</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLike}>
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  <span>Like Video</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </Link>
  );
}
