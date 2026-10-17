import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Shield, RotateCcw, Download, Building, Lock, Upload, Save, FileCheck2 } from 'lucide-react';

type PermissionKey = 'workOrders' | 'fleet' | 'hr' | 'audit' | 'settings';
type RolePermission = Record<PermissionKey, boolean>;
type PermissionMatrix = Record<string, RolePermission>;
const PERMISSION_STORAGE_KEY = 'kadhimiya_station_app_permission_matrix';
const permissionColumns: { key: PermissionKey; label: string }[] = [
  { key: 'workOrders', label: 'أوامر العمل والشكاوى' },
  { key: 'fleet', label: 'الأسطول والصيانة' },
  { key: 'hr', label: 'الموارد البشرية' },
  { key: 'audit', label: 'التدقيق والرقابة' },
  { key: 'settings', label: 'إعدادات النظام' },
];
const defaultMatrix: PermissionMatrix = {
  station_manager: { workOrders: true, fleet: true, hr: false, audit: true, settings: false },
  shift_supervisor: { workOrders: true, fleet: true, hr: false, audit: false, settings: false },
  dispatcher: { workOrders: true, fleet: false, hr: false, audit: false, settings: false },
  engineer: { workOrders: false, fleet: true, hr: false, audit: false, settings: false },
  driver_worker: { workOrders: false, fleet: false, hr: false, audit: false, settings: false },
  hr_officer: { workOrders: false, fleet: false, hr: true, audit: false, settings: false },
  auditor: { workOrders: false, fleet: false, hr: false, audit: true, settings: false },
  normal_user: { workOrders: false, fleet: false, hr: false, audit: false, settings: false },
};
const roles = [
  { id: 'station_manager', label: 'مدير المحطة', en: 'Station Manager' },
  { id: 'shift_supervisor', label: 'مشرف الوجبة', en: 'Shift Supervisor' },
  { id: 'dispatcher', label: 'مأمور التوزيع', en: 'Dispatcher' },
  { id: 'engineer', label: 'مهندس صيانة', en: 'Maintenance Engineer' },
  { id: 'driver_worker', label: 'سائق / عامل ميداني', en: 'Driver / Field Worker' },
  { id: 'hr_officer', label: 'مسؤول الموارد البشرية', en: 'HR Officer' },
  { id: 'auditor', label: 'مدقق ومراقب', en: 'Auditor' },
  { id: 'normal_user', label: 'مستخدم للعرض فقط', en: 'Read-only Demo User' },
];

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, language, resetDemoData, currentUser, canPerform, showToast, workOrders, employees, attendance, vehicles, maintenanceRecords, fuelTransactions, inventory, inventoryMovements, stationPumps, stationTelemetry, documents, notifications, auditLogs } = useApp();
  const isAdmin = currentUser.role === 'super_admin' || currentUser.isAdmin === true;
  const [formSettings, setFormSettings] = useState({ stationNameAr: settings.stationNameAr, directorName: settings.directorName, contactPhone: settings.contactPhone, emergencyHotline: settings.emergencyHotline, addressAr: settings.addressAr, maintenanceWarningThresholdHours: settings.maintenanceWarningThresholdHours });
  const [matrix, setMatrix] = useState<PermissionMatrix>(() => {
    try { const saved = localStorage.getItem(PERMISSION_STORAGE_KEY); return saved ? { ...defaultMatrix, ...JSON.parse(saved) } : defaultMatrix; } catch { return defaultMatrix; }
  });
  const [backupFile, setBackupFile] = useState<File | null>(null);
  useEffect(() => setFormSettings({ stationNameAr: settings.stationNameAr, directorName: settings.directorName, contactPhone: settings.contactPhone, emergencyHotline: settings.emergencyHotline, addressAr: settings.addressAr, maintenanceWarningThresholdHours: settings.maintenanceWarningThresholdHours }), [settings]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPerform('edit_settings')) { showToast('تعديل إعدادات المحطة محصور بمدير النظام العام.', 'error'); return; }
    updateSettings(formSettings);
  };
  const saveMatrix = () => {
    if (!isAdmin) { showToast('تعديل مصفوفة الصلاحيات محصور بمدير النظام العام.', 'error'); return; }
    localStorage.setItem(PERMISSION_STORAGE_KEY, JSON.stringify(matrix));
    showToast('تم حفظ مصفوفة الصلاحيات التجريبية. تسري على صلاحيات التطبيق في هذا المتصفح فقط.', 'success');
  };
  const togglePermission = (roleId: string, key: PermissionKey, checked: boolean) => setMatrix(prev => ({ ...prev, [roleId]: { ...(prev[roleId] || defaultMatrix[roleId]), [key]: checked } }));

  const handleExportBackup = () => {
    const backupData = {
      format: 'kadhimiya-station-demo-backup', version: 1, timestamp: new Date().toISOString(), exportedBy: currentUser.name,
      data: { settings, workOrders, employees, attendance, vehicles, maintenanceRecords, fuelTransactions, inventory, inventoryMovements, stationPumps, stationTelemetry, documents, notifications, auditLogs, permissionMatrix: matrix },
      notice: 'Demo backup. Restore is supported only in this browser-based demo; this file does not contain server-side data.'
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url;
    link.download = `kadhimiya_station_backup_${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    showToast('تم تنزيل ملف النسخة الاحتياطية التجريبية.', 'success');
  };
  const handleImportBackup = async () => {
    if (!isAdmin) { showToast('استعادة النسخة الاحتياطية متاحة لمدير النظام فقط.', 'error'); return; }
    if (!backupFile) { showToast('اختر ملف نسخة احتياطية أولًا.', 'warning'); return; }
    try {
      const parsed = JSON.parse(await backupFile.text());
      if (parsed?.format !== 'kadhimiya-station-demo-backup' || !parsed?.data || typeof parsed.data !== 'object') throw new Error('invalid format');
      if (!confirm('سيتم استبدال البيانات التجريبية الحالية بالبيانات الموجودة في الملف. هل تريد المتابعة؟')) return;
      const keyMap: Record<string, string> = { settings: 'settings', workOrders: 'work_orders', employees: 'employees', attendance: 'attendance', vehicles: 'vehicles', maintenanceRecords: 'maint', fuelTransactions: 'fuel', inventory: 'inventory', inventoryMovements: 'movements', stationPumps: 'pumps', stationTelemetry: 'telemetry', documents: 'documents', notifications: 'notifs', auditLogs: 'audit' };
      for (const [field, storageKey] of Object.entries(keyMap)) if (field in parsed.data) localStorage.setItem(`kadhimiya_station_app_${storageKey}`, JSON.stringify(parsed.data[field]));
      if (parsed.data.permissionMatrix) localStorage.setItem(PERMISSION_STORAGE_KEY, JSON.stringify(parsed.data.permissionMatrix));
      alert('تم استيراد البيانات المحفوظة. سيتم تحديث التطبيق الآن لإعادة تحميل السجلات من التخزين المحلي.'); window.location.reload();
    } catch { showToast('تعذرت قراءة الملف. تأكد أنه نسخة احتياطية JSON صادرة من هذا النظام.', 'error'); }
  };

  return <div className="space-y-6">
    <div><h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2"><Settings className="w-5 h-5 text-teal-600" /><span>{language === 'ar' ? 'إعدادات المنظومة وصلاحيات الوصول' : 'Station Configuration & Permissions'}</span></h2><p className="text-xs text-slate-500 mt-1">تعديل بيانات المحطة، ضبط صلاحيات العرض التجريبية، وتصدير أو استعادة بيانات النسخة التجريبية.</p></div>
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Building className="w-4 h-4 text-teal-600" />بيانات محطة عبد المحسن الكاظمي والبلدية</h3>
      <form onSubmit={handleSaveSettings} className="space-y-4 text-xs"><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {([{key:'stationNameAr',label:'اسم المحطة الرسمي'},{key:'directorName',label:'مدير المحطة المعتمد'},{key:'emergencyHotline',label:'خط الطوارئ الساخن للشكاوى'},{key:'addressAr',label:'العنوان الجغرافي'},{key:'contactPhone',label:'رقم الاتصال'}] as const).map(field => <label key={field.key} className="block font-semibold text-slate-800">{field.label}<input disabled={!isAdmin} value={formSettings[field.key]} onChange={e => setFormSettings(prev => ({...prev,[field.key]:e.target.value}))} className="mt-1 w-full p-2 border border-slate-300 rounded-lg font-normal disabled:bg-slate-100 disabled:text-slate-500" /></label>)}
      </div><div className="flex justify-end"><button disabled={!isAdmin} type="submit" className="px-4 py-2 bg-teal-700 hover:bg-teal-600 disabled:bg-slate-300 text-white rounded-lg font-bold flex items-center gap-2"><Save className="w-4 h-4" />حفظ بيانات المحطة</button></div></form>
    </div>
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs"><div className="flex flex-wrap items-center justify-between gap-2 mb-3"><h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Shield className="w-4 h-4 text-teal-600" />مصفوفة الصلاحيات والأدوار التجريبية</h3><button onClick={saveMatrix} disabled={!isAdmin} className="px-3 py-2 rounded-lg bg-teal-700 text-white text-xs font-bold disabled:bg-slate-300"><Save className="w-3.5 h-3.5 inline ml-1"/>حفظ الصلاحيات</button></div><p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">هذه إعدادات صلاحيات تجريبية محفوظة في هذا المتصفح وليست بديلًا عن التفويض الآمن على الخادم. لا تستخدمها لحماية بيانات تشغيلية حقيقية.</p>
      <div className="overflow-x-auto"><table className="w-full text-right text-xs"><thead className="bg-slate-50 border-b"><tr><th className="p-3">الدور الوظيفي</th>{permissionColumns.map(c=><th key={c.key} className="p-3 text-center">{c.label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{roles.map(role=><tr key={role.id}><td className="p-3 font-bold">{role.label}<div className="font-normal text-slate-400">{role.en}</div></td>{permissionColumns.map(c=><td key={c.key} className="p-3 text-center"><input aria-label={`${role.label} - ${c.label}`} type="checkbox" checked={Boolean(matrix[role.id]?.[c.key])} disabled={!isAdmin || role.id==='normal_user' && c.key==='settings'} onChange={e=>togglePermission(role.id,c.key,e.target.checked)} className="h-4 w-4 accent-teal-700"/></td>)}</tr>)}</tbody></table></div><p className="text-[11px] text-slate-500 mt-3">ملاحظة: التغييرات هنا تحفظ إعدادات مصفوفة العرض. تطبيقها كحماية أمنية كاملة على كل العمليات يتطلب مصادقة وخادمًا موثوقًا.</p>
    </div>
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs"><h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-2"><Download className="w-4 h-4 text-teal-600"/>النسخ الاحتياطي والاستعادة</h3><p className="text-xs text-slate-500 mb-4">يحتوي ملف النسخة الاحتياطية على إعدادات المحطة والسجلات المتاحة في التطبيق وقت التصدير.</p><div className="flex flex-wrap gap-3"><button onClick={handleExportBackup} className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"><Download className="w-4 h-4"/>تصدير نسخة احتياطية JSON</button><button onClick={()=>{if(confirm('هل تؤكد إعادة ضبط بيانات التجربة؟ سيتم فقد التعديلات المحلية الحالية.')) resetDemoData();}} disabled={!isAdmin} className="flex items-center gap-2 px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-semibold disabled:opacity-50"><RotateCcw className="w-4 h-4"/>استعادة بيانات التجربة</button></div><div className="mt-4 border-t pt-4"><label className="block text-xs font-semibold text-slate-700 mb-2">استعادة ملف نسخة احتياطية JSON</label><div className="flex flex-wrap items-center gap-3"><input type="file" accept=".json,application/json" disabled={!isAdmin} onChange={e=>setBackupFile(e.target.files?.[0] || null)} className="text-xs"/><button onClick={handleImportBackup} disabled={!isAdmin || !backupFile} className="px-3 py-2 rounded-lg bg-teal-700 text-white text-xs font-bold disabled:bg-slate-300"><Upload className="w-3.5 h-3.5 inline ml-1"/>استيراد واستعادة</button></div><p className="text-[11px] text-slate-500 mt-2">لا تستورد ملفات من مصدر غير موثوق. ستُستبدل البيانات المحلية بعد تأكيدك.</p></div></div>
    <div className="text-[11px] text-slate-500 flex items-start gap-2"><FileCheck2 className="w-4 h-4 shrink-0"/>النسخة الحالية تعمل محليًا في المتصفح. لا تتم مزامنة التعديلات تلقائيًا بين أجهزة متعددة، كما أن صلاحيات الواجهة ليست حماية إنتاجية بدون خادم.</div>
  </div>;
};
