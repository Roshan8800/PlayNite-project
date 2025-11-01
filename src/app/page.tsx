import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Welcome to PlayNite',
  description: 'Your new home for incredible video content. Sign up or start watching as a guest.',
};


export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex justify-between items-center">
        <Logo />
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-4 animate-fade-in">
        <h1 className="text-5xl font-headline font-bold tracking-tight">
          Welcome to PlayNite
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl">
          Your new home for incredible video content. Explore a vast library of videos, from educational content to entertainment.
        </p>
        <div className="mt-8 flex gap-4">
          <Button size="lg" asChild>
            <Link href="/home">Start Watching Now</Link>
          </Button>
        </div>
      </main>

      <section className="bg-muted/40 py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-headline font-bold text-center mb-8">
            Choose Your Experience
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <Card>
              <CardHeader>
                <CardTitle>Guest Access</CardTitle>
                <CardDescription>
                  Jump right in without an account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Stream up to 500 videos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Explore trending content</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>No account required</span>
                  </li>
                </ul>
                 <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/home">Continue as Guest</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-primary border-2">
              <CardHeader>
                <CardTitle>Full Membership</CardTitle>
                <CardDescription>
                  Create an account for the full experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                   <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Unlimited video streaming</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Personalized recommendations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Create playlists and save favorites</span>
                  </li>
                   <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Download videos for offline viewing</span>
                  </li>
                </ul>
                <Button className="w-full mt-4" asChild>
                  <Link href="/signup">Create Free Account</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

       <footer className="text-center p-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} PlayNite. All rights reserved.
      </footer>
    </div>
  );
}
