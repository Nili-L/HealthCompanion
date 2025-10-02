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
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Brain,
  Heart,
  Shield,
  Zap,
  User,
  Users,
  Baby,
  CircleSlash,
  Utensils,
  Moon,
  Flame,
  Settings,
  Frown,
  Angry,
  Activity,
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

// CES-D: Center for Epidemiologic Studies Depression Scale
const CESD_QUESTIONS: Question[] = [
  {
    id: "cesd_1",
    text: "I was bothered by things that usually don't bother me",
    options: [
      { value: 0, label: "Rarely or none of the time (less than 1 day)" },
      { value: 1, label: "Some or a little of the time (1-2 days)" },
      { value: 2, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 3, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_2",
    text: "I did not feel like eating; my appetite was poor",
    options: [
      { value: 0, label: "Rarely or none of the time (less than 1 day)" },
      { value: 1, label: "Some or a little of the time (1-2 days)" },
      { value: 2, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 3, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_3",
    text: "I felt that I could not shake off the blues even with help from my family or friends",
    options: [
      { value: 0, label: "Rarely or none of the time (less than 1 day)" },
      { value: 1, label: "Some or a little of the time (1-2 days)" },
      { value: 2, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 3, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_4",
    text: "I felt I was just as good as other people",
    options: [
      { value: 3, label: "Rarely or none of the time (less than 1 day)" },
      { value: 2, label: "Some or a little of the time (1-2 days)" },
      { value: 1, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 0, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_5",
    text: "I had trouble keeping my mind on what I was doing",
    options: [
      { value: 0, label: "Rarely or none of the time (less than 1 day)" },
      { value: 1, label: "Some or a little of the time (1-2 days)" },
      { value: 2, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 3, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_6",
    text: "I felt depressed",
    options: [
      { value: 0, label: "Rarely or none of the time (less than 1 day)" },
      { value: 1, label: "Some or a little of the time (1-2 days)" },
      { value: 2, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 3, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_7",
    text: "I felt that everything I did was an effort",
    options: [
      { value: 0, label: "Rarely or none of the time (less than 1 day)" },
      { value: 1, label: "Some or a little of the time (1-2 days)" },
      { value: 2, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 3, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_8",
    text: "I felt hopeful about the future",
    options: [
      { value: 3, label: "Rarely or none of the time (less than 1 day)" },
      { value: 2, label: "Some or a little of the time (1-2 days)" },
      { value: 1, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 0, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_9",
    text: "I thought my life had been a failure",
    options: [
      { value: 0, label: "Rarely or none of the time (less than 1 day)" },
      { value: 1, label: "Some or a little of the time (1-2 days)" },
      { value: 2, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 3, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_10",
    text: "I felt fearful",
    options: [
      { value: 0, label: "Rarely or none of the time (less than 1 day)" },
      { value: 1, label: "Some or a little of the time (1-2 days)" },
      { value: 2, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 3, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_11",
    text: "My sleep was restless",
    options: [
      { value: 0, label: "Rarely or none of the time (less than 1 day)" },
      { value: 1, label: "Some or a little of the time (1-2 days)" },
      { value: 2, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 3, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_12",
    text: "I was happy",
    options: [
      { value: 3, label: "Rarely or none of the time (less than 1 day)" },
      { value: 2, label: "Some or a little of the time (1-2 days)" },
      { value: 1, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 0, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_13",
    text: "I talked less than usual",
    options: [
      { value: 0, label: "Rarely or none of the time (less than 1 day)" },
      { value: 1, label: "Some or a little of the time (1-2 days)" },
      { value: 2, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 3, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_14",
    text: "I felt lonely",
    options: [
      { value: 0, label: "Rarely or none of the time (less than 1 day)" },
      { value: 1, label: "Some or a little of the time (1-2 days)" },
      { value: 2, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 3, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_15",
    text: "People were unfriendly",
    options: [
      { value: 0, label: "Rarely or none of the time (less than 1 day)" },
      { value: 1, label: "Some or a little of the time (1-2 days)" },
      { value: 2, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 3, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_16",
    text: "I enjoyed life",
    options: [
      { value: 3, label: "Rarely or none of the time (less than 1 day)" },
      { value: 2, label: "Some or a little of the time (1-2 days)" },
      { value: 1, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 0, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_17",
    text: "I had crying spells",
    options: [
      { value: 0, label: "Rarely or none of the time (less than 1 day)" },
      { value: 1, label: "Some or a little of the time (1-2 days)" },
      { value: 2, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 3, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_18",
    text: "I felt sad",
    options: [
      { value: 0, label: "Rarely or none of the time (less than 1 day)" },
      { value: 1, label: "Some or a little of the time (1-2 days)" },
      { value: 2, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 3, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_19",
    text: "I felt that people disliked me",
    options: [
      { value: 0, label: "Rarely or none of the time (less than 1 day)" },
      { value: 1, label: "Some or a little of the time (1-2 days)" },
      { value: 2, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 3, label: "Most or all of the time (5-7 days)" },
    ],
  },
  {
    id: "cesd_20",
    text: "I could not get going",
    options: [
      { value: 0, label: "Rarely or none of the time (less than 1 day)" },
      { value: 1, label: "Some or a little of the time (1-2 days)" },
      { value: 2, label: "Occasionally or a moderate amount of time (3-4 days)" },
      { value: 3, label: "Most or all of the time (5-7 days)" },
    ],
  },
];

// GDS-15: Geriatric Depression Scale (15-item short form)
const GDS15_QUESTIONS: Question[] = [
  {
    id: "gds15_1",
    text: "Are you basically satisfied with your life?",
    options: [
      { value: 0, label: "Yes" },
      { value: 1, label: "No" },
    ],
  },
  {
    id: "gds15_2",
    text: "Have you dropped many of your activities and interests?",
    options: [
      { value: 1, label: "Yes" },
      { value: 0, label: "No" },
    ],
  },
  {
    id: "gds15_3",
    text: "Do you feel that your life is empty?",
    options: [
      { value: 1, label: "Yes" },
      { value: 0, label: "No" },
    ],
  },
  {
    id: "gds15_4",
    text: "Do you often get bored?",
    options: [
      { value: 1, label: "Yes" },
      { value: 0, label: "No" },
    ],
  },
  {
    id: "gds15_5",
    text: "Are you in good spirits most of the time?",
    options: [
      { value: 0, label: "Yes" },
      { value: 1, label: "No" },
    ],
  },
  {
    id: "gds15_6",
    text: "Are you afraid that something bad is going to happen to you?",
    options: [
      { value: 1, label: "Yes" },
      { value: 0, label: "No" },
    ],
  },
  {
    id: "gds15_7",
    text: "Do you feel happy most of the time?",
    options: [
      { value: 0, label: "Yes" },
      { value: 1, label: "No" },
    ],
  },
  {
    id: "gds15_8",
    text: "Do you often feel helpless?",
    options: [
      { value: 1, label: "Yes" },
      { value: 0, label: "No" },
    ],
  },
  {
    id: "gds15_9",
    text: "Do you prefer to stay at home, rather than going out and doing new things?",
    options: [
      { value: 1, label: "Yes" },
      { value: 0, label: "No" },
    ],
  },
  {
    id: "gds15_10",
    text: "Do you feel you have more problems with memory than most?",
    options: [
      { value: 1, label: "Yes" },
      { value: 0, label: "No" },
    ],
  },
  {
    id: "gds15_11",
    text: "Do you think it is wonderful to be alive now?",
    options: [
      { value: 0, label: "Yes" },
      { value: 1, label: "No" },
    ],
  },
  {
    id: "gds15_12",
    text: "Do you feel pretty worthless the way you are now?",
    options: [
      { value: 1, label: "Yes" },
      { value: 0, label: "No" },
    ],
  },
  {
    id: "gds15_13",
    text: "Do you feel full of energy?",
    options: [
      { value: 0, label: "Yes" },
      { value: 1, label: "No" },
    ],
  },
  {
    id: "gds15_14",
    text: "Do you feel that your situation is hopeless?",
    options: [
      { value: 1, label: "Yes" },
      { value: 0, label: "No" },
    ],
  },
  {
    id: "gds15_15",
    text: "Do you think that most people are better off than you are?",
    options: [
      { value: 1, label: "Yes" },
      { value: 0, label: "No" },
    ],
  },
];

// C-SSRS: Columbia-Suicide Severity Rating Scale (Screening Version)
const CSSRS_QUESTIONS: Question[] = [
  {
    id: "cssrs_1",
    text: "Have you wished you were dead or wished you could go to sleep and not wake up?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "cssrs_2",
    text: "Have you actually had any thoughts of killing yourself?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "cssrs_3",
    text: "Have you been thinking about how you might do this?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "cssrs_4",
    text: "Have you had these thoughts and had some intention of acting on them?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "cssrs_5",
    text: "Have you started to work out or worked out the details of how to kill yourself? Do you intend to carry out this plan?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "cssrs_6",
    text: "Have you ever done anything, started to do anything, or prepared to do anything to end your life?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
];

// CAGE: Substance Use Screening
const CAGE_QUESTIONS: Question[] = [
  {
    id: "cage_1",
    text: "Have you ever felt you should Cut down on your drinking?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "cage_2",
    text: "Have people Annoyed you by criticizing your drinking?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "cage_3",
    text: "Have you ever felt bad or Guilty about your drinking?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "cage_4",
    text: "Have you ever had a drink first thing in the morning to steady your nerves or to get rid of a hangover (Eye-opener)?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
];

// PSC-17: Pediatric Symptom Checklist
const PSC17_QUESTIONS: Question[] = [
  {
    id: "psc17_1",
    text: "Complains of aches or pains",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
    ],
  },
  {
    id: "psc17_2",
    text: "Spends more time alone",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
    ],
  },
  {
    id: "psc17_3",
    text: "Tires easily, little energy",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
    ],
  },
  {
    id: "psc17_4",
    text: "Fidgety, unable to sit still",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
    ],
  },
  {
    id: "psc17_5",
    text: "Has trouble with a teacher",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
    ],
  },
  {
    id: "psc17_6",
    text: "Less interested in school",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
    ],
  },
  {
    id: "psc17_7",
    text: "Acts as if driven by a motor",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
    ],
  },
  {
    id: "psc17_8",
    text: "Daydreams too much",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
    ],
  },
  {
    id: "psc17_9",
    text: "Distracted easily",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
    ],
  },
  {
    id: "psc17_10",
    text: "Is afraid of new situations",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
    ],
  },
  {
    id: "psc17_11",
    text: "Feels sad, unhappy",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
    ],
  },
  {
    id: "psc17_12",
    text: "Is irritable, angry",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
    ],
  },
  {
    id: "psc17_13",
    text: "Feels hopeless",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
    ],
  },
  {
    id: "psc17_14",
    text: "Has trouble concentrating",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
    ],
  },
  {
    id: "psc17_15",
    text: "Less interested in friends",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
    ],
  },
  {
    id: "psc17_16",
    text: "Fights with other children",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
    ],
  },
  {
    id: "psc17_17",
    text: "Absent from school",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
    ],
  },
];

// MDQ: Mood Disorder Questionnaire (Bipolar Screening)
const MDQ_QUESTIONS: Question[] = [
  {
    id: "mdq_1",
    text: "Has there ever been a period of time when you were not your usual self and you felt so good or so hyper that other people thought you were not your normal self or you were so hyper that you got into trouble?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "mdq_2",
    text: "You were so irritable that you shouted at people or started fights or arguments?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "mdq_3",
    text: "You felt much more self-confident than usual?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "mdq_4",
    text: "You got much less sleep than usual and found you didn't really miss it?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "mdq_5",
    text: "You were much more talkative or spoke much faster than usual?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "mdq_6",
    text: "Thoughts raced through your head or you couldn't slow your mind down?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "mdq_7",
    text: "You were so easily distracted by things around you that you had trouble concentrating or staying on track?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "mdq_8",
    text: "You had much more energy than usual?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "mdq_9",
    text: "You were much more active or did many more things than usual?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "mdq_10",
    text: "You were much more social or outgoing than usual, for example, you telephoned friends in the middle of the night?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "mdq_11",
    text: "You were much more interested in sex than usual?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "mdq_12",
    text: "You did things that were unusual for you or that other people might have thought were excessive, foolish, or risky?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
  {
    id: "mdq_13",
    text: "Spending money got you or your family into trouble?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Yes" },
    ],
  },
];

// EAT-26: Eating Attitudes Test
const EAT26_QUESTIONS: Question[] = [
  {
    id: "eat26_1",
    text: "Am terrified about being overweight",
    options: [
      { value: 3, label: "Always" },
      { value: 2, label: "Usually" },
      { value: 1, label: "Often" },
      { value: 0, label: "Sometimes" },
      { value: 0, label: "Rarely" },
      { value: 0, label: "Never" },
    ],
  },
  {
    id: "eat26_2",
    text: "Avoid eating when I am hungry",
    options: [
      { value: 3, label: "Always" },
      { value: 2, label: "Usually" },
      { value: 1, label: "Often" },
      { value: 0, label: "Sometimes" },
      { value: 0, label: "Rarely" },
      { value: 0, label: "Never" },
    ],
  },
  {
    id: "eat26_3",
    text: "Find myself preoccupied with food",
    options: [
      { value: 3, label: "Always" },
      { value: 2, label: "Usually" },
      { value: 1, label: "Often" },
      { value: 0, label: "Sometimes" },
      { value: 0, label: "Rarely" },
      { value: 0, label: "Never" },
    ],
  },
  {
    id: "eat26_4",
    text: "Have gone on eating binges where I feel that I may not be able to stop",
    options: [
      { value: 3, label: "Always" },
      { value: 2, label: "Usually" },
      { value: 1, label: "Often" },
      { value: 0, label: "Sometimes" },
      { value: 0, label: "Rarely" },
      { value: 0, label: "Never" },
    ],
  },
  {
    id: "eat26_5",
    text: "Cut my food into small pieces",
    options: [
      { value: 3, label: "Always" },
      { value: 2, label: "Usually" },
      { value: 1, label: "Often" },
      { value: 0, label: "Sometimes" },
      { value: 0, label: "Rarely" },
      { value: 0, label: "Never" },
    ],
  },
  {
    id: "eat26_6",
    text: "Aware of the calorie content of foods that I eat",
    options: [
      { value: 3, label: "Always" },
      { value: 2, label: "Usually" },
      { value: 1, label: "Often" },
      { value: 0, label: "Sometimes" },
      { value: 0, label: "Rarely" },
      { value: 0, label: "Never" },
    ],
  },
  {
    id: "eat26_7",
    text: "Particularly avoid food with a high carbohydrate content",
    options: [
      { value: 3, label: "Always" },
      { value: 2, label: "Usually" },
      { value: 1, label: "Often" },
      { value: 0, label: "Sometimes" },
      { value: 0, label: "Rarely" },
      { value: 0, label: "Never" },
    ],
  },
];

// SPIN: Social Phobia Inventory
const SPIN_QUESTIONS: Question[] = [
  {
    id: "spin_1",
    text: "I am afraid of people in authority",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Very much" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "spin_2",
    text: "I am bothered by blushing in front of people",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Very much" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "spin_3",
    text: "Parties and social events scare me",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Very much" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "spin_4",
    text: "I avoid talking to people I don't know",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Very much" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "spin_5",
    text: "Being criticized scares me a lot",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Very much" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "spin_6",
    text: "I avoid doing things or speaking to people for fear of embarrassment",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Very much" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "spin_7",
    text: "Sweating in front of people causes me distress",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Very much" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "spin_8",
    text: "I avoid going to parties",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Very much" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "spin_9",
    text: "I avoid activities in which I am the center of attention",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Very much" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "spin_10",
    text: "Talking to strangers scares me",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Very much" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "spin_11",
    text: "I avoid having to give speeches",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Very much" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "spin_12",
    text: "I would do anything to avoid being criticized",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Very much" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "spin_13",
    text: "Heart palpitations bother me when I am around people",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Very much" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "spin_14",
    text: "I am afraid of doing things when people might be watching",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Very much" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "spin_15",
    text: "Being embarrassed or looking stupid are among my worst fears",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Very much" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "spin_16",
    text: "I avoid speaking to anyone in authority",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Very much" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "spin_17",
    text: "Trembling or shaking in front of others is distressing to me",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little bit" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Very much" },
      { value: 4, label: "Extremely" },
    ],
  },
];

// ISI: Insomnia Severity Index
const ISI_QUESTIONS: Question[] = [
  {
    id: "isi_1",
    text: "Difficulty falling asleep",
    options: [
      { value: 0, label: "None" },
      { value: 1, label: "Mild" },
      { value: 2, label: "Moderate" },
      { value: 3, label: "Severe" },
      { value: 4, label: "Very Severe" },
    ],
  },
  {
    id: "isi_2",
    text: "Difficulty staying asleep",
    options: [
      { value: 0, label: "None" },
      { value: 1, label: "Mild" },
      { value: 2, label: "Moderate" },
      { value: 3, label: "Severe" },
      { value: 4, label: "Very Severe" },
    ],
  },
  {
    id: "isi_3",
    text: "Problem waking up too early",
    options: [
      { value: 0, label: "None" },
      { value: 1, label: "Mild" },
      { value: 2, label: "Moderate" },
      { value: 3, label: "Severe" },
      { value: 4, label: "Very Severe" },
    ],
  },
  {
    id: "isi_4",
    text: "How satisfied/dissatisfied are you with your current sleep pattern?",
    options: [
      { value: 0, label: "Very Satisfied" },
      { value: 1, label: "Satisfied" },
      { value: 2, label: "Moderately Satisfied" },
      { value: 3, label: "Dissatisfied" },
      { value: 4, label: "Very Dissatisfied" },
    ],
  },
  {
    id: "isi_5",
    text: "How noticeable to others do you think your sleeping problem is in terms of impairing the quality of your life?",
    options: [
      { value: 0, label: "Not at all noticeable" },
      { value: 1, label: "A little" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Much" },
      { value: 4, label: "Very much noticeable" },
    ],
  },
  {
    id: "isi_6",
    text: "How worried/distressed are you about your current sleep problem?",
    options: [
      { value: 0, label: "Not at all worried" },
      { value: 1, label: "A little" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Much" },
      { value: 4, label: "Very much worried" },
    ],
  },
  {
    id: "isi_7",
    text: "To what extent do you consider your sleep problem to interfere with your daily functioning?",
    options: [
      { value: 0, label: "Not at all interfering" },
      { value: 1, label: "A little" },
      { value: 2, label: "Somewhat" },
      { value: 3, label: "Much" },
      { value: 4, label: "Very much interfering" },
    ],
  },
];

// BSL-23: Borderline Symptom List
const BSL23_QUESTIONS: Question[] = [
  {
    id: "bsl23_1",
    text: "I didn't believe in my right to live",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little" },
      { value: 2, label: "Rather" },
      { value: 3, label: "Much" },
      { value: 4, label: "Very much" },
    ],
  },
  {
    id: "bsl23_2",
    text: "I felt helpless",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little" },
      { value: 2, label: "Rather" },
      { value: 3, label: "Much" },
      { value: 4, label: "Very much" },
    ],
  },
  {
    id: "bsl23_3",
    text: "I felt disgust",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little" },
      { value: 2, label: "Rather" },
      { value: 3, label: "Much" },
      { value: 4, label: "Very much" },
    ],
  },
  {
    id: "bsl23_4",
    text: "My mood rapidly cycled in terms of anxiety, anger and depression",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little" },
      { value: 2, label: "Rather" },
      { value: 3, label: "Much" },
      { value: 4, label: "Very much" },
    ],
  },
  {
    id: "bsl23_5",
    text: "I suffered from voices and noises from inside or outside my head",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little" },
      { value: 2, label: "Rather" },
      { value: 3, label: "Much" },
      { value: 4, label: "Very much" },
    ],
  },
];

// PSWQ: Penn State Worry Questionnaire (abbreviated version)
const PSWQ_QUESTIONS: Question[] = [
  {
    id: "pswq_1",
    text: "If I do not have enough time to do everything, I do not worry about it",
    options: [
      { value: 1, label: "Not at all typical" },
      { value: 2, label: "Slightly typical" },
      { value: 3, label: "Somewhat typical" },
      { value: 4, label: "Moderately typical" },
      { value: 5, label: "Very typical" },
    ],
  },
  {
    id: "pswq_2",
    text: "My worries overwhelm me",
    options: [
      { value: 1, label: "Not at all typical" },
      { value: 2, label: "Slightly typical" },
      { value: 3, label: "Somewhat typical" },
      { value: 4, label: "Moderately typical" },
      { value: 5, label: "Very typical" },
    ],
  },
  {
    id: "pswq_3",
    text: "I do not tend to worry about things",
    options: [
      { value: 5, label: "Not at all typical" },
      { value: 4, label: "Slightly typical" },
      { value: 3, label: "Somewhat typical" },
      { value: 2, label: "Moderately typical" },
      { value: 1, label: "Very typical" },
    ],
  },
  {
    id: "pswq_4",
    text: "Many situations make me worry",
    options: [
      { value: 1, label: "Not at all typical" },
      { value: 2, label: "Slightly typical" },
      { value: 3, label: "Somewhat typical" },
      { value: 4, label: "Moderately typical" },
      { value: 5, label: "Very typical" },
    ],
  },
  {
    id: "pswq_5",
    text: "I know I should not worry about things, but I just cannot help it",
    options: [
      { value: 1, label: "Not at all typical" },
      { value: 2, label: "Slightly typical" },
      { value: 3, label: "Somewhat typical" },
      { value: 4, label: "Moderately typical" },
      { value: 5, label: "Very typical" },
    ],
  },
  {
    id: "pswq_6",
    text: "When I am under pressure I worry a lot",
    options: [
      { value: 1, label: "Not at all typical" },
      { value: 2, label: "Slightly typical" },
      { value: 3, label: "Somewhat typical" },
      { value: 4, label: "Moderately typical" },
      { value: 5, label: "Very typical" },
    ],
  },
  {
    id: "pswq_7",
    text: "I am always worrying about something",
    options: [
      { value: 1, label: "Not at all typical" },
      { value: 2, label: "Slightly typical" },
      { value: 3, label: "Somewhat typical" },
      { value: 4, label: "Moderately typical" },
      { value: 5, label: "Very typical" },
    ],
  },
  {
    id: "pswq_8",
    text: "I find it easy to dismiss worrisome thoughts",
    options: [
      { value: 5, label: "Not at all typical" },
      { value: 4, label: "Slightly typical" },
      { value: 3, label: "Somewhat typical" },
      { value: 2, label: "Moderately typical" },
      { value: 1, label: "Very typical" },
    ],
  },
];

// EPDS: Edinburgh Postnatal Depression Scale
const EPDS_QUESTIONS: Question[] = [
  {
    id: "epds_1",
    text: "I have been able to laugh and see the funny side of things",
    options: [
      { value: 0, label: "As much as I always could" },
      { value: 1, label: "Not quite so much now" },
      { value: 2, label: "Definitely not so much now" },
      { value: 3, label: "Not at all" },
    ],
  },
  {
    id: "epds_2",
    text: "I have looked forward with enjoyment to things",
    options: [
      { value: 0, label: "As much as I ever did" },
      { value: 1, label: "Rather less than I used to" },
      { value: 2, label: "Definitely less than I used to" },
      { value: 3, label: "Hardly at all" },
    ],
  },
  {
    id: "epds_3",
    text: "I have blamed myself unnecessarily when things went wrong",
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, some of the time" },
      { value: 1, label: "Not very often" },
      { value: 0, label: "No, never" },
    ],
  },
  {
    id: "epds_4",
    text: "I have been anxious or worried for no good reason",
    options: [
      { value: 0, label: "No, not at all" },
      { value: 1, label: "Hardly ever" },
      { value: 2, label: "Yes, sometimes" },
      { value: 3, label: "Yes, very often" },
    ],
  },
  {
    id: "epds_5",
    text: "I have felt scared or panicky for no very good reason",
    options: [
      { value: 3, label: "Yes, quite a lot" },
      { value: 2, label: "Yes, sometimes" },
      { value: 1, label: "No, not much" },
      { value: 0, label: "No, not at all" },
    ],
  },
  {
    id: "epds_6",
    text: "Things have been getting on top of me",
    options: [
      { value: 3, label: "Yes, most of the time I haven't been able to cope" },
      { value: 2, label: "Yes, sometimes I haven't been coping as well as usual" },
      { value: 1, label: "No, most of the time I have coped quite well" },
      { value: 0, label: "No, I have been coping as well as ever" },
    ],
  },
  {
    id: "epds_7",
    text: "I have been so unhappy that I have had difficulty sleeping",
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, sometimes" },
      { value: 1, label: "Not very often" },
      { value: 0, label: "No, not at all" },
    ],
  },
  {
    id: "epds_8",
    text: "I have felt sad or miserable",
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, quite often" },
      { value: 1, label: "Not very often" },
      { value: 0, label: "No, not at all" },
    ],
  },
  {
    id: "epds_9",
    text: "I have been so unhappy that I have been crying",
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, quite often" },
      { value: 1, label: "Only occasionally" },
      { value: 0, label: "No, never" },
    ],
  },
  {
    id: "epds_10",
    text: "The thought of harming myself has occurred to me",
    options: [
      { value: 3, label: "Yes, quite often" },
      { value: 2, label: "Sometimes" },
      { value: 1, label: "Hardly ever" },
      { value: 0, label: "Never" },
    ],
  },
];

// OCI-R: Obsessive Compulsive Inventory - Revised (abbreviated)
const OCIR_QUESTIONS: Question[] = [
  {
    id: "ocir_1",
    text: "I have saved up so many things that they get in the way",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "A lot" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "ocir_2",
    text: "I check things more often than necessary",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "A lot" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "ocir_3",
    text: "I get upset if objects are not arranged properly",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "A lot" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "ocir_4",
    text: "I feel compelled to count while I am doing things",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "A lot" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "ocir_5",
    text: "I find it difficult to touch an object when I know it has been touched by strangers",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "A lot" },
      { value: 4, label: "Extremely" },
    ],
  },
  {
    id: "ocir_6",
    text: "I find it difficult to control my own thoughts",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A little" },
      { value: 2, label: "Moderately" },
      { value: 3, label: "A lot" },
      { value: 4, label: "Extremely" },
    ],
  },
];

// CAS: Clinical Anger Scale (abbreviated)
const CAS_QUESTIONS: Question[] = [
  {
    id: "cas_1",
    text: "I feel angry",
    options: [
      { value: 0, label: "None or almost none of the time" },
      { value: 1, label: "A little of the time" },
      { value: 2, label: "Some of the time" },
      { value: 3, label: "Most of the time" },
    ],
  },
  {
    id: "cas_2",
    text: "I feel like breaking things",
    options: [
      { value: 0, label: "None or almost none of the time" },
      { value: 1, label: "A little of the time" },
      { value: 2, label: "Some of the time" },
      { value: 3, label: "Most of the time" },
    ],
  },
  {
    id: "cas_3",
    text: "I get so angry I feel like I might lose control",
    options: [
      { value: 0, label: "None or almost none of the time" },
      { value: 1, label: "A little of the time" },
      { value: 2, label: "Some of the time" },
      { value: 3, label: "Most of the time" },
    ],
  },
  {
    id: "cas_4",
    text: "I get angry when I'm slowed down",
    options: [
      { value: 0, label: "None or almost none of the time" },
      { value: 1, label: "A little of the time" },
      { value: 2, label: "Some of the time" },
      { value: 3, label: "Most of the time" },
    ],
  },
  {
    id: "cas_5",
    text: "I feel angrier than most people",
    options: [
      { value: 0, label: "None or almost none of the time" },
      { value: 1, label: "A little of the time" },
      { value: 2, label: "Some of the time" },
      { value: 3, label: "Most of the time" },
    ],
  },
];

// SCAS: Spence Children's Anxiety Scale (abbreviated for ages 6-18)
const SCAS_QUESTIONS: Question[] = [
  {
    id: "scas_1",
    text: "My child worries about things",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
      { value: 3, label: "Always" },
    ],
  },
  {
    id: "scas_2",
    text: "My child is scared of the dark",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
      { value: 3, label: "Always" },
    ],
  },
  {
    id: "scas_3",
    text: "When my child has a problem, my child gets a funny feeling in their stomach",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
      { value: 3, label: "Always" },
    ],
  },
  {
    id: "scas_4",
    text: "My child feels afraid",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
      { value: 3, label: "Always" },
    ],
  },
  {
    id: "scas_5",
    text: "My child would feel afraid of being on their own at home",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
      { value: 3, label: "Always" },
    ],
  },
  {
    id: "scas_6",
    text: "My child feels scared when they have to take a test",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
      { value: 3, label: "Always" },
    ],
  },
  {
    id: "scas_7",
    text: "My child feels afraid that they will make a fool of themselves in front of people",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
      { value: 3, label: "Always" },
    ],
  },
  {
    id: "scas_8",
    text: "My child worries about being away from parents",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
      { value: 3, label: "Always" },
    ],
  },
  {
    id: "scas_9",
    text: "My child is scared of dogs",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
      { value: 3, label: "Always" },
    ],
  },
  {
    id: "scas_10",
    text: "My child has trouble going to school in the mornings because they feel nervous or afraid",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
      { value: 3, label: "Always" },
    ],
  },
];

