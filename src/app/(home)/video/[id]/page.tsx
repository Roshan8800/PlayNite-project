import Image from 'next/image';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { VideoCard } from '@/components/video-card';
import { videos, videoPlayerImage } from '@/lib/data';
import { summarizeContent, generateTags } from '@/ai/flows/content-summarization'; // Mock usage
import {
  Bell,
  Download,
  Maximize,
  Mic,
  Minus,
  Play,
  Plus,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Link from 'next/link';

export default async function VideoPage({ params }: { params: { id: string } }) {
  const video = videos.find((v) => v.id === params.id) || videos[0];
  const recommendedVideos = [...videos]
    .filter((v) => v.id !== video.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 10);

  // Mock AI calls
  const summaryResult = await summarizeContent({ videoTitle: video.title, videoDescription: video.description }).catch(e => ({ summary: "AI summary is currently unavailable."}));
  const tagsResult = await generateTags({ videoTitle: video.title, videoDescription: video.description }).catch(e => ({ tags: ["AI", "Tags", "Unavailable"]}));
  
  return (
    <div className="container mx-auto max-w-7xl px-0 py-0">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <div
            className="relative aspect-video w-full overflow-hidden rounded-lg shadow-2xl bg-black"
            data-ai-hint="double tap toggle play pause, pinch zoom video, long press speed control, horizontal swipe fast forward rewind, two finger tap mute unmute, rotate fullscreen"
          >
            <Image
              src={videoPlayerImage.url}
              alt="Video player"
              fill
              className="object-cover"
              data-ai-hint={videoPlayerImage.hint}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Button variant="ghost" size="icon" className="h-20 w-20 text-white hover:bg-white/20">
                <Play className="h-12 w-12" fill="white" />
              </Button>
            </div>
            <div
                className="absolute left-0 top-0 h-full w-1/3"
                data-ai-hint="swipe up down left brightness"
            />
            <div
                className="absolute right-0 top-0 h-full w-1/3"
                data-ai-hint="swipe up down right volume"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center gap-4 text-white">
                    <Button variant="ghost" size="icon" className="hover:bg-white/20"><Play className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-white/20"><Volume2 className="h-5 w-5" /></Button>
                    <div className="text-xs">01:23 / {video.duration}</div>
                    <div className="flex-grow" />
                    <Button variant="ghost" size="icon" className="hover:bg-white/20"><Settings className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="hover:bg-white/20"><Maximize className="h-5 w-5" /></Button>
                </div>
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-3xl font-headline font-bold">{video.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={video.channelAvatarUrl} alt={video.channel} />
                  <AvatarFallback>{video.channel.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{video.channel}</p>
                  <p className="text-sm text-muted-foreground">2.3M subscribers</p>
                </div>
              </div>
              <Button variant="outline" className="flex-shrink-0">
                <Bell className="mr-2 h-4 w-4" /> Subscribed
              </Button>
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="secondary"><ThumbsUp className="mr-2 h-4 w-4" /> 34K</Button>
                <Button variant="secondary"><ThumbsDown className="h-4 w-4" /></Button>
                <Button variant="secondary"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                <Button variant="secondary"><Download className="mr-2 h-4 w-4" /> Download</Button>
              </div>
            </div>
            <Card className="mt-6" data-ai-hint="content summarization">
              <CardContent className="p-4">
                <p className="font-semibold">{video.views} views &bull; {video.uploadedAt}</p>
                <p className="mt-2 text-muted-foreground whitespace-pre-wrap">{summaryResult.summary}</p>
                <p className="mt-2 text-sm">{video.description}</p>
              </CardContent>
            </Card>
            <div className="mt-6" data-ai-hint="tag generation">
                <h3 className="text-lg font-bold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {tagsResult.tags.map((tag, i) => <Badge key={i} variant="secondary">{tag}</Badge>)}
                </div>
            </div>
            <Separator className="my-8" />
            <div className="space-y-6" data-ai-hint="sentiment analysis">
              <h2 className="text-2xl font-bold">Comments (1,345)</h2>
              <div className="flex gap-4">
                <Avatar>
                    <AvatarImage src="https://picsum.photos/seed/301/100/100" alt="User" data-ai-hint="person portrait"/>
                    <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <Input placeholder="Add a comment..." />
                   <div className="flex justify-end mt-2">
                     <Button>Comment</Button>
                   </div>
                </div>
              </div>
               {/* Comments section */}
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/3 space-y-4" data-ai-hint="content recommendation engine">
            <h2 className="text-xl font-headline font-bold">Up Next</h2>
          {recommendedVideos.map((recVideo) => (
            <VideoCard key={recVideo.id} video={recVideo} variant="horizontal" />
          ))}
        </div>
      </div>
    </div>
  );
}
