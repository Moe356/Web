import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, DisciplinaryRecord } from '../../types';
import {
  Award,
  Shield,
  AlertTriangle,
  Lock,
  Plus,
  Search,
  CheckCircle2,
  X,
  FileText,
  User,
  ClipboardList,
  Star,
  Eye,
} from 'lucide-react';

export const PerformanceView: React.FC = () => {
  const { employees, addDisciplinaryRecord, language, currentUser, canPerform, showToast, workOrders, updateEmployee, updateWorkOrder, attendance } = useApp();

  const [activeTab, setActiveTab] = useState<'metrics' | 'evaluations' | 'disciplinary'>('metrics');
  const [showAddDiscModal, setShowAddDiscModal] = useState(false);
  const [ratingEmployeeId, setRatingEmployeeId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState('5');
  const [ratingNotes, setRatingNotes] = useState('');
  const [ordersEmployeeId, setOrdersEmployeeId] = useState<string | null>(null);
  const [assignOrderId, setAssignOrderId] = useState('');

  const canViewDisciplinary = currentUser.role === 'hr_officer' || currentUser.role === 'super_admin';

  const [discForm, setDiscForm] = useState({
    employeeId: employees[0]?.id || '',
    date: new Date().toISOString().substring(0, 10),
    reason: '',
    actionTaken: 'تنبيه إداري مسجل أول',
    issuedBy: 'شعبة الموارد البشرية والذاتية',
  });

  const handleDiscSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discForm.reason) {
      showToast('يرجى كتابة سبب التنبيه أو الإجراء الإداري.', 'warning');
      return;
    }
    const success = addDisciplinaryRecord(discForm.employeeId, {
      date: discForm.date,
      reason: discForm.reason,
      actionTaken: discForm.actionTaken,
      issuedBy: discForm.issuedBy,
      confidential: true,
    });
    if (success) {
      setShowAddDiscModal(false);
      setDiscForm({
        employeeId: employees[0]?.id || '',
        date: new Date().toISOString().substring(0, 10),
        reason: '',
        actionTaken: 'تنبيه إداري مسجل أول',
        issuedBy: 'شعبة الموارد البشرية والذاتية',
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600" />
            <span>{language === 'ar' ? 'مؤشرات الأداء والسجلات الإدارية والانضباطية' : 'Performance Appraisals & Records'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar'
              ? 'مؤشرات الإنجاز الميداني، نسب الحضور، والتقييمات الفنية المستندة إلى وقائع العمل'
              : 'Factual metrics, work order completion, punctuality, and strictly gated records'}
          </p>
        </div>

        {canViewDisciplinary && activeTab === 'disciplinary' && (
          <button
            onClick={() => setShowAddDiscModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إدراج قيد إداري / تنبيه' : 'Add Disciplinary Record'}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'metrics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          مؤشرات الإنجاز الفعلي
        </button>
        <button
          onClick={() => setActiveTab('disciplinary')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'disciplinary' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-slate-500" />
          <span>السجل الانضباطي السري</span>
        </button>
      </div>

      {/* TAB 1: DYNAMIC EMPLOYEE METRICS */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 leading-6">
            هذه المؤشرات تُحسب من أوامر العمل وسجلات الدوام المحفوظة في النظام. تقييم المشرف الفني يُدخَل يدويًا من مستخدم مخوّل. البيانات الحالية تجريبية ومحفوظة محليًا في هذا المتصفح.
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-slate-900">مؤشرات الأداء الميداني لكوادر محطة عبد المحسن الكاظمي</span>
                <p className="text-[11px] text-slate-500 mt-1">اضغط على عدد أوامر العمل لعرض تفاصيلها لكل موظف.</p>
              </div>
              <span className="text-[11px] text-slate-500">تتحدث الأرقام عند تغيير السجلات</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-3 px-4">اسم الموظف</th>
                    <th className="py-3 px-4">المسمى الوظيفي</th>
                    <th className="py-3 px-4">الشعبة</th>
                    <th className="py-3 px-4">أوامر العمل المنجزة</th>
                    <th className="py-3 px-4">نسبة الالتزام بالدوام</th>
                    <th className="py-3 px-4">تقييم المشرف الفني</th>
                    <th className="py-3 px-4">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => {
                    const linkedOrders = workOrders.filter((order) => (order.assignedEmployeeIds || []).includes(emp.id));
                    const completedOrders = linkedOrders.filter((order) => order.status === 'verified');
                    const employeeAttendance = attendance.filter((record) => record.employeeId === emp.id);
                    const attendanceRate = employeeAttendance.length
                      ? Math.round((employeeAttendance.filter((record) => record.status === 'present' || record.status === 'late').length / employeeAttendance.length) * 1000) / 10
                      : null;
                    const score = emp.technicalSupervisorRating;
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">{emp.fullName}</td>
                        <td className="py-3 px-4 text-slate-600">{emp.jobTitle}</td>
                        <td className="py-3 px-4 text-slate-600">{emp.department}</td>
                        <td className="py-3 px-4">
                          <button type="button" onClick={() => { setOrdersEmployeeId(emp.id); setAssignOrderId(''); }} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-100">
                            <ClipboardList className="w-3.5 h-3.5" /> {completedOrders.length} معتمد / {linkedOrders.length} إجمالي
                          </button>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-teal-800 tabular-nums">{attendanceRate === null ? 'لا توجد سجلات' : `%${attendanceRate}`}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {score ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-800 font-bold"><Star className="w-3 h-3 fill-current" /> {score}/5</span> : <span className="text-slate-400">لم يُقيّم بعد</span>}
                          {emp.technicalSupervisorRatedBy && <p className="text-[10px] text-slate-400 mt-1">بواسطة {emp.technicalSupervisorRatedBy}</p>}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {canPerform('edit_employee') ? <button type="button" onClick={() => { setRatingEmployeeId(emp.id); setRatingValue(String(emp.technicalSupervisorRating || 5)); setRatingNotes(emp.technicalSupervisorNotes || ''); }} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 hover:bg-slate-50 text-slate-700"><Star className="w-3.5 h-3.5" /> {score ? 'تعديل التقييم' : 'إضافة تقييم'}</button> : <span className="text-slate-400">يتطلب صلاحية</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DISCIPLINARY RECORDS (STRICTLY GATED) */}
      {activeTab === 'disciplinary' && (
        <div className="space-y-4">
          {!canViewDisciplinary ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                السجلات الانضباطية والتأديبية محمية ومقيدة الصلاحية
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                وفقاً لضوابط ديوان الخدمة المدنية وقسم المجاري ببلدية الكاظمية، يقتصر الاطلاع على السجلات السرية على مسؤول الموارد البشرية والمدير العام لحماية الخصوصية.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900">سجل التنبيهات والعقوبات الإدارية المعتمدة</span>
                  <span className="text-[11px] text-red-600 ms-2 font-mono">(سري وخاص بالموارد البشرية)</span>
                </div>
                <span className="text-xs text-slate-500">لا تصدر أية عقوبات تلقائياً</span>
              </div>

              <div className="p-4 space-y-3">
                {employees
                  .flatMap((e) => e.disciplinaryRecords.map((r) => ({ ...r, employeeName: e.fullName, empNum: e.employeeNumber })))
                  .map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-xl border border-red-200 bg-red-50/30 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900">{rec.employeeName}</span>
                          <span className="font-mono text-slate-500">({rec.empNum})</span>
                          <span className="font-mono text-[10px] text-red-700 bg-red-100 px-2 py-0.5 rounded font-bold">
                            {rec.date}
                          </span>
                        </div>
                        <div className="text-slate-800 font-medium">السبب المسجل: {rec.reason}</div>
                        <div className="text-slate-600 mt-1">الإجراء الإداري المتخذ: {rec.actionTaken}</div>
                        <div className="text-[11px] text-slate-400 mt-1 font-mono">
                          الجهة المصدرة: {rec.issuedBy}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Technical supervisor rating modal */}
      {ratingEmployeeId && (() => {
        const employee = employees.find((e) => e.id === ratingEmployeeId);
        if (!employee) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200" dir="rtl">
              <h3 className="font-bold text-base text-slate-900 mb-1 flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" /> تقييم المشرف الفني</h3>
              <p className="text-xs text-slate-500 mb-4">{employee.fullName} — احفظ تقييمًا فعليًا وملاحظات مختصرة.</p>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!canPerform('edit_employee')) { showToast('لا تملك صلاحية إدخال التقييم الفني.', 'error'); return; }
                updateEmployee(employee.id, { technicalSupervisorRating: Number(ratingValue), technicalSupervisorNotes: ratingNotes.trim(), technicalSupervisorRatedBy: currentUser.name, technicalSupervisorRatedAt: new Date().toISOString() });
                setRatingEmployeeId(null);
              }} className="space-y-3 text-xs">
                <label className="block font-semibold text-slate-800">التقييم من 1 إلى 5 نجوم</label>
                <select value={ratingValue} onChange={(e) => setRatingValue(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg">
                  <option value="5">5 — ممتاز</option><option value="4">4 — جيد جدًا</option><option value="3">3 — جيد</option><option value="2">2 — يحتاج إلى تحسين</option><option value="1">1 — غير مرضٍ</option>
                </select>
                <label className="block font-semibold text-slate-800">ملاحظات المشرف الفني</label>
                <textarea value={ratingNotes} onChange={(e) => setRatingNotes(e.target.value)} rows={4} maxLength={1000} placeholder="اكتب ملاحظات مرتبطة بالأداء أو السلامة أو جودة إنجاز العمل..." className="w-full p-2.5 border border-slate-300 rounded-lg" />
                <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setRatingEmployeeId(null)} className="px-4 py-2 rounded-lg border border-slate-200">إلغاء</button><button type="submit" className="px-4 py-2 rounded-lg bg-teal-700 text-white font-semibold">حفظ التقييم</button></div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Employee work-order details and assignment */}
      {ordersEmployeeId && (() => {
        const employee = employees.find((e) => e.id === ordersEmployeeId);
        if (!employee) return null;
        const linkedOrders = workOrders.filter((order) => (order.assignedEmployeeIds || []).includes(employee.id));
        const doneOrders = linkedOrders.filter((order) => order.status === 'verified');
        const statusLabels: Record<string, string> = { new: 'جديد', reviewed: 'تمت المراجعة', assigned: 'مُسند', accepted: 'مقبول', en_route: 'في الطريق', on_site: 'في الموقع', in_progress: 'قيد التنفيذ', awaiting_materials: 'بانتظار المواد', completed: 'منجز', verified: 'منجز ومُدقّق', cancelled: 'ملغى' };
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl border border-slate-200" dir="rtl">
              <div className="flex items-start justify-between gap-3 mb-4"><div><h3 className="font-bold text-base text-slate-900 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-teal-700" /> أوامر العمل — {employee.fullName}</h3><p className="text-xs text-slate-500 mt-1">{doneOrders.length} منجز ومدقّق من أصل {linkedOrders.length} أمر مرتبط بهذا الموظف.</p></div><button onClick={() => setOrdersEmployeeId(null)} className="p-2 rounded-lg hover:bg-slate-100" aria-label="إغلاق"><X className="w-4 h-4" /></button></div>
              <div className="space-y-2 mb-5">
                {linkedOrders.length === 0 ? <div className="p-6 text-center rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm">لا توجد أوامر عمل مرتبطة بهذا الموظف بعد. يمكنك ربط أمر من القائمة أدناه.</div> : linkedOrders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-slate-200 p-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div><div className="font-bold text-sm text-slate-900">{order.ticketNumber} — {order.title}</div><div className="text-xs text-slate-500 mt-1">{order.area} · {order.createdAt}</div>{order.completionNotes && <div className="text-xs text-slate-600 mt-1">ملاحظات الإنجاز: {order.completionNotes}</div>}</div>
                    <div className="flex items-center gap-2"><span className={`text-xs font-bold rounded-full px-2.5 py-1 ${order.status === 'verified' ? 'bg-emerald-50 text-emerald-700' : order.status === 'cancelled' ? 'bg-red-50 text-red-700' : order.status === 'completed' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{statusLabels[order.status] || order.status}</span><span className="text-[11px] text-slate-500">{order.actualHours != null ? `${order.actualHours} ساعة` : 'المدة غير مسجلة'}</span></div>
                  </div>
                ))}
              </div>
              {canPerform('edit_work_order') && <form onSubmit={(e) => { e.preventDefault(); if (!assignOrderId) return; const order = workOrders.find((o) => o.id === assignOrderId); if (!order) return; const ids = order.assignedEmployeeIds || []; if (ids.includes(employee.id)) { showToast('هذا الموظف مرتبط بأمر العمل بالفعل.', 'info'); return; } updateWorkOrder(order.id, { assignedEmployeeIds: [...ids, employee.id] }); setAssignOrderId(''); }} className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex flex-col sm:flex-row gap-2 sm:items-end">
                <div className="flex-1"><label className="block text-xs font-semibold mb-1">ربط أمر عمل بهذا الموظف</label><select value={assignOrderId} onChange={(e) => setAssignOrderId(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"><option value="">اختر أمر عمل...</option>{workOrders.filter((o) => !(o.assignedEmployeeIds || []).includes(employee.id)).map((o) => <option key={o.id} value={o.id}>{o.ticketNumber} — {o.title} ({statusLabels[o.status] || o.status})</option>)}</select></div><button type="submit" disabled={!assignOrderId} className="px-4 py-2.5 rounded-lg bg-teal-700 text-white font-semibold disabled:opacity-40">ربط الأمر</button>
              </form>}
              {!canPerform('edit_work_order') && <p className="text-[11px] text-slate-500">عرض فقط. ربط أوامر العمل يتطلب صلاحية تعديل أوامر العمل.</p>}
              <div className="flex justify-end mt-4"><button onClick={() => setOrdersEmployeeId(null)} className="px-4 py-2 rounded-lg border border-slate-200">إغلاق</button></div>
            </div>
          </div>
        );
      })()}

      {/* Add Disciplinary Modal */}
      {showAddDiscModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-red-700 mb-1 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              <span>إدراج تنبيه إداري في السجل السري</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              إجراء يدوي خاضع للمصادقة الرقابية وقانون انضباط موظفي الدولة.
            </p>

            <form onSubmit={handleDiscSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">الموظف المعني: *</label>
                <select
                  value={discForm.employeeId}
                  onChange={(e) => setDiscForm({ ...discForm, employeeId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">نوع الإجراء الإداري:</label>
                <select
                  value={discForm.actionTaken}
                  onChange={(e) => setDiscForm({ ...discForm, actionTaken: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="تنبيه إداري مسجل أول">تنبيه إداري مسجل أول</option>
                  <option value="إنذار إداري خطي">إنذار إداري خطي</option>
                  <option value="لفت نظر رسمي">لفت نظر رسمي</option>
                  <option value="توجيه شفوي موثق">توجيه شفوي موثق</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">السبب والحيثيات المثبتة: *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="بيان الواقعة، التاريخ، وعدم الامتثال للتوجيهات التشغيلية..."
                  value={discForm.reason}
                  onChange={(e) => setDiscForm({ ...discForm, reason: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDiscModal(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-lg font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold"
                >
                  تثبيت القيد رسمياً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
