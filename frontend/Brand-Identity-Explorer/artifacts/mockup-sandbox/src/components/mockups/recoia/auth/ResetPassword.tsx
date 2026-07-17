import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Check, Info } from 'lucide-react';

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

export function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10">
        <RecoIALogo />
        
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-8 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 font-medium">This reset link is valid for 15 minutes</p>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create new password</h1>
          <p className="text-slate-500 mt-2 text-sm">Your new password must be different from previous passwords</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-medium text-slate-900">New Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter new password" 
                className="h-11 pr-10" 
                defaultValue="NewP@ssw0rd!"
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="font-medium text-slate-900">Confirm Password</Label>
            <div className="relative">
              <Input 
                id="confirm-password" 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Confirm new password" 
                className="h-11 pr-10" 
                defaultValue="NewP@ssw0rd!"
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="space-y-3 pt-1 bg-slate-50 rounded-lg p-4 border border-slate-100">
            <div className="flex items-center text-sm font-medium text-slate-700">
              <Check className="w-4 h-4 text-green-500 mr-2 shrink-0" strokeWidth={3} />
              At least 8 characters
            </div>
            <div className="flex items-center text-sm font-medium text-slate-700">
              <Check className="w-4 h-4 text-green-500 mr-2 shrink-0" strokeWidth={3} />
              One uppercase letter
            </div>
            <div className="flex items-center text-sm font-medium text-slate-700">
              <Check className="w-4 h-4 text-green-500 mr-2 shrink-0" strokeWidth={3} />
              One number
            </div>
            <div className="flex items-center text-sm font-medium text-slate-700">
              <Check className="w-4 h-4 text-green-500 mr-2 shrink-0" strokeWidth={3} />
              One special character
            </div>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg h-12 shadow-sm mt-4">
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
