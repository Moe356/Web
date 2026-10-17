/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Breadcrumbs } from './components/layout/Breadcrumbs';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginPage } from './components/auth/LoginPage';
import { Lock, ShieldCheck, LogOut } from 'lucide-react';

// Modules
import { DashboardView } from './components/modules/DashboardView';
import { OperationsView } from './components/modules/OperationsView';
import { DispatchCenter } from './components/modules/DispatchCenter';
import { FleetView } from './components/modules/FleetView';
import { MaintenanceView } from './components/modules/MaintenanceView';
import { StationOperationsView } from './components/modules/StationOperationsView';
import { FuelInventoryView } from './components/modules/FuelInventoryView';
import { EmployeesView } from './components/modules/EmployeesView';
import { AttendanceView } from './components/modules/AttendanceView';
import { PerformanceView } from './components/modules/PerformanceView';
import { CorrespondenceView } from './components/modules/CorrespondenceView';
import { ReportsView } from './components/modules/ReportsView';
import { AuditLogView } from './components/modules/AuditLogView';
import { SettingsView } from './components/modules/SettingsView';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeModule, language, currentUser, isAdmin, switchRole, logout } = useApp();

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardView />;
      case 'operations':
        return <OperationsView />;
      case 'dispatch':
        return <DispatchCenter />;
      case 'fleet':
        return <FleetView />;
      case 'maintenance':
        return <MaintenanceView />;
      case 'station-ops':
        return <StationOperationsView />;
      case 'fuel-inventory':
        return <FuelInventoryView />;
      case 'employees':
        return <EmployeesView />;
      case 'attendance':
        return <AttendanceView />;
      case 'performance':
        return <PerformanceView />;
      case 'correspondence':
        return <CorrespondenceView />;
      case 'reports':
        return <ReportsView />;
      case 'audit-log':
        return <AuditLogView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-teal-600 selection:text-white">
      <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900" role="status">
        {language === 'ar'
          ? 'نسخة تجريبية — البيانات محفوظة محلياً في هذا المتصفح، وقد تكون المحاكاة غير متصلة بأجهزة المحطة. لا تستخدم لاتخاذ قرارات تشغيلية فعلية.'
          : 'DEMO VERSION — Data is stored locally in this browser; station hardware may not be connected. Do not use for real operational decisions.'}
      </div>
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Responsive Sidebar */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Viewport Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Header */}
          <Header />

          {/* Contextual Breadcrumbs */}
          <Breadcrumbs onToggleSidebar={() => setSidebarOpen(true)} />

          {/* Permission Alert Banner for Normal User */}
          {currentUser.role === 'normal_user' && (
            <div className="bg-amber-50 border-y border-amber-200 px-4 md:px-6 py-2.5 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold">وضع مستخدم عادي (مشاهدة ومتابعة فقط):</span>{' '}
                  <span className="text-amber-800">
                    {language === 'ar'
                      ? 'هذا الدور للعرض فقط. يمكن تبديل الأدوار داخل النسخة التجريبية؛ لا تعتبر هذه آلية صلاحيات آمنة للإنتاج.'
                      : 'This demo role is read-only. Role switching is available for evaluation only and is not production-grade access control.'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => switchRole('super_admin')}
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تجربة دور المدير' : 'Try demo administrator role'}</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(language === 'ar' ? 'هل تود تسجيل الخروج من المنظومة؟' : 'Are you sure you want to log out?')) {
                      logout();
                    }
                  }}
                  className="px-2.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-amber-800" />
                  <span>{language === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Admin Confirmation Badge when logged in as Administrator */}
          {isAdmin && (
            <div className="bg-teal-900 text-white px-4 md:px-6 py-1.5 text-[11px] flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                <span>
                  <strong>{language === 'ar' ? 'حساب مدير النظام العام (Administrator):' : 'System Administrator Mode:'}</strong>{' '}
                  {language === 'ar'
                    ? 'صلاحيات المدير هنا لأغراض العرض فقط؛ هذا التطبيق لا يفرض صلاحيات آمنة على خادم.'
                    : 'Demo administrator role only. This client-side application does not enforce secure server-side authorization.'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-[10px] text-teal-200">
                <span className="hidden md:inline">{currentUser.name}</span>
                <span className="bg-teal-800 px-2 py-0.5 rounded font-mono font-bold text-teal-100">DEMO ROLE</span>
              </div>
            </div>
          )}

          {/* Main Module Canvas */}
          <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
            {renderActiveModule()}
          </main>

          {/* Quiet Municipal Footer */}
          <footer className="px-6 py-4 border-t border-slate-200 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 no-print">
            <div>
              {language === 'ar'
                ? 'نظام إدارة محطة عبد المحسن الكاظمي © 2026 – قسم المجاري – بلدية الكاظمية المقدسة'
                : 'Abdul Mohsen Al-Kadhimi Station Management System © 2026 – Sewage Dept'}
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
              <span>الخط الساخن: 0771-000-8888</span>
              <span>·</span>
              <span className="text-amber-700 font-medium">بيانات تجريبية محلية — غير مخصصة للإنتاج</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Floating Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
