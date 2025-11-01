import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart, Users, Video, FileCheck, ShieldAlert } from 'lucide-react';

const stats = [
    { title: "Total Users", value: "12,345", icon: Users, change: "+12%" },
    { title: "Total Videos", value: "5,678", icon: Video, change: "+50" },
    { title: "Pending Approvals", value: "12", icon: FileCheck, change: "+3" },
    { title: "Open Reports", value: "5", icon: ShieldAlert, change: "-1" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Welcome back, Admin. Here&apos;s a summary of your app.
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
