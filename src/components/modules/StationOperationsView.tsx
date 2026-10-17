import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StationPump, StationTelemetry } from '../../types';
import {
  Gauge,
  Zap,
  Activity,
  Droplets,
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

export const StationOperationsView: React.FC = () => {
  const {
    stationPumps,
    updatePumpStatus,
    stationTelemetry,
    updateStationTelemetry,
    language,
    currentUser,
    canPerform,
    showToast,
  } = useApp();

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

  const runningPumps = stationPumps.filter((p) => p.status === 'running');
  const totalFlowRate = stationPumps.reduce((sum, p) => sum + p.currentFlowM3H, 0);

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Total Flow */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>معدل التدفق الإجمالي</span>
            <Droplets className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-teal-700 tabular-nums">
            {totalFlowRate} <span className="text-xs font-sans text-slate-500">م³/سا</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {runningPumps.length} مضخات بالخدمة الفعلية
          </div>
        </div>

        {/* Metric 2: Wet Well Basin Level */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>منسوب حوض التجميع (Wet Well)</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {stationTelemetry.wetWellLevelMeters} <span className="text-xs font-sans text-slate-500">متر</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  stationTelemetry.wetWellLevelMeters > 5.0 ? 'bg-red-500' : 'bg-teal-600'
                }`}
                style={{
                  width: `${(stationTelemetry.wetWellLevelMeters / stationTelemetry.maxWetWellLevelMeters) * 100}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              حد أقصى {stationTelemetry.maxWetWellLevelMeters}م
            </span>
          </div>
        </div>

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
