import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Copy, ExternalLink, Info, Link as LinkIcon, Shield, Clock, MessageCircle, DollarSign } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-.85-.05A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 10.84 4.47V12.9a8.27 8.27 0 0 0 5.61 2.19v-3.46c-1.85 0-3.46-.94-4.41-2.39z"/>
    </svg>
  );
}

async function updateGeneralConfigAction(formData: FormData) {
  "use server";
  const address = formData.get('address') as string;
  const phone = formData.get('phone') as string;
  const instagram_url = formData.get('instagram_url') as string;
  const facebook_url = formData.get('facebook_url') as string;
  const tiktok_url = formData.get('tiktok_url') as string;
  const fixed_cost_raw = formData.get('fixed_cost_monthly') as string;
  const fixed_cost_monthly = fixed_cost_raw ? parseFloat(fixed_cost_raw.replace(',', '.')) : 0;

  const { updateTenantSocialAndFixedCost } = await import("@/app/actions/tenant");
  await updateTenantSocialAndFixedCost({
    address,
    phone,
    instagram_url,
    facebook_url,
    tiktok_url,
    fixed_cost_monthly,
  });
}

async function updateLogoAction(formData: FormData) {
  "use server";
  const { updateTenantLogo } = await import("@/app/actions/tenant");
  await updateTenantLogo(formData);
}

