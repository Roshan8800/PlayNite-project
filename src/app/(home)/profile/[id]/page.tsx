'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VideoCard } from "@/components/video-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Mail, User as UserIcon, Video, Calendar, MapPin, Link as LinkIcon, Users, Heart, Eye } from "lucide-react";
import { useUser, useFirestore, useCollection, useDoc } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, doc, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { useMemo } from "react";
import { type Video as VideoType } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';

export default function UserProfilePage({ params }: { params: { id: string } }) {
    const { user: currentUser } = useUser();
    const firestore = useFirestore();
    const { id } = params;

    // Fetch the profile user data
    const userRef = useDoc(id !== 'me' ? doc(firestore, 'users', id) : null);
    const profileUser = id === 'me' ? currentUser : userRef.data;
    const loadingProfile = id !== 'me' ? userRef.loading : !currentUser;

    const videosQuery = useMemo(() => {
      if (!profileUser) return null;
      return query(collection(firestore, 'videos'), where('channelId', '==', profileUser.uid), orderBy('uploadedAt', 'desc'));
    }, [profileUser, firestore]);

    const likedVideosQuery = useMemo(() => {
      if (!profileUser) return null;
      return query(collection(firestore, 'users', profileUser.uid, 'likes'), orderBy('addedAt', 'desc'), limit(20));
    }, [profileUser, firestore]);

    const { data: userVideos, loading: videosLoading } = useCollection(videosQuery);
    const { data: likedVideos, loading: likedLoading } = useCollection(likedVideosQuery);

    if (loadingProfile) {
        return (
            <div className="container mx-auto p-4 space-y-8">
                 <Card>
                    <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                        <Skeleton className="h-24 w-24 rounded-full border-4 border-primary" />
                        <div className="flex-grow space-y-2 text-center md:text-left">
                            <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
                            <Skeleton className="h-5 w-64 mx-auto md:mx-0" />
                            <Skeleton className="h-4 w-40 mx-auto md:mx-0" />
                        </div>
                    </CardContent>
                </Card>
                <Skeleton className="h-8 w-40 mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({length: 4}).map((_, i) => (
                        <div key={i} className="space-y-2">
                           <Skeleton className="h-48 w-full" />
                           <Skeleton className="h-4 w-3/4" />
                           <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (!profileUser) {
        return (
            <div className="container mx-auto p-4 text-center">
                <p>User not found.</p>
            </div>
        )
    }

    const isOwnProfile = currentUser?.uid === profileUser.uid;

    return (
        <div className="container mx-auto p-4">
            <Card className="mb-8">
                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-primary">
                        <AvatarImage src={profileUser.avatarUrl || undefined} alt={profileUser.name || undefined} />
                        <AvatarFallback>{profileUser.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow text-center md:text-left">
                        <h1 className="text-3xl font-headline font-bold">{profileUser.name}</h1>
                        <p className="text-muted-foreground">{profileUser.email}</p>
                        <div className="flex justify-center md:justify-start gap-6 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Video className="w-4 h-4"/> {userVideos?.length || 0} videos</span>
                            <span className="flex items-center gap-1.5"><Users className="w-4 h-4"/> 1.2k Subscribers</span>
                            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4"/> 50k Views</span>
                        </div>
                        {(profileUser as any).bio && (
                            <p className="mt-2 text-sm">{(profileUser as any).bio}</p>
                        )}
                    </div>
                    {isOwnProfile && (
                        <Button>Edit Profile</Button>
                    )}
                </CardContent>
            </Card>

            <Tabs defaultValue="videos" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                    <TabsTrigger value="liked">Liked Videos</TabsTrigger>
                    <TabsTrigger value="about">About</TabsTrigger>
                </TabsList>

                <TabsContent value="videos" className="mt-6">
                    <h2 className="text-2xl font-headline font-bold mb-4">Videos</h2>
                    {videosLoading ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({length: 4}).map((_, i) => (
                                 <div key={i} className="space-y-2">
                                    <Skeleton className="h-48 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : userVideos && userVideos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {userVideos.map(video => (
                                <VideoCard key={video.id} video={video as VideoType} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No videos uploaded yet.</p>
                    )}
                </TabsContent>

                <TabsContent value="liked" className="mt-6">
                    <h2 className="text-2xl font-headline font-bold mb-4">Liked Videos</h2>
                    {likedLoading ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({length: 4}).map((_, i) => (
                                 <div key={i} className="space-y-2">
                                    <Skeleton className="h-48 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : likedVideos && likedVideos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {likedVideos.map(like => (
                                <VideoCard key={like.id} video={like as VideoType} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No liked videos yet.</p>
                    )}
                </TabsContent>

                <TabsContent value="about" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>About</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="text-center mb-6">
                                    <div className="flex justify-center mb-4">
                                        <img
                                            src="/logo.png"
                                            alt="PlayNite Logo"
                                            className="h-16 w-16 object-contain"
                                            onError={(e) => {
                                                // Fallback to text logo if image fails to load
                                                e.currentTarget.style.display = 'none';
                                                const fallback = document.createElement('div');
                                                fallback.className = 'h-16 w-16 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl';
                                                fallback.textContent = 'PN';
                                                e.currentTarget.parentNode?.appendChild(fallback);
                                            }}
                                        />
                                    </div>
                                    <h3 className="text-lg font-bold text-primary">PlayNite</h3>
                                    <p className="text-sm text-muted-foreground">Advanced Video Streaming Platform</p>
                                </div>

                                <Separator className="my-4" />

                                <div className="text-center">
                                    <p className="font-semibold mb-2">PlayNite</p>
                                    <p className="text-xs text-muted-foreground mb-4">Developed by the Sahu Family</p>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-center gap-2">
                                            <UserIcon className="w-4 h-4 text-muted-foreground"/>
                                            <span className="text-sm">Roshan Sahu</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <UserIcon className="w-4 h-4 text-muted-foreground"/>
                                            <span className="text-sm">Papun Sahu</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <UserIcon className="w-4 h-4 text-muted-foreground"/>
                                            <span className="text-sm">Rohan Sahu</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                {(profileUser as any).bio && (
                                    <div>
                                        <p className="font-semibold mb-1">Bio</p>
                                        <p>{(profileUser as any).bio}</p>
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-3 text-muted-foreground"/>
                                    <span className="font-semibold mr-2">Email:</span>
                                    <span>{profileUser.email}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-3 text-muted-foreground"/>
                                    <span className="font-semibold mr-2">Joined:</span>
                                    <span>{formatDistanceToNow(new Date(profileUser.joinedDate), { addSuffix: true })}</span>
                                </div>
                                {(profileUser as any).location && (
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-3 text-muted-foreground"/>
                                        <span className="font-semibold mr-2">Location:</span>
                                        <span>{(profileUser as any).location}</span>
                                    </div>
                                )}
                                {(profileUser as any).website && (
                                    <div className="flex items-center">
                                        <LinkIcon className="w-4 h-4 mr-3 text-muted-foreground"/>
                                        <span className="font-semibold mr-2">Website:</span>
                                        <a href={(profileUser as any).website} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                            {(profileUser as any).website}
                                        </a>
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <UserIcon className="w-4 h-4 mr-3 text-muted-foreground"/>
                                    <span className="font-semibold mr-2">Role:</span>
                                    <Badge variant="secondary">{profileUser.role}</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Total Videos</span>
                                    <span className="text-2xl font-bold">{userVideos?.length || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Total Views</span>
                                    <span className="text-2xl font-bold">50k</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Subscribers</span>
                                    <span className="text-2xl font-bold">1.2k</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Likes Given</span>
                                    <span className="text-2xl font-bold">{likedVideos?.length || 0}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}