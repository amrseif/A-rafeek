import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Brain,
  ShieldAlert,
  Target,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Zap,
  Flame,
} from 'lucide-react';
import { TaskItem, DeepDiveData, ActiveRecallQuestion, UserPersonaMode } from '../types';
import { sounds } from '../utils/audio';
import { getPersonaConfig, getPersonaCognitiveLabel } from '../utils/persona';

interface Props {
  task: TaskItem;
  currentPersona: UserPersonaMode;
  onClose: () => void;
}

export const DeepDiveModal: React.FC<Props> = ({ task, currentPersona, onClose }) => {
  const [data, setData] = useState<DeepDiveData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [revealedExplanations, setRevealedExplanations] = useState<{ [key: number]: boolean }>({});

  const personaConfig = getPersonaConfig(currentPersona);

  useEffect(() => {
    let isMounted = true;
    async function fetchDeepDive() {
      setLoading(true);
      try {
        const res = await fetch('/api/task-deepdive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskTitle: task.title,
            cognitiveType: task.cognitive_type,
            microSteps: task.micro_steps || task.steps,
            userPersona: currentPersona,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setData(json);
        } else {
          if (isMounted) {
            setData({
              focus_nudge: 'اقفل كل التابات اللي ملهاش لازمة، وركز على الجزئية دي لـ 20 دقيقة، هتحس بفرق كبير جداً!',
              active_recall_questions: [
                {
                  question: `إيه هو المفهوم الأساسي اللي بندور حوله في "${task.title}"؟`,
                  options: [
                    'فهم الفكرة الجوهرية وتطبيقها عملياً',
                    'حفظ الكلمات نصاً بدون فهم التطبيق',
                    'تأجيل المذاكرة لقبل الامتحان بساعة',
                    'قراءة سريعة بدون حل تمارين',
                  ],
                  correct_index: 0,
                  explanation: 'الفهم والتطبيق العملي هو اللي بيثبت المعلومة في الذاكرة طويلة المدى وبيخليك تحل أي سؤال في الامتحان.',
                },
                {
                  question: 'إزاي تضمن إنك ثبت خطوات المهمة دي وماتنسهاش بكرة؟',
                  options: [
                    'تشرح الخطوات لزميلك أو لنفسك بصوت مسموع (تقنية فاينمان)',
                    'تقفل المذكرة وماتفتحهاش تاني',
                    'تعيد قراءة نفس الصفحة 10 مرات ورا بعض',
                    'تعتمد على الحفظ الشكلي فقط',
                  ],
                  correct_index: 0,
                  explanation: 'الشرح بأسلوبك البسيط (Feynman Technique) بيكشفلك فوراً لو في نقطة مش واضحة وبيثبت المعلومة 100%.',
                },
                {
                  question: 'إيه أنسب توقيت لاختبار نفسك في هذا الجزء مرة تانية؟',
                  options: [
                    'بعد 24 ساعة (المراجعة المتباعدة Spaced Repetition)',
                    'بعد شهر بدون أي مراجعة وسيطة',
                    'أول ما تخرج من الامتحان',
                    'مفيش داعي للمراجعة طالما ذاكرتها مرة',
                  ],
                  correct_index: 0,
                  explanation: 'المراجعة بعد يوم بتهزم منحنى النسيان (Forgetting Curve) وبتنقل المعلومة للذاكرة الدائمة.',
                },
              ],
              retention_strategy: 'طبق حركة الـ 24 ساعة: بكرة الصبح راجع النقط دي في دقيقتين بس، هتلاقيها ثبتت في دماغك طول الترم!',
            });
          }
        }
      } catch {
        if (isMounted) {
          setData({
            focus_nudge: 'امسك ورقة بيضاء واكتب فيها الملاحظات باختصار وإنت بتذاكر.',
            active_recall_questions: [
              {
                question: `إيه هو الهدف الأهم من مذاكرة ${task.title}؟`,
                options: [
                  'استيعاب المفهوم واستخدامه في حل المسائل',
                  'مجرد القراءة السطحية السريعة',
                  'حفظ المصطلحات بدون ربطها بالمنهج',
                  'تخطي الجزئية والاعتماد على الحظ',
                ],
                correct_index: 0,
                explanation: 'الاستيعاب العميق والتطبيق هو مفتاح الدرجات العالية والراحة الذهنية.',
              },
            ],
            retention_strategy: 'جرب تشرح اللي فهمته لحد في البيت في دقيقة واحدة.',
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDeepDive();
    return () => {
      isMounted = false;
    };
  }, [task, currentPersona]);

  const handleSelectOption = (questionIdx: number, optionIdx: number, correctIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
    setRevealedExplanations((prev) => ({
      ...prev,
      [questionIdx]: true,
    }));

    if (optionIdx === correctIdx) {
      sounds.playFocusStart();
    }
  };

  const handleResetQuestion = (questionIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[questionIdx];
      return next;
    });
    setRevealedExplanations((prev) => {
      const next = { ...prev };
      delete next[questionIdx];
      return next;
    });
  };

  const cognitiveLabel = getPersonaCognitiveLabel(currentPersona, task.cognitive_type);

  return (
    <div
      id="deep-dive-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div
        id="deep-dive-card"
        className="relative bg-[#0F172A] border border-amber-500/30 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200 text-right my-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {personaConfig.terms.activeRecallTitle}
              </span>
              <span className="text-xs font-mono text-white/40">
                {cognitiveLabel}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
              {task.title}
            </h3>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-amber-300">
              جاري تجهيز أسئلة التثبيت والاسترجاع الذكي...
            </p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Focus Nudge */}
            {data.focus_nudge && (
              <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-amber-300 mb-1">
                    ⚡ تركيز ومنع تشتت:
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed font-sans">
                    {data.focus_nudge}
                  </p>
                </div>
              </div>
            )}

            {/* Active Recall Questions List */}
            {data.active_recall_questions && data.active_recall_questions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span>{personaConfig.terms.activeRecallBadge}:</span>
                  </span>
                  <span className="text-[11px] font-mono text-white/40">
                    {data.active_recall_questions.length} أسئلة سريعة
                  </span>
                </div>

                <div className="space-y-3">
                  {data.active_recall_questions.map((q: ActiveRecallQuestion, qIdx: number) => {
                    const selectedOpt = selectedAnswers[qIdx];
                    const isAnswered = selectedOpt !== undefined;
                    const isCorrect = selectedOpt === q.correct_index;
                    const isExplanationShown = revealedExplanations[qIdx];

                    return (
                      <div
                        key={qIdx}
                        id={`deepdive-question-card-${qIdx}`}
                        className={`p-4 rounded-2xl border transition-all ${
                          !isAnswered
                            ? 'bg-white/[0.02] border-white/10'
                            : isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-rose-950/20 border-rose-500/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-start gap-2.5 flex-1">
                            <span className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center text-[11px] font-mono text-white/80 shrink-0 mt-0.5">
                              {qIdx + 1}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                              {q.question}
                            </span>
                          </div>

                          {isAnswered && (
                            <button
                              type="button"
                              onClick={(e) => handleResetQuestion(qIdx, e)}
                              className="text-[10px] text-white/40 hover:text-white flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/10 transition-colors"
                              title="إعادة المحاولة"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>إعادة</span>
                            </button>
                          )}
                        </div>

                        {/* Options */}
                        <div className="space-y-2 mb-3">
                          {q.options.map((opt: string, optIdx: number) => {
                            const isThisSelected = selectedOpt === optIdx;
                            const isThisTheCorrectAnswer = optIdx === q.correct_index;

                            let optClasses =
                              'bg-white/5 hover:bg-white/10 text-white/80 border-white/10';

                            if (isAnswered) {
                              if (isThisTheCorrectAnswer) {
                                optClasses =
                                  'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                              } else if (isThisSelected && !isCorrect) {
                                optClasses =
                                  'bg-rose-500/20 border-rose-400 text-rose-200 line-through';
                              } else {
                                optClasses = 'bg-white/[0.02] border-white/5 text-white/30';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={isAnswered}
                                onClick={() => handleSelectOption(qIdx, optIdx, q.correct_index)}
                                className={`w-full text-right p-2.5 rounded-xl text-xs border transition-all flex items-center justify-between gap-2 ${optClasses}`}
                              >
                                <span className="flex-1">{opt}</span>
                                {isAnswered && (
                                  <span>
                                    {isThisTheCorrectAnswer ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    ) : isThisSelected ? (
                                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                    ) : null}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Feedback & Explanation */}
                        {isAnswered && (
                          <div
                            className={`p-3 rounded-xl text-xs leading-relaxed border ${
                              isCorrect
                                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-100'
                                : 'bg-rose-950/40 border-rose-500/30 text-rose-100'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold mb-1">
                              {isCorrect ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>إجابة صحيحة وممتازة! 🎉</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                  <span>ليست الإجابة الدقيقة، الإجابة الصحيحة موضحة بالأعلى.</span>
                                </>
                              )}
                            </div>
                            <p className="opacity-90">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Retention Strategy Tip */}
            {data.retention_strategy && (
              <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl flex items-start gap-3">
                <Flame className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-cyan-300 mb-1">
                    🧠 استراتيجية التثبيت بالذاكرة طويلة المدى:
                  </div>
                  <p className="text-xs text-cyan-100/90 leading-relaxed font-sans">
                    {data.retention_strategy}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white text-black hover:bg-cyan-400 text-xs font-bold transition-all"
          >
            إغلاق البطاقة
          </button>
        </div>
      </div>
    </div>
  );
};
