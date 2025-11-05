# 5. Firebase Integration and Data Models

## Firebase Configuration

### Environment Setup

#### Client-side Configuration (`src/firebase/config.ts`)
```typescript
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
```

#### Server-side Configuration (`src/firebase/admin.ts`)
```typescript
import * as admin from 'firebase-admin';

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}
```

## Firestore Database Schema

### Core Collections

#### Users Collection
```typescript
interface User {
  uid: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: 'Admin' | 'User';
  joinedDate: string;
  status?: 'Active' | 'Inactive';
  pushNotificationsEnabled?: boolean;
  parentalControlsEnabled?: boolean;
  ageRestriction?: number;
  playbackSettings?: {
    autoplay: boolean;
    quality: string;
    volume: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Subcollections
users/{userId}/history: WatchHistory[]
users/{userId}/likes: LikedVideo[]
users/{userId}/watchLater: WatchLaterVideo[]
users/{userId}/playlists: Playlist[]
users/{userId}/devices: Device[]
```

#### Videos Collection
```typescript
interface Video {
  id: string;
  title: string;
  channel?: string;
  channelId?: string;
  views: number;
  uploadedAt?: string;
  thumbnailUrl: string;
  thumbnailHint?: string;
  duration: string;
  description?: string;
  channelAvatarUrl?: string;
  videoUrl: string;
  category?: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
  tags?: string[];
  summary?: string;
  addedAt?: string;
  ageRestriction?: number;
  pornstars?: string;
  rating?: number;
  likes?: number;
  dislikes?: number;
  categories?: string[];
  thumbnail_urls?: string[];
  screenshots?: string[];
  iframe_code?: string;
  embed_code?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Subcollections
videos/{videoId}/comments: Comment[]
videos/{videoId}/analytics: VideoAnalytics[]
```

#### Categories Collection
```typescript
interface Category {
  id: string;
  name: string;
  thumbnailUrl: string;
  thumbnailHint?: string;
  description?: string;
  videoCount: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Supporting Collections

#### Comments Collection
```typescript
interface Comment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  dislikes: number;
  replies: number;
  parentId?: string; // For nested replies
  isEdited: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Playlists Collection
```typescript
interface Playlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  videoCount: number;
  totalDuration: string;
  tags?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Subcollections
playlists/{playlistId}/videos: PlaylistVideo[]
```

#### Reports Collection
```typescript
interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  contentType: 'video' | 'comment' | 'user';
  contentId: string;
  reason: 'inappropriate' | 'copyright' | 'spam' | 'harassment' | 'other';
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  assignedTo?: string;
  resolution?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Analytics Collection
```typescript
interface AnalyticsEvent {
  id: string;
  userId?: string;
  eventType: string;
  eventData: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  timestamp: Timestamp;
}
```

## Firebase Authentication

### Authentication Providers

#### Email/Password Authentication
```typescript
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword
} from 'firebase/auth';

// User registration
const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new AuthenticationError('Registration failed', error);
  }
};
```

#### Social Authentication
```typescript
import { 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Sign in with Google
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    throw new AuthenticationError('Google sign-in failed', error);
  }
};
```

### User Management Hooks

#### useUser Hook (`src/firebase/auth/use-user.tsx`)
```typescript
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/client-provider';

export function useUser() {
  const [user, loading, error] = useAuthState(auth);
  
  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
  };
}
```

### Authentication Middleware
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/protected')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}
```

## Firestore Integration

### Custom Hooks for Data Fetching

#### useCollection Hook (`src/firebase/firestore/use-collection.tsx`)
```typescript
import { useCollection as useFirestoreCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';
import { firestore } from '@/firebase/client-provider';

export function useCollection<T>(
  collectionName: string,
  options: {
    limit?: number;
    orderBy?: [string, 'asc' | 'desc'];
    where?: [string, any, any];
  } = {}
) {
  const { limit: limitCount, orderBy: orderOptions, where: whereClause } = options;
  
  let q = collection(firestore, collectionName);
  
  if (whereClause) {
    q = query(q, where(...whereClause));
  }
  
  if (orderOptions) {
    q = query(q, orderBy(...orderOptions));
  }
  
  if (limitCount) {
    q = query(q, limit(limitCount));
  }
  
  const [snapshot, loading, error] = useFirestoreCollection(q);
  
  return {
    data: snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[] || [],
    loading,
    error
  };
}
```

#### useDocument Hook (`src/firebase/firestore/use-doc.tsx`)
```typescript
import { useDocument as useFirestoreDocument } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { firestore } from '@/firebase/client-provider';

export function useDocument<T>(collectionName: string, documentId: string) {
  const [snapshot, loading, error] = useFirestoreDocument(
    doc(firestore, collectionName, documentId)
  );
  
  return {
    data: snapshot?.exists() ? { id: snapshot.id, ...snapshot.data() } as T : null,
    loading,
    error,
    exists: snapshot?.exists() || false
  };
}
```

