'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart, Users, Video, FileCheck, ShieldAlert, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [stats, setStats] = useState([
    { title: "Total Users", value: "0", icon: Users, change: "0%" },
    { title: "Total Videos", value: "0", icon: Video, change: "0%" },
    { title: "Pending Approvals", value: "0", icon: FileCheck, change: "0%" },
    { title: "Open Reports", value: "0", icon: ShieldAlert, change: "0%" },
  ]);

  // Fetch real-time stats
  const usersQuery = query(collection(firestore, 'users'));
  const videosQuery = query(collection(firestore, 'videos'));
  const pendingVideosQuery = query(collection(firestore, 'videos'), where('status', '==', 'Pending'));
  const reportsQuery = query(collection(firestore, 'reports'), where('status', '==', 'Open'));

  const { data: users } = useCollection(usersQuery);
  const { data: videos } = useCollection(videosQuery);
  const { data: pendingVideos } = useCollection(pendingVideosQuery);
  const { data: openReports } = useCollection(reportsQuery);

  useEffect(() => {
    if (users && videos && pendingVideos && openReports) {
      setStats([
        {
          title: "Total Users",
          value: users.length.toString(),
          icon: Users,
          change: "+12%"
        },
        {
          title: "Total Videos",
          value: videos.length.toString(),
          icon: Video,
          change: "+50"
        },
        {
          title: "Pending Approvals",
          value: pendingVideos.length.toString(),
          icon: FileCheck,
          change: pendingVideos.length > 0 ? `+${pendingVideos.length}` : "0"
        },
        {
          title: "Open Reports",
          value: openReports.length.toString(),
          icon: ShieldAlert,
          change: openReports.length > 0 ? `+${openReports.length}` : "0"
        },
      ]);
    }
  }, [users, videos, pendingVideos, openReports]);
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Welcome back, Admin. Here's a summary of your app.
        </p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Content Moderation
            </CardTitle>
            <CardDescription>Review and approve pending videos</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/approval">Review Videos ({pendingVideos?.length || 0})</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Reports & Safety
            </CardTitle>
            <CardDescription>Handle user reports and safety issues</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/reports">View Reports ({openReports?.length || 0})</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest system activity and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingVideos && pendingVideos.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    {pendingVideos.length} video{pendingVideos.length > 1 ? 's' : ''} awaiting approval
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Review pending content to maintain quality standards
                  </p>
                </div>
                <Button size="sm" asChild>
                  <Link href="/admin/approval">Review</Link>
                </Button>
              </div>
            )}

            {openReports && openReports.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium text-red-800 dark:text-red-200">
                    {openReports.length} open report{openReports.length > 1 ? 's' : ''} require attention
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Address user safety concerns promptly
                  </p>
                </div>
                <Button size="sm" variant="destructive" asChild>
                  <Link href="/admin/reports">Handle</Link>
                </Button>
              </div>
            )}

            {(!pendingVideos || pendingVideos.length === 0) && (!openReports || openReports.length === 0) && (
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-800 dark:text-green-200">
                    All systems operational
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    No immediate admin actions required
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Analytics</CardTitle>
          <CardDescription>A chart showing user activity over the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex items-center justify-center h-64 bg-secondary rounded-md">
               <BarChart className="h-12 w-12 text-muted-foreground" />
               <p className="ml-4 text-muted-foreground">Chart placeholder</p>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
