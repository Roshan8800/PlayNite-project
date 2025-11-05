# 8. Development and Testing Setup

## Development Environment Configuration

### Environment Variables Setup

#### Client-side Environment Variables
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ

# Development flags
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

#### Server-side Environment Variables
```bash
# .env.local (server-side)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com

# AI/ML API Keys (if applicable)
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_ai_key

# Database and external services
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:password@localhost:5432/playnite

# Security
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key
```

### Development Scripts

#### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev --turbopack -p 9002",
    "dev:debug": "NODE_OPTIONS='--inspect' next dev --turbopack -p 9002",
    "dev:production": "NODE_ENV=production next dev -p 9002",
    "build": "NODE_ENV=production next build",
    "build:analyze": "NODE_ENV=production ANALYZE=true next build",
    "start": "next start",
    "start:prod": "NODE_ENV=production next start -p 3000",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:accessibility": "jest --testPathPattern=accessibility",
    "genkit:dev": "genkit start -- tsx src/ai/dev.ts",
    "genkit:watch": "genkit start -- tsx --watch src/ai/dev.ts",
    "performance:optimize": "node performance-optimization.js",
    "seo:improve": "node seo-improvements.js",
    "optimize:all": "npm run performance:optimize && npm run seo:improve",
    "lighthouse": "npx lighthouse http://localhost:9002 --output=json --output-path=./lighthouse-report.json --chrome-flags=\"--headless --no-sandbox --disable-dev-shm-usage\"",
    "lighthouse:ci": "npm run lighthouse && cat lighthouse-report.json | jq '.categories | {performance: .performance.score, accessibility: .accessibility.score, \"best-practices\": .[\"best-practices\"].score, seo: .seo.score}'",
    "storybook": "storybook dev -p 6006",
    "storybook:build": "storybook build",
    "clean": "rm -rf .next out coverage",
    "postinstall": "patch-package"
  }
}
```

## TypeScript Configuration

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/firebase/*": ["./src/firebase/*"],
      "@/ai/*": ["./src/ai/*"]
    },
    "typeRoots": ["./node_modules/@types", "./src/types"],
    "types": ["jest", "@testing-library/jest-dom"]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    ".next",
    "out",
    "coverage",
    "**/*.spec.ts",
    "**/*.test.ts"
  ]
}
```

### Path Mapping Extensions
```typescript
// src/types/global.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_FIREBASE_API_KEY: string;
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
      FIREBASE_PRIVATE_KEY: string;
      FIREBASE_CLIENT_EMAIL: string;
      // Add other environment variables
    }
  }
}

export {};
```

## ESLint Configuration

### .eslintrc.js
```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'next/core-web-vitals',
    'plugin:jsx-a11y/recommended',
    'plugin:react-hooks/recommended',
    'plugin:testing-library/react',
    'plugin:jest-dom/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'jsx-a11y',
    'react-hooks',
    'testing-library',
    'jest-dom',
    'import',
  ],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    
    // React specific rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Accessibility rules
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-noninteractive-element-interactions': 'error',
    
    // Import rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
      },
    ],
    
    // General rules
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'react-hooks/rules-of-hooks': 'off',
      },
    },
    {
      files: ['src/ai/**/*.ts'],
      rules: {
        'no-console': 'off', // Allow console logs in AI development
      },
    },
  ],
};
```

## Testing Framework Setup

### Jest Configuration

#### jest.config.js
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{js,jsx,ts,tsx}',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(@firebase|firebase)/)',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
```

#### jest.setup.js
```javascript
// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Global test utilities
global.testUtils = {
  createMockVideo: (overrides = {}) => ({
    id: 'test-video-id',
    title: 'Test Video',
    description: 'Test video description',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    videoUrl: 'https://example.com/video.mp4',
    duration: '10:30',
    views: 1000,
    likes: 50,
    dislikes: 5,
    channel: 'Test Channel',
    channelId: 'test-channel-id',
    uploadedAt: '2024-01-01T00:00:00Z',
    tags: ['test', 'video'],
    category: 'Entertainment',
    status: 'Approved',
    ...overrides,
  }),

  createMockUser: (overrides = {}) => ({
    uid: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    role: 'User',
    joinedDate: '2024-01-01',
    status: 'Active',
    ...overrides,
  }),

  waitForNextTick: () => new Promise(resolve => setTimeout(resolve, 0)),
};
```

### React Testing Library Setup

#### Component Testing Examples
```typescript
// src/__tests__/video-card.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoCard } from '@/components/video-card';

