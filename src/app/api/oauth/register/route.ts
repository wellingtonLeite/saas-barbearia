import { NextResponse } from 'next/server';
import { randomUUID, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { db as prisma } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const redirectUris: string[] = body.redirect_uris || [];

    const clientId = randomUUID();
    const rawSecret = randomBytes(32).toString('hex');
    const hashedSecret = await bcrypt.hash(rawSecret, 10);

    await prisma.oAuthClient.create({
      data: { clientId, clientSecret: hashedSecret, redirectUris },
    });

    return NextResponse.json(
      {
        client_id: clientId,
        client_secret: rawSecret, // retorna raw apenas UMA vez
        client_id_issued_at: Math.floor(Date.now() / 1000),
        client_secret_expires_at: 0,
        grant_types: ['authorization_code'],
        response_types: ['code'],
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (e) {
    console.error('OAuth register error:', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
