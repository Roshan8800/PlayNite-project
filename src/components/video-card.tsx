
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import type { Video } from '@/lib/data';
import { Clock, MoreVertical, PlayCircle, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';

interface VideoCardProps {
  video: Video;
  variant?: 'default' | 'horizontal';
}

export function VideoCard({ video, variant = 'default' }: VideoCardProps) {
  const { toast } = useToast();

  const handleWatchLater = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: 'Added to Watch Later',
      description: `"${video.title}" has been saved for later.`,
    });
  };

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
            <p className="text-sm text-muted-foreground mt-1">{video.views} &bull; {video.uploadedAt}</p>
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
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Add to Watch Later</span>
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
              <p className="text-sm text-muted-foreground">{video.views} &bull; {video.uploadedAt}</p>
            </div>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="-mr-2 -mt-1 h-8 w-8" onClick={(e) => { e.preventDefault(); e.stopPropagation();}}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleWatchLater}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Add to Watch Later</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </Link>
  );
}
