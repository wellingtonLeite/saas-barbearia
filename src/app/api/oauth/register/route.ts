import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // CORS Headers
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return NextResponse.json({
    client_id: 'spark_client_id_mock',
    client_secret: 'spark_client_secret_mock',
    client_id_issued_at: Math.floor(Date.now() / 1000),
    client_secret_expires_at: 0,
    grant_types: ['authorization_code'],
    response_types: ['code']
  }, { headers, status: 201 });
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new NextResponse(null, { status: 204, headers });
}
