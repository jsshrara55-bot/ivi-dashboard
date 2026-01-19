import pptxgen from 'pptxgenjs';

interface SlideContent {
  title: string;
  subtitle?: string;
  bullets?: string[];
  content?: string;
  image?: string;
}

interface PresentationOptions {
  language: 'ar' | 'en';
  includePhilosophy: boolean;
  includeInnovation: boolean;
  includeExecutiveSummary: boolean;
  includeRadarBridge: boolean;
  includeRecommendations: boolean;
  companyName?: string;
}

const COLORS = {
  primary: '1a1a2e',
  secondary: '16213e',
  accent: 'e94560',
  success: '22c55e',
  warning: 'f59e0b',
  light: 'f8fafc',
  white: 'ffffff',
  text: '1e293b',
};

const translations = {
  en: {
    mainTitle: 'Intelligent Value Index (IVI)',
    subtitle: 'A Unified Scoring System for Corporate Client Value Assessment',
    philosophyTitle: 'Nordic Philosophy Integration',
    lagomTitle: 'Lagom - Just the Right Amount',
    lagomDesc: 'Efficiency is not about minimizing usage, but about smart utilization. We reward companies that use insurance wisely - more preventive care, fewer surgeries.',
    hyggeTitle: 'Hygge - Comfort & Security',
    hyggeDesc: 'Focus on psychological comfort. The Effort Score measures how easy it is for employees to get approvals. Fewer steps = higher IVI.',
    friluftslivTitle: 'Friluftsliv - Connection with Nature',
    friluftslivDesc: 'Proactive care recommendations based on outdoor activities and preventive wellness programs.',
    innovationTitle: 'Innovative Ideas',
    predictiveNudge: 'Predictive Nudge System',
    predictiveNudgeDesc: 'Early warning system that detects risk patterns before they become critical.',
    healthSustainability: 'Health Sustainability Index',
    healthSustainabilityDesc: 'Measures long-term health trajectory, not just current status.',
    whatIfSimulator: 'What-If Simulator',
    whatIfSimulatorDesc: 'Interactive tool for clients to see how improvements affect their IVI and renewal pricing.',
    fairSegmentation: 'Fair Segmentation Algorithm',
    fairSegmentationDesc: 'Classify companies by improvement potential: The Steady, The Improvers, The Critical.',
    executiveSummaryTitle: 'Executive Summary',
    executiveSummaryQuote: '"Our vision for IVI goes beyond a mathematical formula; we have drawn inspiration from the Nordic model of \'data-driven trust\'. Our goal is not just to predict who will leave Bupa, but to build a system that makes clients \'want\' to stay because Bupa has become a partner in growing their employees\' health, not just a bill-paying company."',
    radarBridgeTitle: 'IVI Visualization',
    radarDesc: 'The IVI Radar shows the balance between Health (H), Experience (E), and Utilization (U). An ideal company covers the entire radar.',
    bridgeDesc: 'The Bridge connects Traditional Insurance (bills, claims, loss) to the Longevity Model (prevention, sustainability, quality of life). IVI is the bridge.',
    recommendationsTitle: 'Strategic Recommendations',
    visionAlignment: 'Vision 2030 Alignment',
    visionDesc: 'IVI aligns with Saudi Vision 2030 focus on preventive healthcare, digital transformation, and customer experience excellence.',
    threePillars: 'Three Pillars of Assessment',
    pillar1: 'Health Outcomes - Are members becoming healthier?',
    pillar2: 'Experience Quality - Fast approvals, smooth reimbursement?',
    pillar3: 'Cost Sustainability - Reasonable cost increases?',
    thankYou: 'Thank You',
    contactInfo: 'For more information, contact the IVI Team',
  },
  ar: {
    mainTitle: 'مؤشر القيمة الذكي (IVI)',
    subtitle: 'نظام تقييم موحد لقياس قيمة العملاء من الشركات',
    philosophyTitle: 'دمج الفلسفة الاسكندنافية',
    lagomTitle: 'لاجوم - القدر الكافي والمناسب',
    lagomDesc: 'الكفاءة ليست في تقليل الاستخدام، بل في الاستخدام الذكي. نكافئ الشركات التي تستخدم التأمين بحكمة - رعاية وقائية أكثر، عمليات جراحية أقل.',
    hyggeTitle: 'هيجي - الراحة والأمان',
    hyggeDesc: 'التركيز على الراحة النفسية. مؤشر الجهد يقيس سهولة حصول الموظفين على الموافقات. خطوات أقل = IVI أعلى.',
    friluftslivTitle: 'فريلوفتسليف - الارتباط بالطبيعة',
    friluftslivDesc: 'توصيات رعاية استباقية مبنية على الأنشطة الخارجية وبرامج العافية الوقائية.',
    innovationTitle: 'الأفكار المبتكرة',
    predictiveNudge: 'نظام الإنذار المبكر',
    predictiveNudgeDesc: 'نظام إنذار مبكر يكتشف أنماط المخاطر قبل أن تصبح حرجة.',
    healthSustainability: 'مؤشر الاستدامة الصحية',
    healthSustainabilityDesc: 'يقيس المسار الصحي طويل المدى، وليس الحالة الحالية فقط.',
    whatIfSimulator: 'محاكي "ماذا لو؟"',
    whatIfSimulatorDesc: 'أداة تفاعلية للعملاء لرؤية كيف تؤثر التحسينات على IVI وسعر التجديد.',
    fairSegmentation: 'خوارزمية التجزئة العادلة',
    fairSegmentationDesc: 'تصنيف الشركات حسب إمكانية التحسن: المستقرون، القابلون للتطوير، تحت المجهر.',
    executiveSummaryTitle: 'الملخص التنفيذي',
    executiveSummaryQuote: '"رؤيتنا لمؤشر IVI تتجاوز كونه معادلة رياضية؛ لقد استلهمنا من النموذج النوردي مفهوم \'الثقة المبنية على البيانات\'. هدفنا ليس فقط التنبؤ بمن سيغادر بوبا، بل بناء نظام يجعل العميل \'يرغب\' في البقاء لأن بوبا أصبحت شريكاً في نمو صحة موظفيه وليست مجرد شركة دفع فواتير."',
    radarBridgeTitle: 'تصور IVI البصري',
    radarDesc: 'رادار IVI يظهر التوازن بين الصحة (H)، التجربة (E)، والاستخدام (U). الشركة المثالية تغطي كامل الرادار.',
    bridgeDesc: 'الجسر يربط التأمين التقليدي (فواتير، مطالبات، خسارة) بنموذج طول العمر (وقاية، استدامة، جودة حياة). IVI هو الجسر.',
    recommendationsTitle: 'التوصيات الاستراتيجية',
    visionAlignment: 'التوافق مع رؤية 2030',
    visionDesc: 'يتوافق IVI مع تركيز رؤية السعودية 2030 على الرعاية الصحية الوقائية والتحول الرقمي والتميز في تجربة العملاء.',
    threePillars: 'الركائز الثلاث للتقييم',
    pillar1: 'النتائج الصحية - هل يصبح الأعضاء أكثر صحة؟',
    pillar2: 'جودة التجربة - موافقات سريعة، سداد سلس؟',
    pillar3: 'استدامة التكلفة - زيادات معقولة في التكاليف؟',
    thankYou: 'شكراً لكم',
    contactInfo: 'لمزيد من المعلومات، تواصلوا مع فريق IVI',
  },
};

