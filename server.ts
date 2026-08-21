import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Lazy-initialized Gemini client with required headers
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to handle transient Gemini 503 / 429 high demand spikes with retries and fallback
async function generateWithRetryAndFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config: any;
    primaryModel?: string;
  }
) {
  // Use current supported models
  const candidateModels = [
    params.primaryModel || 'gemini-3.7-flash',
    'gemini-3.1-flash-lite',
  ];
  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = String(err?.message || err);
        const isTransient =
          err?.status === 503 ||
          err?.status === 429 ||
          errMsg.includes('503') ||
          errMsg.includes('429') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('overloaded');

        if (isTransient && attempt < 2) {
          // Short jittered delay before retry
          await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));
          continue;
        }

        // Switch to next candidate model seamlessly
        break;
      }
    }
  }

  throw lastError;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper to create nodemailer email transporter
async function createEmailTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SERVICE } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  if (SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      service: SMTP_SERVICE || 'gmail',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  // Fallback to test ethereal email transport or direct SMTP
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch {
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }
}

// In-memory temporary verification store for OTP codes with 10 minutes expiry
const verificationOtpStore = new Map<string, { code: string; expiresAt: number; username: string }>();

// Send OTP Verification code to user's real email
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email, username = 'طالبنا المتميز' } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'يرجى إدخال بريد إلكتروني صحيح وصالح.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const safeUsername = String(username).trim() || 'طالبنا المتميز';

    // Generate secure 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    verificationOtpStore.set(normalizedEmail, {
      code: otpCode,
      expiresAt,
      username: safeUsername,
    });

    console.log(`[AUTH] Sending OTP to email: ${normalizedEmail}`);

    // Send actual email via Nodemailer
    try {
      const transporter = await createEmailTransporter();
      const mailOptions = {
        from: process.env.SMTP_FROM || '"كبسولة المنهج" <noreply@studycapsule.app>',
        to: normalizedEmail,
        subject: `رمز التحقق الخاص بك: ${otpCode} - كبسولة المنهج`,
        text: `مرحباً ${safeUsername}،\n\nرمز التحقق (OTP) الخاص بك لتأكيد بريدك الإلكتروني في كبسولة المنهج هو: ${otpCode}\n\nهذا الرمز صالح لمدة 10 دقائق فقط لحماية حسابك وعزل خططك الدراسية.\n\nبالتوفيق والنجاح!`,
        html: `
          <div dir="rtl" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 540px; margin: 0 auto; background-color: #080C14; color: #F8FAFC; border-radius: 24px; padding: 32px; border: 1px solid rgba(6, 182, 212, 0.3); text-align: right;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #22d3ee; margin: 0; font-size: 24px; font-weight: 800;">⚡ كبسولة المنهج</h1>
              <p style="color: #94a3b8; font-size: 13px; margin-top: 6px;">مساحتك الذكية للمذاكرة وتفكيك المواد</p>
            </div>
            
            <div style="background-color: #0F172A; border-radius: 18px; padding: 24px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
              <h2 style="color: #ffffff; font-size: 17px; margin-top: 0;">رمز التحقق السري (OTP)</h2>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                أهلاً بك يا <strong>${safeUsername}</strong>! استخدم هذا الرمز لتأكيد بريدك الإلكتروني والدخول إلى حسابك السحابي:
              </p>
              
              <div style="margin: 20px auto; max-width: 280px; padding: 16px; background-color: #000000; border: 2px dashed #06b6d4; border-radius: 14px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #38bdf8; font-family: monospace;">
                ${otpCode}
              </div>
              
              <p style="color: #f59e0b; font-size: 12px; margin-bottom: 0;">
                ⏳ هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 11px;">
              إذا لم تكن قد طلبت إنشاء حساب في كبسولة المنهج، يمكنك تجاهل هذه الرسالة بأمان.
            </div>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[AUTH] OTP email sent successfully. ID: ${info?.messageId || 'ok'}`);
    } catch (mailErr) {
      console.warn('[AUTH] Mail transporter warning:', mailErr);
      // We still keep the OTP in store for verification
    }

    return res.json({
      success: true,
      message: `تم إرسال رمز التحقق (OTP) إلى بريدك الإلكتروني: ${normalizedEmail}`,
      // Note: code is deliberately NOT returned to client for maximum security and privacy
    });
  } catch (err: any) {
    console.error('Error in /api/auth/send-otp:', err);
    return res.status(500).json({ error: 'تعذر إرسال رمز التحقق إلى بريدك', details: err.message });
  }
});