// SDQ: Strengths and Difficulties Questionnaire (parent version for ages 3-16)
const SDQ_QUESTIONS: Question[] = [
  {
    id: "sdq_1",
    text: "Considerate of other people's feelings",
    options: [
      { value: 0, label: "Not True" },
      { value: 1, label: "Somewhat True" },
      { value: 2, label: "Certainly True" },
    ],
  },
  {
    id: "sdq_2",
    text: "Restless, overactive, cannot stay still for long",
    options: [
      { value: 0, label: "Not True" },
      { value: 1, label: "Somewhat True" },
      { value: 2, label: "Certainly True" },
    ],
  },
  {
    id: "sdq_3",
    text: "Often complains of headaches, stomach-aches or sickness",
    options: [
      { value: 0, label: "Not True" },
      { value: 1, label: "Somewhat True" },
      { value: 2, label: "Certainly True" },
    ],
  },
  {
    id: "sdq_4",
    text: "Shares readily with other children (treats, toys, pencils, etc.)",
    options: [
      { value: 2, label: "Not True" },
      { value: 1, label: "Somewhat True" },
      { value: 0, label: "Certainly True" },
    ],
  },
  {
    id: "sdq_5",
    text: "Often has temper tantrums or hot tempers",
    options: [
      { value: 0, label: "Not True" },
      { value: 1, label: "Somewhat True" },
      { value: 2, label: "Certainly True" },
    ],
  },
  {
    id: "sdq_6",
    text: "Rather solitary, tends to play alone",
    options: [
      { value: 0, label: "Not True" },
      { value: 1, label: "Somewhat True" },
      { value: 2, label: "Certainly True" },
    ],
  },
  {
    id: "sdq_7",
    text: "Generally obedient, usually does what adults request",
    options: [
      { value: 2, label: "Not True" },
      { value: 1, label: "Somewhat True" },
      { value: 0, label: "Certainly True" },
    ],
  },
  {
    id: "sdq_8",
    text: "Many worries, often seems worried",
    options: [
      { value: 0, label: "Not True" },
      { value: 1, label: "Somewhat True" },
      { value: 2, label: "Certainly True" },
    ],
  },
  {
    id: "sdq_9",
    text: "Helpful if someone is hurt, upset or feeling ill",
    options: [
      { value: 0, label: "Not True" },
      { value: 1, label: "Somewhat True" },
      { value: 2, label: "Certainly True" },
    ],
  },
  {
    id: "sdq_10",
    text: "Constantly fidgeting or squirming",
    options: [
      { value: 0, label: "Not True" },
      { value: 1, label: "Somewhat True" },
      { value: 2, label: "Certainly True" },
    ],
  },
  {
    id: "sdq_11",
    text: "Has at least one good friend",
    options: [
      { value: 2, label: "Not True" },
      { value: 1, label: "Somewhat True" },
      { value: 0, label: "Certainly True" },
    ],
  },
  {
    id: "sdq_12",
    text: "Often fights with other children or bullies them",
    options: [
      { value: 0, label: "Not True" },
      { value: 1, label: "Somewhat True" },
      { value: 2, label: "Certainly True" },
    ],
  },
  {
    id: "sdq_13",
    text: "Often unhappy, down-hearted or tearful",
    options: [
      { value: 0, label: "Not True" },
      { value: 1, label: "Somewhat True" },
      { value: 2, label: "Certainly True" },
    ],
  },
  {
    id: "sdq_14",
    text: "Generally liked by other children",
    options: [
      { value: 2, label: "Not True" },
      { value: 1, label: "Somewhat True" },
      { value: 0, label: "Certainly True" },
    ],
  },
  {
    id: "sdq_15",
    text: "Easily distracted, concentration wanders",
    options: [
      { value: 0, label: "Not True" },
      { value: 1, label: "Somewhat True" },
      { value: 2, label: "Certainly True" },
    ],
  },
];

