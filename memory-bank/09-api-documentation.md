# 9. API Documentation

## Next.js API Routes

### API Route Structure

All API routes are located in `src/app/api/` and follow the Next.js App Router conventions:

```
src/app/api/
├── videos/
│   ├── route.ts              # GET /api/videos, POST /api/videos
│   ├── [id]/
│   │   └── route.ts          # GET /api/videos/[id], PUT /api/videos/[id], DELETE /api/videos/[id]
│   └── search/
│       └── route.ts          # GET /api/videos/search
├── users/
│   ├── route.ts              # GET /api/users
│   ├── [id]/
│   │   └── route.ts          # GET /api/users/[id], PUT /api/users/[id]
│   └── profile/
│       └── route.ts          # GET /api/users/profile, PUT /api/users/profile
├── auth/
│   ├── login/
│   │   └── route.ts          # POST /api/auth/login
│   ├── logout/
│   │   └── route.ts          # POST /api/auth/logout
│   └── refresh/
│       └── route.ts          # POST /api/auth/refresh
└── analytics/
    └── events/
        └── route.ts          # POST /api/analytics/events
```

## Authentication Endpoints

### POST /api/auth/login

Authenticate a user with email and password.

**Request Body:**
```typescript
{
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

**Response:**
```typescript
{
  success: boolean;
  user?: {
    uid: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
    role: 'Admin' | 'User';
  };
  token?: string;
  error?: string;
}
```

**Error Codes:**
- `400`: Invalid request body
- `401`: Invalid credentials
- `429`: Too many login attempts
- `500`: Internal server error

### POST /api/auth/logout

Log out the current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
}
```

### POST /api/auth/refresh

Refresh the authentication token.

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response:**
```typescript
{
  success: boolean;
  token?: string;
  refreshToken?: string;
  error?: string;
}
```

## Video Management Endpoints

### GET /api/videos

Retrieve a paginated list of videos.

**Query Parameters:**
```typescript
{
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, Max: 100
  category?: string;    // Filter by category
  search?: string;      // Search query
  sortBy?: 'views' | 'likes' | 'uploadedAt' | 'title';
  sortOrder?: 'asc' | 'desc'; // Default: 'desc'
  status?: 'Pending' | 'Approved' | 'Rejected'; // Admin only
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    videos: Video[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
}
```

### POST /api/videos

Create a new video (authenticated users only).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```typescript
{
  title: string;           // Required, 1-100 characters
  description: string;     // Required, max 1000 characters
  videoUrl: string;        // Required, valid URL
  thumbnailUrl: string;    // Required, valid URL
  category: string;        // Required
  tags?: string[];         // Optional, max 10 tags
  ageRestriction?: number; // Optional, 0-21
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    video: Video;
    message: string;
  };
  error?: string;
}
```

### GET /api/videos/[id]

Retrieve a specific video by ID.

**Path Parameters:**
- `id`: Video ID (string)

**Response:**
```typescript
{
  success: boolean;
  data?: {
    video: Video & {
      comments: Comment[];
      relatedVideos: Video[];
    };
  };
  error?: string;
}
```

### PUT /api/videos/[id]

Update a video (owner or admin only).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```typescript
{
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  ageRestriction?: number;
  status?: 'Pending' | 'Approved' | 'Rejected'; // Admin only
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    video: Video;
    message: string;
  };
  error?: string;
}
```

### DELETE /api/videos/[id]

Delete a video (owner or admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
}
```

### GET /api/videos/search

Search videos with advanced filtering.

**Query Parameters:**
```typescript
{
  q: string;              // Search query (required)
  category?: string;      // Filter by category
  duration?: 'short' | 'medium' | 'long'; // <5min, 5-20min, >20min
  uploaded?: 'hour' | 'day' | 'week' | 'month' | 'year';
  sortBy?: 'relevance' | 'views' | 'likes' | 'uploadedAt';
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    videos: Video[];
    suggestions: string[];  // Search suggestions
    total: number;
    searchTime: number;     // Search execution time in ms
  };
  error?: string;
}
```

## User Management Endpoints

### GET /api/users

Retrieve users (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;      // Search by name or email
  role?: 'Admin' | 'User';
  status?: 'Active' | 'Inactive';
  sortBy?: 'name' | 'email' | 'joinedDate';
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}
```

### GET /api/users/[id]

Retrieve a specific user profile.

**Path Parameters:**
- `id`: User ID (string)

