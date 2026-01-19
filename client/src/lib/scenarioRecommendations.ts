// Scenario-linked recommendations based on H, E, U adjustments

export interface ActionItem {
  id: string;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  priority: 'high' | 'medium' | 'low';
  timeline: {
    en: string;
    ar: string;
  };
  estimatedImpact: number; // percentage improvement
  kpis: {
    name: { en: string; ar: string };
    target: string;
  }[];
  category: 'H' | 'E' | 'U';
  requiredAdjustment: number; // minimum adjustment to trigger this recommendation
}

// Health (H) Score Recommendations
export const healthRecommendations: ActionItem[] = [
  {
    id: 'h1',
    title: {
      en: 'Launch Preventive Health Programs',
      ar: 'إطلاق برامج الصحة الوقائية'
    },
    description: {
      en: 'Implement comprehensive preventive health screenings and wellness programs for all members. Include annual check-ups, vaccinations, and health risk assessments.',
      ar: 'تنفيذ فحوصات صحية وقائية شاملة وبرامج عافية لجميع الأعضاء. تشمل الفحوصات السنوية والتطعيمات وتقييمات المخاطر الصحية.'
    },
    priority: 'high',
    timeline: {
      en: '3-6 months',
      ar: '3-6 أشهر'
    },
    estimatedImpact: 15,
    kpis: [
      { name: { en: 'Screening Rate', ar: 'معدل الفحص' }, target: '80%' },
      { name: { en: 'Early Detection Rate', ar: 'معدل الكشف المبكر' }, target: '+25%' }
    ],
    category: 'H',
    requiredAdjustment: 5
  },
  {
    id: 'h2',
    title: {
      en: 'Chronic Disease Management Program',
      ar: 'برنامج إدارة الأمراض المزمنة'
    },
    description: {
      en: 'Establish dedicated care coordination for members with chronic conditions like diabetes, hypertension, and heart disease. Include regular monitoring, medication adherence support, and lifestyle coaching.',
      ar: 'إنشاء تنسيق رعاية مخصص للأعضاء المصابين بأمراض مزمنة مثل السكري وارتفاع ضغط الدم وأمراض القلب. يشمل المراقبة المنتظمة ودعم الالتزام بالأدوية والتدريب على نمط الحياة.'
    },
    priority: 'high',
    timeline: {
      en: '6-12 months',
      ar: '6-12 شهر'
    },
    estimatedImpact: 20,
    kpis: [
      { name: { en: 'Chronic Condition Control Rate', ar: 'معدل السيطرة على الأمراض المزمنة' }, target: '70%' },
      { name: { en: 'Hospital Readmission Rate', ar: 'معدل إعادة الدخول للمستشفى' }, target: '-30%' }
    ],
    category: 'H',
    requiredAdjustment: 10
  },
  {
    id: 'h3',
    title: {
      en: 'Mental Health Support Initiative',
      ar: 'مبادرة دعم الصحة النفسية'
    },
    description: {
      en: 'Introduce mental health services including counseling, stress management workshops, and employee assistance programs. Partner with mental health providers for comprehensive coverage.',
      ar: 'تقديم خدمات الصحة النفسية بما في ذلك الاستشارات وورش إدارة الضغوط وبرامج مساعدة الموظفين. الشراكة مع مقدمي خدمات الصحة النفسية للتغطية الشاملة.'
    },
    priority: 'medium',
    timeline: {
      en: '3-6 months',
      ar: '3-6 أشهر'
    },
    estimatedImpact: 10,
    kpis: [
      { name: { en: 'Mental Health Utilization', ar: 'استخدام خدمات الصحة النفسية' }, target: '+40%' },
      { name: { en: 'Employee Satisfaction', ar: 'رضا الموظفين' }, target: '+15%' }
    ],
    category: 'H',
    requiredAdjustment: 5
  },
  {
    id: 'h4',
    title: {
      en: 'Nutrition and Fitness Programs',
      ar: 'برامج التغذية واللياقة البدنية'
    },
    description: {
      en: 'Offer nutrition counseling, gym membership subsidies, and corporate fitness challenges. Include weight management programs and healthy eating workshops.',
      ar: 'تقديم استشارات التغذية ودعم عضوية الصالات الرياضية وتحديات اللياقة البدنية للشركات. تشمل برامج إدارة الوزن وورش الأكل الصحي.'
    },
    priority: 'medium',
    timeline: {
      en: '2-4 months',
      ar: '2-4 أشهر'
    },
    estimatedImpact: 8,
    kpis: [
      { name: { en: 'Program Participation', ar: 'المشاركة في البرنامج' }, target: '50%' },
      { name: { en: 'BMI Improvement', ar: 'تحسن مؤشر كتلة الجسم' }, target: '+10%' }
    ],
    category: 'H',
    requiredAdjustment: 3
  },
  {
    id: 'h5',
    title: {
      en: 'Telemedicine Integration',
      ar: 'دمج الطب عن بعد'
    },
    description: {
      en: 'Deploy 24/7 telemedicine services for non-emergency consultations. Enable virtual doctor visits, prescription renewals, and health monitoring through mobile apps.',
      ar: 'نشر خدمات الطب عن بعد على مدار الساعة للاستشارات غير الطارئة. تمكين الزيارات الافتراضية للطبيب وتجديد الوصفات الطبية ومراقبة الصحة من خلال تطبيقات الهاتف.'
    },
    priority: 'high',
    timeline: {
      en: '1-3 months',
      ar: '1-3 أشهر'
    },
    estimatedImpact: 12,
    kpis: [
      { name: { en: 'Telemedicine Adoption', ar: 'اعتماد الطب عن بعد' }, target: '60%' },
      { name: { en: 'ER Visit Reduction', ar: 'تقليل زيارات الطوارئ' }, target: '-20%' }
    ],
    category: 'H',
    requiredAdjustment: 8
  }
];

