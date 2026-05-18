'use client';

import { useState } from 'react';
import { RotateCcw, Zap, Copy, CheckCircle, AlertCircle } from 'lucide-react';

export default function TestTools() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string, details?: any } | null>(null);

  const handleResetQuotas = async () => {
    setLoading('reset');
    setResult(null);
    try {
      const webhookId = `wh_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const res = await fetch('/api/webhook/reset-quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookId })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset quotas');
      
      setResult({ type: 'success', message: data.message });
    } catch (err: any) {
      setResult({ type: 'error', message: err.message });
    } finally {
      setLoading(null);
    }
  };

  const handleIdempotencyTest = async () => {
    setLoading('idempotency');
    setResult(null);
    try {
      const fixedWebhookId = `wh_fixed_${Date.now()}`;
      
      const promises = Array.from({ length: 3 }).map(() => 
        fetch('/api/webhook/reset-quota', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ webhookId: fixedWebhookId })
        }).then(r => r.json())
      );

      const responses = await Promise.all(promises);
      
      setResult({ 
        type: 'success', 
        message: 'Sent 3 concurrent webhook requests with the SAME ID.',
        details: responses
      });
    } catch (err: any) {
      setResult({ type: 'error', message: err.message });
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateLeads = async () => {
    setLoading('generate');
    setResult(null);
    try {
      const res = await fetch('/api/test/generate-leads', {
        method: 'POST',
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate leads');
      
      setResult({ type: 'success', message: data.message, details: data.results });
    } catch (err: any) {
      setResult({ type: 'error', message: err.message });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">Test Tools Simulator</h1>
        <p className="text-slate-500 mt-3 text-lg max-w-2xl mx-auto">Trigger system actions to evaluate concurrency, idempotency, and allocation rules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Card 1: Reset Quotas */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-all group relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-2xl -mr-10 -mt-10 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex-1 flex flex-col">
            <div className="bg-orange-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border border-orange-200 text-orange-600">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Reset Quotas</h2>
            <p className="text-slate-500 text-sm mb-6 flex-1">
              Fires a webhook to reset all providers back to 0 used quota and clears assignments.
            </p>
            <button
              onClick={handleResetQuotas}
              disabled={loading !== null}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm mt-auto shadow-sm shadow-slate-900/20"
            >
              {loading === 'reset' ? 'Resetting...' : 'Trigger Webhook'}
            </button>
          </div>
        </div>

        {/* Card 2: Test Idempotency */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-all group relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex-1 flex flex-col">
            <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border border-blue-200 text-blue-600">
              <Copy className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Test Idempotency</h2>
            <p className="text-slate-500 text-sm mb-6 flex-1">
              Sends the exact same webhook ID concurrently 3 times to ensure the system ignores duplicates.
            </p>
            <button
              onClick={handleIdempotencyTest}
              disabled={loading !== null}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm mt-auto shadow-sm shadow-slate-900/20"
            >
              {loading === 'idempotency' ? 'Testing...' : 'Send Duplicate Webhook'}
            </button>
          </div>
        </div>

        {/* Card 3: Concurrency Test */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-all group relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -mr-10 -mt-10 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex-1 flex flex-col">
            <div className="bg-indigo-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border border-indigo-200 text-indigo-600">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Concurrency Stress</h2>
            <p className="text-slate-500 text-sm mb-6 flex-1">
              Fires 10 lead creation requests at the exact same millisecond using Promise.all().
            </p>
            <button
              onClick={handleGenerateLeads}
              disabled={loading !== null}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-70 disabled:cursor-not-allowed text-sm mt-auto"
            >
              {loading === 'generate' ? 'Generating...' : 'Generate 10 Leads'}
            </button>
          </div>
        </div>

      </div>

      {result && (
        <div className={`p-6 rounded-2xl border shadow-sm animate-in zoom-in-95 duration-300 ${result.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            {result.type === 'success' ? (
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
            )}
            <h3 className={`font-bold text-lg ${result.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>
              {result.message}
            </h3>
          </div>
          
          {result.details && (
            <div className="mt-4 bg-white/60 rounded-xl p-4 overflow-auto max-h-[300px] border border-slate-200/50 shadow-inner">
              <pre className="text-xs text-slate-700 font-mono">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
