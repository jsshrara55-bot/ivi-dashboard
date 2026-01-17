import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, FileText, HelpCircle, Loader2, ShieldCheck, Stethoscope, Upload, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function SmartPreAuth() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, File | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<'approved' | 'rejected' | null>(null);
  const [appealMode, setAppealMode] = useState(false);
  const [appealText, setAppealText] = useState('');

  // Fetch medication categories
  const { data: categories, isLoading: categoriesLoading } = trpc.medications.list.useQuery();
  
  // Fetch requirements for selected category
  const { data: requirements, isLoading: requirementsLoading } = trpc.requirements.listByCategory.useQuery(
    { categoryId: selectedCategoryId! },
    { enabled: !!selectedCategoryId }
  );

  // Mutations
  const createRequestMutation = trpc.preAuth.create.useMutation();
  const uploadDocumentMutation = trpc.documents.upload.useMutation();
  const seedMutation = trpc.medications.seed.useMutation();

  // Auto-seed data if no categories exist
  useEffect(() => {
    if (categories && categories.length === 0 && user?.role === 'admin') {
      seedMutation.mutate(undefined, {
        onSuccess: () => {
          toast.success("Initial data seeded successfully!");
          window.location.reload();
        },
      });
    }
  }, [categories, user]);

  const handleCheck = (requirementId: number, checked: boolean) => {
    setCheckedItems(prev => ({ ...prev, [requirementId]: checked }));
  };

  const handleFileChange = (requirementId: number, file: File | null) => {
    setUploadedFiles(prev => ({ ...prev, [requirementId]: file }));
  };

  const requiredRequirements = requirements?.filter(r => r.isRequired) || [];
  const allRequiredMet = requiredRequirements.every(r => checkedItems[r.id]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to submit a request");
      window.location.href = getLoginUrl();
      return;
    }

    setSubmitted(true);
    
    if (allRequiredMet) {
      try {
        // Create the pre-auth request
        const checklistItems = (requirements || []).map(r => ({
          requirementId: r.id,
          isChecked: checkedItems[r.id] || false,
        }));

        const { id: requestId } = await createRequestMutation.mutateAsync({
          categoryId: selectedCategoryId!,
          checklistItems,
        });

        // Upload any files
        for (const [reqIdStr, file] of Object.entries(uploadedFiles)) {
          if (file) {
            const reqId = parseInt(reqIdStr);
            const reader = new FileReader();
            reader.onload = async (e) => {
              const base64 = (e.target?.result as string).split(',')[1];
              await uploadDocumentMutation.mutateAsync({
                requestId,
                requirementId: reqId,
                fileName: file.name,
                fileData: base64,
                mimeType: file.type,
              });
            };
            reader.readAsDataURL(file);
          }
        }

        setResult('approved');
        toast.success("Request submitted successfully!");
      } catch (error) {
        toast.error("Failed to submit request");
        setResult('rejected');
      }
    } else {
      setResult('rejected');
      toast.error("Missing required items");
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setResult(null);
    setCheckedItems({});
    setUploadedFiles({});
    setAppealMode(false);
    setAppealText('');
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(parseInt(value));
    handleReset();
  };

  if (authLoading || categoriesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
                  value={selectedCategoryId?.toString() || ''} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-full h-12 text-lg">
                    <SelectValue placeholder="Select medication type" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.nameEn} - {cat.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedCategoryId && (
              <Card className="swiss-card">
                <CardHeader>
                  <CardTitle>2. Eligibility Checklist</CardTitle>
                  <CardDescription>
                    Please verify the following documents are available and meet criteria.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {requirementsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    requirements?.map((req) => (
                      <div key={req.id} className="flex flex-col space-y-3 p-4 rounded-lg border border-border bg-card/50 transition-colors hover:bg-muted/20">
                        <div className="flex items-start space-x-4">
                          <Switch
                            id={`req-${req.id}`}
                            checked={checkedItems[req.id] || false}
                            onCheckedChange={(c) => handleCheck(req.id, c)}
                            disabled={submitted && result === 'approved'}
                          />
                          <div className="space-y-1 flex-1">
                            <Label 
                              htmlFor={`req-${req.id}`} 
                              className={cn(
                                "text-base font-medium cursor-pointer flex items-center gap-2",
                                req.isRequired && "after:content-['*'] after:text-destructive after:ml-0.5"
                              )}
                            >
                              {req.labelEn}
                              {checkedItems[req.id] && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {req.descriptionEn}
                            </p>
                            <p className="text-xs text-muted-foreground/70 font-arabic">
                              {req.labelAr}
                            </p>
                          </div>
                        </div>
                        
                        {req.requiresDocument && (
                          <div className="ml-12 mt-2">
                            <Label 
                              htmlFor={`file-${req.id}`}
                              className="flex items-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                            >
                              <Upload className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {uploadedFiles[req.id] 
                                  ? uploadedFiles[req.id]?.name 
                                  : "Upload supporting document (PDF, Image)"}
                              </span>
                              <input
                                id={`file-${req.id}`}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(e) => handleFileChange(req.id, e.target.files?.[0] || null)}
                                disabled={submitted && result === 'approved'}
                              />
                            </Label>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button variant="outline" onClick={handleReset}>Reset</Button>
                  <Button 
                    size="lg" 
                    onClick={handleSubmit}
                    disabled={(submitted && result === 'approved') || createRequestMutation.isPending}
                    className={cn(
                      "min-w-[150px]",
                      allRequiredMet ? "bg-primary hover:bg-primary/90" : "bg-muted-foreground/50"
                    )}
                  >
                    {createRequestMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {submitted ? "Re-Check Eligibility" : "Check Eligibility"}
                  </Button>
                </CardFooter>
              </Card>
            )}
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
                  {!isAuthenticated && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => window.location.href = getLoginUrl()}
                    >
                      Login to Submit Requests
                    </Button>
                  )}
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
                      <li>Your request has been submitted</li>
                      <li>Documents are being processed</li>
                      <li>Expected response: <strong>24-48 hours</strong></li>
                    </ul>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleReset}>
                    Submit Another Request
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
                    {requiredRequirements.filter(r => !checkedItems[r.id]).map(r => (
                      <li key={r.id} className="flex items-start gap-2 text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{r.labelEn}</span>
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
                          value={appealText}
                          onChange={(e) => setAppealText(e.target.value)}
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
                              setAppealText('');
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