// Experience (E) Score Recommendations
export const experienceRecommendations: ActionItem[] = [
  {
    id: 'e1',
    title: {
      en: 'Streamline Claims Processing',
      ar: 'تبسيط معالجة المطالبات'
    },
    description: {
      en: 'Implement automated claims processing with AI-powered document verification. Reduce processing time from days to hours with real-time status updates.',
      ar: 'تنفيذ معالجة المطالبات الآلية مع التحقق من المستندات بالذكاء الاصطناعي. تقليل وقت المعالجة من أيام إلى ساعات مع تحديثات الحالة في الوقت الفعلي.'
    },
    priority: 'high',
    timeline: {
      en: '3-6 months',
      ar: '3-6 أشهر'
    },
    estimatedImpact: 18,
    kpis: [
      { name: { en: 'Claims Processing Time', ar: 'وقت معالجة المطالبات' }, target: '<24 hours' },
      { name: { en: 'First-Time Approval Rate', ar: 'معدل الموافقة من المرة الأولى' }, target: '85%' }
    ],
    category: 'E',
    requiredAdjustment: 10
  },
  {
    id: 'e2',
    title: {
      en: 'Launch Mobile App with Self-Service',
      ar: 'إطلاق تطبيق جوال مع الخدمة الذاتية'
    },
    description: {
      en: 'Develop a comprehensive mobile app allowing members to view coverage, submit claims, find providers, and access digital ID cards. Include appointment booking and prescription tracking.',
      ar: 'تطوير تطبيق جوال شامل يتيح للأعضاء عرض التغطية وتقديم المطالبات والعثور على مقدمي الخدمات والوصول إلى بطاقات الهوية الرقمية. يشمل حجز المواعيد وتتبع الوصفات الطبية.'
    },
    priority: 'high',
    timeline: {
      en: '4-8 months',
      ar: '4-8 أشهر'
    },
    estimatedImpact: 15,
    kpis: [
      { name: { en: 'App Adoption Rate', ar: 'معدل اعتماد التطبيق' }, target: '70%' },
      { name: { en: 'Self-Service Usage', ar: 'استخدام الخدمة الذاتية' }, target: '60%' }
    ],
    category: 'E',
    requiredAdjustment: 8
  },
  {
    id: 'e3',
    title: {
      en: 'Dedicated Account Management',
      ar: 'إدارة حسابات مخصصة'
    },
    description: {
      en: 'Assign dedicated account managers for corporate clients. Provide personalized support, regular reviews, and proactive issue resolution.',
      ar: 'تعيين مديري حسابات مخصصين للعملاء من الشركات. تقديم دعم شخصي ومراجعات منتظمة وحل استباقي للمشكلات.'
    },
    priority: 'medium',
    timeline: {
      en: '1-2 months',
      ar: '1-2 شهر'
    },
    estimatedImpact: 12,
    kpis: [
      { name: { en: 'Client Satisfaction Score', ar: 'درجة رضا العميل' }, target: '90%' },
      { name: { en: 'Issue Resolution Time', ar: 'وقت حل المشكلات' }, target: '<4 hours' }
    ],
    category: 'E',
    requiredAdjustment: 5
  },
  {
    id: 'e4',
    title: {
      en: 'Expand Provider Network',
      ar: 'توسيع شبكة مقدمي الخدمات'
    },
    description: {
      en: 'Add more healthcare providers to the network, especially in underserved areas. Include specialty clinics, pharmacies, and diagnostic centers.',
      ar: 'إضافة المزيد من مقدمي الرعاية الصحية إلى الشبكة، خاصة في المناطق المحرومة. تشمل العيادات التخصصية والصيدليات ومراكز التشخيص.'
    },
    priority: 'medium',
    timeline: {
      en: '6-12 months',
      ar: '6-12 شهر'
    },
    estimatedImpact: 10,
    kpis: [
      { name: { en: 'Network Size Increase', ar: 'زيادة حجم الشبكة' }, target: '+30%' },
      { name: { en: 'Geographic Coverage', ar: 'التغطية الجغرافية' }, target: '95%' }
    ],
    category: 'E',
    requiredAdjustment: 5
  },
  {
    id: 'e5',
    title: {
      en: '24/7 Customer Support Center',
      ar: 'مركز دعم العملاء على مدار الساعة'
    },
    description: {
      en: 'Establish round-the-clock customer support with multilingual agents. Implement chatbot for common queries and escalation paths for complex issues.',
      ar: 'إنشاء دعم عملاء على مدار الساعة مع وكلاء متعددي اللغات. تنفيذ روبوت محادثة للاستفسارات الشائعة ومسارات التصعيد للمشكلات المعقدة.'
    },
    priority: 'high',
    timeline: {
      en: '2-4 months',
      ar: '2-4 أشهر'
    },
    estimatedImpact: 14,
    kpis: [
      { name: { en: 'First Call Resolution', ar: 'حل المكالمة الأولى' }, target: '80%' },
      { name: { en: 'Average Wait Time', ar: 'متوسط وقت الانتظار' }, target: '<2 min' }
    ],
    category: 'E',
    requiredAdjustment: 7
  }
];

