"use client";

import React, { useState } from 'react';

export function MetaCard({ currentRevenue, targetRevenue }: { currentRevenue: number; targetRevenue: number }) {
  const [target, setTarget] = useState(targetRevenue);
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(target?.toString() || "");

  const handleSave = () => {
    const val = parseFloat(inputValue);
    if (!isNaN(val) && val > 0) {
      setTarget(val);
      // Aqui idealmente seria chamada uma Server Action para salvar no BD
    }
    setEditing(false);
  };

  if (!target || target === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 py-4">
        <p className="text-text-secondary text-sm">Meta mensal não definida.</p>
        <div className="flex gap-2">
          <input 
            type="number" 
            className="bg-background border border-secondary rounded-lg px-3 py-1 text-text-primary text-sm focus:outline-none focus:border-primary w-32" 
            placeholder="Ex: 5000"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button 
            onClick={handleSave}
            className="bg-primary text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors"
          >
            Definir
          </button>
        </div>
      </div>
    );
  }

  const percent = Math.min(100, (currentRevenue / target) * 100);
  const strokeDasharray = 283; // 2 * pi * r (r=45)
  const strokeDashoffset = strokeDasharray - (percent / 100) * strokeDasharray;

  return (
    <div className="flex flex-col items-center justify-center h-full relative py-2">
      <div className="relative w-32 h-32 flex items-center justify-center group cursor-pointer" onClick={() => setEditing(true)}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-secondary)" strokeWidth="8" />
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="var(--color-primary)" 
            strokeWidth="8" 
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-text-primary">{percent.toFixed(0)}%</span>
          <span className="text-[10px] text-text-secondary uppercase">da Meta</span>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs font-bold text-primary">Editar Meta</span>
        </div>
      </div>
      
      {editing ? (
        <div className="mt-4 flex gap-2">
          <input 
            type="number" 
            className="bg-background border border-secondary rounded-lg px-2 py-1 text-text-primary text-sm focus:outline-none focus:border-primary w-28 text-center" 
            value={inputValue}
            autoFocus
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            onBlur={handleSave}
          />
        </div>
      ) : (
        <div className="mt-4 text-center">
          <p className="text-xs text-text-secondary mb-1">R$ {currentRevenue.toFixed(2)} / R$ {target.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
