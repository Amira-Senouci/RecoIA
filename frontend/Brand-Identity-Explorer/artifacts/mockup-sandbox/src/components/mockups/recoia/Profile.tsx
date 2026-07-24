import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from './_shared/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Package, Heart, Sliders } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api, ApiError, type Order, type CatalogItem } from '@/lib/api';

export function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<CatalogItem[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const [ordersRes, favoritesRes, catalogRes, prefsRes] = await Promise.all([
          api.getOrders(),
          api.getFavorites(),
          api.getCatalog(200),
          api.getPreferences(),
        ]);
        if (cancelled) return;
        setOrders(ordersRes.orders);
        setFavorites(favoritesRes.items);
        setAllCategories(Array.from(new Set(catalogRes.items.map((i) => i.category))).sort());
        setSelectedCategories(prefsRes.category_prefs);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof ApiError ? cause.message : "Unable to reach the RecoIA API.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const favoriteCategoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    favorites.forEach((item) => counts.set(item.category, (counts.get(item.category) ?? 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [favorites]);

  function toggleCategory(category: string): void {
    setPrefsSaved(false);
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((c) => c !== category) : [...current, category],
    );
  }

  async function savePreferences(): Promise<void> {
    setSavingPrefs(true);
    try {
      await api.updatePreferences(selectedCategories);
      setPrefsSaved(true);
    } catch {
      // best-effort
    } finally {
      setSavingPrefs(false);
    }
  }

  async function handlePasswordChange(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordMessage("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (cause) {
      setPasswordError(cause instanceof ApiError ? cause.message : "Unable to update password.");
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <p className="max-w-4xl mx-auto rounded-xl bg-white p-6 text-slate-500 shadow-sm">Loading profile…</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto pb-16 space-y-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl shrink-0">
            {(user?.email ?? "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{user?.email}</h1>
            <p className="text-slate-500 text-sm mt-1">{user?.is_admin ? "Administrator" : "Member"}</p>
          </div>
        </div>

        {error && (
          <section className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <p className="font-semibold">The frontend could not connect to the backend.</p>
            <p className="mt-1 text-sm">{error}. Start the FastAPI service on port 8000, then refresh this page.</p>
          </section>
        )}

        {/* Order History */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Package className="w-5 h-5 text-blue-600" /> Order History
            </CardTitle>
            <CardDescription>{orders.length} order{orders.length === 1 ? "" : "s"} placed</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-sm text-slate-500">No orders yet — place one from any product page.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{order.item_title ?? order.item_id}</p>
                      <p className="text-xs text-slate-500">
                        Qty {order.quantity} · {order.created_at ?? "just now"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{order.price === null ? "—" : `$${order.price.toFixed(2)}`}</p>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-none text-xs">{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favorite Categories */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Heart className="w-5 h-5 text-blue-600" /> Favorite Categories
            </CardTitle>
            <CardDescription>Based on the {favorites.length} item{favorites.length === 1 ? "" : "s"} you've saved</CardDescription>
          </CardHeader>
          <CardContent>
            {favoriteCategoryCounts.length === 0 ? (
              <p className="text-sm text-slate-500">Save some products to see your favorite categories here.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {favoriteCategoryCounts.map(([category, count]) => (
                  <Badge key={category} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                    {category} · {count}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendation Preferences */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Sliders className="w-5 h-5 text-blue-600" /> Recommendation Preferences
            </CardTitle>
            <CardDescription>Pick categories you want RecoIA to prioritize.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {allCategories.map((category) => {
                const active = selectedCategories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      active
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={savePreferences} disabled={savingPrefs} className="bg-blue-600 hover:bg-blue-700">
                {savingPrefs ? "Saving…" : "Save Preferences"}
              </Button>
              {prefsSaved && <span className="text-sm font-medium text-emerald-600">Saved</span>}
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <User className="w-5 h-5 text-blue-600" /> Security
            </CardTitle>
            <CardDescription>Change your password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4 max-w-sm" onSubmit={handlePasswordChange}>
              {passwordError && (
                <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm font-medium text-red-600">{passwordError}</p>
              )}
              {passwordMessage && (
                <p className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700">{passwordMessage}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="bg-slate-50"
                />
              </div>
              <Button type="submit" className="bg-slate-900 hover:bg-blue-600">Update Password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
