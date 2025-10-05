import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'working',
    timestamp: new Date().toISOString(),
    message: 'Test API is functioning' 
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      status: 'received',
      data: body,
      timestamp: new Date().toISOString()
    });
  } catch {
    return NextResponse.json({ 
      status: 'error',
      message: 'Invalid JSON',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
}