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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Smile,
  Meh,
  Frown,
  Calendar,
  Search,
  Brain,
  Heart,
  Activity,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

interface SymptomEntry {
  id: string;
  date: string;
  time: string;
  category: string;

  // Mental Health Symptoms
  mentalHealthSymptoms: string[];
  anxietyLevel: number;
  depressionLevel: number;
  dissociationLevel: number;
  panicSymptoms: string[];
  ptsdSymptoms: string[];

  // Physical Symptoms
  physicalSymptoms: string[];
  painLocations: string[];
  painScale: number;
  fatigueLevel: number;

  // EDS/Hypermobility Symptoms
  edsSymptoms: string[];
  jointSymptoms: string[];
  subluxations: string[];

  // Migraine Symptoms
  migraineSymptoms: string[];
  migrainePhase: string;
  auraSymptoms: string[];

  // Hormonal Tracking
  hormonalSymptoms: string[];
  menstrualCycleDay?: number;
  menstrualFlow?: string;

  // General
  mood: string;
  sleepQuality: number;
  stressLevel: number;
  triggers: string[];
  duration: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Mental Health Symptom Categories
const DEPRESSION_SYMPTOMS = [
  "Persistent sadness",
  "Loss of interest/pleasure",
  "Fatigue/low energy",
  "Sleep disturbances (insomnia/hypersomnia)",
  "Appetite changes",
  "Difficulty concentrating",
  "Feelings of worthlessness/guilt",
  "Psychomotor agitation/retardation",
  "Suicidal thoughts",
  "Anhedonia",
  "Social withdrawal",
  "Crying spells",
  "Hopelessness",
];

const ANXIETY_SYMPTOMS = [
  "Excessive worry",
  "Restlessness",
  "Difficulty concentrating",
  "Irritability",
  "Muscle tension",
  "Sleep disturbances",
  "Racing thoughts",
  "Feeling on edge",
  "Difficulty breathing",
  "Rapid heartbeat",
  "Sweating",
  "Trembling",
  "Nausea",
  "Dizziness",
  "Fear of losing control",
];

const PANIC_SYMPTOMS = [
  "Sudden intense fear",
  "Palpitations/pounding heart",
  "Sweating",
  "Trembling/shaking",
  "Shortness of breath",
  "Chest pain/discomfort",
  "Nausea/abdominal distress",
  "Dizziness/lightheadedness",
  "Chills or heat sensations",
  "Numbness/tingling",
  "Derealization/depersonalization",
  "Fear of dying",
  "Fear of losing control/going crazy",
];

const PTSD_SYMPTOMS = [
  "Intrusive memories/flashbacks",
  "Nightmares",
  "Avoidance of reminders",
  "Negative thoughts/feelings",
  "Emotional numbness",
  "Hypervigilance",
  "Exaggerated startle response",
  "Difficulty sleeping",
  "Irritability/angry outbursts",
  "Difficulty concentrating",
  "Self-destructive behavior",
  "Dissociation",
];

const COMPLEX_PTSD_SYMPTOMS = [
  "Emotional dysregulation",
  "Negative self-perception",
  "Relationship difficulties",
  "Loss of systems of meaning",
  "Chronic feelings of guilt/shame",
  "Difficulty trusting others",
  "Feeling permanently damaged",
  "Sense of separation from others",
  "Difficulty with emotional intimacy",
  "Persistent negative beliefs",
];

// Physical Symptom Categories
const EDS_HYPERMOBILITY_SYMPTOMS = [
  "Joint hypermobility",
  "Joint instability",
  "Frequent subluxations/dislocations",
  "Joint pain",
  "Soft/velvety skin",
  "Skin hyperextensibility",
  "Easy bruising",
  "Slow wound healing",
  "Hernias",
  "Organ prolapse",
  "Chronic fatigue",
  "POTS symptoms (dizziness on standing)",
  "Dysautonomia",
  "GI issues (IBS, gastroparesis)",
  "Mast cell activation symptoms",
];

const JOINT_LOCATIONS = [
  "Neck",
  "Jaw/TMJ",
  "Shoulders",
  "Elbows",
  "Wrists",
  "Fingers",
  "Spine (upper)",
  "Spine (mid)",
  "Spine (lower)",
  "Hips",
  "SI joints",
  "Knees",
  "Ankles",
  "Toes",
  "Ribs",
];

const MIGRAINE_SYMPTOMS = [
  "Throbbing/pulsating headache",
  "Unilateral head pain",
  "Nausea",
  "Vomiting",
  "Light sensitivity (photophobia)",
  "Sound sensitivity (phonophobia)",
  "Smell sensitivity",
  "Neck pain/stiffness",
  "Blurred vision",
  "Vertigo/dizziness",
  "Brain fog",
  "Difficulty speaking",
  "Scalp tenderness",
];

const AURA_SYMPTOMS = [
  "Visual disturbances (zigzag lines, flashing lights)",
  "Blind spots (scotoma)",
  "Tunnel vision",
  "Numbness/tingling",
  "Speech/language difficulties",
  "Motor weakness",
  "Confusion",
  "Auditory hallucinations",
];

const MIGRAINE_PHASES = [
  "Prodrome (warning phase)",
  "Aura",
  "Headache phase",
  "Postdrome (hangover phase)",
];

// Hormonal Symptom Categories
const FEMALE_HORMONAL_SYMPTOMS = [
  "Menstrual cramps",
  "Heavy bleeding",
  "Light bleeding/spotting",
  "Breast tenderness",
  "Bloating",
  "Mood swings",
  "Irritability",
  "Food cravings",
  "Acne",
  "Hot flashes",
  "Night sweats",
  "Vaginal dryness",
  "Low libido",
  "Irregular periods",
  "PMS symptoms",
  "PMDD symptoms",
];

const MALE_HORMONAL_SYMPTOMS = [
  "Low libido",
  "Erectile dysfunction",
  "Fatigue",
  "Mood changes/irritability",
  "Depression",
  "Difficulty concentrating",
  "Reduced muscle mass",
  "Increased body fat",
  "Decreased bone density",
  "Hot flashes",
  "Sleep disturbances",
  "Gynecomastia",
];

const MENSTRUAL_FLOW_OPTIONS = [
  "None",
  "Spotting",
  "Light",
  "Medium",
  "Heavy",
  "Very Heavy",
];

const COMMON_TRIGGERS = [
  "Stress",
  "Lack of sleep",
  "Skipped meals",
  "Dehydration",
  "Weather changes",
  "Bright lights",
  "Strong smells",
  "Loud noises",
  "Caffeine",
  "Alcohol",
  "Certain foods",
  "Hormonal changes",
  "Physical exertion",
  "Emotional distress",
  "Screen time",
  "Temperature changes",
];

const MOOD_OPTIONS = [
  "Excellent",
  "Good",
  "Fair",
  "Low",
  "Very Low",
  "Irritable",
  "Anxious",
  "Depressed",
  "Numb",
];

export function SymptomTracking({ accessToken }: { accessToken: string }) {
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newSymptom, setNewSymptom] = useState<Partial<SymptomEntry>>({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    category: "mental-health",
    mentalHealthSymptoms: [],
    anxietyLevel: 0,
    depressionLevel: 0,
    dissociationLevel: 0,
    panicSymptoms: [],
    ptsdSymptoms: [],
    physicalSymptoms: [],
    painLocations: [],
    painScale: 0,
    fatigueLevel: 0,
    edsSymptoms: [],
    jointSymptoms: [],
    subluxations: [],
    migraineSymptoms: [],
    migrainePhase: "",
    auraSymptoms: [],
    hormonalSymptoms: [],
    mood: "Fair",
    sleepQuality: 5,
    stressLevel: 5,
    triggers: [],
    duration: "",
    notes: "",
  });

