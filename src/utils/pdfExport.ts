import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { StudyDeconstructionResponse } from '../types';

export async function exportPlanToPdf(
  plan: StudyDeconstructionResponse,
  subjectName?: string,
  elementIdToCapture?: string
): Promise<void> {
  const title = subjectName?.trim() ? subjectName : 'خطة_المذاكرة';
  const cleanFileName = `${title.replace(/[\s/\\?%*:|"<>]/g, '_')}_كبسولة_المنهج.pdf`;

  // If a rendered DOM element is provided, try high-fidelity canvas capture
  if (elementIdToCapture) {
    const targetElement = document.getElementById(elementIdToCapture);
    if (targetElement) {
      try {
        const canvas = await html2canvas(targetElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#0B0F17',
          windowWidth: targetElement.scrollWidth,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20; // 10mm margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);

        while (heightLeft > 0) {
          position = heightLeft - imgHeight + 10;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= (pdfHeight - 20);
        }

        pdf.save(cleanFileName);
        return;
      } catch (canvasErr) {
        console.warn('Canvas PDF capture fallback triggered:', canvasErr);
      }
    }
  }

  // Pure printable window fallback / direct PDF generator
  generatePrintableDocument(plan, subjectName);
}

export function generatePrintableDocument(
  plan: StudyDeconstructionResponse,
  subjectName?: string
): void {
  const schedule = plan.schedule || plan.suggested_schedule || [];
  const subject = subjectName?.trim() ? subjectName : 'المادة الدراسية';
  const totalHours = Math.round((plan.summary.total_estimated_minutes / 60) * 10) / 10;
  const dist = plan.distribution || {
    deep_reading_percentage: 40,
    problem_solving_percentage: 40,
    memorization_percentage: 20,
  };
  const proTip = plan.summary.pro_tip_arabic || plan.pro_tip_arabic || plan.contextual_tip_arabic || '';

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة لتحميل وطباعة ملف الـ PDF.');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>${subject} - كبسولة المنهج وجدول المذاكرة</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #ffffff;
      color: #111827;
      padding: 32px;
      line-height: 1.6;
    }
    .header {
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
    }
    .brand span {
      color: #0284c7;
    }
    .date-badge {
      font-size: 12px;
      color: #64748b;
      background: #f1f5f9;
      padding: 6px 14px;
      border-radius: 20px;
    }
    .hero-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .hero-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .hero-desc {
      font-size: 14px;
      color: #334155;
      margin-bottom: 16px;
    }
    .metrics {
      display: flex;
      gap: 16px;
      margin-top: 12px;
    }
    .metric-pill {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 8px 16px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
    }
    .pro-tip {
      background: #eff6ff;
      border-right: 4px solid #3b82f6;
      padding: 14px 18px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 13px;
      color: #1e40af;
    }
    .pro-tip strong {
      display: block;
      margin-bottom: 4px;
      color: #1d4ed8;
      font-size: 14px;
    }
    .day-section {
      margin-bottom: 28px;
      page-break-inside: avoid;
    }
    .day-header {
      background: #0f172a;
      color: #ffffff;
      padding: 10px 16px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
    }
    .task-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      background: #ffffff;
    }
    .task-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .task-name {
      font-size: 15px;
      font-weight: 600;
      color: #0f172a;
    }
    .task-type-badge {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: 600;
      background: #e0f2fe;
      color: #0369a1;
    }
    .task-type-badge.memorization {
      background: #fef3c7;
      color: #b45309;
    }
    .task-type-badge.problem_solving {
      background: #f3e8ff;
      color: #7e22ce;
    }
    .task-meta {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 10px;
    }
    .steps-list {
      list-style: none;
      padding-right: 0;
      margin-top: 8px;
    }
    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 13px;
      color: #334155;
      margin-bottom: 6px;
    }
    .checkbox {
      width: 16px;
      height: 16px;
      border: 1.5px solid #94a3b8;
      border-radius: 4px;
      margin-top: 3px;
      flex-shrink: 0;
    }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">🚀 كبسولة <span>المنهج</span></div>
    <div class="date-badge">تاريخ التوليد: ${new Date().toLocaleDateString('ar-EG', { dateStyle: 'medium' })}</div>
  </div>

  <div class="hero-card">
    <div class="hero-title">${subject}</div>
    <div class="hero-desc">${plan.summary.overview_arabic}</div>
    <div class="metrics">
      <div class="metric-pill">⏱ إجمالي الوقت: ${totalHours} ساعة (${plan.summary.total_estimated_minutes} دقيقة)</div>
      <div class="metric-pill">🎯 عدد التاسكات: ${plan.summary.total_tasks_count} تاسك</div>
      <div class="metric-pill">📖 قراءة: ${dist.deep_reading_percentage}% | ✍️ مسائل: ${dist.problem_solving_percentage}% | 🧠 حفظ: ${dist.memorization_percentage}%</div>
    </div>
  </div>

  ${proTip ? `
  <div class="pro-tip">
    <strong>💡 Pro Tip للمذاكرة الذكية:</strong>
    ${proTip}
  </div>` : ''}

  ${schedule.map((day) => `
    <div class="day-section">
      <div class="day-header">
        <span>${day.day_title_arabic}</span>
        <span>${day.tasks.length} تاسكات</span>
      </div>

      ${day.tasks.map((task) => {
        const steps = task.steps || task.micro_steps || [];
        const pomo = task.pomodoro_setting || task.recommended_pomodoro || { focus_minutes: 25, break_minutes: 5 };
        const label = task.type_label_arabic || (task.cognitive_type === 'memorization' ? 'تثبيت وحفظ سريع' : task.cognitive_type === 'problem_solving' ? 'تطبيق وحل مسائل' : 'قراءة وفهم عميق');

        return `
        <div class="task-card">
          <div class="task-top">
            <div class="task-name">${task.title}</div>
            <span class="task-type-badge ${task.cognitive_type}">${label}</span>
          </div>
          <div class="task-meta">
            ⏱ المدة: ${task.estimated_minutes} دقيقة | 🍅 بومودورو: ${pomo.focus_minutes} د تركيز + ${pomo.break_minutes} د راحة
          </div>
          <ul class="steps-list">
            ${steps.map((st) => `
              <li class="step-item">
                <div class="checkbox"></div>
                <div>${st}</div>
              </li>
            `).join('')}
          </ul>
        </div>
        `;
      }).join('')}
    </div>
  `).join('')}

  <div class="footer">
    تم التخطيط والتنظيم بواسطة المساعد الذكي لدراسة الطلاب © ${new Date().getFullYear()}
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
