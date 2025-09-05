"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Bug, Home, Phone, MessageSquare } from "lucide-react";
import { AIChatbot } from "@/components/ai-chatbot";
import { ContactFormModal } from "@/components/contact-form-modal";

interface Question {
  id: number;
  question: string;
  options: { value: string; label: string }[];
  multiple?: boolean;
}

interface UserAnswers {
  [key: number]: string | string[];
}

const questions: Question[] = [
  {
    id: 1,
    question:
      "Have you noticed pests or signs of pests in or around your home/business?",
    options: [
      { value: "seen_them", label: "Yes, I've seen them" },
      {
        value: "seen_signs",
        label: "Yes, I've seen signs (droppings, damage, etc.)",
      },
      { value: "no_signs", label: "No, I haven't seen anything" },
    ],
  },
  {
    id: 2,
    question:
      "Where have you noticed the pest activity? (Select all that apply)",
    options: [
      { value: "kitchen", label: "Kitchen" },
      { value: "attic", label: "Attic/Crawl Space" },
      { value: "bedroom", label: "Bedroom/Furniture" },
      { value: "basement", label: "Basement/Storage" },
      { value: "outdoors", label: "Outdoors (yard, garden, etc.)" },
      { value: "other", label: "Other (please specify)" },
    ],
    multiple: true,
  },
  {
    id: 3,
    question: "What kind of behavior have you observed?",
    options: [
      {
        value: "scurrying",
        label: "Fast scurrying or crawling (especially at night)",
      },
      { value: "flying", label: "Flying around food or trash" },
      {
        value: "crawling_furniture",
        label: "Crawling around furniture or beds",
      },
      { value: "no_behavior", label: "No behavior observed" },
    ],
  },
  {
    id: 4,
    question: "Have you noticed any of these signs? (Select all that apply)",
    options: [
      { value: "droppings", label: "Droppings (small, black pellets)" },
      {
        value: "damage",
        label: "Chewed or damaged food packaging, furniture, or wires",
      },
      { value: "nests", label: "Visible nests or webs" },
      { value: "bites", label: "Bite marks or skin rashes" },
      { value: "odors", label: "Musty or strong odors" },
    ],
    multiple: true,
  },
  {
    id: 5,
    question: "How often are you seeing or hearing signs of pests?",
    options: [
      { value: "rarely", label: "Rarely (once or twice a month)" },
      { value: "occasionally", label: "Occasionally (once or twice a week)" },
      { value: "frequently", label: "Frequently (every day or night)" },
    ],
  },
];

function identifyPest(answers: UserAnswers) {
  const locations = (answers[2] as string[]) || [];
  const behaviors = (answers[3] as string) || "";
  const signs = (answers[4] as string[]) || [];
  const frequency = (answers[5] as string) || "";

  const activityLevel = getActivityLevel(answers);

  // Simple pest identification logic
  if (signs.includes("bites") && locations.includes("bedroom")) {
    return { pest: "Bed Bugs", activityLevel, confidence: "High" };
  }
  if (signs.includes("droppings") && behaviors === "scurrying") {
    return { pest: "Rodents (Mice/Rats)", activityLevel, confidence: "High" };
  }
  if (signs.includes("odors") && locations.includes("kitchen")) {
    return { pest: "Cockroaches", activityLevel, confidence: "Medium" };
  }
  if (behaviors === "flying" && locations.includes("kitchen")) {
    return { pest: "Fruit Flies/Gnats", activityLevel, confidence: "Medium" };
  }
  return { pest: "General Pest Activity", activityLevel, confidence: "Low" };
}

function getActivityLevel(answers: UserAnswers) {
  const frequency = (answers[5] as string) || "";
  if (frequency === "frequently") return "High";
  if (frequency === "occasionally") return "Moderate";
  return "Low";
}

function handleContactClick(
  type: "call" | "sms",
  setShowContactForm: any,
  setContactType: any
) {
  setContactType(type);
  setShowContactForm(true);
}

