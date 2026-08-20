"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveUnitWorkingHours, WorkingHoursActionState } from "@/app/actions/working-hours";
import { Clock, Save, CheckCircle2, AlertCircle, Loader2, Utensils, Moon, Sparkles } from "lucide-react";

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
      className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-base"
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
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="unitId" value={unitId} />

      {/* Alerta de Sucesso */}
      {state?.success === true && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 animate-fade-in shadow-lg shadow-emerald-500/10">
          <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-emerald-200">Alterações salvas!</h4>
            <p className="text-xs text-emerald-300/90">{state.message}</p>
          </div>
        </div>
      )}

      {/* Alerta de Erro */}
      {state?.success === false && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 animate-fade-in shadow-lg shadow-rose-500/10">
          <AlertCircle size={22} className="shrink-0 text-rose-400" />
          <div>
            <h4 className="font-bold text-sm text-rose-200">Não foi possível salvar</h4>
            <p className="text-xs text-rose-300/90">{state.error}</p>
          </div>
        </div>
      )}

      {/* Grid de 7 Dias em Colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        {DAYS_CONFIG.map((day) => {
          const current = hoursState[day.key] || DEFAULT_HOURS[day.key as keyof typeof DEFAULT_HOURS];
          const isOpen = current.active;
          const hasLunch = current.lunch_active;

          return (
            <div
              key={day.key}
              className={`rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between relative overflow-hidden ${
                isOpen
                  ? "bg-surface border-secondary shadow-md hover:border-primary/50 shadow-black/20"
                  : "bg-surface/40 border-secondary/40 opacity-70"
              }`}
            >
              {/* Barra de Acento Superior no Card */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 transition-all ${
                  isOpen
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : "bg-slate-700/60"
                }`}
              />

              <div>
                {/* Cabeçalho do Card */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-secondary/40">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center font-bold text-xs text-text-secondary">
                      {day.shortName}
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-base text-text-primary">
                        {day.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isOpen ? (
                          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Aberto para clientes
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-text-secondary flex items-center gap-1">
                            <Moon size={11} className="text-text-secondary" /> Fechado / Folga
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Aberto / Fechado */}
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      name={`day_${day.key}_active`}
                      checked={isOpen}
                      onChange={() => toggleDayActive(day.key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 border border-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:border-emerald-400 shadow-inner"></div>
                  </label>
                </div>

                {/* Conteúdo de Horários */}
                <div className="py-4 space-y-4">
                  {isOpen ? (
                    <>
                      {/* Horário de Abertura e Fechamento Lado a Lado */}
                      <div>
                        <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block mb-2">
                          Horário de Funcionamento
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-background/90 border border-secondary rounded-xl p-2 flex flex-col focus-within:border-primary/60 transition-colors">
                            <span className="text-[10px] text-text-secondary font-medium">Abertura</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Clock size={13} className="text-emerald-400 shrink-0" />
                              <input
                                type="time"
                                name={`day_${day.key}_start`}
                                defaultValue={current.start}
                                className="bg-transparent text-text-primary font-bold text-sm focus:outline-none w-full cursor-pointer"
                              />
                            </div>
                          </div>

                          <div className="bg-background/90 border border-secondary rounded-xl p-2 flex flex-col focus-within:border-primary/60 transition-colors">
                            <span className="text-[10px] text-text-secondary font-medium">Fechamento</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Clock size={13} className="text-emerald-400 shrink-0" />
                              <input
                                type="time"
                                name={`day_${day.key}_end`}
                                defaultValue={current.end}
                                className="bg-transparent text-text-primary font-bold text-sm focus:outline-none w-full cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pausa de Almoço */}
                      <div className="pt-3 border-t border-secondary/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                            <Utensils size={13} className={hasLunch ? "text-amber-400" : "text-text-secondary"} />
                            Intervalo de Almoço
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              name={`day_${day.key}_lunch_active`}
                              checked={hasLunch}
                              onChange={() => toggleLunchActive(day.key)}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4.5 bg-slate-800 border border-slate-700 rounded-full peer peer-checked:after:translate-x-3.5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-slate-600 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-500 peer-checked:border-amber-400 shadow-inner"></div>
                          </label>
                        </div>

                        {hasLunch && (
                          <div className="grid grid-cols-2 gap-2 animate-fade-in">
                            <div className="bg-background/90 border border-secondary rounded-xl p-1.5 flex flex-col focus-within:border-amber-400/60 transition-colors">
                              <span className="text-[9px] text-text-secondary font-medium">Início Almoço</span>
                              <input
                                type="time"
                                name={`day_${day.key}_lunch_start`}
                                defaultValue={current.lunch_start || "12:00"}
                                className="bg-transparent text-text-primary font-bold text-xs focus:outline-none cursor-pointer mt-0.5"
                              />
                            </div>
                            <div className="bg-background/90 border border-secondary rounded-xl p-1.5 flex flex-col focus-within:border-amber-400/60 transition-colors">
                              <span className="text-[9px] text-text-secondary font-medium">Fim Almoço</span>
                              <input
                                type="time"
                                name={`day_${day.key}_lunch_end`}
                                defaultValue={current.lunch_end || "13:00"}
                                className="bg-transparent text-text-primary font-bold text-xs focus:outline-none cursor-pointer mt-0.5"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-xs text-text-secondary/80 italic">
                        Estabelecimento fechado neste dia. Nenhum agendamento será permitido.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão de Salvar Centralizado no Rodapé */}
      <div className="pt-6 border-t border-secondary/60 flex items-center justify-center">
        <SubmitButton />
      </div>
    </form>
  );
}

