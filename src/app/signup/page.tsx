'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { LoadingButton } from '@/components/ui/loading-button';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    agreeToAge: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Name required',
        description: 'Please enter your full name.',
      });
      return false;
    }

    if (formData.name.trim().length < 2) {
      toast({
        variant: 'destructive',
        title: 'Name too short',
        description: 'Please enter your full name.',
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Please enter your email address.',
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: 'destructive',
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
      });
      return false;
    }

    if (!formData.password) {
      toast({
        variant: 'destructive',
        title: 'Password required',
        description: 'Please enter a password.',
      });
      return false;
    }

    if (formData.password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Password too short',
        description: 'Password must be at least 8 characters long.',
      });
      return false;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      toast({
        variant: 'destructive',
        title: 'Weak password',
        description: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords don\'t match',
        description: 'Please make sure both passwords match.',
      });
      return false;
    }

    if (!formData.agreeToTerms) {
      toast({
        variant: 'destructive',
        title: 'Terms required',
        description: 'Please agree to the Terms of Service.',
      });
      return false;
    }

    if (!formData.agreeToAge) {
      toast({
        variant: 'destructive',
        title: 'Age verification required',
        description: 'Please confirm you are 18 or older.',
      });
      return false;
    }

    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Validate all form fields again before submission
      if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
        throw new Error('All fields are required');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      // Update display name
      await updateProfile(userCredential.user, {
        displayName: formData.name.trim(),
      });

      // Create user document in Firestore with enhanced validation
      const userDoc = {
        uid: userCredential.user.uid,
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        role: 'User' as const,
        joinedDate: new Date().toISOString(),
        status: 'Active' as const,
        pushNotificationsEnabled: false,
        parentalControlsEnabled: formData.agreeToAge,
        ageRestriction: formData.agreeToAge ? 18 : null,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        emailVerified: userCredential.user.emailVerified,
      };

      await setDoc(doc(firestore, 'users', userCredential.user.uid), userDoc);

      toast({
        title: 'Account created successfully',
        description: 'Welcome to PlayNite! Please verify your email.',
      });

      router.push('/home');
    } catch (error: any) {
      console.error('Signup error:', error);

      let errorMessage = 'An error occurred during signup.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password must be at least 6 characters long.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        default:
          if (error.message.includes('All fields are required')) {
            errorMessage = 'Please fill in all required fields.';
          } else if (error.message.includes('Passwords do not match')) {
            errorMessage = 'Passwords do not match. Please try again.';
          } else {
            errorMessage = 'Failed to create account. Please try again.';
          }
      }

      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);

      // Check if user document exists, if not create it
      const userDocRef = doc(firestore, 'users', result.user.uid);
      const userDoc = {
        uid: result.user.uid,
        name: result.user.displayName || 'User',
        email: result.user.email,
        role: 'User',
        joinedDate: new Date().toISOString(),
        status: 'Active',
        pushNotificationsEnabled: false,
        parentalControlsEnabled: false,
        ageRestriction: 18,
        avatarUrl: result.user.photoURL,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };

      await setDoc(userDocRef, userDoc, { merge: true });

      toast({
        title: 'Account created successfully',
        description: 'Welcome to PlayNite!',
      });

      router.push('/home');
    } catch (error: any) {
      console.error('Google signup error:', error);

      let errorMessage = 'Google signup failed.';

      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Signup cancelled.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup blocked by browser. Please allow popups and try again.';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with this email using a different sign-in method.';
          break;
        default:
          errorMessage = 'Google signup failed. Please try again.';
      }

      toast({
        variant: 'destructive',
        title: 'Google signup failed',
        description: errorMessage,
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md" role="main" aria-labelledby="signup-title">
        <CardHeader className="text-center">
          <CardTitle id="signup-title" className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join PlayNite and start exploring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSignup} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="pl-10"
                  disabled={loading || googleLoading}
                  required
                  aria-describedby="name-error"
                  aria-invalid={false}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="pl-10"
                  disabled={loading || googleLoading}
                  required
                  aria-describedby="email-error"
                  aria-invalid={false}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  className="pl-10 pr-10"
                  disabled={loading || googleLoading}
                  required
                  aria-describedby="password-error password-requirements"
                  aria-invalid={false}
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || googleLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </Button>
              </div>
              <div id="password-requirements" className="sr-only">
                Password must be at least 8 characters long and contain uppercase, lowercase, and numeric characters
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  className="pl-10 pr-10"
                  disabled={loading || googleLoading}
                  required
                  aria-describedby="confirm-password-error"
                  aria-invalid={false}
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading || googleLoading}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>

            <fieldset className="space-y-3">
              <legend className="sr-only">Terms and Conditions</legend>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeToAge"
                  checked={formData.agreeToAge}
                  onCheckedChange={(checked) => updateFormData('agreeToAge', checked)}
                  disabled={loading || googleLoading}
                  required
                />
                <Label htmlFor="agreeToAge" className="text-sm">
                  I am 18 years or older
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => updateFormData('agreeToTerms', checked)}
                  disabled={loading || googleLoading}
                  required
                />
                <Label htmlFor="agreeToTerms" className="text-sm">
                  I agree to the{' '}
                  <Link href="/terms-of-service" className="text-primary hover:underline focus:outline-2 focus:outline-primary">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy-policy" className="text-primary hover:underline focus:outline-2 focus:outline-primary">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </fieldset>

            <LoadingButton
              type="submit"
              className="w-full"
              loading={loading}
              loadingText="Creating account..."
              disabled={loading || googleLoading}
            >
              Create Account
            </LoadingButton>
          </form>

          <div className="relative" role="separator" aria-label="Alternative sign-up options">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <LoadingButton
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignup}
            loading={googleLoading}
            loadingText="Creating account..."
            disabled={loading}
            aria-label="Sign up with Google"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </LoadingButton>

          <nav aria-label="Account options">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link
                href="/login"
                className="text-primary hover:underline focus:outline-2 focus:outline-primary"
              >
                Sign in
              </Link>
            </div>
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}
