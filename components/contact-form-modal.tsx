"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, MessageSquare, CheckCircle, Loader2 } from "lucide-react";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  preferredTime: string;
  notes: string;
}

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactType: "call" | "sms";
  pestInfo: {
    pest: string;
    activityLevel: string;
    confidence: string;
  };
  assessmentAnswers: any;
}

export function ContactFormModal({
  isOpen,
  onClose,
  contactType,
  pestInfo,
  assessmentAnswers,
}: ContactFormModalProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    preferredTime: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const submissionData = {
      ...formData,
      pestInfo,
      assessmentAnswers,
    };

    try {
      const endpoint =
        contactType === "call" ? "/api/schedule-call" : "/api/send-sms";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to process request");
      }

      console.log(`${contactType} integration successful:`, result);
      setIsSubmitted(true);
    } catch (error) {
      console.error(`${contactType} integration error:`, error);
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
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center space-y-4 py-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Thank You!
              </h3>
              <p className="text-muted-foreground mt-2">
                {contactType === "call"
                  ? "We've scheduled your consultation! Our team will call you within 24 hours to discuss your pest issue and treatment options."
                  : "SMS sent successfully! You'll receive a text message shortly with next steps and our contact information."}
              </p>
            </div>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {contactType === "call" ? (
              <Phone className="w-5 h-5" />
            ) : (
              <MessageSquare className="w-5 h-5" />
            )}
            {contactType === "call"
              ? "Schedule Phone Consultation"
              : "SMS Reminder Setup"}
          </DialogTitle>
          <DialogDescription>
            Please provide your contact information so we can
            {contactType === "call"
              ? " schedule your consultation"
              : " send you an SMS reminder"}
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(555) 123-4567"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          {contactType === "call" && (
            <div className="space-y-2">
              <Label htmlFor="preferredTime">Preferred Call Time</Label>
              <Input
                id="preferredTime"
                value={formData.preferredTime}
                onChange={(e) =>
                  handleInputChange("preferredTime", e.target.value)
                }
                placeholder="e.g., Weekday mornings, After 6 PM"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any additional information about your pest issue..."
              rows={3}
            />
          </div>

          {/* Assessment Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm text-card-foreground">
              Assessment Summary
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong>Identified Pest:</strong> {pestInfo.pest}
              </p>
              <p>
                <strong>Activity Level:</strong> {pestInfo.activityLevel}
              </p>
              <p>
                <strong>Confidence:</strong> {pestInfo.confidence}
              </p>
            </div>
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
                  {contactType === "call" ? "Scheduling..." : "Sending SMS..."}
                </>
              ) : contactType === "call" ? (
                "Schedule Call"
              ) : (
                "Send SMS"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
