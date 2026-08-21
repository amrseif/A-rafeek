import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SavedPlan, UserPersonaMode } from '../types';
import { getPersonaConfig } from '../utils/persona';
import {
  FolderKanban,
  Trash2,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  Plus,
  Sparkles,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  currentPersona: UserPersonaMode;
  onSelectPlan: (plan: SavedPlan) => void;
  onNewPlan: () => void;
}

export const UserPlansDrawer: React.FC<Props> = ({
  currentPersona,
  onSelectPlan,
  onNewPlan,
}) => {
  const { userPlans, deleteUserPlan, userProfile } = useAuth();
  const personaConfig = getPersonaConfig(currentPersona);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (planId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه الخطة الدراسية من حسابك؟')) {
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

  return (
    <div className="bg-[#0B1120] border border-cyan-500/20 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl text-right">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>خططي الدراسية المحفوظة</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {userPlans.length} خطط
              </span>
            </h3>
            <p className="text-xs text-white/50">
              خاص بحساب: <span className="text-cyan-300 font-medium">{userProfile?.displayName || userProfile?.email}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNewPlan}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold transition-all shadow-md shadow-cyan-400/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>تفكيك كبسولة جديدة</span>
        </button>
      </div>

      {userPlans.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">لا توجد خطط دراسية محفوظة بعد</h4>
          <p className="text-xs text-white/50 max-w-sm mx-auto mb-4">
            قم بتفكيك أي مادة أو رفع ملف دراسي، وسيتم حفظ جدولك وتاسكاتك فوراً في حسابك السحابي الآمن.
          </p>
          <button
            type="button"
            onClick={onNewPlan}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>ابدأ إنشاء خطتك الأولى الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {userPlans.map((item) => {
            const totalTasks = (item.plan.schedule || item.plan.suggested_schedule || []).flatMap((d) => d.tasks).length;
            const completedTasks = (item.plan.schedule || item.plan.suggested_schedule || [])
              .flatMap((d) => d.tasks)
              .filter((t) => t.completed).length;
            const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <div
                key={item.id}
                onClick={() => onSelectPlan(item)}
                className="group p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.06] transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                      {item.studyDays} أيام • {item.dailyHours} ساعات/يوم
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      disabled={deletingId === item.id}
                      className="p-1 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="حذف الخطة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-1.5">
                    {item.title}
                  </h4>

                  <p className="text-xs text-white/50 line-clamp-2 mb-3">
                    {item.plan.summary?.overview_arabic || 'خطة دراسية مع كبسولة تركيز وإنجاز'}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                    <span className="text-white/60">نسبة الإنجاز:</span>
                    <span className="text-cyan-300 font-bold">{percent}% ({completedTasks}/{totalTasks})</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-white/40 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-cyan-400 font-bold flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                      فتح الخطة ←
                    </span>
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
