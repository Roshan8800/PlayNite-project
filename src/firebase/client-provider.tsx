'use client';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { FirebaseProvider, type FirebaseProviderProps } from '@/firebase/provider';
import { initializeFirebase } from '.';
import { useMemo } from 'react';

// You can use this provider to ensure that Firebase is initialized once on the client.
// It is recommended to use this provider at the root of your layout.
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const firebaseContext = useMemo(() => {
    const { firebaseApp, auth, firestore } = initializeFirebase();
    return { firebaseApp, auth, firestore, children };
  }, [children]);

  return <FirebaseProvider {...firebaseContext} />;
}
