import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { DaySchedule, TaskItem, UserPersonaMode } from '../types';
import { TaskCard } from './TaskCard';
import { getPersonaConfig } from '../utils/persona';

interface Props {
  schedule: DaySchedule[];
  currentPersona: UserPersonaMode;
  onToggleComplete: (taskId: string) => void;
  onToggleStep: (taskId: string, stepIndex: number) => void;
  onStartPomodoro: (task: TaskItem) => void;
  onOpenDeepDive: (task: TaskItem) => void;
  onUpdateNotes: (taskId: string, notes: string) => void;
}

export const ScheduleTimeline: React.FC<Props> = ({
  schedule,
  currentPersona,
  onToggleComplete,
  onToggleStep,
  onStartPomodoro,
  onOpenDeepDive,
  onUpdateNotes,
}) => {
  const [activeDayTab, setActiveDayTab] = useState<number | 'all'>('all');
  const personaConfig = getPersonaConfig(currentPersona);

  if (!schedule || schedule.length === 0) {
    return null;
  }

  const displayedDays =
    activeDayTab === 'all'
      ? schedule
      : schedule.filter((day) => day.day_number === activeDayTab);

  return (
    <div id="schedule-timeline-container" className="space-y-6">
      {/* Day Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <h3 className="text-xl font-serif text-white tracking-tight">
            {personaConfig.terms.timelineTitle}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-white/5 p-1 rounded-full border border-white/10">
          <button
            type="button"
            onClick={() => setActiveDayTab('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeDayTab === 'all'
                ? 'bg-white text-black shadow'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            جميع الفترات ({schedule.length})
          </button>

          {schedule.map((day) => {
            const dayCompleted = day.tasks.every((t) => t.completed);
            const completedCount = day.tasks.filter((t) => t.completed).length;

            return (
              <button
                key={day.day_number}
                type="button"
                onClick={() => setActiveDayTab(day.day_number)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeDayTab === day.day_number
                    ? 'bg-white text-black font-bold shadow'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>
                  {personaConfig.terms.dayPrefix} {day.day_number}
                </span>
                {dayCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <span className="text-[10px] font-mono opacity-60">
                    ({completedCount}/{day.tasks.length})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Days List */}
      <div className="space-y-8">
        {displayedDays.map((day) => {
          const totalDayMinutes = day.tasks.reduce((acc, t) => acc + (t.estimated_minutes || 0), 0);
          const completedTasksCount = day.tasks.filter((t) => t.completed).length;
          const isDayFullyComplete = day.tasks.length > 0 && completedTasksCount === day.tasks.length;
          const dayHours = (totalDayMinutes / 60).toFixed(1);

          return (
            <div
              key={day.day_number}
              id={`day-section-${day.day_number}`}
              className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-sm"
            >
              {/* Day Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-serif italic text-cyan-400 text-base">
                    0{day.day_number}
                  </div>
                  <div>
                    <h4 className="text-xl font-serif text-white">{day.day_title_arabic}</h4>
                    <div className="flex items-center gap-3 text-xs text-white/40 mt-1 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-white/40" />
                        {totalDayMinutes} دقيقة (~{dayHours} س)
                      </span>
                      <span>•</span>
                      <span>
                        {day.tasks.length} {personaConfig.terms.tasksUnit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Day Status Pill */}
                <div className="flex items-center gap-2">
                  {isDayFullyComplete ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{personaConfig.terms.completionCongrats}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-white/60 bg-white/5 px-3 py-1 rounded-full border border-white/10 font-mono">
                      الإنجاز: {completedTasksCount}/{day.tasks.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Tasks List */}
              <div className="grid grid-cols-1 gap-4">
                {day.tasks.map((task) => (
                  <TaskCard
                    key={task.task_id}
                    task={task}
                    currentPersona={currentPersona}
                    onToggleComplete={onToggleComplete}
                    onToggleStep={onToggleStep}
                    onStartPomodoro={onStartPomodoro}
                    onOpenDeepDive={onOpenDeepDive}
                    onUpdateNotes={onUpdateNotes}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
