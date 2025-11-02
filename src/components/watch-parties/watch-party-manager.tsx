'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { doc, collection, query, where, orderBy, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { Play, Pause, Users, MessageCircle, Share2, Crown, Mic, MicOff, Video, VideoOff, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WatchParty {
  id: string;
  name: string;
  description: string;
  videoId: string;
  videoTitle: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  participants: string[];
  participantDetails: Array<{
    id: string;
    name: string;
    avatar?: string;
    joinedAt: string;
    isHost: boolean;
  }>;
  isActive: boolean;
  isPrivate: boolean;
  maxParticipants: number;
  currentTime: number;
  isPlaying: boolean;
  createdAt: string;
  chatMessages: Array<{
    id: string;
    userId: string;
    userName: string;
    message: string;
    timestamp: string;
  }>;
}

interface WatchPartyManagerProps {
  videoId: string;
  videoTitle: string;
  className?: string;
}

export function WatchPartyManager({ videoId, videoTitle, className }: WatchPartyManagerProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [watchParties, setWatchParties] = useState<WatchParty[]>([]);
  const [activeParty, setActiveParty] = useState<WatchParty | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newParty, setNewParty] = useState({
    name: '',
    description: '',
    isPrivate: false,
    maxParticipants: 10,
  });
  const [chatMessage, setChatMessage] = useState('');
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  // Real-time sync for active party
  useEffect(() => {
    if (!activeParty) return;

    const partyRef = doc(firestore, 'watchParties', activeParty.id);
    const unsubscribe = onSnapshot(partyRef, (doc) => {
      if (doc.exists()) {
        const partyData = { ...doc.data(), id: doc.id } as WatchParty;
        setActiveParty(partyData);
      }
    });

    return unsubscribe;
  }, [activeParty?.id, firestore]);

  // Fetch available watch parties for this video
  const partiesQuery = query(
    collection(firestore, 'watchParties'),
    where('videoId', '==', videoId),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );

  const { data: availableParties, loading } = useCollection(partiesQuery);

  useEffect(() => {
    if (availableParties) {
      setWatchParties(availableParties as WatchParty[]);
    }
  }, [availableParties]);

  const createWatchParty = async () => {
    if (!user || !newParty.name.trim()) return;

    try {
      const partyRef = doc(collection(firestore, 'watchParties'));
      const partyData: Omit<WatchParty, 'id'> = {
        name: newParty.name,
        description: newParty.description,
        videoId,
        videoTitle,
        hostId: user.uid,
        hostName: user.name || 'Anonymous',
        hostAvatar: user.avatarUrl || undefined,
        participants: [user.uid],
        participantDetails: [{
          id: user.uid,
          name: user.name || 'Anonymous',
          avatar: user.avatarUrl || undefined,
          joinedAt: new Date().toISOString(),
          isHost: true,
        }],
        isActive: true,
        isPrivate: newParty.isPrivate,
        maxParticipants: newParty.maxParticipants,
        currentTime: 0,
        isPlaying: false,
        createdAt: new Date().toISOString(),
        chatMessages: [],
      };

      await setDoc(partyRef, partyData);

      setNewParty({ name: '', description: '', isPrivate: false, maxParticipants: 10 });
      setShowCreateForm(false);

      toast({
        title: 'Watch party created',
        description: `"${newParty.name}" is now live!`,
      });
    } catch (error) {
      console.error('Error creating watch party:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create watch party.',
      });
    }
  };

  const joinWatchParty = async (party: WatchParty) => {
    if (!user) return;

    if (party.participants.includes(user.uid)) {
      setActiveParty(party);
      return;
    }

    if (party.participants.length >= party.maxParticipants) {
      toast({
        variant: 'destructive',
        title: 'Party full',
        description: 'This watch party is at maximum capacity.',
      });
      return;
    }

    try {
      const partyRef = doc(firestore, 'watchParties', party.id);
      await updateDoc(partyRef, {
        participants: arrayUnion(user.uid),
        participantDetails: arrayUnion({
          id: user.uid,
          name: user.name || 'Anonymous',
          avatar: user.avatarUrl,
          joinedAt: new Date().toISOString(),
          isHost: false,
        }),
      });

      setActiveParty({ ...party, participants: [...party.participants, user.uid] });

      toast({
        title: 'Joined watch party',
        description: `Welcome to "${party.name}"!`,
      });
    } catch (error) {
      console.error('Error joining watch party:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to join watch party.',
      });
    }
  };

  const leaveWatchParty = async () => {
    if (!user || !activeParty) return;

    try {
      const partyRef = doc(firestore, 'watchParties', activeParty.id);
      await updateDoc(partyRef, {
        participants: arrayRemove(user.uid),
        participantDetails: activeParty.participantDetails.filter(p => p.id !== user.uid),
      });

      // If host leaves, end the party
      if (activeParty.hostId === user.uid) {
        await updateDoc(partyRef, { isActive: false });
      }

      setActiveParty(null);

      toast({
        title: 'Left watch party',
        description: 'You have left the watch party.',
      });
    } catch (error) {
      console.error('Error leaving watch party:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to leave watch party.',
      });
    }
  };

  const sendChatMessage = async () => {
    if (!user || !activeParty || !chatMessage.trim()) return;

    try {
      const partyRef = doc(firestore, 'watchParties', activeParty.id);
      const message = {
        id: Date.now().toString(),
        userId: user.uid,
        userName: user.name || 'Anonymous',
        message: chatMessage.trim(),
        timestamp: new Date().toISOString(),
      };

      await updateDoc(partyRef, {
        chatMessages: arrayUnion(message),
      });

      setChatMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message.',
      });
    }
  };

  const togglePlayback = async () => {
    if (!activeParty || activeParty.hostId !== user?.uid) return;

    try {
      const partyRef = doc(firestore, 'watchParties', activeParty.id);
      await updateDoc(partyRef, {
        isPlaying: !activeParty.isPlaying,
      });
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  if (!user) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-muted-foreground">Please log in to join watch parties.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Watch Parties
          </h3>
          <p className="text-sm text-muted-foreground">Watch together with friends</p>
        </div>
        {!activeParty && (
          <Button onClick={() => setShowCreateForm(true)} size="sm">
            <Play className="h-4 w-4 mr-2" />
            Create Party
          </Button>
        )}
      </div>

      {/* Active Party */}
      {activeParty && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              {activeParty.name}
              {activeParty.hostId === user.uid && <Crown className="h-4 w-4 text-yellow-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Participants */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Participants:</span>
              {activeParty.participantDetails.map((participant) => (
                <div key={participant.id} className="flex items-center gap-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={participant.avatar} alt={participant.name} />
                    <AvatarFallback className="text-xs">{participant.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{participant.name}</span>
                  {participant.isHost && <Crown className="h-3 w-3 text-yellow-500" />}
                </div>
              ))}
            </div>

            {/* Controls (Host Only) */}
            {activeParty.hostId === user.uid && (
              <div className="flex items-center gap-2">
                <Button onClick={togglePlayback} size="sm" variant="outline">
                  {activeParty.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Chat */}
            <div className="space-y-2">
              <div className="h-32 overflow-y-auto border rounded p-2 space-y-1">
                {activeParty.chatMessages.map((msg) => (
                  <div key={msg.id} className="text-xs">
                    <span className="font-medium">{msg.userName}:</span> {msg.message}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  className="text-sm"
                />
                <Button onClick={sendChatMessage} size="sm" disabled={!chatMessage.trim()}>
                  Send
                </Button>
              </div>
            </div>

            <Button onClick={leaveWatchParty} variant="outline" className="w-full">
              Leave Party
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Party Form */}
      {showCreateForm && !activeParty && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create Watch Party</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="party-name">Party Name</Label>
              <Input
                id="party-name"
                placeholder="Enter party name"
                value={newParty.name}
                onChange={(e) => setNewParty(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="party-description">Description (Optional)</Label>
              <Textarea
                id="party-description"
                placeholder="Describe your watch party"
                value={newParty.description}
                onChange={(e) => setNewParty(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-private"
                checked={newParty.isPrivate}
                onChange={(e) => setNewParty(prev => ({ ...prev, isPrivate: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="is-private" className="text-sm">Private party</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-participants">Max Participants</Label>
              <Input
                id="max-participants"
                type="number"
                min="2"
                max="50"
                value={newParty.maxParticipants}
                onChange={(e) => setNewParty(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createWatchParty} disabled={!newParty.name.trim()}>
                Create Party
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Parties */}
      {!activeParty && (
        <div className="space-y-4">
          <h4 className="font-medium">Available Watch Parties</h4>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-32"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                      </div>
                      <div className="h-8 bg-muted rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : watchParties.length > 0 ? (
            <div className="space-y-3">
              {watchParties.map((party) => (
                <Card key={party.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{party.name}</h4>
                          <Badge variant={party.isPrivate ? 'secondary' : 'default'} className="text-xs">
                            {party.isPrivate ? 'Private' : 'Public'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Hosted by {party.hostName} • {party.participants.length}/{party.maxParticipants} participants
                        </p>
                        {party.description && (
                          <p className="text-xs text-muted-foreground">{party.description}</p>
                        )}
                      </div>
                      <Button onClick={() => joinWatchParty(party)} size="sm">
                        Join Party
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No active watch parties for this video.</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Play className="h-4 w-4 mr-2" />
                Start the First Party
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}