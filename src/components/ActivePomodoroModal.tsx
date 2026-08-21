import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  X,
  Brain,
  BookOpen,
  Calculator,
  Volume2,
  VolumeX,
  Headphones,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TaskItem, CognitiveType, UserPersonaMode } from '../types';
import { sounds } from '../utils/audio';
import { FocusAudioPlayer } from './FocusAudioPlayer';
import { getPersonaConfig, getPersonaCognitiveLabel } from '../utils/persona';

interface Props {
  task: TaskItem;
  currentPersona: UserPersonaMode;
  onClose: () => void;
  onTaskCompleted: (taskId: string) => void;
  onToggleStep: (taskId: string, stepIndex: number) => void;
}

export const ActivePomodoroModal: React.FC<Props> = ({
  task,
  currentPersona,
  onClose,
  onTaskCompleted,
  onToggleStep,
}) => {
  const personaConfig = getPersonaConfig(currentPersona);
  const focusMinutes = task.recommended_pomodoro?.focus_minutes || 25;
  const breakMinutes = task.recommended_pomodoro?.break_minutes || 5;

  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [totalSeconds, setTotalSeconds] = useState<number>(focusMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(focusMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completedPomos, setCompletedPomos] = useState<number>(0);

  const timerRef = useRef<any>(null);

  // Play start chime on mount
  useEffect(() => {
    if (soundEnabled) {
      sounds.playFocusStart();
    }
  }, []);

  // Timer Tick Engine
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, focusMinutes, breakMinutes, soundEnabled]);

  const handlePhaseComplete = () => {
    if (mode === 'focus') {
      if (soundEnabled) sounds.playBreakStart();
      setCompletedPomos((c) => c + 1);
      setMode('break');
      setTotalSeconds(breakMinutes * 60);
      setRemainingSeconds(breakMinutes * 60);
      setIsRunning(true);
    } else {
      if (soundEnabled) sounds.playFocusStart();
      setMode('focus');
      setTotalSeconds(focusMinutes * 60);
      setRemainingSeconds(focusMinutes * 60);
      setIsRunning(true);
    }
  };

  const handleTogglePlay = () => {
    if (!isRunning && soundEnabled) {
      sounds.playFocusStart();
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    const duration = mode === 'focus' ? focusMinutes * 60 : breakMinutes * 60;
    setTotalSeconds(duration);
    setRemainingSeconds(duration);
  };

  const handleSwitchMode = (newMode: 'focus' | 'break') => {
    setMode(newMode);
    const duration = newMode === 'focus' ? focusMinutes * 60 : breakMinutes * 60;
    setTotalSeconds(duration);
    setRemainingSeconds(duration);
    setIsRunning(false);
  };

  const handleFinishTask = () => {
    if (soundEnabled) sounds.playTaskComplete();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    onTaskCompleted(task.task_id);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;
  const strokeDashoffset = 440 - (440 * progressPercent) / 100;

  const cognitiveLabel = getPersonaCognitiveLabel(currentPersona, task.cognitive_type);

  return (
    <div
      id="active-pomodoro-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div
        id="active-pomodoro-card"
        className="relative bg-[#0F172A] border border-cyan-500/30 w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200 text-right my-auto"
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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {cognitiveLabel}
              </span>
              <span className="text-[11px] font-mono text-white/40">
                {personaConfig.shortName}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1 max-w-[280px] sm:max-w-xs truncate">
              {task.title}
            </h3>
          </div>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center justify-center gap-2 p-1 bg-white/5 rounded-2xl mb-8 border border-white/10">
          <button
            type="button"
            onClick={() => handleSwitchMode('focus')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'focus'
                ? 'bg-cyan-400 text-black shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {personaConfig.terms.focusSessionName} ({focusMinutes} د)
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('break')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'break'
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {personaConfig.terms.breakName} ({breakMinutes} د)
          </button>
        </div>

        {/* Circular Progress & Big Timer Display */}
        <div className="flex flex-col items-center justify-center my-6 relative">
          <div className="relative w-56 h-56 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="70"
                className="text-white/10 stroke-current"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                className={`${
                  mode === 'focus' ? 'text-cyan-400' : 'text-purple-400'
                } stroke-current transition-all duration-1000`}
                strokeWidth="7"
                strokeDasharray="440"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-white">
                {formatTime(remainingSeconds)}
              </span>
              <span className="text-xs text-white/50 mt-1 font-sans">
                {mode === 'focus' ? personaConfig.terms.focusSessionName : personaConfig.terms.breakName}
              </span>
            </div>
          </div>

          {/* Completed Cycles Counter */}
          <div className="mt-4 flex items-center gap-2 text-xs font-mono text-white/60">
            <span>الدورات المكتملة:</span>
            <div className="flex items-center gap-1">
              {[...Array(Math.max(4, completedPomos + 1))].map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i < completedPomos ? 'bg-cyan-400 scale-110 shadow-sm shadow-cyan-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Floating Focus Sound Bar inside modal */}
        <div className="my-5 p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-white/80">
            <Headphones className="w-4 h-4 text-cyan-400" />
            <span>صوت عزل المشتتات:</span>
          </div>
          <FocusAudioPlayer compact />
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={handleReset}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
            title="إعادة ضبط الوقت"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2.5 transition-all shadow-xl active:scale-95 ${
              isRunning
                ? 'bg-amber-400 text-black hover:bg-amber-300'
                : 'bg-white text-black hover:bg-cyan-400'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>متابعة التركيز</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePhaseComplete}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
            title="تخطي للجلسة التالية"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Mark Task Done Button */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <button
            type="button"
            onClick={handleFinishTask}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{personaConfig.terms.completionCongrats.split('!')[0].trim()} • إنهاء التاسك بنجاح</span>
          </button>
        </div>
      </div>
    </div>
  );
};
