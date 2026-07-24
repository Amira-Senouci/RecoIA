import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '../_shared/AdminLayout';
import { api, ApiError, type AdminOrder } from '@/lib/api';

const PAGE_SIZE = 20;

export function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getAdminOrders(page, PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        setOrders(res.orders);
        setTotal(res.total);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof ApiError ? cause.message : "Unable to load orders.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const visibleOrders = orders.filter(
    (o) =>
      o.user_email.toLowerCase().includes(search.toLowerCase()) ||
      (o.item_title ?? o.item_id).toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const totalRevenue = orders.reduce((sum, o) => sum + (o.price ?? 0) * o.quantity, 0);

  return (
    <AdminLayout title="Orders" breadcrumb="Data / Orders">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex-1 shadow-sm flex items-center justify-between">
            <span className="text-slate-500 text-sm font-medium">Total Orders</span>
            <span className="text-2xl font-bold text-slate-900">{total.toLocaleString()}</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex-1 shadow-sm flex items-center justify-between">
            <span className="text-slate-500 text-sm font-medium">Revenue (this page)</span>
            <span className="text-2xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search by customer or product…" className="pl-9 bg-slate-50" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">{error}</div>}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Qty</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr><td className="px-6 py-4 text-slate-500" colSpan={6}>Loading orders…</td></tr>
                )}
                {!loading && visibleOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{order.user_email}</td>
                    <td className="px-6 py-4 text-slate-600">{order.item_title ?? order.item_id}</td>
                    <td className="px-6 py-4 text-slate-600">{order.quantity}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {order.price === null ? "—" : `$${(order.price * order.quantity).toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-none font-medium">{order.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{order.created_at ?? '—'}</td>
                  </tr>
                ))}
                {!loading && visibleOrders.length === 0 && (
                  <tr><td className="px-6 py-4 text-slate-500" colSpan={6}>No orders match this search.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 p-4 flex items-center justify-between bg-white">
            <span className="text-sm text-slate-500">Page <span className="font-medium text-slate-900">{page}</span> of <span className="font-medium text-slate-900">{totalPages}</span> · {total} orders</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