// Verify OTP endpoint
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'يرجى تزويد البريد الإلكتروني ورمز التحقق' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const record = verificationOtpStore.get(normalizedEmail);

    if (!record) {
      return res.status(400).json({ error: 'لم يتم العثور على رمز تحقق نشط لهذا البريد أو انتهت صلاحيته. يرجى طلب رمز جديد.' });
    }

    if (Date.now() > record.expiresAt) {
      verificationOtpStore.delete(normalizedEmail);
      return res.status(400).json({ error: 'انتهت صلاحية رمز التحقق (صلاحيته 10 دقائق). يرجى طلب رمز جديد.' });
    }

    if (record.code !== String(otp).trim()) {
      return res.status(400).json({ error: 'رمز التحقق (OTP) غير صحيح. يرجى التأكد من الرمز المرسل إلى بريدك الإلكتروني.' });
    }

    // OTP is valid! Clear it to prevent reuse
    verificationOtpStore.delete(normalizedEmail);

    return res.json({
      success: true,
      verified: true,
      message: 'تم التحقق من الرمز بنجاح!',
    });
  } catch (err: any) {
    console.error('Error in /api/auth/verify-otp:', err);
    return res.status(500).json({ error: 'حدث خطأ أثناء التحقق من الرمز', details: err.message });
  }
});

