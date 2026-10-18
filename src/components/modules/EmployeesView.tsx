import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, UserRole, EmployeeStatus } from '../../types';
import {
  Users,
  Search,
  Plus,
  Filter,
  User,
  Phone,
  Mail,
  Shield,
  Briefcase,
  Calendar,
  CheckCircle2,
  X,
  Lock,
  Award,
  AlertTriangle,
  Trash2,
} from 'lucide-react';

export const EmployeesView: React.FC = () => {
  const { employees, createEmployee, updateEmployee, archiveEmployee, language, currentUser, canPerform, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const canViewConfidential = currentUser.role === 'hr_officer' || currentUser.role === 'super_admin';

  const [newEmpForm, setNewEmpForm] = useState({
    employeeNumber: `EMP-KADH-${employees.length + 109}`,
    fullName: '',
    role: 'driver_worker' as UserRole,
    jobTitle: '',
    department: 'شعبة التشغيل الميداني',
    supervisorName: 'حسين فاضل العبيدي',
    phone: '',
    email: '',
    status: 'active' as EmployeeStatus,
    qualifications: '',
    assignedShiftId: 'shift-morning',
    nationalIdMasked: '1985-****-9921',
    joinDate: new Date().toISOString().substring(0, 10),
    emergencyContact: '',
    confidentialNotes: '',
  });

  const activeEmployees = employees.filter(emp => !emp.archived);
  const filteredEmployees = activeEmployees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const statusLabels: Record<EmployeeStatus, { ar: string; en: string; class: string }> = {
    active: { ar: 'نشط بالخدمة', en: 'Active', class: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
    on_leave: { ar: 'إجازة رسمية', en: 'On Leave', class: 'bg-amber-50 text-amber-800 border-amber-300' },
    seconded: { ar: 'تنسيب / إعارة', en: 'Seconded', class: 'bg-blue-50 text-blue-800 border-blue-300' },
    suspended: { ar: 'موقوف إدارياً', en: 'Suspended', class: 'bg-red-50 text-red-800 border-red-300' },
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpForm.fullName || !newEmpForm.jobTitle) {
      showToast('يرجى ملء الاسم الكامل والمسمى الوظيفي للموظف.', 'warning');
      return;
    }
    createEmployee(newEmpForm);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <span>{language === 'ar' ? 'إدارة الكادر البشري وشؤون الموظفين' : 'Staff Directory & Personnel'}</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold tabular-nums">
              {activeEmployees.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar'
              ? 'المهندسون، الفنيون، سائقو الآليات التخصصية، ومسؤولو وجبات التشغيل'
              : 'Municipal engineers, maintenance technicians, heavy drivers, and dispatchers'}
          </p>
        </div>

        {canPerform('create_employee') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إضافة موظف جديد' : 'Add Employee'}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute top-2.5 start-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'البحث بالاسم، الرقم الوظيفي، أو المسمى...' : 'Search employees...'}
            className="w-full ps-9 pe-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-600 bg-slate-50 focus:bg-white"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="text-xs py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-teal-600"
        >
          <option value="all">كافة الشعب والأقسام</option>
          <option value="إدارة المحطة والعمليات الهندسية">إدارة المحطة</option>
          <option value="شعبة التشغيل الميداني">شعبة التشغيل الميداني</option>
          <option value="شعبة الصيانة الكهروميكانيكية">شعبة الصيانة</option>
          <option value="شعبة الآليات والخدمة الميدانية">شعبة الآليات</option>
          <option value="غرفة السيطرة والاتصالات">غرفة السيطرة</option>
          <option value="شعبة الموارد البشرية والتدريب">الموارد البشرية</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-teal-600"
        >
          <option value="all">كافة الحالات</option>
          <option value="active">نشط بالخدمة</option>
          <option value="on_leave">إجازة رسمية</option>
        </select>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4">الرقم الوظيفي</th>
                <th className="py-3 px-4">اسم الموظف</th>
                <th className="py-3 px-4">المسمى الوظيفي</th>
                <th className="py-3 px-4">الشعبة / الدائرة</th>
                <th className="py-3 px-4">الهاتف</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">نسبة الحضور</th>
                <th className="py-3 px-4">المهام المنجزة</th>
                <th className="py-3 px-4 text-center">الملف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {emp.employeeNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{emp.fullName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {emp.nationalIdMasked}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{emp.jobTitle}</td>
                  <td className="py-3 px-4 text-slate-600">{emp.department}</td>
                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">{emp.phone}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${statusLabels[emp.status].class}`}>
                      {statusLabels[emp.status].ar}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap tabular-nums">
                    %{emp.attendanceRatePercent}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap tabular-nums">
                    {emp.completedWorkOrdersCount} أمر
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmployee(emp);
                      }}
                      className="px-2.5 py-1 text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 rounded font-medium"
                    >
                      عرض الملف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-teal-400 text-xs font-bold">
                  {selectedEmployee.employeeNumber}
                </span>
                <h3 className="font-bold text-base text-white mt-0.5">
                  {selectedEmployee.fullName}
                </h3>
                <p className="text-xs text-slate-300">{selectedEmployee.jobTitle}</p>
              </div>
              <button onClick={() => setSelectedEmployee(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Core Details Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block mb-0.5">الشعبة التابع لها:</span>
                  <span className="font-semibold text-slate-900">{selectedEmployee.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">المسؤول المباشر:</span>
                  <span className="font-semibold text-slate-900">{selectedEmployee.supervisorName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">رقم هاتف التواصل:</span>
                  <span className="font-mono font-semibold text-slate-900">{selectedEmployee.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">جهة اتصال الطوارئ:</span>
                  <span className="font-semibold text-slate-900">{selectedEmployee.emergencyContact}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">تاريخ التعيين / المباشرة:</span>
                  <span className="font-mono text-slate-800">{selectedEmployee.joinDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">الرقم الوطني / الهوية:</span>
                  <span className="font-mono text-slate-800">{selectedEmployee.nationalIdMasked}</span>
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">المؤهلات والشهادات المهنية:</h4>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700">
                  {selectedEmployee.qualifications}
                </div>
              </div>

              {/* Gated Confidential Notes and Disciplinary Section */}
              <div className="pt-2">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-teal-600" />
                  <span>الملف الإداري السري والعقوبات:</span>
                </h4>

                {canViewConfidential ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900">
                      <div className="font-bold mb-0.5">ملاحظات الذاتية والموارد البشرية:</div>
                      <div className="text-xs">{selectedEmployee.confidentialNotes || 'لا توجد ملاحظات سرية مدونة.'}</div>
                    </div>

                    {selectedEmployee.disciplinaryRecords.length > 0 ? (
                      <div className="space-y-1.5">
                        <div className="font-bold text-red-900 text-xs">سجل التنبيهات والعقوبات الإدارية:</div>
                        {selectedEmployee.disciplinaryRecords.map((d) => (
                          <div key={d.id} className="p-2.5 bg-red-50 rounded-lg border border-red-200 text-red-900">
                            <div className="flex justify-between font-mono text-[10px] text-red-700">
                              <span>التاريخ: {d.date}</span>
                              <span>الجهة المصدرة: {d.issuedBy}</span>
                            </div>
                            <div className="font-bold mt-1 text-xs">{d.reason}</div>
                            <div className="text-[11px] text-red-800 mt-0.5">الإجراء: {d.actionTaken}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-500 italic text-[11px]">
                        السجل الإداري نظيف - لا توجد أية عقوبات أو تنبيهات مسجلة بحقه.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-500 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      الملاحظات الإدارية والسجلات التأديبية محجوبة بحكم ضوابط الخصوصية (تتطلب صلاحية مسؤول الموارد البشرية أو مدير النظام).
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between gap-2">
              {canPerform('archive_employee') && <button type="button" className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200" onClick={() => {
                if (window.confirm(`هل تريد إزالة الموظف ${selectedEmployee.fullName} من القائمة النشطة؟ ستُحفظ سجلاته السابقة.`)) {
                  if (archiveEmployee(selectedEmployee.id)) setSelectedEmployee(null);
                }
              }}><Trash2 className="w-4 h-4"/> حذف / أرشفة الموظف</button>}

              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                <span>إضافة موظف جديد إلى ملاك المحطة</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">الاسم الثلاثي واللقب: *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حيدر كريم العتابي"
                  value={newEmpForm.fullName}
                  onChange={(e) => setNewEmpForm({ ...newEmpForm, fullName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">المسمى الوظيفي: *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: فني صيانة مضخات"
                    value={newEmpForm.jobTitle}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, jobTitle: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">الشعبة / الدائرة:</label>
                  <select
                    value={newEmpForm.department}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, department: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="شعبة التشغيل الميداني">شعبة التشغيل الميداني</option>
                    <option value="شعبة الصيانة الكهروميكانيكية">شعبة الصيانة الكهروميكانيكية</option>
                    <option value="شعبة الآليات والخدمة الميدانية">شعبة الآليات</option>
                    <option value="غرفة السيطرة والاتصالات">غرفة السيطرة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">رقم الهاتف:</label>
                  <input
                    type="text"
                    placeholder="077XXXXXXXX"
                    value={newEmpForm.phone}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">الرقم الوطني المقنع:</label>
                  <input
                    type="text"
                    value={newEmpForm.nationalIdMasked}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, nationalIdMasked: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">المؤهلات والخبرات:</label>
                <textarea
                  rows={2}
                  placeholder="التحصيل الدراسي، سنوات الخبرة، الدورات المعتمدة..."
                  value={newEmpForm.qualifications}
                  onChange={(e) => setNewEmpForm({ ...newEmpForm, qualifications: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
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
                  تسجيل الموظف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
