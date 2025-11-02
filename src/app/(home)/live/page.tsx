'use client';

import { useState, useEffect } from 'react';
import { LiveStreamPlayer } from '@/components/live-stream-player';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Search, Users, Eye, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LiveStream {
  id: string;
  title: string;
  streamerName: string;
  streamerAvatar?: string;
  viewerCount: number;
  isLive: boolean;
  streamUrl: string;
  thumbnailUrl: string;
  category: string;
  startedAt: string;
  description?: string;
}

export default function LivePage() {
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Mock live streams data - in real app, this would come from Firestore
  const mockLiveStreams: LiveStream[] = [
    {
      id: '1',
      title: 'Gaming Session - Epic Battles',
      streamerName: 'GameMaster2024',
      streamerAvatar: '/avatars/streamer1.jpg',
      viewerCount: 15420,
      isLive: true,
      streamUrl: '/streams/game-session.mp4', // Mock stream URL
      thumbnailUrl: '/thumbnails/game.jpg',
      category: 'Gaming',
      startedAt: new Date().toISOString(),
      description: 'Join me for an epic gaming session with intense battles and strategy!'
    },
    {
      id: '2',
      title: 'Music Live Performance',
      streamerName: 'MelodyQueen',
      streamerAvatar: '/avatars/streamer2.jpg',
      viewerCount: 8750,
      isLive: true,
      streamUrl: '/streams/music-performance.mp4',
      thumbnailUrl: '/thumbnails/music.jpg',
      category: 'Music',
      startedAt: new Date().toISOString(),
      description: 'Live acoustic performance featuring original songs and covers.'
    },
    {
      id: '3',
      title: 'Cooking Masterclass',
      streamerName: 'ChefAntonio',
      streamerAvatar: '/avatars/streamer3.jpg',
      viewerCount: 12340,
      isLive: true,
      streamUrl: '/streams/cooking-class.mp4',
      thumbnailUrl: '/thumbnails/cooking.jpg',
      category: 'Cooking',
      startedAt: new Date().toISOString(),
      description: 'Learn to cook authentic Italian pasta from scratch!'
    }
  ];

  const [liveStreams, setLiveStreams] = useState<LiveStream[]>(mockLiveStreams);
  const [filteredStreams, setFilteredStreams] = useState<LiveStream[]>(mockLiveStreams);

  const categories = ['All', 'Gaming', 'Music', 'Cooking', 'Art', 'Talk Shows', 'Sports'];

  useEffect(() => {
    let filtered = liveStreams;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(stream =>
        stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stream.streamerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stream.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(stream => stream.category === selectedCategory);
    }

    setFilteredStreams(filtered);
  }, [searchQuery, selectedCategory, liveStreams]);

  const StreamCard = ({ stream }: { stream: LiveStream }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="relative aspect-video">
        <img
          src={stream.thumbnailUrl}
          alt={stream.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

        {/* Live Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="destructive" className="bg-red-600">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            LIVE
          </Badge>
        </div>

        {/* Viewer Count */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-black/50 text-white">
            <Eye className="w-4 h-4 mr-1" />
            {stream.viewerCount.toLocaleString()}
          </Badge>
        </div>

        {/* Streamer Info Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-black/70 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Avatar className="w-8 h-8">
                <AvatarImage src={stream.streamerAvatar} alt={stream.streamerName} />
                <AvatarFallback>{stream.streamerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{stream.streamerName}</p>
                <p className="text-gray-300 text-xs truncate">{stream.title}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs border-white/30 text-white">
              {stream.category}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold tracking-tight">
          Live Streams
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Watch live content from creators around the world.
        </p>
      </header>

      {/* Featured Live Stream */}
      {filteredStreams.length > 0 && (
        <section>
          <h2 className="text-2xl font-headline font-bold mb-4">Featured Stream</h2>
          <LiveStreamPlayer stream={filteredStreams[0]} className="w-full" />
        </section>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search live streams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Live Streams Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-headline font-bold">
            Live Now ({filteredStreams.length})
          </h2>
        </div>

        {filteredStreams.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No live streams found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or check back later for new streams.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStreams.slice(1).map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Streams Preview */}
      <section>
        <h2 className="text-2xl font-headline font-bold mb-4">Coming Up Next</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-20 w-full mt-3 rounded" />
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}