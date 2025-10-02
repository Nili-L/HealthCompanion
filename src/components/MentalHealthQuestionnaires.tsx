import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import {
  Plus,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Brain,
  Heart,
  Shield,
  Zap,
  User,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface QuestionnaireResponse {
  id: string;
  questionnaireName: string;
  questionnaireType: string;
  responses: Record<string, number>;
  totalScore: number;
  severity: string;
  interpretation: string;
  completedAt: string;
  createdAt: string;
}

interface Question {
  id: string;
  text: string;
  options: { value: number; label: string }[];
}

interface Questionnaire {
  id: string;
  name: string;
  acronym: string;
  description: string;
  type: string;
  questions: Question[];
  scoring: {
    min: number;
    max: number;
    ranges: {
      label: string;
      min: number;
      max: number;
      interpretation: string;
    }[];
  };
  icon: any;
}

// PHQ-9: Patient Health Questionnaire for Depression
const PHQ9_QUESTIONS: Question[] = [
  {
    id: "phq9_1",
    text: "Little interest or pleasure in doing things",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "phq9_2",
    text: "Feeling down, depressed, or hopeless",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "phq9_3",
    text: "Trouble falling or staying asleep, or sleeping too much",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "phq9_4",
    text: "Feeling tired or having little energy",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "phq9_5",
    text: "Poor appetite or overeating",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "phq9_6",
    text: "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "phq9_7",
    text: "Trouble concentrating on things, such as reading the newspaper or watching television",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "phq9_8",
    text: "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "phq9_9",
    text: "Thoughts that you would be better off dead, or of hurting yourself",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
];

// GAD-7: Generalized Anxiety Disorder
const GAD7_QUESTIONS: Question[] = [
  {
    id: "gad7_1",
    text: "Feeling nervous, anxious, or on edge",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "gad7_2",
    text: "Not being able to stop or control worrying",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "gad7_3",
    text: "Worrying too much about different things",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "gad7_4",
    text: "Trouble relaxing",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "gad7_5",
    text: "Being so restless that it is hard to sit still",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "gad7_6",
    text: "Becoming easily annoyed or irritable",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "gad7_7",
    text: "Feeling afraid, as if something awful might happen",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
];

// PCL-5: PTSD Checklist
const PCL5_QUESTIONS: Question[] = [
  {
    id: "pcl5_1",
    text: "Repeated, disturbing, and unwanted memories of the stressful experience",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_2",
    text: "Repeated, disturbing dreams of the stressful experience",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_3",
    text: "Suddenly feeling or acting as if the stressful experience were actually happening again (as if you were actually back there reliving it)",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_4",
    text: "Feeling very upset when something reminded you of the stressful experience",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_5",
    text: "Having strong physical reactions when something reminded you of the stressful experience (for example, heart pounding, trouble breathing, sweating)",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_6",
    text: "Avoiding memories, thoughts, or feelings related to the stressful experience",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_7",
    text: "Avoiding external reminders of the stressful experience (for example, people, places, conversations, activities, objects, or situations)",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_8",
    text: "Trouble remembering important parts of the stressful experience",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_9",
    text: "Having strong negative beliefs about yourself, other people, or the world",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_10",
    text: "Blaming yourself or someone else for the stressful experience or what happened after it",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_11",
    text: "Having strong negative feelings such as fear, horror, anger, guilt, or shame",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_12",
    text: "Loss of interest in activities that you used to enjoy",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_13",
    text: "Feeling distant or cut off from other people",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_14",
    text: "Trouble experiencing positive feelings (for example, being unable to feel happiness or have loving feelings for people close to you)",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_15",
    text: "Irritable behavior, angry outbursts, or acting aggressively",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_16",
    text: "Taking too many risks or doing things that could cause you harm",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_17",
    text: "Being 'superalert' or watchful or on guard",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_18",
    text: "Feeling jumpy or easily startled",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_19",
    text: "Having difficulty concentrating",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "pcl5_20",
    text: "Trouble falling or staying asleep",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "Quite a bit" },
      { value: 4, label: "Extremely" },
    ],
  },
];

// ASRS: Adult ADHD Self-Report Scale (Part A - 6 questions)
const ASRS_QUESTIONS: Question[] = [
  {
    id: "asrs_1",
    text: "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" },
      { value: 4, label: "Very Often" },
    ],
  },
  {
    id: "asrs_2",
    text: "How often do you have difficulty getting things in order when you have to do a task that requires organization?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" },
      { value: 4, label: "Very Often" },
    ],
  },
  {
    id: "asrs_3",
    text: "How often do you have problems remembering appointments or obligations?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" },
      { value: 4, label: "Very Often" },
    ],
  },
  {
    id: "asrs_4",
    text: "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" },
      { value: 4, label: "Very Often" },
    ],
  },
  {
    id: "asrs_5",
    text: "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" },
      { value: 4, label: "Very Often" },
    ],
  },
  {
    id: "asrs_6",
    text: "How often do you feel overly active and compelled to do things, like you were driven by a motor?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" },
      { value: 4, label: "Very Often" },
    ],
  },
];

