import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ClipboardList,
  Compass,
  Truck,
  Wrench,
  Gauge,
  Users,
  Clock,
  Award,
  FileText,
  BarChart3,
  ShieldCheck,
  Settings,
  Droplets,
  Activity,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

import { ASSETS } from '../../assets/assetPaths';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { activeModule, setActiveModule, currentUser, logout, language, workOrders } = useApp();

  const urgentCount = workOrders.filter(
    (w) => w.priority === 'urgent' && w.status !== 'completed' && w.status !== 'verified' && w.status !== 'cancelled'
  ).length;

  const navSections = [
    {
      titleAr: 'الرئيسية',
      titleEn: 'MAIN',
      items: [
        {
          id: 'dashboard',
          labelAr: 'لوحة القيادة والمؤشرات',
          labelEn: 'Dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      titleAr: 'العمليات والميدان',
      titleEn: 'OPERATIONS',
      items: [
        {
          id: 'operations',
          labelAr: 'أوامر العمل والشكاوى',
          labelEn: 'Work Orders',
          icon: ClipboardList,
          badge: urgentCount > 0 ? `${urgentCount} عاجل` : undefined,
          badgeColor: 'bg-red-500 text-white',
        },
        {
          id: 'dispatch',
          labelAr: 'مركز التوزيع والتحكم الميداني',
          labelEn: 'Dispatch Center',
          icon: Compass,
        },
      ],
    },
    {
      titleAr: 'الأسطول والمحطة',
      titleEn: 'FLEET & STATION',
      items: [
        {
          id: 'fleet',
          labelAr: 'أسطول الآليات والمعدات',
          labelEn: 'Fleet & Machinery',
          icon: Truck,
        },
        {
          id: 'maintenance',
          labelAr: 'إدارة الصيانة والأعطال',
          labelEn: 'Maintenance',
          icon: Wrench,
        },
        {
          id: 'station-ops',
          labelAr: 'تشغيل محطة الرفع والأحواض',
          labelEn: 'Station Operations',
          icon: Gauge,
        },
      ],
    },
    {
      titleAr: 'الموارد البشرية والدوام',
      titleEn: 'HUMAN RESOURCES',
      items: [
        {
          id: 'employees',
          labelAr: 'إدارة الكادر البشري',
          labelEn: 'Staff Directory',
          icon: Users,
        },
        {
          id: 'attendance',
          labelAr: 'الحضور والوجبات (الشفتات)',
          labelEn: 'Attendance & Shifts',
          icon: Clock,
        },
        {
          id: 'performance',
          labelAr: 'تقييم الأداء والسجلات',
          labelEn: 'Performance & Records',
          icon: Award,
        },
      ],
    },
    {
      titleAr: 'المراسلات والرقابة',
      titleEn: 'REPORTS & AUDIT',
      items: [
        {
          id: 'correspondence',
          labelAr: 'الكتب والقرارات الإدارية',
          labelEn: 'Official Documents',
          icon: FileText,
        },
        {
          id: 'reports',
          labelAr: 'التقارير والإحصائيات',
          labelEn: 'Reports & Analytics',
          icon: BarChart3,
        },
        {
          id: 'audit-log',
          labelAr: 'سجل العمليات والرقابة',
          labelEn: 'Audit Log',
          icon: ShieldCheck,
        },
      ],
    },
    {
      titleAr: 'النظام',
      titleEn: 'SYSTEM',
      items: [
        {
          id: 'settings',
          labelAr: 'الإعدادات والصلاحيات',
          labelEn: 'Settings & Security',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col border-r lg:border-r-0 lg:border-e border-slate-800 transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : language === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Municipal Identity Lockup */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-slate-950 overflow-hidden ring-2 ring-amber-500/40 shadow-xs shrink-0 flex items-center justify-center">
              <img
                src={ASSETS.municipalLogo}
                alt="شعار بلدية الكاظمية المقدسة"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide leading-snug">
                {language === 'ar' ? 'محطة عبد المحسن' : 'Al-Kadhimi Station'}
              </h1>
              <p className="text-[11px] text-teal-400 font-medium">
                {language === 'ar' ? 'دائرة بلدية الكاظمية المقدسة' : 'Holy Kadhimiya Municipality'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            {language === 'ar' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Current Station Status Indicator */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{language === 'ar' ? 'المحطة: وضع التشغيل الطبيعي' : 'Station: Nominal'}</span>
          </div>
          <span className="font-mono text-teal-400">2320 m³/h</span>
        </div>

        {/* Navigation Modules */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <div className="px-3 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                {language === 'ar' ? section.titleAr : section.titleEn}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveModule(item.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-teal-700 text-white shadow-xs font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-200' : 'text-slate-400'}`} />
                        <span className="truncate">{language === 'ar' ? item.labelAr : item.labelEn}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card at Bottom */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-teal-900 text-teal-300 font-bold flex items-center justify-center text-xs border border-teal-700 shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-teal-400 truncate">
                  {currentUser.isAdmin ? 'مدير نظام (Administrator)' : currentUser.role === 'normal_user' ? 'مستخدم عادي (مقيد)' : currentUser.roleTitleAr}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm(language === 'ar' ? 'هل تود تسجيل الخروج من المنظومة؟' : 'Are you sure you want to log out?')) {
                  logout();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors shrink-0"
              title={language === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
