import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Package, Activity, TrendingUp, Eye, BrainCircuit } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AdminLayout } from '../_shared/AdminLayout';
import { api, ApiError, type AdminAnalytics, type AdminModel, type AdminSummary, type CatalogItem } from '@/lib/api';

const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#E0E7FF'];

export function Dashboard() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [models, setModels] = useState<AdminModel[]>([]);
  const [catalogSample, setCatalogSample] = useState<CatalogItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.getAdminSummary(),
      api.getAdminAnalytics(),
      api.getAdminModels(),
      api.getCatalog(100),
    ])
      .then(([summaryRes, analyticsRes, modelsRes, catalogRes]) => {
        if (cancelled) return;
        setSummary(summaryRes);
        setAnalytics(analyticsRes);
        setModels(modelsRes.models);
        setCatalogSample(catalogRes.items);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof ApiError ? cause.message : "Unable to load admin data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryMix = React.useMemo(() => {
    const counts = new Map<string, number>();
    catalogSample.forEach((item) => counts.set(item.category, (counts.get(item.category) ?? 0) + 1));
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [catalogSample]);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <p className="max-w-[1400px] mx-auto rounded-xl bg-white p-6 text-slate-500 shadow-sm">Loading dashboard…</p>
      </AdminLayout>
    );
  }

  if (error || !summary || !analytics) {
    return (
      <AdminLayout title="Dashboard">
        <div className="max-w-[1400px] mx-auto rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          {error ?? "Unable to load admin data."}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* KPI Row 1 - real totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Total Users", val: summary.total_users.toLocaleString(), icon: Users },
            { title: "Total Items", val: summary.total_items.toLocaleString(), icon: Package },
            { title: "Total Events", val: summary.total_events.toLocaleString(), icon: Activity },
            { title: "Events (Last 7 Days)", val: summary.events_last_7d.toLocaleString(), icon: TrendingUp },
          ].map((k, i) => (
            <Card key={i} className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden group hover:border-blue-200 transition-colors">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-3">{k.title}</p>
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{k.val}</h3>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center"><k.icon className="w-5 h-5 text-slate-400" /></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* KPI Row 2 - event type breakdown */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {analytics.events_by_type.slice(0, 4).map((row, i) => (
            <Card key={i} className="border border-slate-200 shadow-sm bg-white rounded-2xl">
              <CardContent className="p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{row.event_type} events</p>
                <h3 className="text-xl font-bold text-slate-900">{row.count.toLocaleString()}</h3>
              </CardContent>
            </Card>
          ))}
          {analytics.events_by_type.length === 0 && (
            <p className="col-span-4 text-sm text-slate-500">No events recorded yet.</p>
          )}
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-slate-900">Events Per Day (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.events_by_day} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                    <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#2563EB' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-slate-900">Top Viewed Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.top_items.map(t => ({ name: (t.title ?? t.item_id).slice(0, 16), views: t.views }))} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                    <Bar dataKey="views" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-slate-900">Category Mix (sample of {catalogSample.length} items)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="h-[200px] w-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryMix} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                        {categoryMix.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 gap-y-3">
                  {categoryMix.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-sm font-medium text-slate-600">{d.name} <span className="text-slate-400">({d.value})</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl flex flex-col">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">Most Viewed Items</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-5">
                {analytics.top_items.length === 0 && <p className="text-sm text-slate-500">No view events recorded yet.</p>}
                {analytics.top_items.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50">
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.title ?? item.item_id}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{item.views} views</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Model registry */}
        <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2"><BrainCircuit className="w-4 h-4" /> Model Registry</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Version</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Trained At</th>
                  <th className="px-6 py-4">Path</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {models.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{m.version}</td>
                    <td className="px-6 py-4">
                      <Badge className={`${m.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'} hover:bg-opacity-80 border-none font-bold text-xs px-2.5 py-0.5`}>
                        {m.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{m.trained_at ?? '—'}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-xs">{m.path ?? '—'}</td>
                  </tr>
                ))}
                {models.length === 0 && (
                  <tr><td className="px-6 py-4 text-slate-500" colSpan={4}>No models registered.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
