
import { VideoCard } from '@/components/video-card';
import { videos } from '@/lib/data';
import { Flame } from 'lucide-react';

export default function TrendingPage() {
  // Sort videos by views in descending order to simulate "trending"
  const trendingVideos = [...videos].sort((a, b) => {
    const viewsA = parseFloat(a.views) * (a.views.endsWith('M') ? 1000000 : 1000);
    const viewsB = parseFloat(b.views) * (b.views.endsWith('M') ? 1000000 : 1000);
    return viewsB - viewsA;
  });

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <Flame className="w-10 h-10 text-accent" />
        <div>
            <h1 className="text-4xl font-headline font-bold tracking-tight">
                Trending Now
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">
                The most popular videos on PlayNite right now.
            </p>
        </div>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {trendingVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