**Response:**
```typescript
{
  success: boolean;
  data?: {
    user: User & {
      stats: {
        totalVideos: number;
        totalViews: number;
        totalLikes: number;
        joinedDate: string;
      };
      videos: Video[]; // Recent videos
    };
  };
  error?: string;
}
```

### PUT /api/users/[id]

Update user profile (owner or admin only).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```typescript
{
  name?: string;
  avatarUrl?: string;
  parentalControlsEnabled?: boolean;
  ageRestriction?: number;
  playbackSettings?: {
    autoplay: boolean;
    quality: string;
    volume: number;
  };
}
```

### GET /api/users/profile

Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    user: User & {
      preferences: UserPreferences;
      stats: UserStats;
    };
  };
  error?: string;
}
```

### PUT /api/users/profile

Update current user profile.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```typescript
{
  name?: string;
  avatarUrl?: string;
  preferences?: UserPreferences;
}
```

## Analytics Endpoints

### POST /api/analytics/events

Track user events and analytics data.

**Headers:**
```
Authorization: Bearer <token> (optional)
Content-Type: application/json
```

**Request Body:**
```typescript
{
  eventType: string;     // e.g., 'video_view', 'search', 'like'
  eventData: {
    videoId?: string;
    searchQuery?: string;
    category?: string;
    duration?: number;   // Event duration in seconds
    metadata?: Record<string, any>;
  };
  timestamp?: number;    // Unix timestamp (auto-generated if not provided)
  sessionId?: string;    // User session identifier
}
```

**Response:**
```typescript
{
  success: boolean;
  eventId?: string;
  message?: string;
  error?: string;
}
```

### GET /api/analytics/dashboard

Get analytics dashboard data (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
```typescript
{
  period?: 'day' | 'week' | 'month' | 'year'; // Default: 'month'
  startDate?: string;    // ISO date string
  endDate?: string;      // ISO date string
  metrics?: string[];    // Specific metrics to include
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    overview: {
      totalUsers: number;
      totalVideos: number;
      totalViews: number;
      totalWatchTime: number;
    };
    trends: {
      users: TimeSeriesData[];
      videos: TimeSeriesData[];
      views: TimeSeriesData[];
    };
    topContent: {
      videos: Video[];
      categories: Category[];
      channels: Channel[];
    };
    performance: {
      avgLoadTime: number;
      errorRate: number;
      bounceRate: number;
    };
  };
  error?: string;
}
```

## Error Handling

### Standard Error Response Format

All API endpoints return errors in a consistent format:

```typescript
{
  success: false;
  error: string;        // Human-readable error message
  code?: string;        // Error code for programmatic handling
  details?: any;        // Additional error details
  timestamp: string;    // ISO timestamp of error
}
```

### Common Error Codes

```typescript
enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}
```

## Rate Limiting

### Rate Limit Headers

All API responses include rate limiting headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 3600
```

### Rate Limit Rules

- **Authenticated Users**: 1000 requests per hour
- **Anonymous Users**: 100 requests per hour
- **Video Upload**: 10 uploads per hour per user
- **Search**: 500 searches per hour per user
- **Admin Endpoints**: 5000 requests per hour

## CORS Configuration

### Allowed Origins

```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:9002',
  'https://playnite.vercel.app',
  'https://playnite.com',
  // Add production domains
];
```

### CORS Headers

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Max-Age: 86400
```

## Request/Response Middleware

### Request Logging Middleware

```typescript
// src/middleware/request-logger.ts
import { NextRequest, NextResponse } from 'next/server';

export function requestLogger(request: NextRequest) {
  const startTime = Date.now();
  const { method, url, headers } = request;
  
  console.log(`[${new Date().toISOString()}] ${method} ${url}`, {
    userAgent: headers.get('user-agent'),
    ip: request.ip,
    timestamp: startTime,
  });

  // Add request ID for tracking
  const requestId = crypto.randomUUID();
  headers.set('X-Request-ID', requestId);
  
  return NextResponse.next({
    headers: {
      'X-Request-ID': requestId,
    },
  });
}
```

### Response Compression Middleware

```typescript
// src/middleware/compression.ts
import { NextRequest, NextResponse } from 'next/server';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

