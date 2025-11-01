
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VideoCard } from "@/components/video-card";
import { videos } from "@/lib/data";
import { Mail, Phone, User as UserIcon, Video } from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useMemo, useEffect, useState } from "react";
import { type Video as VideoType } from "@/lib/types";


export default function ProfilePage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const [userVideos, setUserVideos] = useState<VideoType[]>([]);
    const [videosLoading, setVideosLoading] = useState(true);

    useEffect(() => {
        const fetchUserVideos = async () => {
            if (!user) return;
            setVideosLoading(true);
            
            // This is a placeholder for fetching user-specific videos.
            // In a real app, you would have a query like `where('channel', '==', user.name)`
            // or a `userId` field on the video document.
            // For now, we'll just show some videos as an example.
            const videosQuery = query(collection(firestore, "videos"));
            const snapshot = await getDocs(videosQuery);
            const allVideos = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as VideoType[];
            setUserVideos(allVideos.slice(0, 4));

            setVideosLoading(false);
        };
        fetchUserVideos();

    }, [user, firestore]);

    if (userLoading) {
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

    if (!user) {
        return (
            <div className="container mx-auto p-4 text-center">
                <p>Please log in to view your profile.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            <Card className="mb-8">
                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-primary">
                        <AvatarImage src={user.avatarUrl!} alt={user.name!} />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow text-center md:text-left">
                        <h1 className="text-3xl font-headline font-bold">{user.name}</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                        <div className="flex justify-center md:justify-start gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Video className="w-4 h-4"/> {userVideos.length} videos</span>
                            <span className="flex items-center gap-1.5"><UserIcon className="w-4 h-4"/> 1.2k Subscribers</span>
                        </div>
                    </div>
                    <Button>Edit Profile</Button>
                </CardContent>
            </Card>

            <h2 className="text-2xl font-headline font-bold mb-4">My Videos</h2>
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
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {userVideos.map(video => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>
            )}


            <Separator className="my-8" />
            
            <div>
                 <h2 className="text-2xl font-headline font-bold mb-4">Account Details</h2>
                 <Card>
                    <CardHeader>
                        <CardTitle>Your Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-3 text-muted-foreground"/>
                            <span className="font-semibold mr-2">Email:</span>
                            <span>{user.email}</span>
                        </div>
                        <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-3 text-muted-foreground"/>
                            <span className="font-semibold mr-2">Phone:</span>
                            <span>(Not set)</span>
                        </div>
                        <div className="flex items-center">
                            <UserIcon className="w-4 h-4 mr-3 text-muted-foreground"/>
                            <span className="font-semibold mr-2">Member Since:</span>
                            <span>{new Date(user.joinedDate).toLocaleDateString()}</span>
                        </div>
                    </CardContent>
                 </Card>
            </div>
        </div>
    )
}
