import { signInWithPopup, signInWithRedirect, getRedirectResult, getAuth } from 'firebase/auth';
import { app } from '../config';
import { googleProvider } from './providers';

const auth = getAuth(app);

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error: any) {
    // If popup is blocked, fallback to redirect
    if (error.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, googleProvider);
      return null; // Will be handled by getRedirectResult
    }
    // Log security-related errors
    if (error.code === 'auth/invalid-api-key' || error.code === 'auth/app-deleted') {
      console.error('Firebase configuration error:', error);
    }
    throw error;
  }
}

export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    throw error;
  }
}