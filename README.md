# PlayNite

[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.9.1-orange)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern, high-performance video streaming platform built with Next.js 15, designed to provide users with a seamless video consumption experience. The platform specializes in adult content streaming while maintaining enterprise-grade performance, accessibility, and user experience standards.

## 🚀 Key Features

### Video Streaming Engine
- **Adaptive Streaming**: HLS support with multiple bitrate options (240p to 4K)
- **Quality Selection**: Automatic quality adjustment based on network conditions
- **Advanced Playback Controls**: Speed control, picture-in-picture, keyboard shortcuts
- **Cross-Device Synchronization**: Resume watching across all devices

### User Experience
- **AI-Powered Recommendations**: Personalized content suggestions
- **Advanced Search**: Full-text search with AI-powered suggestions
- **Social Features**: Comments, reactions, watch parties, and playlists
- **Offline Viewing**: Download videos for offline consumption
- **Progressive Web App**: Installable with native-like experience

### Performance & Accessibility
- **Core Web Vitals Optimized**: LCP, FID, CLS monitoring and optimization
- **WCAG AA Compliant**: Full accessibility support with screen readers
- **High Contrast Mode**: Enhanced visibility for users with visual impairments
- **Service Worker Caching**: Offline-first architecture

### Content Management
- **AI Content Moderation**: Automated inappropriate content detection
- **Parental Controls**: Age restrictions and time limits
- **Multi-language Support**: Internationalization ready
- **Admin Dashboard**: Comprehensive content and user management

## 🛠 Technology Stack

### Frontend Framework
- **Next.js 15** - React framework with App Router and Server Components
- **React 18** - UI library with Concurrent Features
- **TypeScript 5** - Type-safe JavaScript with advanced features

### UI & Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Radix UI** - Headless UI components for accessibility
- **shadcn/ui** - Pre-built accessible component library
- **Lucide React** - Beautiful icon library

### Backend & Database
- **Firebase Ecosystem**:
  - **Firestore** - NoSQL database with real-time updates
  - **Firebase Auth** - Multi-provider authentication
  - **Firebase Storage** - Secure file storage and CDN
  - **Firebase Functions** - Serverless backend functions
- **Firebase Genkit** - AI workflows and content processing

### Development Tools
- **ESLint** - Code linting and formatting
- **Jest** - Unit and integration testing
- **Playwright** - End-to-end testing
- **Storybook** - Component documentation
- **Webpack Bundle Analyzer** - Bundle optimization

### Performance & Monitoring
- **Core Web Vitals** - Real-time performance monitoring
- **Service Workers** - Advanced caching strategies
- **Error Boundaries** - Graceful error handling
- **Bundle Analysis** - Optimized code splitting

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (home)/            # Main application routes
│   │   ├── admin/             # Admin panel
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components (shadcn/ui)
│   │   ├── video-player.tsx   # Video player component
│   │   ├── video-card.tsx     # Video card component
│   │   └── ...
│   ├── lib/                   # Utility libraries
│   │   ├── color-accessibility.ts
│   │   ├── performance-monitoring.ts
│   │   ├── error-logger.ts
│   │   └── ...
│   ├── firebase/              # Firebase configuration and hooks
│   │   ├── config.ts
│   │   ├── firestore/
│   │   └── auth/
│   ├── hooks/                 # Custom React hooks
│   ├── ai/                    # AI workflows and flows
│   └── types.ts               # TypeScript type definitions
├── memory-bank/               # Comprehensive project documentation
├── public/                    # Static assets
├── tests/                     # Test files
└── docs/                      # Additional documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or later
- **npm** or **yarn** package manager
- **Firebase** project with Firestore, Auth, and Storage enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/playnite.git
   cd playnite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

   Configure your environment variables:
   ```bash
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com

   # Server-side Firebase (for API routes)
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
   ```

4. **Firebase Setup**
   - Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Firestore, Authentication, and Storage
   - Configure security rules (see `firestore.rules`)
   - Set up Firebase Functions if needed

5. **Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:9002](http://localhost:9002) in your browser.

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

## 🧪 Development Guidelines

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Automated code linting and formatting
- **Pre-commit Hooks**: Automated testing and linting
- **Conventional Commits**: Standardized commit messages

### Testing Strategy

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run accessibility tests
npm run test:accessibility

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Performance Optimization

```bash
# Analyze bundle size
npm run build:analyze

# Run Lighthouse audit
npm run lighthouse

# Performance optimization
npm run optimize:all
```

### Development Scripts

```bash
# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# AI development (Firebase Genkit)
npm run genkit:dev
npm run genkit:watch
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Make** your changes and ensure tests pass
4. **Commit** using conventional commits: `git commit -m "feat: add new feature"`
5. **Push** to your fork: `git push origin feature/your-feature-name`
6. **Create** a Pull Request

### Code Standards

- Follow the existing code style and patterns
- Write comprehensive tests for new features
- Update documentation as needed
- Ensure accessibility compliance
- Maintain performance standards

### Reporting Issues

- Use the [GitHub Issues](https://github.com/your-username/playnite/issues) page
- Provide detailed reproduction steps
- Include browser and device information
- Attach screenshots or videos if applicable

## 📚 Documentation

Comprehensive documentation is available in the [`memory-bank/`](memory-bank/) folder:

- **[01-project-overview-architecture.md](memory-bank/01-project-overview-architecture.md)** - System architecture and design principles
- **[02-core-features-functionality.md](memory-bank/02-core-features-functionality.md)** - Detailed feature descriptions
- **[03-technical-stack-dependencies.md](memory-bank/03-technical-stack-dependencies.md)** - Technology stack and dependencies
- **[04-component-library-ui-system.md](memory-bank/04-component-library-ui-system.md)** - UI component system
- **[05-firebase-integration-data-models.md](memory-bank/05-firebase-integration-data-models.md)** - Database schema and Firebase integration
- **[06-performance-optimization-features.md](memory-bank/06-performance-optimization-features.md)** - Performance optimization strategies
- **[07-accessibility-compliance-features.md](memory-bank/07-accessibility-compliance-features.md)** - Accessibility implementation
- **[08-development-testing-setup.md](memory-bank/08-development-testing-setup.md)** - Development and testing setup
- **[09-api-documentation.md](memory-bank/09-api-documentation.md)** - API reference
- **[10-deployment-configuration.md](memory-bank/10-deployment-configuration.md)** - Deployment and configuration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact & Support

- **Project Website**: [https://playnite.com](https://playnite.com)
- **Documentation**: [https://docs.playnite.com](https://docs.playnite.com)
- **Support**: [support@playnite.com](mailto:support@playnite.com)
- **GitHub Issues**: [Report bugs or request features](https://github.com/your-username/playnite/issues)

## 🙏 Acknowledgments

- **Firebase** for the excellent backend-as-a-service platform
- **Vercel** for hosting and deployment platform
- **Next.js** team for the amazing React framework
- **shadcn/ui** for the accessible component library
- **Radix UI** for headless UI primitives
- **Tailwind CSS** for the utility-first CSS framework

---

**PlayNite** - Modern video streaming with enterprise-grade performance and accessibility.
