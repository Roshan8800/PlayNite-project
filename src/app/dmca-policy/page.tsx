import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DMCA Policy | PlayNite',
  description: 'Digital Millennium Copyright Act (DMCA) policy for PlayNite. Learn how we handle copyright infringement claims and takedown notices.',
  keywords: 'DMCA, copyright policy, takedown notice, copyright infringement, digital rights',
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'DMCA Policy | PlayNite',
    description: 'Digital Millennium Copyright Act (DMCA) policy for PlayNite. Learn how we handle copyright infringement claims and takedown notices.',
    type: 'website',
  },
};

export default function DMCAPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">DMCA Policy</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <p>
          PlayNite ("we," "us," or "our") respects the intellectual property rights of others and
          expects our users to do the same. It is our policy to respond to clear notices of alleged
          copyright infringement that comply with the Digital Millennium Copyright Act ("DMCA").
        </p>

        <h2>Reporting Copyright Infringement</h2>
        <p>
          If you believe that your work has been copied in a way that constitutes copyright infringement,
          please provide our designated agent with the following information:
        </p>

        <ol>
          <li>
            <strong>A physical or electronic signature</strong> of a person authorized to act on behalf
            of the owner of an exclusive right that is allegedly infringed.
          </li>
          <li>
            <strong>Identification of the copyrighted work</strong> claimed to have been infringed, or,
            if multiple copyrighted works at a single online site are covered by a single notification,
            a representative list of such works at that site.
          </li>
          <li>
            <strong>Identification of the material</strong> that is claimed to be infringing or to be
            the subject of infringing activity and that is to be removed or access to which is to be
            disabled, and information reasonably sufficient to permit us to locate the material.
          </li>
          <li>
            <strong>Information reasonably sufficient to permit us</strong> to contact the complaining party,
            such as an address, telephone number, and, if available, an electronic mail address at which
            the complaining party may be contacted.
          </li>
          <li>
            <strong>A statement that the complaining party has a good faith belief</strong> that use of
            the material in the manner complained of is not authorized by the copyright owner, its agent,
            or the law.
          </li>
          <li>
            <strong>A statement that the information in the notification is accurate</strong>, and under
            penalty of perjury, that the complaining party is authorized to act on behalf of the owner
            of an exclusive right that is allegedly infringed.
          </li>
        </ol>

        <h2>Designated Agent Contact Information</h2>
        <div className="bg-muted p-4 rounded-lg mb-6">
          <p><strong>DMCA Agent:</strong> Copyright Compliance Officer</p>
          <p><strong>Email:</strong> dmca@playnite.com</p>
          <p><strong>Address:</strong> [Your Business Address]</p>
          <p><strong>Phone:</strong> [Your Phone Number]</p>
        </div>

        <h2>Counter-Notification</h2>
        <p>
          If you believe that your content was removed or access to it was disabled by mistake or
          misidentification, you may file a counter-notification with our designated agent. Your
          counter-notification must include:
        </p>

        <ol>
          <li>Your physical or electronic signature.</li>
          <li>
            Identification of the material that has been removed or to which access has been disabled
            and the location at which the material appeared before it was removed or access to it was disabled.
          </li>
          <li>
            A statement under penalty of perjury that you have a good faith belief that the material
            was removed or disabled as a result of mistake or misidentification.
          </li>
          <li>
            Your name, address, and telephone number, and a statement that you consent to the jurisdiction
            of Federal District Court for the judicial district in which your address is located, or if
            your address is outside of the United States, for any judicial district in which we may be found,
            and that you will accept service of process from the person who provided the original notification
            or an agent of such person.
          </li>
        </ol>

        <h2>Repeat Infringers</h2>
        <p>
          It is our policy to terminate the accounts of users who are repeat infringers of copyright.
          We reserve the right to terminate accounts that receive multiple DMCA notices.
        </p>

        <h2>Process</h2>
        <p>
          Upon receipt of a valid DMCA notice, we will:
        </p>
        <ol>
          <li>Remove or disable access to the allegedly infringing material.</li>
          <li>Notify the user who posted the content.</li>
          <li>Provide the user with an opportunity to respond.</li>
        </ol>

        <p>
          Upon receipt of a valid counter-notification, we will:
        </p>
        <ol>
          <li>Notify the original complainant.</li>
          <li>Restore the removed content within 10-14 business days, unless the complainant files a lawsuit.</li>
        </ol>

        <h2>False Claims</h2>
        <p>
          Please be aware that under Section 512(f) of the DMCA, any person who knowingly materially
          misrepresents that material or activity is infringing may be subject to liability for damages.
          Don't make false claims!
        </p>

        <h2>Contact Information</h2>
        <p>
          For any questions about this DMCA policy or to submit a notice, please contact our designated
          agent using the information provided above.
        </p>

        <p className="mt-6 text-sm text-muted-foreground">
          This policy is in compliance with the Digital Millennium Copyright Act (DMCA) and other applicable
          copyright laws. We take copyright infringement seriously and will respond to valid notices promptly.
        </p>
      </div>
    </div>
  );
}