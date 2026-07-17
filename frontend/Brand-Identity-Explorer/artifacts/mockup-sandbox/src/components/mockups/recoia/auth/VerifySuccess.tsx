import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

function RecoIALogo() {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" strokeWidth="2"/>
          <path strokeLinecap="round" strokeWidth="2" d="M12 3v2M12 19v2M3 12h2M19 12h2M5.64 5.64l1.41 1.41M16.95 16.95l1.41 1.41M5.64 18.36l1.41-1.41M16.95 7.05l1.41-1.41"/>
        </svg>
      </div>
      <span className="font-bold text-2xl tracking-tight text-slate-900">RecoIA</span>
    </div>
  );
}

export function VerifySuccess() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10 text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-64 bg-green-50/80 rounded-b-full blur-3xl opacity-50 pointer-events-none"></div>
        
        <div className="relative z-10">
          <RecoIALogo />
          
          <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500 border border-green-100">
            <CheckCircle2 className="w-14 h-14 text-green-500" strokeWidth={2.5} />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Email verified successfully.</h1>
          
          <p className="text-slate-600 text-sm leading-relaxed mb-8">
            Your account has been activated.
          </p>

          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mb-6">
            <div className="bg-blue-600 w-[70%] h-full rounded-full animate-pulse"></div>
          </div>
          
          <p className="text-slate-400 text-sm font-medium mb-8">
            Redirecting to Sign In...
          </p>

          <Button className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-medium rounded-lg h-12 shadow-sm transition-colors">
            Go to Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