// Utilization (U) Score Recommendations
export const utilizationRecommendations: ActionItem[] = [
  {
    id: 'u1',
    title: {
      en: 'Implement Prior Authorization Optimization',
      ar: 'تنفيذ تحسين الموافقة المسبقة'
    },
    description: {
      en: 'Deploy smart pre-authorization system to reduce unnecessary procedures while ensuring appropriate care. Use AI to identify high-value treatments and reduce waste.',
      ar: 'نشر نظام موافقة مسبقة ذكي لتقليل الإجراءات غير الضرورية مع ضمان الرعاية المناسبة. استخدام الذكاء الاصطناعي لتحديد العلاجات عالية القيمة وتقليل الهدر.'
    },
    priority: 'high',
    timeline: {
      en: '3-6 months',
      ar: '3-6 أشهر'
    },
    estimatedImpact: 20,
    kpis: [
      { name: { en: 'Unnecessary Procedures', ar: 'الإجراءات غير الضرورية' }, target: '-25%' },
      { name: { en: 'Cost per Member', ar: 'التكلفة لكل عضو' }, target: '-15%' }
    ],
    category: 'U',
    requiredAdjustment: 10
  },
  {
    id: 'u2',
    title: {
      en: 'Generic Medication Program',
      ar: 'برنامج الأدوية البديلة'
    },
    description: {
      en: 'Encourage generic medication substitution where clinically appropriate. Implement tiered formulary with incentives for cost-effective medications.',
      ar: 'تشجيع استبدال الأدوية البديلة حيثما كان ذلك مناسبًا سريريًا. تنفيذ قائمة أدوية متدرجة مع حوافز للأدوية الفعالة من حيث التكلفة.'
    },
    priority: 'high',
    timeline: {
      en: '2-4 months',
      ar: '2-4 أشهر'
    },
    estimatedImpact: 15,
    kpis: [
      { name: { en: 'Generic Fill Rate', ar: 'معدل صرف الأدوية البديلة' }, target: '85%' },
      { name: { en: 'Pharmacy Cost Savings', ar: 'توفير تكاليف الصيدلية' }, target: '20%' }
    ],
    category: 'U',
    requiredAdjustment: 8
  },
  {
    id: 'u3',
    title: {
      en: 'Care Navigation Services',
      ar: 'خدمات توجيه الرعاية'
    },
    description: {
      en: 'Provide care navigators to guide members to appropriate care settings. Redirect non-emergency cases from ER to urgent care or primary care.',
      ar: 'توفير موجهي رعاية لتوجيه الأعضاء إلى أماكن الرعاية المناسبة. إعادة توجيه الحالات غير الطارئة من الطوارئ إلى الرعاية العاجلة أو الرعاية الأولية.'
    },
    priority: 'medium',
    timeline: {
      en: '2-3 months',
      ar: '2-3 أشهر'
    },
    estimatedImpact: 12,
    kpis: [
      { name: { en: 'ER Utilization', ar: 'استخدام الطوارئ' }, target: '-30%' },
      { name: { en: 'Primary Care Visits', ar: 'زيارات الرعاية الأولية' }, target: '+20%' }
    ],
    category: 'U',
    requiredAdjustment: 5
  },
  {
    id: 'u4',
    title: {
      en: 'Fraud Detection System',
      ar: 'نظام كشف الاحتيال'
    },
    description: {
      en: 'Implement AI-powered fraud detection to identify suspicious claims patterns. Include provider audits and member education on proper claims submission.',
      ar: 'تنفيذ كشف الاحتيال بالذكاء الاصطناعي لتحديد أنماط المطالبات المشبوهة. تشمل تدقيق مقدمي الخدمات وتثقيف الأعضاء حول تقديم المطالبات الصحيح.'
    },
    priority: 'high',
    timeline: {
      en: '4-6 months',
      ar: '4-6 أشهر'
    },
    estimatedImpact: 18,
    kpis: [
      { name: { en: 'Fraud Detection Rate', ar: 'معدل كشف الاحتيال' }, target: '+50%' },
      { name: { en: 'Claims Leakage', ar: 'تسرب المطالبات' }, target: '-40%' }
    ],
    category: 'U',
    requiredAdjustment: 10
  },
  {
    id: 'u5',
    title: {
      en: 'Value-Based Provider Contracts',
      ar: 'عقود مقدمي الخدمات القائمة على القيمة'
    },
    description: {
      en: 'Transition from fee-for-service to value-based contracts with key providers. Align incentives around quality outcomes rather than volume.',
      ar: 'الانتقال من الدفع مقابل الخدمة إلى العقود القائمة على القيمة مع مقدمي الخدمات الرئيسيين. مواءمة الحوافز حول نتائج الجودة بدلاً من الحجم.'
    },
    priority: 'medium',
    timeline: {
      en: '6-12 months',
      ar: '6-12 شهر'
    },
    estimatedImpact: 15,
    kpis: [
      { name: { en: 'Value-Based Contracts', ar: 'العقود القائمة على القيمة' }, target: '40%' },
      { name: { en: 'Quality Score Improvement', ar: 'تحسن درجة الجودة' }, target: '+15%' }
    ],
    category: 'U',
    requiredAdjustment: 7
  }
];

