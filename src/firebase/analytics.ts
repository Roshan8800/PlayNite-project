import { getAnalytics, isSupported } from 'firebase/analytics';
import { app } from './config';

let analytics: any = null;

export async function initializeAnalytics() {
  if (typeof window !== 'undefined' && await isSupported()) {
    analytics = getAnalytics(app);
  }
  return analytics;
}

export function getAnalyticsInstance() {
  return analytics;
}