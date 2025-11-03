# PlayNite - Advanced Video Streaming Platform

A modern, AI-powered video streaming platform built with Next.js 15, featuring cross-device synchronization, parental controls, advanced analytics, and personalized content recommendations.

![PlayNite Logo](public/logo.png)

## 🚀 Features

### Core Functionality
- **Video Streaming**: High-quality video playback with adaptive bitrate streaming
- **User Authentication**: Secure Firebase Auth with social login support
- **Content Management**: Comprehensive video upload, moderation, and approval system
- **Advanced Search**: AI-powered search with filters and recommendations
- **Social Features**: Comments, reactions, playlists, and watch parties

### AI-Powered Features
- **Content Summarization**: Automatic video description summarization using AI
- **Smart Tagging**: AI-generated content tags for better discoverability
- **Personalized Recommendations**: Machine learning-powered content suggestions
- **Content Moderation**: Automated inappropriate content detection

### Advanced Features
- **Cross-Device Sync**: Seamless playback synchronization across all devices
- **Parental Controls**: Comprehensive content filtering and time restrictions
- **Analytics Dashboard**: Real-time performance monitoring and user insights
- **PWA Support**: Offline viewing capabilities and native app experience
- **Accessibility**: WCAG 2.1 compliant with screen reader support

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - UI library with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives

### Backend & Infrastructure
- **Firebase** - Backend-as-a-Service
  - Firestore (Database)
  - Firebase Auth (Authentication)
  - Firebase Storage (File storage)
  - Firebase Analytics (User analytics)
  - Firebase Hosting (Deployment)
- **Vercel** - Edge computing and deployment

### AI & ML
- **Custom AI Flows** - Proprietary AI models for content processing
- **OpenAI Integration** - Advanced language processing
- **TensorFlow.js** - Client-side machine learning

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore, Auth, and Storage enabled
- OpenAI API key (for AI features)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/playnite.git
cd playnite
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Application Configuration
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 4. Firebase Setup
1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore, Authentication, and Storage
3. Configure security rules (see `firestore.rules`)
4. Add your web app and copy the config to `.env.local`

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
playnite/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (home)/            # Main application routes
│   │   ├── admin/             # Admin dashboard
│   │   └── api/               # API routes
│   ├── components/            # Reusable React components
│   │   ├── ui/               # UI component library
│   │   ├── video-player.tsx  # Main video player
│   │   └── sync/             # Cross-device sync components
│   ├── lib/                  # Utility functions and configurations
│   ├── hooks/                # Custom React hooks
│   ├── firebase/             # Firebase configuration and utilities
│   └── ai/                   # AI flow implementations
├── docs/                     # Documentation
├── public/                   # Static assets
├── tests/                    # Test files
└── package.json
```

## 🎯 Key Components

### Video Player
Advanced video player with:
- HLS streaming support
- Quality selection
- Subtitle support
- Playback analytics
- Cross-device sync

### Cross-Device Sync
Real-time synchronization system:
- Device registration and management
- Playback state syncing
- Online/offline detection
- Conflict resolution

### Parental Controls
Comprehensive content filtering:
- Age-based restrictions
- Keyword blocking
- Channel filtering
- Time limits
- Activity monitoring

### AI Integration
Intelligent content processing:
- Automatic summarization
- Smart tagging
- Personalized recommendations
- Content moderation

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run preview         # Preview production build

# Testing
npm run test            # Run unit tests
npm run test:e2e        # Run E2E tests
npm run test:coverage   # Generate test coverage

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm run type-check      # TypeScript type checking

# Deployment
npm run deploy          # Deploy to Firebase
npm run build:analyze   # Bundle size analysis
```

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb config with React rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for code quality

### Testing Strategy
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API and database interactions
- **E2E Tests**: Critical user flows
- **Performance Tests**: Core Web Vitals monitoring

## 🚀 Deployment

### Firebase Hosting
1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login and initialize:
```bash
firebase login
firebase init hosting
```

3. Deploy:
```bash
npm run deploy
```

### Environment Variables
Configure production environment variables in Firebase Console or deployment platform.

## 📊 Performance

### Core Web Vitals
- **FCP**: <1.5s (First Contentful Paint)
- **LCP**: <2.5s (Largest Contentful Paint)
- **CLS**: <0.1 (Cumulative Layout Shift)
- **FID**: <100ms (First Input Delay)

### Bundle Size
- Main bundle: ~150KB (gzipped)
- Vendor chunks: ~200KB total
- Dynamic imports: On-demand loading

## 🔒 Security

### Authentication
- Firebase Auth with email/password
- Social login (Google, Facebook, etc.)
- JWT token management
- Session handling

### Authorization
- Role-based access control (User, Moderator, Admin)
- Content access restrictions
- API rate limiting
- Input validation and sanitization

### Content Security
- Parental controls and age restrictions
- Content moderation system
- User reporting and review process
- Automated content filtering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Ensure accessibility compliance
- Follow semantic commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for the comprehensive backend platform
- Radix UI for accessible component primitives
- Lucide React for beautiful icons
- All contributors and the open-source community

## 📞 Support

- **Documentation**: [docs/project-memory-bank.md](docs/project-memory-bank.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/playnite/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/playnite/discussions)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core video streaming platform
- ✅ User authentication and profiles
- ✅ Basic content management
- ✅ Cross-device synchronization

### Phase 2 (Next)
- 🔄 Live streaming support
- 🔄 Advanced playlist management
- 🔄 Mobile app development
- 🔄 Offline video caching

### Phase 3 (Future)
- 📋 Video upload functionality
- 📋 Advanced AI features
- 📋 Multi-language support
- 📋 Enterprise features

---

**Built with ❤️ using Next.js, Firebase, and modern web technologies.**