// Function to generate recommendations based on adjustments
export function generateRecommendations(
  hAdjustment: number,
  eAdjustment: number,
  uAdjustment: number
): ActionItem[] {
  const recommendations: ActionItem[] = [];
  
  // Add Health recommendations based on H adjustment
  if (hAdjustment > 0) {
    const hRecs = healthRecommendations.filter(r => r.requiredAdjustment <= hAdjustment);
    recommendations.push(...hRecs);
  }
  
  // Add Experience recommendations based on E adjustment
  if (eAdjustment > 0) {
    const eRecs = experienceRecommendations.filter(r => r.requiredAdjustment <= eAdjustment);
    recommendations.push(...eRecs);
  }
  
  // Add Utilization recommendations based on U adjustment
  if (uAdjustment > 0) {
    const uRecs = utilizationRecommendations.filter(r => r.requiredAdjustment <= uAdjustment);
    recommendations.push(...uRecs);
  }
  
  // Sort by priority (high first) then by estimated impact
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.estimatedImpact - a.estimatedImpact;
  });
}

// Function to calculate total estimated impact
export function calculateTotalImpact(recommendations: ActionItem[]): {
  hImpact: number;
  eImpact: number;
  uImpact: number;
  totalImpact: number;
} {
  const hImpact = recommendations
    .filter(r => r.category === 'H')
    .reduce((sum, r) => sum + r.estimatedImpact, 0);
  
  const eImpact = recommendations
    .filter(r => r.category === 'E')
    .reduce((sum, r) => sum + r.estimatedImpact, 0);
  
  const uImpact = recommendations
    .filter(r => r.category === 'U')
    .reduce((sum, r) => sum + r.estimatedImpact, 0);
  
  // IVI = 0.4*H + 0.3*E + 0.3*U
  const totalImpact = 0.4 * hImpact + 0.3 * eImpact + 0.3 * uImpact;
  
  return { hImpact, eImpact, uImpact, totalImpact };
}

