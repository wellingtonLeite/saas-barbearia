import { db } from "@/lib/db";
import { SystemSettingsForm } from "./SystemSettingsForm";
import { Settings } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Configurações do Sistema | SaaS Barbearia",
};

export default async function ConfiguracoesPage() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/login");

  const [templatesRecord, groqRecord] = await Promise.all([
    db.systemSetting.findUnique({ where: { key: "WHATSAPP_TEMPLATES" } }),
    db.systemSetting.findUnique({ where: { key: "GROQ_CONFIG" } }),
  ]);

  const defaultTemplates = templatesRecord ? templatesRecord.value : null;
  const groqConfig = groqRecord ? groqRecord.value : null;

  // Mascara a chave antes de mandar para o client
  const maskedGroqConfig = groqConfig
    ? {
        ...(groqConfig as any),
        api_key: (groqConfig as any).api_key
          ? "****" + ((groqConfig as any).api_key as string).slice(-4)
          : "",
      }
    : null;

  return (
    <div className="p-8 w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Settings className="text-red-500" /> Configurações Globais
        </h1>
        <p className="text-slate-400">Configure integrações e modelos padrão do sistema.</p>
      </div>

      <SystemSettingsForm defaultTemplates={defaultTemplates} groqConfig={maskedGroqConfig} />
    </div>
  );
}
