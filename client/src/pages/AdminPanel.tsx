import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Edit, Loader2, Plus, Settings, Shield, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingRequirement, setEditingRequirement] = useState<any>(null);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [newRequirementOpen, setNewRequirementOpen] = useState(false);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    code: '', nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: ''
  });
  const [requirementForm, setRequirementForm] = useState({
    code: '', labelEn: '', labelAr: '', descriptionEn: '', descriptionAr: '',
    isRequired: true, requiresDocument: false, sortOrder: 0
  });

  // Queries
  const { data: categories, isLoading: categoriesLoading, refetch: refetchCategories } = trpc.medications.list.useQuery();
  const { data: requirements, isLoading: requirementsLoading, refetch: refetchRequirements } = trpc.requirements.listByCategory.useQuery(
    { categoryId: selectedCategoryId! },
    { enabled: !!selectedCategoryId }
  );
  const { data: allRequests, isLoading: requestsLoading } = trpc.preAuth.listAll.useQuery();

  // Mutations
  const createCategoryMutation = trpc.medications.create.useMutation();
  const updateCategoryMutation = trpc.medications.update.useMutation();
  const deleteCategoryMutation = trpc.medications.delete.useMutation();
  const createRequirementMutation = trpc.requirements.create.useMutation();
  const updateRequirementMutation = trpc.requirements.update.useMutation();
  const deleteRequirementMutation = trpc.requirements.delete.useMutation();
  const reviewRequestMutation = trpc.preAuth.review.useMutation();
  const seedMutation = trpc.medications.seed.useMutation();

  // Check if user is admin
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Shield className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold">Admin Access Required</h2>
          <p className="text-muted-foreground mt-2">
            You need administrator privileges to access this page.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const handleCreateCategory = async () => {
    try {
      await createCategoryMutation.mutateAsync(categoryForm);
      toast.success("Category created successfully!");
      setNewCategoryOpen(false);
      setCategoryForm({ code: '', nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '' });
      refetchCategories();
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    try {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        ...categoryForm,
      });
      toast.success("Category updated successfully!");
      setEditingCategory(null);
      refetchCategories();
    } catch (error) {
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategoryMutation.mutateAsync({ id });
      toast.success("Category deleted successfully!");
      refetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const handleCreateRequirement = async () => {
    if (!selectedCategoryId) return;
    try {
      await createRequirementMutation.mutateAsync({
        categoryId: selectedCategoryId,
        ...requirementForm,
      });
      toast.success("Requirement created successfully!");
      setNewRequirementOpen(false);
      setRequirementForm({
        code: '', labelEn: '', labelAr: '', descriptionEn: '', descriptionAr: '',
        isRequired: true, requiresDocument: false, sortOrder: 0
      });
      refetchRequirements();
    } catch (error) {
      toast.error("Failed to create requirement");
    }
  };

  const handleUpdateRequirement = async () => {
    if (!editingRequirement) return;
    try {
      await updateRequirementMutation.mutateAsync({
        id: editingRequirement.id,
        ...requirementForm,
      });
      toast.success("Requirement updated successfully!");
      setEditingRequirement(null);
      refetchRequirements();
    } catch (error) {
      toast.error("Failed to update requirement");
    }
  };

  const handleDeleteRequirement = async (id: number) => {
    if (!confirm("Are you sure you want to delete this requirement?")) return;
    try {
      await deleteRequirementMutation.mutateAsync({ id });
      toast.success("Requirement deleted successfully!");
      refetchRequirements();
    } catch (error) {
      toast.error("Failed to delete requirement");
    }
  };

  const handleReviewRequest = async (id: number, status: 'approved' | 'rejected', reason?: string) => {
    try {
      await reviewRequestMutation.mutateAsync({ id, status, rejectionReason: reason });
      toast.success(`Request ${status}!`);
    } catch (error) {
      toast.error("Failed to review request");
    }
  };

  const handleSeedData = async () => {
    try {
      await seedMutation.mutateAsync();
      toast.success("Initial data seeded successfully!");
      refetchCategories();
    } catch (error) {
      toast.error("Failed to seed data");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Settings className="h-8 w-8 text-primary" />
              Admin Panel
            </h2>
            <p className="text-muted-foreground mt-2">
              Manage medication categories, eligibility requirements, and review requests.
            </p>
          </div>
          {categories?.length === 0 && (
            <Button onClick={handleSeedData} disabled={seedMutation.isPending}>
              {seedMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Seed Initial Data
            </Button>
          )}
        </div>

        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories">Medication Categories</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="requests">Pending Requests</TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={newCategoryOpen} onOpenChange={setNewCategoryOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                    <DialogDescription>Create a new medication category for pre-authorization.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Code</Label>
                        <Input 
                          value={categoryForm.code} 
                          onChange={(e) => setCategoryForm(p => ({ ...p, code: e.target.value }))}
                          placeholder="e.g., obesity"
                        />
                      </div>
                      <div>
                        <Label>Sort Order</Label>
                        <Input type="number" defaultValue={0} />
                      </div>
                    </div>
                    <div>
                      <Label>Name (English)</Label>
                      <Input 
                        value={categoryForm.nameEn} 
                        onChange={(e) => setCategoryForm(p => ({ ...p, nameEn: e.target.value }))}
                        placeholder="Obesity / Weight Loss"
                      />
                    </div>
                    <div>
                      <Label>Name (Arabic)</Label>
                      <Input 
                        value={categoryForm.nameAr} 
                        onChange={(e) => setCategoryForm(p => ({ ...p, nameAr: e.target.value }))}
                        placeholder="أدوية السمنة"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <Label>Description (English)</Label>
                      <Input 
                        value={categoryForm.descriptionEn} 
                        onChange={(e) => setCategoryForm(p => ({ ...p, descriptionEn: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Description (Arabic)</Label>
                      <Input 
                        value={categoryForm.descriptionAr} 
                        onChange={(e) => setCategoryForm(p => ({ ...p, descriptionAr: e.target.value }))}
                        dir="rtl"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewCategoryOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateCategory} disabled={createCategoryMutation.isPending}>
                      {createCategoryMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Create
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {categoriesLoading ? (
                <div className="col-span-2 flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : categories?.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  No categories found. Click "Seed Initial Data" to add default categories.
                </div>
              ) : (
                categories?.map(cat => (
                  <Card key={cat.id} className="swiss-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{cat.nameEn}</CardTitle>
                          <CardDescription className="font-arabic">{cat.nameAr}</CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setEditingCategory(cat);
                              setCategoryForm({
                                code: cat.code,
                                nameEn: cat.nameEn,
                                nameAr: cat.nameAr,
                                descriptionEn: cat.descriptionEn || '',
                                descriptionAr: cat.descriptionAr || '',
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteCategory(cat.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{cat.descriptionEn}</p>
                      <div className="mt-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{cat.code}</code>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <select 
                className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedCategoryId || ''}
                onChange={(e) => setSelectedCategoryId(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">Select a category...</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nameEn}</option>
                ))}
              </select>

              {selectedCategoryId && (
                <Dialog open={newRequirementOpen} onOpenChange={setNewRequirementOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Requirement
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Add New Requirement</DialogTitle>
                      <DialogDescription>Create a new eligibility requirement for this category.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Code</Label>
                          <Input 
                            value={requirementForm.code} 
                            onChange={(e) => setRequirementForm(p => ({ ...p, code: e.target.value }))}
                            placeholder="e.g., bmi_report"
                          />
                        </div>
                        <div>
                          <Label>Sort Order</Label>
                          <Input 
                            type="number" 
                            value={requirementForm.sortOrder}
                            onChange={(e) => setRequirementForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Label (English)</Label>
                        <Input 
                          value={requirementForm.labelEn} 
                          onChange={(e) => setRequirementForm(p => ({ ...p, labelEn: e.target.value }))}
                          placeholder="BMI Report > 30"
                        />
                      </div>
                      <div>
                        <Label>Label (Arabic)</Label>
                        <Input 
                          value={requirementForm.labelAr} 
                          onChange={(e) => setRequirementForm(p => ({ ...p, labelAr: e.target.value }))}
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <Label>Description (English)</Label>
                        <Input 
                          value={requirementForm.descriptionEn} 
                          onChange={(e) => setRequirementForm(p => ({ ...p, descriptionEn: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Description (Arabic)</Label>
                        <Input 
                          value={requirementForm.descriptionAr} 
                          onChange={(e) => setRequirementForm(p => ({ ...p, descriptionAr: e.target.value }))}
                          dir="rtl"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Required</Label>
                        <Switch 
                          checked={requirementForm.isRequired}
                          onCheckedChange={(c) => setRequirementForm(p => ({ ...p, isRequired: c }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Requires Document Upload</Label>
                        <Switch 
                          checked={requirementForm.requiresDocument}
                          onCheckedChange={(c) => setRequirementForm(p => ({ ...p, requiresDocument: c }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewRequirementOpen(false)}>Cancel</Button>
                      <Button onClick={handleCreateRequirement} disabled={createRequirementMutation.isPending}>
                        {createRequirementMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Create
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {selectedCategoryId ? (
              <div className="space-y-3">
                {requirementsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : requirements?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No requirements found for this category.
                  </div>
                ) : (
                  requirements?.map(req => (
                    <Card key={req.id} className="swiss-card">
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{req.labelEn}</span>
                              {req.isRequired && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Required</span>
                              )}
                              {req.requiresDocument && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Document</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{req.descriptionEn}</p>
                            <p className="text-xs text-muted-foreground/70 font-arabic mt-1">{req.labelAr}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteRequirement(req.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a category to view and manage its requirements.
              </div>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            {requestsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : allRequests?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending requests.
              </div>
            ) : (
              <div className="space-y-3">
                {allRequests?.map(req => (
                  <Card key={req.id} className={cn(
                    "swiss-card border-l-4",
                    req.status === 'pending' ? "border-l-yellow-500" :
                    req.status === 'approved' ? "border-l-green-500" :
                    req.status === 'rejected' ? "border-l-red-500" : "border-l-blue-500"
                  )}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Request #{req.id}</span>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded capitalize",
                              req.status === 'pending' ? "bg-yellow-100 text-yellow-800" :
                              req.status === 'approved' ? "bg-green-100 text-green-800" :
                              req.status === 'rejected' ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                            )}>
                              {req.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Category ID: {req.categoryId} | User ID: {req.userId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submitted: {new Date(req.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleReviewRequest(req.id, 'approved')}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleReviewRequest(req.id, 'rejected', 'Does not meet criteria')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