### Data Operations

#### CRUD Operations
```typescript
import { 
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  collection,
  serverTimestamp
} from 'firebase/firestore';

// Create document
const createVideo = async (videoData: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(firestore, 'videos'), {
    ...videoData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

// Update document
const updateVideo = async (videoId: string, updates: Partial<Video>) => {
  const docRef = doc(firestore, 'videos', videoId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

// Delete document
const deleteVideo = async (videoId: string) => {
  await deleteDoc(doc(firestore, 'videos', videoId));
};
```

#### Real-time Subscriptions
```typescript
import { onSnapshot } from 'firebase/firestore';

// Real-time video updates
const unsubscribe = onSnapshot(
  collection(firestore, 'videos'),
  (snapshot) => {
    const videos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setVideos(videos);
  },
  (error) => {
    console.error('Error listening to videos:', error);
  }
);

// Cleanup subscription
return () => unsubscribe();
```

## Firebase Storage

### File Upload Management
```typescript
import { 
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

// Upload file
const uploadFile = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

// Delete file
const deleteFile = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};
```

### Storage Security Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User avatars
    match /avatars/{userId}/{fileName} {
      allow read;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Video thumbnails
    match /thumbnails/{videoId}/{fileName} {
      allow read;
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    // Video files
    match /videos/{videoId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

## Security Rules

### Firestore Security Rules (`firestore.rules`)

#### Authentication Helpers
```javascript
function isAuthenticated() {
  return request.auth != null;
}

function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}

function isAdmin() {
  return isAuthenticated() && 
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
}
```

#### Collection Rules
```javascript
// Users collection
match /users/{userId} {
  allow read: if true;
  allow write: if isOwner(userId) || isAdmin();
  allow update: if isOwner(userId) || isAdmin();
}

// Videos collection
match /videos/{videoId} {
  allow read: if resource.data.status == 'Approved' || isAdmin();
  allow create: if isAuthenticated();
  allow update: if isOwner(resource.data.channelId) || isAdmin();
  allow delete: if isAdmin();
}

// Comments subcollection
match /videos/{videoId}/comments/{commentId} {
  allow read: if true;
  allow create: if isAuthenticated();
  allow update: if isOwner(resource.data.userId);
  allow delete: if isOwner(resource.data.userId) || isAdmin();
}
```

## Firebase Cloud Functions

### Server-side Processing
```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const onVideoUpload = functions.firestore
  .document('videos/{videoId}')
  .onCreate(async (snap, context) => {
    const videoData = snap.data();
    
    // Generate AI summary
    const summary = await generateVideoSummary(videoData);
    
    // Generate tags
    const tags = await generateVideoTags(videoData);
    
    // Update document
    await snap.ref.update({
      summary,
      tags,
      processedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
```

## Performance Optimization

### Indexing Strategy
```javascript
// Firestore indexes
{
  "indexes": [
    {
      "collectionGroup": "videos",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "videos",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "category",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "views",
          "order": "DESCENDING"
        }
      ]
    }
  ]
}
```

### Caching Strategy
```typescript
// Client-side caching with React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query with caching
const useVideos = (category?: string) => {
  return useQuery({
    queryKey: ['videos', category],
    queryFn: () => fetchVideos(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

## Monitoring and Analytics

### Firebase Analytics Integration
```typescript
import { getAnalytics, logEvent } from 'firebase/analytics';

// Initialize analytics
const analytics = getAnalytics(app);

// Track video views
const trackVideoView = (videoId: string, videoTitle: string) => {
  logEvent(analytics, 'video_view', {
    video_id: videoId,
    video_title: videoTitle,
    timestamp: Date.now()
  });
};

// Track user engagement
const trackUserEngagement = (action: string, details?: any) => {
  logEvent(analytics, 'user_engagement', {
    action,
    ...details,
    timestamp: Date.now()
  });
};
```

### Error Monitoring
```typescript
import { logError } from '@/lib/error-logger';

// Firebase error logging
const logFirebaseError = (error: any, context: string) => {
  logError({
    type: ErrorType.FIRESTORE_ERROR,
    message: error.message,
    context: { operation: context, error },
    severity: ErrorSeverity.ERROR
  });
};
```

## Deployment Configuration

### Firebase Hosting Configuration (`firebase.json`)
```json
{
  "hosting": {
    "public": ".next/static",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.css",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

### Environment Variables
```bash
# Client-side (NEXT_PUBLIC_*)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Server-side
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_PROJECT_ID=your_project_id