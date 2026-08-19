import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { instanceName } = body;

    if (!instanceName) {
      return NextResponse.json(
        { error: 'O nome da instância é obrigatório (instanceName)' },
        { status: 400 }
      );
    }

    const apiUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!apiUrl || !apiKey) {
      console.error('As variáveis EVOLUTION_API_URL e EVOLUTION_API_KEY não estão configuradas.');
      return NextResponse.json(
        { error: 'Configurações da Evolution API não encontradas no servidor.' },
        { status: 500 }
      );
    }

    // Faz a chamada para a Evolution API para criar a instância
    const response = await fetch(`${apiUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
        // Algumas versões da Evolution API requerem isso para forçar base64 no retorno
        b64: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro ao criar instância na Evolution API:', data);
      return NextResponse.json(
        {
          error: data?.response?.message || data?.message || 'Erro ao criar instância',
          details: data,
        },
        { status: response.status }
      );
    }

    // Na Evolution API, o QR Code em base64 normalmente vem em `data.qrcode.base64` ou `data.base64`
    const qrCodeBase64 = data.qrcode?.base64 || data.base64;

    if (!qrCodeBase64) {
      // Se não veio QR Code, a instância talvez já exista ou já esteja conectada
      return NextResponse.json(
        {
          error: 'QR Code não retornado pela API. Verifique se a instância já existe e está conectada.',
          details: data,
        },
        { status: 400 }
      );
    }

    // Retorna o base64 para o frontend renderizar
    return NextResponse.json({ base64: qrCodeBase64 });
  } catch (error: any) {
    console.error('Erro interno na rota /api/whatsapp/instance:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    );
  }
}
