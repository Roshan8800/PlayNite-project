
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VideoCard } from "@/components/video-card";
import { users, videos } from "@/lib/data";
import { Mail, Phone, User, Video } from "lucide-react";

export default function ProfilePage() {
    const user = users[0];
    const userVideos = videos.slice(0, 4);

    return (
        <div className="container mx-auto p-4">
            <Card className="mb-8">
                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-primary">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow text-center md:text-left">
                        <h1 className="text-3xl font-headline font-bold">{user.name}</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                        <div className="flex justify-center md:justify-start gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Video className="w-4 h-4"/> {userVideos.length} videos</span>
                            <span className="flex items-center gap-1.5"><User className="w-4 h-4"/> 1.2k Subscribers</span>
                        </div>
                    </div>
                    <Button>Edit Profile</Button>
                </CardContent>
            </Card>

            <h2 className="text-2xl font-headline font-bold mb-4">My Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {userVideos.map(video => (
                    <VideoCard key={video.id} video={video} />
                ))}
            </div>

            <Separator className="my-8" />
            
            <div>
                 <h2 className="text-2xl font-headline font-bold mb-4">Account Details</h2>
                 <Card>
                    <CardContent className="p-6 space-y-4 text-sm">
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
                            <User className="w-4 h-4 mr-3 text-muted-foreground"/>
                            <span className="font-semibold mr-2">Member Since:</span>
                            <span>{user.joinedDate}</span>
                        </div>
                    </CardContent>
                 </Card>
            </div>
        </div>
    )
}
