'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  MessageCircle,
  Heart,
  Share2,
  Users,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LiveStream {
  id: string;
  title: string;
  streamerName: string;
  streamerAvatar?: string;
  viewerCount: number;
  isLive: boolean;
  streamUrl: string;
  thumbnailUrl: string;
  category: string;
  startedAt: string;
}

interface LiveStreamPlayerProps {
  stream: LiveStream;
  className?: string;
}

export function LiveStreamPlayer({ stream, className }: LiveStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setVolume(video.volume);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  const togglePlay = async () => {
    if (videoRef.current) {
      try {
        if (videoRef.current.paused) {
          await videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      } catch (error) {
        console.error('Error toggling playback:', error);
        toast({
          variant: 'destructive',
          title: 'Playback Error',
          description: 'Unable to play the live stream.',
        });
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Error entering fullscreen:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
      }
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? 'Unliked stream' : 'Liked stream',
      description: isLiked ? 'Removed from your liked streams' : 'Added to your liked streams',
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${stream.title} - Live Stream`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        toast({
          title: 'Link copied',
          description: 'Stream link copied to clipboard',
        });
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied',
        description: 'Stream link copied to clipboard',
      });
    }
  };

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Live Stream Video */}
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={stream.streamUrl}
          className="w-full h-full object-cover"
          poster={stream.thumbnailUrl}
          autoPlay
          muted={isMuted}
        />

        {/* Live Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Badge variant="destructive" className="bg-red-600">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            LIVE
          </Badge>
          <Badge variant="secondary" className="bg-black/50 text-white">
            <Eye className="w-4 h-4 mr-1" />
            {stream.viewerCount.toLocaleString()}
          </Badge>
        </div>

        {/* Streamer Info Overlay */}
        <div className="absolute bottom-20 left-4 right-4">
          <Card className="bg-black/70 border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={stream.streamerAvatar} alt={stream.streamerName} />
                  <AvatarFallback>{stream.streamerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{stream.title}</h3>
                  <p className="text-sm text-gray-300">{stream.streamerName}</p>
                  <p className="text-xs text-gray-400">{stream.category}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLike}
                className={`hover:bg-white/20 ${isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="hover:bg-white/20"
              >
                <Share2 className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="hover:bg-white/20"
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Click to show controls */}
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={() => setShowControls(!showControls)}
          onMouseMove={() => setShowControls(true)}
        />
      </div>

      {/* Chat/Interaction Panel (Optional) */}
      <div className="absolute top-4 right-4">
        <Button variant="secondary" size="sm" className="bg-black/50 hover:bg-black/70">
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat
        </Button>
      </div>
    </div>
  );
}