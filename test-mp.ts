import { db } from './src/lib/db';
import { MercadoPagoConfig, Preference } from 'mercadopago';

async function test() {
  const config = await db.gatewayConfig.findUnique({ where: { gateway: 'MERCADO_PAGO' } });
  console.log("Token in DB:", config?.access_token);
  
  if (!config?.access_token) return;

  const client = new MercadoPagoConfig({ accessToken: config.access_token });
  const preference = new Preference(client);

  try {
    const response = await preference.create({
      body: {
        items: [{ id: "123", title: "Test", quantity: 1, unit_price: 10, currency_id: "BRL" }],
        external_reference: "tenant-id-test",
        back_urls: { success: "http://test.com", failure: "http://test.com", pending: "http://test.com" },
        auto_return: "approved",
      }
    });
    console.log("Success! Init point:", response.init_point);
  } catch (error: any) {
    console.log("MP SDK Error:", error.message, error.cause);
  }
  process.exit(0);
}
test();
