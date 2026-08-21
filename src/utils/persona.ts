import { UserPersonaMode, CognitiveType } from '../types';

export interface PersonaConfig {
  id: UserPersonaMode;
  name: string;
  shortName: string;
  badge: string;
  tagline: string;
  icon: string;
  colorDot: string;
  pillColor: string;
  terms: {
    appSubtitle: string;
    capsuleTitle: string;
    capsuleBadge: string;
    tasksTitle: string;
    tasksUnit: string;
    focusPeriodsTitle: string;
    focusSessionName: string;
    breakName: string;
    proTipTitle: string;
    defaultProTip: string;
    timelineTitle: string;
    dayPrefix: string;
    activeRecallTitle: string;
    activeRecallBadge: string;
    deepReadingLabel: string;
    problemSolvingLabel: string;
    memorizationLabel: string;
    completionCongrats: string;
    soundTitle: string;
    soundSubtitle: string;
    startTaskBtn: string;
    deepDiveBtn: string;
    exportPdfBtn: string;
    newPlanBtn: string;
    createPlanBtn: string;
    inputHeroTitle: string;
    inputHeroDesc: string;
  };
}

export const PERSONA_CONFIGS: Record<UserPersonaMode, PersonaConfig> = {
  gen_z: {
    id: 'gen_z',
    name: 'جيل Z (روقان وتركيز)',
    shortName: 'جيل Z ⚡',
    badge: 'Gen-Z Mode ⚡',
    tagline: 'تظبيط التارجت وتاسكات خفيفة ع الرايق مع الحفاظ على قيمنا وأخلاقنا',
    icon: '⚡',
    colorDot: 'bg-cyan-400',
    pillColor: 'from-cyan-500/20 to-blue-600/30 border-cyan-400/40 text-cyan-300',
    terms: {
      appSubtitle: 'مخطط المذاكرة الذكي • فترات تركيز هادئة وتاسكات مصغرة بدون تشتت',
      capsuleTitle: 'كبسولة المنهج وتظبيط التارجت',
      capsuleBadge: 'خطة التقفيل السريع ⚡',
      tasksTitle: 'تاسكات المذاكرة ع الرايق',
      tasksUnit: 'تاسك خفيف',
      focusPeriodsTitle: 'فترات تركيز هادئة (Focus Zone)',
      focusSessionName: 'جلسة روقان وتركيز',
      breakName: 'فاصل ريست واسترجاع طاقة',
      proTipTitle: 'نصيحة فورمة المذاكرة (Pro Tip)',
      defaultProTip: 'استعن بالله وبلاش تسويف، قسّم وقتك لخطوات صغيرة وهتسد في المنهج وتجيب أعلى سكور بإذن الله!',
      timelineTitle: 'جدول توزيع التاسكات اليومية',
      dayPrefix: 'اليوم',
      activeRecallTitle: 'تحدي الاسترجاع الذكي (Active Recall)',
      activeRecallBadge: 'اختبر فهمك ع الرايق',
      deepReadingLabel: 'قراءة وفهم عميق (Deep Dive)',
      problemSolvingLabel: 'تطبيق وحل مسائل (شغل عالي)',
      memorizationLabel: 'تثبيت وحفظ سريع (ثبّت المعلومة)',
      completionCongrats: 'عاش يا بطل! قفلت التارجت بإتقان وتوفيق من ربنا 🎯',
      soundTitle: 'أجواء روقان وعزل المشتتات',
      soundSubtitle: 'ترددات صوتية لمساعدتك على الاستغراق في المذاكرة وقراءة المذكرات',
      startTaskBtn: 'ابدأ التركيز (Focus)',
      deepDiveBtn: 'كبسولة الفهم والتحدي',
      exportPdfBtn: 'تصدير كبسولة PDF',
      newPlanBtn: 'تارجت جديد',
      createPlanBtn: 'تفكيك وتظبيط كبسولة المنهج ✨',
      inputHeroTitle: 'ظبّط كبسولة المنهج ع الرايق',
      inputHeroDesc: 'حط نص المذكرة أو ارفع ملفك، والذكاء الاصطناعي هيقسمه لتاسكات صغيرة وفترات تركيز بدون ضغط عصبي',
    },
  },
  gen_alpha: {
    id: 'gen_alpha',
    name: 'جيل ألفا (الأبطال والمراحل)',
    shortName: 'جيل ألفا 🚀',
    badge: 'Alpha Hero 🚀',
    tagline: 'مغامرة المذاكرة وتحدي المراحل وشحن طاقة التركيز الخارقة',
    icon: '🚀',
    colorDot: 'bg-fuchsia-400',
    pillColor: 'from-fuchsia-500/20 to-purple-600/30 border-fuchsia-400/40 text-fuchsia-300',
    terms: {
      appSubtitle: 'خريطة المغامرة الدراسية • مراحل وتحديات شحن طاقة التركيز',
      capsuleTitle: 'خريطة المغامرة ومهمات التفوق',
      capsuleBadge: 'المستوى الخارق 🚀',
      tasksTitle: 'مهمات البطل اليومية (XP Tasks)',
      tasksUnit: 'مهمة أبطال',
      focusPeriodsTitle: 'مرحلة شحن طاقة التركيز (Power Focus)',
      focusSessionName: 'تحدي التركيز الخارق',
      breakName: 'شحن طاقة وراحة البطل',
      proTipTitle: 'مفتاح القوة والنجاح (Super Tip)',
      defaultProTip: 'توكل على الله يا بطل، كل مهمة تنجزها ترفع مستوى درع تفوقك وتفتح لك المستوى التالي بامتياز!',
      timelineTitle: 'خريطة مراحل الأيام والتحديات',
      dayPrefix: 'المرحلة',
      activeRecallTitle: 'كويز التحدي الخارق (اجمع النقاط)',
      activeRecallBadge: 'تحدي النقاط الذهبية 🏆',
      deepReadingLabel: 'استكشاف أسرار الدرس',
      problemSolvingLabel: 'تحدي الألغاز والمسائل الذهبية',
      memorizationLabel: 'درع الحفظ الذهبي الخارق',
      completionCongrats: 'كفوووو يا بطل! فتحت جميع المراحل ودرع التفوق بجدارة 🏆⭐',
      soundTitle: 'موسيقى حماس وطاقة البطل',
      soundSubtitle: 'أصوات تمنحك قوة التركيز وعزل المشتتات للوصول للقمة',
      startTaskBtn: 'انطلق في المهمة 🚀',
      deepDiveBtn: 'كويز التحدي الذكي',
      exportPdfBtn: 'تنزيل درع الخطة PDF',
      newPlanBtn: 'مغامرة جديدة',
      createPlanBtn: 'فتح خريطة المغامرة والمهمات 🚀',
      inputHeroTitle: 'اصنع خريطة أبطال المذاكرة',
      inputHeroDesc: 'ارفع ملف الدرس أو الصق النص، لتتحول مادتك إلى مهمات حماسية ومراحل مليئة بالطاقة والإنجاز',
    },
  },
  classic: {
    id: 'classic',
    name: 'النمط الأكاديمي (المنهجي والرصين)',
    shortName: 'أكاديمي 🎓',
    badge: 'النمط الأكاديمي 🎓',
    tagline: 'التنظيم المنهجي للدراسة وجداول التحصيل العلمي للطلاب والجامعيين',
    icon: '🎓',
    colorDot: 'bg-emerald-400',
    pillColor: 'from-emerald-500/20 to-teal-600/30 border-emerald-400/40 text-emerald-300',
    terms: {
      appSubtitle: 'المخطط المنهجي للدراسة • إدارة الوقت والتحصيل الأكاديمي',
      capsuleTitle: 'الخطة الدراسية والمنهج المعتمد',
      capsuleBadge: 'المنهج الأكاديمي المعتمد 🎓',
      tasksTitle: 'جدول المهام والتحصيل اليومي',
      tasksUnit: 'مهمة دراسية',
      focusPeriodsTitle: 'فترات التركيز والاستيعاب المنهجي',
      focusSessionName: 'جلسة استيعاب مركّزة',
      breakName: 'فترة راحة مجدولة',
      proTipTitle: 'إرشاد أكاديمي وتربوي',
      defaultProTip: 'بفضل الله والتنظيم السليم وتقسيم الوقت المنهجي، يتحقق أعلى درجات الإتقان والتميز الأكاديمي والتفوق المستمر.',
      timelineTitle: 'الجدول الزمني لتوزيع المقررات الدراسية',
      dayPrefix: 'اليوم الدراسي',
      activeRecallTitle: 'أسئلة الاسترجاع والتقييم الذاتي',
      activeRecallBadge: 'تقييم التحصيل العلمي',
      deepReadingLabel: 'القراءة والتحليل المعرفي',
      problemSolvingLabel: 'التطبيق العملي وحل التمارين',
      memorizationLabel: 'الحفظ والتثبيت المنهجي',
      completionCongrats: 'مبارك، تم إتمام جميع المهام الأكاديمية المقررة بنجاح وإتقان تام 📜',
      soundTitle: 'بيئة صوتية هادئة للدراسة',
      soundSubtitle: 'خلفيات صوتية علمية لعزل التشتت وزيادة الانتباه والاستيعاب',
      startTaskBtn: 'بدء جلسة المذاكرة',
      deepDiveBtn: 'التقييم والاسترجاع الذاتي',
      exportPdfBtn: 'تصدير الخطة بصيغة PDF',
      newPlanBtn: 'إعداد خطة جديدة',
      createPlanBtn: 'إنشاء الخطة الدراسية المنهجية 🎓',
      inputHeroTitle: 'تخطيط المنهج الدراسي المعتمد',
      inputHeroDesc: 'أدخل محتوى المقرر الدراسي أو ارفع الملف الأكاديمي لتوليد جدول زمني منظم للمذاكرة والمراجعة',
    },
  },
};

export function getPersonaConfig(mode: UserPersonaMode): PersonaConfig {
  return PERSONA_CONFIGS[mode] || PERSONA_CONFIGS.gen_z;
}

export function getPersonaCognitiveLabel(mode: UserPersonaMode, type: CognitiveType): string {
  const p = getPersonaConfig(mode);
  switch (type) {
    case 'memorization':
      return p.terms.memorizationLabel;
    case 'problem_solving':
      return p.terms.problemSolvingLabel;
    case 'deep_reading':
    default:
      return p.terms.deepReadingLabel;
  }
}
