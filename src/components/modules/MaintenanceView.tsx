import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaintenanceRecord, MaintenanceSeverity, MaintenanceStatus } from '../../types';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  DollarSign,
  Truck,
  X,
  FileText,
  Calendar,
} from 'lucide-react';

export const MaintenanceView: React.FC = () => {
  const {
    maintenanceRecords,
    createMaintenanceRecord,
    updateMaintenanceRecord,
    vehicles,
    language,
    canPerform,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeRecord, setActiveRecord] = useState<MaintenanceRecord | null>(null);

  const [newMaintForm, setNewMaintForm] = useState({
    vehicleOrEquipmentId: vehicles[0]?.id || '',
    defectDescription: '',
    severity: 'routine' as MaintenanceSeverity,
    assignedTechnicianName: 'م. أحمد جاسم الربيعي وفريق الصيانة',
    partsUsedStr: 'فلاتر أصلية، زيت هيدروليك',
    partsCostIqd: 0,
    laborCostIqd: 0,
    downtimeHours: 6,
    maintenanceDate: new Date().toISOString().substring(0, 10),
    nextServiceDueDate: '2026-12-15',
    status: 'in_progress' as MaintenanceStatus,
    technicianNotes: '',
  });

  const filteredRecords = maintenanceRecords.filter((rec) => {
    const matchesSearch =
      rec.recordNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.vehicleAssetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.defectDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || rec.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const severityLabels: Record<MaintenanceSeverity, { ar: string; en: string; class: string }> = {
    routine: { ar: 'دورية اعتيادية', en: 'Routine', class: 'bg-blue-50 text-blue-800 border-blue-200' },
    medium: { ar: 'متوسطة', en: 'Medium', class: 'bg-amber-50 text-amber-800 border-amber-200' },
    high: { ar: 'عالية', en: 'High', class: 'bg-orange-100 text-orange-900 border-orange-300' },
    critical: { ar: 'حرجة / عطل جسيم', en: 'Critical', class: 'bg-red-100 text-red-900 border-red-300 font-bold' },
  };

  const statusLabels: Record<MaintenanceStatus, { ar: string; en: string; class: string }> = {
    scheduled: { ar: 'مجدولة', en: 'Scheduled', class: 'bg-slate-100 text-slate-800 border-slate-300' },
    in_progress: { ar: 'قيد التنفيذ بالورشة', en: 'In Progress', class: 'bg-amber-100 text-amber-900 border-amber-300' },
    completed: { ar: 'مكتملة ومعتمدة', en: 'Completed', class: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    cancelled: { ar: 'ملغاة', en: 'Cancelled', class: 'bg-slate-100 text-slate-500 border-slate-200' },
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaintForm.defectDescription) {
      showToast('يرجى كتابة وصف العطل أو برنامج الصيانة.', 'warning');
      return;
    }
    const targetVeh = vehicles.find((v) => v.id === newMaintForm.vehicleOrEquipmentId);
    if (!targetVeh) return;

    createMaintenanceRecord({
      vehicleOrEquipmentId: targetVeh.id,
      vehicleAssetNumber: targetVeh.assetNumber,
      vehicleMakeModel: targetVeh.makeModel,
      defectDescription: newMaintForm.defectDescription,
      severity: newMaintForm.severity,
      assignedTechnicianName: newMaintForm.assignedTechnicianName,
      partsUsed: newMaintForm.partsUsedStr.split(',').map((s) => s.trim()),
      partsCostIqd: Number(newMaintForm.partsCostIqd) || 0,
      laborCostIqd: Number(newMaintForm.laborCostIqd) || 0,
      downtimeHours: Number(newMaintForm.downtimeHours) || 0,
      maintenanceDate: newMaintForm.maintenanceDate,
      nextServiceDueDate: newMaintForm.nextServiceDueDate,
      status: newMaintForm.status,
      technicianNotes: newMaintForm.technicianNotes,
    });

    setShowAddModal(false);
  };

  const handleCompleteRecord = (recId: string) => {
    if (!canPerform('create_maintenance')) {
      showToast('ليس لديك صلاحية اعتماد إغلاق سجل الصيانة.', 'error');
      return;
    }
    updateMaintenanceRecord(recId, { status: 'completed' });
    showToast('تم إغلاق أمر الصيانة وإعادة الآلية إلى حالة الجاهزية المتاحة', 'success');
    if (activeRecord) setActiveRecord(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-600" />
            <span>{language === 'ar' ? 'إدارة الصيانة والأعطال الكهروميكانيكية' : 'Maintenance & Repair Orders'}</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold tabular-nums">
              {maintenanceRecords.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar'
              ? 'أوامر الصيانة الوقائية والعلاجية لآليات ومضخات محطة عبد المحسن الكاظمي'
              : 'Preventive and corrective work orders, parts, and downtime tracking'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? 'فتح أمر صيانة جديد' : 'New Maintenance Order'}</span>
        </button>
      </div>

      {/* Dynamic critical maintenance alert: based on current records, not hard-coded sample text */}
      {(() => {
        const criticalOpen = maintenanceRecords.filter((r) => r.severity === 'critical' && r.status !== 'completed' && r.status !== 'cancelled');
        const overdue = maintenanceRecords.filter((r) => r.status !== 'completed' && r.status !== 'cancelled' && r.nextServiceDueDate && r.nextServiceDueDate < new Date().toISOString().slice(0, 10));
        if (criticalOpen.length === 0 && overdue.length === 0) return null;
        const top = criticalOpen[0] || overdue[0];
        return (
          <div className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-4 ${criticalOpen.length ? 'bg-red-50 border-red-200 text-red-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${criticalOpen.length ? 'text-red-600' : 'text-amber-600'}`} />
              <div>
                <div className="font-bold">{criticalOpen.length ? `تنبيه: يوجد ${criticalOpen.length} أمر صيانة حرج مفتوح` : `تنبيه: يوجد ${overdue.length} أمر صيانة تجاوز موعده`}</div>
                <div className="text-[11px] mt-0.5 leading-relaxed">{top.recordNumber} · {top.vehicleAssetNumber} · {top.defectDescription}</div>
              </div>
            </div>
            <span className="font-mono text-xs bg-white/70 px-2.5 py-1 rounded font-bold shrink-0">{top.recordNumber}</span>
          </div>
        );
      })()}

      {/* Live maintenance KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: 'الأوامر المفتوحة', value: maintenanceRecords.filter((r) => !['completed', 'cancelled'].includes(r.status)).length, color: 'text-slate-900' },
          { label: 'أعطال حرجة مفتوحة', value: maintenanceRecords.filter((r) => r.severity === 'critical' && !['completed', 'cancelled'].includes(r.status)).length, color: 'text-red-700' },
          { label: 'قيد التنفيذ', value: maintenanceRecords.filter((r) => r.status === 'in_progress').length, color: 'text-amber-700' },
          { label: 'صيانة متأخرة', value: maintenanceRecords.filter((r) => !['completed', 'cancelled'].includes(r.status) && r.nextServiceDueDate && r.nextServiceDueDate < new Date().toISOString().slice(0, 10)).length, color: 'text-orange-700' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="text-xs text-slate-500">{kpi.label}</div>
            <div className={`mt-1 text-2xl font-bold tabular-nums ${kpi.color}`}>{kpi.value}</div>
            <div className="mt-1 text-[10px] text-slate-400">محسوب من سجلات الصيانة الحالية</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute top-2.5 start-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'البحث برقم أمر الصيانة، الآلية، أو وصف العطل...' : 'Search maintenance records...'}
            className="w-full ps-9 pe-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-600 bg-slate-50 focus:bg-white"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="text-xs py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-teal-600"
        >
          <option value="all">كافة درجات الخطورة</option>
          <option value="routine">دورية اعتيادية</option>
          <option value="medium">متوسطة</option>
          <option value="high">عالية</option>
          <option value="critical">حرجة / عطل جسيم</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-teal-600"
        >
          <option value="all">كافة الحالات</option>
          <option value="in_progress">قيد التنفيذ</option>
          <option value="completed">مكتملة ومعتمدة</option>
          <option value="scheduled">مجدولة</option>
          <option value="cancelled">ملغاة</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4">رقم الأمر</th>
                <th className="py-3 px-4">الآلية / المعدة</th>
                <th className="py-3 px-4">وصف العطل / الصيانة</th>
                <th className="py-3 px-4">الخطورة</th>
                <th className="py-3 px-4">الفني المسؤول</th>
                <th className="py-3 px-4">التوقف (ساعة)</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((rec) => (
                <tr
                  key={rec.id}
                  onClick={() => setActiveRecord(rec)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {rec.recordNumber}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{rec.vehicleAssetNumber}</div>
                    <div className="text-[11px] text-slate-500">{rec.vehicleMakeModel}</div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="text-slate-900 font-medium line-clamp-1">{rec.defectDescription}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{rec.maintenanceDate}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${severityLabels[rec.severity].class}`}>
                      {severityLabels[rec.severity].ar}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    {rec.assignedTechnicianName}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                    {rec.downtimeHours} سا
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${statusLabels[rec.status].class}`}>
                      {statusLabels[rec.status].ar}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveRecord(rec); }}
                      className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded font-semibold text-xs transition-colors"
                    >
                      التفاصيل / الإجراء
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance record details and workflow actions */}
      {activeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onClick={() => setActiveRecord(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <div className="text-xs text-slate-500">تفاصيل أمر الصيانة</div>
                <h3 className="font-bold text-lg text-slate-900">{activeRecord.recordNumber}</h3>
                <p className="text-xs text-slate-500 mt-1">{activeRecord.vehicleAssetNumber} · {activeRecord.vehicleMakeModel}</p>
              </div>
              <button onClick={() => setActiveRecord(null)} className="p-1 rounded hover:bg-slate-100 text-slate-500" aria-label="إغلاق"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                ['وصف العطل / العمل', activeRecord.defectDescription],
                ['درجة الخطورة', severityLabels[activeRecord.severity].ar],
                ['الفني المسؤول', activeRecord.assignedTechnicianName || 'غير محدد'],
                ['الحالة الحالية', statusLabels[activeRecord.status].ar],
                ['تاريخ فتح / صيانة الأمر', activeRecord.maintenanceDate || 'غير مسجل'],
                ['موعد الصيانة القادم', activeRecord.nextServiceDueDate || 'غير محدد'],
                ['مدة التوقف المسجلة', `${activeRecord.downtimeHours} ساعة`],
                ['قطع الغيار / المواد', activeRecord.partsUsed?.join('، ') || 'لا توجد مواد مسجلة'],
                ['ملاحظات الفني', activeRecord.technicianNotes || 'لا توجد ملاحظات مسجلة'],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                  <div className="text-slate-500">{label}</div>
                  <div className="mt-1 font-semibold text-slate-900 break-words">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-slate-200 p-3">
              <div className="font-bold text-xs text-slate-800 mb-2">تحديث حالة الأمر</div>
              <div className="flex flex-wrap gap-2">
                {activeRecord.status !== 'in_progress' && !['completed', 'cancelled'].includes(activeRecord.status) && (
                  <button onClick={() => { updateMaintenanceRecord(activeRecord.id, { status: 'in_progress' }); setActiveRecord({ ...activeRecord, status: 'in_progress' }); }} className="px-3 py-2 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold">بدء / استئناف الإصلاح</button>
                )}
                {activeRecord.status === 'in_progress' && (
                  <button onClick={() => handleCompleteRecord(activeRecord.id)} className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold">اعتماد اكتمال الإصلاح</button>
                )}
                {!['completed', 'cancelled'].includes(activeRecord.status) && (
                  <button onClick={() => { updateMaintenanceRecord(activeRecord.id, { status: 'cancelled' }); setActiveRecord(null); }} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold">إلغاء الأمر</button>
                )}
                <button onClick={() => setActiveRecord(null)} className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold">إغلاق التفاصيل</button>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">في هذه النسخة التجريبية، اعتماد اكتمال الإصلاح هو إجراء إداري داخل التطبيق؛ لا يمثل فحص سلامة ميدانيًا مستقلًا.</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Maintenance Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-teal-600" />
                <span>إصدار أمر صيانة فني جديد</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">الآلية أو المعدة المعطلة: *</label>
                <select
                  value={newMaintForm.vehicleOrEquipmentId}
                  onChange={(e) => setNewMaintForm({ ...newMaintForm, vehicleOrEquipmentId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.assetNumber} - {v.makeModel} ({v.plateNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">درجة الخطورة والتأثير: *</label>
                <select
                  value={newMaintForm.severity}
                  onChange={(e) => setNewMaintForm({ ...newMaintForm, severity: e.target.value as MaintenanceSeverity })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="routine">دورية اعتيادية (Routine)</option>
                  <option value="medium">متوسطة (Medium)</option>
                  <option value="high">عالية (High)</option>
                  <option value="critical">حرجة / عطل جسيم (Critical)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">وصف العطل والأعمال المطلوبة: *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="تفاصيل العطل الميكانيكي أو الكهربائي، تسريب زيت، فلاتر، كسور..."
                  value={newMaintForm.defectDescription}
                  onChange={(e) => setNewMaintForm({ ...newMaintForm, defectDescription: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">المواد وقطع الغيار المطلوبة (مفصولة بفواصل):</label>
                <input
                  type="text"
                  placeholder="مثال: فلاتر زيت، سيلات هيدروليك، زيت 15W40"
                  value={newMaintForm.partsUsedStr}
                  onChange={(e) => setNewMaintForm({ ...newMaintForm, partsUsedStr: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">ساعات التوقف المقدرة:</label>
                  <input
                    type="number"
                    value={newMaintForm.downtimeHours}
                    onChange={(e) => setNewMaintForm({ ...newMaintForm, downtimeHours: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-lg font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg font-bold"
                >
                  فتح أمر الصيانة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