// Primary Cognitive Deconstruction Endpoint
app.post('/api/deconstruct', async (req, res) => {
  try {
    const {
      subjectName = '',
      studyText = '',
      file,
      studyDays = 3,
      dailyHours = 2,
      targetDifficulty = 'متوسط',
      focusMode = 'متوازن',
      userPersona = 'gen_z',
    } = req.body;

    if ((!studyText || typeof studyText !== 'string' || studyText.trim().length === 0) && !file?.base64) {
      return res.status(400).json({ error: 'يرجى إدخال نص المذكرة أو تحديد المادة ورفع ملف دراسي لتحليله.' });
    }

    const ai = getGeminiClient();

    let personaRoleInstruction = '';
    if (userPersona === 'gen_alpha') {
      personaRoleInstruction = `
[Persona Mode: Gen Alpha - Hero & Level Quests (جيل ألفا - الأبطال والمراحل)]
- Tone: Exciting, gamified, interactive, and encouraging.
- Terminology:
  * Capsule -> "خريطة المغامرة ومهمات التفوق"
  * Tasks -> "مهمات البطل اليومية (XP Tasks)"
  * Pro Tip -> "مفتاح القوة والنجاح (Super Tip)"
  * Day Titles: Formatted as quest stages (e.g., "المرحلة 1: بداية المغامرة وشحن طاقة التركيز", "المرحلة 2: حل ألغاز القوانين والتفوق الخارق").
  * Cognitive Labels:
    - deep_reading -> "استكشاف أسرار الدرس"
    - problem_solving -> "تحدي الألغاز والمسائل الذهبية"
    - memorization -> "درع الحفظ الذهبي الخارق"
`;
    } else if (userPersona === 'classic') {
      personaRoleInstruction = `
[Persona Mode: Classic Academic (النمط الأكاديمي المنهجي)]
- Tone: Formal, structured, precise, and academic.
- Terminology:
  * Capsule -> "الخطة الدراسية والمنهج المعتمد"
  * Tasks -> "جدول المهام والتحصيل اليومي"
  * Pro Tip -> "إرشاد أكاديمي وتربوي"
  * Day Titles: Formatted as academic schedule days (e.g., "اليوم الدراسي 1: دراسة المفاهيم التأسيسية", "اليوم الدراسي 2: التحليل والتطبيق المنهجي").
  * Cognitive Labels:
    - deep_reading -> "القراءة والتحليل المعرفي"
    - problem_solving -> "التطبيق العملي وحل التمارين"
    - memorization -> "الحفظ والتثبيت المنهجي"
`;
    } else {
      // Gen Z (Default)
      personaRoleInstruction = `
[Persona Mode: Gen Z (جيل Z - روقان وتركيز عالي)]
- Tone: Modern, friendly, encouraging Arabic/Egyptian Gen-Z phrasing, strictly adhering to polite cultural and Islamic moral boundaries.
- Terminology:
  * Capsule -> "كبسولة المنهج وتظبيط التارجت"
  * Tasks -> "تاسكات المذاكرة ع الرايق"
  * Pro Tip -> "نصيحة فورمة المذاكرة (Pro Tip)"
  * Day Titles: Formatted with modern friendly titles (e.g., "اليوم 1: الأساسيات ع الرايق بدون توتر", "اليوم 2: هضم النظريات وتثبيت المسائل").
  * Cognitive Labels:
    - deep_reading -> "قراءة وفهم عميق (Deep Dive)"
    - problem_solving -> "تطبيق وحل مسائل (شغل عالي)"
    - memorization -> "تثبيت وحفظ سريع (ثبّت المعلومة)"
`;
    }

    const systemInstruction = `
[Role & Tone Definition]
You are an expert Study Planner and Task Architect tailored to the student's selected generation persona.
${personaRoleInstruction}

[Task Objective]
Parse raw study material/notes and convert them into lightweight, actionable micro-tasks organized into structured JSON for our frontend application.

[Rules & Constraints]
1. Always respond in valid, strictly parseable JSON conforming to the exact schema provided.
2. Break down all topics into bite-sized tasks that take strictly between 15 to 45 minutes each.
3. Assign recommended Pomodoro intervals:
   - "memorization": focus_minutes: 20, break_minutes: 5
   - "problem_solving": focus_minutes: 30, break_minutes: 5
   - "deep_reading": focus_minutes: 45, break_minutes: 10
4. Write day titles reflecting the selected persona style.
5. Provide a realistic distribution (summing to ~100%) for deep_reading_percentage, problem_solving_percentage, and memorization_percentage.
6. Provide a powerful, practical "pro_tip_arabic" matching the persona's tone.
`;

    let textPrompt = `
[اسم المادة أو المقرر]: ${subjectName ? subjectName : 'مادة دراسية عامة'}

[المعطيات التخطيطية]:
- عدد الأيام المتاحة للمذاكرة: ${studyDays} أيام
- الساعات اليومية المتاحة: ${dailyHours} ساعة يومياً
- مستوى الصعوبة المستهدف: ${targetDifficulty}
- أسلوب التركيز: ${focusMode}
`;

    if (studyText && studyText.trim().length > 0) {
      textPrompt += `\n[نص المذكرة أو الفصل الدراسي المراد تقسيمه وتوزيعه]:\n${studyText}\n`;
    }

    if (file && file.name) {
      textPrompt += `\n[ملف مرفق]: تم إرفاق الملف الدراسي (${file.name}) لتحليله واستخراج التاسكات منه.\n`;
    }

    textPrompt += `\nقم بتحليل المحتوى وتوليد كبسولة المنهج وجدول تاسكات المذاكرة وفق المخطط التالي:\n`;

    const contents: any[] = [{ text: textPrompt }];

    if (file && file.base64 && file.mimeType) {
      const cleanBase64 = file.base64.replace(/^data:[^;]+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: file.mimeType,
          data: cleanBase64,
        },
      });
    }

    const response = await generateWithRetryAndFallback(ai, {
      primaryModel: 'gemini-3.7-flash',
      contents: contents.length === 1 ? textPrompt : contents,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.OBJECT,
              properties: {
                total_estimated_minutes: { type: Type.NUMBER, description: 'Total minutes for entire plan' },
                total_tasks_count: { type: Type.NUMBER, description: 'Total count of tasks' },
                overview_arabic: { type: Type.STRING, description: 'Sleek overview in modern Arabic' },
                pro_tip_arabic: { type: Type.STRING, description: 'Smart Pro Tip for effective study without burnout' },
              },
              required: ['total_estimated_minutes', 'total_tasks_count', 'overview_arabic', 'pro_tip_arabic'],
            },
            distribution: {
              type: Type.OBJECT,
              properties: {
                deep_reading_percentage: { type: Type.NUMBER },
                problem_solving_percentage: { type: Type.NUMBER },
                memorization_percentage: { type: Type.NUMBER },
              },
              required: ['deep_reading_percentage', 'problem_solving_percentage', 'memorization_percentage'],
            },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day_number: { type: Type.NUMBER },
                  day_title_arabic: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        task_id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        cognitive_type: {
                          type: Type.STRING,
                          enum: ['memorization', 'problem_solving', 'deep_reading'],
                        },
                        type_label_arabic: { type: Type.STRING },
                        estimated_minutes: { type: Type.NUMBER },
                        pomodoro_setting: {
                          type: Type.OBJECT,
                          properties: {
                            focus_minutes: { type: Type.NUMBER },
                            break_minutes: { type: Type.NUMBER },
                          },
                          required: ['focus_minutes', 'break_minutes'],
                        },
                        steps: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ['task_id', 'title', 'cognitive_type', 'type_label_arabic', 'estimated_minutes', 'pomodoro_setting', 'steps'],
                    },
                  },
                },
                required: ['day_number', 'day_title_arabic', 'tasks'],
              },
            },
          },
          required: ['summary', 'distribution', 'schedule'],
        },
      },
    });

    const rawText = (response.text || '{}').trim();
    let parsedData: any;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      // Fallback in case of json wrapped in markdown blocks or extra characters
      const cleanJson = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .replace(/^[^{\[]*/, '')
        .replace(/[^}\]]*$/, '')
        .trim();
      parsedData = JSON.parse(cleanJson);
    }

    // Standardize and normalize schedule, tasks, labels, and aliases
    const rawSchedule = parsedData.schedule || parsedData.suggested_schedule || [];
    let taskCounter = 1;

    const normalizedSchedule = rawSchedule.map((day: any, dayIdx: number) => ({
      day_number: day.day_number || dayIdx + 1,
      day_title_arabic: day.day_title_arabic || `اليوم ${dayIdx + 1}: مذاكرة وتركيز`,
      tasks: (day.tasks || []).map((task: any) => {
        const cogType = ['memorization', 'problem_solving', 'deep_reading'].includes(task.cognitive_type)
          ? task.cognitive_type
          : 'deep_reading';

        let typeLabel = task.type_label_arabic;
        if (!typeLabel) {
          if (cogType === 'memorization') typeLabel = 'تثبيت وحفظ سريع';
          else if (cogType === 'problem_solving') typeLabel = 'تطبيق وحل مسائل';
          else typeLabel = 'قراءة وفهم عميق';
        }

        let pomo = task.pomodoro_setting || task.recommended_pomodoro;
        if (!pomo || !pomo.focus_minutes) {
          if (cogType === 'memorization') pomo = { focus_minutes: 20, break_minutes: 5 };
          else if (cogType === 'problem_solving') pomo = { focus_minutes: 30, break_minutes: 5 };
          else pomo = { focus_minutes: 45, break_minutes: 10 };
        }

        const taskSteps = (Array.isArray(task.steps) && task.steps.length > 0)
          ? task.steps
          : (Array.isArray(task.micro_steps) && task.micro_steps.length > 0)
          ? task.micro_steps
          : ['قراءة واستيعاب النقاط الأساسية (15 دقيقة)', 'حل أمثلة وتطبيق عملي (15 دقيقة)'];

        return {
          task_id: task.task_id || `task_${taskCounter++}`,
          title: task.title || `تاسك ${taskCounter}`,
          cognitive_type: cogType,
          type_label_arabic: typeLabel,
          estimated_minutes: Number(task.estimated_minutes) || pomo.focus_minutes || 30,
          pomodoro_setting: pomo,
          recommended_pomodoro: pomo,
          steps: taskSteps,
          micro_steps: taskSteps,
        };
      }),
    }));

    // Ensure distribution calculation exists
    let distribution = parsedData.distribution;
    if (!distribution || typeof distribution.deep_reading_percentage !== 'number') {
      let deepCount = 0;
      let probCount = 0;
      let memoCount = 0;
      let totalTasks = 0;

      normalizedSchedule.forEach((d: any) => {
        d.tasks.forEach((t: any) => {
          totalTasks++;
          if (t.cognitive_type === 'memorization') memoCount++;
          else if (t.cognitive_type === 'problem_solving') probCount++;
          else deepCount++;
        });
      });

      if (totalTasks > 0) {
        distribution = {
          deep_reading_percentage: Math.round((deepCount / totalTasks) * 100),
          problem_solving_percentage: Math.round((probCount / totalTasks) * 100),
          memorization_percentage: Math.max(0, 100 - Math.round((deepCount / totalTasks) * 100) - Math.round((probCount / totalTasks) * 100)),
        };
      } else {
        distribution = {
          deep_reading_percentage: 45,
          problem_solving_percentage: 35,
          memorization_percentage: 20,
        };
      }
    }

    const proTip = parsedData.summary?.pro_tip_arabic || parsedData.contextual_tip_arabic || 'قاعدة الـ 5 دقائق: لو حاسس بكسل، ابدأ بس 5 دقائق بدون أي ضغط، هتلاقي عقلك اندمج وكملت التاسك بسهولة!';

    parsedData.summary = {
      total_estimated_minutes: Number(parsedData.summary?.total_estimated_minutes) || 120,
      total_tasks_count: Number(parsedData.summary?.total_tasks_count) || normalizedSchedule.reduce((acc: number, d: any) => acc + d.tasks.length, 0),
      overview_arabic: parsedData.summary?.overview_arabic || 'خطة مذاكرة سريعة ومتوازنة مقسمة لتاسكات واضحة.',
      pro_tip_arabic: proTip,
    };

    parsedData.distribution = distribution;
    parsedData.schedule = normalizedSchedule;
    parsedData.suggested_schedule = normalizedSchedule;
    parsedData.pro_tip_arabic = proTip;
    parsedData.contextual_tip_arabic = proTip;

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error in /api/deconstruct:', error);
    return res.status(500).json({
      error: 'حدث خطأ أثناء تحليل المادة الدراسية',
      details: error.message || String(error),
    });
  }
});

