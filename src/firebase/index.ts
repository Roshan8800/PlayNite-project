'use client';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { app } from './config';
import { useMemo } from 'react';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import { getPerformance } from 'firebase/performance';
import { initializeAnalytics } from './analytics';
export * from './provider';
export * from './auth/use-user';
export * from './auth/providers';
export * from './auth/signin';
export * from './auth/signout';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './storage';
export * from './analytics';

export type FirebaseInstances = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

// Initializes and returns Firebase services.
// This function can be used to initialize Firebase on the server or client.
export function initializeFirebase(): FirebaseInstances {
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  if (typeof window !== 'undefined') {
    getPerformance(app);
    // Initialize analytics if supported
    initializeAnalytics();
  }
  return { firebaseApp: app, auth, firestore };
}

// A hook to get the Firebase services.
// This hook should be used in client components.
export function useFirebase() {
  return useMemo(() => initializeFirebase(), []);
}
