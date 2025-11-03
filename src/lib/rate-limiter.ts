import { collection, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { app } from '../firebase/config';

const db = getFirestore(app);

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
}

const rateLimits: Record<string, RateLimitConfig> = {
  create_video: { maxRequests: 5, windowMs: 3600000 }, // 5 videos per hour
  update_video: { maxRequests: 20, windowMs: 3600000 }, // 20 updates per hour
  create_report: { maxRequests: 3, windowMs: 3600000 }, // 3 reports per hour
  user_action: { maxRequests: 100, windowMs: 60000 }, // 100 actions per minute
};

export async function checkRateLimit(userId: string, action: string): Promise<boolean> {
  const config = rateLimits[action];
  if (!config) return true; // No rate limit for this action

  const rateLimitRef = doc(db, 'rate_limits', `${userId}_${action}`);
  const now = Date.now();

  try {
    const docSnap = await getDoc(rateLimitRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const resetTime = data.resetTime?.toMillis() || 0;

      if (now > resetTime) {
        // Reset the counter
        await setDoc(rateLimitRef, {
          count: 1,
          resetTime: serverTimestamp(),
          windowMs: config.windowMs
        });
        return true;
      } else if (data.count >= config.maxRequests) {
        return false; // Rate limit exceeded
      } else {
        // Increment counter
        await updateDoc(rateLimitRef, {
          count: data.count + 1
        });
        return true;
      }
    } else {
      // First request for this action
      await setDoc(rateLimitRef, {
        count: 1,
        resetTime: serverTimestamp(),
        windowMs: config.windowMs
      });
      return true;
    }
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // Allow request on error to avoid blocking legitimate users
  }
}

export async function recordRateLimitViolation(userId: string, action: string) {
  try {
    const violationRef = doc(collection(db, 'rate_limit_violations'));
    await setDoc(violationRef, {
      userId,
      action,
      timestamp: serverTimestamp(),
      ip: '', // Would need to be set from middleware
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : ''
    });
  } catch (error) {
    console.error('Failed to record rate limit violation:', error);
  }
}