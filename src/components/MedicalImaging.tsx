import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Scan, Plus, Download, Search, Eye } from "lucide-react";

interface ImagingStudy {
  id: string;
  type: string;
  bodyPart: string;
  date: string;
  facility: string;
  orderedBy: string;
  findings: string;
  status: "completed" | "pending" | "preliminary";
  imageCount: number;
  createdAt: string;
}

const IMAGING_TYPES = [
  "X-Ray",
  "MRI",
  "CT Scan",
  "Ultrasound",
  "PET Scan",
  "Mammogram",
  "Bone Scan",
  "Other",
];

export function MedicalImaging({ accessToken }: { accessToken: string }) {
  const [studies, setStudies] = useState<ImagingStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newStudy, setNewStudy] = useState<Partial<ImagingStudy>>({
    type: "",
    bodyPart: "",
    date: new Date().toISOString().split("T")[0],
    facility: "",
    orderedBy: "",
    findings: "",
  });

  const projectId = "cvsxfzllhhhpdyckdmqg";

  useEffect(() => {
    fetchStudies();
  }, []);

  const fetchStudies = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/imaging`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStudies(data.studies || []);
      }
    } catch (error) {
      toast.error("Failed to load imaging studies");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudy = async () => {
    if (!newStudy.type || !newStudy.bodyPart || !newStudy.date) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/imaging`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...newStudy, status: "completed" }),
        }
      );

      if (response.ok) {
        toast.success("Imaging study added");
        setIsAddOpen(false);
        setNewStudy({
          type: "",
          bodyPart: "",
          date: new Date().toISOString().split("T")[0],
          facility: "",
          orderedBy: "",
          findings: "",
        });
        fetchStudies();
      }
    } catch (error) {
      toast.error("Failed to add study");
      console.error(error);
    }
  };

  const filteredStudies = studies.filter(
    (study) =>
      study.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.bodyPart.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "preliminary":
        return <Badge className="bg-blue-100 text-blue-800">Preliminary</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge>Unknown</Badge>;
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Medical Imaging</h2>
          <p className="text-muted-foreground">
            View and manage X-rays, MRIs, CT scans, and other imaging studies
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search imaging studies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Study
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Imaging Study</DialogTitle>
              <DialogDescription>
                Record a new imaging study or scan
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={newStudy.type}
                  onValueChange={(value) =>
                    setNewStudy({ ...newStudy, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGING_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Body Part</label>
                <Input
                  placeholder="e.g., Chest, Knee, Brain"
                  value={newStudy.bodyPart}
                  onChange={(e) =>
                    setNewStudy({ ...newStudy, bodyPart: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={newStudy.date}
                  onChange={(e) =>
                    setNewStudy({ ...newStudy, date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Facility</label>
                <Input
                  placeholder="Imaging center name"
                  value={newStudy.facility}
                  onChange={(e) =>
                    setNewStudy({ ...newStudy, facility: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ordered By</label>
                <Input
                  placeholder="Provider name"
                  value={newStudy.orderedBy}
                  onChange={(e) =>
                    setNewStudy({ ...newStudy, orderedBy: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Findings (Optional)</label>
                <Textarea
                  placeholder="Key findings or notes..."
                  value={newStudy.findings}
                  onChange={(e) =>
                    setNewStudy({ ...newStudy, findings: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStudy}>Add Study</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStudies.map((study) => (
          <Card key={study.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Scan className="h-4 w-4 text-blue-600" />
                    <CardTitle className="text-base">{study.type}</CardTitle>
                  </div>
                  <CardDescription className="mt-1">
                    {study.bodyPart} • {new Date(study.date).toLocaleDateString()}
                  </CardDescription>
                </div>
                {getStatusBadge(study.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="text-muted-foreground">Facility: {study.facility}</p>
                <p className="text-muted-foreground">Ordered by: {study.orderedBy}</p>
              </div>
              {study.findings && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {study.findings}
                </p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudies.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Scan className="h-8 w-8 mb-2" />
            <p>No imaging studies found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
