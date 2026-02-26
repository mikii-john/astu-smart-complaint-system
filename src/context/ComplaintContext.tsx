import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

export type TicketStatus = "Open" | "In Progress" | "Resolved";
export type Category = "Dormitory" | "Lab Equipment" | "Internet" | "Classroom" | "Other";

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: Category;
  status: TicketStatus;
  dateSubmitted: string;
  studentId: string;
  studentName?: string;
  assignedTo?: string; // Department
  remarks?: string;
  attachment?: string; // URL
}

interface ComplaintContextType {
  complaints: Complaint[];
  loading: boolean;
  addComplaint: (complaint: Omit<Complaint, "id" | "dateSubmitted" | "status" | "studentName">, file?: File) => Promise<void>;
  updateStatus: (id: string, status: TicketStatus, remarks?: string) => Promise<void>;
  refreshComplaints: () => Promise<void>;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshComplaints = async () => {
    if (!user) {
      setComplaints([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from("complaints")
        .select(`
          *,
          profiles:student_id (full_name)
        `)
        .order("created_at", { ascending: false });

      // RLS handles the filtering, but we can be explicit if we want
      // For student, they only see their own. For staff/admin, they see all (based on RLS).

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setComplaints(data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category as Category,
          status: item.status as TicketStatus,
          dateSubmitted: item.created_at,
          studentId: item.student_id,
          studentName: item.profiles?.full_name,
          assignedTo: item.assigned_to,
          remarks: item.remarks,
          attachment: item.attachment_path ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/complaint-attachments/${item.attachment_path}` : undefined,
        })));
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshComplaints();
  }, [user]);

  const addComplaint = async (data: Omit<Complaint, "id" | "dateSubmitted" | "status" | "studentName">, file?: File) => {
    if (!user) return;

    try {
      let attachmentPath = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('complaint-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        attachmentPath = filePath;
      }

      const { error } = await supabase
        .from("complaints")
        .insert({
          title: data.title,
          description: data.description,
          category: data.category,
          student_id: user.id,
          attachment_path: attachmentPath,
        });

      if (error) throw error;
      
      await refreshComplaints();
    } catch (error) {
      console.error("Error adding complaint:", error);
      throw error;
    }
  };

  const updateStatus = async (id: string, status: TicketStatus, remarks?: string) => {
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ status, remarks })
        .eq("id", id);

      if (error) throw error;
      
      await refreshComplaints();
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        loading,
        addComplaint,
        updateStatus,
        refreshComplaints,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (context === undefined) {
    throw new Error("useComplaints must be used within a ComplaintProvider");
  }
  return context;
};
