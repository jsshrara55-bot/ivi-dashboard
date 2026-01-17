import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, FileText, HelpCircle, ShieldCheck, Stethoscope, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type MedicationType = 'obesity' | 'biologics' | 'growth_hormone' | 'baby_formula';

interface Requirement {
  id: string;
  label: string;
  description: string;
  required: boolean;
}

const REQUIREMENTS: Record<MedicationType, Requirement[]> = {
  obesity: [
    { id: 'bmi', label: 'BMI Report > 30 (or > 27 with comorbidities)', description: 'Recent BMI measurement within last 3 months', required: true },
    { id: 'diet', label: 'Failed Diet/Exercise Plan', description: 'Documented failure of 6-month lifestyle intervention', required: true },
    { id: 'thyroid', label: 'Thyroid Function Test', description: 'Normal TSH levels to rule out hypothyroidism', required: true },
    { id: 'contra', label: 'No Contraindications', description: 'Patient does not have history of medullary thyroid carcinoma', required: true },
  ],
  biologics: [
    { id: 'diagnosis', label: 'Confirmed Diagnosis', description: 'Pathology report confirming autoimmune condition', required: true },
    { id: 'prior_therapy', label: 'Failure of First-Line Therapy', description: 'Documented lack of response to conventional DMARDs', required: true },
    { id: 'tb_test', label: 'Negative TB Screening', description: 'Recent chest X-ray or Quantiferon test', required: true },
    { id: 'hepatitis', label: 'Hepatitis Screening', description: 'Negative Hepatitis B and C panel', required: true },
  ],
  growth_hormone: [
    { id: 'stimulation', label: 'GH Stimulation Test', description: 'Two failed provocation tests (peak GH < 10 ng/mL)', required: true },
    { id: 'bone_age', label: 'Bone Age X-Ray', description: 'Delayed bone age report', required: true },
    { id: 'igf1', label: 'Low IGF-1 Levels', description: 'Serum IGF-1 below normal range for age/sex', required: true },
    { id: 'mri', label: 'Pituitary MRI', description: 'To rule out intracranial lesions', required: true },
  ],
  baby_formula: [
    { id: 'allergy', label: 'Allergy Confirmation', description: 'Proven cow\'s milk protein allergy (CMPA)', required: true },
    { id: 'growth', label: 'Growth Chart', description: 'Evidence of failure to thrive or weight loss', required: true },
    { id: 'dermatology', label: 'Dermatologist Report', description: 'For severe eczema cases', required: false },
  ],
};

