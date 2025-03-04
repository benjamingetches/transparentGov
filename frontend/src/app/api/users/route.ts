import { NextRequest, NextResponse } from 'next/server';

// This would normally interact with your backend API
// For now, we'll simulate the behavior
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auth0Id, email, name } = body;
    
    console.log('Creating/getting user:', { auth0Id, email, name });
    
    if (!auth0Id) {
      return NextResponse.json(
        { error: 'auth0Id is required' },
        { status: 400 }
      );
    }
    
    // In a real app, you would:
    // 1. Check if a user with this auth0Id exists in your database
    // 2. If not, create a new user
    // 3. Return the user data
    
    // For now, we'll simulate a successful response
    return NextResponse.json({
      success: true,
      user: {
        id: `user_${Math.random().toString(36).substring(2, 9)}`,
        auth0Id,
        email,
        name,
        createdAt: new Date().toISOString(),
        // Add any other user data you need
      }
    });
  } catch (error) {
    console.error('Error creating/getting user:', error);
    return NextResponse.json(
      { error: 'Failed to create/get user' },
      { status: 500 }
    );
  }
}

// Get user by Auth0 ID
export async function GET(request: NextRequest) {
  try {
    const auth0Id = request.nextUrl.searchParams.get('auth0Id');
    
    console.log('Getting user by Auth0 ID:', auth0Id);
    
    if (!auth0Id) {
      return NextResponse.json(
        { error: 'auth0Id is required' },
        { status: 400 }
      );
    }
    
    // In a real app, you would query your database for a user with this auth0Id
    // For now, we'll simulate a response
    
    // Simulate a user found
    return NextResponse.json({
      success: true,
      user: {
        id: `user_${Math.random().toString(36).substring(2, 9)}`,
        auth0Id,
        email: 'user@example.com',
        name: 'Example User',
        createdAt: new Date().toISOString(),
        // Add any other user data you need
      }
    });
    
    // Uncomment to simulate user not found
    // return NextResponse.json(
    //   { error: 'User not found' },
    //   { status: 404 }
    // );
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
} 