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
import { categories, videos } from '@/lib/data';
import Link from 'next/link';

export default function HomePage() {
  const recommendedVideos = [...videos].sort(() => 0.5 - Math.random());
  const newReleases = [...videos].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  ).slice(0, 8);
  const featuredVideos = videos.slice(0, 5);


  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-headline font-bold">Featured Videos</h2>
          <Button variant="link" asChild>
            <Link href="/videos">View All</Link>
          </Button>
        </div>
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {featuredVideos.map((video) => (
              <CarouselItem key={video.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <VideoCard video={video} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-12"/>
          <CarouselNext className="mr-12" />
        </Carousel>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-headline font-bold">Browse Categories</h2>
          <Button variant="link" asChild>
            <Link href="/categories">View All</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section data-ai-hint="personalized content curation">
        <h2 className="text-2xl font-headline font-bold mb-4">Recommended For You</h2>
        <Carousel opts={{ align: 'start' }} className="w-full">
          <CarouselContent>
            {recommendedVideos.map((video) => (
              <CarouselItem key={video.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <VideoCard video={video} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-12"/>
          <CarouselNext className="mr-12"/>
        </Carousel>
      </section>
      
       <section>
        <h2 className="text-2xl font-headline font-bold mb-4">New Releases</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {newReleases.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>
    </div>
  );
}
