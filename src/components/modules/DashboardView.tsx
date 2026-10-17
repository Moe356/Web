import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  Droplets,
  Fuel,
  Gauge,
  Plus,
  Radio,
  Truck,
  Users,
  Wrench,
  ArrowUpRight,
  Shield,
  FileText,
} from 'lucide-react';
import { ASSETS } from '../../assets/assetPaths';

export const DashboardView: React.FC = () => {
  const {
    workOrders,
    vehicles,
    stationPumps,
    stationTelemetry,
    employees,
    attendance,
    inventory,
    auditLogs,
    setActiveModule,
    setSelectedTicketId,
    language,
    currentUser,
  } = useApp();

  const totalTickets = workOrders.length;
  const activeTickets = workOrders.filter(
    (w) => w.status !== 'completed' && w.status !== 'verified' && w.status !== 'cancelled'
  ).length;
  const urgentTickets = workOrders.filter(
    (w) => w.priority === 'urgent' && w.status !== 'completed' && w.status !== 'verified' && w.status !== 'cancelled'
  ).length;

  const availableVehicles = vehicles.filter((v) => v.availability === 'available').length;
  const outOfServiceVehicles = vehicles.filter((v) => v.availability === 'out_of_service').length;
  const runningPumps = stationPumps.filter((p) => p.status === 'running').length;

  const presentStaff = attendance.filter((a) => a.status === 'present').length;
  const totalStaffScheduled = attendance.length;
  const attendanceRate = totalStaffScheduled > 0 ? Math.round((presentStaff / totalStaffScheduled) * 100) : 100;

  const lowStockItems = inventory.filter((i) => i.currentStock <= i.minThreshold);

  // Weekly completion mock statistics (last 7 days)
  const weeklyStats = [
    { dayAr: 'السبت', dayEn: 'Sat', completed: 14, received: 16 },
    { dayAr: 'الأحد', dayEn: 'Sun', completed: 18, received: 19 },
    { dayAr: 'الإثنين', dayEn: 'Mon', completed: 22, received: 25 },
    { dayAr: 'الثلاثاء', dayEn: 'Tue', completed: 19, received: 20 },
    { dayAr: 'الأربعاء', dayEn: 'Wed', completed: 26, received: 28 },
    { dayAr: 'الخميس', dayEn: 'Thu', completed: 21, received: 22 },
    { dayAr: 'الجمعة', dayEn: 'Fri', completed: 15, received: 14 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Operational Status Kicker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 text-white shadow-sm border border-slate-800">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-2 ring-amber-500/40 shadow-lg shrink-0 bg-slate-950 flex items-center justify-center">
            <img
              src={ASSETS.municipalLogo}
              alt="دائرة بلدية الكاظمية المقدسة"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-medium mb-1">
              <Radio className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'مركز عمليات محطة عبد المحسن الكاظمي' : 'Al-Kadhimi Station Operations Hub'}</span>
              <span>·</span>
              <span>{language === 'ar' ? 'دائرة بلدية الكاظمية المقدسة' : 'Holy Kadhimiya Municipality'}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {language === 'ar' ? 'مرحباً، ' : 'Welcome, '}{currentUser.name}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {language === 'ar'
                ? 'نظام الإدارة والسيطرة المركزية لمحطة الرفع وشبكات الصرف الصحي، متابعة الأسطول، وتوجيه فرق الصيانة الميدانية.'
                : 'Centralized control system for wastewater pumping, municipal fleet dispatch, and field crew management.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <button
            onClick={() => setActiveModule('operations')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'تسجيل بلاغ جديد' : 'New Ticket'}</span>
          </button>
          <button
            onClick={() => setActiveModule('dispatch')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Compass className="w-4 h-4 text-teal-400" />
            <span>{language === 'ar' ? 'لوحة التوزيع' : 'Dispatch Board'}</span>
          </button>
        </div>
      </div>

      {/* Critical Warnings / Banners */}
      {(urgentTickets > 0 || outOfServiceVehicles > 0 || lowStockItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {urgentTickets > 0 && (
            <div
              onClick={() => setActiveModule('operations')}
              className="cursor-pointer p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 hover:bg-red-100/70 transition-colors"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold">
                  {language === 'ar' ? `يوجد ${urgentTickets} بلاغ طارئ بحاجة استجابة` : `${urgentTickets} Urgent Tickets Pending`}
                </div>
                <div className="text-[11px] text-red-700 mt-0.5">
                  {language === 'ar' ? 'يرجى مراجعة وتكليف فرق الطوارئ في الكاظمية القديمة.' : 'Check emergency teams in Old Kadhimiya.'}
                </div>
              </div>
            </div>
          )}

          {outOfServiceVehicles > 0 && (
            <div
              onClick={() => setActiveModule('fleet')}
              className="cursor-pointer p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 hover:bg-amber-100/70 transition-colors"
            >
              <Truck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold">
                  {language === 'ar' ? `${outOfServiceVehicles} آلية مسجلة خارج الخدمة` : `${outOfServiceVehicles} Vehicle Out of Service`}
                </div>
                <div className="text-[11px] text-amber-700 mt-0.5">
                  {language === 'ar' ? 'الحفار FLT-KADH-06 معطل، تم حظر التكليف التلقائي.' : 'Komatsu excavator out of service.'}
                </div>
              </div>
            </div>
          )}

          {lowStockItems.length > 0 && (
            <div
              onClick={() => setActiveModule('fuel-inventory')}
              className="cursor-pointer p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-3 hover:bg-blue-100/70 transition-colors"
            >
              <Wrench className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold">
                  {language === 'ar' ? `${lowStockItems.length} مواد مخزنية بلغت الحد الحرج` : `${lowStockItems.length} Items Below Min Stock`}
                </div>
                <div className="text-[11px] text-blue-700 mt-0.5">
                  {language === 'ar' ? 'رصيد مانع التسرب (Mechanical Seal) بحاجة توريد.' : 'Pump mechanical seals restock needed.'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Active Tickets */}
        <div
          onClick={() => setActiveModule('operations')}
          className="cursor-pointer p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-teal-500 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{language === 'ar' ? 'أوامر العمل النشطة' : 'Active Tickets'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {activeTickets}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {language === 'ar' ? `من أصل ${totalTickets} مسجلة` : `out of ${totalTickets} total`}
          </div>
        </div>

        {/* Card 2: Urgent Tickets */}
        <div
          onClick={() => setActiveModule('operations')}
          className="cursor-pointer p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-red-500 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{language === 'ar' ? 'حالات الطوارئ' : 'Urgent'}</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-red-600 tabular-nums">
            {urgentTickets}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {language === 'ar' ? 'أولوية قصوى' : 'Highest priority'}
          </div>
        </div>

        {/* Card 3: Fleet Ready */}
        <div
          onClick={() => setActiveModule('fleet')}
          className="cursor-pointer p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-teal-500 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{language === 'ar' ? 'الآليات المتاحة' : 'Available Fleet'}</span>
            <Truck className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            {availableVehicles} / {vehicles.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {language === 'ar' ? `${outOfServiceVehicles} متوقفة للصيانة` : `${outOfServiceVehicles} out of service`}
          </div>
        </div>

        {/* Card 4: Station Flow */}
        <div
          onClick={() => setActiveModule('station-ops')}
          className="cursor-pointer p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-teal-500 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{language === 'ar' ? 'تدفق محطة الرفع' : 'Station Flow'}</span>
            <Droplets className="w-3.5 h-3.5 text-teal-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-teal-700 tabular-nums">
            {stationTelemetry.totalFlowRateM3H} <span className="text-xs font-sans text-slate-500">م³/سا</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {language === 'ar' ? `${runningPumps} مضخات بالخدمة` : `${runningPumps} pumps running`}
          </div>
        </div>

        {/* Card 5: Wet Well Level */}
        <div
          onClick={() => setActiveModule('station-ops')}
          className="cursor-pointer p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-teal-500 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{language === 'ar' ? 'منسوب حوض المحطة' : 'Wet Well Depth'}</span>
            <Gauge className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {stationTelemetry.wetWellLevelMeters} <span className="text-xs font-sans text-slate-500">متر</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {language === 'ar' ? `الأقصى: ${stationTelemetry.maxWetWellLevelMeters} م` : `Max: ${stationTelemetry.maxWetWellLevelMeters}m`}
          </div>
        </div>

        {/* Card 6: Staff Attendance */}
        <div
          onClick={() => setActiveModule('attendance')}
          className="cursor-pointer p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-teal-500 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{language === 'ar' ? 'حضور الكادر اليوم' : 'Attendance'}</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            %{attendanceRate}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {language === 'ar' ? `${presentStaff} حاضر من ${totalStaffScheduled}` : `${presentStaff} present`}
          </div>
        </div>
      </div>

      {/* Main Split: Station Graphic & Weekly Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Station Infrastructure Live Snapshot */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-teal-600" />
                  {language === 'ar' ? 'منظومة محطة عبد المحسن الكاظمي' : 'Al-Kadhimi Facility Snapshot'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'ar' ? 'الموقع: مقتربات شارع النواب والمحيط · القدرة التصميمية: 6,000 م³/ساعة' : 'Location: Al-Nawab & Al-Muheet'}
                </p>
              </div>
              <button
                onClick={() => setActiveModule('station-ops')}
                className="text-xs text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1"
              >
                <span>{language === 'ar' ? 'لوحة المحطة الكاملة' : 'Full Station View'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Facility Image Container */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 mb-4 h-48 bg-slate-900">
              <img
                src={ASSETS.stationFacility}
                alt="محطة عبد المحسن الكاظمي"
                className="w-full h-full object-cover opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-4">
                <div className="text-white text-xs">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>{language === 'ar' ? 'محطة الرفع الرئيسية تعمل بالوضع الطبيعي' : 'Main Lifting Station Operating'}</span>
                  </div>
                  <div className="text-slate-300 text-[11px] mt-0.5">
                    {language === 'ar'
                      ? 'تغذية كهربائية مستقرة من الشبكة الوطنية (395 فولت) · مولدة الطوارئ Perkins في وضع الاستعداد'
                      : 'Grid power active (395V) · Perkins emergency generator standby'}
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Main Pump Status Badges */}
            <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100">
              {stationPumps.map((pump) => {
                const statusStyles = {
                  running: 'bg-emerald-50 border-emerald-300 text-emerald-800',
                  standby: 'bg-slate-50 border-slate-200 text-slate-700',
                  maintenance: 'bg-amber-50 border-amber-300 text-amber-800',
                  tripped: 'bg-red-50 border-red-300 text-red-800',
                };
                const statusLabelsAr = {
                  running: 'تعمل',
                  standby: 'جاهزة',
                  maintenance: 'صيانة',
                  tripped: 'عطل',
                };

                return (
                  <div
                    key={pump.id}
                    className={`p-2 rounded-lg border text-center transition-all ${statusStyles[pump.status]}`}
                  >
                    <div className="font-mono font-bold text-xs">{pump.code}</div>
                    <div className="text-[10px] font-medium mt-0.5">
                      {language === 'ar' ? statusLabelsAr[pump.status] : pump.status}
                    </div>
                    <div className="text-[10px] font-mono tabular-nums text-slate-500 mt-1">
                      {pump.currentFlowM3H} م³/سا
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Weekly Completion Stats */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                {language === 'ar' ? 'إنجاز البلاغات الأسبوعي' : 'Weekly Operations'}
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">141 منجز</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              {language === 'ar'
                ? 'معدل الاستجابة للبلاغات الطارئة خلال 45 دقيقة في قواطع الكاظمية.'
                : 'Emergency tickets 45-min response rate.'}
            </p>

            {/* Visual Bar Chart */}
            <div className="space-y-2.5">
              {weeklyStats.map((item, idx) => {
                const percent = Math.round((item.completed / item.received) * 100);
                return (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span className="font-medium">{language === 'ar' ? item.dayAr : item.dayEn}</span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        {item.completed} / {item.received} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-teal-600 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{language === 'ar' ? 'نسبة الإغلاق العام:' : 'Overall Resolution:'}</span>
            <span className="font-mono font-bold text-teal-700 text-sm">92.4%</span>
          </div>
        </div>
      </div>

      {/* Bottom 2 Columns: Active Work Orders & Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Field Work Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'ar' ? 'أوامر العمل قيد المتابعة والتنفيذ' : 'Active Work Orders'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ar' ? 'البلاغات الميدانية الجارية حسب الأولوية والقاطع' : 'Field tickets by priority'}
              </p>
            </div>
            <button
              onClick={() => setActiveModule('operations')}
              className="text-xs text-teal-700 hover:underline font-medium"
            >
              {language === 'ar' ? 'عرض كافة البلاغات' : 'View all'}
            </button>
          </div>

          <div className="space-y-2.5">
            {workOrders.slice(0, 4).map((wo) => {
              const priorityBadges = {
                urgent: 'bg-red-100 text-red-800 border-red-200',
                high: 'bg-amber-100 text-amber-800 border-amber-200',
                normal: 'bg-blue-100 text-blue-800 border-blue-200',
                low: 'bg-slate-100 text-slate-700 border-slate-200',
              };

              const statusLabels = {
                new: 'جديد',
                reviewed: 'قيد المراجعة',
                assigned: 'تم التكليف',
                accepted: 'قيد القبول',
                en_route: 'في الطريق',
                on_site: 'في الموقع',
                in_progress: 'قيد التنفيذ',
                awaiting_materials: 'بانتظار مواد',
                completed: 'مكتمل',
                verified: 'معتمد ومغلق',
                cancelled: 'ملغي',
              };

              return (
                <div
                  key={wo.id}
                  onClick={() => {
                    setSelectedTicketId(wo.id);
                    setActiveModule('operations');
                  }}
                  className="p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-slate-50/60 transition-all cursor-pointer flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {wo.ticketNumber}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${priorityBadges[wo.priority]}`}>
                        {wo.priority === 'urgent' ? 'طارئ جداً' : wo.priority === 'high' ? 'أولوية عالية' : 'عادي'}
                      </span>
                      <span className="text-xs text-slate-500 truncate">
                        {wo.neighborhood} · {wo.street}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-slate-900 truncate">
                      {wo.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                      <span>{language === 'ar' ? `الفريق: ${wo.assignedTeam || 'غير مكلف'}` : `Team: ${wo.assignedTeam}`}</span>
                      <span>·</span>
                      <span className="font-mono">{wo.createdAt}</span>
                    </div>
                  </div>

                  <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium shrink-0">
                    {language === 'ar' ? statusLabels[wo.status] : wo.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Operational Audit Stream */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-600" />
                {language === 'ar' ? 'سجل النشاط التجريبي' : 'Demo Activity Log'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ar' ? 'سجل محلي تجريبي للإجراءات؛ ليس سجلاً رقابياً غير قابل للتعديل'  : 'Local demo activity log; not an immutable audit trail'}
              </p>
            </div>
            <button
              onClick={() => setActiveModule('audit-log')}
              className="text-xs text-teal-700 hover:underline font-medium"
            >
              {language === 'ar' ? 'فتح السجل الكامل' : 'Full log'}
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-start gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 truncate">{log.actorName}</span>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">{log.timestamp}</span>
                  </div>
                  <div className="text-slate-700 mt-0.5 leading-snug">{log.details}</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    {log.targetEntity} · {log.action} · IP: {log.ipAddress || 'غير متاح (عرض تجريبي)'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
