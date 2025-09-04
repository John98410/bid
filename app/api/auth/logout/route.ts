import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Since we're using JWT tokens stored in cookies,
    // logout is handled on the client side by removing the cookie
    // This endpoint can be used for additional server-side cleanup if needed
    
    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
