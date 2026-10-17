import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Languages,
  Shield,
  CheckCircle2,
  Clock,
  Radio,
  X,
  ExternalLink,
  RotateCcw,
  LogOut,
  ShieldCheck,
  User,
  Lock,
} from 'lucide-react';
import { UserRole } from '../../types';

import { ASSETS } from '../../assets/assetPaths';

export const Header: React.FC = () => {
  const {
    currentUser,
    allUsers,
    switchRole,
    logout,
    isAdmin,
    language,
    setLanguage,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    workOrders,
    stationPumps,
    setActiveModule,
    resetDemoData,
  } = useApp();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const urgentOrders = workOrders.filter((w) => w.priority === 'urgent' && w.status !== 'completed' && w.status !== 'verified' && w.status !== 'cancelled').length;
  const runningPumps = stationPumps.filter((p) => p.status === 'running').length;

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setShowRoleModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 shadow-xs">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-slate-900 overflow-hidden ring-2 ring-amber-500/30 flex items-center justify-center shrink-0 shadow-xs">
            <img
              src={ASSETS.municipalLogo}
              alt="شعار بلدية الكاظمية المقدسة"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveModule('dashboard');
              }}
              className="text-base font-bold tracking-tight text-slate-900 hover:text-teal-700 transition-colors whitespace-nowrap"
            >
              {language === 'ar' ? 'محطة عبد المحسن الكاظمي' : 'Al-Kadhimi Station'}
            </a>
            <div className="text-xs text-slate-500 whitespace-nowrap">
              {language === 'ar' ? 'دائرة بلدية الكاظمية المقدسة – قسم المجاري' : 'Holy Kadhimiya Municipality – Sewage Dept'}
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links & Live Operational Counters */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveModule('operations')}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            <span>{language === 'ar' ? 'البلاغات العاجلة:' : 'Urgent Tickets:'}</span>
            <span className={`font-mono font-semibold tabular-nums px-1.5 py-0.5 rounded ${urgentOrders > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
              {urgentOrders}
            </span>
          </button>

          <span className="text-slate-300">|</span>

          <button
            onClick={() => setActiveModule('station-ops')}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            <span>{language === 'ar' ? 'مضخات الرفع العاملة:' : 'Active Pumps:'}</span>
            <span className="font-mono font-semibold tabular-nums bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded">
              {runningPumps} / {stationPumps.length}
            </span>
          </button>

          <span className="text-slate-300">|</span>

          <div className="flex items-center gap-1.5 text-slate-500 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{language === 'ar' ? 'شفت العمل:' : 'Active Shift:'}</span>
            <span className="font-medium text-slate-800">
              {language === 'ar' ? 'الوجبة الصباحية (07:00 - 15:00)' : 'Morning (07:00 - 15:00)'}
            </span>
          </div>

          <span className="text-slate-300">|</span>

          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{language === 'ar' ? 'وضع العرض التجريبي' : 'Demo Mode'}</span>
          </div>
        </nav>

        {/* Zone 3: Primary Actions & User Role Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
            title={language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
          >
            <Languages className="w-4 h-4 text-slate-600" />
            <span className="font-mono">{language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title={language === 'ar' ? 'مركز الإشعارات' : 'Notifications'}
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {showNotifDropdown && (
              <div
                className={`absolute top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-3 ${
                  language === 'ar' ? 'left-0' : 'right-0'
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">
                    {language === 'ar' ? 'الإشعارات والتنبيهات' : 'Notifications'}
                  </span>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-teal-600 hover:underline"
                    >
                      {language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">
                      {language === 'ar' ? 'لا توجد إشعارات جديدة' : 'No notifications'}
                    </p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationRead(notif.id);
                          if (notif.linkModule) setActiveModule(notif.linkModule);
                          setShowNotifDropdown(false);
                        }}
                        className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                          notif.isRead
                            ? 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            : 'bg-teal-50/70 border border-teal-100 text-slate-900 hover:bg-teal-100/70'
                        }`}
                      >
                        <div className="font-semibold text-slate-900 mb-0.5">{notif.title}</div>
                        <div className="text-slate-600 line-clamp-2">{notif.message}</div>
                        <div className="mt-1 text-[10px] text-slate-400 font-mono">
                          {notif.timestamp}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400 text-center">
                  {language === 'ar'
                    ? 'إشعارات الرسائل الخارجية (SMS/WhatsApp) جاهزة للربط'
                    : 'External SMS/WhatsApp gateways integration ready'}
                </div>
              </div>
            )}
          </div>

          {/* Role Pill and Switcher Trigger */}
          <button
            onClick={() => setShowRoleModal(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isAdmin
                ? 'border-teal-300 bg-teal-50/70 text-teal-900 hover:bg-teal-100/70'
                : currentUser.role === 'normal_user'
                ? 'border-amber-300 bg-amber-50/70 text-amber-900 hover:bg-amber-100/70'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
            }`}
          >
            {isAdmin ? (
              <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
            ) : currentUser.role === 'normal_user' ? (
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            ) : (
              <Shield className="w-4 h-4 text-slate-600 shrink-0" />
            )}
            <div className="text-right leading-tight hidden sm:block">
              <div className="font-semibold truncate max-w-[130px]">{currentUser.name}</div>
              <div className="text-[10px] font-mono flex items-center gap-1">
                <span className={isAdmin ? 'text-teal-700 font-bold' : 'text-slate-600'}>
                  {isAdmin
                    ? (language === 'ar' ? 'مدير نظام (كامل الصلاحيات)' : 'Administrator (Full)')
                    : currentUser.role === 'normal_user'
                    ? (language === 'ar' ? 'مستخدم عادي (مشاهدة فقط)' : 'Normal User (View-only)')
                    : (language === 'ar' ? currentUser.roleTitleAr : currentUser.roleTitleEn)}
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-white text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
              {language === 'ar' ? 'تبديل' : 'Switch'}
            </span>
          </button>

          {/* Dedicated Logout Button */}
          <button
            onClick={() => {
              if (confirm(language === 'ar' ? 'هل تود تسجيل الخروج من المنظومة؟' : 'Are you sure you want to log out?')) {
                logout();
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-colors text-xs font-semibold"
            title={language === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
          >
            <LogOut className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden md:inline">{language === 'ar' ? 'خروج' : 'Logout'}</span>
          </button>
        </div>
      </header>

      {/* Role Switcher Modal for Demo Evaluation */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Shield className="w-5 h-5 text-teal-400" />
                  {language === 'ar' ? 'تبديل صلاحية المستخدم (الوضع التجريبي)' : 'Switch Role (Demo Mode)'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'ar'
                    ? 'تبديل الأدوار متاح لتقييم الواجهة فقط ولا يمثل مصادقة آمنة للإنتاج.'
                    : 'Role switching is for UI evaluation only, not secure production authentication.'}
                </p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-2">
              {allUsers.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => handleRoleSelect(u.role)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'border-teal-600 bg-teal-50/70 shadow-xs ring-1 ring-teal-600'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{u.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-teal-600 text-white px-1.5 py-0.5 rounded font-mono">
                            {language === 'ar' ? 'الحساب النشط' : 'Active'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-teal-800 mt-0.5">
                        {language === 'ar' ? u.roleTitleAr : u.roleTitleEn}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {u.department} · {u.phone}
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <button
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          isCurrent
                            ? 'bg-teal-700 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isCurrent
                          ? (language === 'ar' ? 'مفعّل الآن' : 'Current')
                          : (language === 'ar' ? 'تفعيل الدور' : 'Select')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="text-slate-400">
                {language === 'ar' ? 'محطة عبد المحسن الكاظمي - قسم المجاري' : 'Al-Kadhimi Sewage Department'}
              </span>
              <button
                onClick={() => {
                  if (confirm(language === 'ar' ? 'هل تود استعادة البيانات التجريبية الافتراضية؟' : 'Reset demo sample data?')) {
                    resetDemoData();
                    setShowRoleModal(false);
                  }
                }}
                className="text-amber-700 hover:underline flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {language === 'ar' ? 'استعادة البيانات الافتراضية' : 'Reset Demo Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
