import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, HelpCircle, FileText, Video } from "lucide-react";

const FAQ_ITEMS = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How do I update my profile information?",
        a: "Navigate to 'My Profile' from the dashboard and click the edit button to update your information.",
      },
      {
        q: "How do I upload medical documents?",
        a: "Go to 'Medical Documents', click 'Upload Document', select your file, and fill in the details.",
      },
    ],
  },
  {
    category: "Appointments",
    questions: [
      {
        q: "How do I schedule an appointment?",
        a: "Visit 'Appointment Scheduling', choose your provider and available time slot, then confirm.",
      },
      {
        q: "Can I cancel or reschedule an appointment?",
        a: "Yes, view your appointment and click 'Reschedule' or 'Cancel'. Please provide at least 24 hours notice.",
      },
    ],
  },
  {
    category: "Medications",
    questions: [
      {
        q: "How do I track my medications?",
        a: "Use 'Medication Tracking' to add your medications with dosages, schedules, and set reminders.",
      },
      {
        q: "Can I request prescription refills?",
        a: "Yes, go to 'Medication Tracking', select your medication, and click 'Request Refill'.",
      },
    ],
  },
  {
    category: "Privacy & Security",
    questions: [
      {
        q: "Is my health information secure?",
        a: "Yes, all data is encrypted and compliant with HIPAA regulations. We use industry-standard security practices.",
      },
      {
        q: "Who can access my medical records?",
        a: "Only you and authorized healthcare providers on your care team can access your records.",
      },
    ],
  },
];

const GUIDES = [
  {
    title: "Getting Started Guide",
    description: "Learn the basics of using the health portal",
    duration: "5 min read",
    icon: BookOpen,
  },
  {
    title: "Video Tutorials",
    description: "Step-by-step video guides for common tasks",
    duration: "10 videos",
    icon: Video,
  },
  {
    title: "Feature Documentation",
    description: "Detailed documentation for all features",
    duration: "15 min read",
    icon: FileText,
  },
];

export function HelpManual({ accessToken }: { accessToken: string }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFAQs = FAQ_ITEMS.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.a.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Help & Support</h2>
        <p className="text-muted-foreground">
          Find answers, tutorials, and documentation
        </p>
      </div>

      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for help..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {GUIDES.map((guide, i) => (
          <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <guide.icon className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-base">{guide.title}</CardTitle>
              <CardDescription className="text-xs">{guide.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">{guide.duration}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Find answers to common questions about using the portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFAQs.length > 0 ? (
            <div className="space-y-6">
              {filteredFAQs.map((category, catIdx) => (
                <div key={catIdx}>
                  <h3 className="font-semibold mb-3">{category.category}</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((item, qIdx) => (
                      <AccordionItem key={qIdx} value={`item-${catIdx}-${qIdx}`}>
                        <AccordionTrigger className="text-left">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No results found. Try different search terms.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Still Need Help?</CardTitle>
          <CardDescription>Contact our support team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <strong>Email:</strong> support@healthportal.co.il
          </p>
          <p className="text-sm">
            <strong>Phone (Israel):</strong> *6050 or 03-123-4567
          </p>
          <p className="text-sm">
            <strong>Phone (International):</strong> +972-3-123-4567
          </p>
          <p className="text-sm">
            <strong>Hours:</strong> Sunday - Thursday, 8:00 - 20:00 (Israel Time)
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Support available in Hebrew, English, Arabic, and Russian
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
