
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { videos, users } from '@/lib/data';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

const reports = [
    { id: '1', video: videos[0], user: users[1], reason: 'Inappropriate content', status: 'Open'},
    { id: '2', video: videos[2], user: users[3], reason: 'Spam or misleading', status: 'Open'},
    { id: '3', video: videos[4], user: users[0], reason: 'Hate speech', status: 'Resolved'},
]


export default function AdminReportsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          Content Reports
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage user-submitted reports for videos.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Open Reports</CardTitle>
          <CardDescription>
            {reports.filter(r => r.status === 'Open').length} reports require your attention.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video Title</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.video.title}</TableCell>
                  <TableCell>{report.user.name}</TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>
                      <Badge variant={report.status === 'Open' ? 'destructive' : 'secondary'}>
                        {report.status === 'Open' ? 
                            <ShieldAlert className="mr-1 h-3 w-3" /> :
                            <ShieldCheck className="mr-1 h-3 w-3" />
                        }
                        {report.status}
                      </Badge>
                  </TableCell>
                  <TableCell>
                    {report.status === 'Open' ? (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">Review Video</Button>
                            <Button variant="destructive" size="sm">Take Action</Button>
                        </div>
                    ) : (
                        <span className="text-muted-foreground text-xs">No action needed</span>
                    )}
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
