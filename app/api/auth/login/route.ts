import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/login
 * Login endpoint - Verify credentials and return access + refresh tokens
 * Mock implementation - Replace with real database/auth service
 */

// Mock user data - Replace with real database call
const mockUsers = [
  {
    id: "1",
    email: "admin@petfood.com",
    password: "admin123", // In production: hashed password
    name: "Admin User",
  },
  {
    id: "2",
    email: "manager@petfood.com",
    password: "manager123",
    name: "Manager",
  },
];

// Mock token generation - Replace with real JWT
function generateTokens() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return {
    accessToken: `access_${timestamp}_${random}`,
    refreshToken: `refresh_${timestamp}_${random}`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user - In production: query database
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate tokens
    const tokens = generateTokens();

    // Set tokens in cookies for middleware
    const response = NextResponse.json(
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );

    // Set secure httpOnly cookies for additional security
    response.cookies.set({
      name: "accessToken",
      value: tokens.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set({
      name: "refreshToken",
      value: tokens.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("[v0] Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
