import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Copy, Edit } from "lucide-react";

const TEMPLATES = [
  {
    id: "1",
    title: "Medical Records Request",
    category: "Records",
    description: "Request copies of your medical records",
    fields: ["Full Name", "Date of Birth", "Date Range", "Purpose"],
  },
  {
    id: "2",
    title: "Referral Request",
    category: "Referrals",
    description: "Request a specialist referral",
    fields: ["Specialist Type", "Reason", "Preferred Location"],
  },
  {
    id: "3",
    title: "Prescription Refill",
    category: "Medications",
    description: "Request medication refill",
    fields: ["Medication Name", "Dosage", "Pharmacy"],
  },
  {
    id: "4",
    title: "Appointment Request",
    category: "Appointments",
    description: "Request a new appointment",
    fields: ["Provider", "Reason for Visit", "Preferred Dates"],
  },
  {
    id: "5",
    title: "Insurance Authorization",
    category: "Insurance",
    description: "Request pre-authorization",
    fields: ["Procedure/Treatment", "Provider", "Medical Necessity"],
  },
  {
    id: "6",
    title: "Lab Results Request",
    category: "Labs",
    description: "Request lab test results",
    fields: ["Test Name", "Date of Test", "Delivery Method"],
  },
];

export function RequestTemplates({ accessToken }: { accessToken: string }) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", ...Array.from(new Set(TEMPLATES.map((t) => t.category)))];

  const filteredTemplates =
    selectedCategory === "all"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Request Templates</h2>
        <p className="text-muted-foreground">
          Pre-filled forms for common healthcare requests
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <FileText className="h-5 w-5 text-blue-600" />
                <Badge variant="outline">{template.category}</Badge>
              </div>
              <CardTitle className="text-base">{template.title}</CardTitle>
              <CardDescription className="text-xs">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium mb-2">Required Fields:</p>
                <div className="flex flex-wrap gap-1">
                  {template.fields.map((field) => (
                    <Badge key={field} variant="outline" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Use Template
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
