import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Shield, Zap, Heart, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | PlayNite',
  description: 'Learn about PlayNite, a modern video streaming platform committed to providing high-quality entertainment with advanced features and user safety.',
  keywords: 'about, company, PlayNite, video streaming, entertainment, platform, mission, values',
  robots: 'index, follow',
  openGraph: {
    title: 'About Us | PlayNite',
    description: 'Learn about PlayNite, a modern video streaming platform committed to providing high-quality entertainment.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline mb-4">About PlayNite</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A modern video streaming platform designed to deliver high-quality entertainment
          with cutting-edge features and uncompromising user safety.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Mission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Our Mission
            </CardTitle>
            <CardDescription>
              What drives us every day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To create the most advanced and user-friendly video streaming platform that combines
              entertainment with innovation. We believe in providing unlimited access to quality
              content while maintaining the highest standards of user safety and experience.
            </p>
          </CardContent>
        </Card>

        {/* Vision */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Our Vision
            </CardTitle>
            <CardDescription>
              Where we're heading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To become the leading video streaming platform that sets new standards for
              entertainment technology. We envision a world where users can discover, enjoy,
              and share content seamlessly across all devices with complete peace of mind.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Core Values */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold font-headline text-center mb-8">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle>Safety First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                User safety and content moderation are our top priorities. We implement
                advanced AI-powered content filtering and parental controls.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle>Innovation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                We continuously push the boundaries of streaming technology with AI-powered
                recommendations, adaptive streaming, and advanced features.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle>User-Centric</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Everything we do is designed with our users in mind. From intuitive interfaces
                to personalized experiences, your satisfaction drives our decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Platform Features */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold font-headline text-center mb-8">What Makes Us Different</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Advanced Technology</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">AI</Badge>
                <span>AI-powered content recommendations and smart search</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">Adaptive</Badge>
                <span>Adaptive bitrate streaming for optimal quality</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">Cross-Device</Badge>
                <span>Seamless synchronization across all devices</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">Offline</Badge>
                <span>Download videos for offline viewing</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">User Safety & Control</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">Parental</Badge>
                <span>Advanced parental controls and age restrictions</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">Moderation</Badge>
                <span>AI-assisted content moderation and reporting</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">Privacy</Badge>
                <span>Comprehensive privacy controls and data protection</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">Community</Badge>
                <span>Safe community features with user blocking</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Team/Company Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Our Story
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg dark:prose-invert max-w-none">
          <p>
            PlayNite was founded with a simple yet powerful vision: to create a video streaming
            platform that prioritizes both entertainment and user safety. In an era where content
            is abundant but quality control is often lacking, we set out to build something different.
          </p>

          <p>
            Our team combines decades of experience in streaming technology, content moderation,
            and user experience design. We've worked with major platforms and learned what works
            – and what doesn't – when it comes to delivering high-quality video content at scale.
          </p>

          <p>
            Today, PlayNite serves millions of users worldwide, providing access to a curated
            library of premium content while maintaining the highest standards of safety and
            user experience. We're not just another streaming service; we're a community-driven
            platform that puts users first.
          </p>
        </CardContent>
      </Card>

      {/* Contact CTA */}
      <div className="text-center">
        <Card className="inline-block">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Have Questions?</h3>
            <p className="text-muted-foreground mb-4">
              We'd love to hear from you. Reach out to our support team for any questions or feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <a
                href="/contact-support"
                className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/help"
                className="inline-flex items-center justify-center px-4 py-2 border border-input bg-background rounded-md hover:bg-accent transition-colors"
              >
                View Help Center
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}