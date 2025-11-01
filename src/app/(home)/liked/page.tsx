
import { VideoCard } from '@/components/video-card';
import { videos } from '@/lib/data';
import { Heart } from 'lucide-react';

export default function LikedVideosPage() {
  const likedVideos = videos.slice(3, 8).sort(() => 0.5 - Math.random());

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          Liked Videos
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Videos you've given a thumbs up.
        </p>
      </header>
      
      {likedVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {likedVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[400px]">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Liked Videos</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            You haven't liked any videos yet.
          </p>
        </div>
      )}
    </div>
  );
}
