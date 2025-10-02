import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Scan, Upload, FileText, CheckCircle, Clock } from "lucide-react";

interface ScanResult {
  id: string;
  fileName: string;
  uploadedAt: string;
  status: "processing" | "completed" | "failed";
  extractedText?: string;
  confidence?: number;
  documentType?: string;
}

export function OCRScanning({ accessToken }: { accessToken: string }) {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const projectId = "cvsxfzllhhhpdyckdmqg";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to scan");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/ocr/scan`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success("Document scanned successfully");
        setScans([data.scanResult, ...scans]);
        setIsUploadOpen(false);
        setSelectedFile(null);
      } else {
        toast.error("Failed to scan document");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">OCR Document Scanning</h2>
          <p className="text-muted-foreground">
            Extract text from medical documents, prescriptions, and images
          </p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Scan Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Scan Document with OCR</DialogTitle>
              <DialogDescription>
                Upload an image or PDF to extract text automatically
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Document File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Supported formats:</strong> Images (JPG, PNG, GIF) and PDF files.
                  Text will be extracted automatically using OCR technology.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUploadOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button onClick={handleScan} disabled={isProcessing}>
                {isProcessing ? "Scanning..." : "Start Scan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Feature Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <Scan className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle className="text-sm font-medium">
              Automatic Text Extraction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Extract text from medical documents, prescriptions, and handwritten notes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle className="text-sm font-medium">High Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Advanced OCR technology provides accurate text recognition
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <FileText className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle className="text-sm font-medium">
              Document Organization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Automatically categorize and organize extracted medical information
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Scan Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Scans</h3>
        {scans.length > 0 ? (
          <div className="space-y-4">
            {scans.map((scan) => (
              <Card key={scan.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{scan.fileName}</CardTitle>
                      <CardDescription>
                        {new Date(scan.uploadedAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(scan.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {scan.confidence && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <Badge variant="outline">{scan.confidence}%</Badge>
                    </div>
                  )}
                  {scan.documentType && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <Badge>{scan.documentType}</Badge>
                    </div>
                  )}
                  {scan.extractedText && (
                    <div>
                      <Label className="text-sm font-medium">Extracted Text:</Label>
                      <Textarea
                        value={scan.extractedText}
                        readOnly
                        className="mt-2 font-mono text-sm"
                        rows={6}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Scan className="h-8 w-8 mb-2" />
              <p>No scanned documents yet. Upload your first document!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
