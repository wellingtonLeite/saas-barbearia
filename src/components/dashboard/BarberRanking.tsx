import React from 'react';

export function BarberRanking({ barbers }: { barbers: { name: string; revenue: number; appointments: number; avatar?: string }[] }) {
  if (barbers.length === 0) {
    return <p className="text-text-secondary text-sm">Nenhum dado disponível.</p>;
  }

  const maxRevenue = barbers[0]?.revenue || 1;

  return (
    <div className="space-y-4">
      {barbers.map((barber, idx) => {
        const isGold = idx === 0;
        const isSilver = idx === 1;
        const isBronze = idx === 2;
        let badge = <span className="w-6 text-center text-text-secondary font-bold">{idx + 1}º</span>;
        
        if (isGold) badge = <span className="w-6 text-center text-yellow-500 font-bold text-lg">🥇</span>;
        else if (isSilver) badge = <span className="w-6 text-center text-gray-300 font-bold text-lg">🥈</span>;
        else if (isBronze) badge = <span className="w-6 text-center text-amber-600 font-bold text-lg">🥉</span>;

        const percent = Math.min(100, Math.max(0, (barber.revenue / maxRevenue) * 100));

        return (
          <div key={idx} className="flex flex-col gap-2 relative z-10 group">
            <div className="flex items-center gap-3">
              {badge}
              <div className="flex-1">
                <p className="font-bold text-text-primary text-sm group-hover:text-primary transition-colors">{barber.name}</p>
                <p className="text-xs text-text-secondary">{barber.appointments} atendimentos</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary text-sm">R$ {barber.revenue.toFixed(2)}</p>
              </div>
            </div>
            <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
