'use client';

import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Link from 'next/link';
import { useCollection, useUser } from '@/firebase';
import { collection, query, where, limit, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Video, Category } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useCallback, memo } from 'react';
import { fetchVideos } from '@/lib/videos';
import { contentRecommendationEngine } from '@/ai/flows/content-recommendation-engine';
import { useInView } from 'react-intersection-observer';
import dynamic from 'next/dynamic';

// Dynamic imports for performance with React.memo for better performance
const CategoryCard = dynamic(() => import('@/components/category-card').then(mod => ({ default: mod.CategoryCard })), {
  loading: () => <Skeleton className="h-32 w-full md:h-40" />,
  ssr: false,
});
const VideoCard = dynamic(() => import('@/components/video-card').then(mod => ({ default: mod.VideoCard })), {
  loading: () => <Skeleton className="h-40 w-full" />,
  ssr: false,
});

// Memoized video grid component for better performance
const MemoizedVideoGrid = memo(({ videos, loading }: { videos: Video[], loading: boolean }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
    {loading
      ? Array.from({ length: 8 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="space-y-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))
      : videos?.map((video: Video, index) => (
          <div key={video.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
            <VideoCard video={video} />
          </div>
        ))}
  </div>
));
MemoizedVideoGrid.displayName = 'MemoizedVideoGrid';

export default function HomePage() {
  const firestore = useFirestore();
  const { user } = useUser();

  // Check parental controls and age restrictions
  const isRestrictedContent = user?.parentalControlsEnabled && user?.ageRestriction && user.ageRestriction < 18;

  // Fetch data from Firestore
  const videosRef = collection(firestore, 'videos');
  const categoriesRef = collection(firestore, 'categories');

  // Filter videos based on user permissions and parental controls
  let videosQuery = query(videosRef, limit(20));

  if (isRestrictedContent) {
    // Apply parental controls - only show approved content suitable for user's age
    videosQuery = query(
      videosRef,
      where('status', '==', 'Approved'),
      where('ageRestriction', '<=', user.ageRestriction || 18),
      limit(20)
    );
  } else {
    // For now, show all videos since imported videos don't have status field
    videosQuery = query(videosRef, limit(20));
  }

  const approvedVideosQuery = videosQuery;

  const { data: allVideos, loading: videosLoading } =
    useCollection(approvedVideosQuery);
  const { data: categories, loading: categoriesLoading } =
    useCollection(categoriesRef);

  const recommendedVideos = [...(allVideos || [])].sort(() => 0.5 - Math.random());
  const newReleases = [...(allVideos || [])].sort(
    (a, b) => (b.views || 0) - (a.views || 0)
  );
  const featuredVideos = (allVideos || []).slice(0, 5);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<Video[]>([]);
  const [aiRecommendationsLoading, setAiRecommendationsLoading] = useState(false);

  // Type assertion for imported videos
  const typedVideos = allVideos as Video[] | undefined;
  const typedRecommendedVideos = recommendedVideos as Video[];
  const typedNewReleases = newReleases as Video[];
  const typedFeaturedVideos = featuredVideos as Video[];

  // Infinite scroll state
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDocId, setLastDocId] = useState<string | null>(null);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });

  const loadVideos = useCallback(async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);
    setError(null);

    try {
      const { videos: newVideos, lastDoc, hasMore: more } = await fetchVideos(20, reset ? null : (lastDocId as any));
      setVideos(prev => reset ? (newVideos as Video[]) : [...prev, ...(newVideos as Video[])]);
      setLastDocId(lastDoc?.id || null);
      setHasMore(more);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load videos. Please try again.';
      setError(errorMessage);
      console.error('Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, lastDocId]);

  useEffect(() => {
    loadVideos(true);

    // Generate personalized recommendations if user is logged in
    if (user && allVideos) {
      setAiRecommendationsLoading(true);
      // Get user's viewing history
      const historyQuery = query(collection(firestore, 'users', user.uid, 'history'), limit(20));
      getDocs(historyQuery).then(snapshot => {
        const historyIds = snapshot.docs.map(doc => doc.id);
        if (historyIds.length > 0) {
          contentRecommendationEngine({
            viewingHistory: historyIds,
            userPreferences: 'adult video content, entertainment'
          }).then(result => {
            // Fetch recommended videos by IDs
            const recommendationPromises = result.recommendedVideos.slice(0, 5).map(videoId =>
              getDoc(doc(firestore, 'videos', videoId))
            );
            Promise.all(recommendationPromises).then(docs => {
              const recommended = docs
                .filter(doc => doc.exists())
                .map(doc => ({ id: doc.id, ...doc.data() } as Video))
                .filter(v => v.status === 'Approved');
              setPersonalizedRecommendations(recommended);
            }).catch(() => {
              // Fallback to random recommendations
              setPersonalizedRecommendations(typedRecommendedVideos.slice(0, 5));
            });
          }).catch(() => {
            // Fallback to random recommendations
            setPersonalizedRecommendations(typedRecommendedVideos.slice(0, 5));
          }).finally(() => {
            setAiRecommendationsLoading(false);
          });
        } else {
          // No history, show random recommendations
          setPersonalizedRecommendations(typedRecommendedVideos.slice(0, 5));
          setAiRecommendationsLoading(false);
        }
      }).catch(() => {
        setPersonalizedRecommendations(typedRecommendedVideos.slice(0, 5));
        setAiRecommendationsLoading(false);
      });
    } else {
      // Not logged in, show random recommendations
      setPersonalizedRecommendations(typedRecommendedVideos.slice(0, 5));
    }
  }, [user, allVideos]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadVideos();
    }
  }, [inView, hasMore, loading, loadVideos]);

  const renderVideoCarousel = (
    videos: Video[] | undefined,
    loading: boolean
  ) => (
    <Carousel
      opts={{
        align: 'start',
        loop: videos && videos.length > 5,
      }}
      className="w-full animate-fade-in"
    >
      <CarouselContent>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <CarouselItem
                key={i}
                className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <div className="space-y-2">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CarouselItem>
            ))
          : videos?.map((video: Video, index) => (
              <CarouselItem
                key={video.id}
                className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                style={{ animationDelay: `${index * 100}ms`}}
              >
                <VideoCard video={video} />
              </CarouselItem>
            ))}
      </CarouselContent>
      <CarouselPrevious className="ml-12" />
      <CarouselNext className="mr-12" />
    </Carousel>
  );

  const renderVideoGrid = (videos: Video[] | undefined, loading: boolean) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
      {loading
        ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        : videos?.map((video: Video, index) => (
            <div key={video.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`}}>
                <VideoCard video={video} />
            </div>
          ))}
    </div>
  );

  return (
    <div className="space-y-8 md:space-y-12 animate-fade-in px-2 md:px-0">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold font-headline">Featured Videos</h2>
        </div>
        {renderVideoCarousel(typedFeaturedVideos, videosLoading)}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold font-headline">
            Browse Categories
          </h2>
          <Button variant="link" asChild className="hidden sm:inline-flex">
            <Link href="/categories">View All</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 animate-fade-in">
          {categoriesLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full md:h-32 md:h-40" />
              ))
            : categories?.map((category: any, index) => (
                <div key={category.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`}}>
                  <CategoryCard category={category as Category} />
                </div>
              ))}
        </div>
        <Button variant="link" asChild className="w-full mt-4 sm:hidden">
          <Link href="/categories">View All Categories</Link>
        </Button>
      </section>

      <section data-ai-hint="personalized content curation">
        <h2 className="text-xl md:text-2xl font-bold font-headline mb-4">
          {user ? 'Recommended For You' : 'Recommended Videos'}
        </h2>
        {aiRecommendationsLoading ? (
          <div className="flex items-center gap-2 mb-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Personalizing recommendations...</span>
          </div>
        ) : null}
        {renderVideoCarousel(personalizedRecommendations.length > 0 ? personalizedRecommendations : typedRecommendedVideos, videosLoading || aiRecommendationsLoading)}
      </section>

      <section>
        <h2 className="text-xl md:text-2xl font-bold font-headline mb-4">All Videos</h2>
        <MemoizedVideoGrid videos={videos} loading={loading} />
        {loading && Array.from({ length: 10 }).map((_, i) => (
          <div key={`loading-${i}`} className="space-y-2">
            <Skeleton className="h-32 md:h-40 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
        {hasMore && !loading && (
          <div ref={loadMoreRef} className="col-span-full flex justify-center py-4">
            <div className="text-muted-foreground text-sm md:text-base">Loading more videos...</div>
          </div>
        )}
        {!hasMore && videos.length > 0 && (
          <div className="col-span-full flex justify-center py-4">
            <div className="text-muted-foreground text-sm md:text-base">No more videos to load</div>
          </div>
        )}
        {error && (
          <div className="col-span-full flex justify-center py-4">
            <div className="text-destructive text-sm md:text-base">{error}</div>
          </div>
        )}
      </section>
    </div>
  );
}