// PSS-10: Perceived Stress Scale
const PSS10_QUESTIONS: Question[] = [
  {
    id: "pss10_1",
    text: "In the last month, how often have you been upset because of something that happened unexpectedly?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Almost Never" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Fairly Often" },
      { value: 4, label: "Very Often" },
    ],
  },
  {
    id: "pss10_2",
    text: "In the last month, how often have you felt that you were unable to control the important things in your life?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Almost Never" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Fairly Often" },
      { value: 4, label: "Very Often" },
    ],
  },
  {
    id: "pss10_3",
    text: "In the last month, how often have you felt nervous and stressed?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Almost Never" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Fairly Often" },
      { value: 4, label: "Very Often" },
    ],
  },
  {
    id: "pss10_4",
    text: "In the last month, how often have you felt confident about your ability to handle your personal problems?",
    options: [
      { value: 4, label: "Never" },
      { value: 3, label: "Almost Never" },
      { value: 2, label: "Sometimes" },
      { value: 1, label: "Fairly Often" },
      { value: 0, label: "Very Often" },
    ],
  },
  {
    id: "pss10_5",
    text: "In the last month, how often have you felt that things were going your way?",
    options: [
      { value: 4, label: "Never" },
      { value: 3, label: "Almost Never" },
      { value: 2, label: "Sometimes" },
      { value: 1, label: "Fairly Often" },
      { value: 0, label: "Very Often" },
    ],
  },
  {
    id: "pss10_6",
    text: "In the last month, how often have you found that you could not cope with all the things that you had to do?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Almost Never" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Fairly Often" },
      { value: 4, label: "Very Often" },
    ],
  },
  {
    id: "pss10_7",
    text: "In the last month, how often have you been able to control irritations in your life?",
    options: [
      { value: 4, label: "Never" },
      { value: 3, label: "Almost Never" },
      { value: 2, label: "Sometimes" },
      { value: 1, label: "Fairly Often" },
      { value: 0, label: "Very Often" },
    ],
  },
  {
    id: "pss10_8",
    text: "In the last month, how often have you felt that you were on top of things?",
    options: [
      { value: 4, label: "Never" },
      { value: 3, label: "Almost Never" },
      { value: 2, label: "Sometimes" },
      { value: 1, label: "Fairly Often" },
      { value: 0, label: "Very Often" },
    ],
  },
  {
    id: "pss10_9",
    text: "In the last month, how often have you been angered because of things that were outside of your control?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Almost Never" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Fairly Often" },
      { value: 4, label: "Very Often" },
    ],
  },
  {
    id: "pss10_10",
    text: "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Almost Never" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Fairly Often" },
      { value: 4, label: "Very Often" },
    ],
  },
];

