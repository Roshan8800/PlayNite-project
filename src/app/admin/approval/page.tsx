
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { videos } from '@/lib/data';
import { MoreHorizontal, Check, X } from 'lucide-react';
import Image from 'next/image';

const pendingVideos = videos.slice(0, 4).map(v => ({...v, status: 'Pending'}));

export default function AdminApprovalPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          Approval Queue
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Review and approve new video submissions.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Pending Videos</CardTitle>
          <CardDescription>
            {pendingVideos.length} videos awaiting your review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead className="hidden md:table-cell">
                  Uploaded
                </TableHead>
                <TableHead>
                  Status
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingVideos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={video.title}
                      className="aspect-video rounded-md object-cover"
                      height="64"
                      src={video.thumbnailUrl}
                      width="114"
                      data-ai-hint={video.thumbnailHint}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{video.title}</TableCell>
                  <TableCell>{video.channel}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {video.uploadedAt}
                  </TableCell>
                  <TableCell>
                      <Badge variant="secondary">Pending</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon"><Check className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon"><X className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
