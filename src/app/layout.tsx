import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Activity } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Prowider Lead Distribution',
  description: 'Mini Lead Distribution System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col selection:bg-blue-200 selection:text-blue-900`}>
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-sm shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">Prowider</span>
            </Link>
            <nav className="flex gap-1 md:gap-2 font-medium text-sm text-slate-600">
              <Link href="/request-service" className="px-4 py-2 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-all">
                Request Service
              </Link>
              <Link href="/dashboard" className="px-4 py-2 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-all">
                Dashboard
              </Link>
              <Link href="/test-tools" className="px-4 py-2 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-all">
                Test Tools
              </Link>
            </nav>
          </div>
        </header>
        
        <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-blue-100/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          {children}
        </main>
      </body>
    </html>
  );
}
