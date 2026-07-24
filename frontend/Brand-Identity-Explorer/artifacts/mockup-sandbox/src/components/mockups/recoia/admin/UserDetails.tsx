import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Calendar, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '../_shared/AdminLayout';
import { api, ApiError, type AdminUserDetail } from '@/lib/api';

export function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    api
      .getAdminUserDetail(Number(id))
      .then((res) => {
        if (!cancelled) setDetail(res);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof ApiError ? cause.message : "Unable to load this user.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <AdminLayout title="User Details" breadcrumb="Users">
        <p className="max-w-6xl mx-auto rounded-xl bg-white p-6 text-slate-500 shadow-sm">Loading user…</p>
      </AdminLayout>
    );
  }

  if (error || !detail) {
    return (
      <AdminLayout title="User Details" breadcrumb="Users">
        <div className="max-w-6xl mx-auto rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">{error ?? "User not found."}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Details" breadcrumb={`Users / ${detail.email}`}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Card */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-bold text-white shrink-0 shadow-inner">
                  {detail.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">{detail.email}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5"><Mail className="w-4 h-4" /> {detail.email}</span>
                    <Badge variant="secondary" className={`${detail.is_admin ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'} hover:bg-opacity-80 border-none`}>
                      {detail.is_admin ? 'Admin' : 'User'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"><Calendar className="w-5 h-5 text-slate-500" /></div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Registration Date</p>
                <p className="font-semibold text-slate-900">{detail.created_at ?? '—'}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"><Activity className="w-5 h-5 text-slate-500" /></div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Recent Events</p>
                <p className="font-semibold text-slate-900">{detail.recent_events.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-900">Recent Activity</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3">Event</th>
                  <th className="px-6 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detail.recent_events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-900">{event.item_title ?? event.item_id}</td>
                    <td className="px-6 py-3">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none">{event.event_type}</Badge>
                    </td>
                    <td className="px-6 py-3 text-slate-500">{event.ts ?? '—'}</td>
                  </tr>
                ))}
                {detail.recent_events.length === 0 && (
                  <tr><td className="px-6 py-3 text-slate-500" colSpan={3}>No activity recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </AdminLayout>
  );
}
