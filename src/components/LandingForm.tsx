"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export function LandingForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "needs_activation">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.currentTarget);
    const data = {
      barbearia: formData.get("barbearia"),
      whatsapp: formData.get("whatsapp"),
      email: formData.get("email"),
      _subject: "Novo Lead - Landing Page Navalha88!",
      _template: "table"
    };

    try {
      const response = await fetch("https://formsubmit.co/ajax/wellington.leite@criativamarketing.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("success");
      } else {
        // FormSubmit throws a specific message when activation is needed
        if (result.message && result.message.toLowerCase().includes("activation")) {
          setStatus("needs_activation");
        } else {
          setStatus("error");
        }
      }
    } catch (error) {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-green-500/10 border border-green-500/20 rounded-xl mt-2 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Reserva Confirmada!</h3>
        <p className="text-text-secondary text-sm">
          Seus dados foram enviados com sucesso. Nossa equipe entrará em contato com você pelo WhatsApp em breve para liberar o seu acesso de 15 dias grátis.
        </p>
      </div>
    );
  }

  if (status === "needs_activation") {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mt-2 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} className="text-yellow-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Ação Necessária (Segurança)</h3>
        <p className="text-text-secondary text-sm mb-4">
          Como este é o primeiro envio para o e-mail cadastrado, você precisa confirmar a propriedade do e-mail.
        </p>
        <p className="text-white text-sm font-medium bg-black/30 p-3 rounded-lg border border-white/10">
          Enviamos um e-mail de ativação para <strong className="text-primary">wellington.leite@criativamarketing.com</strong>.
          <br /><br />
          Por favor, abra sua caixa de entrada, clique em <strong>"Activate Form"</strong> e tente enviar este formulário novamente.
        </p>
        <button 
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-semibold text-primary hover:text-primary-hover"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4 mt-2">
      <input 
        type="text" 
        name="barbearia"
        required
        placeholder="Nome da sua barbearia"
        className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-white placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors text-base disabled:opacity-50"
        disabled={status === "loading"}
      />
      <input 
        type="tel" 
        name="whatsapp"
        required
        placeholder="WhatsApp (com DDD)"
        className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-white placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors text-base disabled:opacity-50"
        disabled={status === "loading"}
      />
      <input 
        type="email" 
        name="email"
        required
        placeholder="Seu melhor e-mail"
        className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-white placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors text-base disabled:opacity-50"
        disabled={status === "loading"}
      />

      {status === "error" && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center">
          Ocorreu um erro ao enviar. Tente novamente mais tarde.
        </div>
      )}

      <button 
        type="submit" 
        disabled={status === "loading"}
        className="w-full bg-primary hover:bg-primary-hover text-white font-black py-4 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 mt-1 shadow-lg shadow-primary/20 text-base sm:text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:-translate-y-0 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            ENVIANDO...
          </>
        ) : (
          "COMEÇAR AGORA — DE GRAÇA!"
        )}
      </button>
    </form>
  );
}
