import React from 'react';

export function TopServices({ services }: { services: { name: string; count: number; revenue: number }[] }) {
  if (services.length === 0) {
    return <p className="text-text-secondary text-sm">Nenhum serviço registrado.</p>;
  }

  const maxCount = services[0]?.count || 1;

  return (
    <div className="space-y-4">
      {services.map((service, idx) => {
        const percent = Math.min(100, Math.max(0, (service.count / maxCount) * 100));
        
        return (
          <div key={idx} className="flex flex-col gap-1 relative group">
            <div className="flex justify-between items-center z-10 relative">
              <span className="text-sm font-bold text-text-primary truncate pr-4">{service.name}</span>
              <span className="text-sm font-medium text-text-secondary whitespace-nowrap">
                {service.count}x (R$ {service.revenue.toFixed(2)})
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-2 overflow-hidden mt-1">
              <div 
                className="bg-primary/80 h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
