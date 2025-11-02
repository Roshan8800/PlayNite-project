'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { contentRecommendationEngine } from '@/ai/flows/content-recommendation-engine';
import { Sparkles, TrendingUp, Clock, Heart, Users, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Video } from '@/lib/types';

// Dynamic imports for performance
const VideoCard = dynamic(() => import('@/components/video-card').then(mod => ({ default: mod.VideoCard })), {
  loading: () => <Skeleton className="h-40 w-full" />,
  ssr: false,
});
import { Skeleton } from '@/components/ui/skeleton';

export default function RecommendationsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [recommendations, setRecommendations] = useState<{
    personalized: Video[];
    trending: Video[];
    moodBased: Video[];
    collaborative: Video[];
    timeBased: Video[];
  }>({
    personalized: [],
    trending: [],
    moodBased: [],
    collaborative: [],
    timeBased: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState('happy');
  const [timeOfDay, setTimeOfDay] = useState('morning');

  const moods = [
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'excited', label: 'Excited', emoji: '🤩' },
    { value: 'relaxed', label: 'Relaxed', emoji: '😌' },
    { value: 'adventurous', label: 'Adventurous', emoji: '🗺️' },
    { value: 'inspired', label: 'Inspired', emoji: '💡' },
    { value: 'nostalgic', label: 'Nostalgic', emoji: '📼' },
  ];

  const timeSlots = [
    { value: 'morning', label: 'Morning', icon: '🌅' },
    { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
    { value: 'evening', label: 'Evening', icon: '🌙' },
    { value: 'night', label: 'Night', icon: '🌃' },
  ];

  useEffect(() => {
    loadRecommendations();
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Get user's viewing history
      const historyQuery = query(
        collection(firestore, 'users', user.uid, 'history'),
        orderBy('watchedAt', 'desc'),
        limit(50)
      );
      const historySnapshot = await getDocs(historyQuery);
      const historyIds = historySnapshot.docs.map(doc => doc.id);

      // Get user's liked videos
      const likedQuery = query(
        collection(firestore, 'users', user.uid, 'likes'),
        limit(20)
      );
      const likedSnapshot = await getDocs(likedQuery);
      const likedIds = likedSnapshot.docs.map(doc => doc.id);

      // Personalized recommendations
      if (historyIds.length > 0) {
        const personalizedResult = await contentRecommendationEngine({
          viewingHistory: historyIds,
          userPreferences: 'adult video content, entertainment'
        });

        const personalizedPromises = personalizedResult.recommendedVideos
          .slice(0, 12)
          .map(videoId => getDocs(query(collection(firestore, 'videos'), where('__name__', '==', videoId))));
        const personalizedDocs = await Promise.all(personalizedPromises);
        const personalizedVideos = personalizedDocs
          .flatMap(snapshot => snapshot.docs)
          .map(doc => ({ id: doc.id, ...doc.data() })) as Video[];

        setRecommendations(prev => ({ ...prev, personalized: personalizedVideos }));
      }

      // Trending videos
      const trendingQuery = query(
        collection(firestore, 'videos'),
        where('status', '==', 'Approved'),
        orderBy('views', 'desc'),
        limit(12)
      );
      const trendingSnapshot = await getDocs(trendingQuery);
      const trendingVideos = trendingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Video[];
      setRecommendations(prev => ({ ...prev, trending: trendingVideos }));

      // Mood-based recommendations
      await loadMoodBasedRecommendations();

      // Collaborative filtering
      if (likedIds.length > 0) {
        // Simple collaborative filtering - find videos liked by users who liked similar content
        const collaborativeQuery = query(
          collection(firestore, 'videos'),
          where('status', '==', 'Approved'),
          where('category', 'in', ['Entertainment', 'Music', 'Comedy']),
          orderBy('views', 'desc'),
          limit(12)
        );
        const collaborativeSnapshot = await getDocs(collaborativeQuery);
        const collaborativeVideos = collaborativeSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((video: any) => !likedIds.includes(video.id)) as Video[];

        setRecommendations(prev => ({ ...prev, collaborative: collaborativeVideos }));
      }

      // Time-based recommendations
      await loadTimeBasedRecommendations();

    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoodBasedRecommendations = async () => {
    try {
      const moodCategories = {
        happy: ['Comedy', 'Music', 'Entertainment'],
        excited: ['Sports', 'Gaming', 'Action'],
        relaxed: ['Documentary', 'Nature', 'Music'],
        adventurous: ['Travel', 'Adventure', 'Sports'],
        inspired: ['Educational', 'Documentary', 'Technology'],
        nostalgic: ['Classic', 'Retro', 'Music'],
      };

      const categories = moodCategories[selectedMood as keyof typeof moodCategories] || ['Entertainment'];
      const moodQuery = query(
        collection(firestore, 'videos'),
        where('status', '==', 'Approved'),
        where('category', 'in', categories.slice(0, 10)), // Firestore 'in' limit
        orderBy('views', 'desc'),
        limit(12)
      );

      const moodSnapshot = await getDocs(moodQuery);
      const moodVideos = moodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Video[];
      setRecommendations(prev => ({ ...prev, moodBased: moodVideos }));
    } catch (error) {
      console.error('Error loading mood-based recommendations:', error);
    }
  };

  const loadTimeBasedRecommendations = async () => {
    try {
      const timeCategories = {
        morning: ['Educational', 'News', 'Documentary'],
        afternoon: ['Entertainment', 'Music', 'Comedy'],
        evening: ['Drama', 'Movies', 'Series'],
        night: ['Horror', 'Thriller', 'Mystery'],
      };

      const categories = timeCategories[timeOfDay as keyof typeof timeCategories] || ['Entertainment'];
      const timeQuery = query(
        collection(firestore, 'videos'),
        where('status', '==', 'Approved'),
        where('category', 'in', categories.slice(0, 10)),
        orderBy('views', 'desc'),
        limit(12)
      );

      const timeSnapshot = await getDocs(timeQuery);
      const timeVideos = timeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Video[];
      setRecommendations(prev => ({ ...prev, timeBased: timeVideos }));
    } catch (error) {
      console.error('Error loading time-based recommendations:', error);
    }
  };

  useEffect(() => {
    loadMoodBasedRecommendations();
  }, [selectedMood]);

  useEffect(() => {
    loadTimeBasedRecommendations();
  }, [timeOfDay]);

  const renderVideoGrid = (videos: Video[], loading: boolean) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {loading ? (
        Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))
      ) : (
        videos.map((video, index) => (
          <div key={video.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
            <VideoCard video={video} />
          </div>
        ))
      )}
    </div>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p className="text-muted-foreground">Sign in to get personalized recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Recommendations</h1>
          <p className="text-muted-foreground mt-1">
            Discover videos tailored just for you.
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI-Powered
        </Badge>
      </div>

      <Tabs defaultValue="personalized" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personalized" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            For You
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="mood" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Mood-Based
          </TabsTrigger>
          <TabsTrigger value="collaborative" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Similar Users
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time-Based
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personalized" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Personalized For You
              </CardTitle>
              <CardDescription>
                Videos recommended based on your viewing history and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderVideoGrid(recommendations.personalized, loading)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                Trending Now
              </CardTitle>
              <CardDescription>
                The most popular videos across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderVideoGrid(recommendations.trending, loading)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mood" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    Mood-Based Recommendations
                  </CardTitle>
                  <CardDescription>
                    Videos that match your current mood.
                  </CardDescription>
                </div>
                <Select value={selectedMood} onValueChange={setSelectedMood}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moods.map(mood => (
                      <SelectItem key={mood.value} value={mood.value}>
                        {mood.emoji} {mood.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {renderVideoGrid(recommendations.moodBased, loading)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaborative" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Similar Users Also Liked
              </CardTitle>
              <CardDescription>
                Videos enjoyed by users with similar tastes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderVideoGrid(recommendations.collaborative, loading)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-500" />
                    Perfect for This Time
                  </CardTitle>
                  <CardDescription>
                    Videos recommended based on the time of day.
                  </CardDescription>
                </div>
                <Select value={timeOfDay} onValueChange={setTimeOfDay}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(slot => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.icon} {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {renderVideoGrid(recommendations.timeBased, loading)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}