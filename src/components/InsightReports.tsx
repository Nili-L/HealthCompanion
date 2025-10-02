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
import { TrendingUp, TrendingDown, Activity, Brain, FileText, Download } from "lucide-react";

export function InsightReports({ accessToken }: { accessToken: string }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Health Insight Reports</h2>
        <p className="text-muted-foreground">
          AI-generated insights from your health data with side-by-side comparisons
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Mental Health Trends
            </CardTitle>
            <CardDescription>Analysis of mood and symptom patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Anxiety Levels</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Improving
                  </Badge>
                  <span className="text-sm font-medium">-15%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sleep Quality</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Better
                  </Badge>
                  <span className="text-sm font-medium">+22%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Stress Levels</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800">Stable</Badge>
                  <span className="text-sm font-medium">±2%</span>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Key Insight:</strong> Your anxiety symptoms have decreased by 15% over
                the past month. Sleep quality improvements correlate with reduced stress.
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Physical Health Trends
            </CardTitle>
            <CardDescription>Vital signs and symptom tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Blood Pressure</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Improved
                  </Badge>
                  <span className="text-sm font-medium">-8%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pain Levels</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Decreasing
                  </Badge>
                  <span className="text-sm font-medium">-12%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Energy Levels</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Increasing
                  </Badge>
                  <span className="text-sm font-medium">+18%</span>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Key Insight:</strong> Blood pressure improvements align with medication
                adherence. Pain reduction correlates with increased physical activity.
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Comprehensive Health Summary
          </CardTitle>
          <CardDescription>
            Last 30 days - Generated {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">87%</div>
              <p className="text-sm text-muted-foreground">Medication Adherence</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">24</div>
              <p className="text-sm text-muted-foreground">Symptom Entries</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">8</div>
              <p className="text-sm text-muted-foreground">Provider Interactions</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-2">Positive Trends</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Mental health scores showing consistent improvement</li>
                <li>• Medication adherence above target (80%+)</li>
                <li>• Regular symptom tracking provides valuable data</li>
                <li>• Active engagement with care team</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Areas for Attention</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Consider increasing physical activity tracking</li>
                <li>• Schedule follow-up appointment for lab results</li>
                <li>• Continue monitoring sleep patterns</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download PDF Report
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Email to Provider
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
