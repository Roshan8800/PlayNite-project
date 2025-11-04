import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | PlayNite',
  description: 'Privacy policy for PlayNite. Learn how we collect, use, and protect your personal information on our adult video streaming platform.',
  keywords: 'privacy policy, data protection, personal information, privacy rights, PlayNite',
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Privacy Policy | PlayNite',
    description: 'Privacy policy for PlayNite. Learn how we collect, use, and protect your personal information on our adult video streaming platform.',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">Privacy Policy</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <p>
          At PlayNite ("we," "us," or "our"), we are committed to protecting your privacy and personal
          information. This Privacy Policy explains how we collect, use, disclose, and safeguard your
          information when you use our adult video streaming platform.
        </p>

        <h2>1. Information We Collect</h2>

        <h3>1.1 Personal Information</h3>
        <p>We may collect the following personal information:</p>
        <ul>
          <li><strong>Account Information:</strong> Email address, username, password</li>
          <li><strong>Profile Information:</strong> Display name, profile picture, preferences</li>
          <li><strong>Communication Data:</strong> Messages, comments, feedback</li>
          <li><strong>Payment Information:</strong> When applicable, processed through secure third-party providers</li>
        </ul>

        <h3>1.2 Usage Information</h3>
        <p>We automatically collect certain information when you use our service:</p>
        <ul>
          <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
          <li><strong>Usage Data:</strong> Pages visited, videos watched, time spent on site</li>
          <li><strong>Cookies and Tracking:</strong> Session data, preferences, analytics</li>
          <li><strong>Location Data:</strong> General location based on IP address</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the collected information for the following purposes:</p>
        <ul>
          <li><strong>Service Provision:</strong> To provide and maintain our video streaming service</li>
          <li><strong>Account Management:</strong> To create and manage user accounts</li>
          <li><strong>Personalization:</strong> To customize content recommendations and user experience</li>
          <li><strong>Communication:</strong> To respond to inquiries and provide customer support</li>
          <li><strong>Analytics:</strong> To understand usage patterns and improve our service</li>
          <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our terms</li>
          <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security threats</li>
        </ul>

        <h2>3. Information Sharing and Disclosure</h2>
        <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>

        <h3>3.1 Service Providers</h3>
        <p>
          We may share information with trusted third-party service providers who assist us in operating
          our platform, such as hosting providers, analytics services, and payment processors.
        </p>

        <h3>3.2 Legal Requirements</h3>
        <p>
          We may disclose information if required by law, court order, or government request, or to
          protect our rights, property, or safety, or that of our users or the public.
        </p>

        <h3>3.3 Business Transfers</h3>
        <p>
          In the event of a merger, acquisition, or sale of assets, user information may be transferred
          as part of the transaction, subject to the same privacy protections.
        </p>

        <h3>3.4 Consent</h3>
        <p>
          With your explicit consent, we may share information for specific purposes you have agreed to.
        </p>

        <h2>4. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal information
          against unauthorized access, alteration, disclosure, or destruction. These measures include:
        </p>
        <ul>
          <li>Encryption of sensitive data in transit and at rest</li>
          <li>Regular security audits and updates</li>
          <li>Access controls and authentication requirements</li>
          <li>Secure data storage and processing practices</li>
        </ul>

        <p>
          However, no method of transmission over the internet or electronic storage is 100% secure.
          While we strive to protect your information, we cannot guarantee absolute security.
        </p>

        <h2>5. Cookies and Tracking Technologies</h2>
        <p>
          We use cookies and similar technologies to enhance your experience, analyze usage, and provide
          personalized content. You can control cookie settings through your browser, though disabling
          cookies may affect site functionality. For detailed information about our cookie usage, please
          see our Cookie Policy.
        </p>

        <h2>6. Third-Party Services and Embedded Content</h2>
        <p>
          Our platform embeds videos and content from approved third-party platforms (such as Pornhub).
          PlayNite does not host, upload, or store any video content on our own servers. All videos are
          streamed directly from these third-party platforms.
        </p>

        <p>
          We are not responsible for the privacy practices, data collection, or content policies of these
          third-party platforms. When you view embedded content, you are subject to the privacy policies
          and terms of service of those platforms. We encourage you to review their privacy policies and
          terms before interacting with embedded content.
        </p>

        <p>
          We do not collect, store, or have access to any data from embedded videos, including viewing
          history, user interactions, or analytics data from third-party platforms. Any data collection
          related to embedded content is handled solely by the respective third-party platform.
        </p>

        <h2>7. Age Restrictions and COPPA Compliance</h2>
        <p>
          Our service is intended for adults 18 years and older. We do not knowingly collect personal
          information from children under 13. If we become aware that we have collected information from
          a child under 13, we will take steps to delete such information promptly.
        </p>

        <h2>8. International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries other than your own. We
          ensure that such transfers comply with applicable data protection laws and implement appropriate
          safeguards.
        </p>

        <h2>9. Your Rights and Choices</h2>
        <p>Depending on your location, you may have the following rights regarding your personal information:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal information</li>
          <li><strong>Correction:</strong> Request correction of inaccurate information</li>
          <li><strong>Deletion:</strong> Request deletion of your personal information</li>
          <li><strong>Portability:</strong> Request transfer of your data</li>
          <li><strong>Opt-out:</strong> Opt-out of certain data processing activities</li>
        </ul>

        <p>
          To exercise these rights, please contact us using the information provided below.
        </p>

        <h2>10. Data Retention</h2>
        <p>
          We retain your personal information for as long as necessary to provide our services, comply
          with legal obligations, resolve disputes, and enforce our agreements. Specific retention periods
          vary depending on the type of information and purpose of collection.
        </p>

        <h2>11. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any material changes
          by posting the new policy on this page and updating the "Last updated" date. Your continued use
          of our service after such changes constitutes acceptance of the updated policy.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or our data practices, please contact us:
        </p>
        <div className="bg-muted p-4 rounded-lg">
          <p><strong>Email:</strong> privacy@playnite.com</p>
          <p><strong>Address:</strong> [Your Business Address]</p>
          <p><strong>Data Protection Officer:</strong> [Contact Information]</p>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          This privacy policy is designed to comply with applicable data protection laws, including GDPR,
          CCPA, and other privacy regulations. For users in the EU, we serve as both controller and processor
          of personal data.
        </p>
      </div>
    </div>
  );
}