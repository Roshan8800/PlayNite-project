'use client';

import { useSearchParams } from 'next/navigation';
import { VideoCard } from '@/components/video-card';
import { videos } from '@/lib/data';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(query.toLowerCase()) ||
    video.channel.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          Search Results
        </h1>
        {query ? (
          <p className="mt-2 text-lg text-muted-foreground">
            Showing results for &quot;{query}&quot;
          </p>
        ) : (
           <p className="mt-2 text-lg text-muted-foreground">
            Please enter a search term to see results.
          </p>
        )}
      </header>
      
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold">No Results Found</h2>
          <p className="text-muted-foreground mt-2">
            We couldn&apos;t find any videos matching your search. Try another term.
          </p>
        </div>
      )}
    </div>
  );
}
