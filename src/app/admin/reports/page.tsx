'use client';

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
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type Report = {
  id: string;
  videoId: string;
  videoTitle: string;
  reportedByName: string;
  reason: string;
  status: 'Open' | 'Resolved';
  reportedAt: string;
};

export default function AdminReportsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const reportsQuery = query(collection(firestore, 'reports'), orderBy('reportedAt', 'desc'));
  const { data: reports, loading, error } = useCollection(reportsQuery);

  const handleResolveReport = async (reportId: string) => {
    const reportDoc = doc(firestore, 'reports', reportId);
    const updateData = { status: 'Resolved' };
    try {
      await updateDoc(reportDoc, updateData);
      toast({ title: 'Report Resolved', description: 'The report has been marked as resolved.' });
    } catch (e: any) {
      const permissionError = new FirestorePermissionError({
        path: reportDoc.path,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  const openReportsCount = reports?.filter((r) => (r as Report).status === 'Open').length ?? 0;

  const renderLoading = () => (
    <TableBody>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-8 w-24" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

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
          <CardTitle>User Reports</CardTitle>
          <CardDescription>
            {loading ? 'Loading reports...' : `${openReportsCount} reports require your attention.`}
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
            {loading ? renderLoading() : (
              <TableBody>
                {error && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-destructive">
                      Error: {error.message}
                    </TableCell>
                  </TableRow>
                )}
                {reports && reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{(report as Report).videoTitle}</TableCell>
                      <TableCell>{(report as Report).reportedByName}</TableCell>
                      <TableCell>{(report as Report).reason}</TableCell>
                      <TableCell>
                        <Badge variant={(report as Report).status === 'Open' ? 'destructive' : 'secondary'}>
                          {(report as Report).status === 'Open' ? (
                            <ShieldAlert className="mr-1 h-3 w-3" />
                          ) : (
                            <ShieldCheck className="mr-1 h-3 w-3" />
                          )}
                          {(report as Report).status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(report as Report).status === 'Open' ? (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Review Video</Button>
                            <Button size="sm" onClick={() => handleResolveReport(report.id)}>Mark Resolved</Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No action needed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No reports found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            )}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
