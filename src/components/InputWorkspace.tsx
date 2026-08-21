import React, { useState, useRef } from 'react';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  Gauge,
  Layers,
  Trash2,
  Upload,
  FileCheck,
  X,
  FileUp,
  Zap,
  Rocket,
  GraduationCap,
  Check,
} from 'lucide-react';
import { SAMPLE_PRESETS, SamplePreset } from '../data/presets';
import { UserPersonaMode } from '../types';
import { PERSONA_CONFIGS, getPersonaConfig } from '../utils/persona';

export interface FileUploadPayload {
  name: string;
  size: number;
  mimeType: string;
  base64?: string;
  extractedText?: string;
}

interface Props {
  currentPersona: UserPersonaMode;
  onPersonaChange: (persona: UserPersonaMode) => void;
  onDeconstruct: (params: {
    subjectName: string;
    studyText: string;
    file?: { name: string; mimeType: string; base64: string };
    studyDays: number;
    dailyHours: number;
    targetDifficulty: string;
    focusMode: string;
    userPersona: UserPersonaMode;
  }) => void;
  isLoading: boolean;
}

const QUICK_SUBJECTS = [
  'فيزياء ⚡',
  'كيمياء 🧪',
  'رياضيات 📐',
  'أحياء 🧬',
  'برمجة 💻',
  'لغات وقواعد 📖',
  'تاريخ وقانون ⚖️',
  'إدارة واقتصاد 📊',
];

