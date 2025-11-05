'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield } from 'lucide-react';

interface AgeGateProps {
  children: React.ReactNode;
}

export function AgeGate({ children }: AgeGateProps) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('age_verified='))
        ?.split('=')[1];

      if (cookieValue === 'true') {
        setIsVerified(true);
      } else {
        setIsVerified(false);
      }
    }
  }, []);

  const handleConfirmAge = () => {
    // Set cookie for 30 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    document.cookie = `age_verified=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;

    setIsVerified(true);
  };

  const handleDecline = () => {
    setShowDisclaimer(true);
  };

  const handleBackToDisclaimer = () => {
    setShowDisclaimer(false);
  };

  if (isVerified === null) {
    // Loading state
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Age Verification Required</CardTitle>
          <CardDescription>
            This website contains adult content intended for viewers 18 years and older.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showDisclaimer ? (
            <>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  By entering this site, you confirm that you are at least 18 years old
                  (or the age of majority in your jurisdiction) and agree to view adult content.
                </p>
                <p>
                  If you are under 18 or offended by adult material, please leave this site immediately.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleConfirmAge}
                  className="flex-1"
                  size="lg"
                  aria-label="Confirm I am 18 or older"
                >
                  I am 18 or older
                </Button>
                <Button
                  onClick={handleDecline}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  aria-label="I am under 18"
                >
                  I am under 18
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">Access Restricted</p>
                  <p className="text-muted-foreground mt-1">
                    This website is intended for adults only. Please visit age-appropriate websites.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleBackToDisclaimer}
                variant="outline"
                className="w-full"
                aria-label="Go back to age verification"
              >
                Go Back
              </Button>
            </>
          )}
          <div className="text-xs text-muted-foreground text-center">
            <p>This site complies with 18 U.S.C. § 2257 and other applicable laws.</p>
            <p>All models are 18 years or older.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}