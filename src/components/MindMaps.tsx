import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Network, Plus, Share2, Download } from "lucide-react";

export function MindMaps({ accessToken }: { accessToken: string }) {
  const [maps, setMaps] = useState([
    {
      id: "1",
      title: "Treatment Plan Overview",
      nodes: 12,
      connections: 18,
      lastEdited: "2 days ago",
    },
    {
      id: "2",
      title: "Symptom Connections",
      nodes: 8,
      connections: 11,
      lastEdited: "1 week ago",
    },
    {
      id: "3",
      title: "Care Team Network",
      nodes: 6,
      connections: 9,
      lastEdited: "3 weeks ago",
    },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newMapTitle, setNewMapTitle] = useState("");

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mind Maps</h2>
          <p className="text-muted-foreground">
            Visualize connections between symptoms, treatments, and health factors
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Mind Map
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Mind Map</DialogTitle>
              <DialogDescription>
                Start a new mind map to organize your health information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Mind map title..."
                value={newMapTitle}
                onChange={(e) => setNewMapTitle(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateOpen(false)}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interactive Canvas</CardTitle>
          <CardDescription>
            Drag and drop nodes to create connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-12 text-center border-2 border-dashed">
            <Network className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <p className="text-lg font-medium mb-2">Mind Map Canvas</p>
            <p className="text-sm text-muted-foreground">
              Interactive node-based visualization system
            </p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4">Your Mind Maps</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {maps.map((map) => (
            <Card key={map.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Network className="h-5 w-5 text-purple-600" />
                  <Badge variant="outline">{map.nodes} nodes</Badge>
                </div>
                <CardTitle className="text-base">{map.title}</CardTitle>
                <CardDescription className="text-xs">
                  Last edited {map.lastEdited}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{map.connections} connections</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Open
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
