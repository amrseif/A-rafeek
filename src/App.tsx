import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { InputWorkspace } from './components/InputWorkspace';
import { CognitiveSummary } from './components/CognitiveSummary';
import { ScheduleTimeline } from './components/ScheduleTimeline';
import { ActivePomodoroModal } from './components/ActivePomodoroModal';
import { DeepDiveModal } from './components/DeepDiveModal';
import { ProcessingProgressBar } from './components/ProcessingProgressBar';
import { FocusAudioPlayer } from './components/FocusAudioPlayer';
import { AuthScreen } from './components/AuthScreen';
import { UserPlansDrawer } from './components/UserPlansDrawer';
import { UserProfileView } from './components/UserProfileView';
import { useAuth } from './context/AuthContext';
import { StudyDeconstructionResponse, TaskItem, AppTheme, UserPersonaMode, SavedPlan } from './types';
import { exportPlanToPdf } from './utils/pdfExport';
import { getPersonaConfig } from './utils/persona';
import confetti from 'canvas-confetti';
import { BookOpen, Sparkles, Zap, FileDown, FolderKanban, Save, CheckCircle2, User } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading, saveUserPlan, updateUserPlan, userPlans } = useAuth();

  // Theme State
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const savedTheme = localStorage.getItem('study_capsule_theme') as AppTheme;
      if (savedTheme && ['dark', 'light', 'nordic', 'cyber'].includes(savedTheme)) {
        return savedTheme;
      }
    } catch (e) {
      console.warn('Failed to load theme preference', e);
    }
    return 'dark';
  });

  // Persona State (Gen Z / Gen Alpha / Classic)
  const [persona, setPersona] = useState<UserPersonaMode>(() => {
    try {
      const savedPersona = localStorage.getItem('study_capsule_persona') as UserPersonaMode;
      if (savedPersona && ['gen_z', 'gen_alpha', 'classic'].includes(savedPersona)) {
        return savedPersona;
      }
    } catch (e) {
      console.warn('Failed to load persona preference', e);
    }
    return 'gen_z';
  });

  const [currentPlan, setCurrentPlan] = useState<StudyDeconstructionResponse | null>(() => {
    try {
      const saved = localStorage.getItem('study_cognitive_current_plan');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load plan from localStorage', e);
    }
    return null;
  });

  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSavingPlan, setIsSavingPlan] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<{
    subjectName: string;
    studyText: string;
    file?: { name: string; mimeType: string; base64: string };
    studyDays: number;
    dailyHours: number;
    targetDifficulty: string;
    focusMode: string;
    userPersona: UserPersonaMode;
  } | null>(null);
  const [viewMode, setViewMode] = useState<'input' | 'plan' | 'plans_list'>('input');

  // Modals state
  const [activePomodoroTask, setActivePomodoroTask] = useState<TaskItem | null>(null);
  const [activeDeepDiveTask, setActiveDeepDiveTask] = useState<TaskItem | null>(null);

  const personaConfig = getPersonaConfig(persona);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('study_capsule_theme', theme);
  }, [theme]);

  // Sync persona to local storage
  useEffect(() => {
    localStorage.setItem('study_capsule_persona', persona);
  }, [persona]);

  // Sync plan to local storage
  useEffect(() => {
    if (currentPlan) {
      localStorage.setItem('study_cognitive_current_plan', JSON.stringify(currentPlan));
    }
  }, [currentPlan]);

  // Auto-sync updates to Firestore if the current plan belongs to the logged-in user
  useEffect(() => {
    if (currentPlan && currentPlanId && user) {
      updateUserPlan(currentPlanId, currentPlan);
    }
  }, [currentPlan, currentPlanId, user]);

  // Flattened list of all tasks for quick metrics
  const allTasks = useMemo(() => {
    if (!currentPlan) return [];
    const schedule = currentPlan.schedule || currentPlan.suggested_schedule || [];
    return schedule.flatMap((day) => day.tasks);
  }, [currentPlan]);

  // Handlers for Deconstruct API
  const handleDeconstruct = async (params: {
    subjectName: string;
    studyText: string;
    file?: { name: string; mimeType: string; base64: string };
    studyDays: number;
    dailyHours: number;
    targetDifficulty: string;
    focusMode: string;
    userPersona: UserPersonaMode;
  }) => {
    setLastParams(params);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/deconstruct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const responseText = await res.text();
      let responseJson: any = null;

      try {
        responseJson = JSON.parse(responseText);
      } catch {
        if (!res.ok) {
          if (res.status === 413) {
            throw new Error('حجم الملف المرفوع كبير جداً. يرجى اختيار ملف بحجم أقل من 15 ميجابايت.');
          }
          if (res.status === 503 || res.status === 502 || res.status === 504) {
            throw new Error('خوادم المعالجة تشهد ضغطاً مؤقتاً. يرجى الضغط على زر "إعادة المحاولة الآن".');
          }
          throw new Error(`تعذر إتمام التحليل (كود الاستجابة: ${res.status}). يرجى إعادة المحاولة.`);
        }
        throw new Error('تعذر قراءة استجابة الخادم بشكل صحيح. يرجى إعادة المحاولة.');
      }

      if (!res.ok) {
        throw new Error(
          responseJson?.error ||
          responseJson?.details ||
          `فشلت معالجة الطلب (كود: ${res.status})`
        );
      }

      const planData: StudyDeconstructionResponse = responseJson;
      setCurrentPlan(planData);
      setViewMode('plan');

      // Auto-save to user's Firestore database
      if (user) {
        try {
          const newId = await saveUserPlan(
            planData,
            params.subjectName || 'خطة دراسية جديدة',
            params.studyText || '',
            params.studyDays,
            params.dailyHours,
            params.targetDifficulty
          );
          setCurrentPlanId(newId);
          setSaveSuccessNotice('تم حفظ خطتك تلقائياً في حسابك وقاعدة البيانات السحابية');
          setTimeout(() => setSaveSuccessNotice(null), 5000);
        } catch (e) {
          console.warn('Could not auto-save to Firestore', e);
        }
      }

      // Celebratory confetti
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.3 },
      });
    } catch (err: any) {
      console.error('Error generating study plan:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  // Explicit Save Plan to Cloud
  const handleExplicitSave = async () => {
    if (!currentPlan || !user) return;
    setIsSavingPlan(true);
    try {
      const newId = await saveUserPlan(
        currentPlan,
        lastParams?.subjectName || 'خطة كبسولة المنهج',
        lastParams?.studyText || '',
        lastParams?.studyDays || 3,
        lastParams?.dailyHours || 2,
        lastParams?.targetDifficulty || 'متوسط'
      );
      setCurrentPlanId(newId);
      setSaveSuccessNotice('تم حفظ الخطة بنجاح في حسابك السحابي!');
      setTimeout(() => setSaveSuccessNotice(null), 4000);
    } catch (e: any) {
      console.error('Save plan error:', e);
    } finally {
      setIsSavingPlan(false);
    }
  };

  // Toggle single task complete
  const handleToggleComplete = (taskId: string) => {
    if (!currentPlan) return;

    let willAllBeComplete = false;

    setCurrentPlan((prev) => {
      if (!prev) return prev;
      const baseSchedule = prev.schedule || prev.suggested_schedule || [];
      const updatedSchedule = baseSchedule.map((day) => ({
        ...day,
        tasks: day.tasks.map((task) => {
          if (task.task_id === taskId) {
            const nextCompleted = !task.completed;
            const stepsList = task.steps || task.micro_steps || [];
            return {
              ...task,
              completed: nextCompleted,
              completedSteps: nextCompleted
                ? stepsList.map((_, idx) => idx)
                : task.completedSteps || [],
            };
          }
          return task;
        }),
      }));

      const totalTaskList = updatedSchedule.flatMap((d) => d.tasks);
      const allDone = totalTaskList.every((t) => t.completed);
      if (allDone) {
        willAllBeComplete = true;
      }

      return {
        ...prev,
        suggested_schedule: updatedSchedule,
        schedule: updatedSchedule,
      };
    });

    if (willAllBeComplete) {
      setTimeout(() => {
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.5 },
        });
      }, 200);
    }
  };

  // Toggle single step inside a task
  const handleToggleStep = (taskId: string, stepIndex: number) => {
    if (!currentPlan) return;

    setCurrentPlan((prev) => {
      if (!prev) return prev;
      const baseSchedule = prev.schedule || prev.suggested_schedule || [];
      const updatedSchedule = baseSchedule.map((day) => ({
        ...day,
        tasks: day.tasks.map((task) => {
          if (task.task_id === taskId) {
            const currentSteps = task.completedSteps || [];
            const stepsList = task.steps || task.micro_steps || [];
            const nextSteps = currentSteps.includes(stepIndex)
              ? currentSteps.filter((i) => i !== stepIndex)
              : [...currentSteps, stepIndex];

            const isAllDone = stepsList.length > 0 && nextSteps.length === stepsList.length;

            return {
              ...task,
              completedSteps: nextSteps,
              completed: isAllDone ? true : task.completed,
            };
          }
          return task;
        }),
      }));

      return {
        ...prev,
        suggested_schedule: updatedSchedule,
        schedule: updatedSchedule,
      };
    });
  };

  // Update task notes
  const handleUpdateNotes = (taskId: string, notes: string) => {
    if (!currentPlan) return;
    setCurrentPlan((prev) => {
      if (!prev) return prev;
      const baseSchedule = prev.schedule || prev.suggested_schedule || [];
      const updatedSchedule = baseSchedule.map((day) => ({
        ...day,
        tasks: day.tasks.map((task) => (task.task_id === taskId ? { ...task, notes } : task)),
      }));
      return {
        ...prev,
        suggested_schedule: updatedSchedule,
        schedule: updatedSchedule,
      };
    });
  };

  // Load a saved plan
  const handleSelectSavedPlan = (savedPlan: SavedPlan) => {
    setCurrentPlan(savedPlan.plan);
    setCurrentPlanId(savedPlan.id);
    setLastParams({
      subjectName: savedPlan.title,
      studyText: savedPlan.rawInput,
      studyDays: savedPlan.studyDays,
      dailyHours: savedPlan.dailyHours,
      targetDifficulty: savedPlan.difficulty,
      focusMode: 'متوازن',
      userPersona: persona,
    });
    setViewMode('plan');
  };

  // PDF Export
  const handleExportPdf = () => {
    if (!currentPlan) return;
    exportPlanToPdf(currentPlan, lastParams?.subjectName || 'خطة_المذاكرة', 'plan-content-wrapper');
  };

  // Authentication Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#080C14] flex flex-col items-center justify-center text-white" dir="rtl">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 animate-spin mb-4">
          <Zap className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-white/70">جاري تحميل مساحتك الدراسية الآمنة...</p>
      </div>
    );
  }

  // Not logged in: Show Auth Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-[#080C14] text-white flex flex-col justify-between" dir="rtl">
        <Navbar
          hasPlan={false}
          plan={null}
          allTasks={[]}
          currentTheme={theme}
          currentPersona={persona}
          onThemeChange={setTheme}
          onPersonaChange={setPersona}
          onNewPlan={() => {}}
          onExportPdf={() => {}}
          onOpenSavedPlans={() => {}}
        />
        <AuthScreen currentPersona={persona} />
        <footer className="py-6 border-t border-white/10 text-center text-xs text-white/40 font-mono">
          <span>كبسولة المنهج • الحساب والبروفايل السحابي الآمن</span>
        </footer>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex flex-col font-['IBM_Plex_Sans_Arabic',sans-serif] selection:bg-cyan-500 selection:text-black ${
        theme === 'light'
          ? 'bg-[#F8FAFC] text-[#0F172A]'
          : theme === 'nordic'
          ? 'bg-[#0B132B] text-[#E0E7FF]'
          : theme === 'cyber'
          ? 'bg-[#0D0B18] text-[#F3E8FF]'
          : 'bg-[#080C14] text-[#F8FAFC]'
      }`}
      dir="rtl"
    >
      {/* Top Navbar */}
      <Navbar
        hasPlan={Boolean(currentPlan)}
        plan={currentPlan}
        allTasks={allTasks}
        currentTheme={theme}
        currentPersona={persona}
        onThemeChange={setTheme}
        onPersonaChange={setPersona}
        onNewPlan={() => setViewMode('input')}
        onExportPdf={handleExportPdf}
        onOpenSavedPlans={() => setViewMode('plans_list')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Save Notice */}
        {saveSuccessNotice && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveSuccessNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('plans_list')}
              className="text-emerald-400 font-bold hover:underline"
            >
              عرض بروفايلي وكل خططي ←
            </button>
          </div>
        )}

        {/* Processing Progress Bar */}
        {(isLoading || errorMsg) && (
          <ProcessingProgressBar
            isLoading={isLoading}
            file={lastParams?.file}
            subjectName={lastParams?.subjectName}
            error={errorMsg}
            onCancel={() => setErrorMsg(null)}
            onRetry={lastParams ? () => handleDeconstruct(lastParams) : undefined}
          />
        )}

        {/* View Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0F172A]/70 p-2.5 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2">
            {currentPlan && (
              <button
                type="button"
                id="btn-view-current-plan"
                onClick={() => setViewMode('plan')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'plan'
                    ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-black shadow-md shadow-cyan-400/20'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{personaConfig.terms.capsuleTitle}</span>
              </button>
            )}

            <button
              type="button"
              id="btn-view-input"
              onClick={() => setViewMode('input')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'input'
                  ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-black shadow-md shadow-cyan-400/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>تفكيك مادة / كبسولة جديدة</span>
            </button>

            <button
              type="button"
              id="btn-view-plans-list"
              onClick={() => setViewMode('plans_list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'plans_list'
                  ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-black shadow-md shadow-cyan-400/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>بروفايلي وما تم العمل عليه ({userPlans.length})</span>
            </button>
          </div>

          {currentPlan && viewMode === 'plan' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExplicitSave}
                disabled={isSavingPlan}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all active:scale-95"
              >
                <Save className="w-4 h-4 text-cyan-400" />
                <span>{isSavingPlan ? 'جاري الحفظ...' : 'حفظ الخطة'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all hover:scale-102 active:scale-95 shadow-sm"
              >
                <FileDown className="w-4 h-4 text-cyan-400" />
                <span>{personaConfig.terms.exportPdfBtn}</span>
              </button>
            </div>
          )}
        </div>

        {/* User Profile & Saved Plans Mode */}
        {viewMode === 'plans_list' && (
          <UserProfileView
            currentPersona={persona}
            onSelectPlan={handleSelectSavedPlan}
            onNewPlan={() => setViewMode('input')}
            onBackToCurrentPlan={currentPlan ? () => setViewMode('plan') : undefined}
            hasCurrentPlan={Boolean(currentPlan)}
          />
        )}

        {/* Input Mode */}
        {viewMode === 'input' && (
          <div className="space-y-6">
            <div className="bg-[#0B0F17]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1.5 h-full bg-cyan-400" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {personaConfig.terms.inputHeroTitle}
                  </h2>
                  <p className="text-white/60 text-xs sm:text-sm mt-1.5 leading-relaxed font-sans max-w-3xl">
                    {personaConfig.terms.inputHeroDesc}
                  </p>
                </div>
              </div>
            </div>

            <InputWorkspace
              currentPersona={persona}
              onPersonaChange={setPersona}
              onDeconstruct={handleDeconstruct}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Plan Mode */}
        {viewMode === 'plan' && currentPlan && (
          <div id="plan-content-wrapper" className="space-y-8">
            {/* Cognitive Summary Panel (كبسولة المنهج) */}
            <CognitiveSummary
              plan={currentPlan}
              allTasks={allTasks}
              currentPersona={persona}
              onExportPdf={handleExportPdf}
            />

            {/* Ambient Focus Audio Player Bar */}
            <FocusAudioPlayer />

            {/* Schedule Timeline */}
            <ScheduleTimeline
              schedule={currentPlan.schedule || currentPlan.suggested_schedule || []}
              currentPersona={persona}
              onToggleComplete={handleToggleComplete}
              onToggleStep={handleToggleStep}
              onStartPomodoro={(task) => setActivePomodoroTask(task)}
              onOpenDeepDive={(task) => setActiveDeepDiveTask(task)}
              onUpdateNotes={handleUpdateNotes}
            />
          </div>
        )}
      </main>

      {/* Active Pomodoro Focus Timer Modal */}
      {activePomodoroTask && (
        <ActivePomodoroModal
          task={activePomodoroTask}
          currentPersona={persona}
          onClose={() => setActivePomodoroTask(null)}
          onTaskCompleted={(taskId) => {
            handleToggleComplete(taskId);
          }}
          onToggleStep={handleToggleStep}
        />
      )}

      {/* Active Recall Deep Dive Modal */}
      {activeDeepDiveTask && (
        <DeepDiveModal
          task={activeDeepDiveTask}
          currentPersona={persona}
          onClose={() => setActiveDeepDiveTask(null)}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10 py-8 text-center text-xs text-white/40 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>{personaConfig.icon} كبسولة المنهج • {personaConfig.badge}</span>
          <span className="text-white/60">
            {personaConfig.terms.memorizationLabel} (20د) • {personaConfig.terms.problemSolvingLabel} (30د) • {personaConfig.terms.deepReadingLabel} (45د)
          </span>
        </div>
      </footer>
    </div>
  );
}