const mockVideo = global.testUtils.createMockVideo();

describe('VideoCard', () => {
  it('renders video information correctly', () => {
    render(<VideoCard video={mockVideo} />);
    
    expect(screen.getByText(mockVideo.title)).toBeInTheDocument();
    expect(screen.getByText(mockVideo.channel)).toBeInTheDocument();
    expect(screen.getByText(`${mockVideo.views} views`)).toBeInTheDocument();
  });

  it('navigates to video page when clicked', async () => {
    const mockRouter = { push: jest.fn() };
    jest.mock('next/navigation', () => ({
      useRouter: () => mockRouter,
    }));

    render(<VideoCard video={mockVideo} />);
    
    const videoCard = screen.getByRole('link');
    fireEvent.click(videoCard);
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(`/video/${mockVideo.id}`);
    });
  });

  it('shows loading skeleton initially', () => {
    render(<VideoCard video={mockVideo} />);
    
    // Check for skeleton loading state
    expect(screen.getByTestId('video-skeleton')).toBeInTheDocument();
  });
});
```

#### Custom Testing Hooks
```typescript
// src/__tests__/utils/test-hooks.tsx
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function renderHookWithProviders<T>(
  hook: () => T,
  options?: {
    queryClient?: QueryClient;
    wrapper?: React.ComponentType<{ children: ReactNode }>;
  }
) {
  const queryClient = options?.queryClient || createQueryClient();
  
  const Wrapper = options?.wrapper || (({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  ));

  return renderHook(hook, { wrapper: Wrapper });
}

// Custom matchers
expect.extend({
  toHaveAccessibleName(received, expectedName) {
    const pass = received.getAttribute('aria-label') === expectedName ||
                 received.getAttribute('aria-labelledby') === expectedName ||
                 received.textContent?.trim() === expectedName;
    
    return {
      message: () => `expected element to have accessible name "${expectedName}"`,
      pass,
    };
  },
});
```

### Playwright E2E Testing

#### playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:9002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:9002',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### E2E Test Examples
```typescript
// e2e/video-playback.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Video Playback', () => {
  test('should play video successfully', async ({ page }) => {
    await page.goto('/video/test-video-id');
    
    // Wait for video to load
    await page.waitForSelector('video');
    
    // Check video is present
    const video = page.locator('video');
    await expect(video).toBeVisible();
    
    // Test play functionality
    await page.click('[aria-label="Play video"]');
    await expect(video).toHaveAttribute('data-playing', 'true');
    
    // Test pause functionality
    await page.click('[aria-label="Pause video"]');
    await expect(video).toHaveAttribute('data-playing', 'false');
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/video/test-video-id');
    
    // Focus video player
    await page.focus('video');
    
    // Test spacebar play/pause
    await page.keyboard.press('Space');
    await expect(page.locator('video')).toHaveAttribute('data-playing', 'true');
    
    // Test seeking with arrow keys
    const initialTime = await page.locator('video').evaluate(video => video.currentTime);
    await page.keyboard.press('ArrowRight');
    const newTime = await page.locator('video').evaluate(video => video.currentTime);
    expect(newTime).toBeGreaterThan(initialTime);
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/video/test-video-id');
    
    // Check for accessibility violations
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

### Accessibility Testing

#### Automated Accessibility Tests
```typescript
// src/__tests__/accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { VideoPlayer } from '@/components/video-player';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('VideoPlayer should have no accessibility violations', async () => {
    const { container } = render(
      <VideoPlayer 
        videoId="test-video" 
        title="Test Video"
        description="Test video description"
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should support keyboard navigation', async () => {
    const { container } = render(<VideoPlayer videoId="test-video" />);
    
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('tabindex', '0');
    expect(video).toHaveAttribute('aria-label');
  });

  it('should announce status changes to screen readers', async () => {
    const { container } = render(<VideoPlayer videoId="test-video" />);
    
    // Test that status announcements are present
    const statusElement = container.querySelector('[aria-live]');
    expect(statusElement).toBeInTheDocument();
  });
});
```

## Development Workflow

### Pre-commit Hooks

#### .husky/pre-commit
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
npm run typecheck
npm run test -- --watchAll=false --passWithNoTests
```

#### .husky/commit-msg
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no-install commitlint --edit "$1"
```

### Commit Message Convention

#### commitlint.config.js
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
  },
};
```

## CI/CD Pipeline

### GitHub Actions Workflow

#### .github/workflows/ci.yml
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Type check
      run: npm run typecheck
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  accessibility:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js 20.x
      uses: actions/setup-node@v3
      with:
        node-version: 20.x
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run accessibility tests
      run: npm run test:accessibility

  e2e:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js 20.x
      uses: actions/setup-node@v3
      with:
        node-version: 20.x
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run E2E tests
      run: npm run test:e2e

  lighthouse:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js 20.x
      uses: actions/setup-node@v3
      with:
        node-version: 20.x
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
    
    - name: Run Lighthouse
      run: npm run lighthouse:ci
```

## Performance Monitoring

### Bundle Analysis

#### Bundle Analyzer Setup
```typescript
// scripts/analyze-bundle.js
const { execSync } = require('child_process');
const fs = require('fs');

function analyzeBundle() {
  console.log('Building application with bundle analyzer...');
  
  try {
    execSync('npm run build:analyze', { stdio: 'inherit' });
    
    // Read bundle analysis results
    const reportPath = './bundle-analyzer-report.html';
    if (fs.existsSync(reportPath)) {
      console.log('Bundle analysis report generated:', reportPath);
      
      // Parse and log key metrics
      const stats = parseBundleStats();
      logBundleMetrics(stats);
    }
  } catch (error) {
    console.error('Bundle analysis failed:', error.message);
    process.exit(1);
  }
}

function parseBundleStats() {
  // Parse webpack stats and extract key metrics
  // Implementation would read webpack stats JSON
  return {
    totalSize: '2.1MB',
    mainBundle: '450KB',
    vendorBundle: '1.2MB',
    chunks: 24,
  };
}

function logBundleMetrics(stats) {
  console.log('\n📊 Bundle Analysis Results:');
  console.log(`Total Size: ${stats.totalSize}`);
  console.log(`Main Bundle: ${stats.mainBundle}`);
  console.log(`Vendor Bundle: ${stats.vendorBundle}`);
  console.log(`Number of Chunks: ${stats.chunks}`);
  
  // Check against budgets
  const budgets = {
    mainBundle: 500 * 1024, // 500KB
    vendorBundle: 1.5 * 1024 * 1024, // 1.5MB
  };
  
  if (parseSize(stats.mainBundle) > budgets.mainBundle) {
    console.warn('⚠️  Main bundle exceeds budget!');
  }
  
  if (parseSize(stats.vendorBundle) > budgets.vendorBundle) {
    console.warn('⚠️  Vendor bundle exceeds budget!');
  }
}

function parseSize(sizeStr) {
  const match = sizeStr.match(/(\d+(?:\.\d+)?)\s*(KB|MB)/);
  if (!match) return 0;
  
  const [, size, unit] = match;
  const multiplier = unit === 'MB' ? 1024 * 1024 : 1024;
  return parseFloat(size) * multiplier;
}

analyzeBundle();
```

## Documentation

### Component Documentation

#### Storybook Configuration
```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};

export default config;
```

#### Component Story Example
```typescript
// src/components/video-card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { VideoCard } from './video-card';

const meta: Meta<typeof VideoCard> = {
  title: 'Components/VideoCard',
  component: VideoCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A card component displaying video information with hover effects and actions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    video: {
      description: 'Video object containing all video information',
      control: { type: 'object' },
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    video: {
      id: 'sample-video',
      title: 'Sample Video Title',
      description: 'This is a sample video description that shows how the component displays content.',
      thumbnailUrl: 'https://picsum.photos/320/180',
      duration: '12:34',
      views: 12345,
      likes: 123,
      dislikes: 12,
      channel: 'Sample Channel',
      channelId: 'sample-channel',
      uploadedAt: '2024-01-15T10:30:00Z',
      tags: ['sample', 'video', 'demo'],
      category: 'Entertainment',
    },
  },
};

export const Loading: Story = {
  args: {
    video: null, // Shows loading skeleton
  },
};
```

This comprehensive development and testing setup ensures code quality, performance, and accessibility standards are maintained throughout the development lifecycle of the PlayNite platform.