export function generateIVIPresentation(options: PresentationOptions): void {
  const t = translations[options.language];
  const isRTL = options.language === 'ar';
  
  const pptx = new pptxgen();
  
  // Set presentation properties
  pptx.author = 'IVI Dashboard';
  pptx.title = t.mainTitle;
  pptx.subject = 'Intelligent Value Index Presentation';
  pptx.company = 'Bupa Arabia';
  
  // Define master slide
  pptx.defineSlideMaster({
    title: 'MAIN',
    background: { color: COLORS.white },
    objects: [
      { rect: { x: 0, y: 0, w: '100%', h: 0.5, fill: { color: COLORS.primary } } },
      { rect: { x: 0, y: 5.1, w: '100%', h: 0.4, fill: { color: COLORS.secondary } } },
    ],
  });
  
  // Slide 1: Title Slide
  const slide1 = pptx.addSlide();
  slide1.background = { color: COLORS.primary };
  
  slide1.addText(t.mainTitle, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 1.2,
    fontSize: 44,
    bold: true,
    color: COLORS.white,
    align: isRTL ? 'right' : 'left',
    fontFace: isRTL ? 'Arial' : 'Arial',
  });
  
  slide1.addText(t.subtitle, {
    x: 0.5,
    y: 2.8,
    w: 9,
    h: 0.8,
    fontSize: 20,
    color: COLORS.light,
    align: isRTL ? 'right' : 'left',
  });
  
  slide1.addText('IVI = 0.4H + 0.35E + 0.25U', {
    x: 0.5,
    y: 4,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: COLORS.accent,
    align: 'center',
  });
  
  if (options.companyName) {
    slide1.addText(options.companyName, {
      x: 0.5,
      y: 4.8,
      w: 9,
      h: 0.5,
      fontSize: 16,
      color: COLORS.light,
      align: 'center',
    });
  }
  
  // Slide 2: Vision 2030 Alignment
  const slide2 = pptx.addSlide({ masterName: 'MAIN' });
  
  slide2.addText(t.visionAlignment, {
    x: 0.5,
    y: 0.7,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: COLORS.primary,
    align: isRTL ? 'right' : 'left',
  });
  
  slide2.addText(t.visionDesc, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 0.8,
    fontSize: 16,
    color: COLORS.text,
    align: isRTL ? 'right' : 'left',
  });
  
  slide2.addText(t.threePillars, {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 0.5,
    fontSize: 20,
    bold: true,
    color: COLORS.secondary,
    align: isRTL ? 'right' : 'left',
  });
  
  const pillars = [
    { text: t.pillar1, color: COLORS.success },
    { text: t.pillar2, color: COLORS.accent },
    { text: t.pillar3, color: COLORS.warning },
  ];
  
  pillars.forEach((pillar, index) => {
    slide2.addShape(pptx.ShapeType.roundRect, {
      x: 0.5,
      y: 3.2 + index * 0.7,
      w: 9,
      h: 0.55,
      fill: { color: pillar.color, transparency: 90 },
      line: { color: pillar.color, width: 2 },
    });
    
    slide2.addText(pillar.text, {
      x: 0.7,
      y: 3.25 + index * 0.7,
      w: 8.6,
      h: 0.45,
      fontSize: 14,
      color: COLORS.text,
      align: isRTL ? 'right' : 'left',
      valign: 'middle',
    });
  });
  
  // Slide 3: Nordic Philosophy (if included)
  if (options.includePhilosophy) {
    const slide3 = pptx.addSlide({ masterName: 'MAIN' });
    
    slide3.addText(t.philosophyTitle, {
      x: 0.5,
      y: 0.7,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: COLORS.primary,
      align: isRTL ? 'right' : 'left',
    });
    
    const philosophies = [
      { title: t.lagomTitle, desc: t.lagomDesc, emoji: '⚖️' },
      { title: t.hyggeTitle, desc: t.hyggeDesc, emoji: '🏠' },
      { title: t.friluftslivTitle, desc: t.friluftslivDesc, emoji: '🌲' },
    ];
    
    philosophies.forEach((phil, index) => {
      slide3.addText(`${phil.emoji} ${phil.title}`, {
        x: 0.5,
        y: 1.5 + index * 1.2,
        w: 9,
        h: 0.4,
        fontSize: 18,
        bold: true,
        color: COLORS.secondary,
        align: isRTL ? 'right' : 'left',
      });
      
      slide3.addText(phil.desc, {
        x: 0.5,
        y: 1.95 + index * 1.2,
        w: 9,
        h: 0.7,
        fontSize: 12,
        color: COLORS.text,
        align: isRTL ? 'right' : 'left',
      });
    });
  }
  
  // Slide 4: Innovation Ideas (if included)
  if (options.includeInnovation) {
    const slide4 = pptx.addSlide({ masterName: 'MAIN' });
    
    slide4.addText(t.innovationTitle, {
      x: 0.5,
      y: 0.7,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: COLORS.primary,
      align: isRTL ? 'right' : 'left',
    });
    
    const innovations = [
      { title: t.predictiveNudge, desc: t.predictiveNudgeDesc, icon: '🔔' },
      { title: t.healthSustainability, desc: t.healthSustainabilityDesc, icon: '📈' },
      { title: t.whatIfSimulator, desc: t.whatIfSimulatorDesc, icon: '🎮' },
      { title: t.fairSegmentation, desc: t.fairSegmentationDesc, icon: '📊' },
    ];
    
    innovations.forEach((inn, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      
      slide4.addShape(pptx.ShapeType.roundRect, {
        x: 0.5 + col * 4.75,
        y: 1.5 + row * 1.7,
        w: 4.5,
        h: 1.5,
        fill: { color: COLORS.light },
        line: { color: COLORS.secondary, width: 1 },
      });
      
      slide4.addText(`${inn.icon} ${inn.title}`, {
        x: 0.7 + col * 4.75,
        y: 1.6 + row * 1.7,
        w: 4.1,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: COLORS.secondary,
        align: isRTL ? 'right' : 'left',
      });
      
      slide4.addText(inn.desc, {
        x: 0.7 + col * 4.75,
        y: 2.05 + row * 1.7,
        w: 4.1,
        h: 0.85,
        fontSize: 10,
        color: COLORS.text,
        align: isRTL ? 'right' : 'left',
      });
    });
  }
  
  // Slide 5: Executive Summary (if included)
  if (options.includeExecutiveSummary) {
    const slide5 = pptx.addSlide({ masterName: 'MAIN' });
    
    slide5.addText(t.executiveSummaryTitle, {
      x: 0.5,
      y: 0.7,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: COLORS.primary,
      align: isRTL ? 'right' : 'left',
    });
    
    slide5.addShape(pptx.ShapeType.roundRect, {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 3,
      fill: { color: COLORS.secondary, transparency: 95 },
      line: { color: COLORS.secondary, width: 2 },
    });
    
    slide5.addText('"', {
      x: 0.7,
      y: 1.6,
      w: 0.5,
      h: 0.5,
      fontSize: 48,
      color: COLORS.accent,
      align: 'left',
    });
    
    slide5.addText(t.executiveSummaryQuote, {
      x: 1,
      y: 2,
      w: 8,
      h: 2.2,
      fontSize: 14,
      italic: true,
      color: COLORS.text,
      align: isRTL ? 'right' : 'left',
      valign: 'middle',
    });
  }
  
  // Slide 6: Radar & Bridge Description (if included)
  if (options.includeRadarBridge) {
    const slide6 = pptx.addSlide({ masterName: 'MAIN' });
    
    slide6.addText(t.radarBridgeTitle, {
      x: 0.5,
      y: 0.7,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: COLORS.primary,
      align: isRTL ? 'right' : 'left',
    });
    
    // Radar description box
    slide6.addShape(pptx.ShapeType.roundRect, {
      x: 0.5,
      y: 1.5,
      w: 4.25,
      h: 2.5,
      fill: { color: COLORS.success, transparency: 90 },
      line: { color: COLORS.success, width: 2 },
    });
    
    slide6.addText('🎯 IVI Radar', {
      x: 0.7,
      y: 1.6,
      w: 3.85,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: COLORS.success,
      align: 'center',
    });
    
    slide6.addText(t.radarDesc, {
      x: 0.7,
      y: 2.1,
      w: 3.85,
      h: 1.7,
      fontSize: 12,
      color: COLORS.text,
      align: isRTL ? 'right' : 'left',
    });
    
    // Bridge description box
    slide6.addShape(pptx.ShapeType.roundRect, {
      x: 5.25,
      y: 1.5,
      w: 4.25,
      h: 2.5,
      fill: { color: COLORS.accent, transparency: 90 },
      line: { color: COLORS.accent, width: 2 },
    });
    
    slide6.addText('🌉 ' + (isRTL ? 'جسر التحول' : 'Transformation Bridge'), {
      x: 5.45,
      y: 1.6,
      w: 3.85,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: COLORS.accent,
      align: 'center',
    });
    
    slide6.addText(t.bridgeDesc, {
      x: 5.45,
      y: 2.1,
      w: 3.85,
      h: 1.7,
      fontSize: 12,
      color: COLORS.text,
      align: isRTL ? 'right' : 'left',
    });
    
    // Bridge diagram simplified
    slide6.addShape(pptx.ShapeType.rect, {
      x: 1,
      y: 4.2,
      w: 2,
      h: 0.6,
      fill: { color: COLORS.warning },
    });
    slide6.addText(isRTL ? 'تقليدي' : 'Traditional', {
      x: 1,
      y: 4.2,
      w: 2,
      h: 0.6,
      fontSize: 10,
      color: COLORS.white,
      align: 'center',
      valign: 'middle',
    });
    
    slide6.addShape(pptx.ShapeType.rect, {
      x: 4,
      y: 4.2,
      w: 2,
      h: 0.6,
      fill: { color: COLORS.accent },
    });
    slide6.addText('IVI', {
      x: 4,
      y: 4.2,
      w: 2,
      h: 0.6,
      fontSize: 12,
      bold: true,
      color: COLORS.white,
      align: 'center',
      valign: 'middle',
    });
    
    slide6.addShape(pptx.ShapeType.rect, {
      x: 7,
      y: 4.2,
      w: 2,
      h: 0.6,
      fill: { color: COLORS.success },
    });
    slide6.addText(isRTL ? 'طول العمر' : 'Longevity', {
      x: 7,
      y: 4.2,
      w: 2,
      h: 0.6,
      fontSize: 10,
      color: COLORS.white,
      align: 'center',
      valign: 'middle',
    });
    
    // Arrows
    slide6.addText('→', {
      x: 3.1,
      y: 4.2,
      w: 0.8,
      h: 0.6,
      fontSize: 24,
      color: COLORS.text,
      align: 'center',
      valign: 'middle',
    });
    slide6.addText('→', {
      x: 6.1,
      y: 4.2,
      w: 0.8,
      h: 0.6,
      fontSize: 24,
      color: COLORS.text,
      align: 'center',
      valign: 'middle',
    });
  }
  
  // Final Slide: Thank You
  const slideFinal = pptx.addSlide();
  slideFinal.background = { color: COLORS.primary };
  
  slideFinal.addText(t.thankYou, {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1,
    fontSize: 48,
    bold: true,
    color: COLORS.white,
    align: 'center',
  });
  
  slideFinal.addText(t.contactInfo, {
    x: 0.5,
    y: 3.5,
    w: 9,
    h: 0.5,
    fontSize: 18,
    color: COLORS.light,
    align: 'center',
  });
  
  slideFinal.addText('IVI Dashboard © 2025', {
    x: 0.5,
    y: 4.5,
    w: 9,
    h: 0.4,
    fontSize: 12,
    color: COLORS.light,
    align: 'center',
  });
  
  // Generate and download
  const filename = `IVI_Presentation_${options.language.toUpperCase()}_${new Date().toISOString().split('T')[0]}`;
  pptx.writeFile({ fileName: filename });
}

export default generateIVIPresentation;
