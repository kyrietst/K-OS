import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run middleware on static assets
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.includes('.') ||
      request.nextUrl.pathname.startsWith('/auth/callback')) {
      return supabaseResponse
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    request.nextUrl.pathname.startsWith('/dashboard')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new Response object with NextResponse.redirect() or NextResponse.next(),
  // make sure to include the cookies from the supabaseResponse object.
  
  // ----------------------------------------------------------------------
  // CLIENT PORTAL SECURITY ENFORCEMENT
  // ----------------------------------------------------------------------
  if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
      const parts = request.nextUrl.pathname.split('/') // ['', 'dashboard', 'slug', ...]
      if (parts.length >= 3) {
          const slug = parts[2]
          // Avoid database hit for static assets or irrelevant paths if possible, but middleware matcher handles most.
          
          // Query membership to check if user is a client
          // Note: This adds DB latency to navigation. Ideally we use Claims.
          // For now, consistent with requirements.
          const { data: member } = await supabase
            .from('workspace_members')
            .select('role, workspace:workspaces!inner(slug)')
            .eq('workspace.slug', slug)
            .eq('user_id', user.id)
            .single()

          // If user is a CLIENT, they MUST be in /client
          if (member?.role === 'client') {
              const minimalPath = `/dashboard/${slug}/client`
              if (!request.nextUrl.pathname.startsWith(minimalPath)) {
                   const url = request.nextUrl.clone()
                   url.pathname = minimalPath
                   return NextResponse.redirect(url)
              }
          }
      }
  }

  return supabaseResponse
}
