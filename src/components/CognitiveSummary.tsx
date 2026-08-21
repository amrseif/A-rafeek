import React from 'react';
import {
  Zap,
  BookOpen,
  Calculator,
  Brain,
  Clock,
  CheckCircle2,
  Sparkles,
  FileDown,
  TrendingUp,
} from 'lucide-react';
import { StudyDeconstructionResponse, TaskItem, UserPersonaMode } from '../types';
import { getPersonaConfig } from '../utils/persona';

interface Props {
  plan: StudyDeconstructionResponse;
  allTasks: TaskItem[];
  currentPersona: UserPersonaMode;
  onExportPdf?: () => void;
}

export const CognitiveSummary: React.FC<Props> = ({
  plan,
  allTasks,
  currentPersona,
  onExportPdf,
}) => {
  const { summary } = plan;
  const personaConfig = getPersonaConfig(currentPersona);
  const proTip = summary.pro_tip_arabic || plan.pro_tip_arabic || plan.contextual_tip_arabic || personaConfig.terms.defaultProTip;

  // Distribution calculation
  const totalTasks = allTasks.length || summary.total_tasks_count || 1;
  const deepReadingCount = allTasks.filter((t) => t.cognitive_type === 'deep_reading').length;
  const problemSolvingCount = allTasks.filter((t) => t.cognitive_type === 'problem_solving').length;
  const memorizationCount = allTasks.filter((t) => t.cognitive_type === 'memorization').length;

  const deepReadingPct =
    plan.distribution?.deep_reading_percentage ??
    Math.round((deepReadingCount / totalTasks) * 100);
  const problemSolvingPct =
    plan.distribution?.problem_solving_percentage ??
    Math.round((problemSolvingCount / totalTasks) * 100);
  const memorizationPct =
    plan.distribution?.memorization_percentage ??
    Math.round((memorizationCount / totalTasks) * 100);

  const completedCount = allTasks.filter((t) => t.completed).length;
  const completionPercentage = Math.round((completedCount / totalTasks) * 100);
  const hours = (summary.total_estimated_minutes / 60).toFixed(1);

  return (
    <div
      id="curriculum-capsule-panel"
      className="bg-[#0B0F17]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300"
    >
      {/* Subtle background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {personaConfig.terms.capsuleTitle}
              </h2>
              <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${personaConfig.pillColor} font-semibold`}>
                {personaConfig.terms.capsuleBadge}
              </span>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              {personaConfig.tagline}
            </p>
          </div>
        </div>

        {onExportPdf && (
          <button
            type="button"
            onClick={onExportPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all hover:scale-102 active:scale-95 shadow-sm"
            title="تحميل كبسولة المنهج كملف PDF"
          >
            <FileDown className="w-4 h-4 text-cyan-400" />
            <span>{personaConfig.terms.exportPdfBtn}</span>
          </button>
        )}
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div
          id="stat-total-time"
          className="bg-white/[0.02] border border-white/5 p-4 sm:p-5 rounded-2xl flex items-center gap-4 hover:border-white/15 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-0.5">
              إجمالي وقت المذاكرة
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {summary.total_estimated_minutes}{' '}
              <span className="text-xs font-sans text-white/40 font-normal">
                دقيقة (~{hours} س)
              </span>
            </div>
          </div>
        </div>

        <div
          id="stat-total-tasks"
          className="bg-white/[0.02] border border-white/5 p-4 sm:p-5 rounded-2xl flex items-center gap-4 hover:border-white/15 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-0.5">
              {personaConfig.terms.tasksTitle}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {totalTasks}{' '}
              <span className="text-xs font-sans text-white/40 font-normal">
                {personaConfig.terms.tasksUnit}
              </span>
            </div>
          </div>
        </div>

        <div
          id="stat-completed-tasks"
          className="bg-white/[0.02] border border-white/5 p-4 sm:p-5 rounded-2xl flex items-center gap-4 hover:border-white/15 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="w-full">
            <div className="flex justify-between items-center text-[11px] font-mono text-white/40 uppercase tracking-wider mb-1">
              <span>نسبة الإنجاز</span>
              <span className="text-emerald-400 font-bold">{completionPercentage}%</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {completedCount}{' '}
              <span className="text-xs text-white/40 font-normal">من {totalTasks}</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div
          id="stat-cognitive-balance"
          className="bg-white/[0.02] border border-white/5 p-4 sm:p-5 rounded-2xl flex items-center gap-4 hover:border-white/15 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-0.5">
              أسلوب الجلسات
            </div>
            <div className="text-sm sm:text-base font-bold text-white">
              {personaConfig.terms.focusPeriodsTitle.split('(')[0].trim()}
            </div>
            <div className="text-xs text-white/40 mt-0.5">فواصل استراحة منتظمة</div>
          </div>
        </div>
      </div>

      {/* Overview Arabic Description */}
      {summary.overview_arabic && (
        <div
          id="capsule-overview-text"
          className="p-4 sm:p-5 bg-gradient-to-r from-cyan-950/20 to-blue-950/20 border border-cyan-500/20 rounded-2xl mb-6 flex items-start gap-3.5"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse mt-1.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
              ملخص المنهج والهدف الدراسي:
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed text-cyan-100/90 font-sans">
              {summary.overview_arabic}
            </p>
          </div>
        </div>
      )}

      {/* Cognitive Allocation / Task Types Distribution */}
      <div
        id="task-distribution-section"
        className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 mb-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            <span className="text-xs sm:text-sm font-bold text-white">
              توزيع أنواع المذاكرة (Task Distribution):
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-purple-300">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
              {personaConfig.terms.deepReadingLabel} ({deepReadingPct}%)
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
              {personaConfig.terms.problemSolvingLabel} ({problemSolvingPct}%)
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              {personaConfig.terms.memorizationLabel} ({memorizationPct}%)
            </span>
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden flex p-0.5 gap-1">
          {deepReadingPct > 0 && (
            <div
              className="bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
              style={{ width: `${deepReadingPct}%` }}
              title={`${personaConfig.terms.deepReadingLabel}: ${deepReadingPct}%`}
            />
          )}
          {problemSolvingPct > 0 && (
            <div
              className="bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${problemSolvingPct}%` }}
              title={`${personaConfig.terms.problemSolvingLabel}: ${problemSolvingPct}%`}
            />
          )}
          {memorizationPct > 0 && (
            <div
              className="bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${memorizationPct}%` }}
              title={`${personaConfig.terms.memorizationLabel}: ${memorizationPct}%`}
            />
          )}
        </div>

        {/* Legend cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex items-center justify-between hover:border-purple-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">{personaConfig.terms.deepReadingLabel}</div>
                <div className="text-[10px] text-white/40 font-mono">
                  45 د تركيز / 10 د راحة
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-purple-300">
              {deepReadingPct}%
            </span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex items-center justify-between hover:border-cyan-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">{personaConfig.terms.problemSolvingLabel}</div>
                <div className="text-[10px] text-white/40 font-mono">
                  30 د تركيز / 5 د راحة
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300">
              {problemSolvingPct}%
            </span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex items-center justify-between hover:border-amber-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">{personaConfig.terms.memorizationLabel}</div>
                <div className="text-[10px] text-white/40 font-mono">
                  20 د تركيز / 5 د راحة
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-300">
              {memorizationPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Pro Tip Card */}
      {proTip && (
        <div
          id="pro-tip-card"
          className="bg-gradient-to-r from-cyan-950/30 via-slate-900/40 to-purple-950/30 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 shrink-0">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                  💡 {personaConfig.terms.proTipTitle}:
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-sans">
                {proTip}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] font-mono text-cyan-300">
              {personaConfig.shortName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
