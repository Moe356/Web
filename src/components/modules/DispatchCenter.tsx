import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkOrder, TicketStatus, Vehicle } from '../../types';
import {
  Compass,
  MapPin,
  Truck,
  Users,
  AlertTriangle,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Info,
  Maximize2,
  Lock,
} from 'lucide-react';
import { ASSETS } from '../../assets/assetPaths';

export const DispatchCenter: React.FC = () => {
  const {
    workOrders,
    updateWorkOrderStatus,
    vehicles,
    employees,
    language,
    setSelectedTicketId,
    setActiveModule,
    showToast,
    currentUser,
  } = useApp();

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Dispatch columns
  // Each order appears in exactly one status column. Counts are derived from the shared work-order store.
  const columns: { id: TicketStatus; titleAr: string; titleEn: string; color: string }[] = [
    { id: 'new', titleAr: 'بلاغات جديدة', titleEn: 'New', color: 'border-t-slate-400' },
    { id: 'reviewed', titleAr: 'قيد المراجعة', titleEn: 'Reviewed', color: 'border-t-blue-500' },
    { id: 'assigned', titleAr: 'تم التكليف', titleEn: 'Assigned', color: 'border-t-indigo-500' },
    { id: 'en_route', titleAr: 'في الطريق', titleEn: 'En Route', color: 'border-t-amber-500' },
    { id: 'on_site', titleAr: 'وصل الموقع', titleEn: 'On site', color: 'border-t-teal-500' },
    { id: 'in_progress', titleAr: 'قيد التنفيذ', titleEn: 'In Progress', color: 'border-t-sky-500' },
    { id: 'awaiting_materials', titleAr: 'بانتظار المواد', titleEn: 'Awaiting parts', color: 'border-t-orange-500' },
    { id: 'completed', titleAr: 'منجز ميدانياً', titleEn: 'Completed', color: 'border-t-emerald-500' },
    { id: 'verified', titleAr: 'منجز ومدقّق', titleEn: 'Verified', color: 'border-t-green-700' },
  ];

  const advanceStatusMap: Partial<Record<TicketStatus, TicketStatus>> = {
    new: 'reviewed',
    reviewed: 'assigned',
    assigned: 'en_route',
    en_route: 'on_site',
    on_site: 'in_progress',
    awaiting_materials: 'in_progress',
  };

  const handleQuickAdvance = (order: WorkOrder) => {
    const next = advanceStatusMap[order.status];
    if (next) {
      if (next === 'completed') {
        setSelectedTicketId(order.id);
        setActiveModule('operations');
        showToast('يرجى تسجيل ملاحظات الإنجاز الفني في صفحة البلاغ.', 'info');
        return;
      }
      updateWorkOrderStatus(order.id, next, 'تحريك سريع من لوحة التوزيع والسيطرة');
    }
  };

  // Locations coordinate list
  // These are demonstration locations only. Active counts are calculated from current work orders,
  // rather than hard-coded numbers. Replace coordinates with verified field data before production use.
  const activeLocations = [
    { name: 'الكاظمية القديمة - ساحة الزهراء', coords: '33.3798° N, 44.3445° E' },
    { name: 'شارع موسى الكاظم (ع) - العطيفية', coords: '33.3712° N, 44.3518° E' },
    { name: 'محطة الرفع الفرعية - شارع النواب', coords: '33.3855° N, 44.3392° E' },
    { name: 'حي الجوادين - محلة 423', coords: '33.3910° N, 44.3480° E' },
    { name: 'كورنيش دجلة - شارع المحيط', coords: '33.3950° N, 44.3550° E' },
  ].map((location) => {
    const key = location.name.split(' - ')[0].trim().toLowerCase();
    const activeCount = workOrders.filter((order) => {
      const isActive = !['completed', 'verified', 'cancelled'].includes(order.status);
      const locationText = `${order.neighborhood} ${order.street} ${order.area} ${order.landmark || ''}`.toLowerCase();
      return isActive && (locationText.includes(key) || key.includes(order.neighborhood.toLowerCase()));
    }).length;
    return { ...location, activeCount };
  });
  const activeOrders = workOrders.filter((order) => !['completed', 'verified', 'cancelled'].includes(order.status));
  const activeTeams = new Set(activeOrders.map((order) => order.assignedTeam?.trim()).filter(Boolean));
  const overdueOrders = activeOrders.filter((order) => {
    const dueDate = order.dueDate;
    return Boolean(dueDate && new Date(dueDate).getTime() < Date.now());
  });

  return (
    <div className="space-y-5">
      {/* Top Banner & Workload Visibility */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold">
            <Compass className="w-4 h-4 text-teal-400" />
            <span>{language === 'ar' ? 'غرفة السيطرة والتوزيع الميداني (Live Operations Board)' : 'Live Dispatch Center'}</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-0.5">
            {language === 'ar' ? 'توجيه الفرق والآليات التخصصية في قواطع الكاظمية' : 'Al-Kadhimiya Field Dispatch Matrix'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center gap-2">
            <Truck className="w-4 h-4 text-teal-400" />
            <span>الآليات المنتشرة:</span>
            <span className="font-mono font-bold text-teal-300">
              {vehicles.filter((v) => v.availability === 'assigned').length}
            </span>
          </div>

          <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>الفرق النشطة:</span>
            <span className="font-mono font-bold text-emerald-300">{activeTeams.size} طاقم</span>
          </div>

          <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>أوامر متأخرة:</span>
            <span className="font-mono font-bold text-amber-300">{overdueOrders.length}</span>
          </div>

          <button
            onClick={() => showToast('تم تحديث لوحة التوزيع من سجلات أوامر العمل الحالية. البيانات محلية وتجريبية وليست مزامنة مع أجهزة ميدانية.', 'info')}
            className="flex items-center gap-1.5 px-3 py-2 bg-teal-700 hover:bg-teal-600 rounded-lg font-semibold text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'مزامنة اللوحة' : 'Sync Board'}</span>
          </button>
        </div>
      </div>

      {/* Notice about Demo Real-Time & Live Maps */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">
            {language === 'ar' ? 'تنويه السيطرة والخرائط:' : 'Dispatch & Map Engine Notice:'}
          </span>{' '}
          {language === 'ar'
            ? 'هذه لوحة تجريبية: أعداد المراحل والفرق تُحسب من أوامر العمل المحلية، لكن المواقع والإحداثيات المعروضة أمثلة وليست تتبع GPS مباشرًا. لا يوجد اتصال فعلي بنظام SCADA أو أجهزة المحطة.'
            : 'Demo board: status and team counts come from local work orders. Locations are examples, not live GPS or SCADA data.'}
        </div>
      </div>

      {/* Main Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-2 min-h-[500px]">
        {columns.map((col) => {
          const colOrders = workOrders.filter((w) => w.status === col.id);

          return (
            <div
              key={col.id}
              className={`bg-slate-100/70 rounded-xl border border-slate-200 p-2.5 flex flex-col border-t-4 ${col.color} min-w-[180px] flex-1`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
                <span className="font-bold text-xs text-slate-800">
                  {language === 'ar' ? col.titleAr : col.titleEn}
                </span>
                <span className="font-mono text-[11px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                  {colOrders.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[600px]">
                {colOrders.length === 0 ? (
                  <div className="text-center py-8 text-[11px] text-slate-400">
                    {language === 'ar' ? 'فارغ حالياً' : 'Empty'}
                  </div>
                ) : (
                  colOrders.map((order) => {
                    const assignedVehicle = vehicles.find((v) => v.id === order.assignedVehicleId);

                    return (
                      <div
                        key={order.id}
                        onClick={() => {
                          setSelectedTicketId(order.id);
                          setActiveModule('operations');
                        }}
                        className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs hover:border-teal-500 transition-all cursor-pointer group"
                      >
                        {/* Card Top: Ticket# & Priority */}
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-mono font-bold text-[11px] text-slate-800">
                            {order.ticketNumber}
                          </span>
                          {order.priority === 'urgent' && (
                            <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              طارئ
                            </span>
                          )}
                        </div>

                        {/* Card Title */}
                        <div className="font-semibold text-xs text-slate-900 line-clamp-2 leading-tight mb-2">
                          {order.title}
                        </div>

                        {order.dueDate && (
                          <div className={`text-[10px] mb-2 ${new Date(order.dueDate).getTime() < Date.now() && !['completed', 'verified', 'cancelled'].includes(order.status) ? 'text-red-700 font-bold' : 'text-slate-500'}`}>
                            الموعد المتوقع: {new Date(order.dueDate).toLocaleString('ar-IQ', { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        )}

                        {/* Location */}
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{order.neighborhood}</span>
                        </div>

                        {/* Vehicle and Team */}
                        <div className="p-1.5 bg-slate-50 rounded border border-slate-100 text-[10px] space-y-0.5 text-slate-600">
                          <div className="truncate font-medium">{order.assignedTeam || 'لم يحدد فريق'}</div>
                          {assignedVehicle && (
                            <div className="font-mono text-teal-800 truncate">
                              {assignedVehicle.assetNumber} ({assignedVehicle.categoryNameAr})
                            </div>
                          )}
                        </div>

                        {/* Quick Advance Button */}
                        {advanceStatusMap[order.status] && (
                          currentUser.role === 'normal_user' ? (
                            <div className="w-full mt-2 py-1 px-2 bg-slate-50 text-slate-400 rounded text-[9px] font-medium flex items-center justify-center gap-1 border border-slate-200">
                              <Lock className="w-2.5 h-2.5" />
                              <span>التمرير مخصص لمدير النظام</span>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAdvance(order);
                              }}
                              className="w-full mt-2 py-1 px-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 rounded text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>
                                {order.status === 'in_progress' ? 'تسجيل الإنجاز' : 'تمرير المرحلة التالية'}
                              </span>
                              {language === 'ar' ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                            </button>
                          )
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Split: Geographic Coordinates & Control Room Image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Geographic Location List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>{language === 'ar' ? 'سجل المواقع والإحداثيات الميدانية في قاطع الكاظمية' : 'Municipal Geographic Location Matrix'}</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">بغداد - جانب الكرخ</span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
            {activeLocations.map((loc, idx) => (
              <div
                key={idx}
                className="p-3 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    <span>{loc.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5 ps-4">
                    إحداثيات تجريبية: {loc.coords}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {loc.activeCount} بلاغات نشطة
                  </span>
                  <button
                    onClick={() => {
                      setSelectedLocation(loc.name);
                      showToast(`تم تركيز الخريطة الميدانية على: ${loc.name}`, 'info');
                    }}
                    className="px-2.5 py-1 text-xs text-teal-700 hover:bg-teal-50 rounded"
                  >
                    تحديد
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Control Room Photograph */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-600" />
              <span>غرفة المراقبة والتحكم بالمحطة</span>
            </h3>
            <div className="rounded-lg overflow-hidden border border-slate-200 h-40 bg-slate-900 mb-3">
              <img
                src={ASSETS.controlRoom}
                alt="غرفة التحكم"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              تتولى غرفة السيطرة متابعة مناسيب المياه في خطوط الجريان وربط بلاغات المواطنين بفرق التسليك السريع ومحطة رفع عبد المحسن الكاظمي.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>المناوب الحالي:</span>
            <span className="font-semibold text-slate-900">مصطفى عقيل الخفاجي</span>
          </div>
        </div>
      </div>
    </div>
  );
};
