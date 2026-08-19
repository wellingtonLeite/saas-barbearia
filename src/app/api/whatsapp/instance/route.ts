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
      console.warn('Variáveis EVOLUTION_API_URL ou EVOLUTION_API_KEY não configuradas.');
      return NextResponse.json({
        base64: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=EvolutionAPI_Configure_Suas_Variaveis',
        instanceName,
        isDemo: true
      });
    }

    // 1. Tenta criar a instância na Evolution API
    let response = await fetch(`${apiUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
        b64: true,
      }),
    });

    let data = await response.json();

    // 2. Se a instância já existir, busca o QR Code de conexão
    if (!response.ok) {
      console.log(`Instância ${instanceName} já existente ou erro inicial. Tentando obter QR code em /instance/connect...`);
      const connectResponse = await fetch(`${apiUrl}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': apiKey,
        },
      });

      if (connectResponse.ok) {
        data = await connectResponse.json();
      }
    }

    // Configurar o webhook do n8n automaticamente na instância se URL estiver configurada
    const n8nWebhook = process.env.N8N_WEBHOOK_EVOLUTION_URL || 'http://n8n-g4ssskoo8w8o0socc8g0cksc.76.13.225.200.sslip.io/webhook/evolution-webhook';
    if (n8nWebhook) {
      fetch(`${apiUrl}/webhook/set/${instanceName}`, {
        method: 'POST',
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          webhook: {
            enabled: true,
            url: n8nWebhook,
            byEvents: false,
            base64: true,
            events: ['MESSAGES_UPSERT']
          }
        })
      }).catch(err => console.error("Erro configurando webhook na instância:", err));
    }

    // Extrai o QR Code em base64
    const qrCodeBase64 = data.qrcode?.base64 || data.base64 || data.code;

    if (!qrCodeBase64) {
      return NextResponse.json(
        {
          error: 'Não foi possível obter o QR Code. A instância pode já estar conectada.',
          details: data,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      base64: qrCodeBase64,
      instanceName,
      status: 'connecting'
    });
  } catch (error: any) {
    console.error('Erro na rota /api/whatsapp/instance (POST):', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const instanceName = searchParams.get('instanceName');

    if (!instanceName) {
      return NextResponse.json({ error: 'instanceName é obrigatório' }, { status: 400 });
    }

    const apiUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!apiUrl || !apiKey) {
      return NextResponse.json({ state: 'disconnected', isDemo: true });
    }

    const response = await fetch(`${apiUrl}/instance/connectionState/${instanceName}`, {
      method: 'GET',
      headers: { 'apikey': apiKey }
    });

    if (!response.ok) {
      return NextResponse.json({ state: 'disconnected' });
    }

    const data = await response.json();
    const state = data.instance?.state || data.state || 'close';

    return NextResponse.json({
      state,
      connected: state === 'open'
    });
  } catch (error: any) {
    console.error('Erro na rota /api/whatsapp/instance (GET):', error);
    return NextResponse.json({ state: 'error', error: error.message }, { status: 500 });
  }
}
