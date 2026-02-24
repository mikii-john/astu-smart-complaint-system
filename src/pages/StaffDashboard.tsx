import React, { useState } from "react";
import { useComplaints, TicketStatus } from "@/context/ComplaintContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getComplaintsByDepartment, updateStatus } = useComplaints();
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | "All">("All");

  const complaints = getComplaintsByDepartment(user?.department);
  
  const filteredComplaints = selectedStatus === "All" 
    ? complaints 
    : complaints.filter(c => c.status === selectedStatus);

  const handleStatusChange = (id: string, newStatus: TicketStatus) => {
    const remarks = prompt("Add remarks for this status update (optional):");
    updateStatus(id, newStatus, remarks || undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "destructive";
      case "In Progress": return "warning";
      case "Resolved": return "success";
      default: return "default";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Staff Dashboard</h2>
          <p className="text-slate-500">Department: {user?.department || "General"}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Filter by:</span>
          <Select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value as TicketStatus | "All")}
            className="w-40"
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-red-50 border-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {complaints.filter(c => c.status === "Open").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              {complaints.filter(c => c.status === "In Progress").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              {complaints.filter(c => c.status === "Resolved").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-900">Assigned Tickets</h3>
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
              No tickets found matching the filter.
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <motion.div
                key={complaint.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant={getStatusColor(complaint.status)}>{complaint.status}</Badge>
                          <span className="text-xs text-slate-400 font-mono">#{complaint.id}</span>
                        </div>
                        <h4 className="font-semibold text-lg text-slate-900">{complaint.title}</h4>
                        <p className="text-slate-600">{complaint.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Category:</span> {complaint.category}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Submitted by:</span> {complaint.studentName}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Date:</span> {formatDistanceToNow(new Date(complaint.dateSubmitted))} ago
                          </div>
                        </div>
                        
                        {complaint.remarks && (
                          <div className="mt-3 bg-slate-50 p-3 rounded-md text-sm border border-slate-100">
                            <span className="font-medium text-slate-700">Latest Remarks:</span> {complaint.remarks}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 min-w-[200px] border-l border-slate-100 pl-6 justify-center">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Update Status</span>
                        <div className="flex flex-col gap-2">
                          <Button 
                            size="sm" 
                            variant={complaint.status === "Open" ? "default" : "outline"}
                            className={complaint.status === "Open" ? "bg-red-500 hover:bg-red-600" : ""}
                            onClick={() => handleStatusChange(complaint.id, "Open")}
                            disabled={complaint.status === "Open"}
                          >
                            Mark as Open
                          </Button>
                          <Button 
                            size="sm" 
                            variant={complaint.status === "In Progress" ? "default" : "outline"}
                            className={complaint.status === "In Progress" ? "bg-amber-500 hover:bg-amber-600" : ""}
                            onClick={() => handleStatusChange(complaint.id, "In Progress")}
                            disabled={complaint.status === "In Progress"}
                          >
                            Mark In Progress
                          </Button>
                          <Button 
                            size="sm" 
                            variant={complaint.status === "Resolved" ? "default" : "outline"}
                            className={complaint.status === "Resolved" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                            onClick={() => handleStatusChange(complaint.id, "Resolved")}
                            disabled={complaint.status === "Resolved"}
                          >
                            Mark Resolved
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
