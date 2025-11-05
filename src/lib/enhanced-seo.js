
// Enhanced SEO utilities with additional structured data

export function generateBreadcrumbStructuredData(breadcrumbs, baseUrl = 'https://play-nite-project-git-main-roshans-projects-2d6e3f6b.vercel.app') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.url}`
    }))
  };
}

export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PlayNite',
    url: 'https://play-nite-project-git-main-roshans-projects-2d6e3f6b.vercel.app',
    logo: 'https://play-nite-project-git-main-roshans-projects-2d6e3f6b.vercel.app/logo.png',
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
    url: 'https://play-nite-project-git-main-roshans-projects-2d6e3f6b.vercel.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://play-nite-project-git-main-roshans-projects-2d6e3f6b.vercel.app/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };
}
