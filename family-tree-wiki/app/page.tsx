'use client';

import React, { useEffect, useState } from 'react';
// Using a reliable ESM CDN to ensure the library resolves correctly in the preview environment
// For local development, you would use: import { createClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

/**
 * ARCHITECTURAL NOTE: 
 * To resolve the "Could not resolve '@/utils/supabase'" error, we have inlined the 
 * client initialization. This ensures the file is self-contained and runnable 
 * in the preview environment while maintaining the logic from Sprint 1.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [count, setCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    async function testConnection() {
      // Diagnostic check for environment variables
      if (!supabaseUrl || !supabaseAnonKey) {
        setErrorMsg('Supabase environment variables are missing in .env.local');
        setStatus('error');
        return;
      }

      try {
        // Attempting to fetch from the 'persons' table defined in the Master Spec
        const { data, error } = await supabase.from('persons').select('*');

        if (error) {
          console.error('Supabase error:', error.message);
          setErrorMsg(error.message);
          setStatus('error');
        } else {
          setCount(data?.length || 0);
          setStatus('success');
        }
      } catch (err: any) {
        console.error('Connection failed:', err);
        setErrorMsg(err.message || 'Unknown connection error');
        setStatus('error');
      }
    }

    testConnection();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 font-sans antialiased">
      <div className="w-full max-w-md p-10 bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 text-center transition-all duration-500 transform hover:scale-[1.01]">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold mb-2 text-slate-900 tracking-tight">
          Sprint 1
        </h1>
        <p className="text-slate-500 text-sm font-medium mb-8">Connection Protocol Diagnostic</p>
        
        <div className="py-8 px-6 rounded-2xl bg-slate-50 border border-slate-100 min-h-[160px] flex flex-col justify-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-indigo-600 font-bold animate-pulse">Initializing Handshake...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-center space-x-2 text-emerald-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-bold text-xl uppercase tracking-wider">Online</span>
              </div>
              <div className="space-y-1">
                <p className="text-slate-600 text-sm">
                  Communication with <span className="font-bold text-slate-800">PostgreSQL</span> cluster established.
                </p>
                <div className="mt-4 inline-block px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-mono font-bold">
                  RECORDS FOUND: {count}
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-center space-x-2 text-rose-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-bold text-xl tracking-wider">FAILED</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed px-4">
                Error Details: <span className="text-rose-600 font-mono text-xs">{errorMsg}</span>
              </p>
              <div className="pt-2">
                <p className="text-xs text-slate-400">
                  Check <code className="bg-slate-200 px-1 rounded">.env.local</code> and verify the table <code className="bg-slate-200 px-1 rounded">persons</code> exists.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
            Family Tree Master Spec • Milestone Alpha
          </p>
        </div>
      </div>
    </main>
  );
}