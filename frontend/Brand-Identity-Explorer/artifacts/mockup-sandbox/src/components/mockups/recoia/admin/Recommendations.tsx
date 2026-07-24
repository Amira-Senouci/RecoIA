import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AdminLayout } from '../_shared/AdminLayout';
import { api, ApiError, type ModelMetric } from '@/lib/api';

const SYSTEM_LABELS: Record<string, string> = {
  popularity: "Popularity",
  als: "ALS",
  content: "Content (BGE)",
  two_tower: "Two-Tower",
  sasrec: "SASRec",
  item_item: "Item-Item CF",
  lgbm_ranker: "LambdaRank (LightGBM)",
  hybrid_rrf_weighted: "Hybrid (Weighted RRF)",
};

export function RecommendationsPage() {
  const [metrics, setMetrics] = useState<ModelMetric[]>([]);
  const [bestSystem, setBestSystem] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .getAdminModelMetrics()
      .then((res) => {
        if (cancelled) return;
        setMetrics(res.metrics);
        setBestSystem(res.best_system);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof ApiError ? cause.message : "Unable to load model metrics.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const best = metrics.find((m) => m.system === bestSystem);
  const chartData = metrics.map((m) => ({
    name: SYSTEM_LABELS[m.system] ?? m.system,
    hr10: Number((m.hr_at_10 * 100).toFixed(2)),
    ndcg10: Number((m.ndcg_at_10 * 100).toFixed(2)),
  }));

  return (
    <AdminLayout title="Recommendation Analytics" breadcrumb="AI / Offline Evaluation">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">{error}</div>}
        {loading && <p className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">Loading offline evaluation results…</p>}

        {best && (
          <>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700 bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg w-fit">
              <Badge className="bg-blue-600 hover:bg-blue-600 border-none">BEST</Badge>
              {SYSTEM_LABELS[best.system] ?? best.system} — highest HR@10 in offline evaluation
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { label: "HR@10", value: (best.hr_at_10 * 100).toFixed(2) + "%", sub: `±${(best.ci95 * 100).toFixed(2)}%` },
                { label: "NDCG@10", value: (best.ndcg_at_10 * 100).toFixed(2) + "%" },
                { label: "Catalog Coverage", value: (best.coverage * 100).toFixed(1) + "%" },
                { label: "Diversity", value: best.diversity.toFixed(3) },
              ].map((kpi) => (
                <Card key={kpi.label} className="border-slate-200 shadow-sm rounded-xl">
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-slate-500 mb-2">{kpi.label}</p>
                    <h3 className="text-3xl font-bold text-slate-900 leading-none">{kpi.value}</h3>
                    {kpi.sub && <p className="text-xs text-slate-400 mt-1">{kpi.sub} (95% CI)</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">HR@10 by Model</CardTitle>
              <CardDescription>Hit rate at 10, held-out leave-last-out evaluation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} angle={-30} textAnchor="end" interval={0} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} unit="%" />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                    <Bar dataKey="hr10" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={50} name="HR@10 %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">NDCG@10 by Model</CardTitle>
              <CardDescription>Ranking quality, held-out leave-last-out evaluation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} angle={-30} textAnchor="end" interval={0} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} unit="%" />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                    <Bar dataKey="ndcg10" fill="#60A5FA" radius={[4, 4, 0, 0]} maxBarSize={50} name="NDCG@10 %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Model Comparison Table */}
        <Card className="border-slate-200 shadow-sm rounded-xl flex flex-col overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-white">
            <CardTitle className="text-base font-semibold text-slate-900">Model Comparison — Offline Evaluation</CardTitle>
            <CardDescription>From notebooks/results/final_master_table.csv (notebook 09)</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Model</th>
                  <th className="px-6 py-3">HR@10</th>
                  <th className="px-6 py-3">NDCG@10</th>
                  <th className="px-6 py-3">Coverage</th>
                  <th className="px-6 py-3">Diversity</th>
                  <th className="px-6 py-3">Novelty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {metrics
                  .slice()
                  .sort((a, b) => b.hr_at_10 - a.hr_at_10)
                  .map((m) => {
                    const isBest = m.system === bestSystem;
                    return (
                      <tr key={m.system} className={isBest ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50'}>
                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                          {SYSTEM_LABELS[m.system] ?? m.system}
                          {isBest && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-1.5 py-0 shadow-none text-[10px]">BEST</Badge>}
                        </td>
                        <td className={`px-6 py-4 ${isBest ? 'font-semibold text-blue-700' : 'text-slate-600'}`}>{(m.hr_at_10 * 100).toFixed(2)}%</td>
                        <td className={`px-6 py-4 ${isBest ? 'font-semibold text-blue-700' : 'text-slate-600'}`}>{(m.ndcg_at_10 * 100).toFixed(2)}%</td>
                        <td className="px-6 py-4 text-slate-600">{(m.coverage * 100).toFixed(1)}%</td>
                        <td className="px-6 py-4 text-slate-600">{m.diversity.toFixed(3)}</td>
                        <td className="px-6 py-4 text-slate-600">{m.novelty.toFixed(2)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="border-slate-200 shadow-sm rounded-xl bg-slate-50">
          <CardContent className="p-6 flex items-start gap-3 text-sm text-slate-600">
            <RefreshCw className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              These are offline evaluation results from the notebooks, not live production metrics — this system has
              no online A/B testing or request-tracing infrastructure. Live serving uses real-time item-item
              collaborative filtering seeded by each user's own history, not these trained models; see the AI Models
              page for what's actually wired into the running app.
            </p>
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  );
}
