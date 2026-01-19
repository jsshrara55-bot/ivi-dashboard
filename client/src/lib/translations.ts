// Translation system for Arabic and English support

export type Language = 'ar' | 'en';

export const translations = {
  // Common
  common: {
    dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
    clients: { ar: 'الشركات', en: 'Clients' },
    analytics: { ar: 'التحليلات', en: 'Analytics' },
    predictions: { ar: 'التنبؤات', en: 'Predictions' },
    settings: { ar: 'الإعدادات', en: 'Settings' },
    evaluation: { ar: 'التقييم', en: 'Evaluation' },
    smartPreAuth: { ar: 'مدقق الأهلية الذكي', en: 'Smart Pre-Auth' },
    dataExplorer: { ar: 'مستكشف البيانات', en: 'Data Explorer' },
    adminPanel: { ar: 'لوحة الإدارة', en: 'Admin Panel' },
    dataLoader: { ar: 'تحميل البيانات', en: 'Data Loader' },
    riskAlerts: { ar: 'تنبيهات المخاطر', en: 'Risk Alerts' },
    administration: { ar: 'الإدارة', en: 'Administration' },
    signIn: { ar: 'تسجيل الدخول', en: 'Sign in' },
    signOut: { ar: 'تسجيل الخروج', en: 'Sign out' },
    loading: { ar: 'جاري التحميل...', en: 'Loading...' },
    error: { ar: 'خطأ', en: 'Error' },
    save: { ar: 'حفظ', en: 'Save' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    export: { ar: 'تصدير', en: 'Export' },
    pdf: { ar: 'PDF', en: 'PDF' },
    excel: { ar: 'Excel', en: 'Excel' },
    filters: { ar: 'الفلاتر', en: 'Filters' },
    clearFilters: { ar: 'مسح الفلاتر', en: 'Clear Filters' },
    region: { ar: 'المنطقة', en: 'Region' },
    sector: { ar: 'أخرى', en: 'Others' },
    allRegions: { ar: 'جميع المناطق', en: 'All Regions' },
    allSectors: { ar: 'جميع الفئات', en: 'All Categories' },
    riskCategory: { ar: 'فئة المخاطر', en: 'Risk Category' },
    allRiskLevels: { ar: 'جميع مستويات المخاطر', en: 'All Risk Levels' },
    low: { ar: 'منخفض', en: 'Low' },
    medium: { ar: 'متوسط', en: 'Medium' },
    high: { ar: 'مرتفع', en: 'High' },
    language: { ar: 'اللغة', en: 'Language' },
    arabic: { ar: 'العربية', en: 'Arabic' },
    english: { ar: 'الإنجليزية', en: 'English' },
  },

  // Dashboard
  dashboard: {
    title: { ar: 'النظرة التنفيذية', en: 'Executive Overview' },
    subtitle: { ar: 'تحليل شامل لصحة محفظة العملاء والتجربة وكفاءة الاستخدام', en: 'Comprehensive analysis of client portfolio health, experience, and utilization efficiency' },
    totalCompanies: { ar: 'إجمالي الشركات', en: 'Total Companies' },
    activeClients: { ar: 'عملاء نشطين', en: 'Active corporate clients' },
    averageIVI: { ar: 'متوسط IVI', en: 'Average IVI Score' },
    highRiskClients: { ar: 'عملاء عالي المخاطر', en: 'High Risk Clients' },
    ofPortfolio: { ar: 'من المحفظة', en: 'of portfolio' },
    projectedImprovement: { ar: 'التحسن المتوقع', en: 'Projected Improvement' },
    next12Months: { ar: 'خلال 12 شهر', en: 'Next 12 months' },
    totalClaims: { ar: 'إجمالي المطالبات', en: 'Total Claims' },
    approvedAmount: { ar: 'المبلغ المعتمد', en: 'Approved Amount' },
    callCenter: { ar: 'مركز الاتصال', en: 'Call Center' },
    authorizations: { ar: 'التفويضات', en: 'Authorizations' },
    overview: { ar: 'نظرة عامة', en: 'Overview' },
    detailedAnalytics: { ar: 'تحليلات مفصلة', en: 'Detailed Analytics' },
    futurePredictions: { ar: 'التنبؤات المستقبلية', en: 'Future Predictions' },
    recommendations: { ar: 'التوصيات', en: 'Recommendations' },
    iviScoreDistribution: { ar: 'توزيع نقاط IVI', en: 'IVI Score Distribution' },
    riskDistribution: { ar: 'توزيع المخاطر', en: 'Risk Distribution' },
    componentScores: { ar: 'نقاط المكونات', en: 'Component Scores' },
    topRiskDrivers: { ar: 'أهم محركات المخاطر', en: 'Top Risk Drivers' },
    healthScore: { ar: 'النتائج الصحية', en: 'Health Outcomes' },
    experienceScore: { ar: 'جودة التجربة', en: 'Experience Quality' },
    utilizationScore: { ar: 'كفاءة الاستخدام', en: 'Utilization Efficiency' },
  },

  // Predictions
  predictions: {
    title: { ar: 'التحليلات التنبؤية', en: 'Predictive Analytics' },
    subtitle: { ar: 'توقعات مبنية على البيانات لاتجاهات IVI المستقبلية وتقييم المخاطر', en: 'Data-driven forecasts for future IVI trends and risk assessment' },
    timePeriod: { ar: 'الفترة الزمنية', en: 'Time Period' },
    next3Months: { ar: '3 أشهر القادمة', en: 'Next 3 Months' },
    next6Months: { ar: '6 أشهر القادمة', en: 'Next 6 Months' },
    next12Months: { ar: '12 شهر القادمة', en: 'Next 12 Months' },
    predictedIVI: { ar: 'IVI المتوقع', en: 'Predicted IVI' },
    currentIVI: { ar: 'IVI الحالي', en: 'Current IVI' },
    expectedChange: { ar: 'التغيير المتوقع', en: 'Expected Change' },
    confidenceLevel: { ar: 'مستوى الثقة', en: 'Confidence Level' },
    riskTransitions: { ar: 'تحولات المخاطر', en: 'Risk Transitions' },
    expectedToImprove: { ar: 'متوقع التحسن', en: 'Expected to Improve' },
    expectedToDecline: { ar: 'متوقع التراجع', en: 'Expected to Decline' },
    stableRisk: { ar: 'مخاطر مستقرة', en: 'Stable Risk' },
    trendForecast: { ar: 'توقعات الاتجاه', en: 'Trend Forecast' },
    monthlyPrediction: { ar: 'التنبؤ الشهري', en: 'Monthly Prediction' },
    keyInsights: { ar: 'رؤى رئيسية', en: 'Key Insights' },
    modelAccuracy: { ar: 'دقة النموذج', en: 'Model Accuracy' },
    dataPoints: { ar: 'نقاط البيانات', en: 'Data Points' },
    lastUpdated: { ar: 'آخر تحديث', en: 'Last Updated' },
    predictionDetails: { ar: 'تفاصيل التنبؤ', en: 'Prediction Details' },
    company: { ar: 'الشركة', en: 'Company' },
    currentScore: { ar: 'النقاط الحالية', en: 'Current Score' },
    predictedScore: { ar: 'النقاط المتوقعة', en: 'Predicted Score' },
    change: { ar: 'التغيير', en: 'Change' },
    trend: { ar: 'الاتجاه', en: 'Trend' },
    improving: { ar: 'تحسن', en: 'Improving' },
    declining: { ar: 'تراجع', en: 'Declining' },
    stable: { ar: 'مستقر', en: 'Stable' },
    predictionSummary: { ar: 'ملخص التنبؤات', en: 'Prediction Summary' },
    averagePredictedChange: { ar: 'متوسط التغيير المتوقع', en: 'Average Predicted Change' },
    companiesImproving: { ar: 'شركات متحسنة', en: 'Companies Improving' },
    companiesDeclining: { ar: 'شركات متراجعة', en: 'Companies Declining' },
    riskCategoryChanges: { ar: 'تغييرات فئة المخاطر', en: 'Risk Category Changes' },
    movingToLow: { ar: 'الانتقال إلى منخفض', en: 'Moving to Low' },
    movingToMedium: { ar: 'الانتقال إلى متوسط', en: 'Moving to Medium' },
    movingToHigh: { ar: 'الانتقال إلى مرتفع', en: 'Moving to High' },
    iviTrendForecast: { ar: 'توقعات اتجاه IVI', en: 'IVI Trend Forecast' },
    historicalData: { ar: 'البيانات التاريخية', en: 'Historical Data' },
    forecastData: { ar: 'بيانات التوقعات', en: 'Forecast Data' },
    upperBound: { ar: 'الحد الأعلى', en: 'Upper Bound' },
    lowerBound: { ar: 'الحد الأدنى', en: 'Lower Bound' },
  },

  // Project Evaluation
  evaluation: {
    title: { ar: 'تقييم المشروع', en: 'Project Evaluation' },
    subtitle: { ar: 'تغطية شاملة لجميع معايير التقييم الـ 15 المتوافقة مع رؤية السعودية 2030', en: 'Comprehensive coverage of all 15 evaluation criteria aligned with Saudi Vision 2030' },
    overallCoverage: { ar: 'التغطية الإجمالية للمعايير', en: 'Overall Criteria Coverage' },
    allCriteriaCovered: { ar: 'جميع معايير التقييم مغطاة بالكامل', en: 'All evaluation criteria are fully covered' },
    vision2030Alignment: { ar: 'التوافق مع رؤية 2030', en: 'Vision 2030 Alignment' },
    vision2030Description: { ar: 'لوحة IVI تدعم تركيز رؤية السعودية 2030 على الرعاية الصحية الوقائية والتحول الرقمي وتجربة العملاء', en: 'IVI Dashboard supports Saudi Vision 2030\'s focus on preventive healthcare, digital transformation, and customer experience' },
    healthOutcomes: { ar: 'النتائج الصحية', en: 'Health Outcomes' },
    healthOutcomesDesc: { ar: 'هل يتحسن صحة الأعضاء؟ هل تُدار الحالات المزمنة بكفاءة؟', en: 'Are members becoming healthier? Are chronic conditions managed efficiently?' },
    experienceQuality: { ar: 'جودة التجربة', en: 'Experience Quality' },
    experienceQualityDesc: { ar: 'هل يحصل العملاء على موافقات سريعة وتواصل واضح؟', en: 'Are customers receiving fast approvals and clear communication?' },
    costSustainability: { ar: 'استدامة التكلفة', en: 'Cost Sustainability' },
    costSustainabilityDesc: { ar: 'هل تزداد تكاليف الرعاية الصحية بمعدل معقول؟', en: 'Are healthcare costs increasing at a reasonable rate?' },
    keyBusinessQuestions: { ar: 'الأسئلة التجارية الرئيسية المجاب عليها', en: 'Key Business Questions Answered' },
    technicalStrength: { ar: 'القوة التقنية', en: 'Technical Strength' },
    businessValue: { ar: 'القيمة التجارية', en: 'Business Value' },
    innovation: { ar: 'الابتكار', en: 'Innovation' },
    visualization: { ar: 'التصور والسرد', en: 'Visualization & Storytelling' },
    covered: { ar: 'مغطى', en: 'Covered' },
    features: { ar: 'الميزات', en: 'Features' },
    location: { ar: 'الموقع', en: 'Location' },
    iviScoreCalculation: { ar: 'حساب نقاط IVI', en: 'IVI Score Calculation' },
    health: { ar: 'الصحة', en: 'Health' },
    experience: { ar: 'التجربة', en: 'Experience' },
    utilization: { ar: 'الاستخدام', en: 'Utilization' },
    lowRisk: { ar: 'مخاطر منخفضة (70-100)', en: 'Low Risk (70-100)' },
    mediumRisk: { ar: 'مخاطر متوسطة (40-69)', en: 'Medium Risk (40-69)' },
    highRisk: { ar: 'مخاطر مرتفعة (0-39)', en: 'High Risk (0-39)' },
    routineMonitoring: { ar: 'مراقبة روتينية', en: 'Routine monitoring' },
    periodicFollowUp: { ar: 'متابعة دورية', en: 'Periodic follow-up' },
    immediateIntervention: { ar: 'تدخل فوري', en: 'Immediate intervention' },
  },

  // Regions
  regions: {
    central: { ar: 'المنطقة الوسطى', en: 'Central' },
    eastern: { ar: 'المنطقة الشرقية', en: 'Eastern' },
    western: { ar: 'المنطقة الغربية', en: 'Western' },
    southern: { ar: 'المنطقة الجنوبية', en: 'Southern' },
    northern: { ar: 'المنطقة الشمالية', en: 'Northern' },
  },

  // Sectors
  sectors: {
    banking: { ar: 'البنوك', en: 'Banking' },
    energy: { ar: 'الطاقة', en: 'Energy' },
    healthcare: { ar: 'الرعاية الصحية', en: 'Healthcare' },
    technology: { ar: 'التقنية', en: 'Technology' },
    retail: { ar: 'التجزئة', en: 'Retail' },
    telecom: { ar: 'الاتصالات', en: 'Telecom' },
    manufacturing: { ar: 'التصنيع', en: 'Manufacturing' },
    transport: { ar: 'النقل', en: 'Transport' },
  },

  // PDF Report
  pdfReport: {
    title: { ar: 'تقرير IVI التفصيلي', en: 'Detailed IVI Report' },
    generatedOn: { ar: 'تم إنشاؤه في', en: 'Generated on' },
    executiveSummary: { ar: 'الملخص التنفيذي', en: 'Executive Summary' },
    portfolioOverview: { ar: 'نظرة عامة على المحفظة', en: 'Portfolio Overview' },
    riskAnalysis: { ar: 'تحليل المخاطر', en: 'Risk Analysis' },
    predictiveInsights: { ar: 'رؤى تنبؤية', en: 'Predictive Insights' },
    recommendations: { ar: 'التوصيات', en: 'Recommendations' },
    evaluationCriteria: { ar: 'معايير التقييم', en: 'Evaluation Criteria' },
    appendix: { ar: 'الملحق', en: 'Appendix' },
  },
};

// Helper function to get translation
export function t(key: string, lang: Language): string {
  const keys = key.split('.');
  let result: any = translations;
  
  for (const k of keys) {
    if (result && result[k]) {
      result = result[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  if (result && typeof result === 'object' && result[lang]) {
    return result[lang];
  }
  
  return key;
}

// Get direction based on language
export function getDirection(lang: Language): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}