export const InputWorkspace: React.FC<Props> = ({
  currentPersona,
  onPersonaChange,
  onDeconstruct,
  isLoading,
}) => {
  const [subjectName, setSubjectName] = useState<string>('');
  const [studyText, setStudyText] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<FileUploadPayload | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [studyDays, setStudyDays] = useState<number>(3);
  const [dailyHours, setDailyHours] = useState<number>(2);
  const [targetDifficulty, setTargetDifficulty] = useState<string>('متوسط');
  const [focusMode, setFocusMode] = useState<string>('متوازن');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const personaConfig = getPersonaConfig(currentPersona);

  const personaModes: {
    id: UserPersonaMode;
    name: string;
    badge: string;
    desc: string;
    icon: string;
    lucide: any;
    borderActive: string;
  }[] = [
    {
      id: 'gen_z',
      name: 'جيل Z (روقان وتركيز)',
      badge: 'Gen-Z ⚡',
      desc: 'تاسكات خفيفة ع الرايق وتظبيط التارجت مع قيمنا وأخلاقنا',
      icon: '⚡',
      lucide: Zap,
      borderActive: 'border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-400/40',
    },
    {
      id: 'gen_alpha',
      name: 'جيل ألفا (الأبطال والمراحل)',
      badge: 'Alpha Hero 🚀',
      desc: 'مغامرة المذاكرة وتحدي المراحل وشحن طاقة التركيز الخارقة',
      icon: '🚀',
      lucide: Rocket,
      borderActive: 'border-fuchsia-400 bg-fuchsia-950/40 text-fuchsia-300 ring-1 ring-fuchsia-400/40',
    },
    {
      id: 'classic',
      name: 'النمط الأكاديمي (المنهجي والرصين)',
      badge: 'Academic 🎓',
      desc: 'الخطة والجدول الأكاديمي المعتمد للطلاب والجامعيين',
      icon: '🎓',
      lucide: GraduationCap,
      borderActive: 'border-emerald-400 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-400/40',
    },
  ];

  const handleSelectPreset = (preset: SamplePreset) => {
    setSelectedPresetId(preset.id);
    setSubjectName(preset.name);
    setStudyText(preset.text);
    setUploadedFile(null);
    setStudyDays(preset.days);
    setDailyHours(preset.hours);
    setTargetDifficulty(preset.difficulty);
    setUploadError(null);
  };

  const handleFileProcess = (file: File) => {
    setUploadError(null);
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > 15) {
      setUploadError('حجم الملف كبير جداً. يرجى اختيار ملف بحجم أقل من 15 ميجابايت.');
      return;
    }

    const fileName = file.name;
    const mimeType = file.type || 'application/octet-stream';
    const isTextFile =
      file.type.startsWith('text/') ||
      fileName.endsWith('.txt') ||
      fileName.endsWith('.md') ||
      fileName.endsWith('.json') ||
      fileName.endsWith('.csv');

    if (isTextFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const textContent = (e.target?.result as string) || '';
        setStudyText(textContent);
        setUploadedFile({
          name: fileName,
          size: file.size,
          mimeType: 'text/plain',
          extractedText: textContent,
        });
        if (!subjectName) {
          const cleanName = fileName.replace(/\.[^/.]+$/, '');
          setSubjectName(cleanName);
        }
      };
      reader.onerror = () => {
        setUploadError('تعذر قراءة الملف النصي.');
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = (e.target?.result as string) || '';
        setUploadedFile({
          name: fileName,
          size: file.size,
          mimeType: mimeType || 'application/pdf',
          base64: base64String,
        });
        if (!subjectName) {
          const cleanName = fileName.replace(/\.[^/.]+$/, '');
          setSubjectName(cleanName);
        }
      };
      reader.onerror = () => {
        setUploadError('تعذر معالجة الملف المرفوع.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAll = () => {
    setSubjectName('');
    setStudyText('');
    setUploadedFile(null);
    setSelectedPresetId('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studyText.trim() && !uploadedFile?.base64) {
      setUploadError('يرجى كتابة نص المذكرة أو رفع ملف دراسي للبدء بتوليد الخطة.');
      return;
    }

    onDeconstruct({
      subjectName: subjectName.trim() || 'مادة دراسية',
      studyText,
      file: uploadedFile?.base64
        ? {
            name: uploadedFile.name,
            mimeType: uploadedFile.mimeType,
            base64: uploadedFile.base64,
          }
        : undefined,
      studyDays,
      dailyHours,
      targetDifficulty,
      focusMode,
      userPersona: currentPersona,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const wordCount = studyText.trim() ? studyText.trim().split(/\s+/).length : 0;
  const hasValidInput = Boolean(studyText.trim() || uploadedFile?.base64);

  return (
    <form id="input-workspace-form" onSubmit={handleSubmit} className="space-y-6">
      {/* 0. User Persona Mode Selector (3 Generational Modes) */}
      <div className="bg-[#0B0F17]/90 border border-cyan-500/20 rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-xl relative overflow-hidden transition-all">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{personaConfig.icon}</span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>تحديد نمط لغة ومصطلحات المذاكرة</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  3 أنماط تفاعلية
                </span>
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                اختر النمط المناسب لك ليتم تكييف أسماء التاسكات، الفواصل، وجلسات التركيز بما يناسبك
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {personaModes.map((m) => {
            const isSelected = currentPersona === m.id;
            return (
              <button
                key={m.id}
                id={`input-persona-select-${m.id}`}
                type="button"
                onClick={() => onPersonaChange(m.id)}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between relative group ${
                  isSelected
                    ? m.borderActive
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.05] text-white/70 hover:text-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{m.icon}</span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                        <Check className="w-3 h-3" />
                        محدد
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-sm text-white">{m.name}</div>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Subject & Topic Specification */}
      <div className="bg-[#0B0F17]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl relative overflow-hidden transition-all duration-300">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              1. اسم المادة أو الموضوع
            </h3>
            <p className="text-xs text-white/50">
              اكتب اسم المادة أو الفصل الذي تود مذاكرته
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          <input
            id="input-subject-name"
            type="text"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="مثال: فيزياء 3 - قانون أوم والدوائر، أو كيمياء - الكيمياء العضوية..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans transition-all"
            required
          />

          {/* Quick Subject Suggestions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-white/40 font-mono ml-1">اقتراحات سريعة:</span>
            {QUICK_SUBJECTS.map((sub, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSubjectName(sub.replace(/\s[\u{1F300}-\u{1F9FF}]/u, ''))}
                className="text-xs px-3 py-1 rounded-xl bg-white/5 hover:bg-cyan-500/15 hover:text-cyan-300 text-white/70 border border-white/5 hover:border-cyan-500/30 transition-all active:scale-95"
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. File Upload & Text Material Input */}
      <div className="bg-[#0B0F17]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl relative overflow-hidden transition-all duration-300">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                2. محتوى المذاكرة (رفع ملف أو كتابة النص)
              </h3>
              <p className="text-xs text-white/50">
                اسحب ملف PDF، ملخص، أو الصق محتوى الدرس مباشرة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-300">
              حتى 15 ميجابايت
            </span>

            {(studyText || uploadedFile) && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-rose-400 hover:text-rose-300 text-xs px-3 py-1.5 rounded-xl bg-rose-950/20 border border-rose-900/30 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>إفراغ</span>
              </button>
            )}
          </div>
        </div>

        {uploadError && (
          <div className="mb-4 bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs p-3.5 rounded-2xl flex items-start gap-2.5">
            <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-100 mb-0.5">تنبيه أثناء التحميل:</div>
              <div>{uploadError}</div>
            </div>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div
          id="file-drop-zone"
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
              : uploadedFile
              ? 'border-cyan-500/40 bg-cyan-950/15'
              : 'border-white/10 bg-white/[0.01] hover:border-cyan-500/30 hover:bg-white/[0.03]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md,.rtf,.json,.png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {uploadedFile ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="font-bold text-white text-base">{uploadedFile.name}</div>
              <div className="text-xs font-mono text-cyan-400 flex items-center gap-2">
                <span>الحجم: {formatFileSize(uploadedFile.size)}</span>
                <span>•</span>
                <span>النوع: {uploadedFile.mimeType}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">جاهز للتحليل ✓</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="mt-2 text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>إلغاء الملف المرفوع</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
                <FileUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  اسحب ملف المذكرة هنا، أو{' '}
                  <span className="text-cyan-400 underline underline-offset-4">
                    اضغط لاختياره من جهازك
                  </span>
                </p>
                <p className="text-xs text-white/40 mt-1">
                  يدعم PDF، مستندات Word، نصوص TXT والصور حتى 15 ميجابايت
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Text Input Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs font-mono text-white/40 uppercase">
            أو الصق النص مباشرة هنا
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            id="raw-study-input"
            rows={6}
            value={studyText}
            onChange={(e) => {
              setStudyText(e.target.value);
              setSelectedPresetId('');
            }}
            placeholder="الصق هنا محتوى المذكرة، النقاط المهمة، القوانين، أو نصوص المحاضرة..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm leading-relaxed placeholder-white/25 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans transition-all resize-y"
          />
          <div className="absolute bottom-3 left-3 text-[11px] font-mono text-white/40 bg-black/60 px-2 py-0.5 rounded-lg border border-white/5">
            {wordCount} كلمة
          </div>
        </div>

        {/* Preset Samples */}
        <div className="mt-5 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-mono text-white/50 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              نماذج جاهزة سريعة للتجربة:
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SAMPLE_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-right p-3 rounded-2xl border text-xs transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 text-white'
                      : 'bg-white/[0.02] border-white/5 text-white/70 hover:border-white/20 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs truncate text-white">{preset.name}</div>
                  <div className="text-[10px] font-mono text-white/40 mt-1">
                    {preset.days} أيام • {preset.hours} س/يوم
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Planning Parameters */}
      <div className="bg-[#0B0F17]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              3. إعدادات جدول المذاكرة وتوزيع التاسكات
            </h3>
            <p className="text-xs text-white/50">
              حدد الأيام والساعات المتاحة لتوزيع المهام بذكاء
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Study Days */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs text-white/40 mb-2 font-mono">
              <span className="flex items-center gap-1.5 text-white/80">
                <Calendar className="w-4 h-4 text-cyan-400" />
                الأيام المتاحة:
              </span>
              <span className="text-sm font-bold text-cyan-400">{studyDays} أيام</span>
            </div>
            <input
              type="range"
              min="1"
              max="14"
              value={studyDays}
              onChange={(e) => setStudyDays(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-white/10 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/30 mt-1.5 font-mono">
              <span>يوم 1</span>
              <span>7 أيام</span>
              <span>14 يوم</span>
            </div>
          </div>

          {/* Daily Study Hours */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs text-white/40 mb-2 font-mono">
              <span className="flex items-center gap-1.5 text-white/80">
                <Clock className="w-4 h-4 text-cyan-400" />
                الساعات اليومية:
              </span>
              <span className="text-sm font-bold text-cyan-400">{dailyHours} ساعة</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="8"
              step="0.5"
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-white/10 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/30 mt-1.5 font-mono">
              <span>نصف ساعة</span>
              <span>4 ساعات</span>
              <span>8 ساعات</span>
            </div>
          </div>

          {/* Target Difficulty */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <label className="flex items-center gap-1.5 text-xs text-white/80 mb-2">
              <Gauge className="w-4 h-4 text-purple-400" />
              مستوى الصعوبة:
            </label>
            <select
              value={targetDifficulty}
              onChange={(e) => setTargetDifficulty(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="مبتدئ">مبتدئ (تبسيط وتدرج عالي)</option>
              <option value="متوسط">متوسط (توازن بين الفهم والممارسة)</option>
              <option value="متقدم">متقدم (تطبيقات عميقة وحل مكثف)</option>
            </select>
          </div>

          {/* Cognitive Focus Style */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <label className="flex items-center gap-1.5 text-xs text-white/80 mb-2">
              <Layers className="w-4 h-4 text-purple-400" />
              أسلوب التركيز:
            </label>
            <select
              value={focusMode}
              onChange={(e) => setFocusMode(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="متوازن">متوازن (تنوع بين الحفظ والحل)</option>
              <option value="تطبيقي مكثف">تطبيقي مكثف (تركيز على المسائل)</option>
              <option value="استذكار نشط">استذكار نشط (تركيز على الحفظ السريع)</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            id="btn-deconstruct-trigger"
            type="submit"
            disabled={isLoading || !hasValidInput}
            className={`w-full py-4 px-8 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-xl ${
              isLoading || !hasValidInput
                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                : 'bg-white text-black hover:bg-cyan-400 hover:text-black active:scale-[0.99] shadow-cyan-500/10'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>جاري معالجة وتفكيك المنهج ذكياً...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>{personaConfig.terms.createPlanBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
