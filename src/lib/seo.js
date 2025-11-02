/**
 * SEO utilities for adult content
 * Provides functions for generating safe titles, descriptions, and structured data
 */

/**
 * Curates tags by filtering out unsafe or duplicate tags
 * @param {string[]} tags - Array of tags
 * @returns {string[]} - Curated array of tags
 */
export function curateTags(tags) {
  if (!tags || !Array.isArray(tags)) return [];

  // Filter out empty, duplicate, and potentially unsafe tags
  const uniqueTags = [...new Set(tags.filter(tag =>
    tag &&
    typeof tag === 'string' &&
    tag.trim().length > 0 &&
    tag.length <= 50 // Reasonable tag length limit
  ))];

  // Sort by relevance (could be enhanced with scoring)
  return uniqueTags.sort();
}

/**
 * Generates a safe title based on video data and curated tags
 * Formula: [Primary Tag/Category] - [Title] | [Site Name]
 * @param {Object} video - Video object
 * @param {string} siteName - Site name for branding
 * @returns {string} - Safe SEO title
 */
export function generateSafeTitle(video, siteName = 'Adult Video Platform') {
  if (!video || !video.title) return siteName;

  const curatedTags = curateTags(video.tags || []);
  const primaryTag = curatedTags[0] || video.category || 'Adult Video';

  // Clean title: remove excessive punctuation, normalize spaces
  const cleanTitle = video.title
    .replace(/[^\w\s-]/g, '') // Remove special chars except hyphens
    .replace(/\s+/g, ' ')
    .trim();

  // Formula: Primary Tag - Title | Site Name
  const title = `${primaryTag} - ${cleanTitle} | ${siteName}`;

  // Ensure reasonable length (Google recommends < 60 chars)
  return title.length > 60 ? title.substring(0, 57) + '...' : title;
}

/**
 * Generates a meta description based on video data
 * Formula: [Title]. [Description snippet]. Featuring [pornstars/tags]. [views/duration info].
 * @param {Object} video - Video object
 * @returns {string} - SEO meta description
 */
export function generateDescription(video) {
  if (!video) return 'Watch high-quality adult videos on our platform.';

  const parts = [];

  // Add title
  if (video.title) {
    parts.push(video.title);
  }

  // Add description snippet (first 100 chars)
  if (video.description) {
    const snippet = video.description.substring(0, 100);
    if (snippet) parts.push(snippet + (video.description.length > 100 ? '...' : ''));
  }

  // Add pornstars or channel
  if (video.pornstars) {
    parts.push(`Featuring ${video.pornstars}.`);
  } else if (video.channel) {
    parts.push(`By ${video.channel}.`);
  }

  // Add curated tags (top 3)
  const curatedTags = curateTags(video.tags || []);
  if (curatedTags.length > 0) {
    const topTags = curatedTags.slice(0, 3).join(', ');
    parts.push(`Tags: ${topTags}.`);
  }

  // Add engagement info
  const engagement = [];
  if (video.views) {
    const views = video.views > 1000000
      ? `${(video.views / 1000000).toFixed(1)}M views`
      : video.views > 1000
      ? `${(video.views / 1000).toFixed(0)}K views`
      : `${video.views} views`;
    engagement.push(views);
  }
  if (video.duration) {
    engagement.push(`${video.duration} long`);
  }
  if (engagement.length > 0) {
    parts.push(engagement.join(', ') + '.');
  }

  const description = parts.join(' ');

  // Ensure reasonable length (Google recommends < 160 chars)
  return description.length > 160 ? description.substring(0, 157) + '...' : description;
}

/**
 * Generates structured data (JSON-LD) for video SEO
 * Uses VideoObject schema for rich snippets
 * @param {Object} video - Video object
 * @param {string} baseUrl - Base URL of the site
 * @returns {Object} - JSON-LD structured data
 */
export function generateStructuredData(video, baseUrl = 'https://example.com') {
  if (!video || !video.id) return null;

  const videoUrl = `${baseUrl}/video/${video.id}`;
  const thumbnailUrl = video.thumbnailUrl || `${baseUrl}/placeholder-thumbnail.jpg`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title || 'Adult Video',
    description: generateDescription(video),
    thumbnailUrl: thumbnailUrl,
    uploadDate: video.uploadedAt || new Date().toISOString(),
    duration: video.duration ? `PT${video.duration.replace(':', 'M').replace(':', 'S')}S` : undefined,
    contentUrl: video.videoUrl || videoUrl,
    embedUrl: videoUrl,
    interactionStatistic: video.views ? {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/WatchAction',
      userInteractionCount: video.views
    } : undefined,
    author: {
      '@type': 'Person',
      name: video.pornstars || video.channel || 'Unknown'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Adult Video Platform',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    },
    keywords: curateTags(video.tags || []).join(', '),
    inLanguage: 'en-US',
    isFamilyFriendly: false, // Explicitly mark as adult content
    genre: video.category || 'Adult'
  };

  // Remove undefined properties
  Object.keys(structuredData).forEach(key => {
    if (structuredData[key] === undefined) {
      delete structuredData[key];
    }
  });

  return structuredData;
}

/**
 * Generates safe metadata object for use in Next.js head or similar
 * @param {Object} video - Video object
 * @param {string} baseUrl - Base URL of the site
 * @param {string} siteName - Site name
 * @returns {Object} - Metadata object
 */
export function generateSafeMetadata(video, baseUrl = 'https://example.com', siteName = 'Adult Video Platform') {
  return {
    title: generateSafeTitle(video, siteName),
    description: generateDescription(video),
    keywords: curateTags(video.tags || []).join(', '),
    openGraph: {
      title: generateSafeTitle(video, siteName),
      description: generateDescription(video),
      images: [{
        url: video.thumbnailUrl || `${baseUrl}/placeholder-thumbnail.jpg`,
        width: 1200,
        height: 630,
        alt: video.title || 'Video thumbnail'
      }],
      type: 'video.other',
      siteName: siteName
    },
    twitter: {
      card: 'summary_large_image',
      title: generateSafeTitle(video, siteName),
      description: generateDescription(video),
      images: [video.thumbnailUrl || `${baseUrl}/placeholder-thumbnail.jpg`]
    },
    structuredData: generateStructuredData(video, baseUrl)
  };
}