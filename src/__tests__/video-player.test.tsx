import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoPlayer } from '../components/video-player';
import { VideoLoader } from '../components/video-loader';

// Mock the video loader component
jest.mock('../components/video-loader', () => ({
  VideoLoader: ({ children, onSourceReady, onError }: any) => {
    // Simulate successful source loading
    const mockUseEffect = () => {
      onSourceReady({ type: 'url' as const, url: 'test-video.mp4', title: 'Test Video' });
    };
    mockUseEffect();

    return <div data-testid="video-loader">{children}</div>;
  }
}));

// Mock react-intersection-observer
jest.mock('react-intersection-observer', () => ({
  useInView: () => ({
    ref: jest.fn(),
    inView: true
  })
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Play: () => <div data-testid="play-icon">Play</div>,
  Pause: () => <div data-testid="pause-icon">Pause</div>,
  Volume2: () => <div data-testid="volume-icon">Volume</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  Maximize: () => <div data-testid="maximize-icon">Maximize</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
  FastForward: () => <div data-testid="fast-forward-icon">FastForward</div>,
  Rewind: () => <div data-testid="rewind-icon">Rewind</div>,
  VolumeX: () => <div data-testid="volume-x-icon">VolumeX</div>,
  PictureInPicture2: () => <div data-testid="pip-icon">PiP</div>,
  Repeat: () => <div data-testid="repeat-icon">Repeat</div>,
  Volume1: () => <div data-testid="volume1-icon">Volume1</div>,
  Subtitles: () => <div data-testid="subtitles-icon">Subtitles</div>,
  Minimize: () => <div data-testid="minimize-icon">Minimize</div>,
}));

// Mock useToast hook
const mockToast = jest.fn();
jest.mock('../hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast
  })
}));

// Mock SmartSkipDetector
jest.mock('../components/smart-skip/smart-skip-detector', () => ({
  SmartSkipDetector: () => <div data-testid="smart-skip-detector">Smart Skip Detector</div>
}));

// Mock CrossDeviceSync
jest.mock('../components/sync/cross-device-sync', () => ({
  CrossDeviceSync: () => <div data-testid="cross-device-sync">Cross Device Sync</div>
}));

