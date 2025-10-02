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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Users, MessageCircle, Heart, Share2, Plus, Search } from "lucide-react";

interface Post {
  id: string;
  author: string;
  authorInitials: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  createdAt: string;
  isAnonymous: boolean;
}

const CATEGORIES = [
  "General Support",
  "Mental Health",
  "Chronic Illness",
  "Recovery Stories",
  "Tips & Advice",
  "Questions",
  "Resources",
];

export function CommunityPlatform({ accessToken }: { accessToken: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    content: "",
    category: "General Support",
    isAnonymous: false,
  });

  const projectId = "cvsxfzllhhhpdyckdmqg";

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/community/posts`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      toast.error("Failed to load community posts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) {
      toast.error("Please write something to share");
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/community/posts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPost),
        }
      );

      if (response.ok) {
        toast.success("Post shared successfully");
        setIsPostOpen(false);
        setNewPost({
          content: "",
          category: "General Support",
          isAnonymous: false,
        });
        fetchPosts();
      } else {
        toast.error("Failed to create post");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/community/posts/${postId}/like`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2 className="text-3xl font-bold tracking-tight">Community Platform</h2>
          <p className="text-muted-foreground">
            Connect with others, share experiences, and find support
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Dialog open={isPostOpen} onOpenChange={setIsPostOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Share Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share with Community</DialogTitle>
              <DialogDescription>
                Share your story, ask questions, or offer support
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  rows={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CATEGORIES.map((category) => (
                    <Badge
                      key={category}
                      variant={newPost.category === category ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setNewPost({ ...newPost, category })}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={newPost.isAnonymous}
                  onChange={(e) =>
                    setNewPost({ ...newPost, isAnonymous: e.target.checked })
                  }
                />
                <label htmlFor="anonymous" className="text-sm">
                  Post anonymously
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPostOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePost}>Share Post</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Community Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <Users className="h-5 w-5 text-blue-600 mb-2" />
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+12% this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <MessageCircle className="h-5 w-5 text-green-600 mb-2" />
            <CardTitle className="text-sm font-medium">Posts This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">347</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <Heart className="h-5 w-5 text-red-600 mb-2" />
            <CardTitle className="text-sm font-medium">Support Given</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,891</div>
            <p className="text-xs text-muted-foreground">Likes & comments</p>
          </CardContent>
        </Card>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>{post.authorInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {post.isAnonymous ? "Anonymous" : post.author}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{post.content}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {post.comments}
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Users className="h-8 w-8 mb-2" />
            <p>No posts found. Be the first to share something!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
