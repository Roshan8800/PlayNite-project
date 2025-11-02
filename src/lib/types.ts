export type Video = {
  id: string;
  title: string;
  channel?: string;
  channelId?: string;
  views: number;
  uploadedAt?: string;
  thumbnailUrl: string;
  thumbnailHint?: string;
  duration: string;
  description?: string;
  channelAvatarUrl?: string;
  videoUrl: string;
  category?: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
  tags?: string[];
  summary?: string;
  addedAt?: string;
  ageRestriction?: number;
  // Additional fields from CSV import
  pornstars?: string;
  rating?: number;
  likes?: number;
  dislikes?: number;
  categories?: string[];
  thumbnail_urls?: string[];
  screenshots?: string[];
  iframe_code?: string;
  embed_code?: string;
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
  status?: 'Active' | 'Inactive';
  pushNotificationsEnabled?: boolean;
  parentalControlsEnabled?: boolean;
  ageRestriction?: number;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
};
