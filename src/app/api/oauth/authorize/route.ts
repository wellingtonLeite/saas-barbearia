import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const redirectUri = url.searchParams.get('redirect_uri');
  const state = url.searchParams.get('state');
  
  if (!redirectUri) {
    return new NextResponse('Missing redirect_uri', { status: 400 });
  }

  // Generate a mock auth code
  const code = 'mock_auth_code_123';
  
  const returnUrl = new URL(redirectUri);
  returnUrl.searchParams.set('code', code);
  if (state) {
    returnUrl.searchParams.set('state', state);
  }
  
  return NextResponse.redirect(returnUrl.toString());
}
