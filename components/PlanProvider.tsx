"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { emptyPlan, readPlan, writePlan, type Plan } from '@/lib/progress';

const Context = createContext<{ plan: Plan; ready: boolean; error: string; update: (fn: (plan: Plan) => Plan) => void } | null>(null);
export default function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState(emptyPlan);
  const current = useRef(plan);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const sync = () => { const loaded = readPlan(); current.current = loaded.plan; setPlan(loaded.plan); setError(loaded.error); setReady(true); };
    sync(); window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const update = (fn: (plan: Plan) => Plan) => {
    const next = fn(current.current); current.current = next; setPlan(next); setError(writePlan(next));
  };
  return <Context.Provider value={{ plan, ready, error, update }}>{error && <div role="alert" className="mx-auto max-w-5xl m-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">{error} <a href="/dashboard" className="underline font-semibold">Backup controls</a></div>}{children}</Context.Provider>;
}
export function usePlan() { const context = useContext(Context); if (!context) throw new Error('PlanProvider required'); return context; }
