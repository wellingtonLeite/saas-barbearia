"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveUnitWorkingHours, WorkingHoursActionState } from "@/app/actions/working-hours";
import { Clock, Save, CheckCircle2, AlertCircle, Loader2, Utensils, Moon } from "lucide-react";

interface DayConfig {
  key: string;
  name: string;
  shortName: string;
}

const DAYS_CONFIG: DayConfig[] = [
  { key: "1", name: "Segunda-feira", shortName: "Seg" },
  { key: "2", name: "Terça-feira", shortName: "Ter" },
  { key: "3", name: "Quarta-feira", shortName: "Qua" },
  { key: "4", name: "Quinta-feira", shortName: "Qui" },
  { key: "5", name: "Sexta-feira", shortName: "Sex" },
  { key: "6", name: "Sábado", shortName: "Sáb" },
  { key: "0", name: "Domingo", shortName: "Dom" },
];

const DEFAULT_HOURS = {
  "0": { active: false, start: "09:00", end: "14:00", lunch_active: false, lunch_start: "12:00", lunch_end: "13:00" },
  "1": { active: true, start: "09:00", end: "20:00", lunch_active: false, lunch_start: "12:00", lunch_end: "13:00" },
  "2": { active: true, start: "09:00", end: "20:00", lunch_active: false, lunch_start: "12:00", lunch_end: "13:00" },
  "3": { active: true, start: "09:00", end: "20:00", lunch_active: false, lunch_start: "12:00", lunch_end: "13:00" },
  "4": { active: true, start: "09:00", end: "20:00", lunch_active: false, lunch_start: "12:00", lunch_end: "13:00" },
  "5": { active: true, start: "09:00", end: "20:00", lunch_active: false, lunch_start: "12:00", lunch_end: "13:00" },
  "6": { active: true, start: "09:00", end: "18:00", lunch_active: false, lunch_start: "12:00", lunch_end: "13:00" },
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          <span>Salvando Horários...</span>
        </>
      ) : (
        <>
          <Save size={20} />
          <span>Salvar Horários de Atendimento</span>
        </>
      )}
    </button>
  );
}

interface UnitHoursFormProps {
  unitId: string;
  initialHours: any;
}