export async function compressionMiddleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Check if client accepts gzip
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  
  if (acceptEncoding.includes('gzip')) {
    const originalBody = await response.text();
    const compressedBody = await gzipAsync(originalBody);
    
    return new NextResponse(compressedBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        'Content-Encoding': 'gzip',
        'Content-Length': compressedBody.length.toString(),
      },
    });
  }
  
  return response;
}
```

## API Testing

### Test Utilities

```typescript
// src/__tests__/utils/api-test-utils.ts
export class ApiTestUtils {
  static async createAuthenticatedRequest(endpoint: string, method = 'GET', body?: any) {
    const token = await this.getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    
    const config: RequestInit = {
      method,
      headers,
    };
    
    if (body) {
      config.body = JSON.stringify(body);
    }
    
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, config);
  }
  
  static async getAuthToken(): Promise<string> {
    // Mock authentication for tests
    return 'mock-jwt-token';
  }
  
  static async createTestVideo(overrides = {}): Promise<Video> {
    const videoData = {
      title: 'Test Video',
      description: 'Test video description',
      videoUrl: 'https://example.com/video.mp4',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      category: 'Test',
      ...overrides,
    };
    
    const response = await this.createAuthenticatedRequest('/api/videos', 'POST', videoData);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`Failed to create test video: ${result.error}`);
    }
    
    return result.data.video;
  }
  
  static async cleanupTestData() {
    // Clean up test data after tests
    const testVideos = await this.getTestVideos();
    await Promise.all(
      testVideos.map(video => 
        this.createAuthenticatedRequest(`/api/videos/${video.id}`, 'DELETE')
      )
    );
  }
}
```

### API Integration Tests

```typescript
// src/__tests__/api/videos.test.ts
import { ApiTestUtils } from '../utils/api-test-utils';

describe('/api/videos', () => {
  beforeAll(async () => {
    await ApiTestUtils.cleanupTestData();
  });
  
  afterAll(async () => {
    await ApiTestUtils.cleanupTestData();
  });
  
  describe('GET /api/videos', () => {
    it('should return paginated video list', async () => {
      const response = await ApiTestUtils.createAuthenticatedRequest('/api/videos');
      const result = await response.json();
      
      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('videos');
      expect(result.data).toHaveProperty('pagination');
      expect(Array.isArray(result.data.videos)).toBe(true);
    });
    
    it('should support search filtering', async () => {
      const response = await ApiTestUtils.createAuthenticatedRequest(
        '/api/videos?search=test&limit=5'
      );
      const result = await response.json();
      
      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.videos.length).toBeLessThanOrEqual(5);
    });
  });
  
  describe('POST /api/videos', () => {
    it('should create a new video', async () => {
      const videoData = {
        title: 'Integration Test Video',
        description: 'Created during API integration test',
        videoUrl: 'https://example.com/test-video.mp4',
        thumbnailUrl: 'https://example.com/test-thumbnail.jpg',
        category: 'Test',
      };
      
      const response = await ApiTestUtils.createAuthenticatedRequest(
        '/api/videos', 
        'POST', 
        videoData
      );
      const result = await response.json();
      
      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data.video).toHaveProperty('id');
      expect(result.data.video.title).toBe(videoData.title);
    });
    
    it('should validate required fields', async () => {
      const invalidData = {
        title: '', // Invalid: empty title
        description: 'Test description',
      };
      
      const response = await ApiTestUtils.createAuthenticatedRequest(
        '/api/videos', 
        'POST', 
        invalidData
      );
      const result = await response.json();
      
      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toContain('validation');
    });
  });
});
```

## API Versioning

### Version Strategy

- **URL Path Versioning**: `/api/v1/videos`
- **Header Versioning**: `Accept: application/vnd.playnite.v1+json`
- **Query Parameter**: `/api/videos?version=1`

### Backward Compatibility

```typescript
// src/lib/api-versioning.ts
export class ApiVersioning {
  static getVersionFromRequest(request: NextRequest): string {
    // Check Accept header
    const acceptHeader = request.headers.get('accept');
    if (acceptHeader?.includes('vnd.playnite.')) {
      const versionMatch = acceptHeader.match(/vnd\.playnite\.v(\d+)/);
      if (versionMatch) return versionMatch[1];
    }
    
    // Check query parameter
    const queryVersion = request.nextUrl.searchParams.get('version');
    if (queryVersion) return queryVersion;
    
    // Check URL path
    const pathVersion = request.nextUrl.pathname.match(/^\/api\/v(\d+)/)?.[1];
    if (pathVersion) return pathVersion;
    
    // Default to latest version
    return '1';
  }
  
  static getHandlerForVersion(version: string, handlers: Record<string, Function>) {
    const handler = handlers[version] || handlers['1'];
    if (!handler) {
      throw new Error(`No handler found for API version ${version}`);
    }
    return handler;
  }
}
```

This comprehensive API documentation provides developers with all the information needed to integrate with and extend the PlayNite platform's backend services.