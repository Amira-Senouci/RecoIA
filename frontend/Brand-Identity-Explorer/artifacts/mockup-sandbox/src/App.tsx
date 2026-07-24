import { useEffect, useState, type ComponentType } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { modules as discoveredModules } from "./.generated/mockup-components";
import { AuthProvider } from "@/lib/auth-context";
import { RequireAdmin, RequireAuth } from "@/lib/protected-route";

import { Landing } from "./components/mockups/recoia/Landing";
import { Home } from "./components/mockups/recoia/Home";
import { Search } from "./components/mockups/recoia/Search";
import { Profile } from "./components/mockups/recoia/Profile";
import { ProductDetail } from "./components/mockups/recoia/ProductDetail";
import { Favorites } from "./components/mockups/recoia/Favorites";
import { Login } from "./components/mockups/recoia/auth/Login";
import { Register } from "./components/mockups/recoia/auth/Register";
import { ForgotPassword } from "./components/mockups/recoia/auth/ForgotPassword";
import { ResetPassword } from "./components/mockups/recoia/auth/ResetPassword";
import { VerifyEmail } from "./components/mockups/recoia/auth/VerifyEmail";
import { VerifySuccess } from "./components/mockups/recoia/auth/VerifySuccess";
import { VerifyFailed } from "./components/mockups/recoia/auth/VerifyFailed";
import { Dashboard as AdminDashboard } from "./components/mockups/recoia/admin/Dashboard";
import { UsersPage as AdminUsersPage } from "./components/mockups/recoia/admin/Users";
import { UserDetailsPage as AdminUserDetailsPage } from "./components/mockups/recoia/admin/UserDetails";
import { ProductsPage as AdminProductsPage } from "./components/mockups/recoia/admin/Products";
import { CategoriesPage as AdminCategoriesPage } from "./components/mockups/recoia/admin/Categories";
import { OrdersPage as AdminOrdersPage } from "./components/mockups/recoia/admin/Orders";
import { AnalyticsPage as AdminAnalyticsPage } from "./components/mockups/recoia/admin/Analytics";
import { AIModelsPage as AdminAIModelsPage } from "./components/mockups/recoia/admin/AIModels";
import { RecommendationsPage as AdminRecommendationsPage } from "./components/mockups/recoia/admin/Recommendations";
import { ReportsPage as AdminReportsPage } from "./components/mockups/recoia/admin/Reports";
import { LogsPage as AdminLogsPage } from "./components/mockups/recoia/admin/Logs";
import { SettingsPage as AdminSettingsPage } from "./components/mockups/recoia/admin/Settings";

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

function resolveComponent(
  mod: Record<string, unknown>,
  name: string,
): ComponentType | undefined {
  const functions = Object.values(mod).filter(
    (value) => typeof value === "function",
  ) as ComponentType[];
  return (
    (mod.default as ComponentType) ||
    (mod.Preview as ComponentType) ||
    (mod[name] as ComponentType) ||
    functions.at(-1)
  );
}

function PreviewRenderer({
  componentPath,
  modules,
}: {
  componentPath: string;
  modules: ModuleMap;
}) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setComponent(null);
    setError(null);

    async function loadComponent(): Promise<void> {
      const key = `./components/mockups/${componentPath}.tsx`;
      const loader = modules[key];
      if (!loader) {
        setError(`No component found at ${componentPath}.tsx`);
        return;
      }

      try {
        const module = await loader();
        if (cancelled) return;
        const name = componentPath.split("/").at(-1) ?? "Preview";
        const component = resolveComponent(module, name);
        if (!component) {
          setError(`No exported React component found in ${componentPath}.tsx`);
          return;
        }
        setComponent(() => component);
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      }
    }

    void loadComponent();
    return () => {
      cancelled = true;
    };
  }, [componentPath, modules]);

  if (error) {
    return <pre className="p-8 text-red-700">{error}</pre>;
  }
  return Component ? <Component /> : null;
}

function getPreviewPath(): string | null {
  const match = window.location.pathname.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/verify-email-success" element={<VerifySuccess />} />
      <Route path="/verify-email-failed" element={<VerifyFailed />} />
      <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
      <Route path="/search" element={<RequireAuth><Search /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/product/:id" element={<RequireAuth><ProductDetail /></RequireAuth>} />
      <Route path="/favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
      <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
      <Route path="/admin/users" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
      <Route path="/admin/users/:id" element={<RequireAdmin><AdminUserDetailsPage /></RequireAdmin>} />
      <Route path="/admin/products" element={<RequireAdmin><AdminProductsPage /></RequireAdmin>} />
      <Route path="/admin/categories" element={<RequireAdmin><AdminCategoriesPage /></RequireAdmin>} />
      <Route path="/admin/orders" element={<RequireAdmin><AdminOrdersPage /></RequireAdmin>} />
      <Route path="/admin/analytics" element={<RequireAdmin><AdminAnalyticsPage /></RequireAdmin>} />
      <Route path="/admin/models" element={<RequireAdmin><AdminAIModelsPage /></RequireAdmin>} />
      <Route path="/admin/recommendations" element={<RequireAdmin><AdminRecommendationsPage /></RequireAdmin>} />
      <Route path="/admin/reports" element={<RequireAdmin><AdminReportsPage /></RequireAdmin>} />
      <Route path="/admin/logs" element={<RequireAdmin><AdminLogsPage /></RequireAdmin>} />
      <Route path="/admin/settings" element={<RequireAdmin><AdminSettingsPage /></RequireAdmin>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const previewPath = getPreviewPath();
  if (previewPath) {
    return <PreviewRenderer componentPath={previewPath} modules={discoveredModules} />;
  }
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