export function UnitHoursForm({ unitId, initialHours }: UnitHoursFormProps) {
  const [state, formAction] = useActionState<WorkingHoursActionState, FormData>(
    saveUnitWorkingHours,
    null
  );

  // Estado local para controle instantâneo dos switches e animações no cliente
  const [hoursState, setHoursState] = useState(() => {
    const raw = initialHours || {};
    const stateMap: Record<string, {
      active: boolean;
      start: string;
      end: string;
      lunch_active: boolean;
      lunch_start: string;
      lunch_end: string;
    }> = {};

    DAYS_CONFIG.forEach(({ key }) => {
      const dayData = raw[key] || DEFAULT_HOURS[key as keyof typeof DEFAULT_HOURS] || {
        active: true,
        start: "09:00",
        end: "20:00",
        lunch_active: false,
        lunch_start: "12:00",
        lunch_end: "13:00"
      };

      stateMap[key] = {
        active: typeof dayData.active === "boolean" ? dayData.active : true,
        start: dayData.start || "09:00",
        end: dayData.end || "20:00",
        lunch_active: !!dayData.lunch_active,
        lunch_start: dayData.lunch_start || "12:00",
        lunch_end: dayData.lunch_end || "13:00"
      };
    });

    return stateMap;
  });

  const toggleDayActive = (key: string) => {
    setHoursState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        active: !prev[key]?.active
      }
    }));
  };

  const toggleLunchActive = (key: string) => {
    setHoursState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        lunch_active: !prev[key]?.lunch_active
      }
    }));
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="unitId" value={unitId} />

      {/* Alerta de Feedback em Verde (Sucesso) */}
      {state?.success === true && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 animate-fade-in shadow-lg shadow-emerald-500/10">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-emerald-200">Sucesso!</h4>
            <p className="text-xs text-emerald-300">{state.message}</p>
          </div>
        </div>
      )}

      {/* Alerta de Erro se houver */}
      {state?.success === false && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 animate-fade-in">
          <AlertCircle size={22} className="shrink-0 text-rose-400" />
          <div>
            <h4 className="font-bold text-sm text-rose-200">Não foi possível salvar</h4>
            <p className="text-xs text-rose-300">{state.error}</p>
          </div>
        </div>
      )}

      {/* Lista de Dias de Segunda a Domingo */}
      <div className="space-y-4">
        {DAYS_CONFIG.map((day) => {
          const current = hoursState[day.key] || DEFAULT_HOURS[day.key as keyof typeof DEFAULT_HOURS];
          const isOpen = current.active;
          const hasLunch = current.lunch_active;

          return (
            <div
              key={day.key}
              className={`rounded-2xl border transition-all duration-200 p-5 ${
                isOpen
                  ? "bg-surface border-secondary/80 shadow-md hover:border-primary/40"
                  : "bg-surface/40 border-secondary/40 opacity-70"
              }`}
            >
              {/* Linha Principal do Dia */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Nome do Dia e Switcher Aberto/Fechado */}
                <div className="flex items-center gap-4 min-w-[240px]">
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name={`day_${day.key}_active`}
                      checked={isOpen}
                      onChange={() => toggleDayActive(day.key)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-slate-800 border border-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:border-emerald-400 shadow-inner"></div>
                  </label>

                  <div>
                    <span className="font-display font-bold text-base text-text-primary block">
                      {day.name}
                    </span>
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1 mt-0.5 ${
                        isOpen ? "text-emerald-400" : "text-text-secondary"
                      }`}
                    >
                      {isOpen ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Aberto para clientes
                        </>
                      ) : (
                        <>
                          <Moon size={12} className="text-text-secondary" /> Fechado / Folga
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Horários de Abertura e Fechamento */}
                {isOpen ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-background/80 border border-secondary px-3 py-2 rounded-xl">
                      <Clock size={16} className="text-primary shrink-0" />
                      <span className="text-xs text-text-secondary font-medium">Abertura:</span>
                      <input
                        type="time"
                        name={`day_${day.key}_start`}
                        defaultValue={current.start}
                        className="bg-transparent text-text-primary font-bold text-sm focus:outline-none cursor-pointer"
                      />
                    </div>

                    <span className="text-text-secondary text-sm font-bold">às</span>

                    <div className="flex items-center gap-2 bg-background/80 border border-secondary px-3 py-2 rounded-xl">
                      <Clock size={16} className="text-primary shrink-0" />
                      <span className="text-xs text-text-secondary font-medium">Fechamento:</span>
                      <input
                        type="time"
                        name={`day_${day.key}_end`}
                        defaultValue={current.end}
                        className="bg-transparent text-text-primary font-bold text-sm focus:outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-text-secondary italic py-2">
                    Nenhum agendamento será permitido neste dia da semana.
                  </div>
                )}
              </div>

              {/* Sub-seção de Intervalo de Almoço Opcional (visível quando aberto) */}
              {isOpen && (
                <div className="mt-4 pt-4 border-t border-secondary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name={`day_${day.key}_lunch_active`}
                        checked={hasLunch}
                        onChange={() => toggleLunchActive(day.key)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 border border-slate-700 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-checked:border-amber-400 shadow-inner"></div>
                    </label>
                    <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                      <Utensils size={14} className={hasLunch ? "text-amber-400" : "text-text-secondary"} />
                      Pausa / Intervalo de Almoço
                    </span>
                  </div>

                  {hasLunch && (
                    <div className="flex items-center gap-2 animate-fade-in">
                      <input
                        type="time"
                        name={`day_${day.key}_lunch_start`}
                        defaultValue={current.lunch_start || "12:00"}
                        className="bg-background border border-secondary rounded-lg px-2.5 py-1.5 text-xs text-text-primary font-semibold focus:border-amber-400 focus:outline-none cursor-pointer"
                      />
                      <span className="text-xs text-text-secondary">até</span>
                      <input
                        type="time"
                        name={`day_${day.key}_lunch_end`}
                        defaultValue={current.lunch_end || "13:00"}
                        className="bg-background border border-secondary rounded-lg px-2.5 py-1.5 text-xs text-text-primary font-semibold focus:border-amber-400 focus:outline-none cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botão de Salvar em Destaque */}
      <div className="pt-6 border-t border-secondary/60 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
