import React from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Mail, ArrowLeft } from 'lucide-react';

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

export function VerifyEmail() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10 text-center">
        <RecoIALogo />
        
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 border-8 border-blue-50/50">
          <Mail className="w-7 h-7 text-blue-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">Check your inbox</h1>
        
        <p className="text-slate-600 text-sm leading-relaxed mb-8">
          We sent a 6-digit verification code to <br/>
          <span className="font-semibold text-slate-900">alex@example.com</span>
        </p>

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div className="flex justify-center">
            <InputOTP maxLength={6}>
              <InputOTPGroup className="gap-2 sm:gap-3">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot 
                    key={index} 
                    index={index} 
                    className="w-10 h-12 sm:w-11 sm:h-14 text-xl font-bold border-slate-200 rounded-lg bg-white ring-offset-white focus-visible:ring-blue-600" 
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg h-12 shadow-sm">
            Verify Email
          </Button>

          <div className="space-y-4 pt-2">
            <div className="flex flex-col items-center justify-center gap-2 text-sm">
              <span className="text-slate-500 font-medium">Didn't receive it?</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-medium">Resend in 0:47</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <button type="button" disabled className="text-slate-400 font-medium cursor-not-allowed">
                  Resend Code
                </button>
              </div>
            </div>
            
            <div className="pt-4">
              <a href="#" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Use a different email
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
