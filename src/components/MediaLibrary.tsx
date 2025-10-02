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
import { Image, Music, FileText, Upload, Play, Download, Trash2, Search } from "lucide-react";

interface MediaItem {
  id: string;
  title: string;
  type: "image" | "audio" | "video" | "document";
  category: string;
  description: string;
  fileName: string;
  fileSize: number;
  storagePath?: string;
  publicUrl?: string;
  tags: string[];
  uploadedAt: string;
}

const MEDIA_CATEGORIES = [
  "Art & Drawings",
  "Photos",
  "Music & Audio",
  "Videos",
  "Scanned Documents",
  "Therapeutic Content",
  "Personal Expression",
  "Other",
];

export function MediaLibrary({ accessToken }: { accessToken: string }) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [newMedia, setNewMedia] = useState<Partial<MediaItem>>({
    title: "",
    type: "image",
    category: "",
    description: "",
    tags: [],
  });

  const projectId = "cvsxfzllhhhpdyckdmqg";

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/media`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMediaItems(data.mediaItems || []);
      }
    } catch (error) {
      toast.error("Failed to load media library");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Auto-detect media type from file
      if (file.type.startsWith("image/")) {
        setNewMedia({ ...newMedia, type: "image", fileName: file.name });
      } else if (file.type.startsWith("audio/")) {
        setNewMedia({ ...newMedia, type: "audio", fileName: file.name });
      } else if (file.type.startsWith("video/")) {
        setNewMedia({ ...newMedia, type: "video", fileName: file.name });
      } else {
        setNewMedia({ ...newMedia, type: "document", fileName: file.name });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !newMedia.title || !newMedia.category) {
      toast.error("Please fill in all required fields and select a file");
      return;
    }

    setIsUploading(true);
    try {
      // Upload file
      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);

      const uploadResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/media/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: uploadFormData,
        }
      );

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();

        // Create media record
        const mediaData = {
          ...newMedia,
          storagePath: uploadData.storagePath,
          fileName: uploadData.fileName,
          fileSize: uploadData.fileSize,
          publicUrl: uploadData.publicUrl,
        };

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/media`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(mediaData),
          }
        );

        if (response.ok) {
          toast.success("Media uploaded successfully");
          setIsUploadOpen(false);
          setSelectedFile(null);
          setNewMedia({
            title: "",
            type: "image",
            category: "",
            description: "",
            tags: [],
          });
          fetchMedia();
        }
      } else {
        toast.error("Failed to upload file");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/media/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        toast.success("Media deleted successfully");
        fetchMedia();
      }
    } catch (error) {
      toast.error("Failed to delete media");
      console.error(error);
    }
  };

  const filteredMedia = mediaItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-5 w-5" />;
      case "audio":
        return <Music className="h-5 w-5" />;
      case "video":
        return <Play className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
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
          <h2 className="text-3xl font-bold tracking-tight">Media Library</h2>
          <p className="text-muted-foreground">
            Upload and manage your art, music, photos, and other media
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center flex-1">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {MEDIA_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Media</DialogTitle>
              <DialogDescription>
                Upload images, audio, video, or documents to your library
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newMedia.title}
                  onChange={(e) =>
                    setNewMedia({ ...newMedia, title: e.target.value })
                  }
                  placeholder="My artwork"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newMedia.category}
                  onValueChange={(value) =>
                    setNewMedia({ ...newMedia, category: value })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDIA_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newMedia.description}
                  onChange={(e) =>
                    setNewMedia({ ...newMedia, description: e.target.value })
                  }
                  placeholder="Describe this media..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUploadOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Media Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMedia.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getMediaIcon(item.type)}
                  <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                </div>
                <Badge variant="outline">{item.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{item.category}</span>
                <span>•</span>
                <span>{(item.fileSize / 1024).toFixed(2)} KB</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Upload className="h-8 w-8 mb-2" />
            <p>No media found. Upload your first item!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
