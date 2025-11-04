import { collection, getDocs, query, orderBy, limit, startAfter, doc, where, getDoc } from 'firebase/firestore';
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
      const lastDocRef = doc(db, 'videos', lastDocId);
      const lastDoc = await getDoc(lastDocRef);
      if(lastDoc.exists()) {
        q = query(q, startAfter(lastDoc));
      }
    }

    const videosSnapshot = await getDocs(q);
    const videosList = videosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const lastVisible = videosSnapshot.docs[videosSnapshot.docs.length - 1];
    return { videos: videosList, lastDoc: lastVisible || null, hasMore: videosSnapshot.docs.length === limitCount };
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
}

export async function fetchVideosPaginated(page = 1, pageSize = 20, filters = {}) {
  try {
    // Input validation
    if (page < 1) {
      throw new Error('Page must be greater than 0');
    }
    if (pageSize < 1 || pageSize > 100) {
      throw new Error('Page size must be between 1 and 100');
    }

    const offset = (page - 1) * pageSize;
    let constraints = [];

    // Apply filters
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }

    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }

    if (filters.categories && filters.categories.length > 0) {
      constraints.push(where('categories', 'array-contains-any', filters.categories));
    }

    if (filters.tags && filters.tags.length > 0) {
      constraints.push(where('tags', 'array-contains-any', filters.tags));
    }

    if (filters.pornstars && filters.pornstars.length > 0) {
      constraints.push(where('pornstars', 'array-contains-any', filters.pornstars));
    }

    if (filters.ageRestriction !== undefined) {
      constraints.push(where('ageRestriction', '<=', filters.ageRestriction));
    }

    if (filters.uploadedAfter) {
      constraints.push(where('uploadedAt', '>=', filters.uploadedAfter));
    }

    if (filters.uploadedBefore) {
      constraints.push(where('uploadedBefore', '<=', filters.uploadedBefore));
    }

    if (filters.minViews !== undefined) {
      constraints.push(where('views', '>=', filters.minViews));
    }

    if (filters.maxViews !== undefined) {
      constraints.push(where('views', '<=', filters.maxViews));
    }

    if (filters.minDuration !== undefined) {
      constraints.push(where('duration', '>=', filters.minDuration));
    }

    if (filters.maxDuration !== undefined) {
      constraints.push(where('duration', '<=', filters.maxDuration));
    }

    // Build base query
    let baseQuery = query(collection(db, 'videos'), ...constraints);

    // Apply sorting
    const sortBy = filters.sortBy || 'uploadedAt';
    const sortOrder = filters.sortOrder === 'asc' ? 'asc' : 'desc';

    if (sortBy === 'views') {
      baseQuery = query(baseQuery, orderBy('views', sortOrder), orderBy('__name__'));
    } else if (sortBy === 'rating') {
      baseQuery = query(baseQuery, orderBy('rating', sortOrder), orderBy('__name__'));
    } else {
      baseQuery = query(baseQuery, orderBy('uploadedAt', sortOrder), orderBy('__name__'));
    }

    // Get all documents matching filters (for server-side filtering and accurate total)
    const totalSnapshot = await getDocs(baseQuery);
    let videosList = totalSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply server-side text search filtering
    if (filters.query) {
      const queryLower = filters.query.toLowerCase();
      videosList = videosList.filter(video =>
        video.title?.toLowerCase().includes(queryLower) ||
        video.description?.toLowerCase().includes(queryLower) ||
        video.tags?.some(tag => tag.toLowerCase().includes(queryLower))
      );
    }

    const totalItems = videosList.length;

    // Apply pagination to the filtered list
    const startIndex = offset;
    const endIndex = startIndex + pageSize;
    const paginatedVideos = videosList.slice(startIndex, endIndex);

    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      videos: paginatedVideos,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      }
    };
  } catch (error) {
    console.error('Error fetching paginated videos:', error);
    throw error;
  }
}
