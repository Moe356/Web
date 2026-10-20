import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StationPump, StationTelemetry, StationEquipmentRecord } from '../../types';
import {
  Gauge,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Info,
  Shield,
  FileText,
  X,
  Thermometer,
  Radio,
  Lock,
} from 'lucide-react';
import { ASSETS } from '../../assets/assetPaths';

const EQUIPMENT_CONDITIONS = ['شغالة', 'عاطلة', 'تحت الصيانة'] as const;
const normalizeEquipmentCondition = (condition: string) => EQUIPMENT_CONDITIONS.includes(condition as typeof EQUIPMENT_CONDITIONS[number]) ? condition : '';

export const StationOperationsView: React.FC = () => {
  const {
    stationEquipment,
    saveStationEquipment,
    stationPumps,
    updatePumpStatus,
    stationTelemetry,
    updateStationTelemetry,
    language,
    currentUser,
    canPerform,
    showToast,
  } = useApp();

  const [editingEquipment, setEditingEquipment] = useState<StationEquipmentRecord | null>(null);
  const [equipmentTab, setEquipmentTab] = useState<'pump' | 'generator'>('pump');
  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState({
    wetWellLevelMeters: stationTelemetry.wetWellLevelMeters,
    powerSource: stationTelemetry.powerSource,
    gridVoltage: stationTelemetry.gridVoltage,
    generatorRunning: stationTelemetry.generatorRunning,
    generatorFuelPercent: stationTelemetry.generatorFuelPercent,
    gritScreensClean: stationTelemetry.gritScreensClean,
    operatorNotes: '',
  });


  const pumpStatusLabels: Record<StationPump['status'], { ar: string; en: string; class: string }> = {
    running: { ar: 'تعمل (بالخدمة)', en: 'Running', class: 'bg-emerald-500 text-white' },
    standby: { ar: 'جاهزة (احتياط)', en: 'Standby', class: 'bg-slate-200 text-slate-800' },
    maintenance: { ar: 'قيد الصيانة', en: 'Maintenance', class: 'bg-amber-500 text-white' },
    tripped: { ar: 'عطل كهربائي / فصل', en: 'Tripped', class: 'bg-red-600 text-white font-bold' },
  };

  const handleTogglePump = (pumpId: string, currentStatus: StationPump['status']) => {
    if (!canPerform('update_station_pumps')) {
      showToast('تبديل تشغيل مضخات الرفع يتطلب صلاحية المشرف الهندسي المناوب.', 'error');
      return;
    }

    const nextStatus: StationPump['status'] =
      currentStatus === 'running'
        ? 'standby'
        : currentStatus === 'standby'
        ? 'running'
        : currentStatus === 'maintenance'
        ? 'standby'
        : 'standby';

    updatePumpStatus(pumpId, nextStatus);
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logForm.operatorNotes) {
      showToast('يرجى تدوين الملاحظات الفنية ومحضر استلام الشفت.', 'warning');
      return;
    }
    updateStationTelemetry(logForm);
    setShowLogModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Gauge className="w-5 h-5 text-teal-600" />
            <span>{language === 'ar' ? 'تشغيل محطة رفع ومعالجة عبد المحسن الكاظمي' : 'Station Pumping & Lift Operations'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar'
              ? 'مراقبة خطوط الضخ الرئيسية، أحواض التجميع الرطبة، المصافي، ومولدات الطوارئ'
              : 'Main lift pumps, wet well retention levels, grit screens, and auxiliary power'}
          </p>
        </div>

        {currentUser.role === 'normal_user' ? (
          <button
            onClick={() => showToast('حساب مستخدم عادي: للمشاهدة فقط. صلاحية تسجيل القراءات التشغيلية محصورة بمدير النظام والكوادر الهندسية.', 'warning')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs font-semibold shadow-xs transition-colors self-start sm:self-center cursor-pointer"
            title="مقفلة للمستخدم العادي (مشاهدة فقط)"
          >
            <Lock className="w-4 h-4 text-slate-500" />
            <span>{language === 'ar' ? 'تسجيل قراءة (مقفلة للمستخدم العادي)' : 'Log Reading (Locked)'}</span>
          </button>
        ) : (
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-center cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'تسجيل قراءة تشغيلية / تسليم شفت' : 'Log Station Reading'}</span>
          </button>
        )}
      </div>

      {/* Manual Operational Integrity Banner */}
      <div className="p-3 bg-slate-900 text-slate-200 rounded-xl text-xs flex items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            {language === 'ar'
              ? 'سجل القراءات الميدانية: يتم تسجيل القراءات يدوياً وتوثيقها رسمياً عبر مهندس التشغيل المناوب.'
              : 'Operational readings are manually logged and signed off by the shift engineer.'}
          </span>
        </div>
        <span className="font-mono text-teal-400 text-[11px] shrink-0">
          آخر تحديث: {stationTelemetry.timestamp}
        </span>
      </div>

      {/* Main Console Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Metric 3: Power Grid & Voltage */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>مصدر التغذية الكهربائية</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>الشبكة الوطنية (395V)</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            المولدة الاحتياطية: في وضع الجاهزية (Standby)
          </div>
        </div>

        {/* Metric 4: Generator Fuel Reserve */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>خزان وقود مولدة الطوارئ</span>
            <Gauge className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            %{stationTelemetry.generatorFuelPercent}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            خزان الديزل سعة 5,000 لتر
          </div>
        </div>
      </div>

      {/* Official technical register: editable reference data, not simulated telemetry */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">سجل المواصفات الفنية للمضخات والمولدات</h3>
            <p className="text-xs text-slate-500">بيانات من وثيقة المحطة الرسمية — ليست قراءات لحظية. الحفظ محلي تجريبي إلى حين ربط قاعدة البيانات.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setEquipmentTab('pump')} className={`px-3 py-2 rounded-lg text-sm ${equipmentTab === 'pump' ? 'bg-teal-700 text-white' : 'bg-slate-100'}`}>المضخات</button>
            <button type="button" onClick={() => setEquipmentTab('generator')} className={`px-3 py-2 rounded-lg text-sm ${equipmentTab === 'generator' ? 'bg-teal-700 text-white' : 'bg-slate-100'}`}>المولدات</button>
          </div>
        </div>
        {equipmentTab === 'pump' && <div className="mb-3 p-3 rounded-lg bg-teal-50 border border-teal-200 text-sm">
          <strong>التصريف الكلي للمضخات:</strong> <span dir="ltr" className="font-mono font-bold">{stationEquipment.filter(item => item.category === 'pump').reduce((total, item) => total + (item.dischargeM3S ?? 0) * (item.quantity ?? 0), 0).toFixed(3)} m³/s</span>
          <p className="text-xs text-slate-500 mt-1">مجموع (العدد × التصريف) لكل فئة. بيانات تصميمية وليست قراءة تشغيلية لحظية. اضغط على صف لتعديل بياناته.</p>
        </div>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right border-collapse">
            <thead className="bg-slate-100 text-slate-700"><tr>
              {equipmentTab === 'pump' ? <><th className="p-2">المعدة</th><th className="p-2">العدد</th><th className="p-2">الحجم</th><th className="p-2">التصريف</th><th className="p-2">التصريف الكلي</th><th className="p-2">الحالة</th></> : <><th className="p-2">المعدة</th><th className="p-2">الحجم</th><th className="p-2">الحالة</th></>}
            </tr></thead>
            <tbody>{stationEquipment.filter(item => item.category === equipmentTab).map(item => (
              <tr key={item.id} tabIndex={canPerform('update_station_pumps') ? 0 : undefined} role={canPerform('update_station_pumps') ? 'button' : undefined} title="اضغط لتعديل بيانات المعدة" onClick={() => { if(canPerform('update_station_pumps')) setEditingEquipment({...item, condition: normalizeEquipmentCondition(item.condition)}); }} onKeyDown={e => { if(canPerform('update_station_pumps') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setEditingEquipment({...item, condition: normalizeEquipmentCondition(item.condition)}); } }} className="border-b border-slate-100 hover:bg-teal-50 cursor-pointer focus:outline-teal-700">
                <td className="p-2 font-semibold">{item.nameAr} {item.manufacturer ? `(${item.manufacturer})` : ''}</td>
                {equipmentTab === 'pump' ? <>
                  <td className="p-2" dir="ltr">{item.quantity ?? 0}</td>
                  <td className="p-2" dir="ltr">{item.sizeLabel ?? 'غير محدد'}</td>
                  <td className="p-2" dir="ltr">{(item.dischargeM3S ?? 0).toFixed(3)} m³/s</td>
                  <td className="p-2 font-bold" dir="ltr">{((item.quantity ?? 0) * (item.dischargeM3S ?? 0)).toFixed(3)} m³/s</td>
                  <td className="p-2">{normalizeEquipmentCondition(item.condition) || 'غير محددة'}</td>
                </> : <><td className="p-2" dir="ltr">{item.capacityKva == null ? 'غير محدد' : `${item.capacityKva} KVA`}</td><td className="p-2">{normalizeEquipmentCondition(item.condition) || 'غير محددة'}</td></>}
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>
      {editingEquipment && <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4" role="presentation">
        <form onSubmit={(e) => { e.preventDefault(); if (!editingEquipment.nameAr.trim() || !normalizeEquipmentCondition(editingEquipment.condition) || (editingEquipment.category === 'pump' && (!Number.isInteger(editingEquipment.quantity) || (editingEquipment.quantity ?? 0) < 0))) { showToast('الاسم والحالة مطلوبان', 'error'); return; } saveStationEquipment(editingEquipment); setEditingEquipment(null); }} className="bg-white rounded-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-3" dir="rtl">
          <div className="flex items-center justify-between"><h3 className="font-bold">تعديل مواصفات المعدة</h3><button type="button" onClick={() => setEditingEquipment(null)} aria-label="إغلاق">✕</button></div>
          {editingEquipment.category === 'pump' && <label className="block text-sm">الحجم<input className="mt-1 block w-full rounded border p-2" value={editingEquipment.sizeLabel ?? ''} onChange={e => setEditingEquipment({...editingEquipment,sizeLabel:e.target.value})}/></label>}
          {([['nameAr','اسم المعدة'],['manufacturer','الشركة المصنعة'],['serialNumber','رقم المولدة / التعريف'],['notes','ملاحظات']] as const).map(([key,label]) => <label key={key} className="block text-sm">{label}<input className="mt-1 block w-full rounded border p-2" value={editingEquipment[key] ?? ''} onChange={e => setEditingEquipment({...editingEquipment,[key]:e.target.value})}/></label>)}
          <label className="block text-sm">الحالة<select className="mt-1 block w-full rounded border p-2" value={normalizeEquipmentCondition(editingEquipment.condition)} onChange={e => setEditingEquipment({...editingEquipment,condition:e.target.value})} required><option value="" disabled>اختر الحالة</option>{EQUIPMENT_CONDITIONS.map(status => <option key={status} value={status}>{status}</option>)}</select></label>
          {([['motorKw','قدرة المحرك kW'],['dischargeM3S','التصريف m³/s'],['diameterMm','القطر mm'],['quantity','العدد'],['capacityKva','الحجم KVA']] as const).filter(([key]) => editingEquipment.category === 'pump' ? key !== 'capacityKva' : key === 'capacityKva').map(([key,label]) => <label key={key} className="block text-sm">{label}<input type="number" min="0" step={key === 'quantity' ? '1' : 'any'} className="mt-1 block w-full rounded border p-2" value={editingEquipment[key] ?? ''} onChange={e => setEditingEquipment({...editingEquipment,[key]:e.target.value === '' ? undefined : Number(e.target.value)})}/></label>)}
          <div className="flex gap-2"><button type="submit" className="bg-teal-700 text-white px-4 py-2 rounded">حفظ التعديلات</button><button type="button" onClick={() => setEditingEquipment(null)} className="bg-slate-200 px-4 py-2 rounded">إلغاء</button></div>
        </form>
      </div>}

      {/* 5 Main Sewage Lifting Pumps Technical Console */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-teal-600" />
              <span>وحدات الضخ الرئيسية (P-01 إلى P-05)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              مضخات طرد مركزي تخصصية للرفع الثقيل، مربوطة بقواطع حماية حرارية وميكانيكية
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-mono">
            القدرة الإجمالية: 5,800 م³/ساعة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {stationPumps.map((pump) => {
            const isRunning = pump.status === 'running';

            return (
              <div
                key={pump.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                  isRunning
                    ? 'border-emerald-300 bg-emerald-50/20 shadow-xs'
                    : pump.status === 'maintenance'
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{pump.code}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${pumpStatusLabels[pump.status].class}`}>
                      {pumpStatusLabels[pump.status].ar}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-800 line-clamp-1 mb-2">
                    {pump.nameAr}
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-slate-200/60">
                    <div className="flex justify-between">
                      <span className="text-slate-400">التدفق الفعلي:</span>
                      <span className="font-mono font-bold text-teal-800">{pump.currentFlowM3H} م³/سا</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">حرارة المحرك:</span>
                      <span className="font-mono">{pump.temperatureCelsius}°C</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">الاهتزاز:</span>
                      <span className="font-mono">{pump.vibrationMmS} mm/s</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">ساعات التشغيل:</span>
                      <span className="font-mono">{pump.operatingHours.toLocaleString()} سا</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60">
                  {currentUser.role === 'normal_user' ? (
                    <div className="w-full py-1 px-2 bg-slate-100 text-slate-500 rounded text-[11px] font-medium text-center flex items-center justify-center gap-1 border border-slate-200">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>التحكم مخصص لمدير النظام</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleTogglePump(pump.id, pump.status)}
                      className={`w-full py-1 px-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                        isRunning
                          ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                          : 'bg-teal-700 hover:bg-teal-600 text-white'
                      }`}
                    >
                      {isRunning ? 'إيقاف للوضع الاحتياطي' : 'تشغيل المضخة'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auxiliary Units: Screens & Odor Treatment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mechanical Screens */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900">
              المصافي الميكانيكية لحجز الشوائب (Mechanical Bar Screens)
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              الحالة: {stationTelemetry.gritScreensClean ? 'نظيفة وتعمل بدورة آلية' : 'تتطلب كشط وتنظيف فوري'}.
              تحمي المضخات من العوالق الخشنة والأقمشة والترسبات القادمة من خطوط الكاظمية القديمة.
            </p>
          </div>
        </div>

        {/* Odor Biofilter */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900">
              وحدة المعالجة الحيوية وتقليل الروائح (Biofilter Odor Control)
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              الحالة: تعمل بكفاءة مستمرة لسحب غازات كبريتيد الهيدروجين (H2S) من محيط الحوض لحماية البيئة السكنية المجاورة.
            </p>
          </div>
        </div>
      </div>

      {/* Operator Shift Logbook */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-600" />
          <span>محضر تسليم الشفت والتقرير التشغيلي الميداني الأخير</span>
        </h3>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed mb-3">
          {stationTelemetry.operatorNotes}
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-100">
          <div>المسؤول الهندسي المدون: {stationTelemetry.recordedBy}</div>
          <div>التوقيت: {stationTelemetry.timestamp}</div>
        </div>
      </div>

      {/* Log Station Reading Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-teal-600" />
                <span>تسجيل قراءة تشغيلية ومحضر تسليم الشفت</span>
              </h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  منسوب حوض التجميع الرطب (بالمتر): *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={logForm.wetWellLevelMeters}
                  onChange={(e) => setLogForm({ ...logForm, wetWellLevelMeters: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  نسبة وقود خزان المولدة (%):
                </label>
                <input
                  type="number"
                  value={logForm.generatorFuelPercent}
                  onChange={(e) => setLogForm({ ...logForm, generatorFuelPercent: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  ملاحظات المهندس ومحضر الشفت: *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="سجل استقرار الفولتية، عدد المضخات العاملة، أية ترسبات بالحوض، وتوصيات الشفت القادم..."
                  value={logForm.operatorNotes}
                  onChange={(e) => setLogForm({ ...logForm, operatorNotes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-lg font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg font-bold"
                >
                  اعتماد وتثبيت القراءة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
