import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPersonaMode } from '../types';
import { getPersonaConfig } from '../utils/persona';
import {
  Zap,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  FolderHeart,
  Clock,
} from 'lucide-react';

interface Props {
  currentPersona: UserPersonaMode;
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<Props> = ({ currentPersona, onSuccess }) => {
  const { loginUser, registerUser, loginWithGoogle } = useAuth();
  const personaConfig = getPersonaConfig(currentPersona);

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Google Sign-in
  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      setSuccessMsg('تم تسجيل الدخول بنجاح عبر حساب Google!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('تعذر تسجيل الدخول عبر Google، يرجى المحاولة مرة أخرى أو استخدام البريد وكلمة المرور.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsLoading(true);
    try {
      await loginUser(email, password);
      setSuccessMsg('تم تسجيل الدخول بنجاح! جاري تحميل بروفايلك وخططك الدراسية...');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة، أو لم يتم إنشاء الحساب بعد.');
      } else if (err.code === 'auth/invalid-email') {
        setError('صيغة البريد الإلكتروني غير صحيحة.');
      } else {
        setError(err.message || 'حدث خطأ أثناء تسجيل الدخول، يرجى التحقق والمحاولة ثانية.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Direct Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!username.trim()) {
      setError('يرجى كتابة اسم المستخدم أو اسمك الدراسي للبروفايل');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صالح');
      return;
    }
    if (password.length < 6) {
      setError('يجب ألا تقل كلمة المرور عن 6 أحرف أو أرقام');
      return;
    }
    if (password !== confirmPassword) {
      setError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }

    setIsLoading(true);
    try {
      await registerUser(email.trim(), password, username.trim());
      setSuccessMsg(`أهلاً بك يا ${username}! تم إنشاء بروفايلك بنجاح وحفظ بياناتك.`);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('هذا البريد الإلكتروني مسجل مسبقاً. يرجى تسجيل الدخول مباشرة.');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور ضعيفة، يرجى اختيار كلمة مرور أقوى (6 خانات فأكثر).');
      } else if (err.code === 'auth/invalid-email') {
        setError('صيغة البريد الإلكتروني غير صحيحة.');
      } else {
        setError(err.message || 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-2" dir="rtl">
      <div className="rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-2xl shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-b from-cyan-950/40 via-slate-900/60 to-transparent border-b border-white/5 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 shadow-lg shadow-cyan-500/10 mb-4">
            <GraduationCap className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            {mode === 'login' ? 'تسجيل الدخول إلى بروفايلك' : 'إنشاء بروفايل دراسي جديد'}
          </h2>
          <p className="text-xs sm:text-sm text-white/70 mt-2 max-w-md mx-auto leading-relaxed">
            {mode === 'login'
              ? 'ادخل إلى مساحتك الخاصة لاستعراض خطط المذاكرة المفككة ومتابعة إنجازك'
              : 'سجل باسمك والبريد وكلمة المرور لحفظ كبسولاتك وخططك في بروفايلك الخاص'}
          </p>

          {/* Persona Badge Indicator */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>النمط النشط: <strong>{personaConfig.name}</strong></span>
          </div>
        </div>

        {/* Google 1-Click Sign-in Button */}
        <div className="px-6 sm:px-8 pt-6">
          <button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg shadow-white/5 transition-all flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>المتابعة السريعة بحساب Google</span>
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-white/10 w-full"></div>
            <span className="bg-slate-900 px-3 text-xs text-white/40 font-medium absolute">
              أو استخدام البريد وكلمة المرور
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 mx-6 sm:mx-8 bg-slate-950/80 rounded-2xl border border-white/5">
          <button
            id="tab-login-btn"
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/30 shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>تسجيل الدخول</span>
          </button>

          <button
            id="tab-register-btn"
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/30 shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>إنشاء بروفايل جديد</span>
          </button>
        </div>

        {/* Messages */}
        <div className="px-6 sm:px-8 mt-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Forms Container */}
        <div className="p-6 sm:p-8 pt-4">
          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    كلمة المرور
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition pl-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="submit-login-btn"
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>دخول إلى البروفايل</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  اسم المستخدم / اسمك الدراسي (سيظهر في بروفايلك)
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="مثال: أحمد مصطفى أو Dr. Amro"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      dir="ltr"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="6 خانات أو أكثر"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    تأكيد كلمة المرور
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    dir="ltr"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>
              </div>

              {/* Profile Feature Highlights */}
              <div className="p-3.5 rounded-2xl bg-cyan-500/5 border border-cyan-400/20 text-xs text-white/70 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>مميزات بروفايلك في كبسولة المنهج:</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>حفظ وتخزين سحابي لجميع خططك الدراسية مع عزل كامل للبيانات</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>مزامنة المهام والكبسولات المنجزة وساعات التركيز</span>
                </div>
              </div>

              <button
                id="submit-register-btn"
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    <span>إنشاء البروفايل وبدء المذاكرة</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Switch Link */}
          <div className="text-center mt-6 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-xs text-cyan-300/80 hover:text-cyan-300 font-semibold transition"
            >
              {mode === 'login'
                ? 'ليس لديك بروفايل بعد؟ اضغط هنا لإنشاء حساب جديد'
                : 'لديك حساب بالفعل؟ اضغط هنا لتسجيل الدخول'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
