'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function RequestService() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      city: formData.get('city'),
      serviceType: formData.get('serviceType'),
      description: formData.get('description'),
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit lead');
      }

      setSuccess(result);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">Request a Service</h1>
        <p className="text-slate-500 mt-2">Submit your details and get matched with our top providers instantly.</p>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>
        <div className="relative">
          
          {error && (
            <div className="mb-8 p-4 bg-red-50/50 backdrop-blur-sm border border-red-100 text-red-700 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-8 p-5 bg-emerald-50/50 backdrop-blur-sm border border-emerald-100 text-emerald-800 rounded-2xl flex items-start gap-4">
              <div className="bg-emerald-100 p-2 rounded-full">
                <CheckCircle className="w-6 h-6 shrink-0 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-lg">Request matched successfully!</p>
                <p className="text-sm mt-1 text-emerald-700 font-medium">Assigned to: {success.assignedTo.map((p: any) => p.name).join(', ')}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
              <input type="text" id="name" name="name" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800" placeholder="John Doe" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                <input type="tel" id="phone" name="phone" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800" placeholder="(555) 000-0000" />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-bold text-slate-700 mb-1.5">City</label>
                <input type="text" id="city" name="city" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800" placeholder="New York" />
              </div>
            </div>

            <div>
              <label htmlFor="serviceType" className="block text-sm font-bold text-slate-700 mb-1.5">Service Type</label>
              <select id="serviceType" name="serviceType" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 appearance-none cursor-pointer">
                <option value="">Select a service...</option>
                <option value="Service 1">Service 1</option>
                <option value="Service 2">Service 2</option>
                <option value="Service 3">Service 3</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-1.5">Description (Optional)</label>
              <textarea id="description" name="description" rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-400 font-medium text-slate-800" placeholder="Tell us more about what you need..."></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
            >
              {loading ? 'Processing Request...' : (
                <>
                  Submit Request
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
