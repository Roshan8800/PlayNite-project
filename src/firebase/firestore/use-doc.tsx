'use client';

import {
  useDocument as useFirebaseDocument,
  useDocumentData as useFirebaseDocumentData,
} from 'react-firebase-hooks/firestore';
import type { DocumentReference, DocumentData } from 'firebase/firestore';
import { useMemo } from 'react';

export function useDoc<T extends DocumentData>(
  docRef: DocumentReference<T> | undefined | null
) {
  const [snapshot, loading, error] = useFirebaseDocument(docRef);
  const data = useMemo(() => {
    if (!snapshot || !snapshot.exists()) return undefined;
    return { ...snapshot.data(), id: snapshot.id };
  }, [snapshot]);
  return { data, loading, error, snapshot };
}

export function useDocData<T extends DocumentData>(
  docRef: DocumentReference<T> | undefined | null
) {
  const [data, loading, error, snapshot] = useFirebaseDocumentData(docRef);
  return { data, loading, error, snapshot };
}
