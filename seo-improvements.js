/**
 * SEO Improvements Script
 * This script applies various SEO enhancements to the Next.js project
 */

const fs = require('fs');
const path = require('path');

// 1. Sitemap Generation
function generateSitemap() {
  console.log('Generating sitemap...');
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/categories</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/trending</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/live</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.7</priority>
  </url>
  <!-- Add more URLs as needed -->
</urlset>`;

  fs.writeFileSync(path.join(__dirname, 'public/sitemap.xml'), sitemapContent);
  console.log('Sitemap generated.');
}

// 2. Robots.txt Creation
function createRobotsTxt() {
  console.log('Creating robots.txt...');
  const robotsContent = `User-agent: *
Allow: /

# Block access to admin areas
Disallow: /admin/
Disallow: /api/admin/

# Block access to user-specific pages
Disallow: /profile/
Disallow: /settings/

# Allow access to sitemap
Sitemap: https://yourdomain.com/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1
`;

  fs.writeFileSync(path.join(__dirname, 'public/robots.txt'), robotsContent);
  console.log('Robots.txt created.');
}

// 3. Structured Data Enhancements
function enhanceStructuredData() {
  console.log('Enhancing structured data...');
  const enhancedSeo = `
// Enhanced SEO utilities with additional structured data

export function generateBreadcrumbStructuredData(breadcrumbs, baseUrl = 'https://yourdomain.com') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: \`\${baseUrl}\${crumb.url}\`
    }))
  };
}

export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PlayNite',
    url: 'https://yourdomain.com',
    logo: 'https://yourdomain.com/logo.png',
    sameAs: [
      'https://twitter.com/playnite',
      'https://facebook.com/playnite'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-123-4567',
      contactType: 'customer service'
    }
  };
}

export function generateWebSiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PlayNite',
    url: 'https://yourdomain.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://yourdomain.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };
}
`;

  fs.writeFileSync(path.join(__dirname, 'src/lib/enhanced-seo.js'), enhancedSeo);
  console.log('Enhanced structured data utilities created.');
}

// 4. Canonical URLs Implementation
function implementCanonicalUrls() {
  console.log('Implementing canonical URLs...');
  const canonicalComponent = `
import { useRouter } from 'next/router';
import Head from 'next/head';

export const CanonicalHead = ({ canonicalUrl }) => {
  const router = useRouter();
  const canonical = canonicalUrl || \`https://yourdomain.com\${router.asPath}\`;

  return (
    <Head>
      <link rel="canonical" href={canonical} />
      {/* Additional meta tags for better SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="revisit-after" content="1 days" />
    </Head>
  );
};
`;

  fs.writeFileSync(path.join(__dirname, 'src/components/canonical-head.js'), canonicalComponent);
  console.log('Canonical URLs component created.');
}

// 5. Open Graph and Twitter Card Enhancements
function enhanceSocialTags() {
  console.log('Enhancing social media tags...');
  const socialTags = `
export function generateEnhancedSocialTags(video, baseUrl = 'https://yourdomain.com') {
  const title = video.title || 'PlayNite - Modern Video Streaming';
  const description = video.description || 'Watch high-quality videos on PlayNite.';
  const image = video.thumbnailUrl || \`\${baseUrl}/og-default.jpg\`;

  return {
    // Open Graph
    'og:title': title,
    'og:description': description,
    'og:image': image,
    'og:url': \`\${baseUrl}/video/\${video.id}\`,
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
`;

  fs.writeFileSync(path.join(__dirname, 'src/lib/social-tags.js'), socialTags);
  console.log('Enhanced social media tags utilities created.');
}

// 6. Update Layout with SEO Enhancements
function updateLayoutForSEO() {
  console.log('Updating layout for SEO...');
  const layoutPath = path.join(__dirname, 'src/app/layout.tsx');
  let layoutContent = fs.readFileSync(layoutPath, 'utf8');

  // Add more comprehensive metadata
  const enhancedMetadata = `
export const metadata: Metadata = {
  title: 'PlayNite - Modern Video Streaming Platform',
  description: 'Discover and stream high-quality videos on PlayNite. Watch trending content, explore categories, and enjoy live streams.',
  keywords: 'video streaming, online videos, entertainment, live streams, trending videos',
  authors: [{ name: 'PlayNite Team' }],
  creator: 'PlayNite',
  publisher: 'PlayNite',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://yourdomain.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'PlayNite - Modern Video Streaming Platform',
    description: 'Discover and stream high-quality videos on PlayNite.',
    url: 'https://yourdomain.com',
    siteName: 'PlayNite',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PlayNite - Video Streaming Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlayNite - Modern Video Streaming Platform',
    description: 'Discover and stream high-quality videos on PlayNite.',
    images: ['/og-image.jpg'],
    creator: '@playnite',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    bing: 'your-bing-verification-code',
  },
};
`;

  layoutContent = layoutContent.replace(/export const metadata: Metadata = \{[\s\S]*?\};/, enhancedMetadata);

  fs.writeFileSync(layoutPath, layoutContent);
  console.log('Layout updated with enhanced SEO metadata.');
}

// Run all SEO improvements
function runSEOImprovements() {
  console.log('Starting SEO improvements...');
  generateSitemap();
  createRobotsTxt();
  enhanceStructuredData();
  implementCanonicalUrls();
  enhanceSocialTags();
  updateLayoutForSEO();
  console.log('SEO improvements completed!');
}

if (require.main === module) {
  runSEOImprovements();
}

module.exports = { runSEOImprovements };