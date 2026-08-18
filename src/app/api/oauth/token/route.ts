import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // CORS Headers are important for Token endpoint
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return NextResponse.json({
    access_token: 'mock_mcp_access_token',
    token_type: 'Bearer',
    expires_in: 3600 * 24 * 30, // 30 dias
    refresh_token: 'mock_mcp_refresh_token'
  }, { headers });
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new NextResponse(null, { status: 204, headers });
}
