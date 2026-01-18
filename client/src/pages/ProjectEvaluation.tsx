import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, 
  Target, 
  Lightbulb, 
  BarChart3, 
  Heart, 
  Users, 
  TrendingUp,
  Shield,
  Zap,
  Eye,
  MessageSquare,
  Database,
  Brain,
  Sparkles
} from "lucide-react";

export default function ProjectEvaluation() {
  const technicalCriteria = [
    {
      id: 1,
      title: "Data Cleaning, Validation & Feature Engineering",
      description: "Quality of data preparation and feature creation",
      status: "covered",
      features: ["Data Explorer with validation", "CSV import with error handling", "Automated data cleaning"],
      location: "Data Explorer, Data Loader"
    },
    {
      id: 2,
      title: "Clear Target Definition & Modeling Rationale",
      description: "Well-defined objectives and model justification",
      status: "covered",
      features: ["IVI Score formula (H×40% + E×30% + U×30%)", "Risk category thresholds", "Component score definitions"],
      location: "Analytics, Dashboard"
    },
    {
      id: 3,
      title: "Strong Evaluation & Model Comparison",
      description: "Robust model assessment and benchmarking",
      status: "covered",
      features: ["Prediction accuracy metrics", "Trend analysis", "Historical comparison"],
      location: "Predictions, Analytics"
    }
  ];

  const businessCriteria = [
    {
      id: 4,
      title: "Identification of Key Business Drivers",
      description: "Understanding factors that impact business outcomes",
      status: "covered",
      features: ["Top Risk Drivers section", "Component breakdown (H, E, U)", "Claims pattern analysis"],
      location: "Dashboard, Client Details"
    },
    {
      id: 5,
      title: "Insights Connected to Business Impact",
      description: "Actionable insights linked to business metrics",
      status: "covered",
      features: ["Recommendations tab", "Risk Alerts for churn prevention", "Cost impact projections"],
      location: "Dashboard, Risk Alerts"
    },
    {
      id: 6,
      title: "Practical Recommendations & Feasibility",
      description: "Implementable suggestions with clear steps",
      status: "covered",
      features: ["Action-oriented recommendations", "Priority-based suggestions", "Implementation guidance"],
      location: "Recommendations Tab"
    },
    {
      id: 7,
      title: "Value Added to Decision-Making",
      description: "Enhanced decision support capabilities",
      status: "covered",
      features: ["Smart Pre-Auth system", "Real-time Risk Alerts", "Predictive Analytics"],
      location: "Smart Pre-Auth, Predictions"
    }
  ];

  const innovationCriteria = [
    {
      id: 8,
      title: "Creativity of Approach",
      description: "Novel and creative problem-solving methods",
      status: "covered",
      features: ["Unified IVI Score combining 3 pillars", "Smart Pre-Auth AI system", "Real-time notifications"],
      location: "Entire Dashboard"
    },
    {
      id: 9,
      title: "Novel Tools/Techniques Used",
      description: "Innovative technologies and methodologies",
      status: "covered",
      features: ["Real-time WebSocket notifications", "Scheduled automated alerts", "LLM-powered recommendations"],
      location: "Risk Alerts, Smart Pre-Auth"
    },
    {
      id: 10,
      title: "Originality in Feature Engineering",
      description: "Creative feature creation and modeling",
      status: "covered",
      features: ["Custom IVI formula", "Risk transition tracking", "Multi-dimensional scoring"],
      location: "Analytics, Predictions"
    },
    {
      id: 11,
      title: "Practicality & Forward-Thinking",
      description: "Practical solutions with future vision",
      status: "covered",
      features: ["12-month predictions", "Preventive action suggestions", "Trend forecasting"],
      location: "Predictions, Recommendations"
    }
  ];

  const visualizationCriteria = [
    {
      id: 12,
      title: "Clear Narrative & Logical Flow",
      description: "Coherent storytelling and insight generation",
      status: "covered",
      features: ["Dashboard tabs flow: Overview → Analytics → Predictions → Recommendations", "Progressive disclosure", "Contextual insights"],
      location: "Dashboard Tabs"
    },
    {
      id: 13,
      title: "Strong Visuals/Slides",
      description: "Impactful visual representations",
      status: "covered",
      features: ["Interactive Recharts", "KPI cards with trends", "Risk distribution pie charts"],
      location: "All Pages"
    },
    {
      id: 14,
      title: "Simplify Technical Concepts",
      description: "Making complex data accessible",
      status: "covered",
      features: ["Color-coded risk levels (Green/Yellow/Red)", "Simple 0-100 score", "Visual progress indicators"],
      location: "Dashboard, Client Details"
    },
    {
      id: 15,
      title: "Presentation Quality",
      description: "Professional presentation and documentation",
      status: "covered",
      features: ["User guide documentation", "Pitch deck presentation", "PDF/Excel exports"],
      location: "Documentation"
    }
  ];

  const vision2030Pillars = [
    {
      title: "Health Outcomes",
      icon: Heart,
      score: "H Score",
      description: "Are members becoming healthier? Are chronic conditions managed efficiently?",
      features: [
        "Claims analysis by type",
        "Chronic condition tracking",
        "Preventable claims identification",
        "Health trend monitoring"
      ],
      color: "text-red-500"
    },
    {
      title: "Experience Quality",
      icon: Users,
      score: "E Score",
      description: "Are customers receiving fast approvals and clear communication?",
      features: [
        "Customer satisfaction scores",
        "Call resolution rates",
        "Complaint handling tracking",
        "Response time metrics"
      ],
      color: "text-blue-500"
    },
    {
      title: "Cost Sustainability",
      icon: TrendingUp,
      score: "U Score",
      description: "Are healthcare costs increasing at a reasonable rate?",
      features: [
        "Network usage percentage",
        "Pre-auth compliance",
        "Cost per member tracking",
        "Claims pattern analysis"
      ],
      color: "text-green-500"
    }
  ];

  const keyQuestions = [
    {
      question: "How healthy is this client's population today?",
      answer: "Health Score (H) and Claims Analysis",
      icon: Heart
    },
    {
      question: "How will it impact future costs?",
      answer: "Predictions page with 12-month forecasts",
      icon: TrendingUp
    },
    {
      question: "Are they receiving good health outcomes?",
      answer: "Component Scores breakdown (H, E, U)",
      icon: Target
    },
    {
      question: "Is there risk of dissatisfaction or churn?",
      answer: "Risk Alerts and Experience Score (E)",
      icon: Shield
    },
    {
      question: "What preventive actions can be taken?",
      answer: "Recommendations tab and Smart Pre-Auth",
      icon: Lightbulb
    }
  ];

  const CriteriaCard = ({ criteria, categoryColor }: { criteria: any[], categoryColor: string }) => (
    <div className="space-y-4">
      {criteria.map((item) => (
        <Card key={item.id} className="border-l-4" style={{ borderLeftColor: categoryColor }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">#{item.id}</Badge>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </div>
              <Badge className="bg-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Covered
              </Badge>
            </div>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Features:</p>
              <ul className="text-sm space-y-1">
                {item.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="font-medium">Location:</span> {item.location}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Evaluation</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive coverage of all 15 evaluation criteria aligned with Saudi Vision 2030
        </p>
      </div>

      {/* Overall Score */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Overall Criteria Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-primary">15/15</div>
            <div className="flex-1">
              <Progress value={100} className="h-3" />
              <p className="text-sm text-muted-foreground mt-1">All evaluation criteria are fully covered</p>
            </div>
            <Badge className="bg-green-500 text-lg px-4 py-2">100%</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Vision 2030 Alignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Vision 2030 Alignment
          </CardTitle>
          <CardDescription>
            IVI Dashboard supports Saudi Vision 2030's focus on preventive healthcare, digital transformation, and customer experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {vision2030Pillars.map((pillar) => (
              <Card key={pillar.title} className="bg-muted/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <pillar.icon className={`h-6 w-6 ${pillar.color}`} />
                    <div>
                      <CardTitle className="text-lg">{pillar.title}</CardTitle>
                      <Badge variant="outline">{pillar.score}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{pillar.description}</p>
                  <ul className="text-sm space-y-1">
                    {pillar.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Key Business Questions Answered
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {keyQuestions.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <item.icon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{item.question}</p>
                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Criteria Tabs */}
      <Tabs defaultValue="technical" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="technical" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Technical</span>
            <Badge variant="secondary" className="ml-1">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Business</span>
            <Badge variant="secondary" className="ml-1">4</Badge>
          </TabsTrigger>
          <TabsTrigger value="innovation" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Innovation</span>
            <Badge variant="secondary" className="ml-1">4</Badge>
          </TabsTrigger>
          <TabsTrigger value="visualization" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Visualization</span>
            <Badge variant="secondary" className="ml-1">4</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="technical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                Technical Strength (Criteria 1-3)
              </CardTitle>
              <CardDescription>
                Data quality, modeling rationale, and evaluation methodology
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CriteriaCard criteria={technicalCriteria} categoryColor="#3b82f6" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Business Value (Criteria 4-7)
              </CardTitle>
              <CardDescription>
                Business drivers, insights, recommendations, and decision support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CriteriaCard criteria={businessCriteria} categoryColor="#22c55e" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="innovation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Innovation (Criteria 8-11)
              </CardTitle>
              <CardDescription>
                Creative approaches, novel techniques, and forward-thinking solutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CriteriaCard criteria={innovationCriteria} categoryColor="#eab308" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-500" />
                Visualization & Storytelling (Criteria 12-15)
              </CardTitle>
              <CardDescription>
                Narrative flow, visual design, and presentation quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CriteriaCard criteria={visualizationCriteria} categoryColor="#a855f7" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* IVI Formula */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            IVI Score Calculation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-6 rounded-lg text-center">
            <p className="text-2xl font-mono font-bold">
              IVI Score = (H × 40%) + (E × 30%) + (U × 30%)
            </p>
            <div className="flex justify-center gap-8 mt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">H</div>
                <div className="text-sm text-muted-foreground">Health</div>
                <div className="text-xs">40%</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">E</div>
                <div className="text-sm text-muted-foreground">Experience</div>
                <div className="text-xs">30%</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">U</div>
                <div className="text-sm text-muted-foreground">Utilization</div>
                <div className="text-xs">30%</div>
              </div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                Low Risk (70-100)
              </h4>
              <p className="text-sm text-muted-foreground">Routine monitoring</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                Medium Risk (40-69)
              </h4>
              <p className="text-sm text-muted-foreground">Periodic follow-up</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                High Risk (0-39)
              </h4>
              <p className="text-sm text-muted-foreground">Immediate intervention</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
