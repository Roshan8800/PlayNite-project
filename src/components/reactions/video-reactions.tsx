'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, increment, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { Heart, ThumbsUp, ThumbsDown, Laugh, Angry, Frown, Flame, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Reaction {
  type: string;
  emoji: string;
  icon: React.ReactNode;
  color: string;
  count: number;
}

interface VideoReactionsProps {
  videoId: string;
  className?: string;
}

export function VideoReactions({ videoId, className }: VideoReactionsProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [reactions, setReactions] = useState<Record<string, number>>({
    like: 0,
    dislike: 0,
    love: 0,
    laugh: 0,
    angry: 0,
    sad: 0,
    fire: 0,
    star: 0,
  });

  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [showReactions, setShowReactions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const reactionTypes: Reaction[] = [
    { type: 'like', emoji: '👍', icon: <ThumbsUp className="h-4 w-4" />, color: 'text-blue-500', count: reactions.like },
    { type: 'dislike', emoji: '👎', icon: <ThumbsDown className="h-4 w-4" />, color: 'text-red-500', count: reactions.dislike },
    { type: 'love', emoji: '❤️', icon: <Heart className="h-4 w-4" />, color: 'text-red-600', count: reactions.love },
    { type: 'laugh', emoji: '😂', icon: <Laugh className="h-4 w-4" />, color: 'text-yellow-500', count: reactions.laugh },
    { type: 'angry', emoji: '😡', icon: <Angry className="h-4 w-4" />, color: 'text-orange-500', count: reactions.angry },
    { type: 'sad', emoji: '😢', icon: <Frown className="h-4 w-4" />, color: 'text-blue-400', count: reactions.sad },
    { type: 'fire', emoji: '🔥', icon: <Flame className="h-4 w-4" />, color: 'text-orange-600', count: reactions.fire },
    { type: 'star', emoji: '⭐', icon: <Star className="h-4 w-4" />, color: 'text-yellow-600', count: reactions.star },
  ];

  useEffect(() => {
    if (!videoId) return;

    const videoRef = doc(firestore, 'videos', videoId);

    // Listen to reactions changes
    const unsubscribe = onSnapshot(videoRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setReactions(data.reactions || {
          like: 0,
          dislike: 0,
          love: 0,
          laugh: 0,
          angry: 0,
          sad: 0,
          fire: 0,
          star: 0,
        });
      }
    });

    // Load user reactions if logged in
    if (user) {
      const userReactionsRef = doc(firestore, 'users', user.uid, 'videoReactions', videoId);
      const unsubscribeUser = onSnapshot(userReactionsRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setUserReactions(new Set(data.reactions || []));
        }
      });

      return () => {
        unsubscribe();
        unsubscribeUser();
      };
    }

    return unsubscribe;
  }, [videoId, user, firestore]);

  const handleReaction = async (reactionType: string) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You need to be logged in to react to videos.',
      });
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const videoRef = doc(firestore, 'videos', videoId);
      const userReactionsRef = doc(firestore, 'users', user.uid, 'videoReactions', videoId);

      const hasReacted = userReactions.has(reactionType);

      if (hasReacted) {
        // Remove reaction
        await updateDoc(videoRef, {
          [`reactions.${reactionType}`]: increment(-1),
        });
        await updateDoc(userReactionsRef, {
          reactions: arrayRemove(reactionType),
        });
        setUserReactions(prev => {
          const newSet = new Set(prev);
          newSet.delete(reactionType);
          return newSet;
        });
      } else {
        // Add reaction
        await updateDoc(videoRef, {
          [`reactions.${reactionType}`]: increment(1),
        });
        await updateDoc(userReactionsRef, {
          reactions: arrayUnion(reactionType),
        });
        setUserReactions(prev => new Set([...prev, reactionType]));
      }

      toast({
        title: hasReacted ? 'Reaction removed' : 'Reaction added',
        description: `You ${hasReacted ? 'removed' : 'added'} your ${reactionType} reaction.`,
      });
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update reaction. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Reaction Summary */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex -space-x-1">
            {reactionTypes
              .filter(r => reactions[r.type] > 0)
              .slice(0, 3)
              .map(r => (
                <span key={r.type} className="text-lg" title={`${reactions[r.type]} ${r.type} reactions`}>
                  {r.emoji}
                </span>
              ))}
          </div>
          <span>{totalReactions} reaction{totalReactions !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Reaction Buttons */}
      <div className="flex items-center gap-2">
        {/* Quick Reactions */}
        <div className="flex gap-1">
          {reactionTypes.slice(0, 4).map((reaction) => (
            <Button
              key={reaction.type}
              variant="ghost"
              size="sm"
              onClick={() => handleReaction(reaction.type)}
              disabled={isLoading}
              className={cn(
                'h-8 px-2 hover:bg-muted transition-colors',
                userReactions.has(reaction.type) && 'bg-primary/10 border-primary/20'
              )}
              title={`${reaction.emoji} ${reaction.count}`}
            >
              <span className={cn(
                'text-lg',
                userReactions.has(reaction.type) && reaction.color
              )}>
                {reaction.emoji}
              </span>
              {reaction.count > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                  {reaction.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* More Reactions Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReactions(!showReactions)}
          className="h-8 px-2 hover:bg-muted"
          title="More reactions"
        >
          <span className="text-lg">➕</span>
        </Button>
      </div>

      {/* Expanded Reactions */}
      {showReactions && (
        <div className="grid grid-cols-4 gap-2 p-3 bg-muted/50 rounded-lg animate-in slide-in-from-bottom-2">
          {reactionTypes.map((reaction) => (
            <Button
              key={reaction.type}
              variant="ghost"
              size="sm"
              onClick={() => handleReaction(reaction.type)}
              disabled={isLoading}
              className={cn(
                'h-12 flex-col gap-1 hover:bg-background transition-colors',
                userReactions.has(reaction.type) && 'bg-primary/10 border-primary/20'
              )}
            >
              <span className={cn(
                'text-2xl',
                userReactions.has(reaction.type) && reaction.color
              )}>
                {reaction.emoji}
              </span>
              <span className="text-xs font-medium">{reaction.count}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Top Reactions Display */}
      {totalReactions > 0 && (
        <div className="flex flex-wrap gap-1">
          {reactionTypes
            .filter(r => reactions[r.type] > 0)
            .sort((a, b) => reactions[b.type] - reactions[a.type])
            .slice(0, 5)
            .map(r => (
              <Badge
                key={r.type}
                variant="outline"
                className="text-xs px-2 py-1"
              >
                {r.emoji} {reactions[r.type]}
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}