import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar, Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface FollowUpPlan {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  provider: string;
  tasks: string[];
  createdAt: string;
}

export function FollowUpPlans({ accessToken }: { accessToken: string }) {
  const [plans, setPlans] = useState<FollowUpPlan[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newPlan, setNewPlan] = useState<Partial<FollowUpPlan>>({
    title: "",
    description: "",
    dueDate: "",
    provider: "",
    tasks: [],
  });

  const projectId = "cvsxfzllhhhpdyckdmqg";

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/follow-up-plans`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      toast.error("Failed to load follow-up plans");
    }
  };

  const handleAddPlan = async () => {
    if (!newPlan.title || !newPlan.dueDate) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/follow-up-plans`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...newPlan, status: "pending" }),
        }
      );

      if (response.ok) {
        toast.success("Follow-up plan created");
        setIsAddOpen(false);
        setNewPlan({
          title: "",
          description: "",
          dueDate: "",
          provider: "",
          tasks: [],
        });
        fetchPlans();
      }
    } catch (error) {
      toast.error("Failed to create plan");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Overdue
          </Badge>
        );
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Follow-Up Plans</h2>
          <p className="text-muted-foreground">
            Track post-appointment actions and treatment plans
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Follow-Up Plan</DialogTitle>
              <DialogDescription>
                Set up a plan for post-appointment care
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Plan title..."
                  value={newPlan.title}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={newPlan.dueDate}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, dueDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Input
                  placeholder="Provider name..."
                  value={newPlan.provider}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, provider: e.target.value })
                  }
                />
              </div>
              <div>
                <Textarea
                  placeholder="Plan description..."
                  value={newPlan.description}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPlan}>Create Plan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{plan.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    Due: {new Date(plan.dueDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                {getStatusBadge(plan.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.provider && (
                <p className="text-sm text-muted-foreground">
                  Provider: {plan.provider}
                </p>
              )}
              <p className="text-sm">{plan.description}</p>
              {plan.tasks && plan.tasks.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium">Tasks:</p>
                  {plan.tasks.slice(0, 3).map((task, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground">
                      • {task}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Calendar className="h-8 w-8 mb-2" />
            <p>No follow-up plans yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
