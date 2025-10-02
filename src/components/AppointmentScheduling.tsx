import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Video,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { projectId } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";

interface AppointmentSchedulingProps {
  accessToken: string;
}

interface Appointment {
  id: string;
  title: string;
  provider: string;
  type: "in-person" | "virtual" | "phone";
  date: string;
  time: string;
  duration: string;
  location: string;
  notes: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

const APPOINTMENT_TYPES = [
  { value: "in-person", label: "In-Person Visit", icon: MapPin },
  { value: "virtual", label: "Virtual/Telehealth", icon: Video },
  { value: "phone", label: "Phone Call", icon: Clock },
];

const APPOINTMENT_STATUSES = [
  { value: "scheduled", label: "Scheduled", color: "bg-blue-500" },
  { value: "completed", label: "Completed", color: "bg-green-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
  { value: "no-show", label: "No Show", color: "bg-gray-500" },
];

export function AppointmentScheduling({ accessToken }: AppointmentSchedulingProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const [viewFilter, setViewFilter] = useState<"upcoming" | "past" | "all">("upcoming");

  const [formData, setFormData] = useState({
    title: "",
    provider: "",
    type: "in-person" as "in-person" | "virtual" | "phone",
    date: "",
    time: "",
    duration: "30",
    location: "",
    notes: "",
    status: "scheduled" as Appointment["status"],
    reminderSent: false,
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/appointments`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        toast.error("Failed to load appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Error loading appointments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.provider || !formData.date || !formData.time) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const url = editingAppointment
        ? `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/appointments/${editingAppointment.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/appointments`;

      const response = await fetch(url, {
        method: editingAppointment ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingAppointment ? "Appointment updated" : "Appointment scheduled");
        setDialogOpen(false);
        setEditingAppointment(null);
        resetForm();
        fetchAppointments();
      } else {
        toast.error("Failed to save appointment");
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error("Error saving appointment");
    }
  };

  const handleDelete = async (appointment: Appointment) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/appointments/${appointment.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Appointment deleted");
        setDeletingAppointment(null);
        fetchAppointments();
      } else {
        toast.error("Failed to delete appointment");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Error deleting appointment");
    }
  };

  const handleStatusChange = async (appointment: Appointment, newStatus: Appointment["status"]) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/appointments/${appointment.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...appointment, status: newStatus }),
        }
      );

      if (response.ok) {
        toast.success("Appointment status updated");
        fetchAppointments();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      provider: "",
      type: "in-person",
      date: "",
      time: "",
      duration: "30",
      location: "",
      notes: "",
      status: "scheduled",
      reminderSent: false,
    });
  };

  const openEditDialog = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      title: appointment.title,
      provider: appointment.provider,
      type: appointment.type,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      location: appointment.location,
      notes: appointment.notes,
      status: appointment.status,
      reminderSent: appointment.reminderSent,
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingAppointment(null);
    resetForm();
    setDialogOpen(true);
  };

  const filteredAppointments = appointments.filter((apt) => {
    const appointmentDate = new Date(apt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (viewFilter === "upcoming") {
      return appointmentDate >= today && apt.status === "scheduled";
    } else if (viewFilter === "past") {
      return appointmentDate < today || apt.status !== "scheduled";
    }
    return true;
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return viewFilter === "past" ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

  const upcomingCount = appointments.filter((apt) => {
    const appointmentDate = new Date(apt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today && apt.status === "scheduled";
  }).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Appointments</h2>
          <p className="text-sm text-muted-foreground">
            Schedule and manage your healthcare appointments
          </p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:bg-accent/50" onClick={() => setViewFilter("upcoming")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{upcomingCount}</div>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent/50" onClick={() => setViewFilter("past")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {appointments.filter((a) => a.status === "completed").length}
                </div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent/50" onClick={() => setViewFilter("all")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{appointments.length}</div>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={viewFilter === "upcoming" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewFilter("upcoming")}
        >
          Upcoming
        </Button>
        <Button
          variant={viewFilter === "past" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewFilter("past")}
        >
          Past
        </Button>
        <Button
          variant={viewFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewFilter("all")}
        >
          All
        </Button>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {viewFilter === "upcoming"
                  ? "You don't have any upcoming appointments"
                  : "No appointments in this view"}
              </p>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((appointment) => {
            const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
            const isUpcoming = appointmentDateTime >= new Date();
            const TypeIcon = APPOINTMENT_TYPES.find((t) => t.value === appointment.type)?.icon || CalendarIcon;
            const statusInfo = APPOINTMENT_STATUSES.find((s) => s.value === appointment.status);

            return (
              <Card key={appointment.id} className={isUpcoming ? "border-l-4 border-l-blue-500" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1 min-w-0">
                      <div className={`p-3 rounded-lg ${isUpcoming ? "bg-blue-50" : "bg-gray-50"}`}>
                        <TypeIcon className={`h-6 w-6 ${isUpcoming ? "text-blue-600" : "text-gray-600"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold">{appointment.title}</h3>
                          <Badge className={statusInfo?.color}>{statusInfo?.label}</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {appointment.provider}
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                            <span className="text-xs">({appointment.duration} min)</span>
                          </div>
                          {appointment.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {appointment.location}
                            </div>
                          )}
                        </div>
                        {appointment.notes && (
                          <p className="mt-2 text-sm line-clamp-2">{appointment.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {isUpcoming && appointment.status === "scheduled" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusChange(appointment, "completed")}
                            title="Mark as completed"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusChange(appointment, "cancelled")}
                            title="Cancel appointment"
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(appointment)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingAppointment(appointment)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? "Edit Appointment" : "Schedule New Appointment"}
            </DialogTitle>
            <DialogDescription>
              Fill in the appointment details below
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">
                  Appointment Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Annual Physical, Follow-up Visit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">
                  Provider <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="provider"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="Dr. Name or Facility"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Appointment Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">
                  Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => setFormData({ ...formData, duration: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Address or virtual meeting link"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Reason for visit, questions to ask, preparation needed, etc."
                rows={4}
              />
            </div>

            {editingAppointment && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingAppointment ? "Update" : "Schedule"} Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingAppointment}
        onOpenChange={() => setDeletingAppointment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this appointment with{" "}
              {deletingAppointment?.provider}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingAppointment && handleDelete(deletingAppointment)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
