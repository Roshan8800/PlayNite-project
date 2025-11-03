
import { useRouter } from 'next/router';
import Head from 'next/head';

export const CanonicalHead = ({ canonicalUrl }) => {
  const router = useRouter();
  const canonical = canonicalUrl || `https://yourdomain.com${router.asPath}`;

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
