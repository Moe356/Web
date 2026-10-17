import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ASSETS } from '../../assets/assetPaths';
import {
  Mail,
  Shield,
  ShieldCheck,
  User,
  CheckCircle2,
  AlertCircle,
  Radio,
  ArrowRight,
  ArrowLeft,
  Languages,
  Check,
} from 'lucide-react';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, language, setLanguage, allUsers } = useApp();

  const [email, setEmail] = useState('admin.ali@kadhimiya-sewer.iq');
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    const user = allUsers.find((u) => u.role === role);
    if (user) {
      setEmail(user.email);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني أو اسم المستخدم' : 'Please enter email or username');
      return;
    }
    const selectedUser = allUsers.find((u) => u.role === selectedRole);
    if (!selectedUser || selectedUser.email.toLowerCase() !== email.trim().toLowerCase()) {
      setErrorMessage(language === 'ar' ? 'اختر حساب العرض المطابق للصلاحية المحددة.' : 'Choose the demo account matching the selected role.');
      return;
    }
    setErrorMessage('');
    login(email, '', selectedRole);
  };

  const handleQuickLogin = (role: UserRole) => {
    const user = allUsers.find((u) => u.role === role) || allUsers[0];
    setSelectedRole(role);
    setEmail(user.email);
    setErrorMessage('');
    login(user.email, '', role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between text-slate-100 selection:bg-teal-600 selection:text-white p-4 md:p-6 font-sans">
      {/* Top Navbar */}
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto py-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-amber-500/60 shadow-lg bg-slate-950 flex items-center justify-center shrink-0">
            <img
              src={ASSETS.municipalLogo}
              alt="شعار بلدية الكاظمية المقدسة"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide">
              {language === 'ar' ? 'دائرة بلدية الكاظمية المقدسة' : 'Holy Kadhimiya Municipality Department'}
            </div>
            <div className="text-xs text-teal-400 font-medium">
              {language === 'ar' ? 'قسم المجاري – محطة عبد المحسن الكاظمي' : 'Sewage Dept – Al-Kadhimi Station'}
            </div>
          </div>
        </div>

        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
        >
          <Languages className="w-3.5 h-3.5" />
          <span className="font-mono">{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center my-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200/80 text-slate-900 overflow-hidden">
          {/* Card Top Banner with Municipal Logo */}
          <div className="p-6 bg-gradient-to-b from-slate-900 via-slate-850 to-slate-800 text-white text-center relative border-b border-slate-700/60">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-amber-500/60 shadow-2xl mx-auto mb-3 bg-slate-950 flex items-center justify-center">
              <img
                src={ASSETS.municipalLogo}
                alt="شعار دائرة بلدية الكاظمية"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              {language === 'ar' ? 'نظام إدارة محطة عبد المحسن الكاظمي' : 'Al-Kadhimi Station Operations System'}
            </h1>
            <p className="text-xs text-teal-400 mt-1 font-medium">
              {language === 'ar' ? 'قسم المجاري – بوابة تسجيل الدخول والصلاحيات الموحدة' : 'Sewage Department – Unified Portal & Access Control'}
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-5 text-xs">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Picker in Form */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>{language === 'ar' ? 'صلاحية الدخول المطلوبة:' : 'Account Role:'}</span>
                  <span className="text-[10px] text-teal-700 font-normal">
                    {selectedRole === 'super_admin'
                      ? (language === 'ar' ? 'صلاحية كاملة للتعديل' : 'Full Edit Privileges')
                      : (language === 'ar' ? 'مشاهدة ومتابعة فقط' : 'Read-only Access')}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('super_admin')}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-start gap-2 cursor-pointer ${
                      selectedRole === 'super_admin'
                        ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-600/30 text-teal-950'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedRole === 'super_admin' ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-400'
                    }`}>
                      {selectedRole === 'super_admin' ? <Check className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                    </div>
                    <div>
                      <div className="font-bold text-[11px] leading-tight text-slate-900">
                        {language === 'ar' ? 'مدير النظام العام' : 'Administrator'}
                      </div>
                      <div className="text-[10px] text-teal-800 mt-0.5">
                        {language === 'ar' ? 'تعديل وحذف وإضافة كاملة' : 'Can change anything'}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('normal_user')}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-start gap-2 cursor-pointer ${
                      selectedRole === 'normal_user'
                        ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-600/30 text-amber-950'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedRole === 'normal_user' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-400'
                    }`}>
                      {selectedRole === 'normal_user' ? <Check className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    </div>
                    <div>
                      <div className="font-bold text-[11px] leading-tight text-slate-900">
                        {language === 'ar' ? 'مستخدم عادي' : 'Normal User'}
                      </div>
                      <div className="text-[10px] text-amber-800 mt-0.5">
                        {language === 'ar' ? 'مشاهدة فقط (ممنوع من التعديل)' : 'Cannot change anything'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Email / Username */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {language === 'ar' ? 'البريد الإلكتروني / الحساب:' : 'Email / Username:'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute top-2.5 start-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@kadhimiya-sewer.iq"
                    className="w-full ps-9 pe-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-teal-600 bg-slate-50 focus:bg-white text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900" role="note">
                {language === 'ar'
                  ? 'هذه نسخة تجريبية تستخدم حسابات وبيانات افتراضية. لا توجد مصادقة حقيقية أو كلمات مرور في هذا العرض؛ لا تستخدم بيانات حقيقية.'
                  : 'This is a demonstration using sample accounts and fictional data. Real authentication and passwords are not configured; do not enter real data.'}
              </div>

              <div className="flex justify-end text-[11px] text-slate-500">
                <span className="text-teal-700 font-medium">
                  {language === 'ar' ? 'دعم فني: 0771-000-8888' : 'Hotline: 0771-000-8888'}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-600 text-white rounded-lg font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {selectedRole === 'super_admin'
                    ? (language === 'ar' ? 'بدء العرض بدور مدير النظام' : 'Start demo as Administrator')
                    : (language === 'ar' ? 'بدء العرض كمستخدم عادي' : 'Start demo as Normal User')}
                </span>
                {language === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Quick 1-Click Role Login Cards */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>{language === 'ar' ? 'حسابات العرض التجريبية:' : 'Demo accounts:'}</span>
                <span className="font-mono text-[10px] text-slate-400">اختر لتجربة الصلاحيات</span>
              </div>

              {/* Administrator Role Card */}
              <div
                onClick={() => handleQuickLogin('super_admin')}
                className="p-3 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/70 cursor-pointer transition-all flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-teal-200" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>مدير النظام العام (Administrator)</span>
                      <span className="text-[9px] bg-teal-700 text-white px-1.5 py-0.2 rounded font-bold">صلاحيات كاملة</span>
                    </div>
                    <div className="text-[11px] text-teal-900 mt-0.5 leading-tight">
                      يمتلك كامل الصلاحيات لتعديل وإنشاء وحذف أوامر العمل، الأسطول، المحطة، الكوادر، والإعدادات.
                    </div>
                  </div>
                </div>
                <span className="text-teal-700 group-hover:-translate-x-1 transition-transform">←</span>
              </div>

              {/* Normal User Role Card */}
              <div
                onClick={() => handleQuickLogin('normal_user')}
                className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/60 cursor-pointer transition-all flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>مستخدم عادي (Normal User)</span>
                      <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-bold">مشاهدة فقط</span>
                    </div>
                    <div className="text-[11px] text-slate-700 mt-0.5 leading-tight">
                      صلاحيات قراءة ومتابعة فقط — لا يمكنه إجراء أي تعديلات أو إضافة أو حذف بيانات.
                    </div>
                  </div>
                </div>
                <span className="text-slate-500 group-hover:-translate-x-1 transition-transform">←</span>
              </div>

              {/* Other Roles grid */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('station_manager')}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-right truncate cursor-pointer"
                >
                  مدير المحطة (Station Mgr)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('dispatcher')}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-right truncate cursor-pointer"
                >
                  مأمور التوزيع (Dispatcher)
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-400 py-3">
        {language === 'ar'
          ? 'نظام إدارة محطة عبد المحسن الكاظمي © 2026 – دائرة بلدية الكاظمية المقدسة – أمانة بغداد'
          : 'Abdul Mohsen Al-Kadhimi Station Operations System © 2026 – Holy Kadhimiya Municipality'}
      </footer>
    </div>
  );
};
