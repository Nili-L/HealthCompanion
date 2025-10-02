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
  Edit,
  Target,
  TrendingUp,
  Calendar,
  Bell,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HealthGoal {
  id: string;
  title: string;
  category: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  targetDate: string;
  status: "active" | "completed" | "paused";
  priority: "high" | "medium" | "low";
  frequency: string;
  notes: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

interface Milestone {
  id: string;
  description: string;
  completed: boolean;
  completedDate?: string;
}

interface Reminder {
  id: string;
  type: "medication" | "appointment" | "goal" | "custom";
  title: string;
  description: string;
  frequency: string;
  time: string;
  daysOfWeek: string[];
  startDate: string;
  endDate?: string;
  enabled: boolean;
  lastTriggered?: string;
  createdAt: string;
}

const GOAL_CATEGORIES = [
  "Weight Management",
  "Exercise",
  "Nutrition",
  "Sleep",
  "Mental Health",
  "Blood Pressure",
  "Blood Sugar",
  "Cholesterol",
  "Medication Adherence",
  "Smoking Cessation",
  "Stress Management",
  "Other",
];

const REMINDER_TYPES = [
  { value: "medication", label: "Medication" },
  { value: "appointment", label: "Appointment" },
  { value: "goal", label: "Health Goal" },
  { value: "custom", label: "Custom" },
];

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function HealthGoals({ accessToken }: { accessToken: string }) {
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<HealthGoal | null>(null);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const [goalForm, setGoalForm] = useState<Partial<HealthGoal>>({
    title: "",
    category: "",
    description: "",
    targetValue: 0,
    currentValue: 0,
    unit: "",
    startDate: new Date().toISOString().split("T")[0],
    targetDate: "",
    status: "active",
    priority: "medium",
    frequency: "daily",
    notes: "",
    milestones: [],
  });

  const [reminderForm, setReminderForm] = useState<Partial<Reminder>>({
    type: "medication",
    title: "",
    description: "",
    frequency: "daily",
    time: "09:00",
    daysOfWeek: [],
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    enabled: true,
  });

  const projectId = "cvsxfzllhhhpdyckdmqg";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/goals`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
        setReminders(data.reminders || []);
      }
    } catch (error) {
      toast.error("Failed to load data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async () => {
    if (!goalForm.title || !goalForm.category || !goalForm.targetDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const url = editingGoal
        ? `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/goals/${editingGoal.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/goals`;

      const response = await fetch(url, {
        method: editingGoal ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goalForm),
      });

      if (response.ok) {
        toast.success(editingGoal ? "Goal updated" : "Goal created successfully");
        setIsGoalDialogOpen(false);
        setEditingGoal(null);
        resetGoalForm();
        fetchData();
      } else {
        toast.error("Failed to save goal");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const handleSaveReminder = async () => {
    if (!reminderForm.title || !reminderForm.type) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const url = editingReminder
        ? `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/goals/${editingReminder.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/goals`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...reminderForm, isReminder: true }),
      });

      if (response.ok) {
        toast.success(editingReminder ? "Reminder updated" : "Reminder created");
        setIsReminderDialogOpen(false);
        setEditingReminder(null);
        resetReminderForm();
        fetchData();
      } else {
        toast.error("Failed to save reminder");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/goals/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        toast.success("Goal deleted");
        fetchData();
      } else {
        toast.error("Failed to delete goal");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const updateGoalProgress = async (goal: HealthGoal, newValue: number) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/goals/${goal.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...goal, currentValue: newValue }),
        }
      );

      if (response.ok) {
        toast.success("Progress updated");
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleDay = (day: string) => {
    const current = reminderForm.daysOfWeek || [];
    if (current.includes(day)) {
      setReminderForm({
        ...reminderForm,
        daysOfWeek: current.filter((d) => d !== day),
      });
    } else {
      setReminderForm({ ...reminderForm, daysOfWeek: [...current, day] });
    }
  };

  const resetGoalForm = () => {
    setGoalForm({
      title: "",
      category: "",
      description: "",
      targetValue: 0,
      currentValue: 0,
      unit: "",
      startDate: new Date().toISOString().split("T")[0],
      targetDate: "",
      status: "active",
      priority: "medium",
      frequency: "daily",
      notes: "",
      milestones: [],
    });
  };

  const resetReminderForm = () => {
    setReminderForm({
      type: "medication",
      title: "",
      description: "",
      frequency: "daily",
      time: "09:00",
      daysOfWeek: [],
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      enabled: true,
    });
  };

  const getProgressPercentage = (goal: HealthGoal) => {
    if (goal.targetValue === 0) return 0;
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

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
          <h2 className="text-3xl font-bold tracking-tight">Health Goals & Reminders</h2>
          <p className="text-muted-foreground">
            Set goals, track progress, and manage health reminders
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGoals.length}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedGoals.length}</div>
            <p className="text-xs text-muted-foreground">Goals achieved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeGoals.length > 0
                ? Math.round(
                    activeGoals.reduce((sum, g) => sum + getProgressPercentage(g), 0) /
                      activeGoals.length
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Across active goals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reminders.filter((r) => r.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">Active reminders</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="goals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-end">
            <Dialog
              open={isGoalDialogOpen}
              onOpenChange={(open) => {
                setIsGoalDialogOpen(open);
                if (!open) {
                  setEditingGoal(null);
                  resetGoalForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingGoal ? "Edit Health Goal" : "Create Health Goal"}
                  </DialogTitle>
                  <DialogDescription>
                    Set a new health goal and track your progress
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goal-title">Goal Title *</Label>
                    <Input
                      id="goal-title"
                      value={goalForm.title}
                      onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                      placeholder="e.g., Lose 10 pounds"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-category">Category *</Label>
                    <Select
                      value={goalForm.category}
                      onValueChange={(value) =>
                        setGoalForm({ ...goalForm, category: value })
                      }
                    >
                      <SelectTrigger id="goal-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {GOAL_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="goal-description">Description</Label>
                    <Textarea
                      id="goal-description"
                      value={goalForm.description}
                      onChange={(e) =>
                        setGoalForm({ ...goalForm, description: e.target.value })
                      }
                      placeholder="Describe your goal..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="target-value">Target Value</Label>
                      <Input
                        id="target-value"
                        type="number"
                        value={goalForm.targetValue || ""}
                        onChange={(e) =>
                          setGoalForm({
                            ...goalForm,
                            targetValue: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="current-value">Current Value</Label>
                      <Input
                        id="current-value"
                        type="number"
                        value={goalForm.currentValue || ""}
                        onChange={(e) =>
                          setGoalForm({
                            ...goalForm,
                            currentValue: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={goalForm.unit}
                        onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })}
                        placeholder="lbs, steps, etc."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={goalForm.startDate}
                        onChange={(e) =>
                          setGoalForm({ ...goalForm, startDate: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="target-date">Target Date *</Label>
                      <Input
                        id="target-date"
                        type="date"
                        value={goalForm.targetDate}
                        onChange={(e) =>
                          setGoalForm({ ...goalForm, targetDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={goalForm.priority}
                        onValueChange={(value: any) =>
                          setGoalForm({ ...goalForm, priority: value })
                        }
                      >
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select
                        value={goalForm.frequency}
                        onValueChange={(value) =>
                          setGoalForm({ ...goalForm, frequency: value })
                        }
                      >
                        <SelectTrigger id="frequency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsGoalDialogOpen(false);
                      setEditingGoal(null);
                      resetGoalForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveGoal}>
                    {editingGoal ? "Update" : "Create"} Goal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{goal.title}</CardTitle>
                        <Badge
                          variant={
                            goal.priority === "high"
                              ? "destructive"
                              : goal.priority === "medium"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {goal.priority}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">{goal.category}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingGoal(goal);
                          setGoalForm(goal);
                          setIsGoalDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-medium">
                          {goal.currentValue}/{goal.targetValue} {goal.unit}
                        </span>
                      </div>
                      <Progress value={getProgressPercentage(goal)} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {getProgressPercentage(goal).toFixed(0)}% complete
                      </p>
                    </div>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {goal.frequency}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Update progress"
                        className="text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const value = parseFloat((e.target as HTMLInputElement).value);
                            if (!isNaN(value)) {
                              updateGoalProgress(goal, value);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {goals.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
                No health goals yet. Create your first goal to get started!
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <div className="flex justify-end">
            <Dialog
              open={isReminderDialogOpen}
              onOpenChange={(open) => {
                setIsReminderDialogOpen(open);
                if (!open) {
                  setEditingReminder(null);
                  resetReminderForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Reminder
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Reminder</DialogTitle>
                  <DialogDescription>
                    Set up a new health reminder or notification
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reminder-type">Type *</Label>
                    <Select
                      value={reminderForm.type}
                      onValueChange={(value: any) =>
                        setReminderForm({ ...reminderForm, type: value })
                      }
                    >
                      <SelectTrigger id="reminder-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REMINDER_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reminder-title">Title *</Label>
                    <Input
                      id="reminder-title"
                      value={reminderForm.title}
                      onChange={(e) =>
                        setReminderForm({ ...reminderForm, title: e.target.value })
                      }
                      placeholder="e.g., Take morning medication"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reminder-description">Description</Label>
                    <Textarea
                      id="reminder-description"
                      value={reminderForm.description}
                      onChange={(e) =>
                        setReminderForm({ ...reminderForm, description: e.target.value })
                      }
                      placeholder="Additional details..."
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reminder-frequency">Frequency</Label>
                      <Select
                        value={reminderForm.frequency}
                        onValueChange={(value) =>
                          setReminderForm({ ...reminderForm, frequency: value })
                        }
                      >
                        <SelectTrigger id="reminder-frequency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="custom">Custom Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reminder-time">Time</Label>
                      <Input
                        id="reminder-time"
                        type="time"
                        value={reminderForm.time}
                        onChange={(e) =>
                          setReminderForm({ ...reminderForm, time: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  {reminderForm.frequency === "custom" && (
                    <div>
                      <Label>Days of Week</Label>
                      <div className="flex gap-2 mt-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <Badge
                            key={day}
                            variant={
                              reminderForm.daysOfWeek?.includes(day)
                                ? "default"
                                : "outline"
                            }
                            className="cursor-pointer"
                            onClick={() => toggleDay(day)}
                          >
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reminder-start">Start Date</Label>
                      <Input
                        id="reminder-start"
                        type="date"
                        value={reminderForm.startDate}
                        onChange={(e) =>
                          setReminderForm({ ...reminderForm, startDate: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="reminder-end">End Date (Optional)</Label>
                      <Input
                        id="reminder-end"
                        type="date"
                        value={reminderForm.endDate}
                        onChange={(e) =>
                          setReminderForm({ ...reminderForm, endDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsReminderDialogOpen(false);
                      resetReminderForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveReminder}>Create Reminder</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {reminders.map((reminder) => (
              <Card key={reminder.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">{reminder.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {reminder.type}
                        </Badge>
                        {reminder.enabled ? (
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Paused
                          </Badge>
                        )}
                      </div>
                      {reminder.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {reminder.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {reminder.time}
                        </div>
                        <div>{reminder.frequency}</div>
                        {reminder.daysOfWeek && reminder.daysOfWeek.length > 0 && (
                          <div>{reminder.daysOfWeek.join(", ")}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {reminders.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
                  No reminders set. Create your first reminder!
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
