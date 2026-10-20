import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, ShiftDefinition } from '../../types';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  UserX,
  X,
  Plus,
  Printer,
  Download,
  Info,
  Search,
  ChevronDown,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    shifts,
    attendance,
    employees,
    clockInEmployee,
    setAttendanceStatus,
    requestAttendanceCorrection,
    approveAttendanceCorrection,
    language,
    currentUser,
    canPerform,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'daily' | 'corrections' | 'shifts'>('daily');
  const [showCorrectionModal, setShowCorrectionModal] = useState<AttendanceRecord | null>(null);
  const [correctionNote, setCorrectionNote] = useState('');
  const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const [selectedDate, setSelectedDate] = useState(localToday());
  const [searchText, setSearchText] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusEmployeeId, setStatusEmployeeId] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<AttendanceRecord['status']>('present');
  const [leaveType, setLeaveType] = useState<NonNullable<AttendanceRecord['leaveType']>>('annual');
  const [statusNote, setStatusNote] = useState('');

  const pendingCorrections = attendance.filter((a) => a.manualEditRequested && !a.isApproved);
  const dailyRecords = attendance.filter((a) => a.date === selectedDate && a.employeeName.toLowerCase().includes(searchText.trim().toLowerCase()));
  const recordedEmployeeIds = new Set(attendance.filter((a) => a.date === selectedDate).map((a) => a.employeeId));
  const filteredModalEmployees = employees.filter((emp) => emp.fullName.toLowerCase().includes(employeeSearch.trim().toLowerCase()));
  const missingAttendanceEmployees = employees.filter((emp) => !recordedEmployeeIds.has(emp.id) && emp.fullName.toLowerCase().includes(searchText.trim().toLowerCase()));
  const presentCount = dailyRecords.filter((record) => record.status === 'present' || record.status === 'late').length;
  const absentCount = dailyRecords.filter((record) => record.status === 'absent').length;
  const leaveCount = dailyRecords.filter((record) => record.status === 'leave').length;

  const statusLabels: Record<AttendanceRecord['status'], { ar: string; class: string }> = {
    present: { ar: 'حاضر (منتظم)', class: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
    late: { ar: 'متأخر', class: 'bg-amber-50 text-amber-800 border-amber-300' },
    absent: { ar: 'غياب غير مبرر', class: 'bg-red-50 text-red-800 border-red-300' },
    excused: { ar: 'عذر رسمي', class: 'bg-blue-50 text-blue-800 border-blue-300' },
    leave: { ar: 'إجازة معتمدة', class: 'bg-purple-50 text-purple-800 border-purple-300' },
  };

  const exportDailyCsv = () => {
    const rows = dailyRecords.map((record) => {
      const shift = shifts.find((item) => item.id === record.shiftId);
      const status = record.status === 'leave' && record.leaveType
        ? ({ annual: 'إجازة سنوية', sick: 'إجازة مرضية', emergency: 'إجازة طارئة', official_mission: 'مهمة رسمية' }[record.leaveType])
        : statusLabels[record.status].ar;
      return [record.employeeName, shift?.nameAr || 'صباحي', record.checkInTime || '', record.checkOutTime || '', status, record.overtimeMinutes, record.notes || ''];
    });
    const csv = ['اسم الموظف,الشفت,وقت الحضور,وقت الانصراف,الحالة,الإضافي بالدقائق,الملاحظات', ...rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))].join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `attendance_${selectedDate}.csv`; link.click(); URL.revokeObjectURL(url);
    showToast('تم تصدير سجل الحضور الظاهر بصيغة CSV.', 'success');
  };

  const handleRequestCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCorrectionModal) return;
    if (!correctionNote || correctionNote.trim().length < 5) {
      showToast('يرجى كتابة سبب طلب التصحيح مع توضيح المهمة أو العذر الميداني.', 'warning');
      return;
    }
    requestAttendanceCorrection(showCorrectionModal.id, correctionNote);
    setShowCorrectionModal(null);
    setCorrectionNote('');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <span>{language === 'ar' ? 'سجل الحضور وجداول الوجبات (الشفتات)' : 'Attendance & Shift Management'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar'
              ? 'متابعة الدوام اليومي، أذونات التأخير، ساعات العمل الإضافي، ومصادقة المشرفين'
              : 'Shift logs, clock-in records, overtime review, and supervisor approvals'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={exportDailyCsv} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-medium transition-colors">
            <Download className="w-4 h-4" /><span>تصدير CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الكشف</span>
          </button>
        </div>
      </div>

      {/* Audit & Biometrics Disclaimer Banner */}
      <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">ضوابط التوثيق الإداري للدوام:</span> يستند هذا السجل إلى دفاتر الحضور الرسمية وتقارير مسؤولي الوجبات المعتمدة من بلدية الكاظمية، مع مسار تدقيقي صارم لأي تعديل أو تصحيح يدوي.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'daily' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          سجل الحضور اليومي
        </button>
        <button
          onClick={() => setActiveTab('corrections')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'corrections' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>طلبات التصحيح</span>
          {pendingCorrections.length > 0 && (
            <span className="font-mono text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-full">
              {pendingCorrections.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('shifts')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'shifts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          تعريف الشفتات
        </button>
      </div>

      {/* TAB 1: DAILY ATTENDANCE */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-xs text-slate-900">سجل الحضور اليومي</span>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs" aria-label="تاريخ الحضور" />
                <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="ابحث باسم الموظف..." className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono text-teal-700 font-bold">{presentCount} حاضر/متأخر</span>
                <span className="text-[11px] font-mono text-red-700 font-bold">{absentCount} غائب</span>
                <span className="text-[11px] font-mono text-violet-700 font-bold">{leaveCount} إجازة</span>
                {canPerform('approve_attendance') && <button onClick={() => { setStatusEmployeeId(missingAttendanceEmployees[0]?.id || employees[0]?.id || ''); setNewStatus('present'); setStatusNote(''); setShowStatusModal(true); }} className="px-3 py-2 bg-teal-700 text-white rounded-lg text-xs font-bold hover:bg-teal-600">+ تسجيل حالة موظف</button>}
              </div>
            </div>

            {missingAttendanceEmployees.length > 0 && (
              <div className="mx-4 mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <div className="font-bold">لم تُسجّل حالة الدوام لـ {missingAttendanceEmployees.length} موظفًا في تاريخ {selectedDate}.</div>
                <div className="mt-1 leading-6">{missingAttendanceEmployees.slice(0, 8).map((emp) => emp.fullName).join('، ')}{missingAttendanceEmployees.length > 8 ? '، وغيرهم' : ''}</div>
                {canPerform('approve_attendance') && <button onClick={() => { setStatusEmployeeId(missingAttendanceEmployees[0]?.id || ''); setNewStatus('present'); setStatusNote(''); setShowStatusModal(true); }} className="mt-2 px-3 py-1.5 rounded-lg bg-amber-700 text-white font-semibold">تسجيل حالة أول موظف غير مسجل</button>}
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-3 px-4">اسم الموظف</th>
                    <th className="py-3 px-4">الشفت</th>
                    <th className="py-3 px-4">وقت الحضور</th>
                    <th className="py-3 px-4">وقت الانصراف</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4">إضافي (دقيقة)</th>
                    <th className="py-3 px-4">ملاحظات التدقيق</th>
                    <th className="py-3 px-4 text-center">إجراء الموظف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailyRecords.map((rec) => {
                    const shift = shifts.find((s) => s.id === rec.shiftId);

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{rec.employeeName}</td>
                        <td className="py-3 px-4 text-slate-600">{shift?.nameAr || 'صباحي'}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {rec.checkInTime || '—'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {rec.checkOutTime || '—'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${statusLabels[rec.status].class}`}>
                            {rec.status === 'leave' && rec.leaveType ? ({ annual: 'إجازة سنوية', sick: 'إجازة مرضية', emergency: 'إجازة طارئة', official_mission: 'مهمة رسمية' }[rec.leaveType]) : statusLabels[rec.status].ar}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700 tabular-nums">
                          {rec.overtimeMinutes > 0 ? `+${rec.overtimeMinutes}` : '0'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                          {rec.notes || (rec.manualEditRequested ? 'طلب تصحيح معلق...' : '—')}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {canPerform('approve_attendance') && <button onClick={() => { setStatusEmployeeId(rec.employeeId); setNewStatus(rec.status); setStatusNote(rec.notes || ''); setShowStatusModal(true); }} className="ms-1 px-2 py-1 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded font-medium">تعديل الحالة</button>}
                          {rec.status === 'late' && !rec.manualEditRequested && (
                            <button
                              onClick={() => setShowCorrectionModal(rec)}
                              className="px-2.5 py-1 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 rounded font-medium"
                            >
                              طلب تبرير تأخر
                            </button>
                          )}
                          {canPerform('clock_in') && !rec.checkInTime && rec.status !== 'leave' && rec.status !== 'absent' && rec.status !== 'excused' && (
                            <button
                              onClick={() => clockInEmployee(rec.employeeId)}
                              className="px-2.5 py-1 text-xs text-teal-800 bg-teal-50 hover:bg-teal-100 rounded font-medium"
                            >
                              تسجيل حضور
                            </button>
                          )}
                          {canPerform('clock_in') && rec.checkInTime && !rec.checkOutTime && (
                            <button
                              onClick={() => clockInEmployee(rec.employeeId)}
                              className="px-2.5 py-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-medium"
                            >
                              تسجيل انصراف
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {dailyRecords.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-slate-400">لا توجد سجلات لهذا التاريخ أو البحث. استخدم «تسجيل حالة موظف» لإضافة سجل تجريبي.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CORRECTION REQUESTS */}
      {activeTab === 'corrections' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">طلبات تعديل وتصحيح بصمات وساعات الدوام</span>
            <span className="text-[11px] text-slate-500">تتطلب مصادقة المشرف المباشر ومسؤول الموارد</span>
          </div>

          <div className="p-4 space-y-3">
            {pendingCorrections.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                لا توجد طلبات تصحيح دوام معلقة حالياً.
              </div>
            ) : (
              pendingCorrections.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{rec.employeeName}</div>
                    <div className="text-slate-600 mt-1">
                      <span className="font-medium text-slate-800">سبب الطلب والتبرير:</span>{' '}
                      «{rec.manualCorrectionNote || 'مهمة فحص ميدانية خارج المحطة'}»
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      التاريخ: {rec.date} · المسجل: {rec.checkInTime}
                    </div>
                  </div>

                  {canPerform('approve_attendance') ? (
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => approveAttendanceCorrection(rec.id, false)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium"
                      >
                        رفض التبرير
                      </button>
                      <button
                        onClick={() => approveAttendanceCorrection(rec.id, true)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold shadow-xs"
                      >
                        المصادقة والاعتماد
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic">
                      بانتظار مصادقة المشرف أو الموارد البشرية
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SHIFTS CONFIGURATION */}
      {activeTab === 'shifts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">{shift.nameAr}</span>
                  <span className="font-mono text-xs bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-bold">
                    {shift.startTime} - {shift.endTime}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-sans mb-3">{shift.nameEn}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{shift.descriptionAr}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>الكادر المخصص:</span>
                <span className="font-bold text-slate-800">
                  {employees.filter((e) => e.assignedShiftId === shift.id).length} موظف
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">تسجيل أو تعديل حالة الدوام</h3>
            <p className="text-xs text-slate-500 mb-4">يسجّل النظام اسم المسؤول ووقت التعديل في سجل التدقيق التجريبي.</p>
            <form onSubmit={(e) => { e.preventDefault(); if (!statusEmployeeId) { showToast('اختر الموظف أولاً.', 'warning'); return; } if ((newStatus === 'absent' || newStatus === 'excused' || newStatus === 'leave') && statusNote.trim().length < 3) { showToast('يرجى إدخال سبب أو ملاحظة للحالة المختارة.', 'warning'); return; } setAttendanceStatus(statusEmployeeId, selectedDate, newStatus, statusNote, newStatus === 'leave' ? leaveType : undefined); setShowStatusModal(false); setStatusNote(''); }} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-semibold">الموظف</label>
                <div className="relative">
                  <button type="button" aria-expanded={employeeDropdownOpen} aria-haspopup="listbox"
                    onClick={() => { setEmployeeDropdownOpen(!employeeDropdownOpen); setEmployeeSearch(''); }}
                    className="w-full flex items-center justify-between gap-2 p-2.5 border border-slate-300 rounded-lg bg-white text-right focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="truncate">{employees.find((emp) => emp.id === statusEmployeeId)?.fullName || 'اختر الموظف'}</span>
                      {recordedEmployeeIds.has(statusEmployeeId) && <span className="text-emerald-700 flex items-center gap-1 whitespace-nowrap"><CheckCircle2 className="w-4 h-4" /> تم التسجيل</span>}
                    </span>
                    <ChevronDown className="w-4 h-4 shrink-0 text-slate-500" />
                  </button>
                  {employeeDropdownOpen && (
                    <div className="absolute z-[70] top-full mt-1 w-full bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden" role="listbox" aria-label="اختر الموظف">
                      <div className="p-2 border-b border-slate-100 relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input autoFocus type="search" aria-label="بحث عن موظف" placeholder="ابحث باسم الموظف..." value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Escape') setEmployeeDropdownOpen(false); }}
                          className="w-full rounded-md border border-slate-200 py-2 pr-9 pl-3 focus:ring-2 focus:ring-teal-500 outline-none" />
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        {filteredModalEmployees.length === 0 ? <p className="p-3 text-slate-500 text-center">لا يوجد موظف بهذا الاسم</p> :
                          filteredModalEmployees.map((emp) => (
                            <button key={emp.id} type="button" role="option" aria-selected={statusEmployeeId === emp.id}
                              onClick={() => { setStatusEmployeeId(emp.id); setEmployeeDropdownOpen(false); setEmployeeSearch(''); }}
                              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-right hover:bg-teal-50 ${statusEmployeeId === emp.id ? 'bg-teal-50' : ''}`}>
                              <span className="truncate">{emp.fullName}</span>
                              {recordedEmployeeIds.has(emp.id) ? (
                                <span className="flex gap-1 items-center shrink-0 text-emerald-700 font-semibold"><CheckCircle2 className="w-4 h-4" /> ✓ تم التسجيل</span>
                              ) : <span className="shrink-0 text-slate-400">غير مسجل</span>}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">✓ تعني أن حالة دوام الموظف مسجلة في تاريخ {selectedDate}. يمكنك اختيار الموظف مجددًا لتعديل حالته.</p>
              </div>
              <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 flex items-center justify-between">
                <span className="font-semibold text-teal-900">شفت الموظف (تلقائي)</span>
                <span className="font-bold text-teal-800">{shifts.find((shift) => shift.id === employees.find((emp) => emp.id === statusEmployeeId)?.assignedShiftId)?.nameAr || 'اختر الموظف'}</span>
              </div>
              <div><label className="block mb-1 font-semibold">حالة الدوام</label><select value={newStatus} onChange={(e) => setNewStatus(e.target.value as AttendanceRecord['status'])} className="w-full p-2 border border-slate-300 rounded-lg bg-white"><option value="present">حاضر</option><option value="late">متأخر</option><option value="absent">غائب</option><option value="leave">إجازة معتمدة</option><option value="excused">عذر رسمي / مهمة رسمية</option></select></div>
              {newStatus === 'leave' && <div><label className="block mb-1 font-semibold">نوع الإجازة</label><select value={leaveType} onChange={(e) => setLeaveType(e.target.value as NonNullable<AttendanceRecord['leaveType']>)} className="w-full p-2 border border-slate-300 rounded-lg bg-white"><option value="annual">إجازة سنوية</option><option value="sick">إجازة مرضية</option><option value="emergency">إجازة طارئة</option><option value="official_mission">مهمة رسمية</option></select></div>}
              <div><label className="block mb-1 font-semibold">السبب أو الملاحظات {['absent','excused','leave'].includes(newStatus) ? '*' : '(اختياري)'}</label><textarea rows={3} value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="اكتب سبب الحالة أو رقم كتاب الإجازة دون إدخال تفاصيل طبية حساسة..." className="w-full p-2 border border-slate-300 rounded-lg" /></div>
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowStatusModal(false)} className="px-3 py-2 bg-slate-100 rounded-lg">إلغاء</button><button type="submit" className="px-4 py-2 bg-teal-700 text-white rounded-lg font-bold">حفظ الحالة</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Correction Request Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              طلب تبرير وتصحيح حضور: {showCorrectionModal.employeeName}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              أدخل مبرر التأخر أو المهمة الميدانية لرفعها لمسؤول الوجبة.
            </p>

            <form onSubmit={handleRequestCorrectionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  المبرر الرسمي أو كتاب التكليف: *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="مثال: مباشرة ميدانية في فتح انسداد خط العطيفية قبل الحضور للمقر..."
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(null)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-lg font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg font-bold"
                >
                  إرسال الطلب للمشرف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
