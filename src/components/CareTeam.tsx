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
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  User,
  Search,
  Building2,
} from "lucide-react";

interface CareTeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  organization: string;
  phone: string;
  email: string;
  address: string;
  fax: string;
  isPrimary: boolean;
  acceptingNewPatients: boolean;
  lastVisit: string;
  nextAppointment: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const PROVIDER_ROLES = [
  "Primary Care Physician",
  "Specialist",
  "Psychiatrist",
  "Psychologist",
  "Therapist",
  "Dentist",
  "Nurse Practitioner",
  "Physician Assistant",
  "Social Worker",
  "Pharmacist",
  "Physical Therapist",
  "Occupational Therapist",
  "Other",
];

const SPECIALTIES = [
  "Family Medicine",
  "Internal Medicine",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Neurology",
  "Oncology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Psychology",
  "Mental Health",
  "Radiology",
  "Surgery",
  "Urology",
  "Other",
];

export function CareTeam({ accessToken }: { accessToken: string }) {
  const [careTeam, setCareTeam] = useState<CareTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CareTeamMember | null>(null);

  const [formData, setFormData] = useState<Partial<CareTeamMember>>({
    name: "",
    role: "",
    specialty: "",
    organization: "",
    phone: "",
    email: "",
    address: "",
    fax: "",
    isPrimary: false,
    acceptingNewPatients: true,
    lastVisit: "",
    nextAppointment: "",
    notes: "",
  });

  const projectId = "cvsxfzllhhhpdyckdmqg";

  useEffect(() => {
    fetchCareTeam();
  }, []);

  const fetchCareTeam = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/care-team`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCareTeam(data.careTeam || []);
      }
    } catch (error) {
      toast.error("Failed to load care team");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.role || !formData.specialty) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const url = editingMember
        ? `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/care-team/${editingMember.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/care-team`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingMember
            ? "Care team member updated"
            : "Care team member added successfully"
        );
        setIsAddOpen(false);
        setEditingMember(null);
        resetForm();
        fetchCareTeam();
      } else {
        toast.error("Failed to save care team member");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/care-team/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        toast.success("Care team member removed");
        fetchCareTeam();
      } else {
        toast.error("Failed to remove care team member");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const handleEdit = (member: CareTeamMember) => {
    setEditingMember(member);
    setFormData(member);
    setIsAddOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      specialty: "",
      organization: "",
      phone: "",
      email: "",
      address: "",
      fax: "",
      isPrimary: false,
      acceptingNewPatients: true,
      lastVisit: "",
      nextAppointment: "",
      notes: "",
    });
  };

  const filteredCareTeam = careTeam.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.organization.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || member.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const primaryProvider = careTeam.find((m) => m.isPrimary);

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
          <h2 className="text-3xl font-bold tracking-tight">Care Team</h2>
          <p className="text-muted-foreground">
            Manage your healthcare providers and specialists
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{careTeam.length}</div>
            <p className="text-xs text-muted-foreground">In your care team</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Specialists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {careTeam.filter((m) => m.role === "Specialist").length}
            </div>
            <p className="text-xs text-muted-foreground">Specialist providers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Primary Care</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {primaryProvider ? primaryProvider.name : "Not Set"}
            </div>
            <p className="text-xs text-muted-foreground">Primary care provider</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {careTeam.filter((m) => m.nextAppointment).length}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled appointments</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center flex-1">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search care team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {PROVIDER_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog
          open={isAddOpen}
          onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) {
              setEditingMember(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Edit Care Team Member" : "Add Care Team Member"}
              </DialogTitle>
              <DialogDescription>
                Add a healthcare provider to your care team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="provider-name">Name *</Label>
                <Input
                  id="provider-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dr. Jane Smith"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider-role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger id="provider-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDER_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="provider-specialty">Specialty *</Label>
                  <Select
                    value={formData.specialty}
                    onValueChange={(value) =>
                      setFormData({ ...formData, specialty: value })
                    }
                  >
                    <SelectTrigger id="provider-specialty">
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTIES.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="provider-organization">Organization/Hospital</Label>
                <Input
                  id="provider-organization"
                  value={formData.organization}
                  onChange={(e) =>
                    setFormData({ ...formData, organization: e.target.value })
                  }
                  placeholder="Hospital or clinic name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider-phone">Phone</Label>
                  <Input
                    id="provider-phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="provider-email">Email</Label>
                  <Input
                    id="provider-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="provider@hospital.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="provider-address">Address</Label>
                <Input
                  id="provider-address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="123 Main St, City, State ZIP"
                />
              </div>
              <div>
                <Label htmlFor="provider-fax">Fax</Label>
                <Input
                  id="provider-fax"
                  value={formData.fax}
                  onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                  placeholder="(555) 123-4568"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="last-visit">Last Visit</Label>
                  <Input
                    id="last-visit"
                    type="date"
                    value={formData.lastVisit}
                    onChange={(e) =>
                      setFormData({ ...formData, lastVisit: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="next-appointment">Next Appointment</Label>
                  <Input
                    id="next-appointment"
                    type="date"
                    value={formData.nextAppointment}
                    onChange={(e) =>
                      setFormData({ ...formData, nextAppointment: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is-primary"
                    checked={formData.isPrimary}
                    onChange={(e) =>
                      setFormData({ ...formData, isPrimary: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is-primary" className="cursor-pointer">
                    Primary care provider
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="accepting-patients"
                    checked={formData.acceptingNewPatients}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        acceptingNewPatients: e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="accepting-patients" className="cursor-pointer">
                    Accepting new patients
                  </Label>
                </div>
              </div>
              <div>
                <Label htmlFor="provider-notes">Notes</Label>
                <Textarea
                  id="provider-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes about this provider..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingMember(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingMember ? "Update" : "Add"} Provider
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredCareTeam.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{member.name}</CardTitle>
                    {member.isPrimary && (
                      <Badge variant="default">Primary</Badge>
                    )}
                  </div>
                  <CardDescription className="mt-1">
                    {member.role} • {member.specialty}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(member)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {member.organization && (
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Organization</p>
                      <p className="text-muted-foreground">{member.organization}</p>
                    </div>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground">{member.phone}</p>
                    </div>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                )}
                {member.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Address</p>
                      <p className="text-muted-foreground">{member.address}</p>
                    </div>
                  </div>
                )}
                {(member.lastVisit || member.nextAppointment) && (
                  <div className="flex gap-4 text-sm pt-2 border-t">
                    {member.lastVisit && (
                      <div>
                        <p className="font-medium">Last Visit</p>
                        <p className="text-muted-foreground">
                          {new Date(member.lastVisit).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {member.nextAppointment && (
                      <div>
                        <p className="font-medium">Next Appointment</p>
                        <p className="text-muted-foreground">
                          {new Date(member.nextAppointment).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {member.notes && (
                  <div className="text-sm pt-2 border-t">
                    <p className="font-medium mb-1">Notes</p>
                    <p className="text-muted-foreground">{member.notes}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  {member.acceptingNewPatients && (
                    <Badge variant="secondary" className="text-xs">
                      Accepting New Patients
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCareTeam.length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
              No care team members found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
