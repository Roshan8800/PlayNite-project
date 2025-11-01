import { VideoCard } from '@/components/video-card';
import { videos } from '@/lib/data';
import { WifiOff } from 'lucide-react';

export default function DownloadsPage() {
  const downloadedVideos = videos.slice(0, 3);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          My Downloads
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Videos available for offline viewing.
        </p>
      </header>
      
      {downloadedVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {downloadedVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
         <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[400px]">
          <WifiOff className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Videos Downloaded</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            You can download videos from the video page to watch them offline.
          </p>
        </div>
      )}
    </div>
  );
}
