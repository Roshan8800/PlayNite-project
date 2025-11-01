import Image from 'next/image';
import Link from 'next/link';
import type { Category } from '@/lib/data';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.id}`} className="block group">
      <Card className={cn("overflow-hidden relative h-32 md:h-40", className)}>
        <Image
          src={category.thumbnailUrl}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={category.thumbnailHint}
        />
        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300" />
        <div className="relative flex h-full items-center justify-center">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-white drop-shadow-md">
              {category.name}
            </CardTitle>
          </CardHeader>
        </div>
      </Card>
    </Link>
  );
}
