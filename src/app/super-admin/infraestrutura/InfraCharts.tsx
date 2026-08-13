"use client";

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from "recharts";

type TenantGrowthPoint = { month: string; count: number };
type ApptPoint = { date: string; count: number };

const GOLD = "#C8A96E";
const GOLD_LIGHT = "#E8C98E";

const CustomTooltipDark = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="font-bold text-white text-sm">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function InfraCharts({ 
  tenantGrowthData, 
  apptTrendData 
}: { 
  tenantGrowthData: TenantGrowthPoint[];
  apptTrendData: ApptPoint[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Crescimento de Barbearias */}
      <div className="bg-surface border border-secondary rounded-2xl p-6">
        <h3 className="font-bold text-text-primary mb-1">Crescimento de Barbearias</h3>
        <p className="text-xs text-text-secondary mb-6">Novas barbearias nos últimos 6 meses</p>
        {tenantGrowthData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tenantGrowthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltipDark />} cursor={{ fill: "rgba(200,169,110,0.08)" }} />
              <Bar dataKey="count" name="Barbearias" fill="url(#goldGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-text-secondary text-sm">
            Nenhum dado dos últimos 6 meses.
          </div>
        )}
      </div>

      {/* Volume de Agendamentos (30 dias) */}
      <div className="bg-surface border border-secondary rounded-2xl p-6">
        <h3 className="font-bold text-text-primary mb-1">Volume de Agendamentos</h3>
        <p className="text-xs text-text-secondary mb-6">Agendamentos criados nos últimos 30 dias</p>
        {apptTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={apptTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor(apptTrendData.length / 6)} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltipDark />} />
              <Area 
                type="monotone" 
                dataKey="count" 
                name="Agendamentos"
                stroke="#7c3aed" 
                strokeWidth={2.5}
                fill="url(#apptGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-text-secondary text-sm">
            Nenhum agendamento nos últimos 30 dias.
          </div>
        )}
      </div>
    </div>
  );
}
