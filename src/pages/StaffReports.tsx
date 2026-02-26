import React from "react";
import { useComplaints } from "@/context/ComplaintContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

const StaffReports: React.FC = () => {
  const { complaints, loading } = useComplaints();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalComplaints = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === "Resolved").length;
  const inProgressCount = complaints.filter(c => c.status === "In Progress").length;
  const openCount = complaints.filter(c => c.status === "Open").length;

  const resolutionRate = totalComplaints > 0 ? ((resolvedCount / totalComplaints) * 100).toFixed(1) : "0";

  // Data for Status Chart
  const statusData = [
    { name: "Open", value: openCount, color: "#ef4444" },
    { name: "In Progress", value: inProgressCount, color: "#f59e0b" },
    { name: "Resolved", value: resolvedCount, color: "#10b981" },
  ];

  // Data for Category Chart
  const categoryCounts = complaints.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#10b981"];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Departmental Reports</h2>
        <p className="text-slate-500 dark:text-slate-400">Analytics and insights for your department's complaints.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
            <FileText className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{totalComplaints}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{resolutionRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{inProgressCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{openCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Overview of ticket statuses in your department.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-bg, #fff)', 
                    borderRadius: '8px', 
                    border: '1px solid var(--tooltip-border, #e2e8f0)',
                    color: 'var(--tooltip-text, #000)'
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Complaints by Category</CardTitle>
            <CardDescription>Distribution of complaints across different categories.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-bg, #fff)', 
                    borderRadius: '8px', 
                    border: '1px solid var(--tooltip-border, #e2e8f0)',
                    color: 'var(--tooltip-text, #000)'
                  }}
                  cursor={{ fill: 'var(--chart-cursor, #f1f5f9)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffReports;
