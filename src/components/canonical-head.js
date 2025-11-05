
import { useRouter } from 'next/router';
import Head from 'next/head';

export const CanonicalHead = ({ canonicalUrl }) => {
  const router = useRouter();
  const canonical = canonicalUrl || `https://play-nite-project-git-main-roshans-projects-2d6e3f6b.vercel.app${router.asPath}`;

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
