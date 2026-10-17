import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, Menu, Home } from 'lucide-react';

interface BreadcrumbsProps {
  onToggleSidebar: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ onToggleSidebar }) => {
  const { activeModule, setActiveModule, language } = useApp();

  const moduleNamesAr: Record<string, string> = {
    dashboard: 'لوحة القيادة والمؤشرات',
    operations: 'أوامر العمل والشكاوى الميدانية',
    dispatch: 'مركز التوزيع والتحكم الميداني',
    fleet: 'أسطول الآليات والمعدات التخصصية',
    maintenance: 'إدارة الصيانة والأعطال',
    'station-ops': 'تشغيل محطة الرفع والأحواض',
    'fuel-inventory': 'الوقود والمخزون الفني',
    employees: 'إدارة الكادر الوظيفي',
    attendance: 'الحضور والوجبات (الشفتات)',
    performance: 'تقييم الأداء والسجلات',
    correspondence: 'الكتب والقرارات الإدارية',
    reports: 'التقارير والمؤشرات والإحصائيات',
    'audit-log': 'سجل العمليات والرقابة',
    settings: 'الإعدادات والصلاحيات',
  };

  const moduleNamesEn: Record<string, string> = {
    dashboard: 'Dashboard',
    operations: 'Work Orders & Tickets',
    dispatch: 'Dispatch Operations Center',
    fleet: 'Fleet & Specialized Machinery',
    maintenance: 'Maintenance Management',
    'station-ops': 'Station Operations & Wet Wells',
    'fuel-inventory': 'Fuel & Spare Parts Inventory',
    employees: 'Staff Directory',
    attendance: 'Attendance & Shifts',
    performance: 'Performance & Appraisals',
    correspondence: 'Official Orders & Circulars',
    reports: 'Reports & Analytics',
    'audit-log': 'Audit & Security Log',
    settings: 'Settings & Security',
  };

  const currentLabel = language === 'ar' ? moduleNamesAr[activeModule] || activeModule : moduleNamesEn[activeModule] || activeModule;

  return (
    <div className="flex items-center justify-between px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 text-xs text-slate-600">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 -ms-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200"
          title="Toggle Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveModule('dashboard')}
          className="hover:text-slate-900 flex items-center gap-1 font-medium transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </button>

        {language === 'ar' ? (
          <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        )}

        <span className="font-semibold text-slate-900">{currentLabel}</span>
      </div>

      <div className="hidden sm:flex items-center gap-2 text-slate-500 font-mono text-[11px]">
        <span>{new Date().toISOString().substring(0, 10)}</span>
        <span>·</span>
        <span>الكرخ - بلدية الكاظمية</span>
      </div>
    </div>
  );
};
