import { signOut, getAuth } from 'firebase/auth';
import { app } from '../config';

const auth = getAuth(app);

export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}