import React, { createContext, useContext, useState, useEffect } from "react";

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
  studentName: string;
  assignedTo?: string; // Department
  remarks?: string;
  attachment?: string; // URL or placeholder
}

interface ComplaintContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, "id" | "dateSubmitted" | "status" | "studentName">) => void;
  updateStatus: (id: string, status: TicketStatus, remarks?: string) => void;
  getComplaintsByStudent: (studentId: string) => Complaint[];
  getComplaintsByDepartment: (department?: string) => Complaint[]; // For staff
  getAllComplaints: () => Complaint[]; // For admin
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

// Mock Data
const initialComplaints: Complaint[] = [
  {
    id: "1",
    title: "Broken Projector in Room 301",
    description: "The projector displays a blue screen and flickers.",
    category: "Classroom",
    status: "Open",
    dateSubmitted: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    studentId: "s1",
    studentName: "Alex Student",
    assignedTo: "IT Support",
  },
  {
    id: "2",
    title: "No Internet in Dorm Block B",
    description: "Wifi signal is very weak on the 2nd floor.",
    category: "Internet",
    status: "In Progress",
    dateSubmitted: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    studentId: "s1",
    studentName: "Alex Student",
    assignedTo: "Network Admin",
    remarks: "Technician dispatched.",
  },
  {
    id: "3",
    title: "Leaking Tap in Lab 2",
    description: "Water is dripping constantly.",
    category: "Lab Equipment",
    status: "Resolved",
    dateSubmitted: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
    studentId: "s2",
    studentName: "John Doe",
    assignedTo: "Maintenance",
    remarks: "Fixed on Tuesday.",
  },
];

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);

  // Load from local storage if available (simple persistence)
  useEffect(() => {
    const stored = localStorage.getItem("astu_complaints");
    if (stored) {
      setComplaints(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("astu_complaints", JSON.stringify(complaints));
  }, [complaints]);

  const addComplaint = (data: Omit<Complaint, "id" | "dateSubmitted" | "status" | "studentName">) => {
    const newComplaint: Complaint = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      dateSubmitted: new Date().toISOString(),
      status: "Open",
      studentName: "Alex Student", // Mock name
    };
    setComplaints((prev) => [newComplaint, ...prev]);
  };

  const updateStatus = (id: string, status: TicketStatus, remarks?: string) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, remarks: remarks || c.remarks } : c))
    );
  };

  const getComplaintsByStudent = (studentId: string) => {
    return complaints.filter((c) => c.studentId === studentId);
  };

  const getComplaintsByDepartment = (department?: string) => {
    // For demo, return all or filter if department logic was stricter
    return complaints; 
  };

  const getAllComplaints = () => complaints;

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        addComplaint,
        updateStatus,
        getComplaintsByStudent,
        getComplaintsByDepartment,
        getAllComplaints,
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
