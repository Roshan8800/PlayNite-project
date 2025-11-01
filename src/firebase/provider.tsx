'use client';

import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import React, { type ReactNode, useContext } from 'react';

// The context to provided by the FirebaseProvider
export interface FirebaseContextValue {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

// The props for the FirebaseProvider
export interface FirebaseProviderProps extends FirebaseContextValue {
  children: ReactNode;
}

// The React context for the Firebase app
export const FirebaseContext = React.createContext<FirebaseContextValue | undefined>(undefined);

// The provider component for the Firebase app
export function FirebaseProvider({
  children,
  firebaseApp,
  auth,
  firestore,
}: FirebaseProviderProps) {
  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth, firestore }}>
      {children}
      <FirebaseErrorListener />
    </FirebaseContext.Provider>
  );
}

// Hook to get the Firebase app object
export function useFirebaseApp() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return context.firebaseApp;
}

// Hook to get the Firebase Auth object
export function useAuth() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context.auth;
}

// Hook to get the Firestore object
export function useFirestore() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return context.firestore;
}
