// src/app/(dashboard)/dashboard/page.tsx
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
} from 'recharts';

type ClientGrowthPoint = { date: string; count: number };
type FunnelStage = { stage: string; count: number };
type FieldDist = { type: string; count: number };

// Reusable stats card
function StatsCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="border rounded-lg p-4 text-center bg-white shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-blue-600">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [preset, setPreset] = useState<'7d' | '30d' | '1y' | 'custom'>('30d');
  const [start, setStart] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [end, setEnd] = useState<Date>(new Date());

  // Adjust start date when preset changes
  useEffect(() => {
    const now = new Date();
    if (preset === '7d') setStart(new Date(now.setDate(now.getDate() - 7)));
    else if (preset === '30d') setStart(new Date(now.setDate(now.getDate() - 30)));
    else if (preset === '1y') setStart(new Date(now.setFullYear(now.getFullYear() - 1)));
    // if 'custom', leave start as selected
    setEnd(new Date());
  }, [preset]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    (async () => {
      try {
        const startIso = start.toISOString().slice(0, 10);
        const endIso = end.toISOString().slice(0, 10);

        if (user.role === 'SUPER_ADMIN') {
          const [
            formsRes,
            subsRes,
            usersRes,
            growthRes,
            qualityRes,
          ] = await Promise.all([
            formsService.getAllForms(),
            submissionsService.getAllSubmissions(),
            usersService.getAllUsers(),
            analyticsService.getClientGrowth(startIso, endIso),
            analyticsService.getFormQuality(),
          ]);

          const forms = formsRes.data || [];
          const subs = subsRes.data || [];
          const users = usersRes.data || [];
          const clientGrowth = growthRes.data || [];
          const avgSubsPerForm = qualityRes.data?.avgSubsPerForm ?? 0;

          const totalUsers = users.length;
          const totalClients = users.filter((u: any) => u.role === 'CLIENT').length;
          const totalForms = forms.length;
          const publishedForms = forms.filter((f: any) => f.published).length;
          const draftForms = totalForms - publishedForms;
          const totalSubs = subs.length;

          // build submissionsOverTime from start to end
          const msPerDay = 1000 * 60 * 60 * 24;
          const dayCount = Math.floor((end.getTime() - start.getTime()) / msPerDay);
          const submissionsOverTime: ClientGrowthPoint[] = [];
          for (let i = 0; i <= dayCount; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const key = d.toISOString().slice(0, 10);
            const count = subs.filter((s: any) => s.createdAt.startsWith(key)).length;
            submissionsOverTime.push({ date: key, count });
          }

          // top clients
          const clientCounts: Record<string, number> = {};
          subs.forEach((s: any) => {
            const name = s.form?.client?.name || 'Unknown';
            clientCounts[name] = (clientCounts[name] || 0) + 1;
          });
          const topClients = Object.entries(clientCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          // recent signups
          const recentSignups = users
            .sort(
              (a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .slice(0, 5);

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
          });
        } else {
          const [formsRes, subsRes, funnelRes, fieldDistRes] = await Promise.all([
            formsService.getAllForms(),
            submissionsService.getAllSubmissions(),
            analyticsService.getSubmissionFunnel(user.id),
            analyticsService.getFieldDistribution(user.id),
          ]);

          const forms = formsRes.data || [];
          const subs = subsRes.data || [];
          const yourForms = forms.filter((f: any) => f.clientId === user.id);
          const yourSubs = subs.filter((s: any) => s.form?.clientId === user.id);

          const totalFormsClient = yourForms.length;
          const publishedFormsClient = yourForms.filter((f) => f.published).length;
          const draftFormsClient = totalFormsClient - publishedFormsClient;
          const totalSubsClient = yourSubs.length;

          // submissions over time for client
          const msPerDay = 1000 * 60 * 60 * 24;
          const dayCount = Math.floor((end.getTime() - start.getTime()) / msPerDay);
          const submissionsOverTimeClient: ClientGrowthPoint[] = [];
          for (let i = 0; i <= dayCount; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const key = d.toISOString().slice(0, 10);
            const count = yourSubs.filter((s: any) =>
              s.createdAt.startsWith(key)
            ).length;
            submissionsOverTimeClient.push({ date: key, count });
          }

          const topForms = yourForms
            .map((f: any) => ({
              title: f.title,
              count: f._count?.submissions || 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          const recentSubs = yourSubs
            .sort(
              (a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .slice(0, 5);

          const funnel: FunnelStage[] = funnelRes.data
            ? [
                { stage: 'Views', count: funnelRes.data.views },
                { stage: 'Starts', count: funnelRes.data.starts },
                { stage: 'Submissions', count: funnelRes.data.submissions },
              ]
            : [];

          const fieldDistribution: FieldDist[] = fieldDistRes.data || [];

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
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, start, end]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {user.role === 'SUPER_ADMIN' ? (
        <>
          {/* Super‑Admin Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            <StatsCard title="Total Users" value={stats.totalUsers!} />
            <StatsCard title="Total Clients" value={stats.totalClients!} />
            <StatsCard title="Total Forms" value={stats.totalForms!} />
            <StatsCard title="Total Submissions" value={stats.totalSubs!} />
            <StatsCard title="Published Forms" value={stats.publishedForms!} />
            <StatsCard title="Draft Forms" value={stats.draftForms!} />
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center space-x-4 mb-4">
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as any)}
              className="border px-2 py-1 rounded"
            >
              <option value="7d">Last Week</option>
              <option value="30d">Last 30 Days</option>
              <option value="1y">Last Year</option>
              <option value="custom">Custom</option>
            </select>
            {preset === 'custom' && (
              <>
                <input
                  type="date"
                  value={start.toISOString().slice(0, 10)}
                  onChange={(e) => setStart(new Date(e.target.value))}
                  className="border px-2 py-1 rounded"
                />
                <span>to</span>
                <input
                  type="date"
                  value={end.toISOString().slice(0, 10)}
                  onChange={(e) => setEnd(new Date(e.target.value))}
                  className="border px-2 py-1 rounded"
                />
              </>
            )}
          </div>

          {/* Super‑Admin Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">
                Submissions ({preset === 'custom' ? '' : preset === '7d' ? 'Last Week' : preset === '1y' ? 'Last Year' : 'Last 30 Days'})
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats.submissionsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3182CE" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">
                New Clients ({preset})
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats.clientGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#805AD5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h2 className="text-lg font-semibold mb-2">
                Avg Submissions per Form
              </h2>
              <p className="text-4xl font-bold text-blue-600">
                {stats.avgSubsPerForm !== undefined
                  ? stats.avgSubsPerForm.toFixed(1)
                  : '–'}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">
                Top Clients by Submissions
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.topClients}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2F855A" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Signups */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Recent Signups</h2>
            <ul className="divide-y">
              {stats.recentSignups!.map((u: any) => (
                <li key={u.id} className="py-2 flex justify-between">
                  <span>{u.name || u.email}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <>
          {/* Client Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard title="Your Forms" value={stats.totalFormsClient!} />
            <StatsCard title="Published" value={stats.publishedFormsClient!} />
            <StatsCard title="Drafts" value={stats.draftFormsClient!} />
            <StatsCard title="Submissions" value={stats.totalSubsClient!} />
          </div>

          {/* Date Range Picker (client) */}
          <div className="flex items-center space-x-4 mb-4">
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as any)}
              className="border px-2 py-1 rounded"
            >
              <option value="7d">Last Week</option>
              <option value="30d">Last 30 Days</option>
              <option value="1y">Last Year</option>
              <option value="custom">Custom</option>
            </select>
            {preset === 'custom' && (
              <>
                <input
                  type="date"
                  value={start.toISOString().slice(0, 10)}
                  onChange={(e) => setStart(new Date(e.target.value))}
                  className="border px-2 py-1 rounded"
                />
                <span>to</span>
                <input
                  type="date"
                  value={end.toISOString().slice(0, 10)}
                  onChange={(e) => setEnd(new Date(e.target.value))}
                  className="border px-2 py-1 rounded"
                />
              </>
            )}
          </div>

          {/* Client Charts */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">
              Submissions ({preset})
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.submissionsOverTimeClient}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3182CE" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">
                Funnel (Views → Starts → Submissions)
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.funnel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#D69E2E" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">
                Field Type Distribution
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.fieldDistribution!}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  />
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Top Forms</h2>
              <ul className="divide-y">
                {stats.topForms!.map((f: any) => (
                  <li key={f.title} className="py-2 flex justify-between">
                    <span>{f.title}</span>
                    <span>{f.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">
                Recent Submissions
              </h2>
              <ul className="divide-y">
                {stats.recentSubs!.map((s: any) => (
                  <li key={s.id} className="py-2">
                    <p className="font-semibold">
                      {s.form?.title || 'Unknown Form'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(s.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}