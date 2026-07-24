import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
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

export function VerifyFailed() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as LocationState)?.email;
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResend(): Promise<void> {
    if (!email) {
      navigate("/register");
      return;
    }
    setResending(true);
    setError(null);
    try {
      await api.resendVerification(email);
      navigate("/verify-email", { state: { email } });
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Unable to resend the code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10 text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-64 bg-red-50/80 rounded-b-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="relative z-10">
          <RecoIALogo />

          <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
            <XCircle className="w-14 h-14 text-red-500" strokeWidth={2.5} />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Verification failed</h1>

          <p className="text-slate-600 text-sm leading-relaxed mb-8">
            This verification code has expired or is invalid.
          </p>

          {error && (
            <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm font-medium text-red-600 mb-6">{error}</p>
          )}

          <div className="space-y-3 mb-6">
            <Button
              disabled={resending}
              onClick={handleResend}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg h-12 shadow-sm"
            >
              {resending ? "Resending…" : "Resend Verification Code"}
            </Button>
            <Link to="/register">
              <Button variant="outline" className="w-full border-slate-200 text-slate-700 font-medium hover:bg-slate-50 rounded-lg h-12">
                Try a Different Email
              </Button>
            </Link>
          </div>

          <p className="text-slate-500 text-xs font-medium mb-8">
            Need help? Contact support at <a href="mailto:support@recoia.ai" className="text-blue-600 hover:underline">support@recoia.ai</a>
          </p>

          <div>
            <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
