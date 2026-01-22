import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Target, 
  Lightbulb, 
  Heart, 
  TrendingUp, 
  Shield,
  Award,
  Globe
} from "lucide-react";

const teamMembers = [
  { name: "Ghada", nameAr: "غادة", role: "Project Lead", roleAr: "قائدة المشروع" },
  { name: "Shahad", nameAr: "شهد", role: "Data Analyst", roleAr: "محللة بيانات" },
  { name: "Afnan", nameAr: "أفنان", role: "Developer", roleAr: "مطورة" },
  { name: "Yamama", nameAr: "يمامه", role: "UX Designer", roleAr: "مصممة تجربة المستخدم" },
  { name: "Razan", nameAr: "رزان", role: "Business Analyst", roleAr: "محللة أعمال" },
];

const projectFeatures = [
  {
    icon: TrendingUp,
    title: "IVI Score Algorithm",
    titleAr: "خوارزمية IVI",
    description: "Combines Health (H), Experience (E), and Utilization (U) into a single actionable score",
    descriptionAr: "تجمع بين الصحة (H) والتجربة (E) والاستخدام (U) في درجة واحدة قابلة للتنفيذ"
  },
  {
    icon: Target,
    title: "Predictive Analytics",
    titleAr: "التحليلات التنبؤية",
    description: "Forecast client retention and risk changes for the next 3 years",
    descriptionAr: "التنبؤ باحتفاظ العملاء وتغييرات المخاطر للسنوات الثلاث القادمة"
  },
  {
    icon: Users,
    title: "Client Segmentation",
    titleAr: "تجزئة العملاء",
    description: "Classify corporate clients into High, Medium, and Low risk categories",
    descriptionAr: "تصنيف الشركات العميلة إلى فئات مخاطر عالية ومتوسطة ومنخفضة"
  },
  {
    icon: Lightbulb,
    title: "Business Recommendations",
    titleAr: "توصيات الأعمال",
    description: "Actionable insights to improve health outcomes and reduce churn",
    descriptionAr: "رؤى قابلة للتنفيذ لتحسين النتائج الصحية وتقليل المغادرة"
  }
];

const scandinavianPhilosophy = [
  {
    name: "Lagom",
    nameAr: "لاغوم",
    meaning: "Balance & Value-Based Healthcare",
    meaningAr: "التوازن والرعاية القائمة على القيمة",
    standard: "VBHC",
    description: "Optimal resource utilization through digital clinics, reducing unnecessary visits and duplicate tests",
    descriptionAr: "الاستخدام الأمثل للموارد عبر العيادات الرقمية، مما يقلل من الزيارات غير الضرورية والفحوصات المكررة"
  },
  {
    name: "Hygge",
    nameAr: "هيغا",
    meaning: "Wellbeing & Patient Experience",
    meaningAr: "الرفاهية وتجربة المريض",
    standard: "Patient Experience",
    description: "Seamless healthcare journey with easy access and personalized care through digital platforms",
    descriptionAr: "رحلة رعاية صحية سلسة مع سهولة الوصول والرعاية الشخصية عبر المنصات الرقمية"
  },
  {
    name: "Friluftsliv",
    nameAr: "فريلوفتسليف",
    meaning: "Prevention & Population Health",
    meaningAr: "الوقاية وصحة السكان",
    standard: "PHM",
    description: "Proactive wellness programs and chronic disease management through continuous monitoring",
    descriptionAr: "برامج العافية الاستباقية وإدارة الأمراض المزمنة من خلال المراقبة المستمرة"
  }
];

