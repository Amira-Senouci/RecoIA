import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

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

export function ForgotPassword() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans gap-8">
      {/* State 1: Request Reset */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10 relative">
        <div className="absolute top-4 right-4">
          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Form State</span>
        </div>
        <RecoIALogo />
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reset your password</h1>
          <p className="text-slate-500 mt-2 text-sm">Enter your email and we'll send you a link</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium text-slate-900">Email address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="alex@example.com" 
              className="h-11" 
            />
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg h-12 shadow-sm">
            Send Reset Link
          </Button>

          <p className="text-center text-xs text-slate-500 leading-relaxed px-4 pt-2">
            We'll send instructions to reset your password if an account exists for this email.
          </p>

          <div className="pt-4 text-center">
            <a href="#" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </a>
          </div>
        </form>
      </div>

      {/* State 2: Sent */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10 relative text-center">
        <div className="absolute top-4 right-4">
          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Success State</span>
        </div>
        
        <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6 border-8 border-green-50/50">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">Check your inbox!</h1>
        
        <p className="text-slate-600 text-sm leading-relaxed mb-8">
          We sent a password reset link to <span className="font-semibold text-slate-900">alex@example.com</span>. The link expires in 15 minutes.
        </p>

        <Button variant="ghost" className="w-full border border-slate-200 text-slate-700 font-medium rounded-lg h-12 mb-6 hover:bg-slate-50">
          Resend email
        </Button>
        
        <a href="#" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </a>
      </div>
    </div>
  );
}
