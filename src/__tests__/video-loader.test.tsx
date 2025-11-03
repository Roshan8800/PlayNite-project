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
    // Mock URL constructor
    global.URL = jest.fn().mockImplementation(() => ({
      toString: () => 'https://example.com/video.mp4'
    }));
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

    expect(screen.getByText('Loading video...')).toBeInTheDocument();
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
          setTimeout(callback, 100);
        }
      }),
      removeEventListener: jest.fn(),
      load: jest.fn()
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
  });

  it('handles invalid URL sources', async () => {
    const onSourceReady = jest.fn();
    const onError = jest.fn();

    // Mock invalid URL
    global.URL = jest.fn().mockImplementation(() => {
      throw new Error('Invalid URL');
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
    global.URL = jest.fn().mockImplementation(() => {
      urlCallCount++;
      if (urlCallCount === 1) {
        throw new Error('Invalid URL');
      }
      return { toString: () => 'https://example.com/video.mp4' };
    });

    // Mock successful video load for second source
    const mockVideo = {
      preload: 'metadata',
      crossOrigin: 'anonymous',
      addEventListener: jest.fn((event, callback) => {
        if (event === 'loadedmetadata') {
          setTimeout(callback, 100);
        }
      }),
      removeEventListener: jest.fn(),
      load: jest.fn()
    };

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
  });

  it('shows error state when all sources fail', async () => {
    const onSourceReady = jest.fn();
    const onError = jest.fn();

    const failingSources = [
      { type: 'url' as const, url: 'invalid1', title: 'Fail 1' },
      { type: 'url' as const, url: 'invalid2', title: 'Fail 2' }
    ];

    // Mock URL to always fail
    global.URL = jest.fn().mockImplementation(() => {
      throw new Error('Invalid URL');
    });

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
    expect(screen.getByText('Video Load Error')).toBeInTheDocument();
  });

  it('renders children when source is ready', async () => {
    const onSourceReady = jest.fn();
    const onError = jest.fn();

    // Mock successful video load
    const mockVideo = {
      preload: 'metadata',
      crossOrigin: 'anonymous',
      addEventListener: jest.fn((event, callback) => {
        if (event === 'loadedmetadata') {
          setTimeout(callback, 100);
        }
      }),
      removeEventListener: jest.fn(),
      load: jest.fn()
    };

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
      expect(screen.getByTestId('video-content')).toBeInTheDocument();
    });
  });

  it('respects timeout configuration', async () => {
    const onSourceReady = jest.fn();
    const onError = jest.fn();

    // Mock video that never loads
    const mockVideo = {
      preload: 'metadata',
      crossOrigin: 'anonymous',
      addEventListener: jest.fn(), // Never calls callback
      removeEventListener: jest.fn(),
      load: jest.fn()
    };

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
  });
});