import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Plus, Edit, Trash2, Pill, Calendar, User, Clock, FileText } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";

interface MedicationManagerProps {
  accessToken: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  prescriber: string;
  notes: string;
  reminderEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function MedicationManager({ accessToken }: MedicationManagerProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [deletingMedication, setDeletingMedication] = useState<Medication | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    prescriber: '',
    notes: '',
    reminderEnabled: false,
    isActive: true
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/medications`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMedications(data);
      } else {
        console.error('Failed to fetch medications:', await response.text());
        toast.error('Failed to load medications');
      }
    } catch (error) {
      console.error('Error fetching medications:', error);
      toast.error('Error loading medications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (medication?: Medication) => {
    if (medication) {
      setEditingMedication(medication);
      setFormData({
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        startDate: medication.startDate,
        endDate: medication.endDate,
        prescriber: medication.prescriber,
        notes: medication.notes,
        reminderEnabled: medication.reminderEnabled,
        isActive: medication.isActive
      });
    } else {
      setEditingMedication(null);
      setFormData({
        name: '',
        dosage: '',
        frequency: '',
        startDate: '',
        endDate: '',
        prescriber: '',
        notes: '',
        reminderEnabled: false,
        isActive: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMedication(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.dosage || !formData.frequency) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const url = editingMedication
        ? `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/medications/${editingMedication.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/medications`;

      const response = await fetch(url, {
        method: editingMedication ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(editingMedication ? 'Medication updated' : 'Medication added');
        handleCloseDialog();
        fetchMedications();
      } else {
        console.error('Failed to save medication:', await response.text());
        toast.error('Failed to save medication');
      }
    } catch (error) {
      console.error('Error saving medication:', error);
      toast.error('Error saving medication');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (medication: Medication) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/medications/${medication.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        toast.success('Medication deleted');
        setDeletingMedication(null);
        fetchMedications();
      } else {
        console.error('Failed to delete medication:', await response.text());
        toast.error('Failed to delete medication');
      }
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast.error('Error deleting medication');
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-pulse text-blue-600 mb-2">Loading medications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Medication Tracking</h2>
          <p className="text-sm text-muted-foreground">Manage your current medications and prescriptions</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <Pill className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{medications.filter(m => m.isActive).length}</p>
              <p className="text-sm text-gray-500">Active Medications</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{medications.filter(m => m.reminderEnabled).length}</p>
              <p className="text-sm text-gray-500">With Reminders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-gray-100 rounded-full mr-4">
              <FileText className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{medications.filter(m => !m.isActive).length}</p>
              <p className="text-sm text-gray-500">Discontinued</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medications List */}
      {medications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Pill className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No medications added yet</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Medication
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {medications.map((medication) => (
            <Card key={medication.id} className={!medication.isActive ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${medication.isActive ? 'bg-blue-50' : 'bg-gray-50'}`}>
                      <Pill className={`h-5 w-5 ${medication.isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <CardTitle>{medication.name}</CardTitle>
                      <CardDescription>{medication.dosage} - {medication.frequency}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {medication.isActive && <Badge>Active</Badge>}
                    {medication.reminderEnabled && <Badge variant="secondary">Reminders On</Badge>}
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(medication)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeletingMedication(medication)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {medication.startDate && (
                    <div>
                      <p className="text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Start Date
                      </p>
                      <p>{new Date(medication.startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {medication.endDate && (
                    <div>
                      <p className="text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        End Date
                      </p>
                      <p>{new Date(medication.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {medication.prescriber && (
                    <div>
                      <p className="text-gray-500 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Prescribed By
                      </p>
                      <p>{medication.prescriber}</p>
                    </div>
                  )}
                </div>
                {medication.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-gray-500 text-sm mb-1">Notes</p>
                    <p className="text-sm">{medication.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMedication ? 'Edit Medication' : 'Add New Medication'}</DialogTitle>
            <DialogDescription>
              {editingMedication ? 'Update medication details' : 'Enter the details of your new medication. This includes all prescriptions, OTC medications, supplements, and hormone therapy.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Medication Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Estradiol, Testosterone, Lisinopril"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage *</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => handleChange('dosage', e.target.value)}
                  placeholder="e.g., 10mg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => handleChange('frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Once daily">Once daily</SelectItem>
                  <SelectItem value="Twice daily">Twice daily</SelectItem>
                  <SelectItem value="Three times daily">Three times daily</SelectItem>
                  <SelectItem value="Four times daily">Four times daily</SelectItem>
                  <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
                  <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                  <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                  <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                  <SelectItem value="As needed">As needed</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescriber">Prescribed By</Label>
              <Input
                id="prescriber"
                value={formData.prescriber}
                onChange={(e) => handleChange('prescriber', e.target.value)}
                placeholder="Dr. Jane Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any additional information or instructions"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isActive" className="cursor-pointer">Currently taking this medication</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="reminderEnabled"
                checked={formData.reminderEnabled}
                onChange={(e) => handleChange('reminderEnabled', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="reminderEnabled" className="cursor-pointer">Enable reminders</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Medication'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingMedication} onOpenChange={() => setDeletingMedication(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingMedication?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingMedication && handleDelete(deletingMedication)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}