import React, { useState } from 'react';
import {
  Sparkles,
  PlusCircle,
  FileDown,
  Sun,
  Moon,
  Compass,
  Palette,
  Check,
  Zap,
  UserCheck,
  Users,
  ChevronDown,
  GraduationCap,
  Rocket,
  FolderKanban,
  LogOut,
  User,
} from 'lucide-react';
import { StudyDeconstructionResponse, TaskItem, AppTheme, UserPersonaMode } from '../types';
import { FocusAudioPlayer } from './FocusAudioPlayer';
import { PERSONA_CONFIGS, getPersonaConfig } from '../utils/persona';
import { useAuth } from '../context/AuthContext';

interface Props {
  hasPlan: boolean;
  plan: StudyDeconstructionResponse | null;
  allTasks: TaskItem[];
  currentTheme: AppTheme;
  currentPersona: UserPersonaMode;
  onThemeChange: (theme: AppTheme) => void;
  onPersonaChange: (persona: UserPersonaMode) => void;
  onNewPlan: () => void;
  onExportPdf: () => void;
  onOpenSavedPlans: () => void;
}

export const Navbar: React.FC<Props> = ({
  hasPlan,
  allTasks,
  currentTheme,
  currentPersona,
  onThemeChange,
  onPersonaChange,
  onNewPlan,
  onExportPdf,
  onOpenSavedPlans,
}) => {
  const { user, userProfile, logoutUser, userPlans } = useAuth();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const completedCount = allTasks.filter((t) => t.completed).length;
  const totalCount = allTasks.length;

  const personaConfig = getPersonaConfig(currentPersona);

  const themes: { id: AppTheme; label: string; shortLabel: string; icon: any; colorDot: string }[] = [
    { id: 'dark', label: 'المظهر الداكن (الافتراضي)', shortLabel: 'الداكن', icon: Moon, colorDot: 'bg-cyan-400' },
    { id: 'light', label: 'المظهر الفاتح (ورقي ناصع)', shortLabel: 'الفاتح', icon: Sun, colorDot: 'bg-amber-500' },
    { id: 'nordic', label: 'المظهر الليلي (نورديك أزرق)', shortLabel: 'الليلي', icon: Compass, colorDot: 'bg-indigo-400' },
    { id: 'cyber', label: 'المظهر البنفسجي (نيون عصري)', shortLabel: 'البنفسجي', icon: Palette, colorDot: 'bg-fuchsia-400' },
  ];

  const currentThemeObj = themes.find((t) => t.id === currentTheme) || themes[0];
  const CurrentIcon = currentThemeObj.icon;

  const personasList: {
    id: UserPersonaMode;
    label: string;
    sublabel: string;
    icon: string;
    lucideIcon: any;
    color: string;
    dotColor: string;
  }[] = [
    {
      id: 'gen_z',
      label: 'جيل Z (روقان وتركيز)',
      sublabel: 'تظبيط التارجت وتاسكات خفيفة ع الرايق مع قيمنا وأخلاقنا',
      icon: '⚡',
      lucideIcon: Zap,
      color: 'text-cyan-400',
      dotColor: 'bg-cyan-400',
    },
    {
      id: 'gen_alpha',
      label: 'جيل ألفا (الأبطال والمراحل)',
      sublabel: 'مغامرة المذاكرة وتحديات شحن طاقة التركيز الخارقة',
      icon: '🚀',
      lucideIcon: Rocket,
      color: 'text-fuchsia-400',
      dotColor: 'bg-fuchsia-400',
    },
    {
      id: 'classic',
      label: 'النمط الأكاديمي (المنهجي والرصين)',
      sublabel: 'الخطة والجدول الأكاديمي المعتمد للطلاب والجامعيين',
      icon: '🎓',
      lucideIcon: GraduationCap,
      color: 'text-emerald-400',
      dotColor: 'bg-emerald-400',
    },
  ];

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-300 bg-[#080C14]/90 border-white/10"
    >
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/20 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-1">
                <span>كبسولة</span>
                <span className="text-cyan-400">المنهج</span>
              </h1>
              {/* Active Persona Pill */}
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${personaConfig.pillColor} font-semibold`}
              >
                <span>{personaConfig.icon}</span>
                <span>{personaConfig.badge}</span>
              </span>
            </div>
            <p className="text-[11px] text-white/50 tracking-normal hidden md:block">
              {personaConfig.terms.appSubtitle}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Saved Plans & Profile Button */}
          {user && (
            <button
              type="button"
              id="header-saved-plans-btn"
              onClick={onOpenSavedPlans}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition-all"
              title="عرض بروفايلي وجميع ما تم العمل عليه"
            >
              <FolderKanban className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">بروفايلي وخططي</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-400 text-black font-bold">
                {userPlans.length}
              </span>
            </button>
          )}

          {/* Top Sound Control Switcher */}
          <FocusAudioPlayer compact />

          {/* User Persona Selector (نمط المستخدم) */}
          <div className="relative">
            <button
              type="button"
              id="persona-mode-switcher-btn"
              onClick={() => {
                setShowPersonaMenu(!showPersonaMenu);
                setShowThemeMenu(false);
                setShowUserMenu(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                showPersonaMenu
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/40'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/85 hover:text-white'
              }`}
              title="تحديد وتغيير نمط المستخدم والمصطلحات (جين Z، جين ألفا، كلاسيكي)"
            >
              <span className="text-sm">{personaConfig.icon}</span>
              <span className="hidden sm:inline">النمط: {personaConfig.shortName}</span>
              <span className="sm:hidden">النمط</span>
              <ChevronDown className="w-3 h-3 text-white/50" />
            </button>

            {showPersonaMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPersonaMenu(false)}
                />
                <div
                  id="persona-dropdown-menu"
                  className="absolute left-0 sm:right-auto sm:left-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-[#0F172A] border border-cyan-500/30 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-right"
                >
                  <div className="px-3 py-2 text-[11px] font-mono text-cyan-300 font-bold border-b border-white/10 mb-1.5 flex items-center justify-between">
                    <span>اختر نمط ولغة التطبيق</span>
                    <span className="text-[10px] text-white/40">3 أنماط</span>
                  </div>
                  <div className="space-y-1">
                    {personasList.map((p) => {
                      const isSelected = p.id === currentPersona;
                      return (
                        <button
                          key={p.id}
                          id={`persona-option-${p.id}`}
                          type="button"
                          onClick={() => {
                            onPersonaChange(p.id);
                            setShowPersonaMenu(false);
                          }}
                          className={`w-full text-right p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 font-bold shadow-md shadow-cyan-950/40'
                              : 'text-white/80 hover:bg-white/5 hover:text-white border border-transparent'
                          }`}
                        >
                          <span className="text-lg leading-none mt-0.5">{p.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-white">{p.label}</span>
                              {isSelected && (
                                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">
                              {p.sublabel}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme Selector Button (المظهر) */}
          <div className="relative">
            <button
              type="button"
              id="theme-switcher-btn"
              onClick={() => {
                setShowThemeMenu(!showThemeMenu);
                setShowPersonaMenu(false);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-medium transition-all"
              title="تغيير المظهر والثيم"
            >
              <CurrentIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">المظهر: {currentThemeObj.shortLabel}</span>
              <span className="sm:hidden">المظهر</span>
              <ChevronDown className="w-3 h-3 text-white/50" />
            </button>

            {showThemeMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowThemeMenu(false)}
                />
                <div
                  id="theme-dropdown-menu"
                  className="absolute left-0 sm:right-auto sm:left-0 top-full mt-2 w-60 rounded-2xl bg-[#0F172A] border border-white/15 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-right"
                >
                  <div className="px-3 py-1.5 text-[11px] font-mono text-white/40 border-b border-white/10 mb-1">
                    اختر مظهر التطبيق
                  </div>
                  {themes.map((t) => {
                    const IconComp = t.icon;
                    const isSelected = t.id === currentTheme;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          onThemeChange(t.id);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full ${t.colorDot}`} />
                          <IconComp className="w-4 h-4 text-white/60" />
                          <span>{t.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* User Profile & Logout Menu */}
          {user && (
            <div className="relative">
              <button
                type="button"
                id="user-profile-menu-btn"
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowThemeMenu(false);
                  setShowPersonaMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-white text-xs font-bold transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center font-bold text-[10px]">
                  {userProfile?.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden md:inline max-w-[90px] truncate text-cyan-300">
                  {userProfile?.displayName || user.email?.split('@')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-white/50" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div
                    id="user-dropdown-menu"
                    className="absolute left-0 sm:right-auto sm:left-0 top-full mt-2 w-64 rounded-2xl bg-[#0B1120] border-2 border-cyan-500/30 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-right"
                  >
                    <div className="pb-3 border-b border-white/10 mb-2">
                      <div className="text-xs font-bold text-white truncate">
                        {userProfile?.displayName || 'المستخدم'}
                      </div>
                      <div className="text-[11px] font-mono text-cyan-400 truncate mt-0.5">
                        {user.email}
                      </div>
                      <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        بروفايل دراسي نشط
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenSavedPlans();
                      }}
                      className="w-full text-right p-2.5 rounded-xl text-xs text-white/90 hover:text-white hover:bg-cyan-500/10 flex items-center gap-2 transition-colors mb-1 font-semibold"
                    >
                      <FolderKanban className="w-4 h-4 text-cyan-400" />
                      <span>عرض بروفايلي وما تم إنجازه ({userPlans.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        logoutUser();
                      }}
                      className="w-full text-right p-2 rounded-xl text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 flex items-center gap-2 transition-colors border-t border-white/10 pt-2.5 mt-1 font-bold"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {hasPlan && (
            <>
              {/* Export to PDF Button */}
              <button
                id="btn-export-pdf-header"
                type="button"
                onClick={onExportPdf}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all hover:scale-102 active:scale-95 shadow-sm"
                title="تصدير الخطة كملف PDF للطباعة والمذاكرة أوفلاين"
              >
                <FileDown className="w-4 h-4 text-cyan-400" />
                <span>{personaConfig.terms.exportPdfBtn}</span>
              </button>

              {/* New Plan Button */}
              <button
                id="btn-new-plan-header"
                type="button"
                onClick={onNewPlan}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-cyan-400 transition-all text-xs font-bold shadow-lg hover:shadow-cyan-500/20 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{personaConfig.terms.newPlanBtn}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
