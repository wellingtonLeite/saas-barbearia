import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { db as prisma } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = url.searchParams.get('client_id');
  const redirectUri = url.searchParams.get('redirect_uri');
  const state = url.searchParams.get('state');

  if (!clientId || !redirectUri) {
    return new Response('Missing client_id or redirect_uri', { status: 400 });
  }

  const client = await prisma.oAuthClient.findUnique({ where: { clientId } });
  if (!client) {
    return new Response('Unknown client', { status: 400 });
  }

  const code = randomBytes(16).toString('hex');
  const returnUrl = new URL(redirectUri);
  returnUrl.searchParams.set('code', code);
  if (state) returnUrl.searchParams.set('state', state);

  return NextResponse.redirect(returnUrl.toString());
}
