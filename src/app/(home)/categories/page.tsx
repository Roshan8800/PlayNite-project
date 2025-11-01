import { CategoryCard } from '@/components/category-card';
import { categories } from '@/lib/data';

export default function CategoriesPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          All Categories
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Explore videos across all our available categories.
        </p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
