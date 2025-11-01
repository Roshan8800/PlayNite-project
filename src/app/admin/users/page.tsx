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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { type User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUsersPage() {
  const firestore = useFirestore();
  const usersRef = collection(firestore, 'users');
  const { data: users, loading, error } = useCollection(usersRef);

  const renderLoading = () => (
    <TableBody>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16 rounded-full" />
          </TableCell>
           <TableCell>
            <Skeleton className="h-6 w-20 rounded-full" />
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-headline font-bold tracking-tight">
            User Management
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Manage all user accounts.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add User
        </Button>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>A list of all users in your app.</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-8 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">
                  Joined Date
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            {loading ? (
              renderLoading()
            ) : (
              <TableBody>
                {error && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-destructive"
                    >
                      Error: {error.message}
                    </TableCell>
                  </TableRow>                
                )}
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={(user as User).uid}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={(user as User).avatarUrl || ''} alt={(user as User).name || ''} />
                            <AvatarFallback>
                              {(user as User).name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{(user as User).name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{(user as User).email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            (user as User).role === 'Admin'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {(user as User).role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={(user as User).status === 'Active' ? 'secondary' : 'destructive'} className={(user as User).status === 'Active' ? 'bg-green-500/20 text-green-700 dark:text-green-400 border-transparent' : ''}>
                          {(user as User).status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date((user as User).joinedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No users found.
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
