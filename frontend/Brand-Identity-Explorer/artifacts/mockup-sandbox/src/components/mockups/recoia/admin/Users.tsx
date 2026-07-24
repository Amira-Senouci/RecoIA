import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '../_shared/AdminLayout';
import { api, ApiError, type AdminUserRow } from '@/lib/api';

const PAGE_SIZE = 20;

function getInitial(email: string) {
  return email.charAt(0).toUpperCase();
}

export function UsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getAdminUsers(page, PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        setUsers(res.users);
        setTotal(res.total);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof ApiError ? cause.message : "Unable to load users.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const visibleUsers = users.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminLayout title="Users">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Stats Row */}
        <div className="flex gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex-1 shadow-sm flex items-center justify-between">
            <span className="text-slate-500 text-sm font-medium">Total Users</span>
            <span className="text-2xl font-bold text-slate-900">{total.toLocaleString()}</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex-1 shadow-sm flex items-center justify-between">
            <span className="text-slate-500 text-sm font-medium">Admins</span>
            <span className="text-2xl font-bold text-slate-900">{users.filter((u) => u.is_admin).length}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search by email…" className="pl-9 bg-slate-50" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">{error}</div>}

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Registered</th>
                  <th className="px-6 py-4 font-medium">Events</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr><td className="px-6 py-4 text-slate-500" colSpan={5}>Loading users…</td></tr>
                )}
                {!loading && visibleUsers.map((user, i) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'][i % 5]}`}>
                          {getInitial(user.email)}
                        </div>
                        <p className="font-medium text-slate-900">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={`${user.is_admin ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'} hover:bg-opacity-80 border-none font-medium`}>
                        {user.is_admin ? 'Admin' : 'User'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.created_at ?? '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{user.event_count}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/users/${user.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && visibleUsers.length === 0 && (
                  <tr><td className="px-6 py-4 text-slate-500" colSpan={5}>No users match this search.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-slate-200 p-4 flex items-center justify-between bg-white">
            <span className="text-sm text-slate-500">Page <span className="font-medium text-slate-900">{page}</span> of <span className="font-medium text-slate-900">{totalPages}</span> · {total} users</span>
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
