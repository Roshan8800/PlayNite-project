import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | PlayNite',
  description: 'Cookie policy for PlayNite. Learn how we use cookies and similar technologies on our adult video streaming platform.',
  keywords: 'cookie policy, cookies, tracking technologies, privacy, data collection, PlayNite',
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Cookie Policy | PlayNite',
    description: 'Cookie policy for PlayNite. Learn how we use cookies and similar technologies on our adult video streaming platform.',
    type: 'website',
  },
};

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">Cookie Policy</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <p>
          This Cookie Policy explains how PlayNite ("we," "us," or "our") uses cookies and similar
          technologies on our adult video streaming platform. By using our service, you consent to
          the use of cookies in accordance with this policy.
        </p>

        <h2>1. What Are Cookies</h2>
        <p>
          Cookies are small text files that are stored on your device when you visit our website.
          They help us provide you with a better browsing experience by remembering your preferences
          and understanding how you use our site.
        </p>

        <h2>2. Types of Cookies We Use</h2>

        <h3>2.1 Essential Cookies</h3>
        <p>These cookies are necessary for the website to function properly:</p>
        <ul>
          <li><strong>Authentication Cookies:</strong> Keep you logged in during your session</li>
          <li><strong>Security Cookies:</strong> Help protect against security threats</li>
          <li><strong>Load Balancing Cookies:</strong> Ensure proper distribution of traffic</li>
        </ul>

        <h3>2.2 Functional Cookies</h3>
        <p>These cookies enhance your experience on our site:</p>
        <ul>
          <li><strong>Preference Cookies:</strong> Remember your language and display settings</li>
          <li><strong>Video Player Cookies:</strong> Save your video playback preferences</li>
        </ul>

        <h3>2.3 Analytics Cookies</h3>
        <p>These cookies help us understand how visitors use our site:</p>
        <ul>
          <li><strong>Usage Analytics:</strong> Track page views, time spent on site, and popular content</li>
          <li><strong>Performance Monitoring:</strong> Help us identify and fix technical issues</li>
        </ul>

        <h3>2.4 Third-Party Cookies</h3>
        <p>
          When you view embedded videos from third-party platforms (such as Pornhub), those platforms
          may set their own cookies. We do not control these cookies, and they are subject to the
          respective platforms' cookie policies. We recommend reviewing their policies for more information.
        </p>

        <h2>3. How We Use Cookies</h2>
        <p>We use cookies for the following purposes:</p>
        <ul>
          <li><strong>Authentication:</strong> To keep you logged in and secure</li>
          <li><strong>Personalization:</strong> To remember your preferences and settings</li>
          <li><strong>Analytics:</strong> To understand user behavior and improve our service</li>
          <li><strong>Security:</strong> To detect and prevent fraudulent activity</li>
          <li><strong>Performance:</strong> To ensure our site loads quickly and efficiently</li>
        </ul>

        <h2>4. Managing Cookies</h2>
        <p>You can control and manage cookies in several ways:</p>

        <h3>4.1 Browser Settings</h3>
        <p>
          Most web browsers allow you to control cookies through their settings. You can usually find
          these settings in the 'Options' or 'Preferences' menu. You can set your browser to block or
          alert you about cookies, but please note that some parts of our site may not work properly
          without cookies.
        </p>

        <h3>4.2 Opt-Out Options</h3>
        <p>
          You can opt out of non-essential cookies by adjusting your browser settings or using our
          cookie preference tool (when available). However, disabling cookies may affect your experience
          on our platform.
        </p>

        <h3>4.3 Third-Party Opt-Outs</h3>
        <p>
          For cookies set by third-party platforms, you should visit their respective websites to
          manage your cookie preferences.
        </p>

        <h2>5. Cookie Retention</h2>
        <p>
          The length of time a cookie stays on your device depends on its type:
        </p>
        <ul>
          <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
          <li><strong>Persistent Cookies:</strong> Remain until deleted or expired (typically 30 days to 2 years)</li>
        </ul>

        <h2>6. Updates to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time. We will notify you of any material
          changes by posting the new policy on this page and updating the "Last updated" date.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          If you have any questions about this Cookie Policy or our use of cookies, please contact us:
        </p>
        <div className="bg-muted p-4 rounded-lg">
          <p><strong>Email:</strong> privacy@playnite.com</p>
          <p><strong>Address:</strong> [Your Business Address]</p>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          This cookie policy is designed to comply with applicable privacy laws, including GDPR,
          CCPA, and other data protection regulations. For users in the EU, we serve as both controller
          and processor of cookie-related data.
        </p>
      </div>
    </div>
  );
}