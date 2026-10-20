import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdministrativeDocument, DocumentCategory } from '../../types';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Printer,
  CheckCircle2,
  Lock,
  Clock,
  Send,
  X,
  FileCheck,
  Shield,
  ImagePlus,
} from 'lucide-react';
import { ASSETS } from '../../assets/assetPaths';

export const CorrespondenceView: React.FC = () => {
  const {
    documents,
    createDocument,
    updateDocumentStatus,
    acknowledgeDocument,
    language,
    currentUser,
    canPerform,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedDoc, setSelectedDoc] = useState<AdministrativeDocument | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [attachments, setAttachments] = useState<{name:string; dataUrl:string; mimeType:string}[]>([]);

  const [newDocForm, setNewDocForm] = useState({
    title: '',
    category: 'official_letter' as DocumentCategory,
    categoryAr: 'كتاب رسمي',
    targetDepartment: 'شعبة المحطات',
    content: '',
    requiresAcknowledgement: true,
    isConfidential: false,
  });

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.refNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categoryLabels: Record<DocumentCategory, { ar: string; class: string }> = {
    official_letter: { ar: 'كتاب رسمي', class: 'bg-teal-50 text-teal-800 border-teal-200' },
    memorandum: { ar: 'مطالعة', class: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    official_order: { ar: 'أمر إداري ملزم', class: 'bg-red-50 text-red-800 border-red-200' },
    circular: { ar: 'تعميم إداري', class: 'bg-blue-50 text-blue-800 border-blue-200' },
    leave_request: { ar: 'طلب إجازة رسمية', class: 'bg-purple-50 text-purple-800 border-purple-200' },
    material_request: { ar: 'طلب صرف مواد', class: 'bg-amber-50 text-amber-800 border-amber-200' },
    announcement: { ar: 'إعلان داخلي', class: 'bg-teal-50 text-teal-800 border-teal-200' },
  };

  const handleImageSelection = async (files: FileList | null) => {
    if (!files) return;
    const batch = Array.from(files);
    if (attachments.length + batch.length > 3) {
      showToast('الحد الأقصى 3 صور لكل كتاب في النسخة التجريبية.', 'warning'); return;
    }
    const accepted = batch.filter(f => ['image/jpeg','image/png','image/webp'].includes(f.type) && f.size <= 750_000);
    if (accepted.length !== batch.length) showToast('يُسمح بصور JPG/PNG/WebP فقط، بحجم أقل من 750 كيلوبايت للصورة.', 'warning');
    const converted = await Promise.all(accepted.map(f => new Promise<{name:string;dataUrl:string;mimeType:string}>((resolve,reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({name:f.name, dataUrl:String(reader.result), mimeType:f.type});
      reader.onerror = () => reject(new Error('تعذرت قراءة الصورة'));
      reader.readAsDataURL(f);
    })));
    setAttachments(prev => [...prev, ...converted].slice(0,3));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocForm.title || !newDocForm.content) {
      showToast('يرجى ملء عنوان الوثيقة والنص الرسمي الكامل.', 'warning');
      return;
    }

    createDocument({
      ...newDocForm,
      attachments,
      issuerName: currentUser.name,
      issuerRole: currentUser.roleTitleAr,
      totalRecipientsCount: 32,
      acknowledgedCount: 0,
    });

    setShowAddModal(false);
    setAttachments([]);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>{language === 'ar' ? 'الكتب والقرارات والأوامر الإدارية' : 'Official Administrative Orders & Circulars'}</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold tabular-nums">
              {documents.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar'
              ? 'الأوامر الملزمة، تعاميم السلامة، طلبات الإجازة، ومتابعة توقيعات العلم والاستلام'
              : 'Official municipal decrees, safety circulars, leave requests, and acknowledgements'}
          </p>
        </div>

        {canPerform('issue_document') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إصدار كتاب أو أمر إداري' : 'Issue Document'}</span>
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
            placeholder={language === 'ar' ? 'البحث بالرقم الإشاري، العنوان، أو مضمون الكتاب...' : 'Search official documents...'}
            className="w-full ps-9 pe-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-600 bg-slate-50 focus:bg-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-teal-600"
        >
          <option value="all">كافة الوثائق والمراسلات</option>
          <option value="official_letter">كتاب رسمي</option>
          <option value="memorandum">مطالعة</option>
          <option value="official_order">أوامر إدارية سابقة</option>
          <option value="circular">تعاميم إدارية</option>
          <option value="leave_request">طلبات إجازة</option>
        </select>
      </div>

      {/* Documents Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${categoryLabels[doc.category]?.class || ''}`}>
                  {categoryLabels[doc.category]?.ar || doc.category}
                </span>
                <span className="font-mono text-[11px] text-slate-500">{doc.issueDate}</span>
              </div>

              <div className="font-mono font-bold text-xs text-teal-800 mb-1">{doc.refNumber}</div>
              <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-tight mb-2">
                {doc.title}
              </h3>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                {doc.content}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate max-w-[140px]">المصدر: {doc.issuerName}</span>
              {doc.requiresAcknowledgement && (
                <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  وقع: {doc.acknowledgedCount || 0} / {doc.totalRecipientsCount || 32}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Official Print-Ready Document Viewer Modal */}
      {selectedDoc && (
        <div className="correspondence-print-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Modal Controls Bar */}
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between no-print">
              <span className="font-mono text-xs text-teal-400 font-bold">
                معاينة الوثيقة الإدارية الرسمية
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة رسمية</span>
                </button>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Municipal Letterhead & Content */}
            <div className="print-document correspondence-print p-8 overflow-y-auto space-y-6 text-slate-900">
              {/* Header Letterhead */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-amber-500/40 shrink-0">
                  <img
                    src={ASSETS.municipalLogo}
                    alt="شعار بلدية الكاظمية المقدسة"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-center space-y-0.5 flex-1">
                  <div className="text-sm font-bold tracking-wide">جمهورية العراق - أمانة بغداد</div>
                  <div className="text-xs text-slate-700">دائرة مجاري بغداد - قسم مجاري بلدية الكاظمية المقدسة</div>
                  <div className="text-sm font-bold text-teal-900">محطة عبد المحسن الكاظمي لرفع ومعالجة مياه الصرف الصحي</div>
                </div>
                <div className="w-16 h-16 shrink-0 hidden sm:block">
                  <img
                    src={ASSETS.municipalLogo}
                    alt="شعار بلدية الكاظمية المقدسة"
                    className="w-full h-full object-cover rounded-full ring-2 ring-amber-500/40 opacity-90"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {!!selectedDoc.attachments?.length && <div className="space-y-2">
                <h4 className="font-bold text-sm">الصور الرسمية المرفقة</h4>
                {selectedDoc.attachments.map((file,i) => <a href={file.dataUrl} target="_blank" rel="noreferrer" key={i} className="block">
                  <img src={file.dataUrl} alt={file.name} className="w-full max-h-96 object-contain border rounded-lg" />
                  <span className="text-xs text-teal-700">{file.name}</span>
                </a>)}
              </div>}
              {/* Reference and Date Bar */}
              <div className="flex items-center justify-between text-xs font-mono border-b border-slate-200 pb-2">
                <div>العدد المرجعي: <span className="font-bold">{selectedDoc.refNumber}</span></div>
                <div>التاريخ: <span className="font-bold">{selectedDoc.issueDate}</span></div>
              </div>

              {/* Title */}
              <div className="text-center my-4">
                <h2 className="text-base font-extrabold text-slate-950 underline underline-offset-8">
                  {selectedDoc.title}
                </h2>
                <div className="text-xs text-slate-600 mt-2">
                  إلى: <span className="font-bold">{selectedDoc.targetDepartment}</span>
                </div>
              </div>

              {/* Body Content */}
              <div className="text-xs leading-loose text-slate-900 text-justify p-4 rounded-xl bg-slate-50 border border-slate-200">
                {selectedDoc.content}
              </div>

              {/* Signatures Lockup */}
              <div className="pt-6 flex justify-between items-end text-xs">
                <div>
                  <div className="text-slate-500 text-[11px]">نسخة منه إلى:</div>
                  <ul className="text-[10px] text-slate-600 space-y-0.5 mt-1 list-disc list-inside">
                    <li>مكتب مدير عام دائرة المجاري - أمانة بغداد</li>
                    <li>شعبة السلامة والصحة المهنية</li>
                    <li>أرشيف المحطة والذاتية</li>
                  </ul>
                </div>

                <div className="text-center space-y-1">
                  <div className="font-bold text-slate-900">{selectedDoc.issuerName}</div>
                  <div className="text-[11px] text-slate-600">{selectedDoc.issuerRole}</div>
                  <div className="w-24 h-10 border-b border-dashed border-slate-400 mx-auto mt-2 flex items-center justify-center text-[10px] text-slate-400">
                    [توقيع إلكتروني معتمد]
                  </div>
                </div>
              </div>

              {/* Staff Acknowledgement Signature Button */}
              {selectedDoc.requiresAcknowledgement && (
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between no-print">
                  <div>
                    <div className="font-bold text-xs text-teal-950">إشعار العلم والاستلام:</div>
                    <div className="text-[11px] text-teal-800">
                      تم توقيع إشعار العلم من قِبل {selectedDoc.acknowledgedCount || 0} موظفاً حتى الآن.
                    </div>
                  </div>
                  <button
                    onClick={() => acknowledgeDocument(selectedDoc.id)}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    توقيع العلم بالقرار
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <span>إصدار وثيقة رسمية</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">صنف الوثيقة:</label>
                <select
                  value={newDocForm.category}
                  onChange={(e) => {
                    const cat = e.target.value as DocumentCategory;
                    const catNames: Record<DocumentCategory, string> = {
                      official_letter: 'كتاب رسمي',
                      memorandum: 'مطالعة',
                      official_order: 'أمر إداري ملزم',
                      circular: 'تعميم إداري',
                      leave_request: 'طلب إجازة رسمية',
                      material_request: 'طلب صرف مواد',
                      announcement: 'إعلان داخلي',
                    };
                    setNewDocForm({
                      ...newDocForm,
                      category: cat,
                      categoryAr: catNames[cat],
                    });
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="official_letter">كتاب رسمي</option>
                  <option value="memorandum">مطالعة</option>
                  <option value="leave_request">طلب إجازة رسمي</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">عنوان الموضوع: *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تعليمات تشغيل مضخات الطوارئ خلال هطول الأمطار الغزيرة"
                  value={newDocForm.title}
                  onChange={(e) => setNewDocForm({ ...newDocForm, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">الشعبة أو الدائرة:</label>
                <select
                  required
                  value={newDocForm.targetDepartment}
                  onChange={(e) => setNewDocForm({ ...newDocForm, targetDepartment: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {['شعبة الصيانة', 'شعبة المحطات', 'شعبة التنفيذ', 'الوحدة الادارية', 'مفرزه كهربائيه', 'مفرزه مكانيكة', 'مفرزه المولدات'].map(department => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">النص الرسمي الكامل: *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="بناءً على مقتضيات المصلحة العامة وتوجيهات أمانة بغداد..."
                  value={newDocForm.content}
                  onChange={(e) => setNewDocForm({ ...newDocForm, content: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="space-y-2 border border-dashed rounded-lg p-3">
                <label className="flex gap-2 items-center font-bold text-slate-800"><ImagePlus className="w-4 h-4"/> إرفاق صور الكتب والقرارات الرسمية</label>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => { void handleImageSelection(e.target.files); e.target.value = ''; }} className="w-full text-xs" />
                <p className="text-[11px] text-amber-700">نسخة تجريبية: حتى 3 صور، 750 كيلوبايت للصورة. تُخزن محلياً في المتصفح وليست مناسبة لأرشفة مستندات رسمية فعلية.</p>
                {attachments.map((f,i)=><div key={i} className="flex justify-between gap-2 text-xs"><span>{f.name}</span><button type="button" onClick={()=>setAttachments(v=>v.filter((_,j)=>j!==i))} className="text-red-600">إزالة</button></div>)}
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
                  إصدار وتعميم الوثيقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
