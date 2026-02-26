import React, { useState } from "react";
import { useComplaints, Category } from "@/context/ComplaintContext";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Upload, X } from "lucide-react";
import { motion } from "motion/react";

const NewComplaint: React.FC = () => {
  const { user } = useAuth();
  const { addComplaint } = useComplaints();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Dormitory");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addComplaint({
        title,
        description,
        category,
        studentId: user?.id || "",
      }, file || undefined);
      
      setIsSubmitting(false);
      navigate("/student");
    } catch (error) {
      console.error("Submission failed:", error);
      setIsSubmitting(false);
      // TODO: Show error toast
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Submit a Complaint</h2>
        <p className="text-slate-500">Describe the issue you are facing.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Complaint Details</CardTitle>
            <CardDescription>Please provide as much detail as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Category
                </label>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                >
                  <option value="Dormitory">Dormitory</option>
                  <option value="Lab Equipment">Lab Equipment</option>
                  <option value="Internet">Internet</option>
                  <option value="Classroom">Classroom</option>
                  <option value="Other">Other</option>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Title
                </label>
                <Input
                  placeholder="e.g., Broken Window in Room 101"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Description
                </label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe the issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Attachment (Optional)
                </label>
                <div className="flex items-center justify-center w-full">
                  {!file ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-slate-400" />
                        <p className="mb-2 text-sm text-slate-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        accept="image/*"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between w-full p-4 border border-slate-200 rounded-lg bg-slate-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                        <X className="w-4 h-4 text-slate-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" type="button" onClick={() => navigate("/student")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Complaint"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NewComplaint;
