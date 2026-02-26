import React from "react";
import { useComplaints } from "@/context/ComplaintContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";
import { Paperclip } from "lucide-react";

const ComplaintHistory: React.FC = () => {
  const { complaints, loading } = useComplaints();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Complaint History</h2>
        <p className="text-slate-500">View and track all your previous submissions</p>
      </div>

      <div className="space-y-4">
        {complaints.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            No complaints found in your history.
          </Card>
        ) : (
          <div className="grid gap-4">
            {complaints.map((complaint, index) => (
              <motion.div
                key={complaint.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getStatusColor(complaint.status)}>{complaint.status}</Badge>
                          <span className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(complaint.dateSubmitted))} ago
                          </span>
                        </div>
                        <h4 className="font-semibold text-lg text-slate-900">{complaint.title}</h4>
                        <p className="text-slate-600 text-sm line-clamp-2">{complaint.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{complaint.category}</span>
                          {complaint.assignedTo && (
                            <span>Assigned to: {complaint.assignedTo}</span>
                          )}
                          {complaint.attachment && (
                            <a 
                              href={complaint.attachment} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              <Paperclip className="h-3 w-3" />
                              Attachment
                            </a>
                          )}
                        </div>
                      </div>
                      
                      {complaint.remarks && (
                        <div className="md:w-1/3 bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-sm">
                          <p className="font-semibold text-blue-900 mb-1">Official Resolution / Remarks:</p>
                          <p className="text-blue-800 italic">"{complaint.remarks}"</p>
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

export default ComplaintHistory;
