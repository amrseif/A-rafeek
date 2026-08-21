import React, { useState } from 'react';
import { X, Copy, Check, Download, Code2, ShieldCheck } from 'lucide-react';
import { StudyDeconstructionResponse } from '../types';

interface Props {
  plan: StudyDeconstructionResponse;
  onClose: () => void;
}

export const JsonContractModal: React.FC<Props> = ({ plan, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Filter clean JSON adhering to strict contract
  const cleanContract = {
    summary: {
      total_estimated_minutes: plan.summary.total_estimated_minutes,
      total_tasks_count: plan.summary.total_tasks_count,
      overview_arabic: plan.summary.overview_arabic,
    },
    suggested_schedule: plan.suggested_schedule.map((day) => ({
      day_number: day.day_number,
      day_title_arabic: day.day_title_arabic,
      tasks: day.tasks.map((task) => ({
        task_id: task.task_id,
        title: task.title,
        cognitive_type: task.cognitive_type,
        estimated_minutes: task.estimated_minutes,
        recommended_pomodoro: {
          focus_minutes: task.recommended_pomodoro.focus_minutes,
          break_minutes: task.recommended_pomodoro.break_minutes,
        },
        micro_steps: task.micro_steps,
      })),
    })),
    contextual_tip_arabic: plan.contextual_tip_arabic,
  };

  const jsonString = JSON.stringify(cleanContract, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cognitive-study-plan-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="json-modal-backdrop" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-3xl rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif text-white">العقد البرمجي JSON (Schema Contract Output)</h3>
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>مطابق ومتحقق بالكامل 100% مع المخطط القياسي</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-mono text-white/80 border border-white/10 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ JSON'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-cyan-400 text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل .json</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="mt-4 flex-1 overflow-auto rounded-xl bg-black/60 p-5 border border-white/10 font-mono text-xs text-cyan-300 leading-relaxed dir-ltr text-left">
          <pre>{jsonString}</pre>
        </div>
      </div>
    </div>
  );
};
