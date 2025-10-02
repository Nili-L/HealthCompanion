import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Activity, Pill, FileText, TrendingUp, Play } from "lucide-react";

export function TimelineVisualization({ accessToken }: { accessToken: string }) {
  const [selectedPeriod, setSelectedPeriod] = useState("year");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Health Timeline</h2>
        <p className="text-muted-foreground">
          Visualize your health journey through time with interactive 3D rendering
        </p>
      </div>

      <div className="flex gap-2">
        {["week", "month", "year", "all"].map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            onClick={() => setSelectedPeriod(period)}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Interactive Timeline
          </CardTitle>
          <CardDescription>
            Scroll through your health history and see changes over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              3D Timeline Visualization
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Interactive timeline viewer with depth perception and time-based animations
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: Pill, title: "Started New Medication", date: "2 weeks ago", color: "blue" },
              { icon: Activity, title: "Lab Results Improved", date: "1 month ago", color: "green" },
              { icon: FileText, title: "Annual Checkup", date: "3 months ago", color: "purple" },
            ].map((event, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className={`p-2 bg-${event.color}-50 rounded`}>
                  <event.icon className={`h-4 w-4 text-${event.color}-600`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trends Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Symptom Frequency</span>
              <Badge className="bg-green-100 text-green-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                Decreasing
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Medication Adherence</span>
              <Badge className="bg-green-100 text-green-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                Improving
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Overall Health Score</span>
              <Badge className="bg-blue-100 text-blue-800">Stable</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
