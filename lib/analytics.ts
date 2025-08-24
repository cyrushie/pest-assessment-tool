interface ConversionEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, any>;
}

interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
}

interface ConversionFunnel {
  step: string;
  timestamp: number;
  sessionId: string;
  metadata?: Record<string, any>;
}

declare var gtag: any; // Declare gtag variable

class AnalyticsTracker {
  private sessionId: string;
  private startTime: number;
  private conversionFunnel: ConversionFunnel[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.initializeSession();
  }

  private generateSessionId(): string {
    return (
      "session_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now()
    );
  }

  private initializeSession() {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const session: UserSession = {
        sessionId: this.sessionId,
        startTime: this.startTime,
        source: urlParams.get("utm_source") || "direct",
        medium: urlParams.get("utm_medium") || "none",
        campaign: urlParams.get("utm_campaign") || undefined,
        referrer: document.referrer || "direct",
      };

      this.storeSessionData(session);
      this.trackEvent("session_start", "engagement", "session_start");
    }
  }

  private storeSessionData(session: UserSession) {
    localStorage.setItem("analytics_session", JSON.stringify(session));
  }

  private getSessionData(): UserSession | null {
    const stored = localStorage.getItem("analytics_session");
    return stored ? JSON.parse(stored) : null;
  }

  // Track conversion events
  trackEvent(
    event: string,
    category: string,
    action: string,
    label?: string,
    value?: number,
    customParameters?: Record<string, any>
  ) {
    const eventData: ConversionEvent = {
      event,
      category,
      action,
      label,
      value,
      customParameters: {
        ...customParameters,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
    };

    // Send to Google Analytics 4 (if configured)
    if (typeof gtag !== "undefined") {
      gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value,
        custom_parameters: customParameters,
      });
    }

    // Store locally for dashboard
    this.storeConversionEvent(eventData);

    console.log("[Analytics] Event tracked:", eventData);
  }

  // Track funnel progression
  trackFunnelStep(step: string, metadata?: Record<string, any>) {
    const funnelData: ConversionFunnel = {
      step,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      metadata,
    };

    this.conversionFunnel.push(funnelData);
    this.storeFunnelData();

    this.trackEvent(
      "funnel_step",
      "conversion",
      step,
      undefined,
      undefined,
      metadata
    );
  }

  private storeConversionEvent(event: ConversionEvent) {
    const stored = localStorage.getItem("conversion_events") || "[]";
    const events = JSON.parse(stored);
    events.push(event);

    // Keep only last 100 events to prevent storage bloat
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }

    localStorage.setItem("conversion_events", JSON.stringify(events));
  }

  private storeFunnelData() {
    localStorage.setItem(
      "conversion_funnel_" + this.sessionId,
      JSON.stringify(this.conversionFunnel)
    );
  }

  // Get conversion metrics for dashboard
  getConversionMetrics() {
    const events = JSON.parse(
      localStorage.getItem("conversion_events") || "[]"
    );
    const sessions = this.getAllSessions();

    return {
      totalSessions: sessions.length,
      totalEvents: events.length,
      conversionRate: this.calculateConversionRate(events, sessions),
      topSources: this.getTopSources(sessions),
      funnelDropoff: this.getFunnelDropoff(),
      leadQuality: this.getLeadQualityMetrics(events),
    };
  }

  private getAllSessions(): UserSession[] {
    const sessions: UserSession[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("analytics_session")) {
        const session = JSON.parse(localStorage.getItem(key) || "{}");
        sessions.push(session);
      }
    }
    return sessions;
  }

  private calculateConversionRate(
    events: ConversionEvent[],
    sessions: UserSession[]
  ): number {
    const conversions = events.filter(
      (e) => e.action === "lead_generated"
    ).length;
    return sessions.length > 0 ? (conversions / sessions.length) * 100 : 0;
  }

  private getTopSources(sessions: UserSession[]) {
    const sources = sessions.reduce((acc, session) => {
      const source = session.source || "direct";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sources)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));
  }

  private getFunnelDropoff() {
    const funnelSteps = [
      "assessment_started",
      "assessment_completed",
      "results_viewed",
      "contact_form_opened",
      "lead_generated",
    ];
    const stepCounts = funnelSteps.reduce((acc, step) => {
      acc[step] = 0;
      return acc;
    }, {} as Record<string, number>);

    // Count sessions that reached each step
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("conversion_funnel_")) {
        const funnel = JSON.parse(localStorage.getItem(key) || "[]");
        const stepsReached = new Set(
          funnel.map((f: ConversionFunnel) => f.step)
        );

        funnelSteps.forEach((step) => {
          if (stepsReached.has(step)) {
            stepCounts[step]++;
          }
        });
      }
    }

    return funnelSteps.map((step) => ({
      step,
      count: stepCounts[step],
      dropoffRate:
        step === "assessment_started"
          ? 0
          : stepCounts[funnelSteps[funnelSteps.indexOf(step) - 1]] > 0
          ? ((stepCounts[funnelSteps[funnelSteps.indexOf(step) - 1]] -
              stepCounts[step]) /
              stepCounts[funnelSteps[funnelSteps.indexOf(step) - 1]]) *
            100
          : 0,
    }));
  }

  private getLeadQualityMetrics(events: ConversionEvent[]) {
    const leadEvents = events.filter((e) => e.action === "lead_generated");

    const qualityMetrics = {
      highActivity: leadEvents.filter(
        (e) => e.customParameters?.activityLevel === "High"
      ).length,
      mediumActivity: leadEvents.filter(
        (e) => e.customParameters?.activityLevel === "Moderate"
      ).length,
      lowActivity: leadEvents.filter(
        (e) => e.customParameters?.activityLevel === "Low"
      ).length,
      averageConfidence: 0,
    };

    const confidenceScores = leadEvents
      .map((e) =>
        Number.parseFloat(
          e.customParameters?.confidence?.replace("%", "") || "0"
        )
      )
      .filter((score) => !isNaN(score));

    qualityMetrics.averageConfidence =
      confidenceScores.length > 0
        ? confidenceScores.reduce((sum, score) => sum + score, 0) /
          confidenceScores.length
        : 0;

    return qualityMetrics;
  }
}