  const projectId = "cvsxfzllhhhpdyckdmqg";

  // Trend Badge Component
  const TrendBadge = ({
    direction,
    percentChange,
    inverse = false
  }: {
    direction: 'up' | 'down' | 'stable';
    percentChange: number;
    inverse?: boolean;
  }) => {
    // For metrics where lower is better (stress, anxiety, pain), inverse the color logic
    const isGood = inverse
      ? direction === 'down' || direction === 'stable'
      : direction === 'up' || direction === 'stable';

    const Icon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;
    const color = direction === 'stable'
      ? 'text-gray-500'
      : isGood
        ? 'text-green-600'
        : 'text-red-600';

    if (direction === 'stable') {
      return (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Minus className="h-3 w-3" />
          <span>Stable</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-1 text-xs font-medium ${color}`}>
        <Icon className="h-3 w-3" />
        <span>{Math.abs(percentChange).toFixed(0)}%</span>
      </div>
    );
  };

  // Trend calculation helpers
  const calculateTrend = (
    metric: keyof SymptomEntry,
    symptoms: SymptomEntry[],
    periodDays: number = 7
  ): { value: number; change: number; direction: 'up' | 'down' | 'stable'; percentChange: number } => {
    const now = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - periodDays);
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (periodDays * 2));

    const currentPeriod = symptoms.filter(s => {
      const date = new Date(s.date);
      return date >= periodStart && date <= now;
    });

    const previousPeriod = symptoms.filter(s => {
      const date = new Date(s.date);
      return date >= previousPeriodStart && date < periodStart;
    });

    const currentAvg = currentPeriod.length > 0
      ? currentPeriod.reduce((sum, s) => sum + (Number(s[metric]) || 0), 0) / currentPeriod.length
      : 0;

    const previousAvg = previousPeriod.length > 0
      ? previousPeriod.reduce((sum, s) => sum + (Number(s[metric]) || 0), 0) / previousPeriod.length
      : 0;

    const change = currentAvg - previousAvg;
    const percentChange = previousAvg > 0 ? (change / previousAvg) * 100 : 0;

    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(percentChange) < 5) {
      direction = 'stable';
    } else if (change > 0) {
      direction = 'up';
    } else {
      direction = 'down';
    }

    return { value: currentAvg, change, direction, percentChange };
  };

  const getSymptomFrequencyTrend = (periodDays: number = 7): {
    current: number;
    previous: number;
    change: number;
    percentChange: number;
    direction: 'up' | 'down' | 'stable';
  } => {
    const now = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - periodDays);
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (periodDays * 2));

    const currentCount = symptoms.filter(s => {
      const date = new Date(s.date);
      return date >= periodStart && date <= now;
    }).length;

    const previousCount = symptoms.filter(s => {
      const date = new Date(s.date);
      return date >= previousPeriodStart && date < periodStart;
    }).length;

    const change = currentCount - previousCount;
    const percentChange = previousCount > 0 ? (change / previousCount) * 100 : 0;

    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(percentChange) < 10) {
      direction = 'stable';
    } else if (change > 0) {
      direction = 'up';
    } else {
      direction = 'down';
    }

    return { current: currentCount, previous: previousCount, change, percentChange, direction };
  };

  useEffect(() => {
    fetchSymptoms();
  }, []);

  const fetchSymptoms = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/symptoms`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSymptoms(data.symptoms || []);
      }
    } catch (error) {
      toast.error("Failed to load symptoms");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSymptom = async () => {
    if (!newSymptom.date) {
      toast.error("Please select a date");
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/symptoms`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newSymptom),
        }
      );

      if (response.ok) {
        toast.success("Symptom log added successfully");
        setIsAddOpen(false);
        resetForm();
        fetchSymptoms();
      } else {
        toast.error("Failed to add symptom log");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const handleDeleteSymptom = async (id: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/symptoms/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        toast.success("Symptom deleted");
        fetchSymptoms();
      } else {
        toast.error("Failed to delete symptom");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter((i) => i !== item);
    }
    return [...array, item];
  };

  const resetForm = () => {
    setNewSymptom({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      category: "mental-health",
      mentalHealthSymptoms: [],
      anxietyLevel: 0,
      depressionLevel: 0,
      dissociationLevel: 0,
      panicSymptoms: [],
      ptsdSymptoms: [],
      physicalSymptoms: [],
      painLocations: [],
      painScale: 0,
      fatigueLevel: 0,
      edsSymptoms: [],
      jointSymptoms: [],
      subluxations: [],
      migraineSymptoms: [],
      migrainePhase: "",
      auraSymptoms: [],
      hormonalSymptoms: [],
      mood: "Fair",
      sleepQuality: 5,
      stressLevel: 5,
      triggers: [],
      duration: "",
      notes: "",
    });
  };

  const filteredSymptoms = symptoms.filter((symptom) => {
    const matchesSearch =
      symptom.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      symptom.mood?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || symptom.category === categoryFilter;

    let matchesDate = true;
    if (dateFilter !== "all") {
      const symptomDate = new Date(symptom.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === "today") {
        matchesDate = symptomDate >= today;
      } else if (dateFilter === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = symptomDate >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = symptomDate >= monthAgo;
      }
    }

    return matchesSearch && matchesDate && matchesCategory;
  });

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
          <h2 className="text-3xl font-bold tracking-tight">Symptom Tracking</h2>
          <p className="text-muted-foreground">
            Comprehensive tracking for mental health, chronic conditions, and hormonal changes
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{symptoms.length}</div>
              {(() => {
                const trend = getSymptomFrequencyTrend(7);
                return trend.current > 0 && <TrendBadge direction={trend.direction} percentChange={trend.percentChange} inverse={false} />;
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const trend = getSymptomFrequencyTrend(7);
                return trend.previous > 0
                  ? `${trend.change > 0 ? '+' : ''}${trend.change} from last week`
                  : 'Last 7 days';
              })()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Anxiety</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">
                {(() => {
                  const trend = calculateTrend('anxietyLevel', symptoms, 7);
                  return trend.value > 0 ? trend.value.toFixed(1) : '0';
                })()}
                /10
              </div>
              {(() => {
                const trend = calculateTrend('anxietyLevel', symptoms, 7);
                return trend.value > 0 && <TrendBadge direction={trend.direction} percentChange={trend.percentChange} inverse={true} />;
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const trend = calculateTrend('anxietyLevel', symptoms, 7);
                if (trend.value === 0) return 'No data this week';
                const isImproving = trend.direction === 'down' || trend.direction === 'stable';
                return isImproving
                  ? trend.direction === 'stable'
                    ? 'Holding steady'
                    : 'Improving ✓'
                  : 'Needs attention';
              })()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Stress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">
                {(() => {
                  const trend = calculateTrend('stressLevel', symptoms, 7);
                  return trend.value > 0 ? trend.value.toFixed(1) : '0';
                })()}
                /10
              </div>
              {(() => {
                const trend = calculateTrend('stressLevel', symptoms, 7);
                return trend.value > 0 && <TrendBadge direction={trend.direction} percentChange={trend.percentChange} inverse={true} />;
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const trend = calculateTrend('stressLevel', symptoms, 7);
                if (trend.value === 0) return 'No data this week';
                const isImproving = trend.direction === 'down' || trend.direction === 'stable';
                return isImproving
                  ? trend.direction === 'stable'
                    ? 'Holding steady'
                    : 'Decreasing ✓'
                  : 'Increasing';
              })()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Sleep</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">
                {(() => {
                  const trend = calculateTrend('sleepQuality', symptoms, 7);
                  return trend.value > 0 ? trend.value.toFixed(1) : '0';
                })()}
                /10
              </div>
              {(() => {
                const trend = calculateTrend('sleepQuality', symptoms, 7);
                return trend.value > 0 && <TrendBadge direction={trend.direction} percentChange={trend.percentChange} inverse={false} />;
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const trend = calculateTrend('sleepQuality', symptoms, 7);
                if (trend.value === 0) return 'No data this week';
                const isImproving = trend.direction === 'up' || trend.direction === 'stable';
                return isImproving
                  ? trend.direction === 'stable'
                    ? 'Consistent quality'
                    : 'Improving ✓'
                  : 'Declining';
              })()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Symptom Insights Card */}
      {symptoms.length > 0 && (() => {
        const anxietyTrend = calculateTrend('anxietyLevel', symptoms, 7);
        const depressionTrend = calculateTrend('depressionLevel', symptoms, 7);
        const stressTrend = calculateTrend('stressLevel', symptoms, 7);
        const painTrend = calculateTrend('painScale', symptoms, 7);
        const sleepTrend = calculateTrend('sleepQuality', symptoms, 7);
        const frequencyTrend = getSymptomFrequencyTrend(7);

        const insights: { type: 'positive' | 'warning' | 'info'; message: string }[] = [];

        // Frequency insights
        if (frequencyTrend.direction === 'up' && Math.abs(frequencyTrend.percentChange) > 20) {
          insights.push({
            type: 'warning',
            message: `Symptom logging increased by ${Math.abs(frequencyTrend.percentChange).toFixed(0)}% this week - you may be experiencing more symptoms than usual.`
          });
        } else if (frequencyTrend.direction === 'down' && Math.abs(frequencyTrend.percentChange) > 15) {
          insights.push({
            type: 'positive',
            message: `Great news! Symptom frequency decreased by ${Math.abs(frequencyTrend.percentChange).toFixed(0)}% this week.`
          });
        }

        // Anxiety insights
        if (anxietyTrend.direction === 'down' && Math.abs(anxietyTrend.percentChange) > 15) {
          insights.push({
            type: 'positive',
            message: `Anxiety levels improved by ${Math.abs(anxietyTrend.percentChange).toFixed(0)}% compared to last week. Keep up the great work!`
          });
        } else if (anxietyTrend.direction === 'up' && Math.abs(anxietyTrend.percentChange) > 20) {
          insights.push({
            type: 'warning',
            message: `Anxiety levels increased ${Math.abs(anxietyTrend.percentChange).toFixed(0)}% this week. Consider reaching out to your care team.`
          });
        }

        // Depression insights
        if (depressionTrend.direction === 'down' && Math.abs(depressionTrend.percentChange) > 15) {
          insights.push({
            type: 'positive',
            message: `Depression symptoms decreased by ${Math.abs(depressionTrend.percentChange).toFixed(0)}%. Progress is being made!`
          });
        } else if (depressionTrend.direction === 'up' && Math.abs(depressionTrend.percentChange) > 20) {
          insights.push({
            type: 'warning',
            message: `Depression symptoms worsened by ${Math.abs(depressionTrend.percentChange).toFixed(0)}%. Please consult with your provider.`
          });
        }

        // Stress insights
        if (stressTrend.direction === 'down' && Math.abs(stressTrend.percentChange) > 10) {
          insights.push({
            type: 'positive',
            message: `Stress levels dropped ${Math.abs(stressTrend.percentChange).toFixed(0)}% - your coping strategies are working!`
          });
        } else if (stressTrend.direction === 'up' && Math.abs(stressTrend.percentChange) > 25) {
          insights.push({
            type: 'warning',
            message: `Stress increased significantly (${Math.abs(stressTrend.percentChange).toFixed(0)}%). Remember to practice self-care.`
          });
        }

        // Pain insights
        if (painTrend.value > 0) {
          if (painTrend.direction === 'down' && Math.abs(painTrend.percentChange) > 15) {
            insights.push({
              type: 'positive',
              message: `Pain levels reduced by ${Math.abs(painTrend.percentChange).toFixed(0)}%. Treatment may be helping.`
            });
          } else if (painTrend.direction === 'up' && Math.abs(painTrend.percentChange) > 20) {
            insights.push({
              type: 'warning',
              message: `Pain increased ${Math.abs(painTrend.percentChange).toFixed(0)}% this week. Consider discussing pain management with your provider.`
            });
          }
        }

        // Sleep insights
        if (sleepTrend.direction === 'up' && Math.abs(sleepTrend.percentChange) > 15) {
          insights.push({
            type: 'positive',
            message: `Sleep quality improved by ${Math.abs(sleepTrend.percentChange).toFixed(0)}%. Better rest supports overall wellness!`
          });
        } else if (sleepTrend.direction === 'down' && Math.abs(sleepTrend.percentChange) > 20) {
          insights.push({
            type: 'warning',
            message: `Sleep quality declined ${Math.abs(sleepTrend.percentChange).toFixed(0)}%. Poor sleep can worsen other symptoms.`
          });
        }

        // Correlation insights
        if (stressTrend.direction === 'up' && sleepTrend.direction === 'down') {
          insights.push({
            type: 'info',
            message: 'Pattern detected: Higher stress correlates with poorer sleep. Focus on stress reduction before bedtime.'
          });
        }

        if (anxietyTrend.direction === 'up' && depressionTrend.direction === 'up') {
          insights.push({
            type: 'warning',
            message: 'Both anxiety and depression trending upward. Please contact your mental health provider soon.'
          });
        }

        // Positive reinforcement
        const improvingMetrics = [anxietyTrend, depressionTrend, stressTrend, painTrend]
          .filter(t => t.value > 0 && t.direction === 'down').length;
        if (improvingMetrics >= 3) {
          insights.push({
            type: 'positive',
            message: `Excellent progress! ${improvingMetrics} key metrics are improving this week. Keep it up!`
          });
        }

        if (insights.length === 0) {
          insights.push({
            type: 'info',
            message: 'Symptoms are stable this week. Continue tracking to identify patterns over time.'
          });
        }

        return (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Symptom Insights & Patterns</CardTitle>
              </div>
              <CardDescription>
                AI-powered analysis of your symptom trends (last 7 days vs. previous 7 days)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`flex gap-3 p-3 rounded-lg ${
                    insight.type === 'positive'
                      ? 'bg-green-50 border border-green-200'
                      : insight.type === 'warning'
                        ? 'bg-amber-50 border border-amber-200'
                        : 'bg-blue-50 border border-blue-200'
                  }`}
                >
                  {insight.type === 'positive' ? (
                    <TrendingDown className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : insight.type === 'warning' ? (
                    <TrendingUp className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Activity className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm text-gray-700">{insight.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })()}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center flex-1">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="mental-health">Mental Health</SelectItem>
              <SelectItem value="physical">Physical</SelectItem>
              <SelectItem value="eds-hypermobility">EDS/Hypermobility</SelectItem>
              <SelectItem value="migraine">Migraine</SelectItem>
              <SelectItem value="hormonal">Hormonal</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Symptoms
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log Symptoms</DialogTitle>
              <DialogDescription>
                Track your symptoms across mental health, physical health, and hormonal changes
              </DialogDescription>
            </DialogHeader>

            <Tabs
              value={newSymptom.category}
              onValueChange={(value) =>
                setNewSymptom({ ...newSymptom, category: value })
              }
            >
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="mental-health">
                  <Brain className="h-4 w-4 mr-1" />
                  Mental
                </TabsTrigger>
                <TabsTrigger value="physical">
                  <Heart className="h-4 w-4 mr-1" />
                  Physical
                </TabsTrigger>
                <TabsTrigger value="eds-hypermobility">
                  <Activity className="h-4 w-4 mr-1" />
                  EDS/HMS
                </TabsTrigger>
                <TabsTrigger value="migraine">Migraine</TabsTrigger>
                <TabsTrigger value="hormonal">Hormonal</TabsTrigger>
              </TabsList>

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="symptom-date">Date</Label>
                    <Input
                      id="symptom-date"
                      type="date"
                      value={newSymptom.date}
                      onChange={(e) =>
                        setNewSymptom({ ...newSymptom, date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="symptom-time">Time</Label>
                    <Input
                      id="symptom-time"
                      type="time"
                      value={newSymptom.time}
                      onChange={(e) =>
                        setNewSymptom({ ...newSymptom, time: e.target.value })
                      }
                    />
                  </div>
                </div>

                <TabsContent value="mental-health" className="space-y-4 mt-4">
                  <div>
                    <Label>Depression Symptoms</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto border rounded p-2">
                      {DEPRESSION_SYMPTOMS.map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox
                            id={`dep-${symptom}`}
                            checked={newSymptom.mentalHealthSymptoms?.includes(symptom)}
                            onCheckedChange={() =>
                              setNewSymptom({
                                ...newSymptom,
                                mentalHealthSymptoms: toggleArrayItem(
                                  newSymptom.mentalHealthSymptoms || [],
                                  symptom
                                ),
                              })
                            }
                          />
                          <label
                            htmlFor={`dep-${symptom}`}
                            className="text-sm cursor-pointer"
                          >
                            {symptom}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Depression Level: {newSymptom.depressionLevel}/10</Label>
                    <Slider
                      min={0}
                      max={10}
                      step={1}
                      value={[newSymptom.depressionLevel || 0]}
                      onValueChange={([value]) =>
                        setNewSymptom({ ...newSymptom, depressionLevel: value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Anxiety Symptoms</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto border rounded p-2">
                      {ANXIETY_SYMPTOMS.map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox
                            id={`anx-${symptom}`}
                            checked={newSymptom.mentalHealthSymptoms?.includes(symptom)}
                            onCheckedChange={() =>
                              setNewSymptom({
                                ...newSymptom,
                                mentalHealthSymptoms: toggleArrayItem(
                                  newSymptom.mentalHealthSymptoms || [],
                                  symptom
                                ),
                              })
                            }
                          />
                          <label
                            htmlFor={`anx-${symptom}`}
                            className="text-sm cursor-pointer"
                          >
                            {symptom}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Anxiety Level: {newSymptom.anxietyLevel}/10</Label>
                    <Slider
                      min={0}
                      max={10}
                      step={1}
                      value={[newSymptom.anxietyLevel || 0]}
                      onValueChange={([value]) =>
                        setNewSymptom({ ...newSymptom, anxietyLevel: value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Panic Attack Symptoms</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto border rounded p-2">
                      {PANIC_SYMPTOMS.map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox
                            id={`panic-${symptom}`}
                            checked={newSymptom.panicSymptoms?.includes(symptom)}
                            onCheckedChange={() =>
                              setNewSymptom({
                                ...newSymptom,
                                panicSymptoms: toggleArrayItem(
                                  newSymptom.panicSymptoms || [],
                                  symptom
                                ),
                              })
                            }
                          />
                          <label
                            htmlFor={`panic-${symptom}`}
                            className="text-sm cursor-pointer"
                          >
                            {symptom}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>PTSD Symptoms</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto border rounded p-2">
                      {PTSD_SYMPTOMS.map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox
                            id={`ptsd-${symptom}`}
                            checked={newSymptom.ptsdSymptoms?.includes(symptom)}
                            onCheckedChange={() =>
                              setNewSymptom({
                                ...newSymptom,
                                ptsdSymptoms: toggleArrayItem(
                                  newSymptom.ptsdSymptoms || [],
                                  symptom
                                ),
                              })
                            }
                          />
                          <label
                            htmlFor={`ptsd-${symptom}`}
                            className="text-sm cursor-pointer"
                          >
                            {symptom}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Complex PTSD Symptoms</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto border rounded p-2">
                      {COMPLEX_PTSD_SYMPTOMS.map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox
                            id={`cptsd-${symptom}`}
                            checked={newSymptom.ptsdSymptoms?.includes(symptom)}
                            onCheckedChange={() =>
                              setNewSymptom({
                                ...newSymptom,
                                ptsdSymptoms: toggleArrayItem(
                                  newSymptom.ptsdSymptoms || [],
                                  symptom
                                ),
                              })
                            }
                          />
                          <label
                            htmlFor={`cptsd-${symptom}`}
                            className="text-sm cursor-pointer"
                          >
                            {symptom}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Dissociation Level: {newSymptom.dissociationLevel}/10</Label>
                    <Slider
                      min={0}
                      max={10}
                      step={1}
                      value={[newSymptom.dissociationLevel || 0]}
                      onValueChange={([value]) =>
                        setNewSymptom({ ...newSymptom, dissociationLevel: value })
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="physical" className="space-y-4 mt-4">
                  <div>
                    <Label>Pain Scale: {newSymptom.painScale}/10</Label>
                    <Slider
                      min={0}
                      max={10}
                      step={1}
                      value={[newSymptom.painScale || 0]}
                      onValueChange={([value]) =>
                        setNewSymptom({ ...newSymptom, painScale: value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Pain Locations</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {JOINT_LOCATIONS.map((location) => (
                        <div key={location} className="flex items-center space-x-2">
                          <Checkbox
                            id={`pain-${location}`}
                            checked={newSymptom.painLocations?.includes(location)}
                            onCheckedChange={() =>
                              setNewSymptom({
                                ...newSymptom,
                                painLocations: toggleArrayItem(
                                  newSymptom.painLocations || [],
                                  location
                                ),
                              })
                            }
                          />
                          <label
                            htmlFor={`pain-${location}`}
                            className="text-sm cursor-pointer"
                          >
                            {location}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Fatigue Level: {newSymptom.fatigueLevel}/10</Label>
                    <Slider
                      min={0}
                      max={10}
                      step={1}
                      value={[newSymptom.fatigueLevel || 0]}
                      onValueChange={([value]) =>
                        setNewSymptom({ ...newSymptom, fatigueLevel: value })
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="eds-hypermobility" className="space-y-4 mt-4">
                  <div>
                    <Label>EDS/Hypermobility Symptoms</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto border rounded p-2">
                      {EDS_HYPERMOBILITY_SYMPTOMS.map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox
                            id={`eds-${symptom}`}
                            checked={newSymptom.edsSymptoms?.includes(symptom)}
                            onCheckedChange={() =>
                              setNewSymptom({
                                ...newSymptom,
                                edsSymptoms: toggleArrayItem(
                                  newSymptom.edsSymptoms || [],
                                  symptom
                                ),
                              })
                            }
                          />
                          <label
                            htmlFor={`eds-${symptom}`}
                            className="text-sm cursor-pointer"
                          >
                            {symptom}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Subluxations/Dislocations Today</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {JOINT_LOCATIONS.map((location) => (
                        <div key={location} className="flex items-center space-x-2">
                          <Checkbox
                            id={`sublux-${location}`}
                            checked={newSymptom.subluxations?.includes(location)}
                            onCheckedChange={() =>
                              setNewSymptom({
                                ...newSymptom,
                                subluxations: toggleArrayItem(
                                  newSymptom.subluxations || [],
                                  location
                                ),
                              })
                            }
                          />
                          <label
                            htmlFor={`sublux-${location}`}
                            className="text-sm cursor-pointer"
                          >
                            {location}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Pain Scale: {newSymptom.painScale}/10</Label>
                    <Slider
                      min={0}
                      max={10}
                      step={1}
                      value={[newSymptom.painScale || 0]}
                      onValueChange={([value]) =>
                        setNewSymptom({ ...newSymptom, painScale: value })
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="migraine" className="space-y-4 mt-4">
                  <div>
                    <Label>Migraine Phase</Label>
                    <Select
                      value={newSymptom.migrainePhase}
                      onValueChange={(value) =>
                        setNewSymptom({ ...newSymptom, migrainePhase: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select phase" />
                      </SelectTrigger>
                      <SelectContent>
                        {MIGRAINE_PHASES.map((phase) => (
                          <SelectItem key={phase} value={phase}>
                            {phase}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Migraine Symptoms</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto border rounded p-2">
                      {MIGRAINE_SYMPTOMS.map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox
                            id={`mig-${symptom}`}
                            checked={newSymptom.migraineSymptoms?.includes(symptom)}
                            onCheckedChange={() =>
                              setNewSymptom({
                                ...newSymptom,
                                migraineSymptoms: toggleArrayItem(
                                  newSymptom.migraineSymptoms || [],
                                  symptom
                                ),
                              })
                            }
                          />
                          <label
                            htmlFor={`mig-${symptom}`}
                            className="text-sm cursor-pointer"
                          >
                            {symptom}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Aura Symptoms</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {AURA_SYMPTOMS.map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox
                            id={`aura-${symptom}`}
                            checked={newSymptom.auraSymptoms?.includes(symptom)}
                            onCheckedChange={() =>
                              setNewSymptom({
                                ...newSymptom,
                                auraSymptoms: toggleArrayItem(
                                  newSymptom.auraSymptoms || [],
                                  symptom
                                ),
                              })
                            }
                          />
                          <label
                            htmlFor={`aura-${symptom}`}
                            className="text-sm cursor-pointer"
                          >
                            {symptom}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Pain Scale: {newSymptom.painScale}/10</Label>
                    <Slider
                      min={0}
                      max={10}
                      step={1}
                      value={[newSymptom.painScale || 0]}
                      onValueChange={([value]) =>
                        setNewSymptom({ ...newSymptom, painScale: value })
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="hormonal" className="space-y-4 mt-4">
                  <div>
                    <Label>Female Hormonal Symptoms</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto border rounded p-2">
                      {FEMALE_HORMONAL_SYMPTOMS.map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox
                            id={`fem-${symptom}`}
                            checked={newSymptom.hormonalSymptoms?.includes(symptom)}
                            onCheckedChange={() =>
                              setNewSymptom({
                                ...newSymptom,
                                hormonalSymptoms: toggleArrayItem(
                                  newSymptom.hormonalSymptoms || [],
                                  symptom
                                ),
                              })
                            }
                          />
                          <label
                            htmlFor={`fem-${symptom}`}
                            className="text-sm cursor-pointer"
                          >
                            {symptom}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Menstrual Cycle Day</Label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={newSymptom.menstrualCycleDay || ""}
                        onChange={(e) =>
                          setNewSymptom({
                            ...newSymptom,
                            menstrualCycleDay: parseInt(e.target.value),
                          })
                        }
                        placeholder="Day of cycle"
                      />
                    </div>
                    <div>
                      <Label>Menstrual Flow</Label>
                      <Select
                        value={newSymptom.menstrualFlow}
                        onValueChange={(value) =>
                          setNewSymptom({ ...newSymptom, menstrualFlow: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select flow" />
                        </SelectTrigger>
                        <SelectContent>
                          {MENSTRUAL_FLOW_OPTIONS.map((flow) => (
                            <SelectItem key={flow} value={flow}>
                              {flow}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Male Hormonal Symptoms</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto border rounded p-2">
                      {MALE_HORMONAL_SYMPTOMS.map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox
                            id={`male-${symptom}`}
                            checked={newSymptom.hormonalSymptoms?.includes(symptom)}
                            onCheckedChange={() =>
                              setNewSymptom({
                                ...newSymptom,
                                hormonalSymptoms: toggleArrayItem(
                                  newSymptom.hormonalSymptoms || [],
                                  symptom
                                ),
                              })
                            }
                          />
                          <label
                            htmlFor={`male-${symptom}`}
                            className="text-sm cursor-pointer"
                          >
                            {symptom}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Common fields across all tabs */}
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <Label>Mood</Label>
                    <Select
                      value={newSymptom.mood}
                      onValueChange={(value) =>
                        setNewSymptom({ ...newSymptom, mood: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MOOD_OPTIONS.map((mood) => (
                          <SelectItem key={mood} value={mood}>
                            {mood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Sleep Quality: {newSymptom.sleepQuality}/10</Label>
                    <Slider
                      min={0}
                      max={10}
                      step={1}
                      value={[newSymptom.sleepQuality || 5]}
                      onValueChange={([value]) =>
                        setNewSymptom({ ...newSymptom, sleepQuality: value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Stress Level: {newSymptom.stressLevel}/10</Label>
                    <Slider
                      min={0}
                      max={10}
                      step={1}
                      value={[newSymptom.stressLevel || 5]}
                      onValueChange={([value]) =>
                        setNewSymptom({ ...newSymptom, stressLevel: value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Triggers</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {COMMON_TRIGGERS.map((trigger) => (
                        <Badge
                          key={trigger}
                          variant={
                            newSymptom.triggers?.includes(trigger)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() =>
                            setNewSymptom({
                              ...newSymptom,
                              triggers: toggleArrayItem(
                                newSymptom.triggers || [],
                                trigger
                              ),
                            })
                          }
                        >
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={newSymptom.duration}
                      onChange={(e) =>
                        setNewSymptom({ ...newSymptom, duration: e.target.value })
                      }
                      placeholder="e.g., 2 hours, All day, Ongoing"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={newSymptom.notes}
                      onChange={(e) =>
                        setNewSymptom({ ...newSymptom, notes: e.target.value })
                      }
                      placeholder="Any additional details..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </Tabs>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddSymptom}>Log Symptoms</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {filteredSymptoms
          .sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`).getTime();
            const dateB = new Date(`${b.date} ${b.time}`).getTime();
            return dateB - dateA;
          })
          .map((symptom) => (
            <Card key={symptom.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="capitalize">
                        {symptom.category?.replace("-", " ")} Log
                      </CardTitle>
                      <Badge variant="outline">{symptom.mood}</Badge>
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(symptom.date).toLocaleDateString()} at {symptom.time}
                      </div>
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSymptom(symptom.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {symptom.stressLevel > 0 && (
                      <Badge variant="secondary">
                        Stress: {symptom.stressLevel}/10
                      </Badge>
                    )}
                    {symptom.sleepQuality > 0 && (
                      <Badge variant="secondary">
                        Sleep: {symptom.sleepQuality}/10
                      </Badge>
                    )}
                    {symptom.painScale > 0 && (
                      <Badge variant="secondary">Pain: {symptom.painScale}/10</Badge>
                    )}
                    {symptom.anxietyLevel > 0 && (
                      <Badge variant="secondary">
                        Anxiety: {symptom.anxietyLevel}/10
                      </Badge>
                    )}
                    {symptom.depressionLevel > 0 && (
                      <Badge variant="secondary">
                        Depression: {symptom.depressionLevel}/10
                      </Badge>
                    )}
                    {symptom.duration && (
                      <Badge variant="outline">Duration: {symptom.duration}</Badge>
                    )}
                  </div>

                  {symptom.mentalHealthSymptoms?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Mental Health:</p>
                      <div className="flex flex-wrap gap-1">
                        {symptom.mentalHealthSymptoms.map((s, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {symptom.edsSymptoms?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">EDS/Hypermobility:</p>
                      <div className="flex flex-wrap gap-1">
                        {symptom.edsSymptoms.map((s, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {symptom.subluxations?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Subluxations:</p>
                      <div className="flex flex-wrap gap-1">
                        {symptom.subluxations.map((s, idx) => (
                          <Badge key={idx} variant="destructive" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {symptom.migraineSymptoms?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Migraine:</p>
                      <div className="flex flex-wrap gap-1">
                        {symptom.migrainePhase && (
                          <Badge variant="default">{symptom.migrainePhase}</Badge>
                        )}
                        {symptom.migraineSymptoms.map((s, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {symptom.hormonalSymptoms?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Hormonal:</p>
                      <div className="flex flex-wrap gap-1">
                        {symptom.menstrualCycleDay && (
                          <Badge variant="default">
                            Day {symptom.menstrualCycleDay}
                          </Badge>
                        )}
                        {symptom.menstrualFlow && (
                          <Badge variant="secondary">{symptom.menstrualFlow}</Badge>
                        )}
                        {symptom.hormonalSymptoms.map((s, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {symptom.triggers && symptom.triggers.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Triggers:</p>
                      <div className="flex flex-wrap gap-1">
                        {symptom.triggers.map((trigger, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {symptom.notes && (
                    <div>
                      <p className="text-sm font-medium mb-1">Notes:</p>
                      <p className="text-sm text-muted-foreground">{symptom.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

        {filteredSymptoms.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
              No symptom logs found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