// PDSS: Panic Disorder Severity Scale (abbreviated)
const PDSS_QUESTIONS: Question[] = [
  {
    id: "pdss_1",
    text: "How many panic and limited symptom attacks did you have during the week?",
    options: [
      { value: 0, label: "No panic or limited symptom episodes" },
      { value: 1, label: "Mild - no full panic attacks and no more than 1 limited symptom attack/day" },
      { value: 2, label: "Moderate - 1 or 2 full panic attacks and/or multiple limited symptom attacks/day" },
      { value: 3, label: "Severe - more than 2 full attacks but not more than 1/day on average" },
      { value: 4, label: "Extreme - full panic attacks occurred more than once a day" },
    ],
  },
  {
    id: "pdss_2",
    text: "If you had any panic attacks during the past week, how distressing were they?",
    options: [
      { value: 0, label: "Not at all distressing" },
      { value: 1, label: "Mildly distressing" },
      { value: 2, label: "Moderately distressing" },
      { value: 3, label: "Markedly distressing" },
      { value: 4, label: "Extremely distressing" },
    ],
  },
  {
    id: "pdss_3",
    text: "During the past week, how much have you worried or felt anxious about when your next panic attack would occur?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Occasionally" },
      { value: 2, label: "Frequently" },
      { value: 3, label: "Very frequently" },
      { value: 4, label: "Nearly constantly" },
    ],
  },
  {
    id: "pdss_4",
    text: "During the past week, were there any places or situations you avoided, or felt afraid of, because of panic attacks?",
    options: [
      { value: 0, label: "None - no fear or avoidance" },
      { value: 1, label: "Mild - occasional fear and/or avoidance but I could usually confront" },
      { value: 2, label: "Moderate - noticeable avoidance but I could manage" },
      { value: 3, label: "Severe - extensive avoidance and substantial distress" },
      { value: 4, label: "Extreme - pervasive disabling fear and/or avoidance" },
    ],
  },
  {
    id: "pdss_5",
    text: "During the past week, how much did panic attacks interfere with your ability to work or carry out responsibilities at home?",
    options: [
      { value: 0, label: "No interference" },
      { value: 1, label: "Mild interference" },
      { value: 2, label: "Moderate interference" },
      { value: 3, label: "Severe interference" },
      { value: 4, label: "Extreme interference" },
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
  {
    id: "cesd",
    name: "Center for Epidemiologic Studies Depression Scale",
    acronym: "CES-D",
    description: "Depression screening (20 items)",
    type: "depression",
    questions: CESD_QUESTIONS,
    scoring: {
      min: 0,
      max: 60,
      ranges: [
        {
          label: "Minimal",
          min: 0,
          max: 15,
          interpretation: "Minimal depressive symptoms. No clinical intervention needed.",
        },
        {
          label: "Mild",
          min: 16,
          max: 20,
          interpretation: "Mild depression. Monitor symptoms and consider support.",
        },
        {
          label: "Moderate",
          min: 21,
          max: 30,
          interpretation: "Moderate depression. Clinical evaluation recommended.",
        },
        {
          label: "Severe",
          min: 31,
          max: 60,
          interpretation: "Severe depression. Immediate clinical intervention recommended.",
        },
      ],
    },
    icon: Brain,
  },
  {
    id: "gds15",
    name: "Geriatric Depression Scale",
    acronym: "GDS-15",
    description: "Depression screening for older adults (ages 65+)",
    type: "depression",
    questions: GDS15_QUESTIONS,
    scoring: {
      min: 0,
      max: 15,
      ranges: [
        {
          label: "Normal",
          min: 0,
          max: 4,
          interpretation: "Normal. No depression detected.",
        },
        {
          label: "Mild",
          min: 5,
          max: 8,
          interpretation: "Mild depression. Follow-up recommended.",
        },
        {
          label: "Moderate to Severe",
          min: 9,
          max: 15,
          interpretation: "Moderate to severe depression. Clinical evaluation and treatment recommended.",
        },
      ],
    },
    icon: Users,
  },
  {
    id: "cssrs",
    name: "Columbia-Suicide Severity Rating Scale",
    acronym: "C-SSRS",
    description: "Suicide risk assessment (screening version)",
    type: "suicide_risk",
    questions: CSSRS_QUESTIONS,
    scoring: {
      min: 0,
      max: 6,
      ranges: [
        {
          label: "No Risk",
          min: 0,
          max: 0,
          interpretation: "No suicidal ideation detected. Continue monitoring.",
        },
        {
          label: "Low Risk",
          min: 1,
          max: 1,
          interpretation: "Passive suicidal ideation. Closer monitoring and support recommended.",
        },
        {
          label: "Moderate Risk",
          min: 2,
          max: 3,
          interpretation: "Active suicidal ideation. Clinical evaluation needed.",
        },
        {
          label: "High Risk",
          min: 4,
          max: 6,
          interpretation: "IMMEDIATE DANGER. Suicidal intent or plan present. Emergency intervention required.",
        },
      ],
    },
    icon: AlertCircle,
  },
  {
    id: "cage",
    name: "CAGE Substance Use Screening",
    acronym: "CAGE",
    description: "Alcohol use disorder screening",
    type: "substance_use",
    questions: CAGE_QUESTIONS,
    scoring: {
      min: 0,
      max: 4,
      ranges: [
        {
          label: "Low Risk",
          min: 0,
          max: 1,
          interpretation: "Low risk for alcohol use disorder.",
        },
        {
          label: "High Risk",
          min: 2,
          max: 4,
          interpretation: "High risk for alcohol use disorder. Further evaluation recommended.",
        },
      ],
    },
    icon: CircleSlash,
  },
  {
    id: "psc17",
    name: "Pediatric Symptom Checklist-17",
    acronym: "PSC-17",
    description: "Mental health screening for children (ages 4-16)",
    type: "pediatric",
    questions: PSC17_QUESTIONS,
    scoring: {
      min: 0,
      max: 34,
      ranges: [
        {
          label: "Low Risk",
          min: 0,
          max: 14,
          interpretation: "Low risk. No significant concerns detected.",
        },
        {
          label: "At Risk",
          min: 15,
          max: 34,
          interpretation: "At risk for psychosocial impairment. Further evaluation recommended.",
        },
      ],
    },
    icon: Baby,
  },
  {
    id: "mdq",
    name: "Mood Disorder Questionnaire",
    acronym: "MDQ",
    description: "Bipolar disorder screening (13 items)",
    type: "bipolar",
    questions: MDQ_QUESTIONS,
    scoring: {
      min: 0,
      max: 13,
      ranges: [
        {
          label: "Low Risk",
          min: 0,
          max: 6,
          interpretation: "Low risk for bipolar disorder.",
        },
        {
          label: "Positive Screen",
          min: 7,
          max: 13,
          interpretation: "Positive screen for bipolar disorder. Clinical evaluation strongly recommended.",
        },
      ],
    },
    icon: Flame,
  },
  {
    id: "eat26",
    name: "Eating Attitudes Test-26",
    acronym: "EAT-26",
    description: "Eating disorder screening (abbreviated 7-item version)",
    type: "eating_disorder",
    questions: EAT26_QUESTIONS,
    scoring: {
      min: 0,
      max: 21,
      ranges: [
        {
          label: "Low Risk",
          min: 0,
          max: 19,
          interpretation: "Low risk for eating disorder.",
        },
        {
          label: "At Risk",
          min: 20,
          max: 21,
          interpretation: "At risk for eating disorder. Further clinical evaluation recommended.",
        },
      ],
    },
    icon: Utensils,
  },
  {
    id: "spin",
    name: "Social Phobia Inventory",
    acronym: "SPIN",
    description: "Social anxiety disorder assessment (17 items)",
    type: "social_anxiety",
    questions: SPIN_QUESTIONS,
    scoring: {
      min: 0,
      max: 68,
      ranges: [
        {
          label: "Minimal",
          min: 0,
          max: 20,
          interpretation: "Minimal social anxiety. No intervention needed.",
        },
        {
          label: "Mild",
          min: 21,
          max: 30,
          interpretation: "Mild social anxiety. Monitor symptoms.",
        },
        {
          label: "Moderate",
          min: 31,
          max: 40,
          interpretation: "Moderate social anxiety. Consider treatment options.",
        },
        {
          label: "Severe",
          min: 41,
          max: 50,
          interpretation: "Severe social anxiety. Clinical intervention recommended.",
        },
        {
          label: "Very Severe",
          min: 51,
          max: 68,
          interpretation: "Very severe social anxiety. Immediate clinical intervention strongly recommended.",
        },
      ],
    },
    icon: Users,
  },
  {
    id: "isi",
    name: "Insomnia Severity Index",
    acronym: "ISI",
    description: "Sleep disorder/insomnia assessment (7 items)",
    type: "sleep",
    questions: ISI_QUESTIONS,
    scoring: {
      min: 0,
      max: 28,
      ranges: [
        {
          label: "No Insomnia",
          min: 0,
          max: 7,
          interpretation: "No clinically significant insomnia.",
        },
        {
          label: "Subthreshold",
          min: 8,
          max: 14,
          interpretation: "Subthreshold insomnia. Sleep hygiene education recommended.",
        },
        {
          label: "Moderate",
          min: 15,
          max: 21,
          interpretation: "Moderate clinical insomnia. Treatment recommended.",
        },
        {
          label: "Severe",
          min: 22,
          max: 28,
          interpretation: "Severe clinical insomnia. Immediate treatment strongly recommended.",
        },
      ],
    },
    icon: Moon,
  },
  {
    id: "bsl23",
    name: "Borderline Symptom List-23",
    acronym: "BSL-23",
    description: "Borderline personality disorder symptoms (abbreviated 5-item version)",
    type: "personality",
    questions: BSL23_QUESTIONS,
    scoring: {
      min: 0,
      max: 20,
      ranges: [
        {
          label: "Low",
          min: 0,
          max: 5,
          interpretation: "Low borderline symptom severity.",
        },
        {
          label: "Moderate",
          min: 6,
          max: 10,
          interpretation: "Moderate borderline symptoms. Clinical evaluation recommended.",
        },
        {
          label: "High",
          min: 11,
          max: 20,
          interpretation: "High borderline symptom severity. Specialized treatment recommended.",
        },
      ],
    },
    icon: Brain,
  },
  {
    id: "pswq",
    name: "Penn State Worry Questionnaire",
    acronym: "PSWQ",
    description: "Worry and generalized anxiety assessment (8 items)",
    type: "worry_anxiety",
    questions: PSWQ_QUESTIONS,
    scoring: {
      min: 8,
      max: 40,
      ranges: [
        {
          label: "Low",
          min: 8,
          max: 16,
          interpretation: "Low levels of worry. Within normal range.",
        },
        {
          label: "Moderate",
          min: 17,
          max: 24,
          interpretation: "Moderate worry. May benefit from stress management techniques.",
        },
        {
          label: "High",
          min: 25,
          max: 32,
          interpretation: "High levels of worry. Clinical evaluation recommended.",
        },
        {
          label: "Very High",
          min: 33,
          max: 40,
          interpretation: "Very high worry levels. Generalized anxiety disorder likely. Treatment recommended.",
        },
      ],
    },
    icon: Zap,
  },
  {
    id: "epds",
    name: "Edinburgh Postnatal Depression Scale",
    acronym: "EPDS",
    description: "Postnatal/perinatal depression screening (10 items)",
    type: "postnatal_depression",
    questions: EPDS_QUESTIONS,
    scoring: {
      min: 0,
      max: 30,
      ranges: [
        {
          label: "Low Risk",
          min: 0,
          max: 9,
          interpretation: "Low risk for postnatal depression.",
        },
        {
          label: "Moderate Risk",
          min: 10,
          max: 12,
          interpretation: "Moderate risk. Further assessment and support recommended.",
        },
        {
          label: "High Risk",
          min: 13,
          max: 30,
          interpretation: "High risk for postnatal depression. Clinical evaluation and intervention recommended.",
        },
      ],
    },
    icon: Baby,
  },
  {
    id: "ocir",
    name: "Obsessive Compulsive Inventory - Revised",
    acronym: "OCI-R",
    description: "OCD symptom assessment (6 items abbreviated)",
    type: "ocd",
    questions: OCIR_QUESTIONS,
    scoring: {
      min: 0,
      max: 24,
      ranges: [
        {
          label: "Minimal",
          min: 0,
          max: 6,
          interpretation: "Minimal OCD symptoms.",
        },
        {
          label: "Mild",
          min: 7,
          max: 12,
          interpretation: "Mild OCD symptoms. Monitor and consider assessment.",
        },
        {
          label: "Moderate",
          min: 13,
          max: 18,
          interpretation: "Moderate OCD symptoms. Clinical evaluation recommended.",
        },
        {
          label: "Severe",
          min: 19,
          max: 24,
          interpretation: "Severe OCD symptoms. Treatment strongly recommended.",
        },
      ],
    },
    icon: Brain,
  },
  {
    id: "cas",
    name: "Clinical Anger Scale",
    acronym: "CAS",
    description: "Clinical anger assessment (5 items)",
    type: "anger",
    questions: CAS_QUESTIONS,
    scoring: {
      min: 0,
      max: 15,
      ranges: [
        {
          label: "Low",
          min: 0,
          max: 3,
          interpretation: "Low anger levels. Within normal range.",
        },
        {
          label: "Moderate",
          min: 4,
          max: 7,
          interpretation: "Moderate anger. May benefit from anger management techniques.",
        },
        {
          label: "High",
          min: 8,
          max: 11,
          interpretation: "High anger levels. Clinical intervention may be helpful.",
        },
        {
          label: "Severe",
          min: 12,
          max: 15,
          interpretation: "Severe anger problems. Clinical intervention strongly recommended.",
        },
      ],
    },
    icon: Angry,
  },
  {
    id: "pdss",
    name: "Panic Disorder Severity Scale",
    acronym: "PDSS",
    description: "Panic disorder symptom severity (5 items)",
    type: "panic_disorder",
    questions: PDSS_QUESTIONS,
    scoring: {
      min: 0,
      max: 20,
      ranges: [
        {
          label: "None/Minimal",
          min: 0,
          max: 3,
          interpretation: "None or minimal panic disorder symptoms.",
        },
        {
          label: "Mild",
          min: 4,
          max: 7,
          interpretation: "Mild panic disorder. Monitor symptoms.",
        },
        {
          label: "Moderate",
          min: 8,
          max: 11,
          interpretation: "Moderate panic disorder. Clinical evaluation recommended.",
        },
        {
          label: "Severe",
          min: 12,
          max: 15,
          interpretation: "Severe panic disorder. Active treatment recommended.",
        },
        {
          label: "Extreme",
          min: 16,
          max: 20,
          interpretation: "Extreme panic disorder severity. Immediate clinical intervention required.",
        },
      ],
    },
    icon: Activity,
  },
  {
    id: "scas",
    name: "Spence Children's Anxiety Scale",
    acronym: "SCAS",
    description: "Child anxiety screening for ages 6-18 (parent report - 10 items)",
    type: "child_anxiety",
    questions: SCAS_QUESTIONS,
    scoring: {
      min: 0,
      max: 30,
      ranges: [
        {
          label: "Low",
          min: 0,
          max: 10,
          interpretation: "Low anxiety. Child is within normal range.",
        },
        {
          label: "Moderate",
          min: 11,
          max: 18,
          interpretation: "Moderate anxiety. Monitor child's symptoms and consider support.",
        },
        {
          label: "High",
          min: 19,
          max: 24,
          interpretation: "High anxiety. Clinical evaluation recommended for child.",
        },
        {
          label: "Very High",
          min: 25,
          max: 30,
          interpretation: "Very high anxiety. Immediate clinical intervention recommended for child.",
        },
      ],
    },
    icon: Baby,
  },
  {
    id: "sdq",
    name: "Strengths and Difficulties Questionnaire",
    acronym: "SDQ",
    description: "Behavioral/emotional screening for ages 3-16 (parent report - 15 items)",
    type: "child_behavioral",
    questions: SDQ_QUESTIONS,
    scoring: {
      min: 0,
      max: 30,
      ranges: [
        {
          label: "Normal",
          min: 0,
          max: 13,
          interpretation: "Normal behavioral and emotional development. Child is doing well.",
        },
        {
          label: "Borderline",
          min: 14,
          max: 16,
          interpretation: "Borderline difficulties. Monitor child's behavior and provide additional support.",
        },
        {
          label: "Abnormal",
          min: 17,
          max: 30,
          interpretation: "Significant behavioral/emotional difficulties. Clinical assessment recommended for child.",
        },
      ],
    },
    icon: Baby,
  },
];

export function MentalHealthQuestionnaires({
  accessToken,
  role
}: {
  accessToken: string;
  role?: 'patient' | 'provider';
}) {
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [assignedQuestionnaires, setAssignedQuestionnaires] = useState<string[]>([]);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

  const projectId = "cvsxfzllhhhpdyckdmqg";

  // Trend Badge Component
  const TrendBadge = ({
    direction,
    percentChange,
  }: {
    direction: 'up' | 'down' | 'stable';
    percentChange: number;
  }) => {
    // For mental health scores, lower is better (inverse logic)
    const isGood = direction === 'down' || direction === 'stable';

    const Icon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;
    const color = direction === 'stable'
      ? 'text-gray-500'
      : isGood
        ? 'text-green-600'
        : 'text-red-600';

    if (direction === 'stable') {
      return (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Minus className="h-3 w-3" />
          <span>Stable</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-1 text-xs font-medium ${color}`}>
        <Icon className="h-3 w-3" />
        <span>{Math.abs(percentChange).toFixed(0)}% {direction === 'down' ? 'better' : 'worse'}</span>
      </div>
    );
  };

  useEffect(() => {
    fetchResponses();
    if (role === 'patient') {
      fetchAssignedQuestionnaires();
    }
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
        setResponses(data || []);
      }
    } catch (error) {
      toast.error("Failed to load questionnaires");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedQuestionnaires = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/assigned-questionnaires`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAssignedQuestionnaires(data.questionnaireIds || []);
      }
    } catch (error) {
      console.error("Failed to load assigned questionnaires:", error);
    }
  };

  const toggleQuestionnaireAssignment = async (questionnaireId: string) => {
    const isAssigned = assignedQuestionnaires.includes(questionnaireId);
    const newAssignments = isAssigned
      ? assignedQuestionnaires.filter(id => id !== questionnaireId)
      : [...assignedQuestionnaires, questionnaireId];

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/assigned-questionnaires`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ questionnaireIds: newAssignments }),
        }
      );

      if (response.ok) {
        setAssignedQuestionnaires(newAssignments);
        toast.success(isAssigned ? 'Questionnaire removed' : 'Questionnaire assigned');
      }
    } catch (error) {
      toast.error('Failed to update questionnaire assignments');
      console.error(error);
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

  // Trend analysis functions
  const getQuestionnaireHistory = (questionnaireType: string) => {
    return responses
      .filter(r => r.questionnaireType === questionnaireType)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  };

  const calculateScoreTrend = (questionnaireType: string) => {
    const history = getQuestionnaireHistory(questionnaireType);
    if (history.length < 2) {
      return { direction: 'stable' as const, percentChange: 0, latest: history[0]?.totalScore || 0, previous: 0 };
    }

    const latest = history[0].totalScore;
    const previous = history[1].totalScore;
    const change = latest - previous;
    const percentChange = previous > 0 ? (change / previous) * 100 : 0;

    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(percentChange) < 5) {
      direction = 'stable';
    } else if (change > 0) {
      direction = 'up';  // Higher score = worsening symptoms
    } else {
      direction = 'down'; // Lower score = improving symptoms
    }

    return { direction, percentChange, latest, previous };
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

  const filteredQuestionnaires = role === 'patient'
    ? QUESTIONNAIRES.filter(q => assignedQuestionnaires.length === 0 || assignedQuestionnaires.includes(q.id))
    : QUESTIONNAIRES;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Mental Health Questionnaires
          </h2>
          <p className="text-muted-foreground">
            {role === 'provider'
              ? 'Manage and assign evidence-based screening tools for your patients'
              : 'Evidence-based screening tools for mental health assessment'}
          </p>
        </div>
        {role === 'provider' && (
          <Button onClick={() => setIsManageDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Manage Assignments
          </Button>
        )}
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
          {role === 'patient' && assignedQuestionnaires.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Your provider has assigned {assignedQuestionnaires.length} questionnaire(s) for you to complete.
              </p>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuestionnaires.map((questionnaire) => {
              const Icon = questionnaire.icon;
              const trend = calculateScoreTrend(questionnaire.type);
              const history = getQuestionnaireHistory(questionnaire.type);
              const hasHistory = history.length > 0;

              return (
                <Card key={questionnaire.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{questionnaire.acronym}</CardTitle>
                            <CardDescription className="mt-1">
                              {questionnaire.name}
                            </CardDescription>
                          </div>
                          {hasHistory && (
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">{trend.latest}</div>
                              {history.length >= 2 && (
                                <TrendBadge direction={trend.direction} percentChange={trend.percentChange} />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {questionnaire.description}
                    </p>
                    {hasHistory && (
                      <div className="mb-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        Last completed: {new Date(history[0].completedAt).toLocaleDateString()} •
                        <span className="font-medium"> {history[0].severity}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {questionnaire.questions.length} questions
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => startQuestionnaire(questionnaire)}
                      >
                        {hasHistory ? 'Retake' : 'Start'}
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
              .map((response, index, array) => {
                // Find previous assessment of same type
                const previousResponse = array.slice(index + 1).find(r => r.questionnaireType === response.questionnaireType);
                const scoreChange = previousResponse ? response.totalScore - previousResponse.totalScore : null;
                const percentChange = previousResponse && previousResponse.totalScore > 0
                  ? ((response.totalScore - previousResponse.totalScore) / previousResponse.totalScore) * 100
                  : null;

                return (
                  <Card key={response.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{response.questionnaireName}</CardTitle>
                          <CardDescription>
                            Completed {new Date(response.completedAt).toLocaleString()}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getSeverityColor(response.severity)}>
                            {response.severity}
                          </Badge>
                          {scoreChange !== null && Math.abs(scoreChange) > 0 && (
                            <div className={`flex items-center gap-1 text-xs font-medium ${
                              scoreChange < 0 ? 'text-green-600' : scoreChange > 0 ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              {scoreChange < 0 ? (
                                <TrendingDown className="h-3 w-3" />
                              ) : (
                                <TrendingUp className="h-3 w-3" />
                              )}
                              <span>
                                {scoreChange > 0 ? '+' : ''}{scoreChange}
                                {percentChange && ` (${Math.abs(percentChange).toFixed(0)}%)`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Score:</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">
                              {response.totalScore}
                            </span>
                            {previousResponse && (
                              <span className="text-sm text-gray-500">
                                (prev: {previousResponse.totalScore})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900">
                            <strong>Interpretation:</strong> {response.interpretation}
                          </p>
                        </div>
                        {scoreChange !== null && Math.abs(scoreChange) >= 2 && (
                          <div className={`p-3 rounded-lg ${
                            scoreChange < 0 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
                          }`}>
                            <p className={`text-sm ${scoreChange < 0 ? 'text-green-900' : 'text-amber-900'}`}>
                              {scoreChange < 0 ? (
                                <><strong>Progress detected:</strong> Your symptoms have improved by {Math.abs(scoreChange)} points since your last assessment. Keep up the great work!</>
                              ) : (
                                <><strong>Change detected:</strong> Your symptoms have increased by {scoreChange} points. Consider discussing this with your provider.</>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
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

      {/* Provider Management Dialog */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Questionnaire Assignments</DialogTitle>
            <DialogDescription>
              Select which questionnaires your patients should complete. Patients will only see assigned questionnaires.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              {QUESTIONNAIRES.map((questionnaire) => {
                const Icon = questionnaire.icon;
                const isAssigned = assignedQuestionnaires.includes(questionnaire.id);
                return (
                  <Card
                    key={questionnaire.id}
                    className={`cursor-pointer transition-all ${
                      isAssigned ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => toggleQuestionnaireAssignment(questionnaire.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isAssigned ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Icon className={`h-5 w-5 ${isAssigned ? 'text-blue-600' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-base">{questionnaire.acronym}</CardTitle>
                              <CardDescription className="text-sm mt-1">
                                {questionnaire.name}
                              </CardDescription>
                            </div>
                            {isAssigned && (
                              <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {questionnaire.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {questionnaire.questions.length} questions
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {questionnaire.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-muted-foreground">
                {assignedQuestionnaires.length} of {QUESTIONNAIRES.length} questionnaires assigned
              </p>
              <Button onClick={() => setIsManageDialogOpen(false)}>Done</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
