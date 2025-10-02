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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar, Plus, TrendingUp, Droplet, AlertCircle } from "lucide-react";

interface PeriodEntry {
  id: string;
  startDate: string;
  endDate?: string;
  flow: "light" | "moderate" | "heavy" | "spotting";
  symptoms: string[];
  notes: string;
  cycleDay?: number;
  cycleLength?: number;
  createdAt: string;
}

const COMMON_SYMPTOMS = [
  "Cramps",
  "Headache",
  "Bloating",
  "Mood swings",
  "Fatigue",
  "Back pain",
  "Breast tenderness",
  "Nausea",
  "Acne",
  "Food cravings",
];

export function PeriodTracking({ accessToken }: { accessToken: string }) {
  const [periods, setPeriods] = useState<PeriodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newPeriod, setNewPeriod] = useState<Partial<PeriodEntry>>({
    startDate: new Date().toISOString().split("T")[0],
    flow: "moderate",
    symptoms: [],
    notes: "",
  });

  const projectId = "cvsxfzllhhhpdyckdmqg";

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/periods`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPeriods(data.periods || []);
      }
    } catch (error) {
      toast.error("Failed to load period data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPeriod = async () => {
    if (!newPeriod.startDate || !newPeriod.flow) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/periods`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPeriod),
        }
      );

      if (response.ok) {
        toast.success("Period entry added successfully");
        setIsAddOpen(false);
        setNewPeriod({
          startDate: new Date().toISOString().split("T")[0],
          flow: "moderate",
          symptoms: [],
          notes: "",
        });
        fetchPeriods();
      } else {
        toast.error("Failed to add period entry");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const toggleSymptom = (symptom: string) => {
    const currentSymptoms = newPeriod.symptoms || [];
    if (currentSymptoms.includes(symptom)) {
      setNewPeriod({
        ...newPeriod,
        symptoms: currentSymptoms.filter((s) => s !== symptom),
      });
    } else {
      setNewPeriod({
        ...newPeriod,
        symptoms: [...currentSymptoms, symptom],
      });
    }
  };

  const calculateAverageCycle = () => {
    if (periods.length < 2) return null;
    const cycles = periods.slice(0, -1).map((period, index) => {
      const nextPeriod = periods[index + 1];
      const start = new Date(period.startDate);
      const nextStart = new Date(nextPeriod.startDate);
      return Math.abs(
        Math.floor((nextStart.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      );
    });
    const average = cycles.reduce((a, b) => a + b, 0) / cycles.length;
    return Math.round(average);
  };

  const getFlowColor = (flow: string) => {
    switch (flow) {
      case "light":
        return "bg-pink-100 text-pink-800";
      case "moderate":
        return "bg-red-100 text-red-800";
      case "heavy":
        return "bg-red-200 text-red-900";
      case "spotting":
        return "bg-pink-50 text-pink-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  const averageCycle = calculateAverageCycle();

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Period Tracking</h2>
          <p className="text-muted-foreground">
            Track your menstrual cycle, symptoms, and patterns
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Period
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Period Entry</DialogTitle>
              <DialogDescription>
                Record your period start date, flow, and symptoms
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newPeriod.startDate}
                  onChange={(e) =>
                    setNewPeriod({ ...newPeriod, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date (Optional)</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newPeriod.endDate || ""}
                  onChange={(e) =>
                    setNewPeriod({ ...newPeriod, endDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="flow">Flow Intensity</Label>
                <Select
                  value={newPeriod.flow}
                  onValueChange={(value: any) =>
                    setNewPeriod({ ...newPeriod, flow: value })
                  }
                >
                  <SelectTrigger id="flow">
                    <SelectValue placeholder="Select flow" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spotting">Spotting</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="heavy">Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Symptoms</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {COMMON_SYMPTOMS.map((symptom) => (
                    <Badge
                      key={symptom}
                      variant={
                        newPeriod.symptoms?.includes(symptom)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleSymptom(symptom)}
                    >
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newPeriod.notes}
                  onChange={(e) =>
                    setNewPeriod({ ...newPeriod, notes: e.target.value })
                  }
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPeriod}>Log Period</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cycles Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periods.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Cycle Length
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageCycle ? `${averageCycle} days` : "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next Expected Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {periods.length > 0 && averageCycle
                ? new Date(
                    new Date(periods[0].startDate).getTime() +
                      averageCycle * 24 * 60 * 60 * 1000
                  ).toLocaleDateString()
                : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Period History</h3>
        {periods.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {periods.map((period) => (
              <Card key={period.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {new Date(period.startDate).toLocaleDateString()}
                    </CardTitle>
                    <Droplet className="h-4 w-4 text-red-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getFlowColor(period.flow)}>
                      {period.flow}
                    </Badge>
                    {period.endDate && (
                      <span className="text-xs text-muted-foreground">
                        {Math.ceil(
                          (new Date(period.endDate).getTime() -
                            new Date(period.startDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </span>
                    )}
                  </div>
                  {period.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {period.symptoms.map((symptom) => (
                        <Badge key={symptom} variant="outline" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {period.notes && (
                    <p className="text-sm text-muted-foreground">{period.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Calendar className="h-8 w-8 mb-2" />
              <p>No period entries yet. Start tracking your cycle!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
