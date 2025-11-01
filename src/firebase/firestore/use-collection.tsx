'use client';
import {
  useCollection as useFirebaseCollection,
  useCollectionData as useFirebaseCollectionData,
} from 'react-firebase-hooks/firestore';
import type {
  CollectionReference,
  DocumentData,
  Query,
} from 'firebase/firestore';
import { useMemo } from 'react';

export function useCollection<T extends DocumentData>(
  query: CollectionReference<T> | Query<T> | undefined | null
) {
  const [snapshot, loading, error] = useFirebaseCollection(query);
  const data = useMemo(
    () => snapshot?.docs.map((doc) => ({ ...doc.data(), id: doc.id })),
    [snapshot]
  );
  return { data, loading, error, snapshot };
}

export function useCollectionData<T extends DocumentData>(
  query: CollectionReference<T> | Query<T> | undefined | null
) {
  const [data, loading, error, snapshot] = useFirebaseCollectionData(query);
  return { data, loading, error, snapshot };
}
