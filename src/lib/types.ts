export type Video = {
  id: string;
  title: string;
  channel: string;
  views: string;
  uploadedAt: string;
  thumbnailUrl: string;
  thumbnailHint?: string;
  duration: string;
  description: string;
  channelAvatarUrl: string;
  videoUrl: string;
  category: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  tags?: string[];
};

export type Category = {
  id: string;
  name: string;
  thumbnailUrl: string;
  thumbnailHint?: string;
};

export type User = {
  uid: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: 'Admin' | 'User';
  joinedDate: string;
};
