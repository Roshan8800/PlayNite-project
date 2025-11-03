'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { RefreshCw, TrendingUp, AlertTriangle, Play, Clock, Users } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs, getFirestore } from 'firebase/firestore';
import { app } from '../firebase/config';
import { trackVideoView } from '../firebase/analytics';

const db = getFirestore(app);

interface VideoAnalyticsData {
  views: number;
  watchTime: number;
  completionRate: number;
  errorCount: number;
  bufferingCount: number;
  qualityChanges: number;
  lastError?: {
    type: string;
    message: string;
    timestamp: Date;
  };
  playCount: number;
  lastPlayTime?: Date;
}

interface VideoAnalyticsProps {
  videoId: string;
  className?: string;
  showDetailed?: boolean;
}

export function VideoAnalytics({ videoId, className, showDetailed = false }: VideoAnalyticsProps) {
  const [analytics, setAnalytics] = useState<VideoAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch real analytics data from Firestore
      const analyticsRef = collection(db, 'analytics');
      const q = query(
        analyticsRef,
        where('videoId', '==', videoId),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map(doc => doc.data());

      // Process analytics data
      const views = events.filter(e => e.event === 'video_view').length;
      const plays = events.filter(e => e.event === 'video_play').length;
      const completions = events.filter(e => e.event === 'video_complete').length;
      const errors = events.filter(e => e.event === 'video_error').length;
      const buffering = events.filter(e => e.event === 'buffering').length;

      // Calculate watch time and completion rate
      const watchTimeEvents = events.filter(e => e.event === 'video_complete' && e.watchTime);
      const totalWatchTime = watchTimeEvents.reduce((sum, e) => sum + (e.watchTime || 0), 0);
      const avgWatchTime = watchTimeEvents.length > 0 ? totalWatchTime / watchTimeEvents.length : 0;
      const completionRate = plays > 0 ? Math.round((completions / plays) * 100) : 0;

      // Get last play time
      const lastPlayEvent = events.find(e => e.event === 'video_play');
      const lastPlayTime = lastPlayEvent ? new Date(lastPlayEvent.timestamp) : undefined;

      // Get last error
      const lastErrorEvent = events.find(e => e.event === 'video_error');
      const lastError = lastErrorEvent ? {
        type: lastErrorEvent.errorType || 'unknown',
        message: lastErrorEvent.errorMessage || 'Unknown error',
        timestamp: new Date(lastErrorEvent.timestamp)
      } : undefined;

      const analyticsData: VideoAnalyticsData = {
        views,
        watchTime: Math.round(avgWatchTime),
        completionRate,
        errorCount: errors,
        bufferingCount: buffering,
        qualityChanges: events.filter(e => e.event === 'quality_change').length,
        playCount: plays,
        lastPlayTime,
        lastError
      };

      setAnalytics(analyticsData);
      setError(null);

      // Track that analytics were viewed
      trackVideoView(videoId, 'Analytics View', 'analytics');

    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Refresh analytics every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [videoId]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getHealthStatus = (analytics: VideoAnalyticsData) => {
    const errorRate = analytics.errorCount / Math.max(analytics.views, 1);
    const bufferingRate = analytics.bufferingCount / Math.max(analytics.views, 1);

    if (errorRate > 0.1 || bufferingRate > 0.2) return 'critical';
    if (errorRate > 0.05 || bufferingRate > 0.1) return 'warning';
    return 'healthy';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Video Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Analytics Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {error || 'Unable to load analytics data'}
          </p>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const healthStatus = getHealthStatus(analytics);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Video Analytics
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={healthStatus === 'healthy' ? 'default' : healthStatus === 'warning' ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {healthStatus === 'healthy' ? 'Healthy' : healthStatus === 'warning' ? 'Warning' : 'Critical'}
            </Badge>
            <Button variant="ghost" size="sm" onClick={fetchAnalytics}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Views</span>
            </div>
            <div className="text-2xl font-bold">{analytics.views.toLocaleString()}</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Play className="h-4 w-4" />
              <span className="text-xs">Plays</span>
            </div>
            <div className="text-2xl font-bold">{analytics.playCount}</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Watch Time</span>
            </div>
            <div className="text-2xl font-bold">{formatTime(analytics.watchTime)}</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Completion</span>
            </div>
            <div className="text-2xl font-bold">{analytics.completionRate}%</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Completion Rate</span>
              <span>{analytics.completionRate}%</span>
            </div>
            <Progress value={analytics.completionRate} className="h-2" />
          </div>

          {showDetailed && (
            <>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Errors</div>
                  <div className="text-lg font-semibold text-red-600">{analytics.errorCount}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Buffering Events</div>
                  <div className="text-lg font-semibold text-yellow-600">{analytics.bufferingCount}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Quality Changes</div>
                  <div className="text-lg font-semibold">{analytics.qualityChanges}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Last Played</div>
                  <div className="text-sm font-semibold">
                    {analytics.lastPlayTime ? analytics.lastPlayTime.toLocaleDateString() : 'Never'}
                  </div>
                </div>
              </div>

              {analytics.lastError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-semibold text-red-700">Last Error</span>
                  </div>
                  <div className="text-sm text-red-600 mb-1">{analytics.lastError.message}</div>
                  <div className="text-xs text-red-500">
                    Type: {analytics.lastError.type} • {analytics.lastError.timestamp.toLocaleString()}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}