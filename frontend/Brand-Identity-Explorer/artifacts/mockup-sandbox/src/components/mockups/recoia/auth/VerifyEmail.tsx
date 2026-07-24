import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Mail, ArrowLeft } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

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

type LocationState = { email?: string } | null;

export function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const email = state?.email;
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!email) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-center">
        <p className="text-slate-600 mb-4">Start by creating an account to verify an email address.</p>
        <Link to="/register" className="text-blue-600 font-semibold hover:underline">Go to Register</Link>
      </div>
    );
  }

  async function handleVerify(): Promise<void> {
    if (!email || code.length !== 6) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.verifyEmail(email, code);
      navigate("/verify-email-success", { state: { email } });
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Verification failed.");
      navigate("/verify-email-failed", { state: { email } });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend(): Promise<void> {
    if (!email) return;
    setResending(true);
    setError(null);
    setResent(false);
    try {
      await api.resendVerification(email);
      setResent(true);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Unable to resend the code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10 text-center">
        <RecoIALogo />

        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 border-8 border-blue-50/50">
          <Mail className="w-7 h-7 text-blue-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">Check your inbox</h1>

        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          We sent a 6-digit verification code to <br />
          <span className="font-semibold text-slate-900">{email}</span>
        </p>

        {resent && (
          <p className="rounded-lg bg-green-50 border border-green-100 px-3 py-2 text-sm font-medium text-green-700 mb-6">
            A new code has been sent to your email.
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm font-medium text-red-600 mb-6">{error}</p>
        )}

        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            void handleVerify();
          }}
        >
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode}>
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

          <Button
            type="submit"
            disabled={submitting || code.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg h-12 shadow-sm"
          >
            {submitting ? "Verifying…" : "Verify Email"}
          </Button>
        </form>

        <Button
          variant="ghost"
          disabled={resending}
          onClick={handleResend}
          className="w-full border border-slate-200 text-slate-700 font-medium rounded-lg h-12 mt-4 hover:bg-slate-50"
        >
          {resending ? "Resending…" : "Resend code"}
        </Button>

        <div className="pt-6">
          <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