// Function to get implementation roadmap
export function getImplementationRoadmap(recommendations: ActionItem[], isRTL: boolean): {
  phase: string;
  timeline: string;
  actions: ActionItem[];
}[] {
  const immediate = recommendations.filter(r => 
    r.timeline.en.includes('1-2') || r.timeline.en.includes('1-3') || r.timeline.en.includes('2-3') || r.timeline.en.includes('2-4')
  );
  
  const shortTerm = recommendations.filter(r => 
    r.timeline.en.includes('3-6') || r.timeline.en.includes('4-6') || r.timeline.en.includes('4-8')
  );
  
  const longTerm = recommendations.filter(r => 
    r.timeline.en.includes('6-12')
  );
  
  return [
    {
      phase: isRTL ? 'المرحلة 1: فوري' : 'Phase 1: Immediate',
      timeline: isRTL ? '1-4 أشهر' : '1-4 months',
      actions: immediate
    },
    {
      phase: isRTL ? 'المرحلة 2: قصير المدى' : 'Phase 2: Short-term',
      timeline: isRTL ? '3-8 أشهر' : '3-8 months',
      actions: shortTerm
    },
    {
      phase: isRTL ? 'المرحلة 3: طويل المدى' : 'Phase 3: Long-term',
      timeline: isRTL ? '6-12 شهر' : '6-12 months',
      actions: longTerm
    }
  ].filter(phase => phase.actions.length > 0);
}
