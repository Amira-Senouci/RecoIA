import React from 'react';
import { LayoutDashboard, Users, Package, Tag, ShoppingBag, Sparkles, Cpu, BarChart2, FileText, Activity, Settings, Bell, LogOut, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '../_shared/AdminLayout';

export function SettingsPage() {
  return (
    <AdminLayout title="Settings">
      <div className="max-w-[1000px] mx-auto">
        
        {/* Tabs */}
        <div className="border-b border-slate-200 mb-8 overflow-x-auto">
          <div className="flex gap-6 text-sm font-medium min-w-max">
            <a href="#" className="text-blue-600 border-b-2 border-blue-600 pb-3 px-1">General</a>
            <a href="#" className="text-slate-500 hover:text-slate-900 pb-3 px-1">AI Configuration</a>
            <a href="#" className="text-slate-500 hover:text-slate-900 pb-3 px-1">Authentication</a>
            <a href="#" className="text-slate-500 hover:text-slate-900 pb-3 px-1">Email</a>
            <a href="#" className="text-slate-500 hover:text-slate-900 pb-3 px-1">Notifications</a>
            <a href="#" className="text-slate-500 hover:text-slate-900 pb-3 px-1">API Keys</a>
            <a href="#" className="text-slate-500 hover:text-slate-900 pb-3 px-1">Database</a>
          </div>
        </div>

        <div className="space-y-8">
          
          {/* Application */}
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">Application</CardTitle>
              <CardDescription>Basic details and localization for your platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">App Name</label>
                  <Input defaultValue="RecoIA" className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">App URL</label>
                  <Input defaultValue="https://app.recoia.ai" className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Support Email</label>
                  <Input defaultValue="support@recoia.ai" className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Timezone</label>
                  <Select defaultValue="utc">
                    <SelectTrigger className="bg-slate-50">
                      <SelectValue placeholder="Select Timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                      <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Theme */}
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">Theme</CardTitle>
              <CardDescription>Customize the look and feel of the admin dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Color Mode</label>
                <div className="inline-flex bg-slate-100 rounded-lg p-1 border border-slate-200 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none px-6 py-2 text-sm font-medium text-slate-900 bg-white rounded-md shadow-sm">Light</button>
                  <button className="flex-1 sm:flex-none px-6 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 rounded-md transition-colors">Dark</button>
                  <button className="flex-1 sm:flex-none px-6 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 rounded-md transition-colors">System</button>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Accent Color</label>
                <div className="flex gap-3">
                  <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-blue-600 ring-offset-2">
                    <Check className="w-5 h-5 text-white" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-purple-600 hover:ring-2 hover:ring-purple-600 hover:ring-offset-2 transition-all"></button>
                  <button className="w-10 h-10 rounded-full bg-emerald-600 hover:ring-2 hover:ring-emerald-600 hover:ring-offset-2 transition-all"></button>
                  <button className="w-10 h-10 rounded-full bg-orange-600 hover:ring-2 hover:ring-orange-600 hover:ring-offset-2 transition-all"></button>
                  <button className="w-10 h-10 rounded-full bg-rose-600 hover:ring-2 hover:ring-rose-600 hover:ring-offset-2 transition-all"></button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendation Parameters */}
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">Recommendation Parameters</CardTitle>
              <CardDescription>Global thresholds and limits for the AI engine.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-3 max-w-xl">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-slate-700">Min Confidence Threshold</label>
                  <span className="text-sm font-bold text-slate-900">75%</span>
                </div>
                <div className="relative w-full h-2 bg-slate-100 rounded-full">
                  <div className="absolute top-0 left-0 h-full bg-blue-600 rounded-full" style={{ width: '75%' }}></div>
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow-sm cursor-pointer" style={{ left: 'calc(75% - 8px)' }}></div>
                </div>
                <p className="text-xs text-slate-500">Only surface recommendations with confidence above this score.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Max Recos Per Request</label>
                  <Input type="number" defaultValue="20" className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Cache TTL (minutes)</label>
                  <Input type="number" defaultValue="60" className="bg-slate-50" />
                </div>
              </div>

              <div className="flex items-center justify-between max-w-xl p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <h4 className="text-sm font-medium text-slate-900">Enable Cold Start Strategy</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Use fallback models for users with no history.</p>
                </div>
                <button className="w-11 h-6 bg-blue-600 rounded-full relative transition-colors shadow-inner">
                  <span className="absolute top-1 left-6 w-4 h-4 bg-white rounded-full shadow-sm transition-all"></span>
                </button>
              </div>

            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 shadow-sm rounded-xl bg-red-50/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-red-700">Danger Zone</CardTitle>
              <CardDescription className="text-red-600/80">Destructive actions that affect system availability.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-lg border border-red-100 gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Purge Recommendation Cache</h4>
                  <p className="text-xs text-slate-500 mt-1">Forces all requests to hit the inference engine. May cause temporary latency spikes.</p>
                </div>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto shrink-0">Purge Cache</Button>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-lg border border-red-100 gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Reset All Settings</h4>
                  <p className="text-xs text-slate-500 mt-1">Reverts all global parameters to system defaults.</p>
                </div>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto shrink-0">Reset Defaults</Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </AdminLayout>
  );
}
