import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, loading } = useAuth();

  // Wait for auth state to resolve before making a decision
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
      </div>
    );
  }

  // Must have an admin token AND role === 'admin'
  const adminToken = localStorage.getItem('colorsmith_admin_token');
  const isAdmin = !!adminToken && user?.role === 'admin';

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto relative">
        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