// Y-BOCS: Yale-Brown Obsessive Compulsive Scale (Severity Scale - 10 questions)
const YBOCS_QUESTIONS: Question[] = [
  {
    id: "ybocs_1",
    text: "Time occupied by obsessive thoughts: How much of your time is occupied by obsessive thoughts?",
    options: [
      { value: 0, label: "None" },
      { value: 1, label: "Less than 1 hour/day" },
      { value: 2, label: "1-3 hours/day" },
      { value: 3, label: "3-8 hours/day" },
      { value: 4, label: "More than 8 hours/day" },
    ],
  },
  {
    id: "ybocs_2",
    text: "Interference due to obsessive thoughts: How much do your obsessive thoughts interfere with your work, school, social, or other important activities?",
    options: [
      { value: 0, label: "None" },
      { value: 1, label: "Mild, slight interference" },
      { value: 2, label: "Moderate, definite interference" },
      { value: 3, label: "Severe interference" },
      { value: 4, label: "Extreme, incapacitating" },
    ],
  },
  {
    id: "ybocs_3",
    text: "Distress associated with obsessive thoughts: How much distress do your obsessive thoughts cause you?",
    options: [
      { value: 0, label: "None" },
      { value: 1, label: "Mild, not too disturbing" },
      { value: 2, label: "Moderate, disturbing but manageable" },
      { value: 3, label: "Severe, very disturbing" },
      { value: 4, label: "Extreme, near constant disabling distress" },
    ],
  },
  {
    id: "ybocs_4",
    text: "Resistance against obsessions: How much effort do you make to resist the obsessive thoughts?",
    options: [
      { value: 0, label: "Always resist" },
      { value: 1, label: "Try to resist most of the time" },
      { value: 2, label: "Make some effort to resist" },
      { value: 3, label: "Yield to obsessions reluctantly" },
      { value: 4, label: "Completely yield to obsessions" },
    ],
  },
  {
    id: "ybocs_5",
    text: "Degree of control over obsessive thoughts: How much control do you have over your obsessive thoughts?",
    options: [
      { value: 0, label: "Complete control" },
      { value: 1, label: "Much control" },
      { value: 2, label: "Moderate control" },
      { value: 3, label: "Little control" },
      { value: 4, label: "No control" },
    ],
  },
  {
    id: "ybocs_6",
    text: "Time spent performing compulsive behaviors: How much time do you spend performing compulsive behaviors?",
    options: [
      { value: 0, label: "None" },
      { value: 1, label: "Less than 1 hour/day" },
      { value: 2, label: "1-3 hours/day" },
      { value: 3, label: "3-8 hours/day" },
      { value: 4, label: "More than 8 hours/day" },
    ],
  },
  {
    id: "ybocs_7",
    text: "Interference due to compulsive behaviors: How much do your compulsive behaviors interfere with your work, school, social, or other important activities?",
    options: [
      { value: 0, label: "None" },
      { value: 1, label: "Mild, slight interference" },
      { value: 2, label: "Moderate, definite interference" },
      { value: 3, label: "Severe interference" },
      { value: 4, label: "Extreme, incapacitating" },
    ],
  },
  {
    id: "ybocs_8",
    text: "Distress associated with compulsive behavior: How would you feel if prevented from performing your compulsion(s)?",
    options: [
      { value: 0, label: "Not at all anxious" },
      { value: 1, label: "Slightly anxious" },
      { value: 2, label: "Moderately anxious" },
      { value: 3, label: "Severely anxious" },
      { value: 4, label: "Extremely anxious, incapacitating" },
    ],
  },
  {
    id: "ybocs_9",
    text: "Resistance against compulsions: How much effort do you make to resist the compulsions?",
    options: [
      { value: 0, label: "Always resist" },
      { value: 1, label: "Try to resist most of the time" },
      { value: 2, label: "Make some effort to resist" },
      { value: 3, label: "Yield to compulsions reluctantly" },
      { value: 4, label: "Completely yield to compulsions" },
    ],
  },
  {
    id: "ybocs_10",
    text: "Degree of control over compulsive behavior: How strong is the drive to perform the compulsive behavior?",
    options: [
      { value: 0, label: "Complete control" },
      { value: 1, label: "Much control" },
      { value: 2, label: "Moderate control" },
      { value: 3, label: "Little control" },
      { value: 4, label: "No control" },
    ],
  },
];

