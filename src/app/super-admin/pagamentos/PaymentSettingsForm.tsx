"use client";

import { useActionState } from "react";
import { savePaymentSettings } from "./actions";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
    >
      {pending ? "Salvando..." : "Salvar Alterações"}
    </button>
  );
}

export function PaymentSettingsForm({ initialData }: { initialData: any }) {
  const [state, formAction] = useActionState(savePaymentSettings, null);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="access_token" className="block text-sm font-medium text-slate-300 mb-2">
            Access Token
          </label>
          <input
            id="access_token"
            name="access_token"
            type="password"
            defaultValue={initialData?.access_token || ""}
            placeholder="APP_USR-..."
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            defaultChecked={initialData?.is_active || false}
            className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900 cursor-pointer"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-slate-300 cursor-pointer">
            Ativar integração com Mercado Pago
          </label>
        </div>
      </div>

      {state?.error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          {state.message}
        </div>
      )}

      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