export default function PestAssessmentTool() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [showResults, setShowResults] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactType, setContactType] = useState<"call" | "sms">("call");

  const handleAnswer = (questionId: number, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const getCurrentAnswer = () => {
    return answers[questions[currentQuestion].id];
  };

  const isAnswered = () => {
    const answer = getCurrentAnswer();
    if (questions[currentQuestion].multiple) {
      return Array.isArray(answer) && answer.length > 0;
    }
    return answer !== undefined;
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-background">
        <ResultsPage
          answers={answers}
          setShowContactForm={setShowContactForm}
          setContactType={setContactType}
        />
        <AIChatbot currentQuestion={-1} answers={answers} />
        <ContactFormModal
          isOpen={showContactForm}
          onClose={() => setShowContactForm(false)}
          contactType={contactType}
          pestInfo={identifyPest(answers)}
          assessmentAnswers={answers}
        />
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Bug className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">
                Pest Assessment Tool
              </h1>
              <p className="text-muted-foreground">
                Professional pest identification and consultation.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-card-foreground">
              {question.question}
            </CardTitle>
            {question.multiple && (
              <Badge variant="secondary" className="w-fit">
                Select all that apply
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option) => {
              const isSelected = question.multiple
                ? Array.isArray(getCurrentAnswer()) &&
                  (getCurrentAnswer() as string[]).includes(option.value)
                : getCurrentAnswer() === option.value;

              return (
                <Button
                  key={option.value}
                  variant={isSelected ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto p-4"
                  onClick={() => {
                    if (question.multiple) {
                      const currentAnswers =
                        (getCurrentAnswer() as string[]) || [];
                      const newAnswers = isSelected
                        ? currentAnswers.filter((a) => a !== option.value)
                        : [...currentAnswers, option.value];
                      handleAnswer(question.id, newAnswers);
                    } else {
                      handleAnswer(question.id, option.value);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    {isSelected && <CheckCircle className="w-5 h-5" />}
                    <span>{option.label}</span>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          <Button
            onClick={nextQuestion}
            disabled={!isAnswered()}
            className="min-w-24"
          >
            {currentQuestion === questions.length - 1 ? "Get Results" : "Next"}
          </Button>
        </div>
      </div>

      <AIChatbot
        currentQuestion={currentQuestion}
        answers={answers}
        onSuggestAction={(action) => {
          if (action === "next" && isAnswered()) {
            nextQuestion();
          }
        }}
      />
    </div>
  );
}

function ResultsPage({
  answers,
  setShowContactForm,
  setContactType,
}: {
  answers: UserAnswers;
  setShowContactForm: any;
  setContactType: any;
}) {
  // Pest identification logic
  const pestResult = identifyPest(answers);
  const activityLevel = getActivityLevel(answers);
  const recommendation = getRecommendation(activityLevel);

  function getRecommendation(activityLevel: string) {
    switch (activityLevel) {
      case "High":
        return {
          message:
            "It looks like you may have a significant pest issue. We recommend scheduling a consultation for a professional inspection and treatment.",
          action: "immediate",
        };
      case "Moderate":
        return {
          message:
            "There's a possibility that your pest problem is manageable with preventive steps. But, we still recommend a consultation to ensure it doesn't escalate.",
          action: "recommended",
        };
      default:
        return {
          message:
            "Your pest activity appears to be minor. However, we recommend keeping an eye out. If things change, it's a good idea to schedule a consultation.",
          action: "optional",
        };
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Bug className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">
                Assessment Results
              </h1>
              <p className="text-muted-foreground">
                Your personalized pest identification and recommendations
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Results Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Pest Identification Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Likely Pest
                </p>
                <p className="text-lg font-semibold text-card-foreground">
                  {pestResult.pest}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Activity Level
                </p>
                <Badge
                  variant={
                    activityLevel === "High"
                      ? "destructive"
                      : activityLevel === "Moderate"
                      ? "default"
                      : "secondary"
                  }
                >
                  {activityLevel}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Confidence Level
              </p>
              <Badge variant="outline">{pestResult.confidence}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recommendation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Our Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-card-foreground mb-4">
              {recommendation.message}
            </p>

            {recommendation.action === "immediate" && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-destructive">
                  Immediate Action Recommended
                </p>
                <p className="text-sm text-destructive/80">
                  High pest activity detected. Professional treatment advised.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Options */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Your Consultation</CardTitle>
            <p className="text-muted-foreground">
              Choose how you'd like to connect with our pest control experts
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              size="lg"
              onClick={() =>
                handleContactClick("call", setShowContactForm, setContactType)
              }
            >
              <Phone className="w-5 h-5 mr-3" />
              Schedule a Phone Call
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              size="lg"
              onClick={() =>
                handleContactClick("sms", setShowContactForm, setContactType)
              }
            >
              <MessageSquare className="w-5 h-5 mr-3" />
              Send SMS Reminder
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