export default function SmartPreAuth() {
  const [selectedMed, setSelectedMed] = useState<MedicationType>('obesity');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<'approved' | 'rejected' | null>(null);
  const [appealMode, setAppealMode] = useState(false);

  const handleCheck = (id: string, checked: boolean) => {
    setCheckedItems(prev => ({ ...prev, [id]: checked }));
  };

  const currentRequirements = REQUIREMENTS[selectedMed];
  const allRequiredMet = currentRequirements
    .filter(r => r.required)
    .every(r => checkedItems[r.id]);

  const handleSubmit = () => {
    setSubmitted(true);
    if (allRequiredMet) {
      setResult('approved');
      toast.success("Eligibility Confirmed!");
    } else {
      setResult('rejected');
      toast.error("Missing Requirements");
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setResult(null);
    setCheckedItems({});
    setAppealMode(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Smart Pre-Auth Wizard
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Verify eligibility and completeness <strong>before</strong> submission to prevent rejection.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Left Column: Selection & Checklist */}
          <div className="md:col-span-2 space-y-6">
            <Card className="swiss-card">
              <CardHeader>
                <CardTitle>1. Select Medication Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedMed} 
                  onValueChange={(v) => {
                    setSelectedMed(v as MedicationType);
                    handleReset();
                  }}
                >
                  <SelectTrigger className="w-full h-12 text-lg">
                    <SelectValue placeholder="Select medication type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="obesity">Obesity / Weight Loss (e.g., Saxenda, Wegovy)</SelectItem>
                    <SelectItem value="biologics">Biologics (e.g., Humira, Enbrel)</SelectItem>
                    <SelectItem value="growth_hormone">Growth Hormone</SelectItem>
                    <SelectItem value="baby_formula">Specialized Baby Formula</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="swiss-card">
              <CardHeader>
                <CardTitle>2. Eligibility Checklist</CardTitle>
                <CardDescription>
                  Please verify the following documents are available and meet criteria.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentRequirements.map((req) => (
                  <div key={req.id} className="flex items-start space-x-4 p-4 rounded-lg border border-border bg-card/50 transition-colors hover:bg-muted/20">
                    <Switch
                      id={req.id}
                      checked={checkedItems[req.id] || false}
                      onCheckedChange={(c) => handleCheck(req.id, c)}
                      disabled={submitted && result === 'approved'}
                    />
                    <div className="space-y-1 flex-1">
                      <Label 
                        htmlFor={req.id} 
                        className={cn(
                          "text-base font-medium cursor-pointer flex items-center gap-2",
                          req.required && "after:content-['*'] after:text-destructive after:ml-0.5"
                        )}
                      >
                        {req.label}
                        {checkedItems[req.id] && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {req.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" onClick={handleReset}>Reset</Button>
                <Button 
                  size="lg" 
                  onClick={handleSubmit}
                  disabled={submitted && result === 'approved'}
                  className={cn(
                    "min-w-[150px]",
                    allRequiredMet ? "bg-primary hover:bg-primary/90" : "bg-muted-foreground/50"
                  )}
                >
                  {submitted ? "Re-Check Eligibility" : "Check Eligibility"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column: Result & Guidance */}
          <div className="space-y-6">
            {!submitted && (
              <Card className="swiss-card bg-muted/30 border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">Ready to Check</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Select a medication and complete the checklist to see the eligibility result.
                  </p>
                </CardContent>
              </Card>
            )}

            {submitted && result === 'approved' && (
              <Card className="swiss-card border-green-200 bg-green-50/50 dark:bg-green-900/10">
                <CardHeader>
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-6 w-6" />
                    <CardTitle>Eligible for Approval</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Great news! Based on the provided information, this request meets all clinical guidelines.
                  </p>
                  <div className="bg-white dark:bg-card p-4 rounded-md border text-sm">
                    <strong>Next Steps:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                      <li>Upload the checked documents</li>
                      <li>Submit the Pre-Auth request</li>
                      <li>Expected response: <strong>Instant</strong></li>
                    </ul>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Proceed to Submission
                  </Button>
                </CardContent>
              </Card>
            )}

            {submitted && result === 'rejected' && (
              <Card className="swiss-card border-red-200 bg-red-50/50 dark:bg-red-900/10">
                <CardHeader>
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <XCircle className="h-6 w-6" />
                    <CardTitle>Missing Requirements</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-red-800 dark:text-red-300">
                    We cannot approve this request yet. The following mandatory items are missing:
                  </p>
                  <ul className="bg-white dark:bg-card p-4 rounded-md border text-sm space-y-2">
                    {currentRequirements.filter(r => r.required && !checkedItems[r.id]).map(r => (
                      <li key={r.id} className="flex items-start gap-2 text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{r.label}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {!appealMode ? (
                    <div className="pt-4 border-t border-red-200 dark:border-red-800">
                      <p className="text-xs text-muted-foreground mb-3">
                        Believe this is a mistake? You can request a medical review.
                      </p>
                      <Button 
                        variant="outline" 
                        className="w-full border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
                        onClick={() => setAppealMode(true)}
                      >
                        I want to appeal this decision
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-red-200 dark:border-red-800 animate-in slide-in-from-top-2">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Stethoscope className="h-4 w-4" />
                        Medical Appeal
                      </h4>
                      <div className="space-y-3">
                        <Label htmlFor="appeal-reason" className="text-xs">Reason for exception (Medical Justification)</Label>
                        <textarea 
                          id="appeal-reason"
                          className="w-full min-h-[80px] p-2 text-sm rounded-md border border-input bg-background"
                          placeholder="Explain why the patient needs this medication despite missing criteria..."
                        />
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setAppealMode(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              toast.success("Appeal sent to Medical Board");
                              setAppealMode(false);
                            }}
                          >
                            Submit Appeal
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
