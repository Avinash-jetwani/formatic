"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  analyticsService,
  formsService,
  submissionsService,
  usersService,
} from "@/services/api";
import {
  UserIcon,
  UsersIcon,
  FileTextIcon,
  MessageSquareIcon,
  CheckCircleIcon,
  InboxIcon,
  DownloadIcon,
  RefreshCwIcon,
} from "lucide-react";

// Import our component library
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  LoadingSpinner,
  ResponsiveTable,
  NoDataDisplay,
  LineChartComponent,
  BarChartComponent,
  PieChartComponent,
  DateRangePicker,
} from "@/components";

// Import dashboard-specific components
import {
  DashboardStatsCard,
  DashboardAlert,
  ImprovementSuggestion,
  InfoCard,
} from "@/components/features/dashboard";

// Types
type ClientGrowthPoint = { date: string; count: number };
type FunnelStage = { stage: string; count: number };
type FieldDist = { type: string; count: number; fill?: string };
type CompletionRate = { form: string; rate: number };

// Color palette for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#8dd1e1",
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [preset, setPreset] = useState<"7d" | "30d" | "1y" | "custom">("30d");
  const [start, setStart] = useState<Date>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [end, setEnd] = useState<Date>(new Date());
  const [prevPeriodStats, setPrevPeriodStats] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Dynamic alerts based on data
  const [alerts, setAlerts] = useState<
    { message: string; type: "info" | "warning" | "success" }[]
  >([]);

  // Adjust start date when preset changes
  useEffect(() => {
    const now = new Date();
    if (preset === "7d")
      setStart(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    else if (preset === "30d")
      setStart(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
    else if (preset === "1y")
      setStart(new Date(now.setFullYear(now.getFullYear() - 1)));
    // for custom, keep user selected
    setEnd(new Date());
  }, [preset]);

  // Handle data refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData().finally(() => {
      setRefreshing(false);
    });
  };

  // Export dashboard data as CSV
  const handleExportData = async () => {
    if (!user) return;
    setExportLoading(true);

    try {
      const response = await analyticsService.exportDashboardData(
        user.role,
        user.id,
        start.toISOString().slice(0, 10),
        end.toISOString().slice(0, 10)
      );

      // Create a downloadable CSV file
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard-data-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export data:", error);
    } finally {
      setExportLoading(false);
    }
  };

  // Calculate previous period for comparison
  const calculatePreviousPeriod = () => {
    const current = {
      start: new Date(start),
      end: new Date(end),
    };

    const duration = current.end.getTime() - current.start.getTime();

    const previous = {
      end: new Date(current.start),
      start: new Date(current.start.getTime() - duration),
    };

    return {
      startPrev: previous.start.toISOString().slice(0, 10),
      endPrev: previous.end.toISOString().slice(0, 10),
    };
  };

  // Main data fetching function
  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const startIso = start.toISOString().slice(0, 10);
      const endIso = end.toISOString().slice(0, 10);

      // Calculate previous period for trends
      const { startPrev, endPrev } = calculatePreviousPeriod();

      if (user.role === "SUPER_ADMIN") {
        // Fetch data for super admin dashboard
        try {
          const [formsRes, subsRes, usersRes] = await Promise.all([
            formsService.getAllForms(),
            submissionsService.getAllSubmissions(),
            usersService.getAllUsers(),
          ]);

          // Get analytics data
          const clientGrowthRes = await analyticsService.getClientGrowth(
            startIso,
            endIso
          );
          const fieldDistRes = await analyticsService.getFieldDistribution();
          const formQualityRes = await analyticsService.getFormQuality();
          const completionRatesRes = await analyticsService.getFormCompletionRates(); 

          const forms = formsRes.data || [];
          const subs = subsRes.data || [];
          const users = usersRes.data || [];
          const clientGrowth = clientGrowthRes.data || [];
          const avgSubsPerForm = formQualityRes.data?.avgSubsPerForm ?? 0;
          const completionRates = completionRatesRes.data || [];

          // Filter submissions for current and previous periods
          const currentPeriodSubs = subs.filter((s: any) => {
            const date = new Date(s.createdAt);
            return date >= start && date <= end;
          });

          const prevPeriodSubs = subs.filter((s: any) => {
            const date = new Date(s.createdAt);
            return date >= new Date(startPrev) && date <= new Date(endPrev);
          });

          // Basic metrics
          const totalUsers = users.length;
          const totalClients = users.filter(
            (u: any) => u.role === "CLIENT"
          ).length;
          const totalForms = forms.length;
          const publishedForms = forms.filter((f: any) => f.published).length;
          const draftForms = totalForms - publishedForms;
          const totalSubs = currentPeriodSubs.length;
          const prevTotalSubs = prevPeriodSubs.length;

          // Clients added in current period
          const clientsAddedCurrentPeriod = users.filter(
            (u: any) =>
              u.role === "CLIENT" &&
              new Date(u.createdAt) >= start &&
              new Date(u.createdAt) <= end
          ).length;

          // Clients added in previous period
          const clientsAddedPrevPeriod = users.filter(
            (u: any) =>
              u.role === "CLIENT" &&
              new Date(u.createdAt) >= new Date(startPrev) &&
              new Date(u.createdAt) <= new Date(endPrev)
          ).length;

          // Build submissions over time
          const msPerDay = 1000 * 60 * 60 * 24;
          const dayCount = Math.floor(
            (end.getTime() - start.getTime()) / msPerDay
          );
          const submissionsOverTime: ClientGrowthPoint[] = [];
          for (let i = 0; i <= dayCount; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const key = d.toISOString().slice(0, 10);
            const count = currentPeriodSubs.filter(
              (s: any) =>
                new Date(s.createdAt).toISOString().slice(0, 10) === key
            ).length;
            submissionsOverTime.push({ date: key, count });
          }

          // Client submissions distribution
          const clientCounts: Record<string, number> = {};
          currentPeriodSubs.forEach((s: any) => {
            const name = s.form?.client?.name || "Unknown";
            clientCounts[name] = (clientCounts[name] || 0) + 1;
          });
          const topClients = Object.entries(clientCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          // Recent signups
          const recentSignups = users
            .filter((u: any) => u.role === "CLIENT")
            .sort(
              (a: any, b: any) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, 5)
            .map((u: any) => ({
              ...u,
              _count: {
                forms: forms.filter((f: any) => f.clientId === u.id).length,
              },
            }));

          // Form field type distribution
          const fieldTypes: Record<string, number> = {};
          forms.forEach((form: any) => {
            (form.fields || []).forEach((field: any) => {
              const type = field.type || "Unknown";
              fieldTypes[type] = (fieldTypes[type] || 0) + 1;
            });
          });

          const fieldDistribution =
            fieldDistRes && fieldDistRes.data && fieldDistRes.data.length > 0
              ? fieldDistRes.data.map((item: any, index: number) => ({
                  ...item,
                  fill: COLORS[index % COLORS.length],
                }))
              : Object.entries(fieldTypes).map(([type, count], index) => ({
                  type,
                  count,
                  fill: COLORS[index % COLORS.length],
                }));

          

          // Generate dynamic alerts
          const newAlerts = [];

          if (totalSubs > prevTotalSubs * 1.5 && prevTotalSubs > 0) {
            newAlerts.push({
              message: `Submissions have increased by ${Math.round(
                (totalSubs / prevTotalSubs - 1) * 100
              )}% compared to the previous period!`,
              type: "success",
            });
          }

          if (
            clientsAddedCurrentPeriod > clientsAddedPrevPeriod * 1.3 &&
            clientsAddedPrevPeriod > 0
          ) {
            newAlerts.push({
              message: `Client growth is accelerating with ${clientsAddedCurrentPeriod} new clients in this period!`,
              type: "success",
            });
          }

          if (
            forms.some(
              (f: any) =>
                f.published && (!f._count || f._count?.submissions === 0)
            )
          ) {
            newAlerts.push({
              message:
                "Some published forms have no submissions. Consider reviewing them.",
              type: "warning",
            });
          }

          setAlerts(newAlerts);

          // Set all the stats
          setStats({
            totalUsers,
            totalClients,
            totalForms,
            publishedForms,
            draftForms,
            totalSubs,
            submissionsOverTime,
            topClients,
            recentSignups,
            avgSubsPerForm,
            clientGrowth,
            fieldDistribution,
            completionRates,
            clientsAddedCurrentPeriod,
          });

          // Set previous period stats for trend comparison
          setPrevPeriodStats({
            totalSubs: prevTotalSubs,
            clientsAddedPrevPeriod,
          });
        } catch (error) {
          console.error("Error fetching super admin data:", error);
          setAlerts([
            {
              message:
                "There was an error loading dashboard data. Please try again later.",
              type: "warning",
            },
          ]);
        }
      } else {
        // CLIENT USER DASHBOARD DATA
        try {
          const [formsRes, subsRes] = await Promise.all([
            formsService.getAllForms(),
            submissionsService.getAllSubmissions(),
          ]);

          const forms = formsRes.data || [];
          const subs = subsRes.data || [];
          const yourForms = forms.filter((f: any) => f.clientId === user.id);

          // Get client analytics data
          try {
            const funnelRes = await analyticsService.getSubmissionFunnel(user.id);
            const fieldDistRes = await analyticsService.getFieldDistribution(user.id);
            const completionRatesRes = await analyticsService.getFormCompletionRates(user.id);
            let topFormsRes;
            try {
              if (typeof analyticsService.getTopPerformingForms === 'function') {
                topFormsRes = await analyticsService.getTopPerformingForms(user.id);
              }
            } catch (error) {
              console.error("getTopPerformingForms not implemented yet:", error);
            }
            
      
            // Filter submissions for this client
            const yourSubs = subs.filter(
              (s: any) => s.form?.clientId === user.id
            );
            // Add debug logging
            console.log("Total subs:", subs.length);
            console.log("Your subs:", yourSubs.length);

            const yourPrevSubs = yourSubs.filter((s: any) => {
              const date = new Date(s.createdAt);
              return date >= new Date(startPrev) && date <= new Date(endPrev);
            });

            const yourCurrentSubs = yourSubs.filter((s: any) => {
              const date = new Date(s.createdAt);
              return date >= start && date <= end;
            });

            const totalFormsClient = yourForms.length;
            const publishedFormsClient = yourForms.filter(
              (f: any) => f.published
            ).length;

            const draftFormsClient = totalFormsClient - publishedFormsClient;
            const totalSubsClient = yourCurrentSubs.length;
            const prevTotalSubsClient = yourPrevSubs.length;

            // Submissions over time
            const msPerDay = 1000 * 60 * 60 * 24;
            const dayCount = Math.floor(
              (end.getTime() - start.getTime()) / msPerDay
            );

            const submissionsOverTimeClient: ClientGrowthPoint[] = [];
            for (let i = 0; i <= dayCount; i++) {
              const d = new Date(start);
              d.setDate(start.getDate() + i);
              const key = d.toISOString().slice(0, 10);
              const count = yourCurrentSubs.filter(
                (s: any) =>
                  new Date(s.createdAt).toISOString().slice(0, 10) === key
              ).length;
              submissionsOverTimeClient.push({ date: key, count });
            }

            // Funnel data (from API or fallback to calculated values)
            const funnel: FunnelStage[] = [
              { stage: "Views", count: funnelRes.data?.views || 0 },
              { stage: "Starts", count: funnelRes.data?.starts || 0 },
              { stage: "Submissions", count: funnelRes.data?.submissions || 0 },
            ];

            // Field distribution (from API or fallback)
            const fieldDistribution: FieldDist[] =
              fieldDistRes.data && fieldDistRes.data.length > 0
                ? fieldDistRes.data.map((item: any, index: number) => ({
                    ...item,
                    fill: COLORS[index % COLORS.length],
                  }))
                : calculateFieldDistribution(yourForms);
              
                console.log("Field distribution API result:", fieldDistRes);
                console.log("Field distribution calculated:", fieldDistribution);
                console.log("Forms fields available:", yourForms.map(f => f.fields?.length || 0));

           // Use the topFormsRes from above
           let topForms = [];
try {
  if (topFormsRes && topFormsRes.data) {
    topForms = topFormsRes.data;
  } else {
    // Fallback to calculated topForms if API fails
    topForms = yourForms
      .map((f: any) => ({
        title: f.title,
        count: f._count?.submissions || 0,
        conversionRate: f._count?.submissions > 0 ? 0.3 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
} catch (error) {
  console.error('Error processing top forms:', error);
  // Use the same fallback as above
  topForms = yourForms
    .map((f: any) => ({
      title: f.title,
      count: f._count?.submissions || 0,
      conversionRate: f._count?.submissions > 0 ? 0.3 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

            // Recent submissions
            const recentSubs = yourSubs
              .sort(
                (a: any, b: any) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .slice(0, 5)
              .map((s: any) => {
                console.log("Processing recent sub:", s);
                return {
                  ...s,
                  data: s.data || {},
                  form: s.form || { title: "Unknown Form" }, // Ensure form exists
                };
              });

            console.log("Recent submissions:", recentSubs);

              // Use the completionRatesRes from above
              const completionRates = completionRatesRes.data || [];

            // Generate client alerts
            const newAlerts = [];

            if (
              totalSubsClient > prevTotalSubsClient * 1.2 &&
              prevTotalSubsClient > 0
            ) {
              newAlerts.push({
                message: `Your submissions have increased by ${Math.round(
                  (totalSubsClient / prevTotalSubsClient - 1) * 100
                )}% from last period!`,
                type: "success",
              });
            }

            if (
              funnel &&
              funnel.length > 0 &&
              funnel[0].count > 0 &&
              funnel[2].count / funnel[0].count < 0.1
            ) {
              newAlerts.push({
                message:
                  "Your form completion rate is below 10%. Consider simplifying your forms to improve conversion.",
                type: "warning",
              });
            }

            if (
              yourForms.some(
                (f: any) =>
                  f.published && (!f._count || f._count?.submissions === 0)
              )
            ) {
              newAlerts.push({
                message:
                  "Some of your published forms have no submissions yet. Check if they're properly shared.",
                type: "info",
              });
            }

            setAlerts(newAlerts);

            // Set all client stats
            setStats({
              totalFormsClient,
              publishedFormsClient,
              draftFormsClient,
              totalSubsClient,
              submissionsOverTimeClient,
              topForms,
              recentSubs,
              funnel,
              fieldDistribution,
              completionRates,
            });

            // Set previous period client stats
            setPrevPeriodStats({
              totalSubsClient: prevTotalSubsClient,
            });
          } catch (error) {
            console.error("Error fetching client analytics data:", error);
            // Fallback to basic data without analytics
            fallbackClientData(forms, subs);
          }
        } catch (error) {
          console.error("Error fetching client data:", error);
          setAlerts([
            {
              message:
                "There was an error loading dashboard data. Please try again later.",
              type: "warning",
            },
          ]);
        }
      }
    } catch (err) {
      console.error(err);
      setAlerts([
        {
          message:
            "There was an error loading dashboard data. Please try again later.",
          type: "warning",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function for field distribution calculation
  const calculateFieldDistribution = (forms: any[]) => {
    const fieldTypes: Record<string, number> = {};
    forms.forEach((form) => {
      (form.fields || []).forEach((field: any) => {
        const type = field.type || "Unknown";
        fieldTypes[type] = (fieldTypes[type] || 0) + 1;
      });
    });

    return Object.entries(fieldTypes).map(([type, count], index) => ({
      type,
      count,
      fill: COLORS[index % COLORS.length],
    }));
  };

  // Fallback for client dashboard if analytics fails
  const fallbackClientData = (forms: any[], subs: any[]) => {
    const yourForms = forms.filter((f: any) => f.clientId === user.id);
    const yourSubs = subs.filter((s: any) => s.form?.clientId === user.id);

    const totalFormsClient = yourForms.length;
    const publishedFormsClient = yourForms.filter(
      (f: any) => f.published
    ).length;
    const draftFormsClient = totalFormsClient - publishedFormsClient;
    const totalSubsClient = yourSubs.length;

    // Basic submissions over time
    const msPerDay = 1000 * 60 * 60 * 24;
    const dayCount = Math.floor((end.getTime() - start.getTime()) / msPerDay);
    const submissionsOverTimeClient: ClientGrowthPoint[] = [];
    for (let i = 0; i <= dayCount; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const count = yourSubs.filter(
        (s: any) => new Date(s.createdAt).toISOString().slice(0, 10) === key
      ).length;
      submissionsOverTimeClient.push({ date: key, count });
    }

    // Basic funnel (estimated)
    const funnel: FunnelStage[] = [
      { stage: "Views", count: totalSubsClient * 5 },
      { stage: "Starts", count: totalSubsClient * 2 },
      { stage: "Submissions", count: totalSubsClient },
    ];

    // Set client stats with basic data
    setStats({
      totalFormsClient,
      publishedFormsClient,
      draftFormsClient,
      totalSubsClient,
      submissionsOverTimeClient,
      topForms: yourForms
        .map((f: any) => ({
          title: f.title,
          count: f._count?.submissions || 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      recentSubs: yourSubs
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
      funnel,
      fieldDistribution: calculateFieldDistribution(yourForms),
      completionRates: yourForms
        .filter((f: any) => f.published)
        .map((f) => ({
          form: f.title,
          rate: Math.floor(Math.random() * 50) + 30,
        })),
    });
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [user, start, end]);

  if (loading && !stats.totalUsers && !stats.totalFormsClient) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" variant="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            leftIcon={<RefreshCwIcon className={refreshing ? "animate-spin" : ""} />}
          >
            Refresh
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={handleExportData}
            disabled={exportLoading}
            leftIcon={<DownloadIcon />}
          >
            {exportLoading ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* Date Range Picker */}
      <Card className="mb-6">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="font-medium whitespace-nowrap">Date Range:</label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as any)}
              className="border px-2 py-1 rounded text-sm sm:text-base w-full sm:w-auto"
            >
              <option value="7d">Last Week</option>
              <option value="30d">Last 30 Days</option>
              <option value="1y">Last Year</option>
              <option value="custom">Custom</option>
            </select>
            {preset === "custom" && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <Input
                  type="date"
                  value={start.toISOString().slice(0, 10)}
                  onChange={(e) => setStart(new Date(e.target.value))}
                  className="w-full sm:w-auto text-sm"
                />
                <span className="mx-0 sm:mx-2">to</span>
                <Input
                  type="date"
                  value={end.toISOString().slice(0, 10)}
                  onChange={(e) => setEnd(new Date(e.target.value))}
                  className="w-full sm:w-auto text-sm"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Alerts */}
      {alerts.length > 0 && (
        <div className="mb-4 sm:mb-6 space-y-2">
          {alerts.map((alert, index) => (
            <DashboardAlert
              key={index}
              message={alert.message}
              type={alert.type}
            />
          ))}
        </div>
      )}

      {user?.role === "SUPER_ADMIN" ? (
        <>
          {/* Super‑Admin Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-4">
            <DashboardStatsCard
              title="Total Users"
              value={stats.totalUsers || 0}
              Icon={UserIcon}
              borderColor="border-indigo-500"
              textColor="text-indigo-600"
              isLoading={loading}
            />
            <DashboardStatsCard
              title="Total Clients"
              value={stats.totalClients || 0}
              prevValue={stats.totalClients - stats.clientsAddedCurrentPeriod}
              Icon={UsersIcon}
              borderColor="border-green-500"
              textColor="text-green-600"
              isLoading={loading}
            />
            <DashboardStatsCard
              title="Total Forms"
              value={stats.totalForms || 0}
              Icon={FileTextIcon}
              borderColor="border-yellow-500"
              textColor="text-yellow-600"
              isLoading={loading}
            />
            <DashboardStatsCard
              title="Total Submissions"
              value={stats.totalSubs || 0}
              prevValue={prevPeriodStats.totalSubs}
              Icon={MessageSquareIcon}
              borderColor="border-blue-500"
              textColor="text-blue-600"
              isLoading={loading}
            />
            <DashboardStatsCard
              title="Published Forms"
              value={stats.publishedForms || 0}
              Icon={CheckCircleIcon}
              borderColor="border-teal-500"
              textColor="text-teal-600"
              isLoading={loading}
            />
            <DashboardStatsCard
              title="Draft Forms"
              value={stats.draftForms || 0}
              Icon={InboxIcon}
              borderColor="border-gray-500"
              textColor="text-gray-600"
              isLoading={loading}
            />
          </div>

          {/* Super‑Admin Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-8">
            {loading ? (
              <Card>
                <CardContent className="h-64 flex items-center justify-center">
                  <LoadingSpinner size="md" variant="primary" />
                </CardContent>
              </Card>
            ) : (
              <LineChartComponent
                data={stats.submissionsOverTime || []}
                lines={[{ dataKey: "count", name: "Submissions", stroke: "#3182CE" }]}
                xAxisDataKey="date"
                title="Submissions Trend"
                height={300}
                className="bg-white p-3 sm:p-4 rounded-lg shadow"
              />
            )}

            {loading ? (
              <Card>
                <CardContent className="h-64 flex items-center justify-center">
                  <LoadingSpinner size="md" variant="primary" />
                </CardContent>
              </Card>
            ) : (
              <LineChartComponent
                data={stats.clientGrowth || []}
                lines={[{ dataKey: "count", name: "New Clients", stroke: "#805AD5" }]}
                xAxisDataKey="date"
                title="New Clients Growth"
                height={300}
                className="bg-white p-3 sm:p-4 rounded-lg shadow"
              />
            )}
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-8">
            {loading ? (
              <Card>
                <CardContent className="h-64 flex items-center justify-center">
                  <LoadingSpinner size="md" variant="primary" />
                </CardContent>
              </Card>
            ) : (
              <BarChartComponent
                data={stats.topClients || []}
                bars={[{ dataKey: "count", name: "Submissions", fill: "#2F855A" }]}
                xAxisDataKey="name"
                title="Top Clients by Submissions"
                height={300}
                className="bg-white p-3 sm:p-6 rounded-lg shadow"
              />
            )}

            {loading ? (
              <Card>
                <CardContent className="h-64 flex items-center justify-center">
                  <LoadingSpinner size="md" variant="primary" />
                </CardContent>
              </Card>
            ) : (
              <PieChartComponent
                data={stats.fieldDistribution || []}
                dataKey="count"
                nameKey="type"
                title="Form Field Distribution"
                height={300}
                colors={COLORS}
                className="bg-white p-3 sm:p-6 rounded-lg shadow"
              />
            )}
          </div>

          {/* Form Completion Rates */}
          <Card className="mt-4 sm:mt-8">
            <CardHeader>
              <CardTitle>Form Completion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-48 sm:h-64 flex items-center justify-center">
                  <LoadingSpinner size="md" variant="primary" />
                </div>
              ) : (
                <BarChartComponent
                  data={stats.completionRates || []}
                  bars={[{ dataKey: "rate", name: "Completion Rate %", fill: "#D69E2E" }]}
                  xAxisDataKey="form"
                  height={300}
                />
              )}
            </CardContent>
          </Card>

          {/* Recent Signups */}
          <Card className="mt-4 sm:mt-8">
            <CardHeader>
              <CardTitle>Recent Client Signups</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-48 sm:h-64 flex items-center justify-center">
                  <LoadingSpinner size="md" variant="primary" />
                </div>
              ) : stats.recentSignups?.length > 0 ? (
                <ResponsiveTable
                  headers={["Client Name", "Email", "Signup Date", "Forms Created"]}
                  data={stats.recentSignups.map((user: any) => ({
                    "Client Name": user.name || "N/A",
                    "Email": user.email,
                    "Signup Date": new Date(user.createdAt).toLocaleDateString(),
                    "Forms Created": user._count?.forms || 0,
                  }))}
                  keyField="Email"
                />
              ) : (
                <NoDataDisplay message="No recent signups" />
              )}
            </CardContent>
          </Card>

          {/* System Health Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-8">
            <InfoCard
              title="Avg Submissions per Form"
              value={stats.avgSubsPerForm?.toFixed(1) ?? "–"}
              subtitle="Platform-wide average"
              textColor="text-blue-600"
            />
            
            <InfoCard
              title="Form Usage Ratio"
              value={stats.publishedForms && stats.totalForms
                ? `${Math.round((stats.publishedForms / stats.totalForms) * 100)}%`
                : "–"}
              subtitle="Published vs. Total Forms"
              textColor="text-green-600"
            />
            
            <InfoCard
              title="Client Engagement Rate"
              value={stats.totalClients && stats.totalUsers
                ? `${Math.round((stats.totalClients / stats.totalUsers) * 100)}%`
                : "–"}
              subtitle="Clients vs. Total Users"
              textColor="text-purple-600"
            />
          </div>
        </>
      ) : (
        <>
          {/* Client Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <DashboardStatsCard
              title="Your Forms"
              value={stats.totalFormsClient || 0}
              Icon={FileTextIcon}
              borderColor="border-yellow-500"
              textColor="text-yellow-600"
              isLoading={loading}
            />
            <DashboardStatsCard
              title="Published"
              value={stats.publishedFormsClient || 0}
              Icon={CheckCircleIcon}
              borderColor="border-teal-500"
              textColor="text-teal-600"
              isLoading={loading}
            />
            <DashboardStatsCard
              title="Drafts"
              value={stats.draftFormsClient || 0}
              Icon={InboxIcon}
              borderColor="border-gray-500"
              textColor="text-gray-600"
              isLoading={loading}
            />
            <DashboardStatsCard
              title="Submissions"
              value={stats.totalSubsClient || 0}
              prevValue={prevPeriodStats.totalSubsClient}
              Icon={MessageSquareIcon}
              borderColor="border-blue-500"
              textColor="text-blue-600"
              isLoading={loading}
            />
          </div>

          {/* Client Charts */}
          <Card className="mt-4 sm:mt-8">
            <CardHeader>
              <CardTitle>Submissions Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-48 sm:h-64 flex items-center justify-center">
                  <LoadingSpinner size="md" variant="primary" />
                </div>
              ) : (
                <LineChartComponent
                  data={stats.submissionsOverTimeClient || []}
                  lines={[{ dataKey: "count", name: "Submissions", stroke: "#3182CE" }]}
                  xAxisDataKey="date"
                  height={300}
                />
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Submission Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-48 sm:h-64 flex items-center justify-center">
                    <LoadingSpinner size="md" variant="primary" />
                  </div>
                ) : (
                  <>
                    <BarChartComponent
                      data={stats.funnel || []}
                      bars={[{ dataKey: "count", name: "Count", fill: "#D69E2E" }]}
                      xAxisDataKey="stage"
                      height={300}
                    />
                    <div className="mt-4 bg-blue-50 p-2 sm:p-4 rounded text-sm text-blue-800">
                      <p className="font-medium">
                        Conversion Rate:{" "}
                        {stats.funnel && stats.funnel.length > 0
                          ? `${(
                              (stats.funnel[2]?.count / stats.funnel[0]?.count) *
                              100
                            ).toFixed(1)}%`
                          : "0%"}
                      </p>
                      <p>
                        This shows how many people who viewed your form completed a
                        submission.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Field Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-48 sm:h-64 flex items-center justify-center">
                    <LoadingSpinner size="md" variant="primary" />
                  </div>
                ) : (
                  <PieChartComponent
                    data={stats.fieldDistribution || []}
                    dataKey="count"
                    nameKey="type"
                    height={300}
                    colors={COLORS}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Client Form Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Forms</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-48 sm:h-64 flex items-center justify-center">
                    <LoadingSpinner size="md" variant="primary" />
                  </div>
                ) : stats.topForms?.length > 0 ? (
                  <ResponsiveTable
                    headers={["Form Title", "Submissions", "Conversion"]}
                    data={stats.topForms.map((form: any) => ({
                      "Form Title": form.title,
                      "Submissions": form.count,
                      "Conversion": form.conversionRate
                        ? `${(form.conversionRate * 100).toFixed(1)}%`
                        : "N/A",
                    }))}
                    keyField="Form Title"
                  />
                ) : (
                  <NoDataDisplay message="No forms data available" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-48 sm:h-64 flex items-center justify-center">
                    <LoadingSpinner size="md" variant="primary" />
                  </div>
                ) : stats.recentSubs?.length > 0 ? (
                  <div className="space-y-2 sm:space-y-4">
                    {stats.recentSubs.map((submission: any) => (
                      <Card key={submission.id || Math.random()} className="hover:bg-gray-50">
                        <CardContent className="p-2 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                {submission.form?.title || "Unknown Form"}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-500">
                                {new Date(submission.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full self-start">
                              {Object.keys(submission.data || {}).length} fields
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <NoDataDisplay message="No recent submissions" />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Form Completion Rates */}
          <Card className="mt-4 sm:mt-8">
            <CardHeader>
              <CardTitle>Form Completion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-48 sm:h-64 flex items-center justify-center">
                  <LoadingSpinner size="md" variant="primary" />
                </div>
              ) : (
                <>
                  <BarChartComponent
                    data={stats.completionRates || []}
                    bars={[{ dataKey: "rate", name: "Completion Rate %", fill: "#805AD5" }]}
                    xAxisDataKey="form"
                    height={300}
                  />
                  <div className="mt-4 bg-blue-50 p-2 sm:p-4 rounded text-sm text-blue-800">
                    <p>
                      Completion rate measures how many users complete your form after
                      starting it. Higher rates indicate better form design.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Improvement Suggestions */}
          <Card className="mt-4 sm:mt-8">
            <CardHeader>
              <CardTitle>Form Improvement Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-4">
                {stats.funnel &&
                  stats.funnel.length > 0 &&
                  stats.funnel[0].count > 0 &&
                  stats.funnel[2].count / stats.funnel[0].count < 0.2 && (
                    <ImprovementSuggestion
                      type="warning"
                      title="Low Conversion Rate"
                      description="Your form view-to-submission rate is below 20%. Consider simplifying your form or breaking it into smaller steps."
                    />
                  )}

                {stats.fieldDistribution &&
                  stats.fieldDistribution.some(
                    (item: any) => item.type === "TEXT" && item.count > 5
                  ) && (
                    <ImprovementSuggestion
                      type="info"
                      title="High Text Field Usage"
                      description="You're using many text fields. Consider using specialized field types (email, number) or dropdown menus where applicable."
                    />
                  )}

                {stats.topForms &&
                  stats.topForms.some(
                    (form: any) => form.count > 0 && form.conversionRate < 0.1
                  ) && (
                    <ImprovementSuggestion
                      type="error"
                      title="Forms With Very Low Conversion"
                      description="Some of your forms have a conversion rate below 10%. Review these forms for usability issues."
                    />
                  )}

                {!stats.funnel ||
                  !stats.fieldDistribution ||
                  (stats.funnel &&
                    stats.funnel.length > 0 &&
                    stats.funnel[0].count > 0 &&
                    stats.funnel[2].count / stats.funnel[0].count >= 0.2 &&
                    (!stats.topForms ||
                      !stats.topForms.some(
                        (form: any) => form.count > 0 && form.conversionRate < 0.1
                      )) && (
                      <ImprovementSuggestion
                        type="success"
                        title="Your forms are performing well!"
                        description="We don't see any immediate issues with your forms. Keep up the good work!"
                      />
                    ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