const QUESTIONNAIRES: Questionnaire[] = [
  {
    id: "phq9",
    name: "Patient Health Questionnaire-9",
    acronym: "PHQ-9",
    description: "Depression screening and severity assessment",
    type: "depression",
    questions: PHQ9_QUESTIONS,
    scoring: {
      min: 0,
      max: 27,
      ranges: [
        {
          label: "Minimal",
          min: 0,
          max: 4,
          interpretation: "Minimal or no depression. Monitor symptoms.",
        },
        {
          label: "Mild",
          min: 5,
          max: 9,
          interpretation: "Mild depression. Consider watchful waiting and repeat screening.",
        },
        {
          label: "Moderate",
          min: 10,
          max: 14,
          interpretation: "Moderate depression. Consider treatment including counseling or medication.",
        },
        {
          label: "Moderately Severe",
          min: 15,
          max: 19,
          interpretation: "Moderately severe depression. Active treatment with medication and/or psychotherapy recommended.",
        },
        {
          label: "Severe",
          min: 20,
          max: 27,
          interpretation: "Severe depression. Immediate treatment with medication and psychotherapy strongly recommended.",
        },
      ],
    },
    icon: Brain,
  },
  {
    id: "gad7",
    name: "Generalized Anxiety Disorder-7",
    acronym: "GAD-7",
    description: "Anxiety screening and severity assessment",
    type: "anxiety",
    questions: GAD7_QUESTIONS,
    scoring: {
      min: 0,
      max: 21,
      ranges: [
        {
          label: "Minimal",
          min: 0,
          max: 4,
          interpretation: "Minimal anxiety. Monitor symptoms.",
        },
        {
          label: "Mild",
          min: 5,
          max: 9,
          interpretation: "Mild anxiety. Watchful waiting may be appropriate.",
        },
        {
          label: "Moderate",
          min: 10,
          max: 14,
          interpretation: "Moderate anxiety. Consider treatment options.",
        },
        {
          label: "Severe",
          min: 15,
          max: 21,
          interpretation: "Severe anxiety. Active treatment recommended.",
        },
      ],
    },
    icon: Zap,
  },
  {
    id: "pcl5",
    name: "PTSD Checklist for DSM-5",
    acronym: "PCL-5",
    description: "PTSD symptom assessment",
    type: "ptsd",
    questions: PCL5_QUESTIONS,
    scoring: {
      min: 0,
      max: 80,
      ranges: [
        {
          label: "Low",
          min: 0,
          max: 30,
          interpretation: "Low PTSD symptom severity. Monitor symptoms.",
        },
        {
          label: "Moderate",
          min: 31,
          max: 49,
          interpretation: "Moderate PTSD symptoms. Consider clinical evaluation.",
        },
        {
          label: "High",
          min: 50,
          max: 80,
          interpretation: "High PTSD symptom severity. Clinical evaluation and treatment recommended.",
        },
      ],
    },
    icon: Shield,
  },
  {
    id: "asrs",
    name: "Adult ADHD Self-Report Scale",
    acronym: "ASRS-v1.1",
    description: "ADHD screening for adults",
    type: "adhd",
    questions: ASRS_QUESTIONS,
    scoring: {
      min: 0,
      max: 24,
      ranges: [
        {
          label: "Low",
          min: 0,
          max: 13,
          interpretation: "Low likelihood of ADHD. Symptoms not consistent with ADHD.",
        },
        {
          label: "High",
          min: 14,
          max: 24,
          interpretation: "High likelihood of ADHD. Clinical evaluation recommended.",
        },
      ],
    },
    icon: Zap,
  },
  {
    id: "pss10",
    name: "Perceived Stress Scale",
    acronym: "PSS-10",
    description: "Measure of perceived stress over the last month",
    type: "stress",
    questions: PSS10_QUESTIONS,
    scoring: {
      min: 0,
      max: 40,
      ranges: [
        {
          label: "Low",
          min: 0,
          max: 13,
          interpretation: "Low perceived stress. Good stress management.",
        },
        {
          label: "Moderate",
          min: 14,
          max: 26,
          interpretation: "Moderate perceived stress. Consider stress management techniques.",
        },
        {
          label: "High",
          min: 27,
          max: 40,
          interpretation: "High perceived stress. Stress management and support recommended.",
        },
      ],
    },
    icon: AlertCircle,
  },
  {
    id: "ybocs",
    name: "Yale-Brown Obsessive Compulsive Scale",
    acronym: "Y-BOCS",
    description: "OCD symptom severity assessment",
    type: "ocd",
    questions: YBOCS_QUESTIONS,
    scoring: {
      min: 0,
      max: 40,
      ranges: [
        {
          label: "Subclinical",
          min: 0,
          max: 7,
          interpretation: "Subclinical OCD. Symptoms are minimal.",
        },
        {
          label: "Mild",
          min: 8,
          max: 15,
          interpretation: "Mild OCD. Symptoms are noticeable but manageable.",
        },
        {
          label: "Moderate",
          min: 16,
          max: 23,
          interpretation: "Moderate OCD. Symptoms significantly interfere with functioning.",
        },
        {
          label: "Severe",
          min: 24,
          max: 31,
          interpretation: "Severe OCD. Symptoms cause substantial impairment.",
        },
        {
          label: "Extreme",
          min: 32,
          max: 40,
          interpretation: "Extreme OCD. Symptoms are completely debilitating.",
        },
      ],
    },
    icon: Brain,
  },
];

