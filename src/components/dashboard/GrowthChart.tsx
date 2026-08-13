"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function GrowthChart({ data }: { data: { date: string; total: number }[] }) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#888" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              if(!value) return '';
              const parts = value.split('-');
              if(parts.length === 3) return `${parts[2]}/${parts[1]}`;
              return value;
            }}
          />
          <YAxis 
            stroke="#888" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `R$${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: 'var(--color-primary)' }}
            formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
            labelFormatter={(label) => {
              if(!label) return '';
              const parts = label.split('-');
              if(parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
              return label;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="var(--color-primary)" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorTotal)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
