
import { PlaceHolderImages } from './placeholder-images';

export type Video = {
  id: string;
  title: string;
  channel: string;
  views: string;
  uploadedAt: string;
  thumbnailUrl: string;
  thumbnailHint: string;
  duration: string;
  description: string;
  channelAvatarUrl: string;
  videoUrl: string;
};

export type Category = {
  id: string;
  name: string;
  thumbnailUrl: string;
  thumbnailHint: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Admin' | 'User';
  status: 'Active' | 'Inactive';
  joinedDate: string;
};

const getImage = (id: string) => {
  const image = PlaceHolderImages.find((img) => img.id === id);
  return {
    url: image?.imageUrl || 'https://picsum.photos/seed/error/200/300',
    hint: image?.imageHint || 'placeholder',
  };
};

export const videos: Video[] = [
  {
    id: '1',
    title: 'Future Funk Metropolis',
    channel: 'SynthWave Dreams',
    views: '1.2M',
    uploadedAt: '2 weeks ago',
    thumbnailUrl: getImage('video-1').url,
    thumbnailHint: getImage('video-1').hint,
    duration: '04:32',
    description: 'A journey through the neon-lit streets of a retro-futuristic city. Powered by AI-enhanced visuals and a synth-heavy soundtrack.',
    channelAvatarUrl: getImage('avatar-1').url,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: '2',
    title: 'Cyber City Stories',
    channel: 'NeoVisions',
    views: '3.5M',
    uploadedAt: '1 month ago',
    thumbnailUrl: getImage('video-2').url,
    thumbnailHint: getImage('video-2').hint,
    duration: '15:45',
    description: 'An anthology of short films exploring life in a high-tech, low-life metropolis. Features AI-generated characters and plotlines.',
    channelAvatarUrl: getImage('avatar-2').url,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  },
  {
    id: '3',
    title: 'Zen Mind: A Guide to Modern Meditation',
    channel: 'Calm Collective',
    views: '890K',
    uploadedAt: '3 days ago',
    thumbnailUrl: getImage('video-3').url,
    thumbnailHint: getImage('video-3').hint,
    duration: '22:10',
    description: 'Learn mindfulness techniques for the digital age. This session is enhanced with AI-driven personalized relaxation cues.',
    channelAvatarUrl: getImage('avatar-3').url,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    id: '4',
    title: 'The Art of Plating',
    channel: 'CulinaryCraft',
    views: '650K',
    uploadedAt: '5 days ago',
    thumbnailUrl: getImage('video-4').url,
    thumbnailHint: getImage('video-4').hint,
    duration: '08:19',
    description: 'Michelin-star chef Ana Ros shows you how to turn your dishes into works of art. Features AI-powered suggestions for presentation.',
    channelAvatarUrl: getImage('avatar-4').url,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  },
  {
    id: '5',
    title: 'Echoes of the Alps',
    channel: 'Nature\'s Narrative',
    views: '2.1M',
    uploadedAt: '3 weeks ago',
    thumbnailUrl: getImage('video-5').url,
    thumbnailHint: getImage('video-5').hint,
    duration: '45:00',
    description: 'A breathtaking 4K documentary on the Alpine wilderness, with AI-enhanced color grading and a dynamic, responsive score.',
    channelAvatarUrl: getImage('avatar-5').url,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  },
  {
    id: '6',
    title: 'Abstract Expressions',
    channel: 'Canvas Chronicles',
    views: '450K',
    uploadedAt: '1 week ago',
    thumbnailUrl: getImage('video-6').url,
    thumbnailHint: getImage('video-6').hint,
    duration: '12:30',
    description: 'Watch as a blank canvas is transformed into a masterpiece of abstract art. The process is analyzed in real-time by a creative AI.',
    channelAvatarUrl: getImage('avatar-1').url,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
  },
  {
    id: '7',
    title: 'The Vinyl Revival',
    channel: 'AudioPhile',
    views: '780K',
    uploadedAt: '2 months ago',
    thumbnailUrl: getImage('video-7').url,
    thumbnailHint: getImage('video-7').hint,
    duration: '18:55',
    description: 'Exploring the resurgence of vinyl records in the digital age. Includes AI-powered audio restoration of classic tracks.',
    channelAvatarUrl: getImage('avatar-2').url,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
  },
  {
    id: '8',
    title: 'Metropolis in Motion',
    channel: 'Urban Explorers',
    views: '1.9M',
    uploadedAt: '1 day ago',
    thumbnailUrl: getImage('video-8').url,
    thumbnailHint: getImage('video-8').hint,
    duration: '03:15',
    description: 'A stunning hyper-lapse of city life from dusk till dawn. The video pathing was optimized by an AI for the most dynamic shots.',
    channelAvatarUrl: getImage('avatar-3').url,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
  },
  {
    id: '9',
    title: 'Building an AI with Python',
    channel: 'CodeStream',
    views: '4.2M',
    uploadedAt: '6 months ago',
    thumbnailUrl: getImage('video-9').url,
    thumbnailHint: getImage('video-9').hint,
    duration: '01:15:20',
    description: 'A comprehensive tutorial on creating a neural network from scratch. The code is explained by an AI assistant.',
    channelAvatarUrl: getImage('avatar-4').url,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4'
  },
  {
    id: '10',
    title: 'Journey to the Stars',
    channel: 'Cosmic Odyssey',
    views: '5.1M',
    uploadedAt: '4 weeks ago',
    thumbnailUrl: getImage('video-10').url,
    thumbnailHint: getImage('video-10').hint,
    duration: '55:30',
    description: 'Experience the thrill of space exploration with stunning visuals from recent missions. Includes AI-generated simulations of exoplanets.',
    channelAvatarUrl: getImage('avatar-5').url,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
  },
];

export const categories: Category[] = [
  { id: '1', name: 'Action', thumbnailUrl: getImage('category-1').url, thumbnailHint: getImage('category-1').hint },
  { id: '2', name: 'Comedy', thumbnailUrl: getImage('category-2').url, thumbnailHint: getImage('category-2').hint },
  { id: '3', name: 'Documentary', thumbnailUrl: getImage('category-3').url, thumbnailHint: getImage('category-3').hint },
  { id: '4', name: 'Sci-Fi', thumbnailUrl: getImage('category-4').url, thumbnailHint: getImage('category-4').hint },
  { id: '5', name: 'Horror', thumbnailUrl: getImage('category-5').url, thumbnailHint: getImage('category-5').hint },
  { id: '6', name: 'Romance', thumbnailUrl: getImage('category-6').url, thumbnailHint: getImage('category-6').hint },
];

export const users: User[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', avatarUrl: getImage('avatar-1').url, role: 'Admin', status: 'Active', joinedDate: '2023-01-15' },
  { id: '2', name: 'Maria Garcia', email: 'maria@example.com', avatarUrl: getImage('avatar-2').url, role: 'User', status: 'Active', joinedDate: '2023-02-20' },
  { id: '3', name: 'James Smith', email: 'james@example.com', avatarUrl: getImage('avatar-3').url, role: 'User', status: 'Inactive', joinedDate: '2023-03-10' },
  { id: '4', name: 'Priya Patel', email: 'priya@example.com', avatarUrl: getImage('avatar-4').url, role: 'User', status: 'Active', joinedDate: '2023-04-05' },
  { id: '5', name: 'Chen Wang', email: 'chen@example.com', avatarUrl: getImage('avatar-5').url, role: 'Admin', status: 'Active', joinedDate: '2023-05-21' },
];

export const videoPlayerImage = getImage('video-player-main');
