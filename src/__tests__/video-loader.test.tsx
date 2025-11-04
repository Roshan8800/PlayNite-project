import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { VideoLoader } from '../components/video-loader';

// Mock fetch for iframe testing
global.fetch = jest.fn();

describe('VideoLoader', () => {
  const mockSources = [
    {
      type: 'url' as const,
      url: 'https://example.com/video.mp4',
      title: 'Test Video'
    },
    {
      type: 'iframe' as const,
      iframeCode: '<iframe src="https://example.com/embed" title="Test"></iframe>',
      title: 'Test Iframe'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <VideoLoader
        sources={mockSources}
        onSourceReady={jest.fn()}
        onError={jest.fn()}
      >
        <div>Video Content</div>
      </VideoLoader>
    );

    expect(screen.getByText('Loading video...')).toBeInTheDocument(); // @ts-ignore - jest-dom matcher
  });

  it('validates URL sources correctly', async () => {
    const onSourceReady = jest.fn();
    const onError = jest.fn();

    // Mock successful video load
    const mockVideo = {
      preload: 'metadata',
      crossOrigin: 'anonymous',
      addEventListener: jest.fn((event, callback) => {
        if (event === 'loadedmetadata') {
          setTimeout(() => (callback as EventListener)(new Event('loadedmetadata')), 100);
        }
      }),
      removeEventListener: jest.fn(),
      load: jest.fn(),
      src: '',
      currentTime: 0,
      duration: 0,
      volume: 1,
      muted: false,
      paused: true,
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      tagName: 'VIDEO',
      nodeType: 1,
      ownerDocument: document,
      parentNode: null,
      childNodes: [],
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      insertBefore: jest.fn(),
      cloneNode: jest.fn(),
      setAttribute: jest.fn(),
      getAttribute: jest.fn(),
      hasAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      dispatchEvent: jest.fn(),
    };

    // Mock document.createElement
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn().mockImplementation((tagName: string) => {
      if (tagName === 'video') {
        return mockVideo;
      }
      return originalCreateElement.call(document, tagName);
    });

    render(
      <VideoLoader
        sources={[mockSources[0]]}
        onSourceReady={onSourceReady}
        onError={onError}
      >
        <div>Video Content</div>
      </VideoLoader>
    );

    await waitFor(() => {
      expect(onSourceReady).toHaveBeenCalledWith(mockSources[0]);
    });

    // Restore original createElement
    document.createElement = originalCreateElement;
  });

  it('handles invalid URL sources', async () => {
    const onSourceReady = jest.fn();
    const onError = jest.fn();

    // Mock invalid URL
    const originalURL = global.URL;
    global.URL = jest.fn().mockImplementation(() => {
      throw new Error('Invalid URL');
    }) as any;

    render(
      <VideoLoader
        sources={[mockSources[0]]}
        onSourceReady={onSourceReady}
        onError={onError}
      >
        <div>Video Content</div>
      </VideoLoader>
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'invalid_source',
          message: 'Invalid video URL format'
        })
      );
    });
  });

  it('validates iframe sources correctly', async () => {
    const onSourceReady = jest.fn();
    const onError = jest.fn();

    // Mock successful iframe validation
    (global.fetch as jest.Mock).mockResolvedValue({});

    render(
      <VideoLoader
        sources={[mockSources[1]]}
        onSourceReady={onSourceReady}
        onError={onError}
      >
        <div>Video Content</div>
      </VideoLoader>
    );

    await waitFor(() => {
      expect(onSourceReady).toHaveBeenCalledWith(mockSources[1]);
    });
  });

  it('handles invalid iframe sources', async () => {
    const onSourceReady = jest.fn();
    const onError = jest.fn();

    const invalidIframeSource = {
      type: 'iframe' as const,
      iframeCode: 'invalid iframe code',
      title: 'Invalid Iframe'
    };

    render(
      <VideoLoader
        sources={[invalidIframeSource]}
        onSourceReady={onSourceReady}
        onError={onError}
      >
        <div>Video Content</div>
      </VideoLoader>
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'invalid_source',
          message: 'Invalid iframe code format'
        })
      );
    });
  });

  it('falls back to next source on error', async () => {
    const onSourceReady = jest.fn();
    const onError = jest.fn();

    // First source fails, second succeeds
    const failingSource = {
      type: 'url' as const,
      url: 'invalid-url',
      title: 'Failing Video'
    };

    // Mock URL to fail for first source
    let urlCallCount = 0;
    const originalURL = global.URL;
    global.URL = jest.fn().mockImplementation(() => {
      urlCallCount++;
      if (urlCallCount === 1) {
        throw new Error('Invalid URL');
      }
      return { toString: () => 'https://example.com/video.mp4' };
    }) as any;

    // Create a real video element for second source
    const mockVideo = document.createElement('video');
    mockVideo.preload = 'metadata';
    mockVideo.crossOrigin = 'anonymous';

    // Mock the event listener to simulate successful load
    const originalAddEventListener = mockVideo.addEventListener.bind(mockVideo);
    mockVideo.addEventListener = jest.fn((event, callback) => {
      originalAddEventListener(event, callback);
      if (event === 'loadedmetadata') {
        setTimeout(() => {
          const loadEvent = new Event('loadedmetadata');
          (callback as EventListener)(loadEvent);
        }, 100);
      }
    });

    mockVideo.load = jest.fn();
    mockVideo.play = jest.fn().mockResolvedValue(undefined);
    mockVideo.pause = jest.fn();

    const originalCreateElement = document.createElement;
    document.createElement = jest.fn().mockReturnValue(mockVideo);

    render(
      <VideoLoader
        sources={[failingSource, mockSources[0]]}
        onSourceReady={onSourceReady}
        onError={onError}
      >
        <div>Video Content</div>
      </VideoLoader>
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1); // First source fails
      expect(onSourceReady).toHaveBeenCalledWith(mockSources[0]); // Second source succeeds
    });

    // Restore originals
    global.URL = originalURL;
    document.createElement = originalCreateElement;
  });

  it('shows error state when all sources fail', async () => {
    const onSourceReady = jest.fn();
    const onError = jest.fn();

    const failingSources = [
      { type: 'url' as const, url: 'invalid1', title: 'Fail 1' },
      { type: 'url' as const, url: 'invalid2', title: 'Fail 2' }
    ];

    // Mock URL to always fail
    const originalURL = global.URL;
    global.URL = jest.fn().mockImplementation(() => {
      throw new Error('Invalid URL');
    }) as any;

    render(
      <VideoLoader
        sources={failingSources}
        onSourceReady={onSourceReady}
        onError={onError}
      >
        <div>Video Content</div>
      </VideoLoader>
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(2); // Both sources fail
      expect(onSourceReady).not.toHaveBeenCalled();
    });

    // Should show error UI
    expect(screen.getByText('Video Load Error')).toBeInTheDocument(); // @ts-ignore - jest-dom matcher

    // Restore original URL
    global.URL = originalURL;
  });

  it('renders children when source is ready', async () => {
    const onSourceReady = jest.fn();
    const onError = jest.fn();

    // Create a real video element and mock its methods
    const mockVideo = document.createElement('video');
    mockVideo.preload = 'metadata';
    mockVideo.crossOrigin = 'anonymous';

    // Mock the event listener to simulate successful load
    const originalAddEventListener = mockVideo.addEventListener.bind(mockVideo);
    mockVideo.addEventListener = jest.fn((event, callback) => {
      originalAddEventListener(event, callback);
      if (event === 'loadedmetadata') {
        setTimeout(() => {
          const loadEvent = new Event('loadedmetadata');
          (callback as EventListener)(loadEvent);
        }, 100);
      }
    });

    mockVideo.load = jest.fn();
    mockVideo.play = jest.fn().mockResolvedValue(undefined);
    mockVideo.pause = jest.fn();

    const originalCreateElement = document.createElement;
    document.createElement = jest.fn().mockReturnValue(mockVideo);

    render(
      <VideoLoader
        sources={[mockSources[0]]}
        onSourceReady={onSourceReady}
        onError={onError}
      >
        <div data-testid="video-content">Video Content</div>
      </VideoLoader>
    );

    await waitFor(() => {
      expect(screen.getByTestId('video-content')).toBeInTheDocument(); // @ts-ignore
    });

    // Restore original createElement
    document.createElement = originalCreateElement;
  });

  it('respects timeout configuration', async () => {
    const onSourceReady = jest.fn();
    const onError = jest.fn();

    // Create a real video element that never loads
    const mockVideo = document.createElement('video');
    mockVideo.preload = 'metadata';
    mockVideo.crossOrigin = 'anonymous';

    // Mock addEventListener to never call callbacks (simulating timeout)
    mockVideo.addEventListener = jest.fn();
    mockVideo.load = jest.fn();
    mockVideo.play = jest.fn().mockResolvedValue(undefined);
    mockVideo.pause = jest.fn();

    const originalCreateElement = document.createElement;
    document.createElement = jest.fn().mockReturnValue(mockVideo);

    render(
      <VideoLoader
        sources={[mockSources[0]]}
        onSourceReady={onSourceReady}
        onError={onError}
        timeout={100} // Very short timeout
      >
        <div>Video Content</div>
      </VideoLoader>
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'network',
          message: expect.stringContaining('Failed to load video source')
        })
      );
    }, { timeout: 200 });

    // Restore original createElement
    document.createElement = originalCreateElement;
  });
});