"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Bug, Phone, Upload, X, AlertTriangle } from "lucide-react"
import { AIChatbot } from "@/components/ai-chatbot"
import { ContactFormModal } from "@/components/contact-form-modal"

interface Question {
  id: number
  question: string
  options: { value: string; label: string }[]
  multiple?: boolean
}

interface UserAnswers {
  [key: number]: string | string[]
}

const questions: Question[] = [
  {
    id: 1,
    question: "Have you noticed pests or signs of pests in or around your home/business?",
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
    question: "Where have you noticed the pest activity? (Select all that apply)",
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
]

function identifyPest(answers: UserAnswers) {
  const locations = (answers[2] as string[]) || []
  const behaviors = (answers[3] as string) || ""
  const signs = (answers[4] as string[]) || []
  const frequency = (answers[5] as string) || ""

  const activityLevel = getActivityLevel(answers)

  // Simple pest identification logic
  if (signs.includes("bites") && locations.includes("bedroom")) {
    return { pest: "Bed Bugs", activityLevel, confidence: "High" }
  }
  if (signs.includes("droppings") && behaviors === "scurrying") {
    return { pest: "Rodents (Mice/Rats)", activityLevel, confidence: "High" }
  }
  if (signs.includes("odors") && locations.includes("kitchen")) {
    return { pest: "Cockroaches", activityLevel, confidence: "Medium" }
  }
  if (behaviors === "flying" && locations.includes("kitchen")) {
    return { pest: "Fruit Flies/Gnats", activityLevel, confidence: "Medium" }
  }
  return { pest: "General Pest Activity", activityLevel, confidence: "Low" }
}

function getActivityLevel(answers: UserAnswers) {
  const frequency = (answers[5] as string) || ""
  if (frequency === "frequently") return "Severe"
  if (frequency === "occasionally") return "High"
  return "Moderate"
}

function handleContactClick(setShowContactForm: any, setContactType: any) {
  setContactType("call")
  setShowContactForm(true)
}

export default function PestAssessmentTool() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<UserAnswers>({})
  const [showResults, setShowResults] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactType, setContactType] = useState<"call">("call")
  const [detailedDescription, setDetailedDescription] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; filename: string; size: number; type: string }[]>(
    [],
  )
  const [isUploading, setIsUploading] = useState(false)

  const handleAnswer = (questionId: number, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      setShowResults(true)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  const getCurrentAnswer = () => {
    return answers[questions[currentQuestion].id]
  }

  const isAnswered = () => {
    const answer = getCurrentAnswer()
    if (questions[currentQuestion].multiple) {
      return Array.isArray(answer) && answer.length > 0
    }
    return answer !== undefined
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    if (files.length === 0) return

    setIsUploading(true)

    try {
      const uploadPromises = files.map(async (file) => {
        const maxSize = 20 * 1024 * 1024 // 20MB in bytes
        const validTypes = ["image/", "video/"]

        if (file.size > maxSize) {
          alert(`File "${file.name}" is too large. Maximum size is 20MB.`)
          return null
        }

        if (!validTypes.some((type) => file.type.startsWith(type))) {
          alert(`File "${file.name}" is not a valid image or video file.`)
          return null
        }

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Upload failed")
        }

        return await response.json()
      })

      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter((result) => result !== null)

      setUploadedFiles((prev) => [...prev, ...successfulUploads])
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload files. Please try again.")
    } finally {
      setIsUploading(false)
      // Reset the input
      event.target.value = ""
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-background">
        <ResultsPage
          answers={answers}
          setShowContactForm={setShowContactForm}
          setContactType={setContactType}
          detailedDescription={detailedDescription}
          setDetailedDescription={setDetailedDescription}
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          handleFileUpload={handleFileUpload}
          formatFileSize={formatFileSize}
          removeFile={removeFile}
          isUploading={isUploading}
        />
        <AIChatbot currentQuestion={-1} answers={answers} />
        <ContactFormModal
          isOpen={showContactForm}
          onClose={() => setShowContactForm(false)}
          contactType={contactType}
          pestInfo={identifyPest(answers)}
          assessmentAnswers={answers}
          detailedDescription={detailedDescription}
          uploadedFiles={uploadedFiles}
        />
      </div>
    )
  }

  const question = questions[currentQuestion]

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
              <h1 className="text-2xl font-bold text-card-foreground">Pest Assessment Tool</h1>
              <p className="text-muted-foreground">Professional pest identification and consultation</p>
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
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-card-foreground">{question.question}</CardTitle>
            {question.multiple && (
              <Badge variant="secondary" className="w-fit">
                Select all that apply
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option) => {
              const isSelected = question.multiple
                ? Array.isArray(getCurrentAnswer()) && (getCurrentAnswer() as string[]).includes(option.value)
                : getCurrentAnswer() === option.value

              return (
                <Button
                  key={option.value}
                  variant={isSelected ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto p-4"
                  onClick={() => {
                    if (question.multiple) {
                      const currentAnswers = (getCurrentAnswer() as string[]) || []
                      const newAnswers = isSelected
                        ? currentAnswers.filter((a) => a !== option.value)
                        : [...currentAnswers, option.value]
                      handleAnswer(question.id, newAnswers)
                    } else {
                      handleAnswer(question.id, option.value)
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    {isSelected && <CheckCircle className="w-5 h-5" />}
                    <span>{option.label}</span>
                  </div>
                </Button>
              )
            })}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={prevQuestion} disabled={currentQuestion === 0}>
            Previous
          </Button>
          <Button onClick={nextQuestion} disabled={!isAnswered()} className="min-w-24">
            {currentQuestion === questions.length - 1 ? "Get Results" : "Next"}
          </Button>
        </div>
      </div>

      <AIChatbot
        currentQuestion={currentQuestion}
        answers={answers}
        onSuggestAction={(action) => {
          if (action === "next" && isAnswered()) {
            nextQuestion()
          }
        }}
      />
    </div>
  )
}

function ResultsPage({
  answers,
  setShowContactForm,
  setContactType,
  detailedDescription,
  setDetailedDescription,
  uploadedFiles,
  setUploadedFiles,
  handleFileUpload,
  formatFileSize,
  removeFile,
  isUploading,
}: {
  answers: UserAnswers
  setShowContactForm: any
  setContactType: any
  detailedDescription: string
  setDetailedDescription: any
  uploadedFiles: {
    url: string
    filename: string
    size: number
    type: string
  }[]
  setUploadedFiles: any
  handleFileUpload: any
  formatFileSize: any
  removeFile: any
  isUploading: boolean
}) {
  const pestResult = identifyPest(answers)
  const activityLevel = getActivityLevel(answers)
  const recommendation = getRecommendation(activityLevel)

  const getThemeColors = (level: string) => {
    switch (level) {
      case "Severe":
        return {
          primary: "bg-red-600 hover:bg-red-700",
          primaryText: "text-white",
          accent: "bg-red-50 border-red-200",
          accentText: "text-red-800",
          badge: "bg-red-100 text-red-800 border-red-300",
          headerBg: "bg-gradient-to-r from-red-600 to-red-700",
          pulse: "animate-pulse",
          glow: "shadow-lg shadow-red-500/25",
        }
      case "High":
        return {
          primary: "bg-orange-600 hover:bg-orange-700",
          primaryText: "text-white",
          accent: "bg-orange-50 border-orange-200",
          accentText: "text-orange-800",
          badge: "bg-orange-100 text-orange-800 border-orange-300",
          headerBg: "bg-gradient-to-r from-orange-600 to-orange-700",
          pulse: "",
          glow: "shadow-md shadow-orange-500/20",
        }
      default: // Moderate
        return {
          primary: "bg-yellow-600 hover:bg-yellow-700",
          primaryText: "text-white",
          accent: "bg-yellow-50 border-yellow-200",
          accentText: "text-yellow-800",
          badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
          headerBg: "bg-gradient-to-r from-yellow-600 to-yellow-700",
          pulse: "",
          glow: "shadow-sm shadow-yellow-500/15",
        }
    }
  }

  const themeColors = getThemeColors(activityLevel)

  function getRecommendation(activityLevel: string) {
    switch (activityLevel) {
      case "Severe":
        return {
          message:
            "🚨 URGENT: You have a severe pest infestation that requires immediate professional intervention. Delaying treatment could lead to significant property damage and health risks.",
          action: "immediate",
        }
      case "High":
        return {
          message:
            "⚠️ WARNING: Your pest problem is escalating and needs prompt attention. Professional treatment is strongly recommended to prevent further spread.",
          action: "recommended",
        }
      default: // Moderate
        return {
          message:
            "⚡ CAUTION: Early signs of pest activity detected. Acting now can prevent a minor issue from becoming a major infestation.",
          action: "optional",
        }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className={`border-b border-border ${themeColors.headerBg}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg ${themeColors.pulse}`}>
              <Bug className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Assessment Results</h1>
              <p className="text-white/90">Your personalized pest identification and recommendations</p>
            </div>
            {activityLevel === "Severe" && (
              <div className="ml-auto">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">URGENT</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* <Card
          className={`mb-6 ${themeColors.glow} border-2`}
          style={{
            borderColor:
              activityLevel === "Severe"
                ? "#dc2626"
                : activityLevel === "High"
                ? "#ea580c"
                : "#d97706",
          }}
        >
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
                  className={`${themeColors.badge} font-bold ${
                    activityLevel === "Severe" ? "animate-pulse" : ""
                  }`}
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
          </Card> */}

        <Card
          className={`mb-6 ${themeColors.accent} border-2`}
          style={{
            borderColor: activityLevel === "Severe" ? "#dc2626" : activityLevel === "High" ? "#ea580c" : "#d97706",
          }}
        >
          <CardHeader>
            <CardTitle className={themeColors.accentText}>Our Professional Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`${themeColors.accentText} mb-4 font-medium text-lg`}>{recommendation.message}</p>

            {recommendation.action === "immediate" && (
              <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 mb-4 animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-lg font-bold text-red-600">IMMEDIATE ACTION REQUIRED</p>
                </div>
                <p className="text-red-700 font-medium">
                  🔥 Severe pest activity detected. Every hour of delay increases damage and treatment costs.
                  Professional intervention needed NOW!
                </p>
              </div>
            )}

            {recommendation.action === "recommended" && (
              <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <p className="text-lg font-bold text-orange-600">PROMPT ACTION RECOMMENDED</p>
                </div>
                <p className="text-orange-700 font-medium">
                  ⚠️ Your pest problem is escalating. Don't let it become a costly emergency - act now!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Description Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Describe Your Situation</CardTitle>
            <p className="text-muted-foreground">
              Provide additional details about your pest situation to help our experts better understand your needs
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="detailed-description">Additional Details</Label>
              <Textarea
                id="detailed-description"
                placeholder="Describe any additional observations, concerns, or specific areas where you've noticed pest activity..."
                value={detailedDescription}
                onChange={(e) => setDetailedDescription(e.target.value)}
                className="min-h-24 mt-2"
              />
            </div>

            <div>
              <Label htmlFor="file-upload">Upload Images or Videos (Max 20MB each)</Label>
              <div className="mt-2">
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="w-full justify-center"
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Uploading..." : "Choose Files"}
                </Button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Uploaded Files:</p>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)} • {file.type.startsWith("image/") ? "Image" : "Video"}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="ml-2 h-8 w-8 p-0">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${themeColors.glow} border-2`}
          style={{
            borderColor: activityLevel === "Severe" ? "#dc2626" : activityLevel === "High" ? "#ea580c" : "#d97706",
          }}
        >
          <CardHeader>
            <CardTitle className="text-xl">🎯 Get Your FREE Professional Consultation</CardTitle>
            <p className="text-muted-foreground font-medium">
              {activityLevel === "Severe"
                ? "Emergency consultation available - Don't wait, call now!"
                : activityLevel === "High"
                  ? "Priority scheduling available - Secure your spot today!"
                  : "Expert advice to prevent escalation - Schedule now!"}
            </p>
          </CardHeader>
          <CardContent>
            <Button
              className={`w-full justify-center text-lg py-6 ${themeColors.primary} ${themeColors.primaryText} ${
                activityLevel === "Severe" ? "animate-pulse" : ""
              } ${themeColors.glow}`}
              size="lg"
              onClick={() => handleContactClick(setShowContactForm, setContactType)}
            >
              <Phone className="w-6 h-6 mr-3" />
              {activityLevel === "Severe"
                ? "🚨 EMERGENCY CONSULTATION - CALL NOW"
                : activityLevel === "High"
                  ? "⚡ PRIORITY CONSULTATION - SCHEDULE TODAY"
                  : "📞 FREE CONSULTATION - BOOK NOW"}
            </Button>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {activityLevel === "Severe"
                  ? "⏰ Same-day service available • 24/7 emergency response"
                  : activityLevel === "High"
                    ? "⏰ Next-day service available • Limited slots remaining"
                    : "⏰ Flexible scheduling • Prevention is key"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
