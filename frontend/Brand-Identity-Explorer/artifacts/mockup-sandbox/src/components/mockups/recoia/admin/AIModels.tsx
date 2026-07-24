import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '../_shared/AdminLayout';
import { api, ApiError, type AdminModel } from '@/lib/api';

export function AIModelsPage() {
  const [models, setModels] = useState<AdminModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .getAdminModels()
      .then((res) => {
        if (!cancelled) setModels(res.models);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof ApiError ? cause.message : "Unable to load models.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const active = models.find((m) => m.is_active);

  return (
    <AdminLayout title="AI Models" breadcrumb="AI / Model Management">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-700 bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Active Version: <span className="font-bold text-slate-900">{active?.version ?? "None"}</span>
          </div>
        </div>

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">{error}</div>}
        {loading && <p className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">Loading models…</p>}

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {models.map((m) => (
            <Card key={m.id} className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-slate-900">{m.version}</h3>
                    </div>
                    <p className="text-sm text-slate-500">Trained {m.trained_at ?? "at an unknown time"}</p>
                  </div>
                  <Badge variant="outline" className={`border-none font-medium px-2.5 py-1 ${m.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {m.is_active && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 inline-block"></span>}
                    {m.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Artifact Path</p>
                  <p className="text-sm font-medium text-slate-900 truncate">{m.path ?? "—"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          {!loading && models.length === 0 && (
            <p className="text-sm text-slate-500">No models registered yet. Run <code>setup_db.py</code> to register the active version.</p>
          )}
        </div>

        <Card className="border-slate-200 shadow-sm rounded-xl bg-slate-50">
          <CardContent className="p-6 flex items-start gap-3 text-sm text-slate-600">
            <RefreshCw className="w-4 h-4 mt-0.5 shrink-0" />
            <p>Live serving personalizes "Top Picks For You" with real-time item-item collaborative filtering, seeded by each user's own view/save history (falls back to catalog popularity only for genuine cold-start users with no history yet). The trained ALS, SASRec, Two-Tower, LightGBM, and hybrid-RRF models in <code>src/recsys/models/</code> are evaluated offline (see Recommendation Analytics) but not yet wired into the live serving path.</p>
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  );
}
