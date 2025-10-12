// app/api/reviews/seed/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'Review seeding endpoint disabled - no placeholder data'
  });
}
