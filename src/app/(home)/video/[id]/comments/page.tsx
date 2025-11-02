'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ThumbsUp, ThumbsDown, Reply, MoreHorizontal } from 'lucide-react';
import { useDoc, useCollection, useFirestore, useUser } from '@/firebase';
import { collection, doc, query, where, orderBy, limit, setDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import React, { useEffect, useState, Suspense } from 'react';
import { type Video } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  replies?: Comment[];
}

function CommentsPageContent({ id }: { id: string }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const videoRef = doc(firestore, 'videos', id);
  const { data: video, loading: videoLoading } = useDoc(videoRef);

  const commentsQuery = query(
    collection(firestore, 'videos', id, 'comments'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const { data: comments, loading: commentsLoading } = useCollection(commentsQuery);

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      const commentRef = doc(collection(firestore, 'videos', id, 'comments'));
      await setDoc(commentRef, {
        text: newComment.trim(),
        authorId: user.uid,
        authorName: user.name || 'Anonymous',
        authorAvatar: user.avatarUrl,
        createdAt: serverTimestamp(),
        likes: 0,
        dislikes: 0,
      });

      setNewComment('');
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted.',
      });
    } catch (error) {
      const permissionError = new FirestorePermissionError({
        path: `videos/${id}/comments`,
        operation: 'create',
        requestResourceData: { text: newComment },
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add comment.',
      });
    }
  };

  const handleReply = async (commentId: string) => {
    if (!user || !replyText.trim()) return;

    try {
      const replyRef = doc(collection(firestore, 'videos', id, 'comments', commentId, 'replies'));
      await setDoc(replyRef, {
        text: replyText.trim(),
        authorId: user.uid,
        authorName: user.name || 'Anonymous',
        authorAvatar: user.avatarUrl,
        createdAt: serverTimestamp(),
        likes: 0,
        dislikes: 0,
      });

      setReplyText('');
      setReplyingTo(null);
      toast({
        title: 'Reply added',
        description: 'Your reply has been posted.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add reply.',
      });
    }
  };

  const handleLike = async (commentId: string, isLike: boolean) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You need to be logged in to like comments.',
      });
      return;
    }

    try {
      const commentRef = doc(firestore, 'videos', id, 'comments', commentId);
      await updateDoc(commentRef, {
        likes: increment(isLike ? 1 : 0),
        dislikes: increment(isLike ? 0 : 1),
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update like.',
      });
    }
  };

  if (videoLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Video not found</h1>
        <p className="text-muted-foreground">This video may have been removed or is unavailable.</p>
      </div>
    );
  }

  const currentVideo = video as Video;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Comments</h1>
        <p className="text-muted-foreground">
          {comments?.length || 0} comments on "{currentVideo.title}"
        </p>
      </div>

      {/* Add Comment */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name || undefined} />
              <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2"
                aria-label="Add a public comment"
                role="textbox"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setNewComment('')}
                  disabled={!newComment.trim()}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {commentsLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
                    <AvatarFallback>{comment.authorName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.authorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm mb-3">{comment.text}</p>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(comment.id, true)}
                        className="h-8 px-2"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {comment.likes || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(comment.id, false)}
                        className="h-8 px-2"
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        {comment.dislikes || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(comment.id)}
                        className="h-8 px-2"
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Reply Input */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name || undefined} />
                            <AvatarFallback className="text-xs">
                              {user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Input
                              placeholder="Write a reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="mb-2 text-sm"
                              aria-label="Write a reply"
                              role="textbox"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText('');
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleReply(comment.id)}
                                disabled={!replyText.trim()}
                              >
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <Suspense fallback={<div className="container mx-auto max-w-4xl px-4 py-8">Loading comments...</div>}>
      <CommentsPageContent id={id} />
    </Suspense>
  );
}