import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle, VehicleCategory, VehicleAvailability } from '../../types';
import {
  Truck,
  Filter,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Gauge,
  Fuel,
  Calendar,
  ShieldAlert,
  User,
  X,
  Lock,
} from 'lucide-react';
import { ASSETS } from '../../assets/assetPaths';

export const FleetView: React.FC = () => {
  const { vehicles, updateVehicle, createVehicle, maintenanceRecords, language, canPerform, showToast, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New vehicle form
  const [newVehForm, setNewVehForm] = useState({
    plateNumber: '',
    category: 'suction_truck' as VehicleCategory,
    categoryNameAr: 'شاحنة سحب (شافطة)',
    makeModel: '',
    modelYear: 2023,
    assignedDriverName: '',
    condition: 'good' as Vehicle['condition'],
    availability: 'available' as VehicleAvailability,
    mileageOrHours: 1000,
    lastInspectionDate: new Date().toISOString().substring(0, 10),
    nextServiceDueDate: '2026-12-31',
    fuelType: 'diesel' as 'diesel' | 'gasoline',
    tankCapacityLiters: 350,
    currentFuelPercent: 90,
  });

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.assetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.makeModel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;
    const matchesAvailability = availabilityFilter === 'all' || v.availability === availabilityFilter;
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const availabilityLabels: Record<VehicleAvailability, { ar: string; en: string; class: string }> = {
    available: { ar: 'متاح للخدمة', en: 'Available', class: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
    assigned: { ar: 'مكلف بمهمة', en: 'Assigned', class: 'bg-blue-50 text-blue-800 border-blue-300' },
    under_maintenance: { ar: 'قيد الصيانة', en: 'Under Maintenance', class: 'bg-amber-50 text-amber-800 border-amber-300' },
    out_of_service: { ar: 'خارج الخدمة (معطل)', en: 'Out of Service', class: 'bg-red-100 text-red-900 border-red-300 font-bold' },
  };

  const handleStatusChange = (vehId: string, newAvailability: VehicleAvailability) => {
    if (!canPerform('manage_fleet')) {
      showToast('ليس لديك صلاحية تغيير حالة آليات الأسطول.', 'error');
      return;
    }
    const activeMaintenance = maintenanceRecords.some((r) => r.vehicleOrEquipmentId === vehId && !['completed', 'cancelled'].includes(r.status));
    if (newAvailability === 'available' && activeMaintenance) {
      showToast('لا يمكن إتاحة هذه الآلية قبل إغلاق أوامر الصيانة المفتوحة المرتبطة بها.', 'warning');
      return;
    }
    updateVehicle(vehId, { availability: newAvailability });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehForm.plateNumber || !newVehForm.makeModel) {
      showToast('يرجى إدخال رقم اللوحة ونوع وطراز الآلية.', 'warning');
      return;
    }
    createVehicle(newVehForm);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-teal-600" />
            <span>{language === 'ar' ? 'أسطول الآليات والمعدات التخصصية' : 'Municipal Fleet & Heavy Equipment'}</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold tabular-nums">
              {vehicles.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar'
              ? 'متابعة شاحنات السحب، الآليات الصاروخية، الحفارات، وجاهزية التشغيل والسلامة'
              : 'Suction vacuum tankers, high-pressure jetting trucks, excavators, and inspection units'}
          </p>
        </div>

        {currentUser.role === 'normal_user' ? (
          <button
            onClick={() => showToast('حساب مستخدم عادي: للمشاهدة فقط. صلاحية إضافة الآليات وتعديل الأسطول محصورة بمدير النظام العام (Administrator).', 'warning')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs font-semibold shadow-xs transition-colors self-start sm:self-center cursor-pointer"
            title="مقفلة للمستخدم العادي (مشاهدة فقط)"
          >
            <Lock className="w-4 h-4 text-slate-500" />
            <span>{language === 'ar' ? 'إضافة آلية (مقفلة للمستخدم العادي)' : 'Add Vehicle (Locked)'}</span>
          </button>
        ) : (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-center cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إضافة آلية جديدة' : 'Add Vehicle'}</span>
          </button>
        )}
      </div>

      {/* Fleet Depot Image Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-44 bg-slate-900 shadow-xs">
        <img
          src={ASSETS.fleetDepot}
          alt="كراج وساحة آليات محطة الكاظمية"
          className="w-full h-full object-cover opacity-85"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex items-end p-5">
          <div className="text-white text-xs flex flex-col md:flex-row md:items-center justify-between w-full gap-2">
            <div>
              <div className="font-bold text-sm flex items-center gap-2">
                <span>ساحة كراج محطة عبد المحسن الكاظمي</span>
                <span className="bg-teal-600/80 text-[10px] px-2 py-0.5 rounded">بيانات تجريبية</span>
              </div>
              <div className="text-slate-300 text-[11px] mt-0.5">
                توزيع فوري لصهاريج السحب والشاحنات الصاروخية المجهزة بمضخات الضغط العالي ومعدات الغوص والسلامة
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-300 font-mono text-[11px]">
              <span>متاح: {vehicles.filter((v) => v.availability === 'available').length}</span>
              <span>·</span>
              <span>مكلف: {vehicles.filter((v) => v.availability === 'assigned').length}</span>
              <span>·</span>
              <span className="text-red-300">خارج الخدمة: {vehicles.filter((v) => v.availability === 'out_of_service').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute top-2.5 start-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'البحث بالرمز، رقم اللوحة، الطراز...' : 'Search by asset code, plate, model...'}
            className="w-full ps-9 pe-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-600 bg-slate-50 focus:bg-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-teal-600"
        >
          <option value="all">كافة الأصناف (All Categories)</option>
          <option value="suction_truck">شافطات صهريج (Suction)</option>
          <option value="jetting_truck">صاروخيات ضغط عالي (Jetting)</option>
          <option value="tanker">تناكر مياه (Tanker)</option>
          <option value="excavator">حفارات جنزير (Excavator)</option>
          <option value="mobile_pump">مضخات طوارئ متحركة</option>
          <option value="utility_pickup">مركبات كشف وطوارئ</option>
        </select>

        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="text-xs py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-teal-600"
        >
          <option value="all">كافة حالات الجاهزية</option>
          <option value="available">متاح للخدمة</option>
          <option value="assigned">مكلف بمهمة</option>
          <option value="under_maintenance">قيد الصيانة</option>
          <option value="out_of_service">خارج الخدمة (معطل)</option>
        </select>
      </div>

      {/* Dynamic fleet KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الآليات', value: vehicles.length, color: 'text-slate-900', hint: 'من سجل الأسطول الحالي' },
          { label: 'متاحة للتكليف', value: vehicles.filter((v) => v.availability === 'available').length, color: 'text-emerald-700', hint: 'جاهزة حسب الحالة المسجلة' },
          { label: 'قيد الاستخدام', value: vehicles.filter((v) => v.availability === 'assigned').length, color: 'text-blue-700', hint: 'مرتبطة بمهمة' },
          { label: 'صيانة / خارج الخدمة', value: vehicles.filter((v) => v.availability === 'under_maintenance' || v.availability === 'out_of_service').length, color: 'text-red-700', hint: 'غير متاحة للتكليف' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="text-xs text-slate-500">{kpi.label}</div>
            <div className={`mt-1 text-2xl font-bold tabular-nums ${kpi.color}`}>{kpi.value}</div>
            <div className="mt-1 text-[10px] text-slate-400">{kpi.hint}</div>
          </div>
        ))}
      </div>

      {/* Vehicles Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((veh) => {
          const isOutOfService = veh.availability === 'out_of_service';

          return (
            <div
              key={veh.id}
              onClick={() => setSelectedVehicle(veh)}
              className={`p-4 bg-white rounded-xl border transition-all cursor-pointer shadow-xs flex flex-col justify-between ${
                isOutOfService
                  ? 'border-red-300 bg-red-50/20 hover:border-red-500'
                  : 'border-slate-200 hover:border-teal-500 hover:shadow-sm'
              }`}
            >
              <div>
                {/* Header: Asset code & Status */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {veh.assetNumber}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded font-semibold border ${availabilityLabels[veh.availability].class}`}>
                    {availabilityLabels[veh.availability].ar}
                  </span>
                </div>

                {/* Make & Plate */}
                <h3 className="font-bold text-sm text-slate-900 mb-0.5">
                  {veh.categoryNameAr}
                </h3>
                <div className="text-xs text-slate-600 mb-1">{veh.makeModel}</div>
                <div className="font-mono text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded inline-block border border-slate-200">
                  {veh.plateNumber}
                </div>

                {/* Out of Service Blocker Warning Banner */}
                {isOutOfService && (
                  <div className="mt-3 p-2 bg-red-100/80 rounded-lg border border-red-300 text-red-900 text-xs flex items-start gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">ممنوع من التكليف الميداني</div>
                      <div className="text-[11px] leading-tight text-red-800 mt-0.5">
                        {veh.defectsNote || 'الآلية معطلة وتتطلب إصلاحاً معتمداً قبل إعادة التشغيل.'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Driver & Operating metrics */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">السائق المسؤول:</span>
                    <span className="font-semibold text-slate-800">{veh.assignedDriverName || 'غير مخصص'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">العداد التشغيلي:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {veh.mileageOrHours.toLocaleString()} {veh.category === 'excavator' ? 'ساعة' : 'كم'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">مستوى الوقود:</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${veh.currentFuelPercent < 30 ? 'bg-red-500' : 'bg-teal-600'}`}
                          style={{ width: `${veh.currentFuelPercent}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold">{veh.currentFuelPercent}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">الفحص الدوري القادم:</span>
                    <span className="font-mono text-[11px] text-slate-600">{veh.nextServiceDueDate}</span>
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                {currentUser.role === 'normal_user' ? (
                  <div className="w-full text-[11px] p-1.5 bg-slate-100 text-slate-500 rounded border border-slate-200 flex items-center justify-center gap-1.5 font-medium">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>تعديل الحالة مخصص لمدير النظام</span>
                  </div>
                ) : (
                  <select
                    value={veh.availability}
                    onChange={(e) => handleStatusChange(veh.id, e.target.value as VehicleAvailability)}
                    className="w-full text-xs p-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white font-medium cursor-pointer"
                  >
                    <option value="available">متاح للخدمة</option>
                    <option value="assigned">مكلف بمهمة</option>
                    <option value="under_maintenance">قيد الصيانة</option>
                    <option value="out_of_service">خارج الخدمة (معطل)</option>
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vehicle details modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onClick={() => setSelectedVehicle(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <div className="text-xs text-slate-500">ملف الآلية</div>
                <h3 className="font-bold text-lg text-slate-900">{selectedVehicle.assetNumber} — {selectedVehicle.makeModel}</h3>
                <p className="text-xs text-slate-500 mt-1">{selectedVehicle.categoryNameAr} · {selectedVehicle.plateNumber}</p>
              </div>
              <button onClick={() => setSelectedVehicle(null)} className="p-1 rounded hover:bg-slate-100 text-slate-500" aria-label="إغلاق"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                ['سنة الصنع', selectedVehicle.modelYear],
                ['السائق المسؤول', selectedVehicle.assignedDriverName || 'غير مخصص'],
                ['العداد الحالي', `${selectedVehicle.mileageOrHours.toLocaleString()} ${selectedVehicle.category === 'excavator' ? 'ساعة' : 'كم'}`],
                ['الحالة التشغيلية', availabilityLabels[selectedVehicle.availability].ar],
                ['نوع الوقود', selectedVehicle.fuelType === 'diesel' ? 'ديزل' : 'بنزين'],
                ['سعة الخزان', `${selectedVehicle.tankCapacityLiters} لتر`],
                ['مستوى الوقود', `${selectedVehicle.currentFuelPercent}%`],
                ['آخر فحص', selectedVehicle.lastInspectionDate || 'غير مسجل'],
                ['الصيانة القادمة', selectedVehicle.nextServiceDueDate || 'غير محدد'],
                ['الحالة الفنية', selectedVehicle.condition],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                  <div className="text-slate-500">{label}</div>
                  <div className="mt-1 font-semibold text-slate-900">{value}</div>
                </div>
              ))}
            </div>
            {selectedVehicle.defectsNote && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <div className="font-bold mb-1">ملاحظات / عيوب مسجلة</div>{selectedVehicle.defectsNote}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button onClick={() => setSelectedVehicle(null)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold">إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal-600" />
                <span>إضافة آلية أو معدة تخصصية جديدة للأسطول</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">صنف الآلية:</label>
                <select
                  value={newVehForm.category}
                  onChange={(e) => {
                    const cat = e.target.value as VehicleCategory;
                    const catNames: Record<VehicleCategory, string> = {
                      suction_truck: 'شاحنة سحب (شافطة)',
                      jetting_truck: 'شاحنة تسليك ونفث صاروخي',
                      tanker: 'تانكي نقل مياه',
                      excavator: 'حفار جنزير',
                      mobile_pump: 'مضخة ديزل متحركة',
                      generator: 'مولدة ديزل',
                      utility_pickup: 'مركبة كشف وطوارئ',
                    };
                    setNewVehForm({
                      ...newVehForm,
                      category: cat,
                      categoryNameAr: catNames[cat],
                    });
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="suction_truck">شافطة صهريج (Suction Tanker)</option>
                  <option value="jetting_truck">صاروخية ضغط عالي (Jetting Truck)</option>
                  <option value="tanker">تانكي نقل مياه (Water Tanker)</option>
                  <option value="excavator">حفار هيدروليكي (Excavator)</option>
                  <option value="mobile_pump">مضخة طوارئ متحركة</option>
                  <option value="utility_pickup">مركبة كشف وطوارئ</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">رقم اللوحة والتسجيل الحكومي: *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: بغداد - 59200 م / حكومي"
                  value={newVehForm.plateNumber}
                  onChange={(e) => setNewVehForm({ ...newVehForm, plateNumber: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">الصانع والموديل: *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Mercedes-Benz Actros 3336"
                  value={newVehForm.makeModel}
                  onChange={(e) => setNewVehForm({ ...newVehForm, makeModel: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">سنة الصنع:</label>
                  <input
                    type="number"
                    value={newVehForm.modelYear}
                    onChange={(e) => setNewVehForm({ ...newVehForm, modelYear: parseInt(e.target.value) || 2023 })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">سعة خزان الوقود (لتر):</label>
                  <input
                    type="number"
                    value={newVehForm.tankCapacityLiters}
                    onChange={(e) => setNewVehForm({ ...newVehForm, tankCapacityLiters: parseInt(e.target.value) || 350 })}
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
                  حفظ وتسجيل الآلية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
