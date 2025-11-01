import { VideoCard } from '@/components/video-card';
import { videos } from '@/lib/data';

export default function WatchLaterPage() {
  const watchLaterVideos = videos.slice(0, 5).sort(() => 0.5 - Math.random());

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          Watch Later
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your saved videos for future viewing.
        </p>
      </header>
      
      {watchLaterVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {watchLaterVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold">Your Watch Later List is Empty</h2>
          <p className="text-muted-foreground mt-2">
            Long press on a video to add it here.
          </p>
        </div>
      )}
    </div>
  );
}
