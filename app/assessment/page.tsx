"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bug } from "lucide-react";
import { AIChatbot } from "@/components/ai-chatbot";

export default function AssessmentPage() {
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserData = sessionStorage.getItem("userData");
    if (!storedUserData) {
      router.push("/");
      return;
    }
    setUserData(JSON.parse(storedUserData));
  }, [router]);

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bug className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Bug className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-card-foreground">
                Pest Assessment
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-Powered Consultation
              </p>
            </div>
            <div className="ml-auto">
              <p className="text-sm text-muted-foreground">
                Welcome, {userData.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <AIChatbot
          userName={userData.name}
          userEmail={userData.email}
          centered={true}
        />
      </div>
    </div>
  );
}
