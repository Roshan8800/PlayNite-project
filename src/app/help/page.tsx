import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help & FAQ | PlayNite',
  description: 'Frequently asked questions and help resources for PlayNite. Get answers to common questions about our video streaming platform.',
  keywords: 'help, FAQ, frequently asked questions, support, troubleshooting, PlayNite',
  robots: 'index, follow',
  openGraph: {
    title: 'Help & FAQ | PlayNite',
    description: 'Frequently asked questions and help resources for PlayNite.',
    type: 'website',
  },
};

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">Help & FAQ</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <p>
          Welcome to PlayNite's Help Center. Here you'll find answers to frequently asked questions
          about our platform. If you can't find what you're looking for, please contact our support team.
        </p>

        <h2>Getting Started</h2>

        <h3>How do I create an account?</h3>
        <p>
          Click the "Sign Up" button on our homepage or in the header. You'll need to provide a valid
          email address and create a password. We recommend using a strong, unique password for your security.
        </p>

        <h3>Can I use PlayNite without an account?</h3>
        <p>
          Yes! You can browse and watch videos as a guest. However, creating an account unlocks additional
          features like personalized recommendations, playlists, and the ability to save videos for later.
        </p>

        <h3>Is PlayNite free to use?</h3>
        <p>
          Yes, PlayNite is completely free. We don't charge for access to our platform or content.
          All videos are embedded from approved third-party platforms.
        </p>

        <h2>Video Playback</h2>

        <h3>Why won't videos play?</h3>
        <p>
          If videos aren't loading, try the following:
        </p>
        <ul>
          <li>Refresh the page</li>
          <li>Clear your browser cache and cookies</li>
          <li>Try a different browser</li>
          <li>Disable ad blockers temporarily</li>
          <li>Check your internet connection</li>
        </ul>

        <h3>Can I download videos?</h3>
        <p>
          Account holders can download videos for offline viewing. Look for the download button
          below video players. Downloaded videos are stored locally on your device.
        </p>

        <h3>How do I adjust video quality?</h3>
        <p>
          Click the settings icon (gear) on the video player to adjust quality, playback speed,
          and other video settings. Quality options depend on what's available from the source platform.
        </p>

        <h2>Account & Settings</h2>

        <h3>How do I change my password?</h3>
        <p>
          Go to Settings {'>'} Account, then click "Change Password". You'll need to enter your current
          password and choose a new one.
        </p>

        <h3>How do I enable parental controls?</h3>
        <p>
          Visit Settings {'>'} Parental Controls to set up content restrictions, viewing time limits,
          and other safety features for your account.
        </p>

        <h3>How do I delete my account?</h3>
        <p>
          Go to Settings {'>'} Account {'>'} Delete Account. Please note that this action is permanent
          and cannot be undone. All your data will be removed from our systems.
        </p>

        <h2>Content & Features</h2>

        <h3>How does the recommendation system work?</h3>
        <p>
          Our AI-powered recommendation engine analyzes your viewing history, likes, and search
          behavior to suggest videos you might enjoy. The more you use the platform, the better
          the recommendations become.
        </p>

        <h3>How do I create playlists?</h3>
        <p>
          Click the "Add to Playlist" button below any video, or create a new playlist in your
          profile. You can organize videos by theme, mood, or any category you choose.
        </p>

        <h3>What types of content are available?</h3>
        <p>
          PlayNite aggregates content from approved third-party platforms. We feature a wide variety
          of adult entertainment videos, organized by categories, channels, and trending topics.
        </p>

        <h2>Technical Issues</h2>

        <h3>The site is running slowly</h3>
        <p>
          Try these solutions:
        </p>
        <ul>
          <li>Clear your browser cache and cookies</li>
          <li>Close other browser tabs</li>
          <li>Restart your browser</li>
          <li>Check your internet speed</li>
          <li>Try using an incognito/private browsing window</li>
        </ul>

        <h3>I'm having trouble logging in</h3>
        <p>
          If you can't log in:
        </p>
        <ul>
          <li>Check that your email and password are correct</li>
          <li>Try resetting your password</li>
          <li>Clear your browser cache and cookies</li>
          <li>Make sure your account isn't suspended</li>
        </ul>

        <h3>How do I report a problem?</h3>
        <p>
          Use our contact form to report technical issues, bugs, or other problems. Include as much
          detail as possible, including what you were doing when the issue occurred and what device/browser you're using.
        </p>

        <h2>Content Moderation</h2>

        <h3>How do I report inappropriate content?</h3>
        <p>
          Click the "Report" button on any video or use our dedicated report content page.
          We take reports seriously and review them promptly.
        </p>

        <h3>What happens when I report content?</h3>
        <p>
          Our moderation team reviews all reports. If content violates our guidelines, it may be
          removed or the video embed disabled. You'll receive a confirmation that your report was received.
        </p>

        <h2>Privacy & Security</h2>

        <h3>Is my data safe?</h3>
        <p>
          We take privacy and security seriously. All data is encrypted, and we follow industry
          best practices to protect your information. Review our Privacy Policy for complete details.
        </p>

        <h3>How do I opt out of data collection?</h3>
        <p>
          You can manage your privacy settings in Settings {'>'} Privacy. You can also contact us
          to request data deletion or opt out of certain data processing activities.
        </p>

        <h2>Contact & Support</h2>

        <h3>How do I contact support?</h3>
        <p>
          Visit our Contact page to send us a message. We aim to respond to all inquiries within
          24-48 hours. For urgent issues, please include "URGENT" in your subject line.
        </p>

        <h3>Where can I find more help?</h3>
        <p>
          Check our other help resources:
        </p>
        <ul>
          <li><a href="/terms-of-service">Terms of Service</a></li>
          <li><a href="/privacy-policy">Privacy Policy</a></li>
          <li><a href="/dmca-policy">DMCA Policy</a></li>
          <li><a href="/contact-support">Contact Support</a></li>
        </ul>

        <p className="mt-8 p-4 bg-muted rounded-lg">
          <strong>Still need help?</strong> Our support team is here to assist you. Please provide
          as much detail as possible when contacting us so we can resolve your issue quickly.
        </p>
      </div>
    </div>
  );
}