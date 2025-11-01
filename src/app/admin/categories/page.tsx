
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { categories } from '@/lib/data';
import { PlusCircle } from 'lucide-react';

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-8">
       <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-headline font-bold tracking-tight">
            Category Management
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Organize your video categories.
          </p>
        </div>
        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Category</Button>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle>Existing Categories</CardTitle>
                <CardDescription>
                    A list of all current categories.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {categories.map((category) => (
                        <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">Edit</Button>
                                <Button variant="destructive" size="sm">Delete</Button>
                            </div>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Add New Category</CardTitle>
                    <CardDescription>
                        Create a new category for your videos.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input placeholder="Category Name" />
                    <Input type="file" />
                    <Button className="w-full">Add Category</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
