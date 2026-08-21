import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SavedPlan, UserPersonaMode } from '../types';
import { getPersonaConfig } from '../utils/persona';
import { exportPlanToPdf } from '../utils/pdfExport';
import {
  User,
  FolderKanban,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  FileDown,
  Sparkles,
  Plus,
  ArrowRight,
  GraduationCap,
  Award,
  Zap,
  Flame,
  CheckSquare,
  TrendingUp,
} from 'lucide-react';

interface Props {
  currentPersona: UserPersonaMode;
  onSelectPlan: (plan: SavedPlan) => void;
  onNewPlan: () => void;
  onBackToCurrentPlan?: () => void;
  hasCurrentPlan?: boolean;
}

export const UserProfileView: React.FC<Props> = ({
  currentPersona,
  onSelectPlan,
  onNewPlan,
  onBackToCurrentPlan,
  hasCurrentPlan,
}) => {
  const { user, userProfile, userPlans, deleteUserPlan } = useAuth();
  const personaConfig = getPersonaConfig(currentPersona);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate Aggregated Metrics for User's Profile
  const totalPlans = userPlans.length;

  const allTasks = userPlans.flatMap((p) =>
    (p.plan?.schedule || p.plan?.suggested_schedule || []).flatMap((d) => d.tasks)
  );
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.completed).length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalEstimatedHours = userPlans.reduce((acc, p) => acc + (p.studyDays * p.dailyHours), 0);

  // Filter plans based on search
  const filteredPlans = userPlans.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.plan?.summary?.overview_arabic || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (planId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من حذف هذه الخطة الدراسية من بروفايلك؟')) {
      return;
    }
    setDeletingId(planId);
    try {
      await deleteUserPlan(planId);
    } catch (err) {
      console.error('Failed to delete plan', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportPdf = (plan: SavedPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    exportPlanToPdf(plan.plan, plan.title, currentPersona);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4 px-3 sm:px-6 space-y-6" dir="rtl">
      {/* Top Profile Header Card */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B1120] to-cyan-950/40 border border-cyan-500/20 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User Info */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-xl shadow-cyan-500/20 flex-shrink-0">
              <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-cyan-300 font-black text-2xl sm:text-3xl">
                {userProfile?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {userProfile?.displayName || 'طالب كبسولة المنهج'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
                  بروفايل مفعل
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/60 font-mono mt-1 dir-ltr text-right">
                {user?.email}
              </p>
              <div className="flex items-center gap-4 text-xs text-white/50 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  عضو منذ: {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('ar-EG') : 'اليوم'}
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  النمط: {personaConfig.name}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {hasCurrentPlan && onBackToCurrentPlan && (
              <button
                type="button"
                onClick={onBackToCurrentPlan}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs transition-all flex items-center gap-2"
              >
                <span>العودة للخطة المفتوحة</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            )}

            <button
              type="button"
              onClick={onNewPlan}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>تفكيك مادة جديدة</span>
            </button>
          </div>
        </div>

        {/* Profile Statistics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
              <FolderKanban className="w-4 h-4 text-cyan-400" />
              <span>الخطط الدراسية</span>
            </div>
            <div className="text-2xl font-black text-white font-mono">{totalPlans}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>المهام المنجزة</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {completedTasks} <span className="text-xs text-white/40 font-normal">/ {totalTasks}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>نسبة الإنجاز الكلية</span>
            </div>
            <div className="text-2xl font-black text-cyan-300 font-mono">{overallProgress}%</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>إجمالي ساعات المذاكرة</span>
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono">{totalEstimatedHours} <span className="text-xs text-white/40 font-normal">ساعة</span></div>
          </div>
        </div>
      </div>

      {/* Plans Section Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-cyan-400" />
            <span>ما تم العمل عليه بواسطة بروفايلك</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {filteredPlans.length} من {totalPlans}
            </span>
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            جميع المواد التي قمت بتفكيكها وجداول المذاكرة المحفوظة سحابياً في حسابك
          </p>
        </div>

        {totalPlans > 0 && (
          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في خططك المحفوظة..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-white/30 text-xs focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
        )}
      </div>

      {/* Plans Grid */}
      {totalPlans === 0 ? (
        <div className="text-center py-16 px-6 rounded-3xl bg-slate-900/60 border border-dashed border-white/10 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-300 mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-white mb-1.5">لا توجد خطط مفككة في بروفايلك بعد</h4>
          <p className="text-xs sm:text-sm text-white/50 max-w-md mx-auto mb-6 leading-relaxed">
            بروفايلك جاهز لحفظ جميع كبسولاتك ومهامك. ابدأ بكتابة اسم أي مادة دراسية أو رفع ملفك المنهجي وسيقوم الذكاء الاصطناعي بتفكيكها إلى خطوات ممتعة.
          </p>
          <button
            type="button"
            onClick={onNewPlan}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>ابدأ تفكيك أول مادة دراسية الآن</span>
          </button>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-2xl bg-slate-900/40 border border-white/5 text-white/50 text-xs">
          لا توجد نتائج تطابق بحثك "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map((item) => {
            const planSchedule = item.plan?.schedule || item.plan?.suggested_schedule || [];
            const planTasks = planSchedule.flatMap((d) => d.tasks);
            const planCompleted = planTasks.filter((t) => t.completed).length;
            const planPercent = planTasks.length > 0 ? Math.round((planCompleted / planTasks.length) * 100) : 0;

            return (
              <div
                key={item.id}
                onClick={() => onSelectPlan(item)}
                className="group rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-cyan-400/50 p-5 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden shadow-lg hover:shadow-cyan-950/50"
              >
                <div>
                  {/* Top Tags & Delete */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                        {item.studyDays} أيام
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-white/5 text-white/70 border border-white/10">
                        {item.dailyHours} س/يوم
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleExportPdf(item, e)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                        title="تصدير الخطة كملف PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        disabled={deletingId === item.id}
                        className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="حذف الخطة من البروفايل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Overview */}
                  <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2">
                    {item.title}
                  </h4>

                  <p className="text-xs text-white/60 line-clamp-2 leading-relaxed mb-4">
                    {item.plan?.summary?.overview_arabic || 'خطة دراسية مع كبسولات مركزة وخطوات إنجاز تفاعلية.'}
                  </p>
                </div>

                {/* Progress bar & Date */}
                <div className="pt-3.5 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50 flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-cyan-400" />
                      {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                    <span className="font-mono font-bold text-cyan-300 text-xs">
                      {planCompleted}/{planTasks.length} منجز ({planPercent}%)
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${planPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
