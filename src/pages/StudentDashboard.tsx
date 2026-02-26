import React from "react";
import { useComplaints, Complaint } from "@/context/ComplaintContext";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PlusCircle, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { complaints, loading } = useComplaints();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === "Open").length,
    inProgress: complaints.filter(c => c.status === "In Progress").length,
    resolved: complaints.filter(c => c.status === "Resolved").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "destructive"; // Red for open/urgent
      case "In Progress": return "warning"; // Amber for progress
      case "Resolved": return "success"; // Green for done
      default: return "default";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
          <p className="text-slate-500">Welcome back, {user?.name}</p>
        </div>
        <Link to="/student/new">
          <Button className="gap-2 shadow-lg shadow-blue-600/20">
            <PlusCircle className="h-4 w-4" />
            New Complaint
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
            <p className="text-xs text-slate-500">Waiting for review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-slate-500">Being worked on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
            <p className="text-xs text-slate-500">Successfully closed</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-900">Recent Complaints</h3>
        {complaints.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            No complaints found. Everything seems good!
          </Card>
        ) : (
          <div className="grid gap-4">
            {complaints.map((complaint, index) => (
              <motion.div
                key={complaint.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg text-slate-900">{complaint.title}</h4>
                          <Badge variant={getStatusColor(complaint.status)}>{complaint.status}</Badge>
                        </div>
                        <p className="text-slate-600">{complaint.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                          <span>{complaint.category}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(complaint.dateSubmitted))} ago</span>
                          {complaint.assignedTo && (
                            <>
                              <span>•</span>
                              <span>Assigned to: {complaint.assignedTo}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {complaint.remarks && (
                        <div className="md:w-1/3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                          <p className="font-medium text-slate-700 mb-1">Staff Remarks:</p>
                          <p className="text-slate-600">{complaint.remarks}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
