import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { db as prisma } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let clientId: string | null = null;
    let clientSecret: string | null = null;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      clientId = params.get('client_id');
      clientSecret = params.get('client_secret');
    } else {
      const body = await req.json().catch(() => ({}));
      clientId = body.client_id;
      clientSecret = body.client_secret;
    }

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400, headers: corsHeaders });
    }

    const client = await prisma.oAuthClient.findUnique({ where: { clientId } });
    if (!client) {
      return NextResponse.json({ error: 'invalid_client' }, { status: 401, headers: corsHeaders });
    }

    const valid = await bcrypt.compare(clientSecret, client.clientSecret);
    if (!valid) {
      return NextResponse.json({ error: 'invalid_client' }, { status: 401, headers: corsHeaders });
    }

    const accessToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.oAuthToken.create({ data: { clientId, accessToken, expiresAt } });

    return NextResponse.json(
      { access_token: accessToken, token_type: 'Bearer', expires_in: 30 * 24 * 3600 },
      { headers: corsHeaders }
    );
  } catch (e) {
    console.error('OAuth token error:', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
