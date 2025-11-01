import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Video } from '@/lib/data';
import { Clock, MoreVertical, PlayCircle } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  variant?: 'default' | 'horizontal';
}

export function VideoCard({ video, variant = 'default' }: VideoCardProps) {
  if (variant === 'horizontal') {
    return (
      <Link href={`/video/${video.id}`} className="group block" data-ai-hint="long press add watch later">
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
          <CardContent className="flex-grow p-3">
            <h3 className="font-semibold leading-tight line-clamp-2">{video.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{video.channel}</p>
            <p className="text-sm text-muted-foreground mt-1">{video.views} &bull; {video.uploadedAt}</p>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/video/${video.id}`} className="group block" data-ai-hint="long press add watch later">
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
        <CardContent className="p-3 flex-grow">
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
            <button className="text-muted-foreground -mr-2 p-2 rounded-full hover:bg-accent/20">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
