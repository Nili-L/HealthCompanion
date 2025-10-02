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
  Send,
  MessageSquare,
  User,
  Clock,
  CheckCheck,
  Paperclip,
  Search,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  threadId: string;
  subject: string;
  recipientName: string;
  recipientRole: string;
  senderName: string;
  senderRole: string;
  body: string;
  read: boolean;
  urgent: boolean;
  attachments: string[];
  sentAt: string;
  readAt?: string;
  createdAt: string;
}

interface MessageThread {
  id: string;
  subject: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: Message[];
}

export function SecureMessages({ accessToken, role }: { accessToken: string; role: 'patient' | 'provider' }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [newMessage, setNewMessage] = useState<Partial<Message>>({
    recipientName: "",
    recipientRole: role === "patient" ? "provider" : "patient",
    subject: "",
    body: "",
    urgent: false,
    attachments: [],
  });

  const projectId = "cvsxfzllhhhpdyckdmqg";

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    organizeThreads();
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/messages`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      toast.error("Failed to load messages");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const organizeThreads = () => {
    const threadMap = new Map<string, MessageThread>();

    messages.forEach((message) => {
      const threadId = message.threadId || message.id;

      if (!threadMap.has(threadId)) {
        threadMap.set(threadId, {
          id: threadId,
          subject: message.subject,
          participants: [message.senderName, message.recipientName],
          lastMessage: message.body,
          lastMessageAt: message.sentAt,
          unreadCount: !message.read ? 1 : 0,
          messages: [message],
        });
      } else {
        const thread = threadMap.get(threadId)!;
        thread.messages.push(message);
        if (new Date(message.sentAt) > new Date(thread.lastMessageAt)) {
          thread.lastMessage = message.body;
          thread.lastMessageAt = message.sentAt;
        }
        if (!message.read) {
          thread.unreadCount++;
        }
      }
    });

    const threadsArray = Array.from(threadMap.values()).sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );

    setThreads(threadsArray);
  };

  const handleSendMessage = async () => {
    if (!newMessage.recipientName || !newMessage.subject || !newMessage.body) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newMessage,
            senderName: "You",
            senderRole: role,
            sentAt: new Date().toISOString(),
            read: false,
          }),
        }
      );

      if (response.ok) {
        toast.success("Message sent successfully");
        setIsComposeOpen(false);
        setNewMessage({
          recipientName: "",
          recipientRole: role === "patient" ? "provider" : "patient",
          subject: "",
          body: "",
          urgent: false,
          attachments: [],
        });
        fetchMessages();
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const markAsRead = async (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message || message.read) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/messages/${messageId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...message,
            read: true,
            readAt: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredThreads = threads.filter(
    (thread) =>
      thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.participants.some((p) =>
        p.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      thread.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedThreadData = threads.find((t) => t.id === selectedThread);

  const handleReplyToThread = async () => {
    if (!replyText.trim() || !selectedThreadData) return;

    const firstMessage = selectedThreadData.messages[0];
    const recipientName =
      firstMessage.senderName === "You"
        ? firstMessage.recipientName
        : firstMessage.senderName;
    const recipientRole =
      firstMessage.senderName === "You"
        ? firstMessage.recipientRole
        : firstMessage.senderRole;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            threadId: selectedThreadData.id,
            recipientName,
            recipientRole,
            senderName: "You",
            senderRole: role,
            subject: selectedThreadData.subject,
            body: replyText,
            sentAt: new Date().toISOString(),
            read: false,
            urgent: false,
            attachments: [],
          }),
        }
      );

      if (response.ok) {
        toast.success("Reply sent");
        setReplyText("");
        fetchMessages();
      } else {
        toast.error("Failed to send reply");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
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
          <h2 className="text-3xl font-bold tracking-tight">Secure Messages</h2>
          <p className="text-muted-foreground">
            Communicate securely with your healthcare team
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">All conversations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {messages.filter((m) => !m.read).length}
            </div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Threads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{threads.length}</div>
            <p className="text-xs text-muted-foreground">Conversations</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4 h-[600px]">
        {/* Thread List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Compose Message</DialogTitle>
                    <DialogDescription>
                      {role === "patient"
                        ? "Send a secure message to your healthcare provider"
                        : "Send a secure message to your patient"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="recipient">Recipient</Label>
                      <Input
                        id="recipient"
                        value={newMessage.recipientName}
                        onChange={(e) =>
                          setNewMessage({ ...newMessage, recipientName: e.target.value })
                        }
                        placeholder={
                          role === "patient"
                            ? "Dr. Name or Care Team Member"
                            : "Patient Name"
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="recipient-role">Recipient Role</Label>
                      <Select
                        value={newMessage.recipientRole}
                        onValueChange={(value) =>
                          setNewMessage({ ...newMessage, recipientRole: value })
                        }
                      >
                        <SelectTrigger id="recipient-role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {role === "patient" ? (
                            <>
                              <SelectItem value="provider">Provider/Doctor</SelectItem>
                              <SelectItem value="nurse">Nurse</SelectItem>
                              <SelectItem value="therapist">Therapist</SelectItem>
                              <SelectItem value="admin">Administrative Staff</SelectItem>
                              <SelectItem value="patient">Other Patient (Forum)</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="patient">Patient</SelectItem>
                              <SelectItem value="family">Family Member</SelectItem>
                              <SelectItem value="caregiver">Caregiver</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={newMessage.subject}
                        onChange={(e) =>
                          setNewMessage({ ...newMessage, subject: e.target.value })
                        }
                        placeholder="Message subject"
                      />
                    </div>
                    <div>
                      <Label htmlFor="body">Message</Label>
                      <Textarea
                        id="body"
                        value={newMessage.body}
                        onChange={(e) =>
                          setNewMessage({ ...newMessage, body: e.target.value })
                        }
                        placeholder="Type your message here..."
                        rows={6}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="urgent"
                        checked={newMessage.urgent}
                        onChange={(e) =>
                          setNewMessage({ ...newMessage, urgent: e.target.checked })
                        }
                        className="h-4 w-4"
                      />
                      <Label htmlFor="urgent" className="cursor-pointer">
                        Mark as urgent
                      </Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendMessage}>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[450px]">
              <div className="space-y-1 p-4">
                {filteredThreads.map((thread) => (
                  <div
                    key={thread.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedThread === thread.id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedThread(thread.id);
                      thread.messages.forEach((msg) => {
                        if (!msg.read) markAsRead(msg.id);
                      });
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">
                            {thread.subject}
                          </p>
                          {thread.unreadCount > 0 && (
                            <Badge variant="default" className="text-xs">
                              {thread.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {thread.lastMessage}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(thread.lastMessageAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredThreads.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No messages found
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message View */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedThreadData ? selectedThreadData.subject : "Select a conversation"}
            </CardTitle>
            {selectedThreadData && (
              <CardDescription>
                With: {selectedThreadData.participants.filter((p) => p !== "You").join(", ")}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {selectedThreadData ? (
              <>
                <ScrollArea className="h-[350px]">
                  <div className="space-y-4">
                    {selectedThreadData.messages
                      .sort(
                        (a, b) =>
                          new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
                      )
                      .map((message, idx) => {
                        const isFromMe = message.senderName === "You";
                        return (
                          <div key={idx}>
                            <div
                              className={`flex ${
                                isFromMe ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-4 ${
                                  isFromMe
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-900"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    {message.senderName}
                                  </span>
                                  {message.urgent && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs ml-auto"
                                    >
                                      Urgent
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm whitespace-pre-wrap">
                                  {message.body}
                                </p>
                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="mt-2 flex items-center gap-1 text-xs opacity-90">
                                    <Paperclip className="h-3 w-3" />
                                    {message.attachments.length} attachment(s)
                                  </div>
                                )}
                                <div
                                  className={`flex items-center gap-2 mt-2 text-xs ${
                                    isFromMe ? "opacity-90" : "text-muted-foreground"
                                  }`}
                                >
                                  <Clock className="h-3 w-3" />
                                  {new Date(message.sentAt).toLocaleString()}
                                  {message.read && isFromMe && (
                                    <CheckCheck className="h-3 w-3 ml-auto" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
                <div className="mt-4 space-y-2 border-t pt-4">
                  <Label htmlFor="reply">Reply</Label>
                  <Textarea
                    id="reply"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        handleReplyToThread();
                      }
                    }}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleReplyToThread}
                      disabled={!replyText.trim()}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[450px] text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
