
export function generateEnhancedSocialTags(video, baseUrl = 'https://yourdomain.com') {
  const title = video.title || 'PlayNite - Modern Video Streaming';
  const description = video.description || 'Watch high-quality videos on PlayNite.';
  const image = video.thumbnailUrl || `${baseUrl}/og-default.jpg`;

  return {
    // Open Graph
    'og:title': title,
    'og:description': description,
    'og:image': image,
    'og:url': `${baseUrl}/video/${video.id}`,
    'og:type': 'video.other',
    'og:site_name': 'PlayNite',
    'og:locale': 'en_US',

    // Twitter Card
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image,
    'twitter:site': '@playnite',
    'twitter:creator': '@playnite',

    // Additional video-specific tags
    'og:video': video.videoUrl,
    'og:video:secure_url': video.videoUrl,
    'og:video:type': 'video/mp4',
    'og:video:width': '1280',
    'og:video:height': '720',

    // Article tags if applicable
    'article:published_time': video.uploadedAt,
    'article:modified_time': video.updatedAt,
    'article:author': video.author,
    'article:section': video.category,
    'article:tag': video.tags?.join(', ')
  };
}
