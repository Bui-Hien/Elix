import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple check for auth cookie presence
// For deep validation, we rely on the backend API calls which happen immediately on client mount
export function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value
    const { pathname } = request.nextUrl

    // 1. Protect Admin Routes
    if (pathname.startsWith('/admin')) {
        if (!token) {
            const url = new URL('/login', request.url)
            url.searchParams.set('callbackUrl', encodeURI(pathname))
            return NextResponse.redirect(url)
        }
    }

    // 2. Redirect from Login if already authenticated (optional, can be done client-side too)
    // We skip this here to avoid complexity with role checking without decoding JWT

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
}
