import { VideoCard } from '@/components/video-card';
import { videos } from '@/lib/data';
import { Button } from '@/components/ui/button';

export default function HistoryPage() {
  const historyVideos = [...videos].sort(() => 0.5 - Math.random());

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-headline font-bold tracking-tight">
            Viewing History
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Videos you've watched recently.
          </p>
        </div>
        <Button variant="destructive">Clear History</Button>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {historyVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
