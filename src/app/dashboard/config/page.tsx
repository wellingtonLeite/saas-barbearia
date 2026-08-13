import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Copy, ExternalLink, Info, Link as LinkIcon, Shield, Clock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ConfigPage() {
  const session = await auth();
  
  if (session?.user?.role !== 'OWNER' && session?.user?.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

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

  const tenant = userWithTenant?.units[0]?.unit?.tenant;

  if (!tenant) {
    return <div>Barbearia não encontrada.</div>;
  }

  // URL pública da barbearia
  const publicUrl = `http://localhost:3000/${tenant.slug}`;
  
  // URL de login do sistema (mesma para dono e funcionário)
  const loginUrl = `http://localhost:3000/login`;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary">Configurações</h1>
        <p className="text-text-secondary mt-2">
          Gerencie as informações da sua barbearia e links de acesso.
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

        {/* Card: Dados da Barbearia */}
        <div className="bg-surface border border-secondary rounded-xl p-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-secondary/50 text-text-primary rounded-lg">
              <Info size={24} />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Dados da Barbearia</h2>
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
              <p className="text-xs text-text-secondary mt-1">Para alterar o link, entre em contato com o suporte.</p>
            </div>
          </div>

          <form action={async (formData) => {
            "use server";
            const unitId = formData.get('unitId') as string;
            const address = formData.get('address') as string;
            const phone = formData.get('phone') as string;
            
            const { db } = await import("@/lib/db");
            await db.unit.update({
              where: { id: unitId },
              data: { address, phone }
            });
            
            const { revalidatePath } = await import("next/cache");
            revalidatePath("/dashboard/config");
            revalidatePath(`/${tenant.slug}`);
          }} className="border-t border-secondary pt-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Contato e Localização</h3>
            <input type="hidden" name="unitId" value={userWithTenant?.units[0]?.unitId || ''} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="text-sm text-text-secondary block mb-2">WhatsApp / Telefone</label>
                <input 
                  type="text" 
                  name="phone"
                  defaultValue={userWithTenant?.units[0]?.unit?.phone || ''}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-2 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary block mb-2">Endereço Completo</label>
                <input 
                  type="text" 
                  name="address"
                  defaultValue={userWithTenant?.units[0]?.unit?.address || ''}
                  placeholder="Rua Exemplo, 123 - Bairro"
                  className="w-full bg-background border border-secondary rounded-lg px-4 py-2 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button type="submit" className="bg-primary text-white font-bold px-6 py-2 rounded-lg hover:bg-primary-hover hover:scale-105 transition-all shadow-lg shadow-primary/20">
                Salvar Contato
              </button>
            </div>
          </form>

          {/* Upload/Link de Logo */}
          <div className="border-t border-secondary pt-6 mt-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Logotipo da Barbearia</h3>
            <p className="text-sm text-text-secondary mb-4">
              Insira o link (URL) de uma imagem hospedada para ser o seu logotipo. Ela aparecerá no painel da equipe e na vitrine dos clientes.
            </p>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-2xl bg-background border border-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                {tenant.logo_url ? (
                  <img src={tenant.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-text-secondary text-center px-2">Sem<br/>Logo</span>
                )}
              </div>
              <form action={async (formData) => {
                "use server";
                const { updateTenantLogo } = await import("@/app/actions/tenant");
                await updateTenantLogo(formData);
              }} className="flex-1 space-y-4">
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
                <button type="submit" className="bg-primary text-black font-bold px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors">
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

      </div>
    </div>
  );
}
