import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Network, Mail, CheckCircle2 } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Badge } from '@/components/ui/badge';

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
        <Network className="w-6 h-6 text-white" />
      </div>
      <span className="font-bold text-2xl tracking-tight text-slate-900">RecoIA</span>
    </div>
  );
}

export function AuthScreens() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-[1200px] mx-auto space-y-16">
        
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3 py-1 text-sm font-semibold">Design System</Badge>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Authentication Flows</h1>
          <p className="text-slate-500 font-medium">Production-ready auth components</p>
        </div>

        {/* Top Row: Login & Register */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Login Form */}
          <Card className="w-full max-w-[440px] mx-auto border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-2 pt-10">
              <Logo />
              <CardTitle className="text-2xl font-bold text-slate-900">Welcome back</CardTitle>
              <CardDescription className="text-base mt-2">Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-8 pb-10">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold text-slate-700">Email address</Label>
                  <Input id="email" placeholder="alex@example.com" type="email" className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-blue-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="font-semibold text-slate-700">Password</Label>
                    <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Forgot password?</a>
                  </div>
                  <Input id="password" type="password" placeholder="••••••••" className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-blue-600" />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="remember" className="border-slate-300 text-blue-600" />
                  <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 cursor-pointer">
                    Remember me for 30 days
                  </label>
                </div>
              </div>
              
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl h-12 shadow-sm">
                Sign In
              </Button>
              
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">Or continue with</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full font-semibold text-slate-700 h-11 border-slate-200 hover:bg-slate-50 rounded-xl">
                  Google
                </Button>
                <Button variant="outline" className="w-full font-semibold text-slate-700 h-11 border-slate-200 hover:bg-slate-50 rounded-xl">
                  GitHub
                </Button>
              </div>
              
              <p className="text-center text-sm text-slate-600 font-medium pt-2">
                Don't have an account? <a href="#" className="font-bold text-blue-600 hover:text-blue-700">Sign up</a>
              </p>
            </CardContent>
          </Card>

          {/* Register Form */}
          <Card className="w-full max-w-[440px] mx-auto border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-2 pt-10">
              <Logo />
              <CardTitle className="text-2xl font-bold text-slate-900">Create an account</CardTitle>
              <CardDescription className="text-base mt-2">Start getting personalized recommendations today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-8 pb-10">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name" className="font-semibold text-slate-700">Full Name</Label>
                  <Input id="reg-name" placeholder="Alex Johnson" className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-blue-600" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="font-semibold text-slate-700">Email address</Label>
                  <Input id="reg-email" placeholder="alex@example.com" type="email" className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-blue-600" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="font-semibold text-slate-700">Password</Label>
                  <Input id="reg-password" type="password" placeholder="Create a password" className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-blue-600" />
                </div>
                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox id="terms" className="mt-1 border-slate-300 text-blue-600" />
                  <label htmlFor="terms" className="text-sm font-medium leading-relaxed text-slate-600 cursor-pointer">
                    I agree to the <a href="#" className="font-bold text-slate-900 hover:text-blue-600">Terms of Service</a> and <a href="#" className="font-bold text-slate-900 hover:text-blue-600">Privacy Policy</a>
                  </label>
                </div>
              </div>
              
              <Button className="w-full bg-slate-900 hover:bg-blue-600 text-white font-semibold rounded-xl h-12 shadow-sm transition-colors">
                Create Account
              </Button>
              
              <p className="text-center text-sm text-slate-600 font-medium pt-2">
                Already have an account? <a href="#" className="font-bold text-blue-600 hover:text-blue-700">Sign in</a>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Utility Screens */}
        <div className="grid md:grid-cols-3 gap-6 pt-8">
          
          {/* Forgot Password */}
          <Card className="border border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="pt-8 px-8">
              <CardTitle className="text-xl font-bold">Reset password</CardTitle>
              <CardDescription className="text-sm">We'll send you a link to reset it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-8 pb-8">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Email</Label>
                <Input id="reset-email" placeholder="alex@example.com" type="email" className="bg-slate-50" />
              </div>
              <div className="space-y-3 pt-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">Send Reset Link</Button>
                <Button variant="ghost" className="w-full text-slate-600 font-semibold rounded-xl hover:bg-slate-50">Back to login</Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Verification */}
          <Card className="border border-slate-200 shadow-sm rounded-2xl text-center">
            <CardHeader className="pt-8 px-8">
              <div className="mx-auto w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
                <Mail className="w-7 h-7" />
              </div>
              <CardTitle className="text-xl font-bold">Check your email</CardTitle>
              <CardDescription className="text-sm">We sent a 6-digit code to alex@example.com</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="flex justify-center">
                <InputOTP maxLength={6} className="gap-2">
                  <InputOTPGroup className="gap-2">
                    {[0,1,2,3,4,5].map(i => (
                      <InputOTPSlot key={i} index={i} className="w-10 h-12 text-lg font-bold border-slate-200 rounded-lg bg-slate-50" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">Verify Email</Button>
              <p className="text-sm text-slate-500 font-medium">
                Didn't receive code? <a href="#" className="font-bold text-blue-600 hover:text-blue-700">Resend</a>
              </p>
            </CardContent>
          </Card>

          {/* Verification Success */}
          <Card className="border border-slate-200 shadow-sm rounded-2xl text-center flex flex-col justify-center">
            <CardHeader className="pt-8 px-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-bold">Email verified!</CardTitle>
              <CardDescription className="text-sm mt-2">Your account has been successfully created and verified.</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 mt-auto">
              <Button className="w-full bg-slate-900 hover:bg-blue-600 text-white font-semibold rounded-xl h-12 transition-colors">Go to Dashboard</Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

