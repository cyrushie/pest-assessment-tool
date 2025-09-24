"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Bug, Shield, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);

    if (emailValue && !validateEmail(emailValue)) {
      setEmailError(
        "Please enter a valid email address (e.g., user@example.com)"
      );
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      alert("Please fill in your name and email address.");
      return;
    }

    if (!validateEmail(email.trim())) {
      alert(
        "Please enter a valid email address with a complete domain (e.g., user@example.com)"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/save-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          consent: consent, // Send consent status to API
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save lead data");
      }

      // Store user data in sessionStorage for the assessment
      sessionStorage.setItem(
        "userData",
        JSON.stringify({ name: name.trim(), email: email.trim() })
      );

      // Redirect to assessment
      router.push("/assessment");
    } catch (error) {
      console.error("Error saving lead:", error);
      alert("There was an error processing your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                Professional Pest Assessment
              </h1>
              <p className="text-muted-foreground">
                Get expert pest identification in minutes
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
                Don't Let Pests Take Over Your Home
              </h2>
              <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                Get a professional pest assessment in under 5 minutes.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              {/* <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Instant Pest Identification
                  </h3>
                  <p className="text-muted-foreground">
                    Advanced assessment tool identifies your specific pest
                    problem
                  </p>
                </div>
              </div> */}

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mt-1">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Expert Recommendations
                  </h3>
                  <p className="text-muted-foreground">
                    Get personalized treatment plans from certified
                    professionals
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mt-1">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Fast Response
                  </h3>
                  <p className="text-muted-foreground">
                    Same-day consultations available for urgent situations
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-medium">
                ⚡ <strong>Early Detection Saves Money:</strong> Catching pest
                problems early can save you thousands in damage and treatment
                costs.
              </p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div>
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-foreground">
                  Start Your Free Assessment
                </CardTitle>
                <p className="text-muted-foreground">
                  Enter your info to get started now.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleEmailChange}
                      required
                      className={`mt-1 ${emailError ? "border-red-500" : ""}`}
                    />
                    {emailError && (
                      <p className="text-red-500 text-sm mt-1">{emailError}</p>
                    )}
                  </div>

                  <div className="flex items-start space-x-3 pt-2 p-4 bg-gray-50 rounded-lg border">
                    <Checkbox
                      id="consent"
                      checked={consent}
                      onCheckedChange={(checked) =>
                        setConsent(checked as boolean)
                      }
                      className="mt-1 w-5 h-5 border-2 border-gray-400"
                    />
                    <Label
                      htmlFor="consent"
                      className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                    >
                      I agree to receive communications about pest control
                      services and assessment results.
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-lg py-6"
                    size="lg"
                    disabled={
                      isSubmitting ||
                      !name.trim() ||
                      !email.trim() ||
                      !!emailError
                    }
                  >
                    {isSubmitting
                      ? "Processing..."
                      : "🔍 Start My Free Assessment"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    100% Free • No Credit Card Required • Instant Results
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
