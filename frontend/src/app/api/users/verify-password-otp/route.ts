import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp_code } = body;

    if (!email || !otp_code) {
      return NextResponse.json({ error: 'Email and OTP code are required' }, { status: 400 });
    }

    const base = getApiBaseUrl();
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
    const response = await fetch(`${cleanBase}/api/verify-password-change-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp_code }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Verify password OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