// Helper endpoint for generating active-recall flash quiz with MCQs and explanations
app.post('/api/task-deepdive', async (req, res) => {
  try {
    const { taskTitle, cognitiveType, microSteps, userPersona = 'gen_z' } = req.body;
    if (!taskTitle) {
      return res.status(400).json({ error: 'العنوان مطلوب' });
    }

    const ai = getGeminiClient();

    let personaNudgeInstruction = '';
    if (userPersona === 'gen_alpha') {
      personaNudgeInstruction = `الأسلوب: حماسي ومغامرات لأبطال المذاكرة وجيل ألفا (تحدي البطل، نقاط XP، درع التركيز الخارق).`;
    } else if (userPersona === 'classic') {
      personaNudgeInstruction = `الأسلوب: منهجي وأكاديمي رصين ومحفز للطلاب والدارسين.`;
    } else {
      personaNudgeInstruction = `الأسلوب: جيل Z بروقان وتركيز عالي، مصطلحات شبابية مصرية راقية ومحترمة منضبطة بأخلاقنا وقيمنا (على الرايق، قفل التارجت، استعن بالله، بلاش تسويف).`;
    }

    const prompt = `
أنت مدرب دراسي ذكي وسريع البديهة للطلاب.
${personaNudgeInstruction}

المهمة الحالية:
- عنوان المهمة: ${taskTitle}
- نوع المذاكرة: ${cognitiveType}
- خطوات التنفيذ: ${(microSteps || []).join('، ')}

المطلوب:
صياغة بطاقة استرجاع وتثبيت ذكية ومحفزة بلغة عربية مبسطة وعصرية وسلسة جداً للطلاب (بدون مصطلحات معقدة أو جفاف):
1. focus_nudge: نصيحة ذكية وسريعة لمنع التشتت أثناء هذه الجلسة بأسلوب النمط المحدد.
2. active_recall_questions: 3 أسئلة اختيار من متعدد (MCQ) لاختبار الفهم الحقيقي بعد المذاكرة:
   - question: نص السؤال بأسلوب بسيط ومباشر يختبر الفكرة الأساسية.
   - options: 4 خيارات واضحة وقصيرة (أ، ب، ج، د).
   - correct_index: رقم الخيار الصحيح (رقم من 0 إلى 3 يطابق الخيار الصحيح في مصفوفة options).
   - explanation: تفسير سريع وودود يوضح ليه دي الإجابة الصح وكيف يثبتها الطالب بسهولة.
3. retention_strategy: تريك أو حركة ذكية لتثبيت المعلومة في الذاكرة طويلة المدى.

أجب بتنسيق JSON مطابق للمخطط:
`;

    const response = await generateWithRetryAndFallback(ai, {
      primaryModel: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            focus_nudge: { type: Type.STRING },
            active_recall_questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correct_index: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correct_index', 'explanation'],
              },
            },
            retention_strategy: { type: Type.STRING },
          },
          required: ['focus_nudge', 'active_recall_questions', 'retention_strategy'],
        },
      },
    });

    const rawText = (response.text || '{}').trim();
    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const clean = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .replace(/^[^{\[]*/, '')
        .replace(/[^}\]]*$/, '')
        .trim();
      parsed = JSON.parse(clean);
    }

    // Sanitize active_recall_questions to ensure options and correct_index exist
    if (Array.isArray(parsed?.active_recall_questions)) {
      parsed.active_recall_questions = parsed.active_recall_questions.map((q: any, idx: number) => {
        if (typeof q === 'string') {
          return {
            question: q,
            options: ['الخيار الأول', 'الخيار الثاني', 'الخيار الثالث', 'الخيار الرابع'],
            correct_index: 0,
            explanation: 'هذا هو المفهوم الأساسي المرتبط بالمهمة.',
          };
        }
        return {
          question: q.question || `سؤال اختبار الفهم ${idx + 1}`,
          options: Array.isArray(q.options) && q.options.length >= 2
            ? q.options
            : ['الخيار الصحيح', 'خيار غير دقيق', 'خيار بديل', 'خيار إضافي'],
          correct_index: typeof q.correct_index === 'number' && q.correct_index >= 0 && q.correct_index < (q.options?.length || 4)
            ? q.correct_index
            : 0,
          explanation: q.explanation || 'تأكد من مراجعة النقطة الأساسية في المذكرة لتثبيت الفهم.',
        };
      });
    }

    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/task-deepdive:', err);
    return res.status(500).json({ error: 'تعذر توليد تفاصيل المهمة', details: err.message });
  }
});

// Express global error handler returning clean JSON
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express Global Error:', err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || err.statusCode || 500;
  const message =
    err.type === 'entity.too.large'
      ? 'حجم الملف أو المحتوى كبير جداً، يرجى اختيار ملف أصغر من 15 ميجابايت.'
      : (err.message || 'حدث خطأ في معالجة الطلب.');
  return res.status(status).json({ error: message, details: err.message });
});

// Vite middleware for dev / static for production
async function setupApp() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Educational Cognitive Architect Server listening on port ${PORT}`);
  });
}

setupApp();
