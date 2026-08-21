import React, { useState } from 'react';
import {
  Brain,
  BookOpen,
  Calculator,
  Play,
  CheckCircle,
  Circle,
  Timer,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
} from 'lucide-react';
import { TaskItem, CognitiveType, UserPersonaMode } from '../types';
import { sounds } from '../utils/audio';
import { getPersonaConfig, getPersonaCognitiveLabel } from '../utils/persona';

interface Props {
  task: TaskItem;
  currentPersona: UserPersonaMode;
  onToggleComplete: (taskId: string) => void;
  onToggleStep: (taskId: string, stepIndex: number) => void;
  onStartPomodoro: (task: TaskItem) => void;
  onOpenDeepDive: (task: TaskItem) => void;
  onUpdateNotes: (taskId: string, notes: string) => void;
}

export const TaskCard: React.FC<Props> = ({
  task,
  currentPersona,
  onToggleComplete,
  onToggleStep,
  onStartPomodoro,
  onOpenDeepDive,
  onUpdateNotes,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const personaConfig = getPersonaConfig(currentPersona);

  const getCognitiveBadge = (type: CognitiveType) => {
    const customLabel = getPersonaCognitiveLabel(currentPersona, type);
    switch (type) {
      case 'memorization':
        return {
          label: task.type_label_arabic || customLabel,
          accentColor: 'bg-amber-500',
          icon: <Brain className="w-3.5 h-3.5 text-amber-400" />,
          badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          focusMinutes: 20,
          breakMinutes: 5,
        };
      case 'problem_solving':
        return {
          label: task.type_label_arabic || customLabel,
          accentColor: 'bg-cyan-500',
          icon: <Calculator className="w-3.5 h-3.5 text-cyan-400" />,
          badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
          focusMinutes: 30,
          breakMinutes: 5,
        };
      case 'deep_reading':
      default:
        return {
          label: task.type_label_arabic || customLabel,
          accentColor: 'bg-purple-500',
          icon: <BookOpen className="w-3.5 h-3.5 text-purple-400" />,
          badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
          focusMinutes: 45,
          breakMinutes: 10,
        };
    }
  };

  const badge = getCognitiveBadge(task.cognitive_type);
  const stepsList = task.steps || task.micro_steps || [];
  const pomo = task.pomodoro_setting || task.recommended_pomodoro || {
    focus_minutes: badge.focusMinutes,
    break_minutes: badge.breakMinutes,
  };
  const completedSteps = task.completedSteps || [];
  const totalSteps = stepsList.length;
  const isAllStepsCompleted = totalSteps > 0 && completedSteps.length === totalSteps;

  const handleStepClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStep(task.task_id, idx);
    sounds.playFocusStart();
  };

  const handleCompleteTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(task.task_id);
    if (!task.completed) {
      sounds.playTaskComplete();
    }
  };

  return (
    <div
      id={`task-card-${task.task_id}`}
      className={`relative overflow-hidden transition-all duration-300 rounded-2xl border ${
        task.completed
          ? 'bg-white/[0.01] border-white/5 opacity-65'
          : 'bg-[#0F172A]/70 border-white/10 hover:border-white/20 shadow-xl'
      } p-5 sm:p-6`}
    >
      {/* Signature Vertical Accent Bar */}
      <div
        className={`absolute top-0 right-0 w-1.5 h-full ${
          task.completed ? 'bg-white/20' : badge.accentColor
        }`}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 flex-1 min-w-0 pr-1">
          {/* Main completion button */}
          <button
            id={`btn-complete-${task.task_id}`}
            type="button"
            onClick={handleCompleteTask}
            className={`mt-0.5 p-1 rounded-xl transition-all ${
              task.completed
                ? 'text-cyan-400 hover:text-cyan-300'
                : 'text-white/30 hover:text-cyan-400 hover:scale-110'
            }`}
            title={task.completed ? 'إلغاء الإكمال' : 'تحديد التاسك كمكتمل'}
          >
            {task.completed ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {/* Cognitive Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-medium border ${badge.badgeClass}`}
              >
                {badge.icon}
                <span>{badge.label}</span>
              </span>

              {/* Pomodoro Specs Pill */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-mono bg-white/5 text-white/70 border border-white/10">
                <Timer className="w-3 h-3 text-cyan-400" />
                <span>
                  {pomo.focus_minutes}د تركيز + {pomo.break_minutes}د راحة
                </span>
              </span>

              {/* Estimated Minutes */}
              <span className="text-[11px] font-mono text-white/50">
                ⏱ {task.estimated_minutes} دقيقة
              </span>
            </div>

            <h3
              className={`text-base sm:text-lg font-bold text-white leading-snug transition-all ${
                task.completed ? 'line-through text-white/40' : ''
              }`}
            >
              {task.title}
            </h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id={`btn-pomodoro-${task.task_id}`}
            type="button"
            onClick={() => onStartPomodoro(task)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-cyan-400 hover:text-black font-bold text-xs shadow-md transition-all active:scale-95"
            title="بدء جلسة تركيز مخصصة للتاسك"
          >
            <Play className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">{personaConfig.terms.startTaskBtn}</span>
          </button>

          <button
            id={`btn-deepdive-${task.task_id}`}
            type="button"
            onClick={() => onOpenDeepDive(task)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all hover:scale-102"
            title="بطاقة الاسترجاع السريع واختبار الكبسولة"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{personaConfig.terms.deepDiveBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Micro-steps Checklist */}
      {expanded && (
        <div className="mt-5 pt-4 border-t border-white/5 pr-1">
          <div className="flex items-center justify-between text-xs text-white/50 mb-3">
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <span>خطوات التنفيذ المصغّرة:</span>
              <span className="text-cyan-400 font-mono font-bold">
                ({completedSteps.length}/{totalSteps})
              </span>
            </span>
            {isAllStepsCompleted && !task.completed && (
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                {personaConfig.terms.completionCongrats}
              </span>
            )}
          </div>

          <div className="space-y-2">
            {stepsList.map((step, idx) => {
              const isStepDone = completedSteps.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={(e) => handleStepClick(idx, e)}
                  className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                    isStepDone
                      ? 'bg-white/[0.01] text-white/30'
                      : 'bg-white/[0.02] hover:bg-white/5 text-white/80 hover:text-white'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isStepDone ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="w-5 h-5 flex items-center justify-center rounded-lg bg-white/5 text-[10px] font-mono text-white/60 border border-white/10">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs sm:text-sm leading-relaxed ${
                      isStepDone ? 'line-through text-white/40' : ''
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Notes Toggle */}
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="text-xs text-white/40 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {showNotes
                  ? 'إخفاء الملاحظات'
                  : task.notes
                  ? 'تعديل الملاحظات الشخصية'
                  : 'إضافة نوت / ملاحظة سريعة'}
              </span>
            </button>
          </div>

          {showNotes && (
            <div className="mt-2.5">
              <textarea
                value={task.notes || ''}
                onChange={(e) => onUpdateNotes(task.task_id, e.target.value)}
                placeholder="اكتب ملاحظاتك، أهم القوانين، أو النقاط التي تحتاج تعيد عليها..."
                rows={2}
                className="w-full text-xs bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
