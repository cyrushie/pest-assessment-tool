import { prisma } from "./prisma"

export interface AnalyticsEventData {
  eventType: string
  sessionId?: string
  leadId?: string
  properties?: Record<string, any>
}

export interface LeadData {
  name?: string
  email?: string
  phone?: string
  pestType?: string
  activityLevel?: string
  location?: string
  urgency?: string
  source?: string
  sessionId?: string
  assessmentData?: Record<string, any>
}

export async function trackEvent(data: AnalyticsEventData) {
  return await prisma.analyticsEvent.create({
    data: {
      eventType: data.eventType,
      sessionId: data.sessionId,
      leadId: data.leadId,
      properties: data.properties || {},
    },
  })
}

export async function createLead(data: LeadData) {
  return await prisma.lead.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      pestType: data.pestType,
      activityLevel: data.activityLevel,
      location: data.location,
      urgency: data.urgency,
      source: data.source,
      sessionId: data.sessionId,
      assessmentData: data.assessmentData || {},
    },
  })
}

export async function saveAssessmentSession(
  sessionId: string,
  data: {
    currentStep: number
    answers?: Record<string, any>
    pestType?: string
    activityLevel?: string
    completed?: boolean
    source?: string
    userAgent?: string
    ipAddress?: string
  },
) {
  return await prisma.assessmentSession.upsert({
    where: { sessionId },
    update: {
      currentStep: data.currentStep,
      answers: data.answers || {},
      pestType: data.pestType,
      activityLevel: data.activityLevel,
      completed: data.completed || false,
      source: data.source,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
    },
    create: {
      sessionId,
      currentStep: data.currentStep,
      answers: data.answers || {},
      pestType: data.pestType,
      activityLevel: data.activityLevel,
      completed: data.completed || false,
      source: data.source,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
    },
  })
}

export async function saveContactSubmission(data: {
  name: string
  email: string
  phone?: string
  message?: string
  pestType?: string
  activityLevel?: string
  sessionId?: string
}) {
  return await prisma.contactSubmission.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      pestType: data.pestType,
      activityLevel: data.activityLevel,
      sessionId: data.sessionId,
    },
  })
}

export async function getAnalyticsData() {
  const [totalLeads, totalEvents, recentLeads, eventsByType, leadsByPestType, conversionRate] = await Promise.all([
    prisma.lead.count(),
    prisma.analyticsEvent.count(),
    prisma.lead.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { events: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["eventType"],
      _count: { eventType: true },
    }),
    prisma.lead.groupBy({
      by: ["pestType"],
      _count: { pestType: true },
      where: { pestType: { not: null } },
    }),
    getConversionRate(),
  ])

  return {
    totalLeads,
    totalEvents,
    recentLeads,
    eventsByType: eventsByType.map((e) => ({
      eventType: e.eventType,
      count: e._count.eventType,
    })),
    leadsByPestType: leadsByPestType.map((l) => ({
      pestType: l.pestType,
      count: l._count.pestType,
    })),
    conversionRate,
  }
}

async function getConversionRate() {
  const [assessmentStarted, leadsGenerated] = await Promise.all([
    prisma.analyticsEvent.count({
      where: { eventType: "assessment_started" },
    }),
    prisma.lead.count(),
  ])

  return assessmentStarted > 0 ? (leadsGenerated / assessmentStarted) * 100 : 0
}
