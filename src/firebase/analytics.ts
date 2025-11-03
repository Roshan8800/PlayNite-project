import { getAnalytics, isSupported, logEvent, setUserProperties, setUserId } from 'firebase/analytics';
import { app } from './config';

let analytics: any = null;

export async function initializeAnalytics() {
  if (typeof window !== 'undefined' && await isSupported()) {
    analytics = getAnalytics(app);
    console.log('Firebase Analytics initialized');
  }
  return analytics;
}

export function getAnalyticsInstance() {
  return analytics;
}

// Custom analytics tracking functions
export function trackVideoView(videoId: string, videoTitle: string, category?: string) {
  if (analytics) {
    logEvent(analytics, 'video_view', {
      video_id: videoId,
      video_title: videoTitle,
      category: category || 'uncategorized',
      timestamp: Date.now()
    });
  }
}

export function trackVideoPlay(videoId: string, videoTitle: string) {
  if (analytics) {
    logEvent(analytics, 'video_play', {
      video_id: videoId,
      video_title: videoTitle,
      timestamp: Date.now()
    });
  }
}

export function trackVideoComplete(videoId: string, videoTitle: string, watchTime: number) {
  if (analytics) {
    logEvent(analytics, 'video_complete', {
      video_id: videoId,
      video_title: videoTitle,
      watch_time: watchTime,
      timestamp: Date.now()
    });
  }
}

export function trackSearch(query: string, resultsCount: number) {
  if (analytics) {
    logEvent(analytics, 'search', {
      search_term: query,
      results_count: resultsCount,
      timestamp: Date.now()
    });
  }
}

export function trackUserAction(action: string, details?: any) {
  if (analytics) {
    logEvent(analytics, 'user_action', {
      action: action,
      details: details,
      timestamp: Date.now()
    });
  }
}

export function setAnalyticsUser(userId: string, properties?: any) {
  if (analytics) {
    setUserId(analytics, userId);
    if (properties) {
      setUserProperties(analytics, properties);
    }
  }
}