import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('API Callback - Request received');
  
  // Get the URL parameters
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  // Log the parameters for debugging
  console.log('API Callback - Parameters:', { 
    code: code ? 'present' : 'missing', 
    state: state ? 'present' : 'missing',
    error: error || 'none',
    errorDescription: errorDescription || 'none',
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  });

  // Check for authentication errors
  if (error) {
    console.error('API Callback - Authentication error:', error, errorDescription);
    // Redirect to home page with error
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }

  // Check if code and state are present
  if (!code || !state) {
    console.error('API Callback - Missing code or state parameter');
    // Redirect to home page with error
    return NextResponse.redirect(new URL('/?error=missing_parameters', request.url));
  }

  try {
    console.log('API Callback - Authentication successful, redirecting to profile page');
    // Redirect to the profile page
    return NextResponse.redirect(new URL('/profile', request.url));
  } catch (error) {
    console.error('API Callback - Error during callback processing:', error);
    // Redirect to home page with error
    return NextResponse.redirect(new URL('/?error=callback_error', request.url));
  }
} 