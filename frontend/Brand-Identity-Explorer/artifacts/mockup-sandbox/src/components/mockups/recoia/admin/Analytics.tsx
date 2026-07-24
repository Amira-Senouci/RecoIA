import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AdminLayout } from '../_shared/AdminLayout';
import { api, ApiError, type AdminAnalytics } from '@/lib/api';

const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#E0E7FF'];

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .getAdminAnalytics()
      .then((res) => {
        if (!cancelled) setAnalytics(res);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof ApiError ? cause.message : "Unable to load analytics.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Analytics">
        <p className="max-w-[1400px] mx-auto rounded-xl bg-white p-6 text-slate-500 shadow-sm">Loading analytics…</p>
      </AdminLayout>
    );
  }

  if (error || !analytics) {
    return (
      <AdminLayout title="Analytics">
        <div className="max-w-[1400px] mx-auto rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">{error ?? "No analytics available."}</div>
      </AdminLayout>
    );
  }

  const totalEvents = analytics.events_by_type.reduce((sum, row) => sum + row.count, 0);

  return (
    <AdminLayout title="Analytics">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {analytics.events_by_type.slice(0, 4).map((row, i) => (
            <Card key={i} className="border-slate-200 shadow-sm rounded-xl">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-slate-500 mb-2">{row.event_type} events</p>
                <h3 className="text-3xl font-bold text-slate-900 leading-none">{row.count.toLocaleString()}</h3>
              </CardContent>
            </Card>
          ))}
          {analytics.events_by_type.length === 0 && (
            <p className="col-span-4 text-sm text-slate-500">No events recorded yet.</p>
          )}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">Events Per Day (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.events_by_day} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                    <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#2563EB' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">Event Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full flex flex-col items-center justify-center pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.events_by_type.map(e => ({ name: e.event_type, value: e.count }))} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                      {analytics.events_by_type.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                  {analytics.events_by_type.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-xs font-medium text-slate-600">{d.event_type} ({totalEvents > 0 ? Math.round((d.count / totalEvents) * 100) : 0}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Items */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">Top Viewed Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.top_items.map(t => ({ name: (t.title ?? t.item_id).slice(0, 20), views: t.views }))} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569' }} dx={-10} width={160} />
                  <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="views" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  );
}