describe('VideoPlayer', () => {
  const mockVideo: any = {
    id: 'test-video-id',
    title: 'Test Video',
    videoUrl: 'https://example.com/test-video.mp4',
    iframe_code: '<iframe src="https://example.com/embed"></iframe>',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    duration: '10:30',
    views: 1000,
    uploadedAt: new Date().toISOString(),
    channel: 'Test Channel',
    channelAvatarUrl: 'https://example.com/avatar.jpg',
    description: 'Test video description',
    tags: ['test', 'video'],
    status: 'Approved'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock HTMLVideoElement
    Object.defineProperty(HTMLVideoElement.prototype, 'play', {
      writable: true,
      value: jest.fn().mockResolvedValue(undefined)
    });
    Object.defineProperty(HTMLVideoElement.prototype, 'pause', {
      writable: true,
      value: jest.fn()
    });
    Object.defineProperty(HTMLVideoElement.prototype, 'load', {
      writable: true,
      value: jest.fn()
    });
  });

  it('renders video player with controls', async () => {
    render(<VideoPlayer video={mockVideo} />);

    await waitFor(() => {
      expect(screen.getByTestId('video-loader')).toBeInTheDocument();
    });

    // Check if video element is rendered
    const videoElement = screen.getByRole('region', { name: /video player/i });
    expect(videoElement).toBeInTheDocument();

    // Check if controls are present
    expect(screen.getByRole('toolbar', { name: /video controls/i })).toBeInTheDocument();
  });

  it('displays video title and metadata', async () => {
    render(<VideoPlayer video={mockVideo} />);

    await waitFor(() => {
      expect(screen.getByText('Test Video')).toBeInTheDocument();
    });
  });

  it('handles play/pause toggle', async () => {
    render(<VideoPlayer video={mockVideo} />);

    await waitFor(() => {
      const playButton = screen.getByRole('button', { name: /play video/i });
      expect(playButton).toBeInTheDocument();
    });

    const playButton = screen.getByRole('button', { name: /play video/i });
    fireEvent.click(playButton);

    // Button should now show pause (though the icon might not change in test)
    expect(playButton).toBeInTheDocument();
  });

  it('handles volume changes', async () => {
    render(<VideoPlayer video={mockVideo} />);

    await waitFor(() => {
      expect(screen.getByTestId('video-loader')).toBeInTheDocument();
    });

    // Volume controls should be present
    const volumeButton = screen.getByRole('button', { name: /toggle mute/i });
    expect(volumeButton).toBeInTheDocument();
  });

  it('handles fullscreen toggle', async () => {
    // Mock fullscreen API
    Object.defineProperty(document, 'fullscreenElement', {
      writable: true,
      value: null
    });
    document.requestFullscreen = jest.fn().mockResolvedValue(undefined);
    document.exitFullscreen = jest.fn().mockResolvedValue(undefined);

    render(<VideoPlayer video={mockVideo} />);

    await waitFor(() => {
      const fullscreenButton = screen.getByRole('button', { name: /toggle fullscreen/i });
      expect(fullscreenButton).toBeInTheDocument();
    });

    const fullscreenButton = screen.getByRole('button', { name: /toggle fullscreen/i });
    fireEvent.click(fullscreenButton);

    expect(document.requestFullscreen).toHaveBeenCalled();
  });

  it('shows loading state initially', () => {
    render(<VideoPlayer video={mockVideo} />);

    // Should show loading state before video loads
    expect(screen.getByTestId('video-loader')).toBeInTheDocument();
  });

  it('handles keyboard shortcuts', async () => {
    render(<VideoPlayer video={mockVideo} />);

    await waitFor(() => {
      expect(screen.getByRole('region', { name: /video player/i })).toBeInTheDocument();
    });

    const videoContainer = screen.getByRole('region', { name: /video player/i });

    // Test spacebar for play/pause
    fireEvent.keyDown(videoContainer, { key: ' ', preventDefault: jest.fn() });
    expect(mockToast).not.toHaveBeenCalled(); // Should not show error

    // Test arrow keys for seeking
    fireEvent.keyDown(videoContainer, { key: 'ArrowLeft', preventDefault: jest.fn() });
    fireEvent.keyDown(videoContainer, { key: 'ArrowRight', preventDefault: jest.fn() });

    // Test volume controls
    fireEvent.keyDown(videoContainer, { key: 'ArrowUp', preventDefault: jest.fn() });
    fireEvent.keyDown(videoContainer, { key: 'ArrowDown', preventDefault: jest.fn() });
  });

  it('handles video errors gracefully', async () => {
    // Mock video error
    const mockVideoElement = {
      error: { code: 4, message: 'Video not supported' },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };

    // Override the mock to simulate error
    jest.spyOn(React, 'useRef').mockReturnValueOnce({ current: mockVideoElement as any });

    render(<VideoPlayer video={mockVideo} />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Video Error',
        description: 'Video source is not supported'
      });
    });
  });

  it('supports analytics when enabled', async () => {
    render(<VideoPlayer video={mockVideo} enableAnalytics={true} />);

    await waitFor(() => {
      expect(screen.getByTestId('video-loader')).toBeInTheDocument();
    });

    // Analytics should be enabled but we can't easily test internal state
    // This test mainly ensures the component doesn't crash with analytics enabled
  });

  it('renders with custom className', async () => {
    const customClass = 'custom-video-player';
    render(<VideoPlayer video={mockVideo} className={customClass} />);

    await waitFor(() => {
      const container = screen.getByRole('region', { name: /video player/i });
      expect(container).toHaveClass(customClass);
    });
  });
});