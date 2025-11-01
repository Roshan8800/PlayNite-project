'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import type { Video } from '@/lib/types';
import { Clock, MoreVertical, PlayCircle, ThumbsUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
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
      const docRef = doc(
        firestore,
        'users',
        user.uid,
        collectionName,
        video.id
      );
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
    handleInteraction(
      e,
      'watchLater',
      'Added to Watch Later',
      `"${video.title}" has been saved for later.`
    );
  };

  const handleLike = (e: React.MouseEvent) => {
    handleInteraction(e, 'likes', 'Video Liked', `You liked "${video.title}".`);
  };

  const uploadedAtDistance = formatDistanceToNow(new Date(video.uploadedAt), {
    addSuffix: true,
  });

  const viewsFormatted =
    video.views > 1000000
      ? `${(video.views / 1000000).toFixed(1)}M`
      : video.views > 1000
      ? `${(video.views / 1000).toFixed(0)}K`
      : video.views;

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
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
              <PlayCircle className="h-10 w-10 text-white/80" />
            </div>
          </div>
          <div className="flex flex-grow flex-col p-3">
            <h3 className="line-clamp-2 font-semibold leading-tight">
              {video.title}
            </h3>
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {video.channel}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {viewsFormatted} views &bull; {uploadedAtDistance}
            </p>
          </div>
          <div className="p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical className="h-4 w-4" />
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
      <Card className="flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-video">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={video.thumbnailHint}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
            <PlayCircle className="h-12 w-12 text-white/80" />
          </div>
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
            <Clock className="h-3 w-3" />
            <span>{video.duration}</span>
          </div>
        </div>
        <div className="flex flex-grow flex-col p-3">
          <div className="flex items-start gap-3">
            <Avatar className="mt-1 h-9 w-9">
              <AvatarImage src={video.channelAvatarUrl} alt={video.channel} />
              <AvatarFallback>{video.channel.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-accent">
                {video.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {video.channel}
              </p>
              <p className="text-sm text-muted-foreground">
                {viewsFormatted} views &bull; {uploadedAtDistance}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mr-2 -mt-1 h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical className="h-4 w-4" />
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
