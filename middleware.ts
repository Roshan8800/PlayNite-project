import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone the response
  const response = NextResponse.next();

  // Check if the request is for the watch page
  if (request.nextUrl.pathname.startsWith('/watch')) {
    // Define trusted iframe sources for adult video sites
    const trustedIframeSources = [
      'https://*.pornhub.com',
      'https://*.xvideos.com',
      'https://*.xhamster.com',
      'https://*.youporn.com',
      'https://*.redtube.com',
      'https://*.tube8.com',
      'https://*.spankbang.com',
      'https://*.xnxx.com',
      'https://*.beeg.com',
      'https://*.pornhd.com',
      'https://*.xhamster.com',
      'https://*.tnaflix.com',
      'https://*.keezmovies.com',
      'https://*.realitykings.com',
      'https://*.bangbros.com',
      'https://*.naughtyamerica.com',
      'https://*.brazzers.com',
      'https://*.digitalplayground.com',
      'https://*.evilangel.com',
      'https://*.julesjordan.com',
      'https://*.blacked.com',
      'https://*.tushy.com',
      'https://*.vixen.com',
      'https://*.legalporno.com',
      'https://*.porn.com',
      'https://*.sex.com',
      'https://*.adultfriendfinder.com',
      'https://*.onlyfans.com',
      'https://*.manyvids.com',
      'https://*.justforfans.com',
      'https://*.fansly.com',
      'https://*.camgirls.com',
      'https://*.chaturbate.com',
      'https://*.myfreecams.com',
      'https://*.bonga.com',
      'https://*.stripchat.com',
      'https://*.camsoda.com',
      'https://*.flirt4free.com',
      'https://*.imlive.com',
      'https://*.jasmin.com',
      'https://*.livejasmin.com',
      'https://*.mysexycams.com',
      'https://*.webcam.com',
      'https://*.camster.com',
      'https://*.camcontacts.com',
      'https://*.camfrog.com',
      'https://*.omegle.com',
      'https://*.chatroulette.com',
      'https://*.chatzy.com',
      'https://*.chatavenue.com',
      'https://*.wireclub.com',
      'https://*.ome.tv',
      'https://*.coomeet.com',
      'https://*.shagle.com',
      'https://*.chatspin.com',
      'https://*.omegle.tv',
      'https://*.omegle.com',
      'https://*.chatroulette.com',
      'https://*.chatzy.com',
      'https://*.chatavenue.com',
      'https://*.wireclub.com',
      'https://*.ome.tv',
      'https://*.coomeet.com',
      'https://*.shagle.com',
      'https://*.chatspin.com',
      'https://*.omegle.tv',
    ];

    // Build the frame-src directive
    const frameSrc = `'self' ${trustedIframeSources.join(' ')}`;

    // Set a more permissive CSP for watch pages
    const csp = `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; media-src 'self' https: blob:; frame-src ${frameSrc}; connect-src 'self' https: wss:; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';`;

    response.headers.set('Content-Security-Policy', csp);
  }

  return response;
}

export const config = {
  matcher: '/watch/:path*',
};