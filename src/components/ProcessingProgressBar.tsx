import React, { useEffect, useState } from 'react';
import { Sparkles, Brain, Cpu, Clock, CheckCircle2, ShieldAlert, XCircle, RefreshCw } from 'lucide-react';

interface Props {
  isLoading: boolean;
  file?: { name: string; size?: number; mimeType?: string };
  subjectName?: string;
  onCancel?: () => void;
  error?: string | null;
  onRetry?: () => void;
}

interface StepInfo {
  id: number;
  label: string;
  estimatedSeconds: number;
  icon: React.ReactNode;
}

const DECONSTRUCTION_STEPS: StepInfo[] = [
  {
    id: 1,
    label: 'قراءة وتحليل هيكل الملف والمحتوى الدراسي',
    estimatedSeconds: 4,
    icon: <Brain className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 2,
    label: 'تحديد نوعية الحمل الإدراكي (حفظ، فهم، مسائل، قراءة عميقة)',
    estimatedSeconds: 6,
    icon: <Cpu className="w-4 h-4 text-purple-400" />,
  },
  {
    id: 3,
    label: 'تفكيك الموضوعات إلى Micro-Tasks متوازنة وقابلة للإنجاز',
    estimatedSeconds: 7,
    icon: <Sparkles className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 4,
    label: 'توزيع الجلسات وجدولة فترات البومودورو المخصصة',
    estimatedSeconds: 5,
    icon: <Clock className="w-4 h-4 text-emerald-400" />,
  },
];

export const ProcessingProgressBar: React.FC<Props> = ({
  isLoading,
  file,
  subjectName,
  onCancel,
  error,
  onRetry,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Total estimated time calculation based on file presence and size
  const totalEstimatedSeconds = file ? 22 : 15;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isLoading) {
      setProgress(5);
      setElapsedSeconds(0);
      setCurrentStepIndex(0);

      const startTime = Date.now();

      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const currentElapsedSec = Math.floor(elapsed);
        setElapsedSeconds(currentElapsedSec);

        // Smooth asymptotic progress calculation
        // It reaches ~92% around totalEstimatedSeconds, and slowly inches to 97% if model takes longer
        let calculatedPct = 0;
        if (elapsed <= totalEstimatedSeconds) {
          calculatedPct = 5 + (elapsed / totalEstimatedSeconds) * 85;
        } else {
          const extraTime = elapsed - totalEstimatedSeconds;
          calculatedPct = 90 + Math.min(8, (extraTime / 15) * 8);
        }

        setProgress(Math.min(98, Math.round(calculatedPct)));

        // Update active step based on progress
        if (calculatedPct < 25) {
          setCurrentStepIndex(0);
        } else if (calculatedPct < 55) {
          setCurrentStepIndex(1);
        } else if (calculatedPct < 85) {
          setCurrentStepIndex(2);
        } else {
          setCurrentStepIndex(3);
        }
      }, 250);
    } else {
      if (!error && progress > 0) {
        setProgress(100);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, totalEstimatedSeconds, error]);

  if (!isLoading && !error) return null;

  const remainingSeconds = Math.max(0, totalEstimatedSeconds - elapsedSeconds);

  return (
    <div
      id="processing-progress-container"
      className={`rounded-2xl border p-6 sm:p-7 shadow-2xl transition-all duration-300 ${
        error
          ? 'bg-rose-950/30 border-rose-800/80 text-rose-100'
          : 'bg-[#0B0F17] border-cyan-500/30 text-white shadow-cyan-950/20'
      }`}
    >
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              error
                ? 'bg-rose-900/30 border-rose-700 text-rose-400'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}
          >
            {error ? (
              <XCircle className="w-5 h-5" />
            ) : (
              <div className="relative">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            )}
          </div>

          <div>
            <div className="text-sm sm:text-base font-serif font-bold text-white flex items-center gap-2">
              <span>
                {error
                  ? 'توقفت المعالجة'
                  : `جاري تفكيك مادة: ${subjectName || 'المقرر الدراسي'}`}
              </span>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              {error
                ? 'حدث توقف أثناء التفكيك الإدراكي، يمكنك مراجعة السبب وإعادة المحاولة أدناه'
                : file
                ? `معالجة الملف المرفوع (${file.name}) وتحويله إلى مهام مصغّرة`
                : 'تحليل النصوص وتطبيق منهجية التفكيك الإدراكي وبومودورو'}
            </p>
          </div>
        </div>

        {/* Estimated Time / Timer Badge */}
        {!error && (
          <div className="flex items-center gap-3 bg-black/40 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-mono">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Clock className="w-3.5 h-3.5" />
              <span>الوقت المنقضي: {elapsedSeconds} ثانية</span>
            </div>
            <span className="text-white/20">•</span>
            <div className="text-white/70">
              <span>
                الفترة المقدرة: ~{totalEstimatedSeconds} ثانية{' '}
                {remainingSeconds > 0 && `(متبقي ~${remainingSeconds}ث)`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar & Percentage */}
      {!error && (
        <div className="space-y-2 my-5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              {DECONSTRUCTION_STEPS[currentStepIndex]?.label || 'جاري المعالجة...'}
            </span>
            <span className="text-white font-bold text-sm">{progress}%</span>
          </div>

          <div className="w-full bg-black/60 h-2.5 rounded-full overflow-hidden border border-white/10 relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-400 transition-all duration-300 rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)]" />
            </div>
          </div>
        </div>
      )}

      {/* Step Breakdown Indicators */}
      {!error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
          {DECONSTRUCTION_STEPS.map((step, idx) => {
            const isCompleted = currentStepIndex > idx;
            const isCurrent = currentStepIndex === idx;
            return (
              <div
                key={step.id}
                className={`p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                  isCurrent
                    ? 'bg-cyan-500/10 border-cyan-400/60 text-white shadow-sm'
                    : isCompleted
                    ? 'bg-white/[0.03] border-white/10 text-white/80'
                    : 'bg-white/[0.01] border-white/5 text-white/30'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="font-semibold">{step.label}</div>
                  <div className="text-[10px] font-mono text-white/40">
                    {isCompleted
                      ? 'تم الإنجاز ✓'
                      : isCurrent
                      ? 'قيد المعالجة الآن...'
                      : `~${step.estimatedSeconds} ثوانٍ`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* When Stopped / Error: Clear Reason and Direct Retry */}
      {error && (
        <div className="mt-4 pt-4 border-t border-rose-800/40 space-y-4">
          <div className="p-3.5 bg-rose-950/60 border border-rose-800 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="font-bold text-rose-200">سبب التوقف:</div>
              <p className="text-rose-200/90 leading-relaxed font-sans">{error}</p>
              <p className="text-[11px] text-rose-300/60 pt-1">
                قد يرجع ذلك لضغط مؤقت على خوادم المعالجة أو وجود محتوى غير مقروء. تم حفظ مدخلاتك ويمكنك المحاولة مباشرة.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] font-mono text-white/40">
              أقصى حجم مسموح للملفات: 15 ميجابايت (PDF / Docs / نصوص / صور)
            </div>
            <div className="flex items-center gap-2">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة المحاولة الآن</span>
                </button>
              )}
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 hover:text-white transition-all"
                >
                  إغلاق التنبيه
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