// Global analytics instance
export const analytics = new AnalyticsTracker();

// Convenience functions for common tracking events
export const trackAssessmentStart = () => {
  analytics.trackFunnelStep("assessment_started");
};

export const trackAssessmentProgress = (
  questionNumber: number,
  totalQuestions: number
) => {
  analytics.trackEvent(
    "assessment_progress",
    "engagement",
    "question_answered",
    `question_${questionNumber}`,
    questionNumber,
    {
      progress: (questionNumber / totalQuestions) * 100,
    }
  );
};

export const trackAssessmentComplete = (
  pestType: string,
  activityLevel: string,
  confidence: string
) => {
  analytics.trackFunnelStep("assessment_completed", {
    pestType,
    activityLevel,
    confidence,
  });
  analytics.trackEvent(
    "assessment_complete",
    "conversion",
    "assessment_finished",
    pestType,
    undefined,
    {
      pestType,
      activityLevel,
      confidence,
    }
  );
};

export const trackResultsViewed = (pestType: string, activityLevel: string) => {
  analytics.trackFunnelStep("results_viewed", { pestType, activityLevel });
  analytics.trackEvent(
    "results_viewed",
    "engagement",
    "results_displayed",
    pestType
  );
};

export const trackContactFormOpened = (contactType: "call" | "sms") => {
  analytics.trackFunnelStep("contact_form_opened", { contactType });
  analytics.trackEvent(
    "contact_form_opened",
    "conversion",
    "form_opened",
    contactType
  );
};

export const trackLeadGenerated = (
  contactType: "call" | "sms",
  pestType: string,
  activityLevel: string,
  confidence: string
) => {
  analytics.trackFunnelStep("lead_generated", {
    contactType,
    pestType,
    activityLevel,
    confidence,
  });
  analytics.trackEvent(
    "lead_generated",
    "conversion",
    "lead_submitted",
    contactType,
    1,
    {
      pestType,
      activityLevel,
      confidence,
      contactType,
    }
  );
};

export const trackChatbotInteraction = (message: string, response: string) => {
  analytics.trackEvent(
    "chatbot_interaction",
    "engagement",
    "message_sent",
    undefined,
    undefined,
    {
      userMessage: message,
      botResponse: response,
    }
  );
};