export default function About() {
  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="/bupa-logo.png" 
              alt="Bupa Arabia" 
              className="h-16 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Intelligent Value Index (IVI)
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            مؤشر القيمة الذكي - نظام متكامل لتحليل وتحسين صحة محفظة العملاء
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            A comprehensive system for analyzing and improving corporate client portfolio health
          </p>
        </div>

        {/* Mission */}
        <Card className="border-[#0079C8]/20 bg-gradient-to-r from-[#0079C8]/5 to-[#008385]/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0079C8]">
              <Target className="h-6 w-6" />
              Our Mission | مهمتنا
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              Transform Bupa Arabia's approach to corporate client management by providing a data-driven, 
              predictive system that combines health outcomes, customer experience, and utilization efficiency 
              into a single, actionable intelligence platform.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed" dir="rtl">
              تحويل نهج بوبا العربية في إدارة العملاء من الشركات من خلال توفير نظام تنبؤي قائم على البيانات 
              يجمع بين النتائج الصحية وتجربة العملاء وكفاءة الاستخدام في منصة استخباراتية واحدة قابلة للتنفيذ.
            </p>
          </CardContent>
        </Card>

        {/* Key Features */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Key Features | الميزات الرئيسية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#0079C8]/10">
                      <feature.icon className="h-6 w-6 text-[#0079C8]" />
                    </div>
                    <div>
                      <div className="text-lg">{feature.title}</div>
                      <div className="text-sm font-normal text-gray-500" dir="rtl">{feature.titleAr}</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  <p className="text-gray-500 dark:text-gray-500 mt-2 text-sm" dir="rtl">{feature.descriptionAr}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* IVI Formula */}
        <Card className="border-[#008385]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#008385]">
              <Award className="h-6 w-6" />
              IVI Score Formula | صيغة درجة IVI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-mono font-bold text-[#0079C8] mb-4">
                IVI = (H × 40%) + (E × 30%) + (U × 30%)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-red-500">H</div>
                  <div className="font-medium">Health Outcomes</div>
                  <div className="text-sm text-gray-500">النتائج الصحية</div>
                  <Badge className="mt-2 bg-red-100 text-red-700">40%</Badge>
                </div>
                <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-blue-500">E</div>
                  <div className="font-medium">Experience Quality</div>
                  <div className="text-sm text-gray-500">جودة التجربة</div>
                  <Badge className="mt-2 bg-blue-100 text-blue-700">30%</Badge>
                </div>
                <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-500">U</div>
                  <div className="font-medium">Utilization Efficiency</div>
                  <div className="text-sm text-gray-500">كفاءة الاستخدام</div>
                  <Badge className="mt-2 bg-green-100 text-green-700">30%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scandinavian Philosophy */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Scandinavian Philosophy | الفلسفة الاسكندنافية
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
            Aligned with CCHI Standards | متوافقة مع معايير مجلس الضمان الصحي
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scandinavianPhilosophy.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-t-4 border-t-[#6ECEB2]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{item.name}</CardTitle>
                    <Badge variant="outline" className="text-[#008385] border-[#008385]">
                      {item.standard}
                    </Badge>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400" dir="rtl">{item.nameAr}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium text-[#0079C8]">{item.meaning}</p>
                    <p className="text-sm text-gray-500" dir="rtl">{item.meaningAr}</p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm" dir="rtl">{item.descriptionAr}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Project Team | فريق المشروع
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#0079C8] to-[#008385] flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400" dir="rtl">{member.nameAr}</p>
                  <Badge className="mt-2 bg-[#0079C8]/10 text-[#0079C8]" variant="secondary">
                    {member.role}
                  </Badge>
                  <p className="text-xs text-gray-400 mt-1" dir="rtl">{member.roleAr}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <Card className="bg-gradient-to-r from-[#0079C8] to-[#008385] text-white">
          <CardContent className="py-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Globe className="h-6 w-6" />
              <Heart className="h-6 w-6" />
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Bupa Arabia - IVI Dashboard</h3>
            <p className="text-white/80">
              Transforming Healthcare Through Data Intelligence
            </p>
            <p className="text-white/60 mt-2" dir="rtl">
              تحويل الرعاية الصحية من خلال ذكاء البيانات
            </p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm text-white/60">
                © 2026 Bupa Arabia. All rights reserved.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
