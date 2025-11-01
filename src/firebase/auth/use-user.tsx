'use client';
import { type User as FirebaseAuthUser } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useAuth, useFirestore } from '..';
import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { type User as AppUser } from '@/lib/types';
import { useMemo } from 'react';

export type UseUserHook = {
  user: AppUser | null | undefined;
  firebaseUser: FirebaseAuthUser | null | undefined;
  loading: boolean;
  error: any;
};

export function useUser(): UseUserHook {
  const auth = useAuth();
  const firestore = useFirestore();
  const [firebaseUser, loading, error] = useAuthState(auth);

  const userDocRef = useMemo(
    () => (firebaseUser ? doc(firestore, 'users', firebaseUser.uid) : undefined),
    [firestore, firebaseUser]
  );

  const [userData, userLoading, userError] = useDocumentData(userDocRef);

  const user = useMemo(() => {
    if (loading || userLoading || !firebaseUser || !userData) {
      return undefined;
    }
    return userData as AppUser;
  }, [firebaseUser, userData, loading, userLoading]);

  return {
    user: user,
    firebaseUser,
    loading: loading || userLoading,
    error: error || userError,
  };
}
