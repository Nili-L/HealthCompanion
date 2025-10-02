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
  FileText,
  Upload,
  Trash2,
  Eye,
  Download,
  Search,
  Filter,
  Plus,
  X,
} from "lucide-react";
import { projectId } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";

interface MedicalDocumentsProps {
  accessToken: string;
}

interface MedicalDocument {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  provider: string;
  fileReference: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // File storage fields
  storagePath?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  publicUrl?: string;
}

const DOCUMENT_CATEGORIES = [
  "Lab Results",
  "Prescription",
  "Medical Records",
  "Imaging Results",
  "Insurance Card",
  "Referral",
  "Discharge Summary",
  "Consent Form",
  "Other",
];

export function MedicalDocuments({ accessToken }: MedicalDocumentsProps) {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<MedicalDocument | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<MedicalDocument | null>(null);
  const [viewingDocument, setViewingDocument] = useState<MedicalDocument | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    date: "",
    provider: "",
    fileReference: "",
    tags: [] as string[],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileData, setUploadedFileData] = useState<{
    storagePath: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    publicUrl: string;
  } | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/documents`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        toast.error("Failed to load documents");
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Error loading documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return null;

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/documents/upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: uploadFormData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUploadedFileData(data);
        toast.success('File uploaded successfully');
        return data;
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload file');
        return null;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading file');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.category || !formData.date) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      // Upload file first if there's a new file selected
      let fileData = uploadedFileData;
      if (selectedFile && !editingDocument) {
        fileData = await handleFileUpload();
        if (!fileData) return; // Upload failed
      }

      const documentData = {
        ...formData,
        ...(fileData && {
          storagePath: fileData.storagePath,
          fileName: fileData.fileName,
          fileSize: fileData.fileSize,
          fileType: fileData.fileType,
          publicUrl: fileData.publicUrl,
        }),
      };

      const url = editingDocument
        ? `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/documents/${editingDocument.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/documents`;

      const response = await fetch(url, {
        method: editingDocument ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(documentData),
      });

      if (response.ok) {
        toast.success(editingDocument ? "Document updated" : "Document added");
        setDialogOpen(false);
        setEditingDocument(null);
        resetForm();
        fetchDocuments();
      } else {
        toast.error("Failed to save document");
      }
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Error saving document");
    }
  };

  const handleDelete = async (doc: MedicalDocument) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/documents/${doc.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Document deleted");
        setDeletingDocument(null);
        fetchDocuments();
      } else {
        toast.error("Failed to delete document");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Error deleting document");
    }
  };

  const handleDownload = async (doc: MedicalDocument) => {
    if (!doc.storagePath) {
      toast.error('No file attached to this document');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/documents/${doc.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Open download URL in new window
        window.open(data.downloadUrl, '_blank');
        toast.success('Download started');
      } else {
        toast.error('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Error downloading file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      description: "",
      date: "",
      provider: "",
      fileReference: "",
      tags: [],
    });
    setSelectedFile(null);
    setUploadedFileData(null);
  };

  const openEditDialog = (doc: MedicalDocument) => {
    setEditingDocument(doc);
    setFormData({
      title: doc.title,
      category: doc.category,
      description: doc.description,
      date: doc.date,
      provider: doc.provider,
      fileReference: doc.fileReference,
      tags: doc.tags,
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingDocument(null);
    resetForm();
    setDialogOpen(true);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, MedicalDocument[]>);

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
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2].map((j) => (
                <Skeleton key={j} className="h-20 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Medical Documents</h2>
          <p className="text-sm text-muted-foreground">
            Store and organize your medical records, prescriptions, and lab results
          </p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents by title, description, provider, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">Total Documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{Object.keys(groupedDocuments).length}</div>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredDocuments.length}</div>
            <p className="text-xs text-muted-foreground">Filtered Results</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || categoryFilter !== "all"
                  ? "Try adjusting your search or filter"
                  : "Get started by adding your first document"}
              </p>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([category, docs]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {category}
                  <Badge variant="secondary" className="ml-2">
                    {docs.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">{doc.title}</h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(doc.date).toLocaleDateString()}
                        </span>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 items-center">
                        {doc.provider && (
                          <Badge variant="outline" className="text-xs">
                            {doc.provider}
                          </Badge>
                        )}
                        {doc.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewingDocument(doc)}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {doc.storagePath && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(doc)}
                          title="Download"
                        >
                          <Download className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(doc)}
                        title="Edit"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingDocument(doc)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDocument ? "Edit Document" : "Add New Document"}
            </DialogTitle>
            <DialogDescription>
              Add or update document information. File references are for your records.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Document Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Blood Test Results"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Provider/Facility</Label>
                <Input
                  id="provider"
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({ ...formData, provider: e.target.value })
                  }
                  placeholder="e.g., Dr. Smith, Tel Aviv Medical Center"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the document contents"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileUpload">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload File</span>
                </div>
              </Label>
              <Input
                id="fileUpload"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                disabled={!!editingDocument || isUploading}
              />
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, Word, images, text files (max 10MB)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileReference">File Reference (Optional)</Label>
              <Input
                id="fileReference"
                value={formData.fileReference}
                onChange={(e) =>
                  setFormData({ ...formData, fileReference: e.target.value })
                }
                placeholder="File name or reference number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                  })
                }
                placeholder="e.g., urgent, follow-up, annual checkup"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUploading}>
              {isUploading ? "Uploading..." : editingDocument ? "Update" : "Add"} Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewingDocument?.title}</DialogTitle>
            <DialogDescription>
              {viewingDocument?.category} • {viewingDocument && new Date(viewingDocument.date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          {viewingDocument && (
            <div className="space-y-4 py-4">
              {viewingDocument.provider && (
                <div>
                  <Label className="text-xs text-muted-foreground">Provider</Label>
                  <p className="font-medium">{viewingDocument.provider}</p>
                </div>
              )}
              {viewingDocument.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p>{viewingDocument.description}</p>
                </div>
              )}
              {viewingDocument.fileName && (
                <div>
                  <Label className="text-xs text-muted-foreground">Attached File</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{viewingDocument.fileName}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(viewingDocument.fileSize! / 1024).toFixed(1)} KB)
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(viewingDocument)}
                      className="ml-auto"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
              {viewingDocument.fileReference && (
                <div>
                  <Label className="text-xs text-muted-foreground">File Reference</Label>
                  <p className="font-mono text-sm">{viewingDocument.fileReference}</p>
                </div>
              )}
              {viewingDocument.tags.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {viewingDocument.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingDocument}
        onOpenChange={() => setDeletingDocument(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingDocument?.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingDocument && handleDelete(deletingDocument)}
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
