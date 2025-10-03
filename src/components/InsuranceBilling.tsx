import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CreditCard,
  FileText,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InsurancePolicy {
  policyNumber: string;
  provider: string;
  planName: string;
  planType: string;
  groupNumber: string;
  subscriberName: string;
  subscriberId: string;
  relationshipToSubscriber: string;
  effectiveDate: string;
  expirationDate: string;
  copay: string;
  deductible: string;
  deductibleMet: string;
  outOfPocketMax: string;
  outOfPocketMet: string;
  customerServicePhone: string;
  claimsPhone: string;
  notes: string;
}

interface Claim {
  id: string;
  claimNumber: string;
  dateOfService: string;
  provider: string;
  serviceDescription: string;
  billedAmount: number;
  allowedAmount: number;
  insurancePaid: number;
  patientResponsibility: number;
  status: "submitted" | "processing" | "approved" | "denied" | "paid";
  submittedDate: string;
  processedDate?: string;
  notes: string;
}

interface PaymentHistory {
  id: string;
  date: string;
  description: string;
  amount: number;
  paymentMethod: string;
  confirmationNumber: string;
  status: "pending" | "completed" | "failed";
}

export function InsuranceBilling({ accessToken }: { accessToken: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [insuranceData, setInsuranceData] = useState<InsurancePolicy>({
    policyNumber: "",
    provider: "",
    planName: "",
    planType: "",
    groupNumber: "",
    subscriberName: "",
    subscriberId: "",
    relationshipToSubscriber: "Self",
    effectiveDate: "",
    expirationDate: "",
    copay: "",
    deductible: "",
    deductibleMet: "",
    outOfPocketMax: "",
    outOfPocketMet: "",
    customerServicePhone: "",
    claimsPhone: "",
    notes: "",
  });

  const [claims] = useState<Claim[]>([
    {
      id: "1",
      claimNumber: "CLM-2025-001234",
      dateOfService: "2025-01-15",
      provider: "Dr. Sarah Johnson",
      serviceDescription: "Annual Physical Exam",
      billedAmount: 350,
      allowedAmount: 280,
      insurancePaid: 224,
      patientResponsibility: 56,
      status: "approved",
      submittedDate: "2025-01-16",
      processedDate: "2025-01-20",
      notes: "",
    },
    {
      id: "2",
      claimNumber: "CLM-2025-001567",
      dateOfService: "2025-02-10",
      provider: "City Medical Lab",
      serviceDescription: "Blood Work - Complete Panel",
      billedAmount: 485,
      allowedAmount: 425,
      insurancePaid: 340,
      patientResponsibility: 85,
      status: "processing",
      submittedDate: "2025-02-11",
      notes: "",
    },
  ]);

  const [paymentHistory] = useState<PaymentHistory[]>([
    {
      id: "1",
      date: "2025-01-25",
      description: "Payment for Annual Physical - Dr. Johnson",
      amount: 56,
      paymentMethod: "Credit Card ****1234",
      confirmationNumber: "PAY-001234",
      status: "completed",
    },
    {
      id: "2",
      date: "2025-02-15",
      description: "Payment for Lab Work - City Medical",
      amount: 85,
      paymentMethod: "Credit Card ****1234",
      confirmationNumber: "PAY-001567",
      status: "pending",
    },
  ]);

  const projectId = "cvsxfzllhhhpdyckdmqg";

  useEffect(() => {
    fetchInsuranceData();
  }, []);

  const fetchInsuranceData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/insurance`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.insurance) {
          setInsuranceData(data.insurance);
        }
      }
    } catch (error) {
      toast.error("Failed to load insurance data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInsurance = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/insurance`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(insuranceData),
        }
      );

      if (response.ok) {
        toast.success("Insurance information saved successfully");
      } else {
        toast.error("Failed to save insurance information");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const getClaimStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "paid":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "denied":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4 text-blue-600" />;
    }
  };

  const getClaimStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      submitted: "default",
      processing: "default",
      approved: "secondary",
      paid: "secondary",
      denied: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const totalBilled = claims.reduce((sum, claim) => sum + claim.billedAmount, 0);
  const totalPaid = claims.reduce((sum, claim) => sum + claim.insurancePaid, 0);
  const totalOwed = claims.reduce((sum, claim) => sum + claim.patientResponsibility, 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Insurance & Billing</h2>
          <p className="text-muted-foreground">
            Manage insurance policies, claims, and payment history
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBilled.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Insurance Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Covered by insurance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Patient Responsibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOwed.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Your portion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {claims.filter((c) => c.status === "processing" || c.status === "submitted").length}
            </div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insurance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insurance">Insurance Info</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="insurance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Policy Information</CardTitle>
              <CardDescription>
                Your current health insurance coverage details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="policy-number">Policy Number</Label>
                    <Input
                      id="policy-number"
                      value={insuranceData.policyNumber}
                      onChange={(e) =>
                        setInsuranceData({ ...insuranceData, policyNumber: e.target.value })
                      }
                      placeholder="POL-123456789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider">Insurance Provider</Label>
                    <Input
                      id="provider"
                      value={insuranceData.provider}
                      onChange={(e) =>
                        setInsuranceData({ ...insuranceData, provider: e.target.value })
                      }
                      placeholder="Blue Cross Blue Shield"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="plan-name">Plan Name</Label>
                    <Input
                      id="plan-name"
                      value={insuranceData.planName}
                      onChange={(e) =>
                        setInsuranceData({ ...insuranceData, planName: e.target.value })
                      }
                      placeholder="PPO Gold Plan"
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan-type">Plan Type</Label>
                    <Select
                      value={insuranceData.planType}
                      onValueChange={(value) =>
                        setInsuranceData({ ...insuranceData, planType: value })
                      }
                    >
                      <SelectTrigger id="plan-type">
                        <SelectValue placeholder="Select plan type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HMO">HMO</SelectItem>
                        <SelectItem value="PPO">PPO</SelectItem>
                        <SelectItem value="EPO">EPO</SelectItem>
                        <SelectItem value="POS">POS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="group-number">Group Number</Label>
                    <Input
                      id="group-number"
                      value={insuranceData.groupNumber}
                      onChange={(e) =>
                        setInsuranceData({ ...insuranceData, groupNumber: e.target.value })
                      }
                      placeholder="GRP-987654"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subscriber-id">Subscriber ID</Label>
                    <Input
                      id="subscriber-id"
                      value={insuranceData.subscriberId}
                      onChange={(e) =>
                        setInsuranceData({ ...insuranceData, subscriberId: e.target.value })
                      }
                      placeholder="SUB-123456"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subscriber-name">Subscriber Name</Label>
                    <Input
                      id="subscriber-name"
                      value={insuranceData.subscriberName}
                      onChange={(e) =>
                        setInsuranceData({ ...insuranceData, subscriberName: e.target.value })
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="relationship">Relationship to Subscriber</Label>
                    <Select
                      value={insuranceData.relationshipToSubscriber}
                      onValueChange={(value) =>
                        setInsuranceData({ ...insuranceData, relationshipToSubscriber: value })
                      }
                    >
                      <SelectTrigger id="relationship">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Self">Self</SelectItem>
                        <SelectItem value="Spouse">Spouse</SelectItem>
                        <SelectItem value="Child">Child</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="effective-date">Effective Date</Label>
                    <Input
                      id="effective-date"
                      type="date"
                      value={insuranceData.effectiveDate}
                      onChange={(e) =>
                        setInsuranceData({ ...insuranceData, effectiveDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiration-date">Expiration Date</Label>
                    <Input
                      id="expiration-date"
                      type="date"
                      value={insuranceData.expirationDate}
                      onChange={(e) =>
                        setInsuranceData({ ...insuranceData, expirationDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="copay">Copay</Label>
                    <Input
                      id="copay"
                      value={insuranceData.copay}
                      onChange={(e) =>
                        setInsuranceData({ ...insuranceData, copay: e.target.value })
                      }
                      placeholder="$25"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deductible">Deductible</Label>
                    <Input
                      id="deductible"
                      value={insuranceData.deductible}
                      onChange={(e) =>
                        setInsuranceData({ ...insuranceData, deductible: e.target.value })
                      }
                      placeholder="$1,500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deductible-met">Deductible Met (YTD)</Label>
                    <Input
                      id="deductible-met"
                      value={insuranceData.deductibleMet}
                      onChange={(e) =>
                        setInsuranceData({ ...insuranceData, deductibleMet: e.target.value })
                      }
                      placeholder="$450"
                    />
                  </div>
                  <div>
                    <Label htmlFor="oop-max">Out-of-Pocket Maximum</Label>
                    <Input
                      id="oop-max"
                      value={insuranceData.outOfPocketMax}
                      onChange={(e) =>
                        setInsuranceData({ ...insuranceData, outOfPocketMax: e.target.value })
                      }
                      placeholder="$6,000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="oop-met">Out-of-Pocket Met (YTD)</Label>
                    <Input
                      id="oop-met"
                      value={insuranceData.outOfPocketMet}
                      onChange={(e) =>
                        setInsuranceData({ ...insuranceData, outOfPocketMet: e.target.value })
                      }
                      placeholder="$890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer-service">Customer Service Phone</Label>
                    <Input
                      id="customer-service"
                      value={insuranceData.customerServicePhone}
                      onChange={(e) =>
                        setInsuranceData({
                          ...insuranceData,
                          customerServicePhone: e.target.value,
                        })
                      }
                      placeholder="*6050 or 03-123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="claims-phone">Claims Phone</Label>
                    <Input
                      id="claims-phone"
                      value={insuranceData.claimsPhone}
                      onChange={(e) =>
                        setInsuranceData({ ...insuranceData, claimsPhone: e.target.value })
                      }
                      placeholder="*6051 or 03-987-6543"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="insurance-notes">Notes</Label>
                  <Textarea
                    id="insurance-notes"
                    value={insuranceData.notes}
                    onChange={(e) =>
                      setInsuranceData({ ...insuranceData, notes: e.target.value })
                    }
                    placeholder="Any additional notes about your insurance coverage..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleSaveInsurance} disabled={saving}>
                  {saving ? "Saving..." : "Save Insurance Information"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {getClaimStatusIcon(claim.status)}
                      <CardTitle className="text-lg">{claim.claimNumber}</CardTitle>
                      {getClaimStatusBadge(claim.status)}
                    </div>
                    <CardDescription className="mt-1">
                      {claim.serviceDescription} • {claim.provider}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date of Service</p>
                      <p className="font-medium">
                        {new Date(claim.dateOfService).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Billed Amount</p>
                      <p className="font-medium">${claim.billedAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Insurance Paid</p>
                      <p className="font-medium text-green-600">
                        ${claim.insurancePaid.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Your Responsibility</p>
                      <p className="font-medium text-orange-600">
                        ${claim.patientResponsibility.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                    <div>
                      <p className="text-muted-foreground">Submitted</p>
                      <p>{new Date(claim.submittedDate).toLocaleDateString()}</p>
                    </div>
                    {claim.processedDate && (
                      <div>
                        <p className="text-muted-foreground">Processed</p>
                        <p>{new Date(claim.processedDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  {claim.notes && (
                    <div className="text-sm pt-2 border-t">
                      <p className="text-muted-foreground mb-1">Notes</p>
                      <p>{claim.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          {paymentHistory.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <p className="font-semibold text-lg">
                        ${payment.amount.toFixed(2)}
                      </p>
                      <Badge
                        variant={
                          payment.status === "completed"
                            ? "secondary"
                            : payment.status === "failed"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {payment.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(payment.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {payment.paymentMethod}
                      </div>
                      <div>Confirmation: {payment.confirmationNumber}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
