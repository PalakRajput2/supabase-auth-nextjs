import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'


export async function GET(request: Request) {
  
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }

  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) {
    next = '/'
  }

  if (!code) {
    console.error('No code parameter found')
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  try {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError.message)
      return NextResponse.redirect(`${origin}/login?error=code_exchange_failed`)
    }

    // Fetch authenticated user
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      console.error('Error fetching user data:', userError?.message)
      return NextResponse.redirect(`${origin}/login?error=user_not_found`)
    }

    // Check if user exists in DB
    const { data: existingUser } = await supabase
      .from('user_profile')
      .select('*')
      .eq('email', userData.user.email)
      .limit(1)
      .single()

    if (!existingUser) {
      const { error: dbError } = await supabase.from('user_profile').insert({
        email: userData.user.email,
        username: userData.user.user_metadata?.username || userData.user.email?.split('@')[0],
      })

      if (dbError) {
        console.error('Error inserting user data:', dbError.message)
        // Don't redirect to error page - just log and continue
        // User can complete profile later
      }
    }

    // Redirect on success
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

   // Redirect on success with a query param for toast notification
if (isLocalEnv) {
  return NextResponse.redirect(`${origin}${next}?signup=success`)
} else if (forwardedHost) {
  return NextResponse.redirect(`https://${forwardedHost}${next}?signup=success`)
} else {
  return NextResponse.redirect(`${origin}${next}?signup=success`)
}


  } catch (err) {
    console.error('Unexpected error in auth callback:', err)
    return NextResponse.redirect(`${origin}/login?error=unexpected_error`)
  }
}