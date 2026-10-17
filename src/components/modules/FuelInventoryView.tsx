import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FuelTransaction, InventoryItem, InventoryMovement } from '../../types';
import {
  Fuel,
  Warehouse,
  Plus,
  AlertTriangle,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  X,
  FileText,
  DollarSign,
} from 'lucide-react';

export const FuelInventoryView: React.FC = () => {
  const {
    fuelTransactions,
    createFuelTransaction,
    inventory,
    inventoryMovements,
    recordStockMovement,
    vehicles,
    language,
    currentUser,
    canPerform,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'fuel' | 'inventory' | 'movements'>('fuel');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);

  // Form for Fuel
  const [fuelForm, setFuelForm] = useState({
    vehicleOrEquipmentId: vehicles[0]?.id || '',
    vehiclePlateOrAsset: vehicles[0]?.assetNumber || '',
    quantityLiters: 150,
    meterReading: 45000,
    date: new Date().toISOString().substring(0, 10),
    stationOrSupplier: 'محطة وقود الكاظمية الحكومية (الكرخ)',
    authorizedCostIqd: 112500,
    recordedBy: currentUser.name,
  });

  // Form for Movement
  const [movementForm, setMovementForm] = useState({
    itemId: inventory[0]?.id || '',
    movementType: 'out' as 'in' | 'out',
    quantity: 1,
    referenceNumber: 'REQ-2026-044',
    recipientOrSupplier: 'شعبة صيانة المضخات - ورشة المحطة',
    approvedBy: currentUser.name,
  });

  const lowStockCount = inventory.filter((i) => i.currentStock <= i.minThreshold).length;
  const totalFuelLiters = fuelTransactions.reduce((sum, tx) => sum + Number(tx.quantityLiters || 0), 0);
  const totalFuelCost = fuelTransactions.reduce((sum, tx) => sum + Number(tx.authorizedCostIqd || 0), 0);
  const inventoryValue = inventory.reduce((sum, item) => sum + Number(item.currentStock || 0) * Number(item.unitPriceIqd || 0), 0);
  const filteredFuelTransactions = fuelTransactions.filter((tx) =>
    [tx.receiptNumber, tx.vehiclePlateOrAsset, tx.stationOrSupplier, tx.recordedBy, tx.date].some((v) =>
      String(v || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
  );
  const filteredInventory = inventory.filter((item) =>
    [item.itemCode, item.nameAr, item.nameEn, item.categoryAr, item.locationShelf].some((v) =>
      String(v || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
  );
  const filteredMovements = inventoryMovements.filter((mov) =>
    [mov.referenceNumber, mov.itemNameAr, mov.recipientOrSupplier, mov.approvedBy, mov.date].some((v) =>
      String(v || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
  );

  const handleFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = vehicles.find((veh) => veh.id === fuelForm.vehicleOrEquipmentId);
    createFuelTransaction({
      ...fuelForm,
      vehiclePlateOrAsset: v ? `${v.assetNumber} (${v.plateNumber})` : fuelForm.vehiclePlateOrAsset,
      recordedBy: currentUser.name,
    });
    setShowFuelModal(false);
  };

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = inventory.find((i) => i.id === movementForm.itemId);
    if (!item) return;

    const success = recordStockMovement({
      itemId: item.id,
      itemNameAr: item.nameAr,
      movementType: movementForm.movementType,
      quantity: Number(movementForm.quantity) || 1,
      referenceNumber: movementForm.referenceNumber,
      recipientOrSupplier: movementForm.recipientOrSupplier,
      approvedBy: currentUser.name,
    });

    if (success) {
      setShowMovementModal(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Fuel className="w-5 h-5 text-teal-600" />
            <span>{language === 'ar' ? 'إدارة الوقود والمخزون الفني التخصصي' : 'Fuel & Technical Spare Parts Inventory'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar'
              ? 'تتبع وصولات الديزل، أرصدة قطع غيار المضخات، وحدود الطلب الحرج'
              : 'Fuel transactions, pump spare parts stock, and requisition movement ledger'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'fuel' && (
            <button
              onClick={() => setShowFuelModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'تقييد وصل وقود جديد' : 'New Fuel Log'}</span>
            </button>
          )}

          {activeTab !== 'fuel' && (
            <button
              onClick={() => setShowMovementModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'حركة صرف / توريد مخزني' : 'Stock Movement'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Live summary cards: derived from the same records shown below */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-500">إجمالي الوقود المسجل</div>
          <div className="mt-1 text-xl font-bold text-teal-700">{totalFuelLiters.toLocaleString()} <span className="text-xs font-medium">لتر</span></div>
          <div className="mt-1 text-[11px] text-slate-400">محسوب من وصولات الوقود المحفوظة</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-500">الكلفة الإجمالية المسجلة</div>
          <div className="mt-1 text-xl font-bold text-slate-900">{totalFuelCost.toLocaleString()} <span className="text-xs font-medium">د.ع</span></div>
          <div className="mt-1 text-[11px] text-slate-400">مجموع الكلف المعتمدة للوصولات</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-500">القيمة التقديرية للمخزون</div>
          <div className="mt-1 text-xl font-bold text-slate-900">{inventoryValue.toLocaleString()} <span className="text-xs font-medium">د.ع</span></div>
          <div className="mt-1 text-[11px] text-slate-400">الرصيد الحالي × سعر الوحدة</div>
        </div>
        <div className={`rounded-xl border p-4 shadow-xs ${lowStockCount ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}>
          <div className="text-xs text-slate-500">مواد عند الحد الحرج</div>
          <div className={`mt-1 text-xl font-bold ${lowStockCount ? 'text-amber-700' : 'text-emerald-700'}`}>{lowStockCount} <span className="text-xs font-medium">صنف</span></div>
          <div className="mt-1 text-[11px] text-slate-400">يتحدث تلقائيًا بعد حركات المخزون</div>
        </div>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ابحث برقم الوصل أو الآلية أو الصنف أو رقم السند..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-9 pl-3 text-xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('fuel')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'fuel' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          سجل الوقود للآليات
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>مخزن قطع الغيار</span>
          {lowStockCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'movements' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          حركة المخزون والموافقات
        </button>
      </div>

      {/* TAB 1: FUEL TRANSACTIONS */}
      {activeTab === 'fuel' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">سجل وصولات الديزل والبنزين المعتمدة</span>
              <span className="text-[11px] text-slate-500 font-mono">
                إجمالي الاستهلاك المسجل: {fuelTransactions.reduce((acc, t) => acc + t.quantityLiters, 0)} لتر
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-3 px-4">رقم الوصل</th>
                    <th className="py-3 px-4">الآلية / المعدة المستفيدة</th>
                    <th className="py-3 px-4">الكمية (لتر)</th>
                    <th className="py-3 px-4">قراءة العداد</th>
                    <th className="py-3 px-4">التاريخ</th>
                    <th className="py-3 px-4">المحطة المجهزة</th>
                    <th className="py-3 px-4">الكلفة المعتمدة (د.ع)</th>
                    <th className="py-3 px-4">المدخل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFuelTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{tx.receiptNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{tx.vehiclePlateOrAsset}</td>
                      <td className="py-3 px-4 font-mono font-bold text-teal-800 tabular-nums">
                        {tx.quantityLiters} لتر
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{tx.meterReading.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{tx.date}</td>
                      <td className="py-3 px-4 text-slate-700">{tx.stationOrSupplier}</td>
                      <td className="py-3 px-4 font-mono text-slate-900">
                        {tx.authorizedCostIqd.toLocaleString()} د.ع
                      </td>
                      <td className="py-3 px-4 text-slate-500">{tx.recordedBy}</td>
                    </tr>
                  ))}
                  {filteredFuelTransactions.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-slate-400">لا توجد وصولات مطابقة للبحث.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY ITEMS */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {lowStockCount > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">تنبيه المخزون الحرج:</span> يوجد {lowStockCount} مواد بلغت الحد الأدنى أو انخفضت تحته، يرجى تقديم طلبات شراء رسمية لقسم المشتريات لتفادي توقف المضخات.
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-3 px-4">رمز المادة</th>
                    <th className="py-3 px-4">اسم المادة / الصنف</th>
                    <th className="py-3 px-4">التصنيف</th>
                    <th className="py-3 px-4">الرصيد الفعلي</th>
                    <th className="py-3 px-4">الحد الأدنى الحرج</th>
                    <th className="py-3 px-4">سعر الوحدة التقديري</th>
                    <th className="py-3 px-4">موقع الرف / المستودع</th>
                    <th className="py-3 px-4">آخر توريد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => {
                    const isLow = item.currentStock <= item.minThreshold;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50 transition-colors ${isLow ? 'bg-amber-50/30' : ''}`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.itemCode}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{item.nameAr}</div>
                          <div className="text-[11px] text-slate-400 font-sans">{item.nameEn}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{item.categoryAr}</td>
                        <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-xs inline-block ${
                              isLow ? 'bg-red-100 text-red-800 border border-red-200' : 'text-slate-900'
                            }`}
                          >
                            {item.currentStock} {item.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{item.minThreshold} {item.unit}</td>
                        <td className="py-3 px-4 font-mono text-slate-800">{item.unitPriceIqd.toLocaleString()} د.ع</td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{item.locationShelf}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{item.lastRestockedDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MOVEMENTS */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">سجل حركات الصرف والتوريد المخزنية</span>
            <span className="text-[11px] text-slate-500">سجل تدقيقي رسمي بحركات المواد</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4">رقم الإشعار / الطلب</th>
                  <th className="py-3 px-4">نوع الحركة</th>
                  <th className="py-3 px-4">المادة</th>
                  <th className="py-3 px-4">الكمية</th>
                  <th className="py-3 px-4">الجهة المستفيدة / المورد</th>
                  <th className="py-3 px-4">التاريخ والوقت</th>
                  <th className="py-3 px-4">المصادق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{mov.referenceNumber}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          mov.movementType === 'in'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {mov.movementType === 'in' ? (
                          <>
                            <ArrowDownLeft className="w-3 h-3" />
                            توريد / إدخال
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3" />
                            صرف ورشة
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{mov.itemNameAr}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{mov.quantity}</td>
                    <td className="py-3 px-4 text-slate-700">{mov.recipientOrSupplier}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{mov.date}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{mov.approvedBy}</td>
                  </tr>
                ))}
                {filteredMovements.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-slate-400">لا توجد حركات مخزنية مطابقة للبحث.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fuel Log Modal */}
      {showFuelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Fuel className="w-5 h-5 text-teal-600" />
                <span>تقييد وصل وقود جديد</span>
              </h3>
              <button onClick={() => setShowFuelModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFuelSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">الآلية أو المولد: *</label>
                <select
                  value={fuelForm.vehicleOrEquipmentId}
                  onChange={(e) => setFuelForm({ ...fuelForm, vehicleOrEquipmentId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.assetNumber} - {v.makeModel}
                    </option>
                  ))}
                  <option value="gen-main">مولدة الطوارئ الرئيسية Perkins 1250 KVA</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">الكمية (لتر): *</label>
                  <input
                    type="number"
                    required
                    value={fuelForm.quantityLiters}
                    onChange={(e) => setFuelForm({ ...fuelForm, quantityLiters: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">قراءة العداد (كم/ساعة):</label>
                  <input
                    type="number"
                    value={fuelForm.meterReading}
                    onChange={(e) => setFuelForm({ ...fuelForm, meterReading: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">المحطة المجهزة أو الصهريج: *</label>
                <input
                  type="text"
                  required
                  value={fuelForm.stationOrSupplier}
                  onChange={(e) => setFuelForm({ ...fuelForm, stationOrSupplier: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">الكلفة الرسمية المعتمدة (د.ع):</label>
                <input
                  type="number"
                  value={fuelForm.authorizedCostIqd}
                  onChange={(e) => setFuelForm({ ...fuelForm, authorizedCostIqd: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFuelModal(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-lg font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg font-bold"
                >
                  حفظ الوصل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-teal-600" />
                <span>قيد حركة صرف / توريد مخزني</span>
              </h3>
              <button onClick={() => setShowMovementModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMovementSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">نوع الحركة:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementForm({ ...movementForm, movementType: 'out' })}
                    className={`py-2 rounded-lg font-bold border transition-colors ${
                      movementForm.movementType === 'out'
                        ? 'bg-indigo-700 text-white border-indigo-700'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    صرف لورشة الصيانة
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementForm({ ...movementForm, movementType: 'in' })}
                    className={`py-2 rounded-lg font-bold border transition-colors ${
                      movementForm.movementType === 'in'
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    إدخال مخزني (توريد)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">المادة المخزنية: *</label>
                <select
                  value={movementForm.itemId}
                  onChange={(e) => setMovementForm({ ...movementForm, itemId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nameAr} (الرصيد: {item.currentStock} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">الكمية: *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movementForm.quantity}
                    onChange={(e) => setMovementForm({ ...movementForm, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">رقم الطلب / السند:</label>
                  <input
                    type="text"
                    required
                    value={movementForm.referenceNumber}
                    onChange={(e) => setMovementForm({ ...movementForm, referenceNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">الجهة المستلمة / الورشة المستفيدة: *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ورشة إصلاح المضخة P-03"
                  value={movementForm.recipientOrSupplier}
                  onChange={(e) => setMovementForm({ ...movementForm, recipientOrSupplier: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-lg font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg font-bold"
                >
                  تأكيد الحركة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
