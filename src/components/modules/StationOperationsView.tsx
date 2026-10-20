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
  Trash2,
} from 'lucide-react';
import { ASSETS } from '../../assets/assetPaths';

const EQUIPMENT_CONDITIONS = ['شغالة', 'عاطلة', 'تحت الصيانة'] as const;
const normalizeEquipmentCondition = (condition: string) => EQUIPMENT_CONDITIONS.includes(condition as typeof EQUIPMENT_CONDITIONS[number]) ? condition : '';

export const StationOperationsView: React.FC = () => {
  const {
    stationEquipment,
    saveStationEquipment,
    deleteStationEquipment,
    stationTelemetry,
    updateStationTelemetry,
    language,
    currentUser,
    canPerform,
    showToast,
  } = useApp();

  const [editingEquipment, setEditingEquipment] = useState<StationEquipmentRecord | null>(null);
  const [addingEquipment, setAddingEquipment] = useState(false);
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


  const pumpCategory = (name: string) => name.includes('غطاس') ? 'submersible' : name.includes('ديزل') ? 'diesel' : 'vertical';
  const typeLabels = { vertical: 'مضخات عمودية', diesel: 'مضخات ديزل', submersible: 'مضخات غطاس' };
  const typeColors = {
    vertical: 'border-red-400 bg-red-50 text-red-900',
    diesel: 'border-orange-400 bg-orange-50 text-orange-900',
    submersible: 'border-green-400 bg-green-50 text-green-900',
  };
  const pumps = stationEquipment.filter(item => item.category === 'pump');
  const generators = stationEquipment.filter(item => item.category === 'generator');
  const canEditEquipment = canPerform('update_station_pumps');
  const openNewEquipment = (category: 'pump' | 'generator') => {
    if (!canEditEquipment) return;
    setAddingEquipment(true);
    setEditingEquipment({
      id: `spec-${category}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      category,
      nameAr: category === 'pump' ? 'مضخة عمودية' : 'مولد جديد',
      sizeLabel: '', quantity: 1, dischargeM3S: 0,
      condition: '', notes: '',
    });
  };
  const openExistingEquipment = (record: StationEquipmentRecord) => {
    if (!canEditEquipment) return;
    setAddingEquipment(false);
    setEditingEquipment({ ...record, condition: normalizeEquipmentCondition(record.condition) });
  };
  const groupedPumps = Array.from(pumps.reduce((groups, item) => {
    const key = `${item.nameAr}|${item.sizeLabel ?? ''}|${item.dischargeM3S ?? 0}`;
    const group = groups.get(key);
    if (group) group.quantity += 1;
    else groups.set(key, { ...item, quantity: 1 });
    return groups;
  }, new Map<string, StationEquipmentRecord>()).values());

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

      {/* Individual cards: one card for each physical pump or generator. */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">بطاقات المضخات والمولدات</h3>
            <p className="text-xs text-slate-500">بيانات تشغيلية يدوية تجريبية — اضغط على البطاقة لتعديل الحالة أو إضافة ملاحظة، ولا تمثل تحكماً حقيقياً بالمعدات.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEquipmentTab('pump')} className={`px-3 py-2 rounded-lg text-sm ${equipmentTab === 'pump' ? 'bg-teal-700 text-white' : 'bg-slate-100'}`}>المضخات ({pumps.length})</button>
            <button onClick={() => setEquipmentTab('generator')} className={`px-3 py-2 rounded-lg text-sm ${equipmentTab === 'generator' ? 'bg-teal-700 text-white' : 'bg-slate-100'}`}>المولدات ({generators.length})</button>
            {canEditEquipment && <button onClick={() => openNewEquipment(equipmentTab)} className="px-3 py-2 rounded-lg text-sm bg-slate-900 text-white flex items-center gap-1"><Plus className="w-4 h-4"/>إضافة {equipmentTab === 'pump' ? 'مضخة' : 'مولد'}</button>}
          </div>
        </div>
        {equipmentTab === 'pump' && <div className="flex flex-wrap gap-2 text-xs">
          {(['vertical','diesel','submersible'] as const).map(type => <span key={type} className={`rounded-lg px-3 py-2 border font-bold ${typeColors[type]}`}>{typeLabels[type]}: {pumps.filter(item => pumpCategory(item.nameAr) === type).length}</span>)}
        </div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {(equipmentTab === 'pump' ? pumps : generators).map((item, index) => {
            const type = pumpCategory(item.nameAr);
            const color = item.category === 'generator' ? 'border-sky-400 bg-sky-50 text-sky-900' : typeColors[type];
            return <button type="button" key={item.id} disabled={!canEditEquipment} onClick={() => openExistingEquipment(item)} className={`rounded-xl border-2 p-4 text-right space-y-2 transition-shadow ${color} ${canEditEquipment ? 'cursor-pointer hover:shadow-md focus:outline-teal-700' : 'cursor-default'}`}>
              <div className="font-bold text-sm flex justify-between gap-2"><span>{item.nameAr}</span><span className="font-mono text-xs">#{index + 1}</span></div>
              <div className="text-xs">الحجم: <b dir="ltr">{item.category === 'generator' ? `${item.capacityKva ?? 'غير محدد'} KVA` : item.sizeLabel || 'غير محدد'}</b></div>
              {item.category === 'pump' && <div className="text-xs">التصريف: <b dir="ltr">{(item.dischargeM3S ?? 0).toFixed(3)} m³/s</b></div>}
              <div className="text-xs">الحالة: <b>{normalizeEquipmentCondition(item.condition) || 'غير محددة'}</b></div>
              {item.notes && <div className="text-xs break-words border-t border-current/20 pt-2">ملاحظة: {item.notes}</div>}
              {canEditEquipment && <div className="text-[11px] opacity-70">اضغط للتعديل</div>}
            </button>;
          })}
        </div>
      </section>

      {/* A consolidated specifications table; condition is maintained only in individual cards. */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold mb-3">سجل المواصفات الفنية للمضخات والمولدات</h3>
        <div className="p-3 mb-3 border rounded-lg bg-teal-50 text-sm">مجموع التصريف التصميمي لجميع المضخات: <b dir="ltr">{pumps.reduce((total, item) => total + (item.dischargeM3S ?? 0), 0).toFixed(3)} m³/s</b></div>
        <div className="overflow-x-auto"><table className="w-full text-sm text-right"><thead className="bg-slate-100"><tr><th className="p-2">المعدة</th><th className="p-2">العدد</th><th className="p-2">الحجم</th><th className="p-2">التصريف</th><th className="p-2">التصريف الكلي</th></tr></thead>
          <tbody>{groupedPumps.map((item) => <tr key={`${item.nameAr}-${item.sizeLabel}-${item.dischargeM3S}`} className="border-b"><td className="p-2">{item.nameAr}</td><td className="p-2">{item.quantity}</td><td className="p-2" dir="ltr">{item.sizeLabel}</td><td className="p-2" dir="ltr">{(item.dischargeM3S ?? 0).toFixed(3)} m³/s</td><td className="p-2" dir="ltr">{((item.quantity ?? 0) * (item.dischargeM3S ?? 0)).toFixed(3)} m³/s</td></tr>)}</tbody>
        </table></div>
        <h4 className="font-semibold mt-4 mb-2">المولدات ({generators.length})</h4>
        <div className="overflow-x-auto"><table className="w-full text-sm text-right"><thead className="bg-slate-100"><tr><th className="p-2">المعدة</th><th className="p-2">الحجم</th><th className="p-2">الشركة المصنعة</th></tr></thead><tbody>
          {generators.map(item => <tr className="border-b" key={item.id}><td className="p-2">{item.nameAr}</td><td className="p-2" dir="ltr">{item.capacityKva ?? 'غير محدد'} KVA</td><td className="p-2">{item.manufacturer ?? 'غير محدد'}</td></tr>)}
        </tbody></table></div>
      </section>

      {editingEquipment && <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!editingEquipment.nameAr.trim() || !normalizeEquipmentCondition(editingEquipment.condition) || (editingEquipment.category === 'pump' && (!editingEquipment.sizeLabel?.trim() || !Number.isFinite(editingEquipment.dischargeM3S) || (editingEquipment.dischargeM3S ?? 0) < 0))) { showToast('أكمل الاسم والحجم والتصريف والحالة بشكل صحيح.', 'error'); return; }
          saveStationEquipment({ ...editingEquipment, quantity: 1 }); setEditingEquipment(null); setAddingEquipment(false);
        }} className="bg-white rounded-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-3" dir="rtl">
          <div className="flex items-center justify-between"><h3 className="font-bold">{addingEquipment ? 'إضافة معدة جديدة' : 'تعديل بيانات المعدة'}</h3><button type="button" onClick={() => setEditingEquipment(null)}>✕</button></div>
          {editingEquipment.category === 'pump' && <label className="block text-sm">نوع المضخة<select className="mt-1 block w-full rounded border p-2" value={pumpCategory(editingEquipment.nameAr)} onChange={e => setEditingEquipment({...editingEquipment, nameAr: e.target.value === 'vertical' ? 'مضخة عمودية' : e.target.value === 'diesel' ? 'مضخة ديزل مترية' : 'مضخة غطاس'})}><option value="vertical">مضخة عمودية</option><option value="diesel">مضخة ديزل</option><option value="submersible">مضخة غطاس</option></select></label>}
          {editingEquipment.category === 'pump' && <label className="block text-sm">التسمية / التفاصيل<input className="mt-1 block w-full rounded border p-2" value={editingEquipment.nameAr} onChange={e => setEditingEquipment({...editingEquipment, nameAr:e.target.value})}/></label>}
          {editingEquipment.category === 'generator' && <label className="block text-sm">اسم المولد<input required className="mt-1 block w-full rounded border p-2" value={editingEquipment.nameAr} onChange={e => setEditingEquipment({...editingEquipment, nameAr:e.target.value})}/></label>}
          <label className="block text-sm">الحجم{editingEquipment.category === 'pump' ? <input required className="mt-1 block w-full rounded border p-2" value={editingEquipment.sizeLabel ?? ''} onChange={e => setEditingEquipment({...editingEquipment,sizeLabel:e.target.value})}/> : <input type="number" min="0" className="mt-1 block w-full rounded border p-2" value={editingEquipment.capacityKva ?? ''} onChange={e => setEditingEquipment({...editingEquipment,capacityKva:e.target.value === '' ? undefined : Number(e.target.value)})}/>}</label>
          {editingEquipment.category === 'pump' && <label className="block text-sm">التصريف m³/s<input type="number" required min="0" step="any" className="mt-1 block w-full rounded border p-2" value={editingEquipment.dischargeM3S ?? ''} onChange={e => setEditingEquipment({...editingEquipment,dischargeM3S:e.target.value === '' ? undefined : Number(e.target.value)})}/></label>}
          {editingEquipment.category === 'generator' && <><label className="block text-sm">الشركة المصنعة<input className="mt-1 block w-full rounded border p-2" value={editingEquipment.manufacturer ?? ''} onChange={e => setEditingEquipment({...editingEquipment,manufacturer:e.target.value})}/></label><label className="block text-sm">رقم التعريف<input className="mt-1 block w-full rounded border p-2" value={editingEquipment.serialNumber ?? ''} onChange={e => setEditingEquipment({...editingEquipment,serialNumber:e.target.value})}/></label></>}
          <label className="block text-sm">الحالة<select required className="mt-1 block w-full rounded border p-2" value={normalizeEquipmentCondition(editingEquipment.condition)} onChange={e => setEditingEquipment({...editingEquipment,condition:e.target.value})}><option value="" disabled>اختر الحالة</option>{EQUIPMENT_CONDITIONS.map(condition => <option key={condition} value={condition}>{condition}</option>)}</select></label>
          <label className="block text-sm">ملاحظات<textarea className="mt-1 block w-full rounded border p-2" rows={3} value={editingEquipment.notes ?? ''} onChange={e => setEditingEquipment({...editingEquipment, notes:e.target.value})}/></label>
          <div className="flex flex-wrap gap-2"><button type="submit" className="bg-teal-700 text-white px-4 py-2 rounded">حفظ</button><button type="button" onClick={() => setEditingEquipment(null)} className="bg-slate-200 px-4 py-2 rounded">إلغاء</button>{!addingEquipment && <button type="button" className="ms-auto flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded" onClick={() => { if(window.confirm('هل تريد حذف هذه المعدة من السجل؟')) { deleteStationEquipment(editingEquipment.id); setEditingEquipment(null); } }}><Trash2 className="w-4 h-4"/>حذف المعدة</button>}</div>
        </form>
      </div>}

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
