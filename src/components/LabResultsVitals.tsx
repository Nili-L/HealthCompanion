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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  AlertCircle,
  CheckCircle2,
  Search,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Textarea } from "@/components/ui/textarea";

interface LabResult {
  id: string;
  testName: string;
  category: string;
  date: string;
  orderedBy: string;
  facility: string;
  status: "completed" | "pending" | "cancelled";
  results: TestResult[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface TestResult {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: "normal" | "high" | "low" | "critical";
}

interface VitalSign {
  id: string;
  type: string;
  value: number;
  unit: string;
  date: string;
  time: string;
  notes: string;
  recordedBy: string;
  createdAt: string;
}

const LAB_CATEGORIES = [
  "Complete Blood Count (CBC)",
  "Metabolic Panel",
  "Lipid Panel",
  "Thyroid Function",
  "Liver Function",
  "Kidney Function",
  "Diabetes Screening",
  "Vitamin Levels",
  "Hormone Levels",
  "Infectious Disease",
  "Allergy Testing",
  "Other",
];

const VITAL_TYPES = [
  { value: "blood_pressure_systolic", label: "Blood Pressure (Systolic)", unit: "mmHg" },
  { value: "blood_pressure_diastolic", label: "Blood Pressure (Diastolic)", unit: "mmHg" },
  { value: "heart_rate", label: "Heart Rate", unit: "bpm" },
  { value: "temperature", label: "Temperature", unit: "°C" },
  { value: "respiratory_rate", label: "Respiratory Rate", unit: "breaths/min" },
  { value: "oxygen_saturation", label: "Oxygen Saturation", unit: "%" },
  { value: "weight", label: "Weight", unit: "kg" },
  { value: "height", label: "Height", unit: "cm" },
  { value: "bmi", label: "BMI", unit: "kg/m²" },
  { value: "glucose", label: "Blood Glucose", unit: "mg/dL" },
];

export function LabResultsVitals({ accessToken }: { accessToken: string }) {
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedVitalType, setSelectedVitalType] = useState("blood_pressure_systolic");
  const [isAddLabOpen, setIsAddLabOpen] = useState(false);
  const [isAddVitalOpen, setIsAddVitalOpen] = useState(false);

  const [newLab, setNewLab] = useState<Partial<LabResult>>({
    testName: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    orderedBy: "",
    facility: "",
    status: "completed",
    results: [],
    notes: "",
  });

  const [newVital, setNewVital] = useState<Partial<VitalSign>>({
    type: "blood_pressure_systolic",
    value: 0,
    unit: "mmHg",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    notes: "",
    recordedBy: "Self",
  });

  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const projectId = "cvsxfzllhhhpdyckdmqg";

  useEffect(() => {
    fetchData();
  }, []);

  // Trend Badge Component
  const TrendBadge = ({
    direction,
    percentChange,
    inverse = false,
  }: {
    direction: "up" | "down" | "stable";
    percentChange: number;
    inverse?: boolean;
  }) => {
    const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;
    const isGood = inverse
      ? direction === "down" || direction === "stable"
      : direction === "up" || direction === "stable";
    const colorClass = isGood
      ? "text-green-600 bg-green-50"
      : "text-red-600 bg-red-50";
    const stableClass = "text-gray-600 bg-gray-50";

    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
          direction === "stable" ? stableClass : colorClass
        }`}
      >
        <Icon className="h-3 w-3" />
        <span>
          {direction === "stable" ? "Stable" : `${Math.abs(percentChange)}%`}
        </span>
      </div>
    );
  };

  // Calculate trend for a specific vital type
  const calculateVitalTrend = (vitalType: string, periodDays: number = 7) => {
    const filteredVitals = vitals
      .filter((v) => v.type === vitalType)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (filteredVitals.length < 2) {
      return null;
    }

    const now = new Date();
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(
      now.getTime() - periodDays * 2 * 24 * 60 * 60 * 1000
    );

    const currentPeriod = filteredVitals.filter(
      (v) => new Date(v.date) >= periodStart && new Date(v.date) <= now
    );
    const previousPeriod = filteredVitals.filter(
      (v) =>
        new Date(v.date) >= previousPeriodStart &&
        new Date(v.date) < periodStart
    );

    if (currentPeriod.length === 0 || previousPeriod.length === 0) {
      return null;
    }

    const currentAvg =
      currentPeriod.reduce((sum, v) => sum + v.value, 0) / currentPeriod.length;
    const previousAvg =
      previousPeriod.reduce((sum, v) => sum + v.value, 0) / previousPeriod.length;

    const change = currentAvg - previousAvg;
    const percentChange = previousAvg !== 0 ? (change / previousAvg) * 100 : 0;

    let direction: "up" | "down" | "stable";
    if (Math.abs(percentChange) < 5) {
      direction = "stable";
    } else if (change > 0) {
      direction = "up";
    } else {
      direction = "down";
    }

    return {
      direction,
      percentChange: Math.round(Math.abs(percentChange)),
      currentAvg: Math.round(currentAvg * 10) / 10,
      previousAvg: Math.round(previousAvg * 10) / 10,
    };
  };

  // Get latest vital value
  const getLatestVital = (vitalType: string) => {
    const filtered = vitals
      .filter((v) => v.type === vitalType)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return filtered[0] || null;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [labResponse, vitalsResponse] = await Promise.all([
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/lab-results`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        ),
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/vitals`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        ),
      ]);

      if (labResponse.ok) {
        const labData = await labResponse.json();
        setLabResults(labData.labResults || []);
      }

      if (vitalsResponse.ok) {
        const vitalsData = await vitalsResponse.json();
        setVitals(vitalsData.vitals || []);
      }
    } catch (error) {
      toast.error("Failed to load data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLab = async () => {
    if (!newLab.testName || !newLab.category || !newLab.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/lab-results`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...newLab, results: testResults }),
        }
      );

      if (response.ok) {
        toast.success("Lab result added successfully");
        setIsAddLabOpen(false);
        setNewLab({
          testName: "",
          category: "",
          date: new Date().toISOString().split("T")[0],
          orderedBy: "",
          facility: "",
          status: "completed",
          results: [],
          notes: "",
        });
        setTestResults([]);
        fetchData();
      } else {
        toast.error("Failed to add lab result");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const handleAddVital = async () => {
    if (!newVital.type || !newVital.value || !newVital.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/vitals`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newVital),
        }
      );

      if (response.ok) {
        toast.success("Vital sign added successfully");
        setIsAddVitalOpen(false);
        setNewVital({
          type: "blood_pressure_systolic",
          value: 0,
          unit: "mmHg",
          date: new Date().toISOString().split("T")[0],
          time: new Date().toTimeString().slice(0, 5),
          notes: "",
          recordedBy: "Self",
        });
        fetchData();
      } else {
        toast.error("Failed to add vital sign");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const addTestResult = () => {
    setTestResults([
      ...testResults,
      { name: "", value: "", unit: "", referenceRange: "", flag: "normal" },
    ]);
  };

  const updateTestResult = (index: number, field: keyof TestResult, value: string) => {
    const updated = [...testResults];
    updated[index] = { ...updated[index], [field]: value };
    setTestResults(updated);
  };

  const removeTestResult = (index: number) => {
    setTestResults(testResults.filter((_, i) => i !== index));
  };

  const filteredLabResults = labResults.filter((lab) => {
    const matchesSearch =
      lab.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.facility.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.orderedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || lab.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getVitalChartData = (vitalType: string) => {
    return vitals
      .filter((v) => v.type === vitalType)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((v) => ({
        date: new Date(v.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: v.value,
      }));
  };

  const getFlagIcon = (flag: string) => {
    switch (flag) {
      case "normal":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "high":
      case "low":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getFlagBadge = (flag: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      normal: "secondary",
      high: "default",
      low: "default",
      critical: "destructive",
    };
    return (
      <Badge variant={variants[flag] || "secondary"} className="ml-2">
        {flag.toUpperCase()}
      </Badge>
    );
  };

  // Get previous lab result for comparison
  const getPreviousLabResult = (currentLab: LabResult, resultName: string) => {
    const previousLabs = labResults
      .filter(
        (lab) =>
          lab.testName === currentLab.testName &&
          lab.id !== currentLab.id &&
          new Date(lab.date) < new Date(currentLab.date) &&
          lab.status === "completed"
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (previousLabs.length === 0) return null;

    const previousResult = previousLabs[0].results.find((r) => r.name === resultName);
    return previousResult || null;
  };

  // Calculate trend for lab result value
  const calculateLabResultTrend = (
    currentValue: string,
    previousValue: string,
    flag: string
  ) => {
    const current = parseFloat(currentValue);
    const previous = parseFloat(previousValue);

    if (isNaN(current) || isNaN(previous)) return null;

    const change = current - previous;
    const percentChange = previous !== 0 ? Math.abs((change / previous) * 100) : 0;

    let direction: "up" | "down" | "stable";
    if (Math.abs(percentChange) < 3) {
      direction = "stable";
    } else if (change > 0) {
      direction = "up";
    } else {
      direction = "down";
    }

    // Determine if this is an inverse metric (lower is better)
    const isInverse = flag === "high" || flag === "critical";

    return {
      direction,
      percentChange: Math.round(percentChange),
      isInverse,
    };
  };

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
          <h2 className="text-3xl font-bold tracking-tight">Lab Results & Vital Signs</h2>
          <p className="text-muted-foreground">
            Track lab results and monitor vital signs over time
          </p>
        </div>
      </div>

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="labs">Lab Results</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Select value={selectedVitalType} onValueChange={setSelectedVitalType}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Select vital sign" />
              </SelectTrigger>
              <SelectContent>
                {VITAL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={isAddVitalOpen} onOpenChange={setIsAddVitalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vital Sign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Vital Sign</DialogTitle>
                  <DialogDescription>
                    Record a new vital sign measurement
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="vital-type">Type</Label>
                    <Select
                      value={newVital.type}
                      onValueChange={(value) => {
                        const type = VITAL_TYPES.find((t) => t.value === value);
                        setNewVital({ ...newVital, type: value, unit: type?.unit || "" });
                      }}
                    >
                      <SelectTrigger id="vital-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {VITAL_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vital-value">Value</Label>
                      <Input
                        id="vital-value"
                        type="number"
                        step="0.1"
                        value={newVital.value || ""}
                        onChange={(e) =>
                          setNewVital({ ...newVital, value: parseFloat(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="vital-unit">Unit</Label>
                      <Input
                        id="vital-unit"
                        value={newVital.unit}
                        onChange={(e) =>
                          setNewVital({ ...newVital, unit: e.target.value })
                        }
                        disabled
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vital-date">Date</Label>
                      <Input
                        id="vital-date"
                        type="date"
                        value={newVital.date}
                        onChange={(e) =>
                          setNewVital({ ...newVital, date: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="vital-time">Time</Label>
                      <Input
                        id="vital-time"
                        type="time"
                        value={newVital.time}
                        onChange={(e) =>
                          setNewVital({ ...newVital, time: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vital-recorded-by">Recorded By</Label>
                    <Input
                      id="vital-recorded-by"
                      value={newVital.recordedBy}
                      onChange={(e) =>
                        setNewVital({ ...newVital, recordedBy: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="vital-notes">Notes</Label>
                    <Textarea
                      id="vital-notes"
                      value={newVital.notes}
                      onChange={(e) =>
                        setNewVital({ ...newVital, notes: e.target.value })
                      }
                      placeholder="Any additional notes..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddVitalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddVital}>Add Vital Sign</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {VITAL_TYPES.slice(0, 4).map((vitalType) => {
              const latest = getLatestVital(vitalType.value);
              const trend = calculateVitalTrend(vitalType.value);
              const isInverse =
                vitalType.value === "blood_pressure_systolic" ||
                vitalType.value === "blood_pressure_diastolic" ||
                vitalType.value === "glucose" ||
                vitalType.value === "weight";

              return (
                <Card key={vitalType.value}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {vitalType.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {latest ? (
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">
                          {latest.value} {vitalType.unit}
                        </div>
                        {trend && (
                          <div className="flex items-center gap-2">
                            <TrendBadge
                              direction={trend.direction}
                              percentChange={trend.percentChange}
                              inverse={isInverse}
                            />
                            <span className="text-xs text-muted-foreground">
                              vs last week
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(latest.date).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No data</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {VITAL_TYPES.find((t) => t.value === selectedVitalType)?.label} Trend
              </CardTitle>
              <CardDescription>Historical measurements over time</CardDescription>
            </CardHeader>
            <CardContent>
              {getVitalChartData(selectedVitalType).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={getVitalChartData(selectedVitalType)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No data available for this vital sign
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vitals
              .filter((v) => v.type === selectedVitalType)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 6)
              .map((vital, index, array) => {
                const previousVital = array[index + 1];
                const isInverse =
                  vital.type === "blood_pressure_systolic" ||
                  vital.type === "blood_pressure_diastolic" ||
                  vital.type === "glucose" ||
                  vital.type === "weight";

                let trendInfo = null;
                if (previousVital) {
                  const change = vital.value - previousVital.value;
                  const percentChange =
                    previousVital.value !== 0
                      ? Math.abs((change / previousVital.value) * 100)
                      : 0;

                  let direction: "up" | "down" | "stable";
                  if (Math.abs(percentChange) < 3) {
                    direction = "stable";
                  } else if (change > 0) {
                    direction = "up";
                  } else {
                    direction = "down";
                  }

                  trendInfo = {
                    direction,
                    percentChange: Math.round(percentChange),
                  };
                }

                return (
                  <Card key={vital.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {new Date(vital.date).toLocaleDateString()}
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between">
                        <div className="text-2xl font-bold">
                          {vital.value} {vital.unit}
                        </div>
                        {trendInfo && (
                          <TrendBadge
                            direction={trendInfo.direction}
                            percentChange={trendInfo.percentChange}
                            inverse={isInverse}
                          />
                        )}
                      </div>
                      {vital.time && (
                        <p className="text-xs text-muted-foreground mt-1">{vital.time}</p>
                      )}
                      {vital.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{vital.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        By: {vital.recordedBy}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="labs" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center flex-1">
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lab results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {LAB_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isAddLabOpen} onOpenChange={setIsAddLabOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lab Result
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Lab Result</DialogTitle>
                  <DialogDescription>
                    Record a new lab test result
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="lab-test-name">Test Name</Label>
                    <Input
                      id="lab-test-name"
                      value={newLab.testName}
                      onChange={(e) =>
                        setNewLab({ ...newLab, testName: e.target.value })
                      }
                      placeholder="e.g., Complete Blood Count"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lab-category">Category</Label>
                    <Select
                      value={newLab.category}
                      onValueChange={(value) =>
                        setNewLab({ ...newLab, category: value })
                      }
                    >
                      <SelectTrigger id="lab-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {LAB_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lab-date">Date</Label>
                      <Input
                        id="lab-date"
                        type="date"
                        value={newLab.date}
                        onChange={(e) =>
                          setNewLab({ ...newLab, date: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="lab-status">Status</Label>
                      <Select
                        value={newLab.status}
                        onValueChange={(value: any) =>
                          setNewLab({ ...newLab, status: value })
                        }
                      >
                        <SelectTrigger id="lab-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lab-ordered-by">Ordered By</Label>
                      <Input
                        id="lab-ordered-by"
                        value={newLab.orderedBy}
                        onChange={(e) =>
                          setNewLab({ ...newLab, orderedBy: e.target.value })
                        }
                        placeholder="Dr. Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lab-facility">Facility</Label>
                      <Input
                        id="lab-facility"
                        value={newLab.facility}
                        onChange={(e) =>
                          setNewLab({ ...newLab, facility: e.target.value })
                        }
                        placeholder="Lab facility name"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Test Results</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addTestResult}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Result
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {testResults.map((result, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="col-span-2">
                                <Label>Test Name</Label>
                                <Input
                                  value={result.name}
                                  onChange={(e) =>
                                    updateTestResult(index, "name", e.target.value)
                                  }
                                  placeholder="e.g., Hemoglobin"
                                />
                              </div>
                              <div>
                                <Label>Value</Label>
                                <Input
                                  value={result.value}
                                  onChange={(e) =>
                                    updateTestResult(index, "value", e.target.value)
                                  }
                                  placeholder="e.g., 14.5"
                                />
                              </div>
                              <div>
                                <Label>Unit</Label>
                                <Input
                                  value={result.unit}
                                  onChange={(e) =>
                                    updateTestResult(index, "unit", e.target.value)
                                  }
                                  placeholder="e.g., g/dL"
                                />
                              </div>
                              <div>
                                <Label>Reference Range</Label>
                                <Input
                                  value={result.referenceRange}
                                  onChange={(e) =>
                                    updateTestResult(
                                      index,
                                      "referenceRange",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g., 12-16"
                                />
                              </div>
                              <div>
                                <Label>Flag</Label>
                                <Select
                                  value={result.flag}
                                  onValueChange={(value: any) =>
                                    updateTestResult(index, "flag", value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="mt-2"
                              onClick={() => removeTestResult(index)}
                            >
                              Remove
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="lab-notes">Notes</Label>
                    <Textarea
                      id="lab-notes"
                      value={newLab.notes}
                      onChange={(e) =>
                        setNewLab({ ...newLab, notes: e.target.value })
                      }
                      placeholder="Any additional notes..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddLabOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddLab}>Add Lab Result</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {filteredLabResults.map((lab) => (
              <Card key={lab.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{lab.testName}</CardTitle>
                      <CardDescription>
                        {lab.category} • {new Date(lab.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        lab.status === "completed"
                          ? "secondary"
                          : lab.status === "pending"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {lab.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Ordered by:</span>{" "}
                        {lab.orderedBy}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Facility:</span>{" "}
                        {lab.facility}
                      </div>
                    </div>

                    {lab.results && lab.results.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Results:</h4>
                        <div className="space-y-2">
                          {lab.results.map((result, idx) => {
                            const previousResult = getPreviousLabResult(lab, result.name);
                            const trendInfo = previousResult
                              ? calculateLabResultTrend(
                                  result.value,
                                  previousResult.value,
                                  result.flag
                                )
                              : null;

                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  {getFlagIcon(result.flag)}
                                  <div>
                                    <div className="font-medium">{result.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      Reference: {result.referenceRange}
                                    </div>
                                    {previousResult && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        Previous: {previousResult.value} {previousResult.unit}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                  <div className="font-semibold">
                                    {result.value} {result.unit}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {getFlagBadge(result.flag)}
                                    {trendInfo && (
                                      <TrendBadge
                                        direction={trendInfo.direction}
                                        percentChange={trendInfo.percentChange}
                                        inverse={trendInfo.isInverse}
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {lab.notes && (
                      <div className="text-sm">
                        <span className="font-medium">Notes:</span> {lab.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredLabResults.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
                  No lab results found
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
