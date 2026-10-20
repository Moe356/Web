import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  WorkOrder,
  TicketPriority,
  TicketStatus,
  TicketType,
} from '../../types';
import {
  Search,
  Filter,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  X,
  MapPin,
  Phone,
  User,
  Truck,
  ArrowRight,
  Shield,
  FileText,
  Calendar,
  AlertCircle,
  Lock,
} from 'lucide-react';

export const OperationsView: React.FC = () => {
  const {
    workOrders,
    createWorkOrder,
    updateWorkOrderStatus,
    updateWorkOrder,
    selectedTicketId,
    setSelectedTicketId,
    vehicles,
    employees,
    language,
    currentUser,
    canPerform,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>('all');

  const [activeTicket, setActiveTicket] = useState<WorkOrder | null>(null);
  const [editAssignment, setEditAssignment] = useState<{ assignedTeam: string; assignedVehicleId: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionNotesInput, setCompletionNotesInput] = useState('');
  const [statusTransitionNote, setStatusTransitionNote] = useState('');

  // Form State for creating new work order
  const [newOrderForm, setNewOrderForm] = useState({
    title: '',
    type: 'sewage_overflow' as TicketType,
    description: '',
    governorate: 'بغداد',
    area: 'الكرخ - بلدية الكاظمية',
    neighborhood: 'الكاظمية القديمة',
    street: '',
    landmark: '',
    priority: 'normal' as TicketPriority,
    reporterName: '',
    reporterPhone: '',
    assignedTeam: 'فريق الطوارئ الميداني (أ)',
    assignedVehicleId: '',
    assignedEmployeeIds: [] as string[],
    supervisorId: 'usr-3',
    dueDate: '',
  });

  // Sync active ticket when selected from outside (e.g. Dashboard)
  useEffect(() => {
    if (selectedTicketId) {
      const target = workOrders.find((w) => w.id === selectedTicketId);
      if (target) {
        setActiveTicket(target);
      }
    }
  }, [selectedTicketId, workOrders]);

  // Available vehicles for assignment (must not be out of service!)
  const assignableVehicles = vehicles.filter((v) => v.availability !== 'out_of_service');
  const neighborhoods = [...new Set(workOrders.map(order => order.neighborhood.trim()).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'ar'));

  // Filtered orders
  const filteredOrders = workOrders.filter((wo) => {
    const matchesSearch =
      wo.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;
    const matchesNeighborhood = neighborhoodFilter === 'all' || wo.neighborhood === neighborhoodFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesNeighborhood;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderForm.title || !newOrderForm.street) {
      showToast('يرجى ملء عنوان البلاغ وتفاصيل الشارع والموقع.', 'warning');
      return;
    }

    createWorkOrder({
      ...newOrderForm,
      status: 'new',
    });

    setShowCreateModal(false);
    setNewOrderForm({
      title: '',
      type: 'sewage_overflow',
      description: '',
      governorate: 'بغداد',
      area: 'الكرخ - بلدية الكاظمية',
      neighborhood: 'الكاظمية القديمة',
      street: '',
      landmark: '',
      priority: 'normal',
      reporterName: '',
      reporterPhone: '',
      assignedTeam: 'فريق الطوارئ الميداني (أ)',
      assignedVehicleId: '',
      assignedEmployeeIds: [],
      supervisorId: 'usr-3',
      dueDate: '',
    });
  };

  const executeStatusChange = (newStatus: TicketStatus) => {
    if (!activeTicket) return;

    if (newStatus === 'cancelled') {
      setShowCancelModal(true);
      return;
    }

    if (newStatus === 'completed') {
      setShowCompleteModal(true);
      return;
    }

    const success = updateWorkOrderStatus(activeTicket.id, newStatus, statusTransitionNote);
    if (success) {
      setStatusTransitionNote('');
      const updated = workOrders.find((w) => w.id === activeTicket.id);
      if (updated) setActiveTicket(updated);
    }
  };

  const handleConfirmCancel = () => {
    if (!activeTicket) return;
    if (!cancelReasonInput || cancelReasonInput.trim().length < 5) {
      showToast('يجب إدخال سبب رسمي ومبرر واضح لإلغاء البلاغ.', 'warning');
      return;
    }
    const success = updateWorkOrderStatus(
      activeTicket.id,
      'cancelled',
      undefined,
      undefined,
      cancelReasonInput
    );
    if (success) {
      setShowCancelModal(false);
      setCancelReasonInput('');
      const updated = workOrders.find((w) => w.id === activeTicket.id);
      if (updated) setActiveTicket(updated);
    }
  };

  const handleConfirmComplete = () => {
    if (!activeTicket) return;
    if (!completionNotesInput || completionNotesInput.trim().length < 5) {
      showToast('يجب تسجيل تفاصيل وملاحظات الإنجاز الفني والميداني.', 'warning');
      return;
    }
    const success = updateWorkOrderStatus(
      activeTicket.id,
      'completed',
      undefined,
      completionNotesInput
    );
    if (success) {
      setShowCompleteModal(false);
      setCompletionNotesInput('');
      const updated = workOrders.find((w) => w.id === activeTicket.id);
      if (updated) setActiveTicket(updated);
    }
  };

  const priorityLabels = {
    urgent: { ar: 'طارئ جداً', en: 'Urgent', class: 'bg-red-100 text-red-800 border-red-200' },
    high: { ar: 'أولوية عالية', en: 'High', class: 'bg-amber-100 text-amber-800 border-amber-200' },
    normal: { ar: 'أولوية عادية', en: 'Normal', class: 'bg-blue-100 text-blue-800 border-blue-200' },
    low: { ar: 'منخفضة', en: 'Low', class: 'bg-slate-100 text-slate-700 border-slate-200' },
  };

  const statusLabels: Record<TicketStatus, { ar: string; en: string; class: string }> = {
    new: { ar: 'جديد', en: 'New', class: 'bg-slate-100 text-slate-800 border-slate-300' },
    reviewed: { ar: 'قيد المراجعة', en: 'Reviewed', class: 'bg-blue-50 text-blue-800 border-blue-200' },
    assigned: { ar: 'تم التكليف', en: 'Assigned', class: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    accepted: { ar: 'قيد القبول', en: 'Accepted', class: 'bg-purple-50 text-purple-800 border-purple-200' },
    en_route: { ar: 'في الطريق', en: 'En Route', class: 'bg-amber-50 text-amber-800 border-amber-200' },
    on_site: { ar: 'في الموقع', en: 'On Site', class: 'bg-teal-50 text-teal-800 border-teal-200' },
    in_progress: { ar: 'قيد التنفيذ', en: 'In Progress', class: 'bg-sky-100 text-sky-800 border-sky-300' },
    awaiting_materials: { ar: 'بانتظار مواد', en: 'Awaiting Materials', class: 'bg-orange-100 text-orange-800 border-orange-300' },
    completed: { ar: 'مكتمل ميدانياً', en: 'Completed', class: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    verified: { ar: 'منجز ومدقق', en: 'Verified & Closed', class: 'bg-green-200 text-green-900 border-green-400 font-bold' },
    cancelled: { ar: 'ملغي', en: 'Cancelled', class: 'bg-red-50 text-red-700 border-red-200' },
  };

  const typeLabels: Record<TicketType, string> = {
    sewage_overflow: 'طَفَح مياه مجاري',
    blocked_sewer: 'انسداد خط رئيسي / منهول',
    network_cleaning: 'تنظيف وغسيل شبكة',
    suction_service: 'خدمة سحب شافطة تخصصية',
    jetting_service: 'تسليك وضخ صاروخي عالي الضغط',
    pump_failure: 'عطل مضخة رفع / غطاس',
    emergency_maintenance: 'صيانة طارئة للمحطة',
    inspection: 'فحص ومعاينة كاميرا تلفزيونية',
    other: 'بلاغ خدمي آخر',
  };

  return (
    <div className="space-y-5">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{language === 'ar' ? 'أوامر العمل وبلاغات الصرف الصحي' : 'Work Orders & Sewage Complaints'}</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold tabular-nums">
              {filteredOrders.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar'
              ? 'متابعة البلاغات، التكليف الميداني، توثيق مراحل التنفيذ، وإغلاق أوامر العمل'
              : 'Track, assign, prioritize, and log ticket status transitions'}
          </p>
        </div>

        {currentUser.role === 'normal_user' ? (
          <button
            onClick={() => showToast('حساب مستخدم عادي: للمشاهدة فقط. صلاحية إنشاء وتعديل أوامر العمل مخصصة لمدير النظام العام (Administrator).', 'warning')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs font-semibold shadow-xs transition-colors self-start sm:self-center cursor-pointer"
            title="مقفلة للمستخدم العادي (مشاهدة فقط)"
          >
            <Lock className="w-4 h-4 text-slate-500" />
            <span>{language === 'ar' ? 'إنشاء أمر عمل (مقفلة للمستخدم العادي)' : 'New Ticket (Locked)'}</span>
          </button>
        ) : (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-center cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إنشاء أمر عمل جديد' : 'New Work Order'}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute top-2.5 start-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'البحث برقم البلاغ، العنوان، الشارع أو المحلة...' : 'Search by ticket#, title, street...'}
              className="w-full ps-9 pe-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-600 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-teal-600"
          >
            <option value="all">{language === 'ar' ? 'كافة الحالات' : 'All Statuses'}</option>
            <option value="new">جديد</option>
            <option value="assigned">تم التكليف</option>
            <option value="en_route">في الطريق</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="awaiting_materials">بانتظار مواد</option>
            <option value="completed">مكتمل</option>
            <option value="verified">معتمد ومغلق</option>
            <option value="cancelled">ملغي</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-teal-600"
          >
            <option value="all">{language === 'ar' ? 'كافة الأولويات' : 'All Priorities'}</option>
            <option value="urgent">طارئ جداً (Urgent)</option>
            <option value="high">عالية (High)</option>
            <option value="normal">عادية (Normal)</option>
            <option value="low">منخفضة (Low)</option>
          </select>

          {/* Neighborhood Filter */}
          <select
            value={neighborhoodFilter}
            onChange={(e) => setNeighborhoodFilter(e.target.value)}
            className="text-xs py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-teal-600"
          >
            <option value="all">{language === 'ar' ? 'كافة المناطق / المحلات' : 'All Neighborhoods'}</option>
            {neighborhoods.map(area => <option key={area} value={area}>{area}</option>)}
          </select>
        </div>
      </div>

      {/* Main Work Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4">{language === 'ar' ? 'رقم البلاغ' : 'Ticket #'}</th>
                <th className="py-3 px-4">{language === 'ar' ? 'نوع البلاغ والعنوان' : 'Type & Title'}</th>
                <th className="py-3 px-4">{language === 'ar' ? 'الموقع والقاطع' : 'Location'}</th>
                <th className="py-3 px-4">{language === 'ar' ? 'الأولوية' : 'Priority'}</th>
                <th className="py-3 px-4">{language === 'ar' ? 'الفريق والآلية' : 'Assigned Team/Fleet'}</th>
                <th className="py-3 px-4">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4">{language === 'ar' ? 'وقت التسجيل' : 'Created At'}</th>
                <th className="py-3 px-4 text-center">{language === 'ar' ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    {language === 'ar' ? 'لا توجد بلاغات تطابق معايير البحث الحالية.' : 'No matching tickets found.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((wo) => {
                  const assignedVehicle = vehicles.find((v) => v.id === wo.assignedVehicleId);

                  return (
                    <tr
                      key={wo.id}
                      onClick={() => setActiveTicket(wo)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        activeTicket?.id === wo.id ? 'bg-teal-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {wo.ticketNumber}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">{wo.title}</div>
                        <div className="text-[11px] text-teal-800 font-medium">
                          {typeLabels[wo.type] || wo.type}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-medium text-slate-900">{wo.neighborhood}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{wo.street}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${priorityLabels[wo.priority].class}`}>
                          {language === 'ar' ? priorityLabels[wo.priority].ar : priorityLabels[wo.priority].en}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-medium">{wo.assignedTeam || '—'}</div>
                        {assignedVehicle && (
                          <div className="text-[11px] text-slate-500 font-mono">
                            {assignedVehicle.assetNumber}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-medium border ${statusLabels[wo.status].class}`}>
                          {language === 'ar' ? statusLabels[wo.status].ar : statusLabels[wo.status].en}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {wo.createdAt}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTicket(wo);
                          }}
                          className="px-2.5 py-1 rounded-md text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
                        >
                          {language === 'ar' ? 'التفاصيل' : 'Details'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Work Order Drawer / Modal */}
      {activeTicket && (
        <div className="work-order-print-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="print-document work-order-print bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-teal-400 font-bold text-sm">
                    {activeTicket.ticketNumber}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${priorityLabels[activeTicket.priority].class}`}>
                    {language === 'ar' ? priorityLabels[activeTicket.priority].ar : priorityLabels[activeTicket.priority].en}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${statusLabels[activeTicket.status].class}`}>
                    {language === 'ar' ? statusLabels[activeTicket.status].ar : statusLabels[activeTicket.status].en}
                  </span>
                </div>
                <h3 className="font-bold text-base mt-1 text-slate-100">
                  {activeTicket.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1"
                  title="طباعة قسيمة العمل"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === 'ar' ? 'طباعة' : 'Print'}</span>
                </button>
                <button
                  onClick={() => {setActiveTicket(null);setEditAssignment(null);}}
                  className="p-1 text-slate-400 hover:text-white rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Basic Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-slate-500 mb-1 font-medium">{language === 'ar' ? 'الموقع والعنوان الدقيق:' : 'Exact Location:'}</div>
                  <div className="font-semibold text-slate-900 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      {activeTicket.neighborhood} · {activeTicket.street}
                      {activeTicket.landmark && (
                        <div className="text-[11px] text-slate-500 font-normal">
                          نقطة دالة: {activeTicket.landmark}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 mb-1 font-medium">{language === 'ar' ? 'بيانات المبلّغ والتواصل:' : 'Reporter Details:'}</div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      {activeTicket.reporterName || 'مواطن / بلاغ هاتفي'}
                      {activeTicket.reporterPhone && (
                        <span className="font-mono text-slate-600 ms-2">({activeTicket.reporterPhone})</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 mb-1 font-medium">{language === 'ar' ? 'الفريق المكلف والآلية:' : 'Assigned Team & Vehicle:'}</div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{activeTicket.assignedTeam || 'غير مكلف حالياً'}</span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 mb-1 font-medium">{language === 'ar' ? 'المشرف المسؤول:' : 'Supervisor:'}</div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>حسين فاضل العبيدي (مشرف الوجبة الصباحية)</span>
                  </div>
                </div>
              </div>

              {canPerform('edit_work_order') && <div className="border border-teal-200 bg-teal-50 rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between gap-2"><strong>الفريق والآلية لهذا البلاغ</strong>
                  <button type="button" className="text-teal-800 underline" onClick={() => setEditAssignment({assignedTeam: activeTicket.assignedTeam || '', assignedVehicleId: activeTicket.assignedVehicleId || ''})}>تعديل الفريق والآلية</button>
                </div>
                {editAssignment && <div className="space-y-2">
                  <label className="block">اسم الفريق<input type="text" className="mt-1 w-full border rounded p-2" value={editAssignment.assignedTeam} onChange={e => setEditAssignment({...editAssignment, assignedTeam:e.target.value})}/></label>
                  <label className="block">الآلية<select className="mt-1 w-full border rounded p-2" value={editAssignment.assignedVehicleId} onChange={e => setEditAssignment({...editAssignment, assignedVehicleId:e.target.value})}>
                    <option value="">بدون آلية</option>{vehicles.filter(v => v.availability !== 'out_of_service' || v.id === activeTicket.assignedVehicleId).map(v => <option key={v.id} value={v.id}>{v.assetNumber} — {v.categoryNameAr}</option>)}
                  </select></label>
                  <div className="flex gap-2"><button type="button" className="bg-teal-700 text-white rounded px-3 py-2" onClick={() => {updateWorkOrder(activeTicket.id, editAssignment);setActiveTicket({...activeTicket,...editAssignment});setEditAssignment(null);}}>حفظ التكليف</button><button type="button" onClick={()=>setEditAssignment(null)}>إلغاء</button></div>
                </div>}
              </div>}

              {/* Description */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">{language === 'ar' ? 'وصف المشكلة والبلاغ:' : 'Description:'}</h4>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                  {activeTicket.description || 'لا يوجد وصف تفصيلي إضافي.'}
                </div>
              </div>

              {/* Cancellation Reason if cancelled */}
              {activeTicket.status === 'cancelled' && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-900">
                  <div className="font-bold mb-0.5">{language === 'ar' ? 'سبب إلغاء أمر العمل:' : 'Cancellation Reason:'}</div>
                  <div className="text-xs">{activeTicket.cancellationReason}</div>
                </div>
              )}

              {/* Completion Notes if completed */}
              {(activeTicket.status === 'completed' || activeTicket.status === 'verified') && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                  <div className="font-bold mb-0.5">{language === 'ar' ? 'تقرير وملاحظات الإنجاز الفني:' : 'Completion Resolution:'}</div>
                  <div className="text-xs">{activeTicket.completionNotes}</div>
                </div>
              )}

              {/* Workflow Status Progression Actions */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 mb-2">
                  {language === 'ar' ? 'تحديث وتمرير مرحلة العمل (Workflow):' : 'Advance Workflow Status:'}
                </div>

                {currentUser.role === 'normal_user' ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-center gap-2 text-xs">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{language === 'ar' ? 'تعديل وتمرير مراحل أمر العمل محجوب للمستخدم العادي (مشاهدة ومتابعة فقط). فقط مدير النظام العام (Administrator) والكوادر المشرفة يمتلكون صلاحية التعديل والتمرير.' : 'Workflow stage transitions are locked for normal users (view-only). Only administrators and supervisors can advance tickets.'}</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {activeTicket.status === 'new' && (
                      <button
                        onClick={() => executeStatusChange('reviewed')}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-medium cursor-pointer"
                      >
                        مراجعة وتأكيد البلاغ
                      </button>
                    )}

                    {['new', 'reviewed'].includes(activeTicket.status) && (
                      <button
                        onClick={() => executeStatusChange('assigned')}
                        className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg font-medium cursor-pointer"
                      >
                        تكليف الفريق والآلية
                      </button>
                    )}

                    {activeTicket.status === 'assigned' && (
                      <button
                        onClick={() => executeStatusChange('en_route')}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium cursor-pointer"
                      >
                        تحرك الفريق للموقع (في الطريق)
                      </button>
                    )}

                    {activeTicket.status === 'en_route' && (
                      <button
                        onClick={() => executeStatusChange('on_site')}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium cursor-pointer"
                      >
                        تأكيد وصول الفريق (في الموقع)
                      </button>
                    )}

                    {['on_site', 'assigned'].includes(activeTicket.status) && (
                      <button
                        onClick={() => executeStatusChange('in_progress')}
                        className="px-3 py-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded-lg font-medium cursor-pointer"
                      >
                        مباشرة العمل (قيد التنفيذ)
                      </button>
                    )}

                    {activeTicket.status === 'in_progress' && (
                      <button
                        onClick={() => executeStatusChange('awaiting_materials')}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium cursor-pointer"
                      >
                        بانتظار مواد / قطع غيار
                      </button>
                    )}

                    {['in_progress', 'awaiting_materials', 'on_site'].includes(activeTicket.status) && (
                      <button
                        onClick={() => executeStatusChange('completed')}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-medium cursor-pointer"
                      >
                        إتمام العمل وتسجيل تقرير الإنجاز
                      </button>
                    )}

                    {activeTicket.status === 'completed' && (
                      <button
                        onClick={() => executeStatusChange('verified')}
                        className="px-3 py-1.5 bg-green-800 hover:bg-green-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                      >
                        تدقيق واعتماد الإنجاز
                      </button>
                    )}

                    {activeTicket.status !== 'verified' && activeTicket.status !== 'cancelled' && (
                      <button
                        onClick={() => executeStatusChange('cancelled')}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 border border-red-200 rounded-lg font-medium cursor-pointer"
                      >
                        إلغاء أمر العمل (بسبب رسمي)
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Status History Audit Timeline */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>{language === 'ar' ? 'سجل تتبع وتدقيق المراحل الميدانية:' : 'Status Audit Timeline:'}</span>
                </h4>

                <div className="space-y-2 border-s-2 border-teal-500/30 ms-2 ps-4">
                  {activeTicket.statusHistory.map((entry, index) => (
                    <div key={index} className="relative text-xs">
                      <div className="absolute -start-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-teal-600 ring-2 ring-white" />
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {statusLabels[entry.status]?.ar || entry.status}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {entry.timestamp}
                        </span>
                      </div>
                      <div className="text-slate-600 mt-0.5">
                        <span className="font-medium text-slate-800">{entry.actor}</span> ({entry.role})
                      </div>
                      {entry.note && (
                        <div className="text-[11px] text-slate-500 italic mt-0.5 bg-slate-50 p-1.5 rounded border border-slate-100">
                          «{entry.note}»
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => {setActiveTicket(null);setEditAssignment(null);}}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium text-xs"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Dialog (Reason Mandatory) */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>إلغاء أمر العمل رقم {activeTicket?.ticketNumber}</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              يتطلب النظام تسجيل مبرر رسمي واضح للإلغاء في السجل الرقابي للمحطة.
            </p>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                سبب الإلغاء الرسمي: <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
                placeholder="مثال: بلاغ مكرر، عدم اختصاص دائرة المجاري، تم الحل بمعرفة المواطن..."
                rows={3}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:border-red-500 focus:outline-hidden"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg"
              >
                تراجع
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg"
              >
                تأكيد الإلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Dialog (Resolution Notes Mandatory) */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>إتمام أمر العمل {activeTicket?.ticketNumber}</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              سجل تفاصيل وملاحظات العمل الميداني والحل المطبق لغايات الأرشفة والتقييم.
            </p>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                تفاصيل الإنجاز الفني: <span className="text-emerald-500">*</span>
              </label>
              <textarea
                value={completionNotesInput}
                onChange={(e) => setCompletionNotesInput(e.target.value)}
                placeholder="مثال: تم سحب 24 م³ من المياه، تنظيف المنهول بالضغط العالي، والتأكد من انسيابية الجريان..."
                rows={3}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg"
              >
                تراجع
              </button>
              <button
                onClick={handleConfirmComplete}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg"
              >
                تأكيد الإنجاز
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Work Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Plus className="w-5 h-5 text-teal-400" />
                  <span>{language === 'ar' ? 'تسجيل أمر عمل / بلاغ جديد' : 'New Work Order Ticket'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  قسم المجاري – بلدية الكاظمية المقدسة
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Type and Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    {language === 'ar' ? 'نوع البلاغ:' : 'Ticket Type:'}
                  </label>
                  <select
                    value={newOrderForm.type}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, type: e.target.value as TicketType })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="sewage_overflow">طَفَح مياه مجاري</option>
                    <option value="blocked_sewer">انسداد خط رئيسي / منهول</option>
                    <option value="network_cleaning">تنظيف وغسيل شبكة</option>
                    <option value="suction_service">خدمة سحب شافطة تخصصية</option>
                    <option value="jetting_service">تسليك ونفث صاروخي</option>
                    <option value="pump_failure">عطل مضخة رفع / غطاس</option>
                    <option value="emergency_maintenance">صيانة طارئة</option>
                    <option value="inspection">معاينة وفحص</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    {language === 'ar' ? 'درجة الأولوية:' : 'Priority:'}
                  </label>
                  <select
                    value={newOrderForm.priority}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, priority: e.target.value as TicketPriority })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="urgent">طارئ جداً (Urgent)</option>
                    <option value="high">أولوية عالية (High)</option>
                    <option value="normal">عادية (Normal)</option>
                    <option value="low">منخفضة (Low)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">الموعد المتوقع لإنجاز العمل (اختياري)</label>
                <input type="datetime-local" value={newOrderForm.dueDate} onChange={(e) => setNewOrderForm({ ...newOrderForm, dueDate: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                <p className="mt-1 text-[11px] text-slate-500">يُستخدم هذا الموعد لإظهار الأوامر المتأخرة في مركز التوزيع.</p>
              </div>

              {/* Title */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {language === 'ar' ? 'عنوان البلاغ الموجز:' : 'Title:'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: طفح خط مجاري قرب تقاطع شارع النواب"
                  value={newOrderForm.title}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Neighborhood and Street */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    {language === 'ar' ? 'المنطقة / المحلة:' : 'Neighborhood:'}
                  </label>
                  <input type="text" value={newOrderForm.neighborhood}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, neighborhood: e.target.value })}
                    placeholder="اكتب المنطقة / المحلة" required
                    className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    {language === 'ar' ? 'الشارع / الزقاق:' : 'Street / Alley:'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: زقاق 14، مقابل جامع الهاشمي"
                    value={newOrderForm.street}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, street: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Landmark */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {language === 'ar' ? 'النقطة الدالة:' : 'Landmark:'}
                </label>
                <input
                  type="text"
                  placeholder="مثال: قرب مدرسة الإمام الصادق أو مجمع القادسية"
                  value={newOrderForm.landmark}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, landmark: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {language === 'ar' ? 'الوصف الفني والتفاصيل:' : 'Detailed Description:'}
                </label>
                <textarea
                  rows={2}
                  placeholder="تفاصيل الانسداد، عمق المياه، أو أية معوقات وصول..."
                  value={newOrderForm.description}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Reporter Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    {language === 'ar' ? 'اسم صاحب البلاغ:' : 'Reporter Name:'}
                  </label>
                  <input
                    type="text"
                    placeholder="اسم المواطن أو الجهة المبلّغة"
                    value={newOrderForm.reporterName}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, reporterName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    {language === 'ar' ? 'رقم هاتف التواصل:' : 'Phone Number:'}
                  </label>
                  <input
                    type="text"
                    placeholder="07XXXXXXXXX"
                    value={newOrderForm.reporterPhone}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, reporterPhone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">اسم الفريق المكلف (قابل للتعديل لكل بلاغ):</label>
                <input type="text" value={newOrderForm.assignedTeam} onChange={e => setNewOrderForm({...newOrderForm, assignedTeam: e.target.value})} placeholder="أدخل اسم الفريق" className="w-full p-2 border border-slate-300 rounded-lg" />
              </div>

              {/* Assigned Vehicle (Enforcing out of service prevention!) */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {language === 'ar' ? 'تكليف آلية من الأسطول (اختياري):' : 'Assign Vehicle:'}
                </label>
                <select
                  value={newOrderForm.assignedVehicleId}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, assignedVehicleId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="">بدون تخصيص آلية حالياً</option>
                  {assignableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.assetNumber} - {v.categoryNameAr} ({v.plateNumber})
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-500 mt-1">
                  * الآليات المسجلة (خارج الخدمة) يتم حجبها تلقائياً لحماية سلامة التشغيل.
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">الموظف المسؤول (اختياري)</label>
                <select value={newOrderForm.assignedEmployeeIds[0] || ''} onChange={(e) => setNewOrderForm({ ...newOrderForm, assignedEmployeeIds: e.target.value ? [e.target.value] : [] })} className="w-full p-2 border border-slate-300 rounded-lg">
                  <option value="">لم يتم تحديد موظف بعد</option>
                  {employees.filter((employee) => employee.status === 'active').map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName} — {employee.jobTitle}</option>)}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">سيظهر أمر العمل في سجل الموظف ومؤشرات الأداء. يمكن إضافة أعضاء آخرين لاحقًا.</p>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 -mx-5 -mb-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg font-bold shadow-xs"
                >
                  {language === 'ar' ? 'تسجيل البلاغ رسمياً' : 'Create Work Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
