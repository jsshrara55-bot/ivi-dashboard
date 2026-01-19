import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download, Sparkles, Lightbulb, Scale, Coffee, TreePine, Bell, Award, Sliders, Layers, Leaf, Printer, Eye, Presentation } from "lucide-react";
import { generateIVIPresentation } from "@/lib/pptxExport";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

export default function PresentationReport() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  
  const [selectedSections, setSelectedSections] = useState({
    executiveSummary: true,
    nordicPhilosophy: true,
    innovativeIdeas: true,
    iviOverview: true,
    categoryAnalysis: true,
    recommendations: true,
    closingQuote: true,
  });

  const toggleSection = (section: keyof typeof selectedSections) => {
    setSelectedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const sections = [
    { key: "executiveSummary", label: isRTL ? "الملخص التنفيذي" : "Executive Summary", icon: FileText },
    { key: "nordicPhilosophy", label: isRTL ? "الفلسفة الاسكندنافية" : "Nordic Philosophy", icon: Sparkles },
    { key: "innovativeIdeas", label: isRTL ? "الأفكار المبتكرة" : "Innovative Ideas", icon: Lightbulb },
    { key: "iviOverview", label: isRTL ? "نظرة عامة على IVI" : "IVI Overview", icon: Eye },
    { key: "categoryAnalysis", label: isRTL ? "تحليل الفئات" : "Category Analysis", icon: Layers },
    { key: "recommendations", label: isRTL ? "التوصيات" : "Recommendations", icon: Award },
    { key: "closingQuote", label: isRTL ? "الاقتباس الختامي" : "Closing Quote", icon: Leaf },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isRTL ? "تقرير العرض التقديمي" : "Presentation Report"}
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? "تصدير تقرير PDF مخصص للعرض أمام اللجنة" 
                : "Export customized PDF report for committee presentation"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              {isRTL ? "طباعة" : "Print"}
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Download className="h-4 w-4 mr-2" />
              {isRTL ? "تصدير PDF" : "Export PDF"}
            </Button>
            <Button onClick={() => generateIVIPresentation({
              language: language as 'ar' | 'en',
              includePhilosophy: selectedSections.nordicPhilosophy,
              includeInnovation: selectedSections.innovativeIdeas,
              includeExecutiveSummary: selectedSections.executiveSummary,
              includeRadarBridge: selectedSections.iviOverview,
              includeRecommendations: selectedSections.recommendations,
            })}>
              <Presentation className="h-4 w-4 mr-2" />
              {isRTL ? "تصدير PowerPoint" : "Export PPTX"}
            </Button>
          </div>
        </div>

        {/* Section Selector */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? "اختيار الأقسام" : "Select Sections"}</CardTitle>
            <CardDescription>
              {isRTL ? "اختر الأقسام التي تريد تضمينها في التقرير" : "Choose sections to include in the report"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sections.map(section => (
                <div key={section.key} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox 
                    id={section.key}
                    checked={selectedSections[section.key as keyof typeof selectedSections]}
                    onCheckedChange={() => toggleSection(section.key as keyof typeof selectedSections)}
                  />
                  <label htmlFor={section.key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <section.icon className="h-4 w-4 text-muted-foreground" />
                    {section.label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="text-center border-b print:border-b-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">IVI</span>
              </div>
            </div>
            <CardTitle className="text-2xl">
              {isRTL ? "مؤشر القيمة الذكي (IVI)" : "Intelligent Value Index (IVI)"}
            </CardTitle>
            <CardDescription className="text-lg">
              {isRTL ? "تقرير العرض التقديمي للجنة التحكيم" : "Committee Presentation Report"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            
            {/* Executive Summary */}
            {selectedSections.executiveSummary && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-700 border-b pb-2">
                  <FileText className="h-5 w-5" />
                  {isRTL ? "الملخص التنفيذي" : "Executive Summary"}
                </h2>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    {isRTL 
                      ? "مؤشر القيمة الذكي (IVI) هو نظام تسجيل موحد يساعد شركات التأمين على تقييم 'القيمة' الإجمالية للعميل المؤسسي، ليس فقط من حيث الاحتفاظ، ولكن أيضاً من حيث حالة صحة الأعضاء، وجودة تجربة الخدمة، وكفاءة الاستخدام. يتماشى هذا المؤشر مع رؤية 2030 مع التركيز القوي على الرعاية الصحية الوقائية، والتحول الرقمي، وتجربة العملاء."
                      : "The Intelligent Value Index (IVI) is a unified scoring system that helps insurers evaluate the overall 'value' of a corporate client, not only in terms of retention, but also in terms of member health status, service experience quality, and utilization efficiency. This index aligns with Vision 2030 with a strong focus on preventive healthcare, digital transformation, and customer experience."
                    }
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-green-600">H</div>
                      <div className="text-sm text-gray-600">{isRTL ? "النتائج الصحية" : "Health Outcomes"}</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">E</div>
                      <div className="text-sm text-gray-600">{isRTL ? "جودة التجربة" : "Experience Quality"}</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-purple-600">U</div>
                      <div className="text-sm text-gray-600">{isRTL ? "كفاءة الاستخدام" : "Utilization Efficiency"}</div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Nordic Philosophy */}
            {selectedSections.nordicPhilosophy && (
              <section className="space-y-4 page-break-before">
                <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-700 border-b pb-2">
                  <Sparkles className="h-5 w-5" />
                  {isRTL ? "الفلسفة الاسكندنافية في IVI" : "Nordic Philosophy in IVI"}
                </h2>
                <p className="text-gray-600 mb-4">
                  {isRTL 
                    ? "رؤيتنا لمؤشر IVI تتجاوز كونه معادلة رياضية؛ لقد استلهمنا من النموذج النوردي مفهوم 'الثقة المبنية على البيانات'"
                    : "Our vision for IVI goes beyond being a mathematical formula; we drew inspiration from the Nordic model's concept of 'data-driven trust'"
                  }
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-blue-700 text-lg">
                        <Scale className="h-5 w-5" />
                        Lagom
                      </CardTitle>
                      <CardDescription className="text-blue-600">
                        {isRTL ? "القدر الكافي والمناسب" : "Just the Right Amount"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {isRTL 
                          ? "في كفاءة الاستخدام (U)، نكافئ الشركة التي تستهلك التأمين 'بذكاء' - فحوصات وقائية أكثر مقابل عمليات جراحية أقل."
                          : "In Utilization (U), we reward companies that use insurance 'smartly' - more preventive checkups vs fewer surgeries."
                        }
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-amber-200 bg-amber-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-amber-700 text-lg">
                        <Coffee className="h-5 w-5" />
                        Hygge
                      </CardTitle>
                      <CardDescription className="text-amber-600">
                        {isRTL ? "الراحة النفسية والأمان" : "Comfort & Security"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {isRTL 
                          ? "في تجربة العميل (E)، نضيف 'مؤشر الجهد'. كلما قل عدد الخطوات للحصول على الموافقة، زادت درجة IVI."
                          : "In Experience (E), we add an 'Effort Score'. The fewer steps to get approval, the higher the IVI score."
                        }
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-green-700 text-lg">
                        <TreePine className="h-5 w-5" />
                        Friluftsliv
                      </CardTitle>
                      <CardDescription className="text-green-600">
                        {isRTL ? "الارتباط بالطبيعة والوقاية" : "Nature & Prevention"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {isRTL 
                          ? "في المخرجات الصحية (H)، نقدم توصيات تعتمد على 'الرعاية الاستباقية' مثل سياسات العمل المرن."
                          : "In Health (H), we provide recommendations based on 'proactive care' like flexible work policies."
                        }
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>
            )}

            {/* Innovative Ideas */}
            {selectedSections.innovativeIdeas && (
              <section className="space-y-4 page-break-before">
                <h2 className="text-xl font-bold flex items-center gap-2 text-purple-700 border-b pb-2">
                  <Lightbulb className="h-5 w-5" />
                  {isRTL ? "أفكار مبتكرة لإبهار اللجنة" : "Innovative Ideas"}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-red-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-red-700 text-lg">
                        <Bell className="h-5 w-5" />
                        {isRTL ? "نظام الإنذار المبكر" : "Predictive Nudge"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {isRTL 
                          ? "تنبيهات آلية لقسم المبيعات عندما يتنبأ النموذج بتحول شركة من 'مخاطر منخفضة' إلى 'مخاطر عالية' خلال 6 أشهر."
                          : "Automatic alerts to sales when the model predicts a company is heading from 'low risk' to 'high risk' within 6 months."
                        }
                      </p>
                      <Badge className="mt-2 bg-red-100 text-red-800">{isRTL ? "مفعل في النظام" : "Active in System"}</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-emerald-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-emerald-700 text-lg">
                        <Award className="h-5 w-5" />
                        {isRTL ? "مؤشر الاستدامة الصحية" : "Health Sustainability Index"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {isRTL 
                          ? "الشركات التي تحافظ على IVI مرتفع لمدة 3 سنوات تحصل على 'شهادة استدامة صحية' مرتبطة بـ ESG."
                          : "Companies maintaining high IVI for 3 years receive a 'Health Sustainability Certificate' linked to ESG."
                        }
                      </p>
                      <Badge className="mt-2 bg-emerald-100 text-emerald-800">{isRTL ? "مرتبط بـ ESG" : "ESG Linked"}</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-violet-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-violet-700 text-lg">
                        <Sliders className="h-5 w-5" />
                        {isRTL ? "محاكي 'ماذا لو؟'" : "What-If Simulator"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {isRTL 
                          ? "أداة تفاعلية تمكن مدير الموارد البشرية من تجربة سيناريوهات تحسين IVI وتأثيرها على سعر التجديد."
                          : "Interactive tool enabling HR managers to test IVI improvement scenarios and their impact on renewal pricing."
                        }
                      </p>
                      <Badge className="mt-2 bg-violet-100 text-violet-800">{isRTL ? "متاح في السيناريوهات" : "Available in Scenarios"}</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-orange-700 text-lg">
                        <Layers className="h-5 w-5" />
                        {isRTL ? "خوارزمية التجزئة العادلة" : "Fair Segmentation"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {isRTL 
                          ? "تصنيف الشركات بناءً على 'قابليتها للتحسن' وليس فقط حجم المطالبات."
                          : "Classifying companies based on their 'improvement potential', not just claims volume."
                        }
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge className="bg-green-100 text-green-800">{isRTL ? "المستقرون" : "The Steady"}</Badge>
                        <Badge className="bg-yellow-100 text-yellow-800">{isRTL ? "القابلون للتطوير" : "The Improvers"}</Badge>
                        <Badge className="bg-red-100 text-red-800">{isRTL ? "تحت المجهر" : "The Critical"}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            )}

            {/* IVI Overview */}
            {selectedSections.iviOverview && (
              <section className="space-y-4 page-break-before">
                <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-700 border-b pb-2">
                  <Eye className="h-5 w-5" />
                  {isRTL ? "نظرة عامة على IVI" : "IVI Overview"}
                </h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="text-center mb-6">
                    <div className="text-lg font-mono bg-white p-4 rounded-lg inline-block shadow-sm">
                      IVI = 0.5 × H + 0.3 × E + 0.2 × U
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-white rounded-lg">
                      <div className="text-3xl font-bold text-indigo-600">25</div>
                      <div className="text-sm text-gray-600">{isRTL ? "إجمالي الشركات" : "Total Companies"}</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg">
                      <div className="text-3xl font-bold text-amber-600">41.4</div>
                      <div className="text-sm text-gray-600">{isRTL ? "متوسط IVI" : "Average IVI"}</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg">
                      <div className="text-3xl font-bold text-green-600">+10.2</div>
                      <div className="text-sm text-gray-600">{isRTL ? "التحسن المتوقع" : "Expected Improvement"}</div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Category Analysis */}
            {selectedSections.categoryAnalysis && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-700 border-b pb-2">
                  <Layers className="h-5 w-5" />
                  {isRTL ? "تحليل الفئات" : "Category Analysis"}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-700">{isRTL ? "SME (الشركات الصغيرة والمتوسطة)" : "SME Companies"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>{isRTL ? "عدد الشركات:" : "Companies:"}</span><span className="font-bold">7</span></div>
                        <div className="flex justify-between"><span>{isRTL ? "متوسط IVI:" : "Avg IVI:"}</span><span className="font-bold text-blue-600">45.92</span></div>
                        <div className="flex justify-between"><span>{isRTL ? "التحسن المتوقع:" : "Expected Improvement:"}</span><span className="font-bold text-green-600">+8.5</span></div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-purple-700">{isRTL ? "Key Account (الشركات الكبيرة)" : "Key Account Companies"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>{isRTL ? "عدد الشركات:" : "Companies:"}</span><span className="font-bold">18</span></div>
                        <div className="flex justify-between"><span>{isRTL ? "متوسط IVI:" : "Avg IVI:"}</span><span className="font-bold text-purple-600">42.48</span></div>
                        <div className="flex justify-between"><span>{isRTL ? "التحسن المتوقع:" : "Expected Improvement:"}</span><span className="font-bold text-green-600">+6.2</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            )}

            {/* Recommendations */}
            {selectedSections.recommendations && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-700 border-b pb-2">
                  <Award className="h-5 w-5" />
                  {isRTL ? "التوصيات الرئيسية" : "Key Recommendations"}
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-bold text-green-700 mb-2">{isRTL ? "تحسين H" : "Improve H"}</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• {isRTL ? "برامج إدارة الأمراض المزمنة" : "Chronic disease management programs"}</li>
                      <li>• {isRTL ? "حملات الفحص الوقائي" : "Preventive screening campaigns"}</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-blue-700 mb-2">{isRTL ? "تحسين E" : "Improve E"}</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• {isRTL ? "تسريع معالجة المطالبات" : "Accelerate claims processing"}</li>
                      <li>• {isRTL ? "تحسين خدمة مركز الاتصال" : "Improve call center service"}</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-purple-700 mb-2">{isRTL ? "تحسين U" : "Improve U"}</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• {isRTL ? "تحفيز الرعاية الوقائية" : "Incentivize preventive care"}</li>
                      <li>• {isRTL ? "برامج الاستخدام الذكي" : "Smart utilization programs"}</li>
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* Closing Quote */}
            {selectedSections.closingQuote && (
              <section className="mt-8 page-break-before">
                <Card className="border-indigo-300 bg-gradient-to-r from-indigo-100 to-purple-100">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Leaf className="h-10 w-10 text-indigo-600 mx-auto mb-4" />
                      <blockquote className="text-lg font-medium text-indigo-800 italic max-w-3xl mx-auto">
                        {isRTL 
                          ? '"رؤيتنا لمؤشر IVI تتجاوز كونه معادلة رياضية؛ لقد استلهمنا من النموذج النوردي مفهوم \'الثقة المبنية على البيانات\'. هدفنا ليس فقط التنبؤ بمن سيغادر بوبا، بل بناء نظام يجعل العميل \'يرغب\' في البقاء لأن بوبا أصبحت شريكاً في نمو صحة موظفيه وليست مجرد شركة دفع فواتير."'
                          : '"Our vision for IVI goes beyond being a mathematical formula; we drew inspiration from the Nordic model\'s concept of \'data-driven trust\'. Our goal is not just to predict who will leave Bupa, but to build a system that makes clients \'want\' to stay because Bupa has become a partner in their employees\' health growth, not just a bill-paying company."'
                        }
                      </blockquote>
                      <p className="text-sm text-indigo-600 mt-4">
                        — {isRTL ? "الملخص التنفيذي للعرض" : "Executive Summary for Presentation"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

          </CardContent>
        </Card>
      </div>

      <style>{`
        @media print {
          .page-break-before {
            page-break-before: always;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
