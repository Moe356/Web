import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLogEntry } from '../../types';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Clock,
  User,
  Shield,
  FileText,
  Lock,
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs, language, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetEntity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const actionBadges: Record<AuditLogEntry['action'], { ar: string; class: string }> = {
    CREATE: { ar: 'إنشاء قيد', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    UPDATE: { ar: 'تعديل بيانات', class: 'bg-blue-100 text-blue-800 border-blue-200' },
    STATUS_CHANGE: { ar: 'تغيير مرحلة', class: 'bg-amber-100 text-amber-800 border-amber-200' },
    APPROVE: { ar: 'مصادقة واعتماد', class: 'bg-purple-100 text-purple-800 border-purple-200' },
    REJECT: { ar: 'رفض إداري', class: 'bg-red-100 text-red-800 border-red-200' },
    DELETE: { ar: 'حذف', class: 'bg-red-200 text-red-900 border-red-300' },
    EXPORT: { ar: 'تصدير بيانات', class: 'bg-slate-100 text-slate-800 border-slate-300' },
    RESET: { ar: 'استعادة نظام', class: 'bg-orange-100 text-orange-900 border-orange-300' },
  };

  const handleExportAudit = () => {
    const jsonStr = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kadhimiya_audit_log_${new Date().toISOString().substring(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('تم تصدير سجل النشاط التجريبي بصيغة JSON', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>{language === 'ar' ? 'سجل النشاط التجريبي' : 'Demo Activity Log'}</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold tabular-nums">
              {auditLogs.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar'
              ? 'سجل محلي قابل للتعديل ضمن المتصفح لأغراض التجربة فقط؛ لا يمثل سجلاً رقابياً رسمياً'
              : 'Browser-local demo activity history; not an immutable or official audit record'}
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-center"
        >
          <Download className="w-4 h-4" />
          <span>تصدير سجل العرض (JSON)</span>
        </button>
      </div>

      {/* Demo log disclosure */}
      <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl text-xs flex items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            هذا سجل تجريبي محفوظ في المتصفح ويمكن تغييره أو مسحه. لا يتضمن تحققاً تشفيرياً أو تدقيقاً مستقلاً، ولا يُعد سجلاً رسمياً.
          </span>
        </div>
        <span className="font-mono text-[10px] text-teal-300 bg-slate-800 px-2 py-1 rounded">
          DEMO LOG ONLY
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute top-2.5 start-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'البحث باسم المستخدم، الكيان، أو تفاصيل الإجراء...' : 'Search audit log...'}
            className="w-full ps-9 pe-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-600 bg-slate-50 focus:bg-white"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="text-xs py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-teal-600"
        >
          <option value="all">كافة أنواع الإجراءات (All Actions)</option>
          <option value="CREATE">إنشاء (CREATE)</option>
          <option value="UPDATE">تعديل (UPDATE)</option>
          <option value="STATUS_CHANGE">تغيير مرحلة (STATUS_CHANGE)</option>
          <option value="APPROVE">مصادقة واعتماد (APPROVE)</option>
          <option value="REJECT">رفض (REJECT)</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4">رقم القيد</th>
                <th className="py-3 px-4">التاريخ والوقت</th>
                <th className="py-3 px-4">المستخدم والصفة</th>
                <th className="py-3 px-4">نوع الإجراء</th>
                <th className="py-3 px-4">الكيان المتأثر</th>
                <th className="py-3 px-4">التفاصيل التشغيلية</th>
                <th className="py-3 px-4">عنوان IP (غير متاح في العرض)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {log.id}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{log.actorName}</div>
                    <div className="text-[10px] text-teal-800 font-mono">{log.actorRole}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${actionBadges[log.action]?.class || ''}`}>
                      {actionBadges[log.action]?.ar || log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                    {log.targetEntity} / {log.targetId}
                  </td>
                  <td className="py-3 px-4 text-slate-800 max-w-sm">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {log.ipAddress || 'غير متاح — سجل تجريبي'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
