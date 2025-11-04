import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '18+ Content Disclaimer | PlayNite',
  description: 'Important disclaimer regarding adult content on PlayNite. This website contains explicit material intended for adults 18 years and older only.',
  keywords: '18+, adult content, disclaimer, age restriction, explicit material',
  robots: 'noindex, nofollow',
  openGraph: {
    title: '18+ Content Disclaimer | PlayNite',
    description: 'Important disclaimer regarding adult content on PlayNite. This website contains explicit material intended for adults 18 years and older only.',
    type: 'website',
  },
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">18+ Content Disclaimer</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg mb-6">
          <strong>WARNING: This website contains explicit adult content.</strong>
        </p>

        <p>
          PlayNite is an adult entertainment platform that provides access to explicit sexual content,
          including videos, images, and other media intended for mature audiences only. Our platform
          embeds videos from approved third-party platforms (such as Pornhub). We do not host, upload,
          or store any video content on our own servers. By accessing this website, you acknowledge and
          agree that you are at least 18 years of age (or the age of majority in your jurisdiction, whichever is greater).
        </p>

        <h2>Age Restrictions</h2>
        <p>
          Access to this website is strictly limited to individuals who are 18 years of age or older,
          or the age of legal majority in their jurisdiction. If you are under the legal age in your
          area, you must exit this website immediately.
        </p>

        <h2>Content Warning</h2>
        <p>
          The content on this website includes:
        </p>
        <ul>
          <li>Explicit sexual content and nudity</li>
          <li>Adult entertainment videos and media embedded from third-party platforms</li>
          <li>Potentially offensive or disturbing material</li>
          <li>User-generated content that may not reflect our values</li>
          <li>Content from external sources over which we have no control</li>
        </ul>

        <h2>Legal Compliance</h2>
        <p>
          PlayNite complies with all applicable laws regarding adult content distribution. We do not
          knowingly collect or distribute content involving minors. For content embedded from third-party
          platforms, we rely on those platforms' compliance with applicable laws. If you encounter any
          content that violates our policies or applicable laws, please report it immediately. For issues
          with embedded content, we recommend contacting the original platform directly.
        </p>

        <h2>Parental Controls</h2>
        <p>
          We recommend that parents and guardians use appropriate parental control tools to prevent
          minors from accessing adult content online. PlayNite is not responsible for the actions of
          individuals who bypass age restrictions.
        </p>

        <h2>Health and Safety</h2>
        <p>
          Adult content should be consumed responsibly. If you or someone you know is struggling with
          compulsive sexual behavior or related issues, please seek professional help. Resources
          include:
        </p>
        <ul>
          <li>National Council on Sexual Addiction and Compulsivity</li>
          <li>Sex Addicts Anonymous</li>
          <li>Professional mental health services</li>
        </ul>

        <p className="mt-6">
          By continuing to use this website, you confirm that you understand and accept these terms.
          If you do not agree, please exit immediately.
        </p>
      </div>
    </div>
  );
}