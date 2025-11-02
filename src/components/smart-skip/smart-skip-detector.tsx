'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SkipForward, SkipBack, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkipSegment {
  id: string;
  startTime: number;
  endTime: number;
  type: 'intro' | 'outro' | 'credits' | 'recap' | 'commercial';
  confidence: number;
  description: string;
}

interface SmartSkipDetectorProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  currentTime: number;
  duration: number;
  onSkip: (time: number) => void;
  className?: string;
}

export function SmartSkipDetector({
  videoRef,
  currentTime,
  duration,
  onSkip,
  className
}: SmartSkipDetectorProps) {
  const { toast } = useToast();
  const [skipSegments, setSkipSegments] = useState<SkipSegment[]>([]);
  const [currentSkipPrompt, setCurrentSkipPrompt] = useState<SkipSegment | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSkipOverlay, setShowSkipOverlay] = useState(false);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mock skip detection - in a real implementation, this would use AI/ML
  const detectSkipSegments = async () => {
    if (!videoRef.current || duration < 60) return;

    setIsAnalyzing(true);

    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockSegments: SkipSegment[] = [];

    // Common skip patterns based on video duration
    if (duration > 600) { // Videos longer than 10 minutes
      // Intro (0-2 minutes)
      mockSegments.push({
        id: 'intro-1',
        startTime: 0,
        endTime: 120,
        type: 'intro',
        confidence: 0.85,
        description: 'Opening credits and introduction'
      });

      // Recap (around 2-4 minutes)
      mockSegments.push({
        id: 'recap-1',
        startTime: 120,
        endTime: 240,
        type: 'recap',
        confidence: 0.75,
        description: 'Previous episode recap'
      });

      // Credits (last 2-3 minutes)
      mockSegments.push({
        id: 'credits-1',
        startTime: duration - 180,
        endTime: duration,
        type: 'credits',
        confidence: 0.90,
        description: 'End credits'
      });
    }

    setSkipSegments(mockSegments);
    setIsAnalyzing(false);

    toast({
      title: 'Smart skip analysis complete',
      description: `Found ${mockSegments.length} skippable segments.`,
    });
  };

  // Check if current time is in a skip segment
  useEffect(() => {
    if (skipSegments.length === 0) return;

    const currentSegment = skipSegments.find(
      segment => currentTime >= segment.startTime && currentTime <= segment.endTime
    );

    if (currentSegment && currentSegment !== currentSkipPrompt) {
      setCurrentSkipPrompt(currentSegment);
      setShowSkipOverlay(true);

      // Auto-hide after 8 seconds
      setTimeout(() => {
        setShowSkipOverlay(false);
      }, 8000);
    } else if (!currentSegment) {
      setCurrentSkipPrompt(null);
      setShowSkipOverlay(false);
    }
  }, [currentTime, skipSegments, currentSkipPrompt]);

  // Start analysis when video loads
  useEffect(() => {
    if (duration > 0 && skipSegments.length === 0 && !isAnalyzing) {
      analysisTimeoutRef.current = setTimeout(detectSkipSegments, 3000);
    }

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [duration]);

  const handleSkip = (segment: SkipSegment) => {
    onSkip(segment.endTime + 1); // Skip to 1 second after the segment
    setShowSkipOverlay(false);

    toast({
      title: `Skipped ${segment.type}`,
      description: segment.description,
    });
  };

  const dismissSkip = () => {
    setShowSkipOverlay(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getSegmentIcon = (type: string) => {
    switch (type) {
      case 'intro':
        return '🎬';
      case 'recap':
        return '🔄';
      case 'credits':
        return '🎭';
      case 'outro':
        return '👋';
      case 'commercial':
        return '📺';
      default:
        return '⏭️';
    }
  };

  const getSegmentColor = (type: string) => {
    switch (type) {
      case 'intro':
        return 'bg-blue-500';
      case 'recap':
        return 'bg-green-500';
      case 'credits':
        return 'bg-purple-500';
      case 'outro':
        return 'bg-orange-500';
      case 'commercial':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Skip Segments Timeline Overlay */}
      {skipSegments.length > 0 && (
        <div className="absolute bottom-16 left-0 right-0 h-2 bg-black/20 rounded">
          {skipSegments.map((segment) => (
            <div
              key={segment.id}
              className={cn(
                'absolute top-0 h-full rounded opacity-70',
                getSegmentColor(segment.type)
              )}
              style={{
                left: `${(segment.startTime / duration) * 100}%`,
                width: `${((segment.endTime - segment.startTime) / duration) * 100}%`,
              }}
              title={`${segment.description} (${formatTime(segment.startTime)} - ${formatTime(segment.endTime)})`}
            />
          ))}
        </div>
      )}

      {/* Skip Prompt Overlay */}
      {showSkipOverlay && currentSkipPrompt && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{getSegmentIcon(currentSkipPrompt.type)}</span>
              <div>
                <h3 className="font-semibold capitalize">{currentSkipPrompt.type}</h3>
                <p className="text-sm text-muted-foreground">{currentSkipPrompt.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">
                {formatTime(currentSkipPrompt.startTime)} - {formatTime(currentSkipPrompt.endTime)}
              </Badge>
              <Badge variant="secondary">
                {Math.round(currentSkipPrompt.confidence * 100)}% confidence
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => handleSkip(currentSkipPrompt)} className="flex-1">
                <SkipForward className="h-4 w-4 mr-2" />
                Skip {currentSkipPrompt.type}
              </Button>
              <Button variant="outline" onClick={dismissSkip}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Indicator */}
      {isAnalyzing && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
          Analyzing for skip segments...
        </div>
      )}

      {/* Skip Segments List */}
      {skipSegments.length > 0 && (
        <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded max-w-xs">
          <h4 className="text-sm font-medium mb-2">Smart Skip Segments</h4>
          <div className="space-y-1">
            {skipSegments.map((segment) => (
              <div
                key={segment.id}
                className="flex items-center justify-between text-xs cursor-pointer hover:bg-white/10 p-1 rounded"
                onClick={() => handleSkip(segment)}
              >
                <div className="flex items-center gap-2">
                  <span>{getSegmentIcon(segment.type)}</span>
                  <span className="capitalize">{segment.type}</span>
                </div>
                <span>{formatTime(segment.startTime)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}