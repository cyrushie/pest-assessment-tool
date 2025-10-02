"use client";

import type React from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, CheckCircle, Loader2, X } from "lucide-react";

interface StandaloneScheduleFormProps {
  onClose: () => void;
}

export function StandaloneScheduleForm({
  onClose,
}: StandaloneScheduleFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredTime: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const submissionData = {
      ...formData,
      contactType: "call",
      pestInfo: {
        pest: "General Consultation",
        activityLevel: "Not Assessed",
        confidence: "N/A",
      },
      assessmentAnswers: {
        source: "Direct Home Page Consultation Request",
      },
      detailedDescription: formData.notes,
      otherPests: [],
      uploadedFilesInfo: [],
    };

    try {
      // Save to Google Sheets
      const sheetsResponse = await fetch("/api/save-to-sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!sheetsResponse.ok) {
        console.warn(
          "Failed to save to Google Sheets, but continuing with main flow"
        );
      }

      // Schedule the call
      const response = await fetch("/api/schedule-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to schedule consultation");
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Consultation scheduling error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.email && formData.phone;

  if (isSubmitted) {
    return (
      <Card className="shadow-lg max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4 py-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Thank You!
              </h3>
              <p className="text-muted-foreground mt-2">
                We've scheduled your consultation! Our team will call you within
                24 hours to discuss your pest concerns and treatment options.
              </p>
            </div>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            <CardTitle>Schedule Phone Consultation</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          Skip the assessment and speak directly with our pest control experts.
          We'll call you within 24 hours.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-name">Full Name *</Label>
              <Input
                id="schedule-name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-phone">Phone Number *</Label>
              <Input
                id="schedule-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(555) 123-4567"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule-email">Email Address *</Label>
            <Input
              id="schedule-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule-preferredTime">Preferred Call Time</Label>
            <Input
              id="schedule-preferredTime"
              value={formData.preferredTime}
              onChange={(e) =>
                handleInputChange("preferredTime", e.target.value)
              }
              placeholder="e.g., Weekday mornings, After 6 PM"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule-notes">
              Tell us about your pest concerns
            </Label>
            <Textarea
              id="schedule-notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Describe any pest issues you're experiencing..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule Call"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
