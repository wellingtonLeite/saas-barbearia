import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const host = req.headers.get('x-forwarded-host') || url.host;
  const protocol = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
  const baseUrl = `${protocol}://${host}`;
  
  return NextResponse.json({
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/api/oauth/authorize`,
    token_endpoint: `${baseUrl}/api/oauth/token`,
    registration_endpoint: `${baseUrl}/api/oauth/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "client_credentials"],
    token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic", "none"]
  });
}
