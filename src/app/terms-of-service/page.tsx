import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | PlayNite',
  description: 'Terms of service and usage agreement for PlayNite. Read our terms and conditions for using our adult video streaming platform.',
  keywords: 'terms of service, terms and conditions, user agreement, legal terms, PlayNite',
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Terms of Service | PlayNite',
    description: 'Terms of service and usage agreement for PlayNite. Read our terms and conditions for using our adult video streaming platform.',
    type: 'website',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">Terms of Service</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <p>
          Welcome to PlayNite ("we," "us," or "our"). These Terms of Service ("Terms") govern your
          access to and use of our website and services. By accessing or using PlayNite, you agree
          to be bound by these Terms. If you do not agree to these Terms, please do not use our service.
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using PlayNite, you accept and agree to be bound by the terms and provision
          of this agreement. These Terms apply to all users of the site, including without limitation
          users who are browsers, vendors, customers, merchants, and/or contributors of content.
        </p>

        <h2>2. Age Requirements</h2>
        <p>
          You must be at least 18 years old (or the age of majority in your jurisdiction) to use this
          service. By using PlayNite, you represent and warrant that you meet this age requirement.
          We reserve the right to terminate accounts of users who are found to be underage.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          To access certain features of our service, you may be required to create an account. You
          are responsible for maintaining the confidentiality of your account credentials and for
          all activities that occur under your account. You agree to notify us immediately of any
          unauthorized use of your account.
        </p>

        <h2>4. Content and Conduct</h2>
        <h3>4.1 Prohibited Content</h3>
        <p>You agree not to upload, post, or transmit content that:</p>
        <ul>
          <li>Violates any applicable laws or regulations</li>
          <li>Involves minors in any way</li>
          <li>Contains non-consensual or illegal activities</li>
          <li>Infringes on intellectual property rights</li>
          <li>Contains malware, viruses, or harmful code</li>
          <li>Is defamatory, obscene, or offensive</li>
        </ul>

        <h3>4.2 User Conduct</h3>
        <p>You agree to:</p>
        <ul>
          <li>Use the service only for lawful purposes</li>
          <li>Respect the rights of other users</li>
          <li>Not attempt to circumvent our security measures</li>
          <li>Not use automated tools to access our service without permission</li>
          <li>Report any violations of these terms</li>
        </ul>

        <h2>5. Intellectual Property</h2>
        <p>
          All content on PlayNite, including but not limited to text, graphics, logos, images, and
          software, is owned by or licensed to us and is protected by copyright and other intellectual
          property laws. You may not reproduce, distribute, or create derivative works without our
          express written permission.
        </p>

        <h2>6. Privacy</h2>
        <p>
          Your privacy is important to us. Please review our Privacy Policy, which also governs your
          use of PlayNite, to understand our practices regarding the collection and use of your information.
        </p>

        <h2>7. Termination</h2>
        <p>
          We reserve the right to terminate or suspend your account and access to our service at our
          sole discretion, without prior notice, for conduct that we believe violates these Terms or
          is harmful to other users, us, or third parties, or for any other reason.
        </p>

        <h2>8. Disclaimers</h2>
        <p>
          THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE MAKE NO REPRESENTATIONS OR
          WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, AS TO THE OPERATION OF THE SERVICE OR THE INFORMATION,
          CONTENT, OR MATERIALS INCLUDED THEREIN. YOU EXPRESSLY AGREE THAT YOUR USE OF THIS SERVICE IS AT
          YOUR SOLE RISK.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
          DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE
          LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
        </p>

        <h2>10. Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold us harmless from and against any claims, actions,
          or demands, liabilities, and settlements including without limitation, reasonable legal and
          accounting fees, resulting from, or alleged to result from, your violation of these Terms.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          These Terms shall be interpreted and governed by the laws of the jurisdiction in which we
          operate, without regard to conflict of law provisions.
        </p>

        <h2>12. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify users of any changes
          by posting the new Terms on this page. Your continued use of the service after such changes
          constitutes your acceptance of the new Terms.
        </p>

        <h2>13. Contact Information</h2>
        <p>
          If you have any questions about these Terms, please contact us through our support channels.
        </p>
      </div>
    </div>
  );
}