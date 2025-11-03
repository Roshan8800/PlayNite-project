
import dynamic from 'next/dynamic';

// Lazy load heavy components
const VideoPlayer = dynamic(() => import('@/components/video-player'), {
  loading: () => <div>Loading video player...</div>,
  ssr: false
});

const LiveStreamPlayer = dynamic(() => import('@/components/live-stream-player'), {
  loading: () => <div>Loading live stream...</div>,
  ssr: false
});

export { VideoPlayer, LiveStreamPlayer };
