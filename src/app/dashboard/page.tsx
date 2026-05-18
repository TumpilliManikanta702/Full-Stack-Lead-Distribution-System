'use client';

import { useEffect, useState } from 'react';
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';

type Provider = {
  id: string;
  name: string;
  services: string[];
  monthlyQuota: number;
  usedQuota: number;
  assignedCount: number;
  leads: any[];
};

export default function Dashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setProviders(data.providers);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Poll every 3 seconds
    const intervalId = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading && providers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">Provider Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time overview of lead distribution and quota utilization.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          Live Sync Active
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50/50 backdrop-blur-sm border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Error: {error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {providers.map((provider) => {
          const quotaPercentage = (provider.usedQuota / provider.monthlyQuota) * 100;
          
          return (
            <div key={provider.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 overflow-hidden flex flex-col group">
              <div className="p-6 border-b border-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-2xl -mr-10 -mt-10 opacity-60 transition-opacity group-hover:opacity-100"></div>
                <div className="relative">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl text-slate-800 tracking-tight">{provider.name}</h3>
                    <div className="flex flex-col items-end">
                      <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full mb-1 shadow-sm">
                        {provider.usedQuota} / {provider.monthlyQuota} Used
                      </span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${provider.monthlyQuota - provider.usedQuota === 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {provider.monthlyQuota - provider.usedQuota} Remaining
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${quotaPercentage >= 100 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} 
                      style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {provider.services.map(s => (
                      <span key={s} className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200/60">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 bg-slate-50/50 flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-700">
                  <div className="p-1.5 bg-white rounded-md shadow-sm border border-slate-100">
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  Assigned Leads ({provider.assignedCount})
                </div>

                {provider.leads.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-slate-200 rounded-xl">
                    <Clock className="w-6 h-6 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-500">Waiting for leads...</p>
                  </div>
                ) : (
                  <ul className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {provider.leads.map((lead: any, i: number) => (
                      <li key={i} className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm text-sm hover:border-blue-200 transition-colors">
                        <div className="font-semibold text-slate-800">{lead.name}</div>
                        <div className="flex justify-between items-center mt-1.5">
                          <span className="text-slate-500 text-xs font-medium">{lead.phone}</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm">{lead.serviceType}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
