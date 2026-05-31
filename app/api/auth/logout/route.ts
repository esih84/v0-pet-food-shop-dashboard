import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 * Logout endpoint - Clear tokens and cleanup
 */

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear tokens from cookies
    response.cookies.set({
      name: "accessToken",
      value: "",
      httpOnly: true,
      maxAge: 0,
    });

    response.cookies.set({
      name: "refreshToken",
      value: "",
      httpOnly: true,
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("[v0] Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
