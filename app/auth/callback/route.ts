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
  const { error: dbError } = await supabase.from("user_profile").insert({
    email: userData.user.email,
    username:
      userData.user.user_metadata?.username ||
      userData.user.email?.split("@")[0],
  });

  if (dbError && !dbError.message.includes("duplicate key")) {
    console.error("Error inserting user data:", dbError.message);
  }
}


    // Redirect on success
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

  const successRedirectUrl = new URL(`${origin}${next}`);
successRedirectUrl.searchParams.set("login", "success");

if (isLocalEnv) {
  return NextResponse.redirect(successRedirectUrl.toString());
} else if (forwardedHost) {
  successRedirectUrl.host = forwardedHost;
  successRedirectUrl.protocol = "https:";
  return NextResponse.redirect(successRedirectUrl.toString());
} else {
  return NextResponse.redirect(successRedirectUrl.toString());
}

  } catch (err) {
    console.error('Unexpected error in auth callback:', err)
    return NextResponse.redirect(`${origin}/login?error=unexpected_error`)
  }
}