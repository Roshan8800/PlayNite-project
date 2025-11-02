import { collection, getDocs, query, orderBy, limit, startAfter, doc } from 'firebase/firestore';
import { db } from '../firebase/config.js'; // Import db from the JS config

export async function fetchVideos(limitCount = 20, lastDocId = null) {
  try {
    // Input validation
    if (limitCount < 1 || limitCount > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    let q = query(collection(db, 'videos'), orderBy('__name__'), limit(limitCount));
    if (lastDocId) {
      if (typeof lastDocId !== 'string' || lastDocId.trim() === '') {
        throw new Error('Invalid lastDocId provided');
      }
      const lastDoc = doc(db, 'videos', lastDocId);
      q = query(q, startAfter(lastDoc));
    }

    const videosSnapshot = await getDocs(q);
    const videosList = videosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const lastDoc = videosSnapshot.docs[videosSnapshot.docs.length - 1];
    return { videos: videosList, lastDoc: lastDoc || null, hasMore: videosSnapshot.docs.length === limitCount };
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
}