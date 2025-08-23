"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  Target,
  Activity,
  Download,
  RefreshCw,
} from "lucide-react";

interface ConversionMetrics {
  totalSessions: number;
  totalEvents: number;
  conversionRate: number;
  topSources: Array<{ source: string; count: number }>;
  funnelDropoff: Array<{ step: string; count: number; dropoffRate: number }>;
  leadQuality: {
    highActivity: number;
    mediumActivity: number;
    lowActivity: number;
    averageConfidence: number;
  };
}

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      // Import analytics dynamically to avoid SSR issues
      const { analytics } = await import("@/lib/analytics");
      const data = analytics.getConversionMetrics();
      setMetrics(data);
    } catch (error) {
      console.error("Failed to load analytics metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    if (!metrics) return;

    const dataStr = JSON.stringify(metrics, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pest-assessment-analytics-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No analytics data available yet.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Start using the assessment tool to see conversion metrics.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const funnelData = metrics.funnelDropoff.map((item) => ({
    step: item.step.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    count: item.count,
    dropoff: item.dropoffRate,
  }));

  const sourceData = metrics.topSources.map((item) => ({
    source: item.source,
    visitors: item.count,
  }));

  const leadQualityData = [
    {
      name: "High Activity",
      value: metrics.leadQuality.highActivity,
      color: "#ea580c",
    },
    {
      name: "Medium Activity",
      value: metrics.leadQuality.mediumActivity,
      color: "#f97316",
    },
    {
      name: "Low Activity",
      value: metrics.leadQuality.lowActivity,
      color: "#10b981",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track visitor-to-lead conversions and assessment performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadMetrics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {metrics.totalSessions}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique visitor sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {metrics.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Visitors to leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {metrics.totalEvents}
            </div>
            <p className="text-xs text-muted-foreground">
              Tracked interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Confidence
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {metrics.leadQuality.averageConfidence.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Assessment accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
          <TabsTrigger value="quality">Lead Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel Analysis</CardTitle>
              <CardDescription>
                Track user progression through the assessment process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.map((item, index) => (
                  <div key={item.step} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.step}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {item.count} users
                        </span>
                        {index > 0 && (
                          <Badge
                            variant={
                              item.dropoff > 50
                                ? "destructive"
                                : item.dropoff > 25
                                ? "secondary"
                                : "default"
                            }
                          >
                            {item.dropoff.toFixed(1)}% dropoff
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Progress
                      value={
                        index === 0
                          ? 100
                          : (item.count / funnelData[0].count) * 100
                      }
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Funnel Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="step"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>
                Where your visitors are coming from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visitors" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Quality Distribution</CardTitle>
              <CardDescription>
                Breakdown of leads by pest activity level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={leadQualityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {leadQualityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        High Activity Leads
                      </span>
                      <Badge variant="destructive">
                        {metrics.leadQuality.highActivity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Urgent pest problems requiring immediate attention
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Medium Activity Leads
                      </span>
                      <Badge variant="secondary">
                        {metrics.leadQuality.mediumActivity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Moderate pest issues with regular activity
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Low Activity Leads
                      </span>
                      <Badge variant="default">
                        {metrics.leadQuality.lowActivity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Minor pest sightings or preventive inquiries
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
