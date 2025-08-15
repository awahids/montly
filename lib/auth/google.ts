import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

/**
 * Initiate Google OAuth sign-in flow
 * This redirects the user to Google's OAuth consent screen
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Handle the OAuth callback and set user state
 * This should be called after successful OAuth redirect
 */
export async function handleOAuthCallback() {
  try {
    // Get the current session after OAuth callback
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(error.message);
    }

    if (session?.user) {
      // Check if profile exists, create if not
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!existingProfile) {
        // Create profile for new Google OAuth user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
            default_currency: 'IDR',
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      // Get the complete user data and set in store
      const user = await getCurrentUser();
      if (user) {
        useAppStore.getState().setUser(user);
      }

      return user;
    }

    return null;
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw error;
  }
}

/**
 * Check if user is authenticated via Google OAuth
 */
export async function isGoogleAuthenticated(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!(session?.user && session.user.app_metadata?.provider === 'google');
  } catch {
    return false;
  }
}