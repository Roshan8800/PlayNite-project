# Project Memory Bank

## Overview
This is a comprehensive Next.js video streaming platform built with modern web technologies, featuring AI-powered content recommendations, parental controls, cross-device synchronization, and advanced analytics.

## Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Firebase (Firestore, Auth, Storage, Analytics)
- **AI Integration**: Custom AI flows for content summarization, tag generation, and recommendations
- **Deployment**: Firebase Hosting with App Hosting

### Key Features
- Video streaming with adaptive quality
- User authentication and authorization
- Content moderation and approval system
- Parental controls with age restrictions
- Cross-device synchronization
- AI-powered content recommendations
- Advanced search and filtering
- Social features (comments, reactions, playlists)
- Analytics and performance monitoring
- PWA capabilities with service workers

## Core Components

### Video Player (`src/components/video-player.tsx`)
- Custom video player with HLS support
- Playback controls, quality selection, subtitles
- Analytics integration
- Cross-device sync integration
- Smart skip detection
- Error handling and recovery

### Video Analytics (`src/components/video-analytics.tsx`)
- Real-time playback analytics
- View tracking and completion rates
- Error monitoring
- Performance metrics

### Cross-Device Sync (`src/components/sync/cross-device-sync.tsx`)
- Real-time synchronization across devices
- Device management and registration
- Playback state syncing
- Online/offline detection

### AI Integration
- **Content Summarization**: Automatic video description summarization
- **Tag Generation**: AI-powered content tagging
- **Content Recommendations**: Personalized video suggestions
- **Content Moderation**: Automated content filtering

### Parental Controls (`src/app/(home)/settings/parental-controls/page.tsx`)
- Age-based content restrictions
- PIN-protected access
- Keyword and channel blocking
- Time limits and monitoring
- Activity reporting

## Database Schema

### Firestore Collections

#### Users
```typescript
interface User {
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  role: 'user' | 'moderator' | 'admin';
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  parentalControls?: ParentalControlsSettings;
  preferences?: UserPreferences;
}
```

#### Videos
```typescript
interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  views: number;
  likes: number;
  dislikes: number;
  channel: string;
  channelAvatarUrl?: string;
  uploadedAt: Timestamp;
  status: 'Pending' | 'Approved' | 'Rejected';
  tags: string[];
  summary?: string;
  ageRestriction?: number;
  category: string;
}
```

#### User Interactions
- `users/{userId}/history`: Watch history
- `users/{userId}/likes`: Liked videos
- `users/{userId}/watch-later`: Saved videos
- `users/{userId}/playlists`: User playlists
- `users/{userId}/devices`: Registered devices

#### Content Moderation
- `reports`: User-reported content
- `moderation-queue`: Content awaiting review

## AI Flows

### Content Summarization (`src/ai/flows/content-summarization.ts`)
- Analyzes video titles and descriptions
- Generates concise summaries
- Improves SEO and user experience

### Tag Generation (`src/ai/flows/ai-tag-generation.ts`)
- Extracts relevant keywords from content
- Improves searchability and recommendations
- Dynamic content categorization

### Content Recommendations (`src/ai/flows/content-recommendation-engine.ts`)
- Analyzes user viewing history
- Considers content preferences
- Generates personalized suggestions

### Content Moderation (`src/ai/flows/ai-content-moderation.ts`)
- Automated content filtering
- Inappropriate content detection
- Supports parental controls

## Performance Optimizations

### Bundle Optimization (`src/lib/bundle-optimization.ts`)
- Dynamic imports for large components
- Code splitting strategies
- Lazy loading implementation

### Caching Strategy (`src/lib/cache.ts`)
- Redis integration for session data
- Video metadata caching
- User preference caching

### Image Optimization
- Next.js Image component usage
- WebP format support
- Responsive image loading

## Security Features

### Authentication
- Firebase Auth integration
- Email/password authentication
- Social login support
- Session management

### Authorization
- Role-based access control
- Content access restrictions
- API rate limiting
- Input validation

### Content Security
- Parental controls implementation
- Age-appropriate content filtering
- User-generated content moderation
- Report system for inappropriate content

## Deployment & DevOps

### Firebase Configuration
- Hosting setup with SSR support
- Firestore security rules
- Storage bucket configuration
- Analytics integration

### Build Optimization
- Next.js production builds
- Bundle analysis and optimization
- CDN integration for static assets
- Service worker implementation

### Monitoring
- Error tracking and reporting
- Performance monitoring
- User analytics
- Content moderation alerts

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration
- Prettier formatting
- Component naming conventions

### Testing Strategy
- Unit tests for utilities and hooks
- Component testing with React Testing Library
- E2E testing with Playwright
- CI/CD pipeline integration

### Documentation
- JSDoc comments for functions
- Component prop documentation
- API endpoint documentation
- User-facing feature documentation

## Known Issues & TODOs

### Current Issues
- Test files have TypeScript configuration issues
- Some dynamic imports may cause hydration mismatches
- AI features have fallback handling but could be more robust

### Future Enhancements
- Video upload functionality
- Live streaming support
- Advanced playlist management
- Social sharing improvements
- Mobile app development
- Offline video caching

## Performance Benchmarks

### Core Web Vitals
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1
- First Input Delay: <100ms

### Bundle Size
- Main bundle: ~150KB gzipped
- Vendor chunks: ~200KB total
- Dynamic imports: On-demand loading

### API Performance
- Video metadata: <200ms
- Search queries: <500ms
- Recommendation engine: <1s

## Troubleshooting Guide

### Common Issues
1. **Build failures**: Check TypeScript errors and missing dependencies
2. **Firebase connection issues**: Verify configuration and security rules
3. **AI features not working**: Check API keys and network connectivity
4. **Video playback issues**: Verify HLS stream URLs and CORS settings

### Debug Commands
```bash
# Type checking
npm run type-check

# Build analysis
npm run build:analyze

# Test execution
npm run test

# Development server
npm run dev
```

## Contributing Guidelines

### Code Review Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Run full test suite
4. Create pull request with description
5. Code review and approval
6. Merge to main branch

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types: feat, fix, docs, style, refactor, test, chore

## Support & Maintenance

### Monitoring
- Firebase Analytics for user behavior
- Error reporting through Firebase Crashlytics
- Performance monitoring with Web Vitals
- Content moderation dashboard

### Backup Strategy
- Firestore automatic backups
- User data export capabilities
- Content archival procedures
- Disaster recovery plan

### Scaling Considerations
- CDN integration for video delivery
- Database indexing optimization
- Caching layer implementation
- Horizontal scaling preparation

---

*Last updated: November 2025*
*Version: 1.0.0*