import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Fuel,
  Info,
  Layers,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { workOrders, vehicles, maintenanceRecords, fuelTransactions, employees, language, showToast } = useApp();

  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedArea, setSelectedArea] = useState<string>('all');

  const totalTickets = workOrders.length;
  const completedTickets = workOrders.filter((w) => w.status === 'completed' || w.status === 'verified').length;
  const resolutionRate = totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 100;

  const totalFuelLiters = fuelTransactions.reduce((acc, t) => acc + t.quantityLiters, 0);
  const totalFuelCost = fuelTransactions.reduce((acc, t) => acc + t.authorizedCostIqd, 0);

  const totalDowntimeHours = maintenanceRecords.reduce((acc, m) => acc + m.downtimeHours, 0);
  const availableFleetCount = vehicles.filter((v) => v.availability === 'available' || v.availability === 'assigned').length;
  const fleetReadinessPercent = vehicles.length > 0 ? Math.round((availableFleetCount / vehicles.length) * 100) : 100;

  // Breakdown by neighborhood
  const areas = ['الكاظمية القديمة', 'العطيفية', 'شارع النواب', 'الجوادين', 'المحيط', 'براثا'];
  const areaBreakdown = areas.map((area) => {
    const areaOrders = workOrders.filter((w) => w.neighborhood === area);
    const completed = areaOrders.filter((w) => w.status === 'completed' || w.status === 'verified').length;
    return {
      area,
      total: areaOrders.length,
      completed,
      rate: areaOrders.length > 0 ? Math.round((completed / areaOrders.length) * 100) : 100,
    };
  });

  // Export CSV handler
  const handleExportCsv = () => {
    const headers = ['TicketNumber', 'Type', 'Title', 'Neighborhood', 'Street', 'Priority', 'Status', 'CreatedAt', 'AssignedTeam'];
    const rows = workOrders.map((w) => [
      w.ticketNumber,
      w.type,
      `"${w.title.replace(/"/g, '""')}"`,
      `"${w.neighborhood}"`,
      `"${w.street}"`,
      w.priority,
      w.status,
      w.createdAt,
      `"${w.assignedTeam || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kadhimiya_station_report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('تم تصدير التقرير التشغيلي بملف CSV بنجاح', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            <span>{language === 'ar' ? 'التقارير والمؤشرات الإحصائية العامة' : 'Operational Reports & Municipal KPIs'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar'
              ? 'معدلات الإنجاز الميداني، استهلاك الوقود، ساعات توقف الآليات، وحصيلة القواطع'
              : 'Work order resolution rate, fleet downtime, fuel usage, and neighborhood performance'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>تصدير CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير</span>
          </button>
        </div>
      </div>

      {/* KPI Calculation Methodology Disclosure */}
      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold">منهجية احتساب المؤشرات التشغيلية الرسمية:</div>
          <div className="text-[11px] text-blue-800 leading-relaxed">
            • <strong>نسبة إنجاز البلاغات:</strong> (البلاغات المكتملة + المعتمدة ÷ إجمالي البلاغات المسجلة) × 100%.<br />
            • <strong>جاهزية الأسطول:</strong> الآليات المتوفرة والمكلفة فعلياً مستثنى منها الآليات المسجلة (خارج الخدمة).<br />
            • <strong>ساعات التوقف (Downtime):</strong> مجموع ساعات الحجز بالورشة المثبتة في أوامر الصيانة المعتمدة.
          </div>
        </div>
      </div>

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs mb-1">نسبة إغلاق البلاغات</div>
          <div className="text-2xl font-bold font-mono text-teal-700 tabular-nums">%{resolutionRate}</div>
          <div className="text-[11px] text-slate-400 mt-1">{completedTickets} منجز من أصل {totalTickets}</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs mb-1">معدل جاهزية الأسطول</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">%{fleetReadinessPercent}</div>
          <div className="text-[11px] text-slate-400 mt-1">{availableFleetCount} آلية صالحة للعمل</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs mb-1">استهلاك الديزل الموثق</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{totalFuelLiters} <span className="text-xs font-sans">لتر</span></div>
          <div className="text-[11px] text-slate-400 mt-1">{totalFuelCost.toLocaleString()} د.ع</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs mb-1">ساعات التوقف بالصيانة</div>
          <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">{totalDowntimeHours} <span className="text-xs font-sans">ساعة</span></div>
          <div className="text-[11px] text-slate-400 mt-1">توقف الحفار كوماتسو</div>
        </div>
      </div>

      {/* Neighborhood Distribution Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-900">توزيع البلاغات ونسب الإنجاز حسب قواطع الكاظمية</span>
          <span className="text-[11px] text-slate-500">بلدية الكاظمية - قسم المجاري</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4">القاطع / المنطقة</th>
                <th className="py-3 px-4">إجمالي البلاغات المسجلة</th>
                <th className="py-3 px-4">البلاغات المنجزة</th>
                <th className="py-3 px-4">نسبة الحل</th>
                <th className="py-3 px-4">مستوى الكثافة الخدمية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {areaBreakdown.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{item.area}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{item.total}</td>
                  <td className="py-3 px-4 font-mono text-emerald-800">{item.completed}</td>
                  <td className="py-3 px-4 font-mono font-bold text-teal-800">%{item.rate}</td>
                  <td className="py-3 px-4">
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-600 rounded-full"
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
