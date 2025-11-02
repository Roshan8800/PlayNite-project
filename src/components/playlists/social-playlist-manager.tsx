'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { Plus, Users, Share2, Play, Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Playlist {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  isPublic: boolean;
  collaborators: string[];
  videos: string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
}

interface SocialPlaylistManagerProps {
  videoId?: string;
  className?: string;
}

export function SocialPlaylistManager({ videoId, className }: SocialPlaylistManagerProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    isPublic: true,
  });
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(new Set());

  // Fetch user's playlists
  const playlistsQuery = user ? query(
    collection(firestore, 'playlists'),
    where('creatorId', '==', user.uid),
    orderBy('updatedAt', 'desc')
  ) : null;

  const { data: userPlaylists, loading } = useCollection(playlistsQuery);

  // Fetch public playlists that include this video (if videoId provided)
  const publicPlaylistsQuery = videoId ? query(
    collection(firestore, 'playlists'),
    where('isPublic', '==', true),
    where('videos', 'array-contains', videoId)
  ) : null;

  const { data: publicPlaylistsWithVideo } = useCollection(publicPlaylistsQuery);

  useEffect(() => {
    if (userPlaylists) {
      setPlaylists(userPlaylists as Playlist[]);
    }
  }, [userPlaylists]);

  const createPlaylist = async () => {
    if (!user || !newPlaylist.name.trim()) return;

    try {
      const playlistRef = doc(collection(firestore, 'playlists'));
      const playlistData = {
        ...newPlaylist,
        id: playlistRef.id,
        creatorId: user.uid,
        creatorName: user.name || 'Anonymous',
        creatorAvatar: user.avatarUrl,
        collaborators: [],
        videos: videoId ? [videoId] : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: 0,
        comments: 0,
      };

      await setDoc(playlistRef, playlistData);

      setNewPlaylist({ name: '', description: '', isPublic: true });
      setShowCreateForm(false);

      toast({
        title: 'Playlist created',
        description: `"${newPlaylist.name}" has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create playlist.',
      });
    }
  };

  const addVideoToPlaylists = async () => {
    if (!user || !videoId || selectedPlaylists.size === 0) return;

    try {
      const updatePromises = Array.from(selectedPlaylists).map(playlistId =>
        updateDoc(doc(firestore, 'playlists', playlistId), {
          videos: arrayUnion(videoId),
          updatedAt: serverTimestamp(),
        })
      );

      await Promise.all(updatePromises);

      toast({
        title: 'Video added',
        description: `Added to ${selectedPlaylists.size} playlist${selectedPlaylists.size > 1 ? 's' : ''}.`,
      });

      setSelectedPlaylists(new Set());
    } catch (error) {
      console.error('Error adding video to playlists:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add video to playlists.',
      });
    }
  };

  const togglePlaylistSelection = (playlistId: string) => {
    setSelectedPlaylists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playlistId)) {
        newSet.delete(playlistId);
      } else {
        newSet.add(playlistId);
      }
      return newSet;
    });
  };

  if (!user) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-muted-foreground">Please log in to manage playlists.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Playlists</h3>
          <p className="text-sm text-muted-foreground">Organize your favorite videos</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Playlist
        </Button>
      </div>

      {/* Create Playlist Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create New Playlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playlist-name">Name</Label>
              <Input
                id="playlist-name"
                placeholder="Enter playlist name"
                value={newPlaylist.name}
                onChange={(e) => setNewPlaylist(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="playlist-description">Description (Optional)</Label>
              <Textarea
                id="playlist-description"
                placeholder="Describe your playlist"
                value={newPlaylist.description}
                onChange={(e) => setNewPlaylist(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-public"
                checked={newPlaylist.isPublic}
                onChange={(e) => setNewPlaylist(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="is-public" className="text-sm">Make playlist public</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={createPlaylist} disabled={!newPlaylist.name.trim()}>
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add to Playlists (when videoId is provided) */}
      {videoId && playlists.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add to Playlists
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className={cn(
                    'flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors',
                    selectedPlaylists.has(playlist.id) ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                  )}
                  onClick={() => togglePlaylistSelection(playlist.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <div>
                      <p className="font-medium text-sm">{playlist.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {playlist.videos.length} video{playlist.videos.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Badge variant={playlist.isPublic ? 'default' : 'secondary'} className="text-xs">
                    {playlist.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
              ))}
            </div>
            {selectedPlaylists.size > 0 && (
              <Button onClick={addVideoToPlaylists} className="w-full">
                Add to {selectedPlaylists.size} Playlist{selectedPlaylists.size > 1 ? 's' : ''}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* User's Playlists */}
      <div className="space-y-4">
        <h4 className="font-medium">Your Playlists</h4>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : playlists.length > 0 ? (
          <div className="grid gap-3">
            {playlists.map((playlist) => (
              <Card key={playlist.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={playlist.creatorAvatar} alt={playlist.creatorName} />
                        <AvatarFallback>{playlist.creatorName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{playlist.name}</h4>
                          <Badge variant={playlist.isPublic ? 'default' : 'secondary'} className="text-xs">
                            {playlist.isPublic ? 'Public' : 'Private'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {playlist.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{playlist.videos.length} videos</span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {playlist.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {playlist.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You haven't created any playlists yet.</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Playlist
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}