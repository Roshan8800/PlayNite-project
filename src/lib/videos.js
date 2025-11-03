import { collection, getDocs, query, orderBy, limit, startAfter, doc, where } from 'firebase/firestore';
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

    // Get total count for pagination info
    const totalSnapshot = await getDocs(baseQuery);
    const totalItems = totalSnapshot.size;

    // Apply pagination
    let paginatedQuery = query(baseQuery, limit(pageSize));

    // For offset-based pagination, we need to skip documents
    // This is inefficient for large offsets, but Firestore doesn't support OFFSET directly
    if (offset > 0) {
      // Get all documents up to the offset, then start after the last one
      const offsetQuery = query(baseQuery, limit(offset));
      const offsetSnapshot = await getDocs(offsetQuery);

      if (offsetSnapshot.docs.length === offset) {
        const lastOffsetDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
        paginatedQuery = query(baseQuery, startAfter(lastOffsetDoc), limit(pageSize));
      } else {
        // Not enough documents, return empty result
        return {
          videos: [],
          pagination: {
            currentPage: page,
            pageSize,
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize),
            hasNextPage: false,
            hasPreviousPage: page > 1,
          }
        };
      }
    }

    const videosSnapshot = await getDocs(paginatedQuery);
    const videosList = videosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      videos: videosList,
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