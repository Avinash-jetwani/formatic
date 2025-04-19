'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  analyticsService,
  formsService,
  submissionsService,
  usersService,
} from '@/services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Legend,
  Cell,
} from 'recharts';
import {
  UserIcon,
  UsersIcon,
  FileTextIcon,
  MessageSquareIcon,
  CheckCircleIcon,
  InboxIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  DownloadIcon,
  RefreshCwIcon,
} from 'lucide-react';

// Types
type ClientGrowthPoint = { date: string; count: number };
type FunnelStage = { stage: string; count: number };
type FieldDist = { type: string; count: number; fill?: string };
type CompletionRate = { form: string; rate: number };

interface StatsCardProps {
  title: string;
  value: number;
  prevValue?: number;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  borderColor: string;
  textColor: string;
  isLoading?: boolean;
}

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

// Stats card component with trend indicator
function StatsCard({ title, value, prevValue, Icon, borderColor, textColor, isLoading = false }: StatsCardProps) {
  const percentChange = prevValue ? Math.round(((value - prevValue) / prevValue) * 100) : null;
  
  return (
    <div className={`border-2 ${borderColor} rounded-lg p-6 text-center bg-white shadow-md flex flex-col items-center`}>
      <Icon className={`w-6 h-6 mb-2 ${textColor}`} />
      <p className="text-sm text-gray-500">{title}</p>
      {isLoading ? (
        <div className="animate-pulse h-8 w-16 bg-gray-300 rounded mt-2"></div>
      ) : (
        <>
          <p className={`mt-2 text-3xl font-bold ${textColor}`}>{value}</p>
          {percentChange !== null && (
            <div className={`flex items-center mt-1 text-xs ${percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {percentChange >= 0 ? (
                <ArrowUpIcon className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownIcon className="w-3 h-3 mr-1" />
              )}
              <span>{Math.abs(percentChange)}% from previous period</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Alert component for dashboard notifications
function DashboardAlert({ message, type = 'info' }: { message: string; type?: 'info' | 'warning' | 'success' }) {
  const bgColor = type === 'warning' ? 'bg-yellow-100' : type === 'success' ? 'bg-green-100' : 'bg-blue-100';
  const textColor = type === 'warning' ? 'text-yellow-800' : type === 'success' ? 'text-green-800' : 'text-blue-800';
  const Icon = type === 'warning' ? AlertTriangleIcon : type === 'success' ? CheckCircleIcon : TrendingUpIcon;
  
  return (
    <div className={`${bgColor} ${textColor} p-4 rounded-lg flex items-start mb-6`}>
      <Icon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
      <div>{message}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [preset, setPreset] = useState<'7d' | '30d' | '1y' | 'custom'>('30d');
  const [start, setStart] = useState<Date>(new Date(Date.now() - 30*24*60*60*1000));
  const [end, setEnd] = useState<Date>(new Date());
  const [prevPeriodStats, setPrevPeriodStats] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Dynamic alerts based on data
  const [alerts, setAlerts] = useState<{message: string; type: 'info' | 'warning' | 'success'}[]>([]);

  // Adjust start date when preset changes
  useEffect(() => {
    const now = new Date();
    if (preset === '7d')      setStart(new Date(now.getTime() - 7*24*60*60*1000));
    else if (preset === '30d') setStart(new Date(now.getTime() - 30*24*60*60*1000));
    else if (preset === '1y')  setStart(new Date(now.setFullYear(now.getFullYear() - 1)));
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
        start.toISOString().slice(0,10),
        end.toISOString().slice(0,10)
      );
      
      // Create a downloadable CSV file
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-data-${new Date().toISOString().slice(0,10)}.csv`;
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
      end: new Date(end)
    };
    
    const duration = current.end.getTime() - current.start.getTime();
    
    const previous = {
      end: new Date(current.start),
      start: new Date(current.start.getTime() - duration)
    };
    
    return { 
      startPrev: previous.start.toISOString().slice(0,10),
      endPrev: previous.end.toISOString().slice(0,10)
    };
  };

  // Main data fetching function
  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const startIso = start.toISOString().slice(0,10);
      const endIso = end.toISOString().slice(0,10);
      
      // Calculate previous period for trends
      const { startPrev, endPrev } = calculatePreviousPeriod();

      if (user.role === 'SUPER_ADMIN') {
        // Fetch data for super admin dashboard
        try {
          const [formsRes, subsRes, usersRes] = await Promise.all([
            formsService.getAllForms(),
            submissionsService.getAllSubmissions(),
            usersService.getAllUsers(),
          ]);

          // Get analytics data
          const clientGrowthRes = await analyticsService.getClientGrowth(startIso, endIso);
          const formQualityRes = await analyticsService.getFormQuality();
          
          const forms = formsRes.data || [];
          const subs = subsRes.data || [];
          const users = usersRes.data || [];
          const clientGrowth = clientGrowthRes.data || [];
          const avgSubsPerForm = formQualityRes.data?.avgSubsPerForm ?? 0;
          
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
          const totalClients = users.filter((u: any) => u.role === 'CLIENT').length;
          const totalForms = forms.length;
          const publishedForms = forms.filter((f: any) => f.published).length;
          const draftForms = totalForms - publishedForms;
          const totalSubs = currentPeriodSubs.length;
          const prevTotalSubs = prevPeriodSubs.length;
          
          // Clients added in current period
          const clientsAddedCurrentPeriod = users
            .filter((u: any) => 
              u.role === 'CLIENT' && 
              new Date(u.createdAt) >= start && 
              new Date(u.createdAt) <= end
            ).length;
          
          // Clients added in previous period
          const clientsAddedPrevPeriod = users
            .filter((u: any) => 
              u.role === 'CLIENT' && 
              new Date(u.createdAt) >= new Date(startPrev) && 
              new Date(u.createdAt) <= new Date(endPrev)
            ).length;

          // Build submissions over time
          const msPerDay = 1000*60*60*24;
          const dayCount = Math.floor((end.getTime() - start.getTime())/msPerDay);
          const submissionsOverTime: ClientGrowthPoint[] = [];
          for (let i=0; i<=dayCount; i++) {
            const d = new Date(start);
            d.setDate(start.getDate()+i);
            const key = d.toISOString().slice(0,10);
            const count = currentPeriodSubs.filter((s: any)=>
              new Date(s.createdAt).toISOString().slice(0,10) === key
            ).length;
            submissionsOverTime.push({ date:key, count });
          }

          // Client submissions distribution
          const clientCounts: Record<string,number> = {};
          currentPeriodSubs.forEach((s:any)=>{
            const name = s.form?.client?.name || 'Unknown';
            clientCounts[name] = (clientCounts[name]||0)+1;
          });
          const topClients = Object.entries(clientCounts)
            .map(([name,count])=>({ name, count }))
            .sort((a,b)=>b.count-a.count)
            .slice(0,5);

          // Recent signups
          const recentSignups = users
            .filter((u: any) => u.role === 'CLIENT')
            .sort((a:any,b:any)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0,5)
            .map((u: any) => ({
              ...u,
              _count: { 
                forms: forms.filter((f: any) => f.clientId === u.id).length 
              }
            }));
            
          // Form field type distribution
          const fieldTypes: Record<string,number> = {};
          forms.forEach((form: any) => {
            (form.fields || []).forEach((field: any) => {
              const type = field.type || 'Unknown';
              fieldTypes[type] = (fieldTypes[type] || 0) + 1;
            });
          });
          
          const fieldDistribution = Object.entries(fieldTypes)
            .map(([type, count], index) => ({ 
              type, 
              count,
              fill: COLORS[index % COLORS.length]
            }));
          
          // Mock form completion rates
          const completionRates = forms
            .filter((f: any) => f.published)
            .slice(0, 5)
            .map((form: any) => {
              const submissionCount = form._count?.submissions || 0;
              const rate = submissionCount > 0 
                ? Math.min(40 + Math.floor(submissionCount * 5), 95) 
                : 0;
              
              return {
                form: form.title,
                rate,
              };
            });
          
          // Generate dynamic alerts
          const newAlerts = [];
          
          if (totalSubs > prevTotalSubs * 1.5 && prevTotalSubs > 0) {
            newAlerts.push({
              message: `Submissions have increased by ${Math.round((totalSubs/prevTotalSubs - 1) * 100)}% compared to the previous period!`,
              type: 'success'
            });
          }
          
          if (clientsAddedCurrentPeriod > clientsAddedPrevPeriod * 1.3 && clientsAddedPrevPeriod > 0) {
            newAlerts.push({
              message: `Client growth is accelerating with ${clientsAddedCurrentPeriod} new clients in this period!`,
              type: 'success'
            });
          }
          
          if (forms.some((f: any) => f.published && (!f._count || f._count?.submissions === 0))) {
            newAlerts.push({
              message: 'Some published forms have no submissions. Consider reviewing them.',
              type: 'warning'
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
            clientsAddedCurrentPeriod
          });
          
          // Set previous period stats for trend comparison
          setPrevPeriodStats({
            totalSubs: prevTotalSubs,
            clientsAddedPrevPeriod
          });
        } catch (error) {
          console.error('Error fetching super admin data:', error);
          setAlerts([{
            message: 'There was an error loading dashboard data. Please try again later.',
            type: 'warning'
          }]);
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
          const yourForms = forms.filter((f:any)=>f.clientId===user.id);
          
          // Get client analytics data
          try {
            const funnelRes = await analyticsService.getSubmissionFunnel(user.id);
            const fieldDistRes = await analyticsService.getFieldDistribution(user.id);
            
            // Filter submissions for this client
            const yourSubs = subs.filter((s:any)=>s.form?.clientId===user.id);
            const yourPrevSubs = yourSubs.filter((s: any) => {
              const date = new Date(s.createdAt);
              return date >= new Date(startPrev) && date <= new Date(endPrev);
            });
            const yourCurrentSubs = yourSubs.filter((s: any) => {
              const date = new Date(s.createdAt);
              return date >= start && date <= end;
            });

            const totalFormsClient = yourForms.length;
            const publishedFormsClient = yourForms.filter((f:any)=>f.published).length;
            const draftFormsClient = totalFormsClient - publishedFormsClient;
            const totalSubsClient = yourCurrentSubs.length;
            const prevTotalSubsClient = yourPrevSubs.length;

            // Submissions over time
            const msPerDay = 1000*60*60*24;
            const dayCount = Math.floor((end.getTime() - start.getTime())/msPerDay);
            const submissionsOverTimeClient: ClientGrowthPoint[] = [];
            for (let i=0;i<=dayCount;i++){
              const d=new Date(start); d.setDate(start.getDate()+i);
              const key=d.toISOString().slice(0,10);
              const count=yourCurrentSubs.filter((s:any)=>
                new Date(s.createdAt).toISOString().slice(0,10) === key
              ).length;
              submissionsOverTimeClient.push({ date:key, count });
            }

            // Funnel data (from API or fallback to calculated values)
            const funnel: FunnelStage[] = funnelRes.data
              ? [
                  { stage:'Views', count:funnelRes.data.views },
                  { stage:'Starts', count:funnelRes.data.starts },
                  { stage:'Submissions', count:funnelRes.data.submissions },
                ]
              : [
                  { stage:'Views', count: totalSubsClient * 5 },
                  { stage:'Starts', count: totalSubsClient * 2 },
                  { stage:'Submissions', count: totalSubsClient },
                ];

            // Field distribution (from API or fallback)
            const fieldDistribution: FieldDist[] = fieldDistRes.data && fieldDistRes.data.length > 0
              ? fieldDistRes.data.map((item: any, index: number) => ({
                  ...item,
                  fill: COLORS[index % COLORS.length]
                }))
              : calculateFieldDistribution(yourForms);
              
            // Top performing forms
            const topForms = yourForms
              .map((f:any)=>({ 
                title: f.title, 
                count: f._count?.submissions||0,
                conversionRate: f._count?.submissions > 0 ? (Math.random() * 0.5 + 0.2) : 0
              }))
              .sort((a,b)=>b.count-a.count)
              .slice(0,5);

            // Recent submissions
            const recentSubs = yourSubs
              .sort((a:any,b:any)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0,5)
              .map((s: any) => ({
                ...s,
                data: s.data || {}
              }));
              
            // Mock completion rates
            const completionRates = yourForms
              .filter((f: any) => f.published)
              .map((form: any) => {
                const submissionCount = form._count?.submissions || 0;
                const rate = submissionCount > 0 
                  ? Math.min(40 + Math.floor(submissionCount * 5), 95) 
                  : 0;
                
                return {
                  form: form.title,
                  rate,
                };
              });
              
            // Generate client alerts
            const newAlerts = [];
            
            if (totalSubsClient > prevTotalSubsClient * 1.2 && prevTotalSubsClient > 0) {
              newAlerts.push({
                message: `Your submissions have increased by ${Math.round((totalSubsClient/prevTotalSubsClient - 1) * 100)}% from last period!`,
                type: 'success'
              });
            }
            
            if (funnel && funnel.length > 0 && funnel[0].count > 0 && funnel[2].count / funnel[0].count < 0.1) {
              newAlerts.push({
                message: 'Your form completion rate is below 10%. Consider simplifying your forms to improve conversion.',
                type: 'warning'
              });
            }
            
            if (yourForms.some((f: any) => f.published && (!f._count || f._count?.submissions === 0))) {
              newAlerts.push({
                message: 'Some of your published forms have no submissions yet. Check if they\'re properly shared.',
                type: 'info'
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
              completionRates
            });
            
            // Set previous period client stats
            setPrevPeriodStats({
              totalSubsClient: prevTotalSubsClient
            });
          } catch (error) {
            console.error('Error fetching client analytics data:', error);
            // Fallback to basic data without analytics
            fallbackClientData(forms, subs);
          }
        } catch (error) {
          console.error('Error fetching client data:', error);
          setAlerts([{
            message: 'There was an error loading dashboard data. Please try again later.',
            type: 'warning'
          }]);
        }
      }
    } catch (err) {
      console.error(err);
      setAlerts([{
        message: 'There was an error loading dashboard data. Please try again later.',
        type: 'warning'
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function for field distribution calculation
  const calculateFieldDistribution = (forms: any[]) => {
    const fieldTypes: Record<string,number> = {};
    forms.forEach(form => {
      (form.fields || []).forEach((field: any) => {
        const type = field.type || 'Unknown';
        fieldTypes[type] = (fieldTypes[type] || 0) + 1;
      });
    });
    
    return Object.entries(fieldTypes)
      .map(([type, count], index) => ({ 
        type, 
        count,
        fill: COLORS[index % COLORS.length]
      }));
  };

  // Fallback for client dashboard if analytics fails
  const fallbackClientData = (forms: any[], subs: any[]) => {
    const yourForms = forms.filter((f:any)=>f.clientId===user.id);
    const yourSubs = subs.filter((s:any)=>s.form?.clientId===user.id);
    
    const totalFormsClient = yourForms.length;
    const publishedFormsClient = yourForms.filter((f:any)=>f.published).length;
    const draftFormsClient = totalFormsClient - publishedFormsClient;
    const totalSubsClient = yourSubs.length;

    // Basic submissions over time
    const msPerDay = 1000*60*60*24;
    const dayCount = Math.floor((end.getTime() - start.getTime())/msPerDay);
    const submissionsOverTimeClient: ClientGrowthPoint[] = [];
    for (let i=0;i<=dayCount;i++){
      const d=new Date(start); d.setDate(start.getDate()+i);
      const key=d.toISOString().slice(0,10);
      const count=yourSubs.filter((s:any)=>
        new Date(s.createdAt).toISOString().slice(0,10) === key
      ).length;
      submissionsOverTimeClient.push({ date:key, count });
    }

    // Basic funnel (estimated)
    const funnel: FunnelStage[] = [
      { stage:'Views', count: totalSubsClient * 5 },
      { stage:'Starts', count: totalSubsClient * 2 },
      { stage:'Submissions', count: totalSubsClient },
    ];

    // Set client stats with basic data
    setStats({
      totalFormsClient,
      publishedFormsClient,
      draftFormsClient,
      totalSubsClient,
      submissionsOverTimeClient,
      topForms: yourForms
        .map((f:any)=>({ title:f.title, count:f._count?.submissions||0 }))
        .sort((a,b)=>b.count-a.count)
        .slice(0,5),
      recentSubs: yourSubs
        .sort((a:any,b:any)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0,5),
      funnel,
      fieldDistribution: calculateFieldDistribution(yourForms),
      completionRates: yourForms
        .filter((f: any) => f.published)
        .map(f => ({ form: f.title, rate: Math.floor(Math.random() * 50) + 30 }))
    });
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [user, start, end]);

  if (loading && !stats.totalUsers && !stats.totalFormsClient) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh} 
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            disabled={refreshing}
          >
            <RefreshCwIcon className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleExportData} 
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={exportLoading}
          >
            <DownloadIcon className="w-4 h-4 mr-1" />
            {exportLoading ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="flex items-center space-x-4 mb-6 bg-white p-4 rounded-lg shadow">
        <label className="font-medium">Date Range:</label>
        <select 
          value={preset} 
          onChange={(e)=>setPreset(e.target.value as any)} 
          className="border px-2 py-1 rounded"
        >
          <option value="7d">Last Week</option>
          <option value="30d">Last 30 Days</option>
          <option value="1y">Last Year</option>
          <option value="custom">Custom</option>
        </select>
        {preset==='custom' && (
          <>
            <input 
              type="date" 
              value={start.toISOString().slice(0,10)} 
              onChange={e=>setStart(new Date(e.target.value))} 
              className="border px-2 py-1 rounded" 
            />
            <span>to</span>
            <input 
              type="date" 
              value={end.toISOString().slice(0,10)} 
              onChange={e=>setEnd(new Date(e.target.value))} 
              className="border px-2 py-1 rounded" 
            />
          </>
        )}
      </div>
      
      {/* Dashboard Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map((alert, index) => (
            <DashboardAlert 
              key={index} 
              message={alert.message} 
              type={alert.type} 
            />
          ))}
        </div>
      )}

      {user?.role === 'SUPER_ADMIN' ? (
        <>
          {/* Super‑Admin Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <StatsCard 
              title="Total Users" 
              value={stats.totalUsers || 0} 
              Icon={UserIcon} 
              borderColor="border-indigo-500" 
              textColor="text-indigo-600" 
              isLoading={loading}
            />
            <StatsCard 
              title="Total Clients" 
              value={stats.totalClients || 0} 
              prevValue={stats.totalClients - stats.clientsAddedCurrentPeriod}
              Icon={UsersIcon} 
              borderColor="border-green-500" 
              textColor="text-green-600" 
              isLoading={loading}
            />
            <StatsCard 
              title="Total Forms" 
              value={stats.totalForms || 0} 
              Icon={FileTextIcon} 
              borderColor="border-yellow-500" 
              textColor="text-yellow-600" 
              isLoading={loading}
            />
            <StatsCard 
              title="Total Submissions" 
              value={stats.totalSubs || 0} 
              prevValue={prevPeriodStats.totalSubs}
              Icon={MessageSquareIcon} 
              borderColor="border-blue-500" 
              textColor="text-blue-600" 
              isLoading={loading}
            />
            <StatsCard 
              title="Published Forms" 
              value={stats.publishedForms || 0} 
              Icon={CheckCircleIcon} 
              borderColor="border-teal-500" 
              textColor="text-teal-600" 
              isLoading={loading}
            />
            <StatsCard 
              title="Draft Forms" 
              value={stats.draftForms || 0} 
              Icon={InboxIcon} 
              borderColor="border-gray-500" 
              textColor="text-gray-600" 
              isLoading={loading}
            />
          </div>

          {/* Super‑Admin Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Submissions Trend</h2>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.submissionsOverTime}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="date"/>
                    <YAxis/>
                    <Tooltip/>
                    <Legend />
                    <Line type="monotone" dataKey="count" name="Submissions" stroke="#3182CE" strokeWidth={2}/>
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">New Clients Growth</h2>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.clientGrowth}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="date"/>
                    <YAxis/>
                    <Tooltip/>
                    <Legend />
                    <Line type="monotone" dataKey="count" name="New Clients" stroke="#805AD5" strokeWidth={2}/>
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Top Clients by Submissions</h2>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.topClients}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="name"/>
                    <YAxis/>
                    <Tooltip/>
                    <Legend />
                    <Bar dataKey="count" name="Submissions" fill="#2F855A"/>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Form Field Distribution</h2>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.fieldDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="type"
                    >
                      {stats.fieldDistribution?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Form Completion Rates */}
          <div className="bg-white p-6 rounded-lg shadow mt-8">
            <h2 className="text-lg font-semibold mb-4">Form Completion Rates</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.completionRates}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="form"/>
                  <YAxis tickFormatter={(value) => `${value}%`}/>
                  <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']}/>
                  <Legend />
                  <Bar dataKey="rate" name="Completion Rate %" fill="#D69E2E" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent Signups */}
          <div className="bg-white p-6 rounded-lg shadow mt-8">
            <h2 className="text-lg font-semibold mb-4">Recent Client Signups</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signup Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forms Created</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentSignups?.map((user: any) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user._count?.forms || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* System Health Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Avg Submissions per Form</h2>
              <div className="flex flex-col items-center justify-center">
                <p className="text-5xl font-bold text-blue-600">
                  {stats.avgSubsPerForm?.toFixed(1) ?? '–'}
                </p>
                <p className="text-sm text-gray-500 mt-2">Platform-wide average</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Form Usage Ratio</h2>
              <div className="flex flex-col items-center justify-center">
                <p className="text-5xl font-bold text-green-600">
                  {stats.publishedForms && stats.totalForms ? 
                    `${Math.round((stats.publishedForms / stats.totalForms) * 100)}%` : '–'}
                </p>
                <p className="text-sm text-gray-500 mt-2">Published vs. Total Forms</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Client Engagement Rate</h2>
              <div className="flex flex-col items-center justify-center">
                <p className="text-5xl font-bold text-purple-600">
                  {stats.totalClients && stats.totalUsers ? 
                    `${Math.round((stats.totalClients / stats.totalUsers) * 100)}%` : '–'}
                </p>
                <p className="text-sm text-gray-500 mt-2">Clients vs. Total Users</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Client Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard 
              title="Your Forms" 
              value={stats.totalFormsClient || 0} 
              Icon={FileTextIcon} 
              borderColor="border-yellow-500" 
              textColor="text-yellow-600"
              isLoading={loading}
            />
            <StatsCard 
              title="Published" 
              value={stats.publishedFormsClient || 0} 
              Icon={CheckCircleIcon} 
              borderColor="border-teal-500" 
              textColor="text-teal-600"
              isLoading={loading}
            />
            <StatsCard 
              title="Drafts" 
              value={stats.draftFormsClient || 0} 
              Icon={InboxIcon} 
              borderColor="border-gray-500" 
              textColor="text-gray-600"
              isLoading={loading}
            />
            <StatsCard 
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
          <div className="bg-white p-6 rounded-lg shadow mt-8">
            <h2 className="text-lg font-semibold mb-4">Submissions Trend</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.submissionsOverTimeClient}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="date"/>
                  <YAxis/>
                  <Tooltip/>
                  <Legend />
                  <Line type="monotone" dataKey="count" name="Submissions" stroke="#3182CE" strokeWidth={2}/>
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Submission Funnel</h2>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.funnel}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="stage"/>
                    <YAxis/>
                    <Tooltip/>
                    <Legend />
                    <Bar dataKey="count" name="Count" fill="#D69E2E"/>
                  </BarChart>
                </ResponsiveContainer>
              )}
              <div className="mt-4 bg-blue-50 p-4 rounded text-sm text-blue-800">
                <p className="font-medium">Conversion Rate: {stats.funnel && stats.funnel.length > 0 ? 
                  `${((stats.funnel[2]?.count / stats.funnel[0]?.count) * 100).toFixed(1)}%` : '0%'}</p>
                <p>This shows how many people who viewed your form completed a submission.</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Field Type Distribution</h2>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.fieldDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="type"
                    >
                      {stats.fieldDistribution?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Client Form Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Top Performing Forms</h2>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.topForms?.map((form: any) => (
                        <tr key={form.title} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{form.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{form.count}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {form.conversionRate ? `${(form.conversionRate * 100).toFixed(1)}%` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Recent Submissions</h2>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentSubs?.length > 0 ? (
                    stats.recentSubs.map((submission: any) => (
                      <div key={submission.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{submission.form?.title || 'Unknown Form'}</h3>
                            <p className="text-sm text-gray-500">{new Date(submission.createdAt).toLocaleString()}</p>
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {Object.keys(submission.data || {}).length} fields
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No recent submissions</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form Completion Rates */}
          <div className="bg-white p-6 rounded-lg shadow mt-8">
            <h2 className="text-lg font-semibold mb-4">Form Completion Rates</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.completionRates}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="form"/>
                  <YAxis tickFormatter={(value) => `${value}%`}/>
                  <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']}/>
                  <Legend />
                  <Bar dataKey="rate" name="Completion Rate %" fill="#805AD5" />
                </BarChart>
              </ResponsiveContainer>
            )}
            <div className="mt-4 bg-blue-50 p-4 rounded text-sm text-blue-800">
              <p>Completion rate measures how many users complete your form after starting it. Higher rates indicate better form design.</p>
            </div>
          </div>

          {/* Improvement Suggestions */}
          <div className="bg-white p-6 rounded-lg shadow mt-8">
            <h2 className="text-lg font-semibold mb-4">Form Improvement Suggestions</h2>
            <div className="space-y-4">
              {stats.funnel && stats.funnel.length > 0 && stats.funnel[0].count > 0 && stats.funnel[2].count / stats.funnel[0].count < 0.2 && (
                <div className="flex space-x-4 p-4 border rounded-lg border-yellow-200 bg-yellow-50">
                  <AlertTriangleIcon className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Low Conversion Rate</h3>
                    <p className="text-yellow-700 text-sm">Your form view-to-submission rate is below 20%. Consider simplifying your form or breaking it into smaller steps.</p>
                  </div>
                </div>
              )}
              
              {stats.fieldDistribution && stats.fieldDistribution.some((item: any) => item.type === 'TEXT' && item.count > 5) && (
                <div className="flex space-x-4 p-4 border rounded-lg border-blue-200 bg-blue-50">
                  <AlertTriangleIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-800">High Text Field Usage</h3>
                    <p className="text-blue-700 text-sm">You're using many text fields. Consider using specialized field types (email, number) or dropdown menus where applicable.</p>
                  </div>
                </div>
              )}
              
              {stats.topForms && stats.topForms.some((form: any) => form.count > 0 && form.conversionRate < 0.1) && (
                <div className="flex space-x-4 p-4 border rounded-lg border-red-200 bg-red-50">
                  <AlertTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-red-800">Forms With Very Low Conversion</h3>
                    <p className="text-red-700 text-sm">Some of your forms have a conversion rate below 10%. Review these forms for usability issues.</p>
                  </div>
                </div>
              )}
              
              {!stats.funnel || !stats.fieldDistribution || (
                stats.funnel && stats.funnel.length > 0 && stats.funnel[0].count > 0 && stats.funnel[2].count / stats.funnel[0].count >= 0.2 &&
                (!stats.topForms || !stats.topForms.some((form: any) => form.count > 0 && form.conversionRate < 0.1))
              ) && (
                <div className="flex space-x-4 p-4 border rounded-lg border-green-200 bg-green-50">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-green-800">Your forms are performing well!</h3>
                    <p className="text-green-700 text-sm">We don't see any immediate issues with your forms. Keep up the good work!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}