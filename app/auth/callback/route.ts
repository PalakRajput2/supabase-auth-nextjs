import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) {
    next = '/'
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Fetch authenticated user
      const { data, error: userError } = await supabase.auth.getUser()
      if (userError ) {
        console.error('Error fetching user data:', userError.message)
        return NextResponse.redirect(`${origin}/error`)
      }

      // Check if user exists in DB
      const { data: existingUser } = await supabase
        .from('user_profile')
        .select('*')
        .eq('email', data?.user?.email)
        .limit(1)
        .single()

      if (!existingUser) {
        const { error: dbError } = await supabase.from('user_profile').insert({
          email: data?.user?.email,
          username: data?.user?.user_metadata?.username,
        })

        if (dbError) {
          console.error('Error inserting user data:', dbError.message)
          return NextResponse.redirect(`${origin}/error`)
        }
      }

      //  Always redirect on success (user exists or inserted)
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
