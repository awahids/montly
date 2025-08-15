'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleOAuthCallback } from '@/lib/auth/google';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('loading');
        
        // Handle the OAuth callback
        const user = await handleOAuthCallback();
        
        if (user) {
          setStatus('success');
          // Redirect to dashboard after a brief success message
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          throw new Error('Authentication failed');
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setStatus('error');
        
        // Redirect to sign-in page after showing error
        setTimeout(() => {
          router.push('/auth/sign-in');
        }, 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && 'Completing Sign In...'}
            {status === 'success' && 'Sign In Successful!'}
            {status === 'error' && 'Sign In Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <LoadingSpinner />
              <p className="text-muted-foreground">
                Please wait while we complete your authentication...
              </p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <p className="text-muted-foreground">
                Welcome! Redirecting to your dashboard...
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
              <p className="text-red-600 font-medium">
                {error || 'Something went wrong during authentication'}
              </p>
              <p className="text-muted-foreground text-sm">
                Redirecting to sign in page...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}