'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Sign out the current user and redirect to login page.
 * This is a Server Action that can be called from client components.
 */
export async function signOutAction() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Sign out error:', error.message)
    // Still redirect even on error - user likely wants to leave
  }
  
  redirect('/login')
}

/**
 * Get the current authenticated user.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

export async function signInWithGoogleAction() {
  const supabase = await createClient()
  const headersList = await import('next/headers').then(mod => mod.headers())
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('Google Sign In error:', error.message)
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}