export function MentalHealthQuestionnaires({ accessToken }: { accessToken: string }) {
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const projectId = "cvsxfzllhhhpdyckdmqg";

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/questionnaires`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResponses(data.responses || []);
      }
    } catch (error) {
      toast.error("Failed to load questionnaires");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startQuestionnaire = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setCurrentAnswers({});
    setCurrentQuestion(0);
    setIsDialogOpen(true);
  };

  const handleAnswer = (questionId: string, value: number) => {
    setCurrentAnswers({ ...currentAnswers, [questionId]: value });
  };

  const nextQuestion = () => {
    if (selectedQuestionnaire && currentQuestion < selectedQuestionnaire.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    return Object.values(currentAnswers).reduce((sum, val) => sum + val, 0);
  };

  const getSeverity = (score: number, questionnaire: Questionnaire) => {
    const range = questionnaire.scoring.ranges.find(
      (r) => score >= r.min && score <= r.max
    );
    return range || questionnaire.scoring.ranges[0];
  };

  const submitQuestionnaire = async () => {
    if (!selectedQuestionnaire) return;

    const totalScore = calculateScore();
    const severity = getSeverity(totalScore, selectedQuestionnaire);

    const response: Partial<QuestionnaireResponse> = {
      questionnaireName: selectedQuestionnaire.name,
      questionnaireType: selectedQuestionnaire.type,
      responses: currentAnswers,
      totalScore,
      severity: severity.label,
      interpretation: severity.interpretation,
      completedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/questionnaires`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(response),
        }
      );

      if (res.ok) {
        toast.success("Questionnaire completed successfully");
        setIsDialogOpen(false);
        setSelectedQuestionnaire(null);
        setCurrentAnswers({});
        setCurrentQuestion(0);
        fetchResponses();
      } else {
        toast.error("Failed to save questionnaire");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const isQuestionAnswered = (questionId: string) => {
    return currentAnswers[questionId] !== undefined;
  };

  const areAllQuestionsAnswered = () => {
    if (!selectedQuestionnaire) return false;
    return selectedQuestionnaire.questions.every((q) => isQuestionAnswered(q.id));
  };

  const getProgressPercentage = () => {
    if (!selectedQuestionnaire) return 0;
    const answered = selectedQuestionnaire.questions.filter((q) =>
      isQuestionAnswered(q.id)
    ).length;
    return (answered / selectedQuestionnaire.questions.length) * 100;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "minimal":
      case "low":
      case "subclinical":
        return "bg-green-50 text-green-700 border-green-200";
      case "mild":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "moderate":
      case "moderately severe":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "severe":
      case "high":
      case "extreme":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
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
          <h2 className="text-3xl font-bold tracking-tight">
            Mental Health Questionnaires
          </h2>
          <p className="text-muted-foreground">
            Evidence-based screening tools for mental health assessment
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responses.length}</div>
            <p className="text-xs text-muted-foreground">Total assessments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{QUESTIONNAIRES.length}</div>
            <p className="text-xs text-muted-foreground">Screening tools</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                responses.filter((r) => {
                  const monthAgo = new Date();
                  monthAgo.setMonth(monthAgo.getMonth() - 1);
                  return new Date(r.completedAt) >= monthAgo;
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Recent completions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available Questionnaires</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {QUESTIONNAIRES.map((questionnaire) => {
              const Icon = questionnaire.icon;
              return (
                <Card key={questionnaire.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{questionnaire.acronym}</CardTitle>
                        <CardDescription className="mt-1">
                          {questionnaire.name}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {questionnaire.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {questionnaire.questions.length} questions
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => startQuestionnaire(questionnaire)}
                      >
                        Start
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {responses.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
                No completed questionnaires yet
              </CardContent>
            </Card>
          ) : (
            responses
              .sort(
                (a, b) =>
                  new Date(b.completedAt).getTime() -
                  new Date(a.completedAt).getTime()
              )
              .map((response) => (
                <Card key={response.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{response.questionnaireName}</CardTitle>
                        <CardDescription>
                          Completed {new Date(response.completedAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge className={getSeverityColor(response.severity)}>
                        {response.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Score:</span>
                        <span className="text-2xl font-bold">
                          {response.totalScore}
                        </span>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <strong>Interpretation:</strong> {response.interpretation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedQuestionnaire && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedQuestionnaire.acronym}</DialogTitle>
                <DialogDescription>
                  {selectedQuestionnaire.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Question {currentQuestion + 1} of{" "}
                      {selectedQuestionnaire.questions.length}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(getProgressPercentage())}% complete
                    </span>
                  </div>
                  <Progress value={getProgressPercentage()} />
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-medium">
                      {selectedQuestionnaire.questions[currentQuestion].text}
                    </p>
                  </div>

                  <RadioGroup
                    value={
                      currentAnswers[
                        selectedQuestionnaire.questions[currentQuestion].id
                      ]?.toString() || ""
                    }
                    onValueChange={(value) =>
                      handleAnswer(
                        selectedQuestionnaire.questions[currentQuestion].id,
                        parseInt(value)
                      )
                    }
                  >
                    <div className="space-y-3">
                      {selectedQuestionnaire.questions[currentQuestion].options.map(
                        (option) => (
                          <div
                            key={option.value}
                            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <RadioGroupItem
                              value={option.value.toString()}
                              id={`option-${option.value}`}
                            />
                            <Label
                              htmlFor={`option-${option.value}`}
                              className="flex-1 cursor-pointer"
                            >
                              {option.label}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  <div className="flex gap-2">
                    {currentQuestion <
                    selectedQuestionnaire.questions.length - 1 ? (
                      <Button
                        onClick={nextQuestion}
                        disabled={
                          !isQuestionAnswered(
                            selectedQuestionnaire.questions[currentQuestion].id
                          )
                        }
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        onClick={submitQuestionnaire}
                        disabled={!areAllQuestionsAnswered()}
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