export default async function ConfigPage() {
  const session = await auth();
  
  if (session?.user?.role !== 'OWNER' && session?.user?.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const { getUserTenant } = await import("@/lib/tenant");
  const userTenant = session?.user?.id ? await getUserTenant(session.user.id) : null;

  const userWithTenant = await db.user.findUnique({
    where: { id: session?.user?.id },
    include: {
      units: {
        include: {
          unit: {
            include: {
              tenant: true
            }
          }
        }
      }
    }
  });

  const tenant = userWithTenant?.units[0]?.unit?.tenant || (userTenant ? await db.tenant.findUnique({ where: { id: userTenant.id } }) : null);

  if (!tenant) {
    return <div className="p-6 text-text-secondary">Barbearia não encontrada.</div>;
  }

  const primaryUnit = userWithTenant?.units[0]?.unit || await db.unit.findFirst({ where: { tenantId: tenant.id } });

  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  // URL pública da barbearia
  const publicUrl = `${baseUrl}/${tenant.slug}`;
  
  // URL de login do sistema (mesma para dono e funcionário)
  const loginUrl = `${baseUrl}/login`;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary">Configurações</h1>
        <p className="text-text-secondary mt-2">
          Gerencie as informações da sua barbearia, redes sociais, custo fixo e links de acesso.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card: Link Público */}
        <div className="bg-surface border border-secondary rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 text-primary rounded-lg">
              <LinkIcon size={24} />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Link de Agendamento</h2>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            Este é o link público da sua vitrine. Coloque-o na Bio do seu Instagram ou envie no WhatsApp dos seus clientes para eles agendarem horários.
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 p-3 bg-background border border-secondary rounded-lg">
              <span className="text-sm font-medium flex-1 truncate">{publicUrl}</span>
              <button className="text-text-secondary hover:text-primary transition-colors p-1" title="Copiar Link">
                <Copy size={16} />
              </button>
            </div>
            <Link 
              href={publicUrl} 
              target="_blank"
              className="text-sm text-primary hover:underline flex items-center gap-1 mt-2 font-medium"
            >
              Abrir vitrine em nova aba <ExternalLink size={14} />
            </Link>
          </div>
        </div>

        {/* Card: Acesso da Equipe */}
        <div className="bg-surface border border-secondary rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-secondary/50 text-text-primary rounded-lg">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Acesso da Equipe</h2>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            Seus funcionários (barbeiros) utilizam a <strong>mesma tela de login</strong> que você para acessar o sistema, mas a visão deles é restrita à própria agenda e comissões.
          </p>
          
          <div className="bg-background border border-secondary p-4 rounded-lg space-y-3">
            <div>
              <span className="text-xs text-text-secondary uppercase font-bold tracking-wider">Página de Login</span>
              <p className="text-sm font-medium mt-1">{loginUrl}</p>
            </div>
            <div className="pt-2 border-t border-secondary">
              <span className="text-xs text-text-secondary uppercase font-bold tracking-wider">Como o barbeiro entra?</span>
              <ul className="text-sm mt-1 list-disc list-inside text-text-secondary space-y-1">
                <li>Acesse o menu <Link href="/dashboard/equipe" className="text-primary hover:underline">Equipe</Link>.</li>
                <li>Ao adicionar um barbeiro, informe o <strong>Email</strong> e a <strong>Senha inicial</strong> dele.</li>
                <li>Repasse o link de login, email e senha para ele.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Card: Dados da Barbearia e Configurações Gerais */}
        <div className="bg-surface border border-secondary rounded-xl p-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-secondary/50 text-text-primary rounded-lg">
              <Info size={24} />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Dados da Barbearia & Configurações</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-sm text-text-secondary block mb-2">Nome do Negócio</label>
              <input 
                type="text" 
                value={tenant.name} 
                disabled
                className="w-full bg-background border border-secondary rounded-lg px-4 py-2 text-text-primary opacity-70 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-2">Slug (Identificador da URL)</label>
              <input 
                type="text" 
                value={tenant.slug} 
                disabled
                className="w-full bg-background border border-secondary rounded-lg px-4 py-2 text-text-primary opacity-70 cursor-not-allowed"
              />
              <p className="text-xs text-text-secondary mt-1">Para alterar o identificador da URL, entre em contato com o suporte.</p>
            </div>
          </div>

          <form action={updateGeneralConfigAction} className="border-t border-secondary pt-6 space-y-6">
            {/* Contato e Localização */}
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-4">Contato e Localização</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-text-secondary block mb-2">WhatsApp / Telefone de Contato</label>
                  <input 
                    type="text" 
                    name="phone"
                    defaultValue={primaryUnit?.phone || ''}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-background border border-secondary rounded-lg px-4 py-2 text-text-primary focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-secondary block mb-2">Endereço Completo</label>
                  <input 
                    type="text" 
                    name="address"
                    defaultValue={primaryUnit?.address || ''}
                    placeholder="Rua Exemplo, 123 - Bairro, Cidade - UF"
                    className="w-full bg-background border border-secondary rounded-lg px-4 py-2 text-text-primary focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="border-t border-secondary/60 pt-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Redes Sociais</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5 mb-2">
                    <InstagramIcon className="w-4 h-4 text-pink-500" />
                    Instagram (Link ou @perfil)
                  </label>
                  <input 
                    type="text" 
                    name="instagram_url"
                    defaultValue={tenant.instagram_url || ''}
                    placeholder="https://instagram.com/suabarbearia"
                    className="w-full bg-background border border-secondary rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5 mb-2">
                    <FacebookIcon className="w-4 h-4 text-blue-500" />
                    Facebook (Link da Página)
                  </label>
                  <input 
                    type="text" 
                    name="facebook_url"
                    defaultValue={tenant.facebook_url || ''}
                    placeholder="https://facebook.com/suabarbearia"
                    className="w-full bg-background border border-secondary rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5 mb-2">
                    <TikTokIcon className="w-4 h-4 text-cyan-400" />
                    TikTok (Link do Perfil)
                  </label>
                  <input 
                    type="text" 
                    name="tiktok_url"
                    defaultValue={tenant.tiktok_url || ''}
                    placeholder="https://tiktok.com/@suabarbearia"
                    className="w-full bg-background border border-secondary rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Custo Fixo Operacional Mensal */}
            <div className="border-t border-secondary/60 pt-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-primary" />
                <h3 className="text-lg font-bold text-text-primary">Custo Fixo Operacional & Break-Even</h3>
              </div>
              <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                Informe o valor total estimado das despesas fixas da barbearia no mês (aluguel, contas, internet, softwares). 
                Esse valor é utilizado como base de cálculo no Termômetro de Ponto de Equilíbrio (Break-Even) e dividido entre as cadeiras ativas.
              </p>
              
              <div className="max-w-xs">
                <label className="text-xs font-semibold text-text-secondary block mb-1.5 uppercase tracking-wider">
                  Custo Fixo Mensal (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-semibold">
                    R$
                  </span>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    name="fixed_cost_monthly"
                    defaultValue={Number(tenant.fixed_cost_monthly || 0) > 0 ? Number(tenant.fixed_cost_monthly).toFixed(2) : ''}
                    placeholder="0.00"
                    className="w-full bg-background border border-secondary rounded-lg pl-10 pr-4 py-2 text-text-primary font-bold focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                className="bg-primary text-white font-bold px-6 py-2.5 rounded-lg hover:bg-primary-hover hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                Salvar Configurações
              </button>
            </div>
          </form>

          {/* Upload/Link de Logo */}
          <div className="border-t border-secondary pt-6 mt-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Logotipo da Barbearia</h3>
            <p className="text-sm text-text-secondary mb-4">
              Envie uma imagem do seu computador para ser o seu logotipo. Ela aparecerá no painel da equipe e na vitrine de agendamento dos clientes.
            </p>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-2xl bg-background border border-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                {tenant.logo_url ? (
                  <img src={tenant.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-text-secondary text-center px-2">Sem<br/>Logo</span>
                )}
              </div>
              <form action={updateLogoAction} className="flex-1 space-y-4">
                <input type="hidden" name="tenantId" value={tenant.id} />
                <div>
                  <label className="text-sm text-text-secondary block mb-2">Envie uma imagem do seu computador (PNG, JPG)</label>
                  <input 
                    type="file" 
                    name="logoFile"
                    accept="image/*"
                    required
                    className="w-full bg-background border border-secondary rounded-lg px-4 py-2 text-text-primary focus:border-primary focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                  />
                </div>
                <button type="submit" className="bg-primary text-white font-bold px-5 py-2 rounded-lg hover:bg-primary-hover transition-colors shadow-md shadow-primary/20">
                  Salvar Logo
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Card: Horário de Funcionamento */}
        <div className="bg-surface border border-secondary rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-success/20 text-success rounded-lg">
              <Clock size={24} />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Horário de Funcionamento</h2>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            Defina os dias e horários gerais em que a sua barbearia está aberta. Os horários dos barbeiros vão respeitar essa janela máxima.
          </p>
          <Link 
            href="/dashboard/config/horarios-barbearia"
            className="inline-block mt-2 px-6 py-3 bg-secondary/50 hover:bg-primary/20 text-text-primary hover:text-primary rounded-xl text-sm font-bold transition-colors w-full text-center"
          >
            Configurar Horários da Unidade
          </Link>
        </div>

        {/* Card: WhatsApp & IA SDR */}
        <div className="bg-surface border border-secondary rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <MessageCircle size={24} />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Conectar WhatsApp & IA SDR</h2>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              IA SDR
            </span>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            Conecte o WhatsApp da sua barbearia para ativar o robô inteligente de agendamentos 24/7 e personalizar mensagens automáticas.
          </p>
          <Link 
            href="/dashboard/config/whatsapp"
            className="inline-block mt-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold transition-all w-full text-center shadow-lg shadow-primary/20 hover:scale-[1.02]"
          >
            Conectar WhatsApp & IA SDR
          </Link>
        </div>

      </div>
    </div>
  );
}
