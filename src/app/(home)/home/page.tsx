'use client';

import { CategoryCard } from '@/components/category-card';
import { VideoCard } from '@/components/video-card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Link from 'next/link';
import { useCollection } from '@/firebase';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Video, Category } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const firestore = useFirestore();

  // Fetch data from Firestore
  const videosRef = collection(firestore, 'videos');
  const categoriesRef = collection(firestore, 'categories');

  const approvedVideosQuery = query(
    videosRef,
    where('status', '==', 'Approved')
  );

  const { data: allVideos, loading: videosLoading } =
    useCollection(approvedVideosQuery);
  const { data: categories, loading: categoriesLoading } =
    useCollection(categoriesRef);

  const recommendedVideos = [...(allVideos || [])].sort(() => 0.5 - Math.random());
  const newReleases = [...(allVideos || [])].sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
  const featuredVideos = (allVideos || []).slice(0, 5);

  const renderVideoCarousel = (
    videos: Video[] | undefined,
    loading: boolean
  ) => (
    <Carousel
      opts={{
        align: 'start',
        loop: videos && videos.length > 5,
      }}
      className="w-full"
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
          : videos?.map((video: Video) => (
              <CarouselItem
                key={video.id}
                className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {loading
        ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        : videos?.map((video: Video) => (
            <VideoCard key={video.id} video={video} />
          ))}
    </div>
  );

  return (
    <div className="space-y-12">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold font-headline">Featured Videos</h2>
        </div>
        {renderVideoCarousel(featuredVideos, videosLoading)}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold font-headline">
            Browse Categories
          </h2>
          <Button variant="link" asChild>
            <Link href="/categories">View All</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {categoriesLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full md:h-40" />
              ))
            : categories?.map((category: any) => (
                <CategoryCard key={category.id} category={category as Category} />
              ))}
        </div>
      </section>

      <section data-ai-hint="personalized content curation">
        <h2 className="text-2xl font-bold font-headline mb-4">
          Recommended For You
        </h2>
        {renderVideoCarousel(recommendedVideos, videosLoading)}
      </section>

      <section>
        <h2 className="text-2xl font-bold font-headline mb-4">New Releases</h2>
        {renderVideoGrid(newReleases, videosLoading)}
      </section>
    </div>
  );
}
