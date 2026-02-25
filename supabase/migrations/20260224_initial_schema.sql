-- Initial Schema for ASTU Smart Complaint System

-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'staff', 'admin')),
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create complaints table
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Dormitory', 'Lab Equipment', 'Internet', 'Classroom', 'Other')),
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_to TEXT, -- Department name
  remarks TEXT,
  attachment_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Storage Bucket setup (Note: Run this in SQL Editor or Supabase UI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('complaint-attachments', 'complaint-attachments', false);

-- RLS POLICIES

-- Profiles: Users can see only their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Complaints: Students can see only their own complaints
CREATE POLICY "Students can view their own complaints" 
ON public.complaints FOR SELECT 
USING (auth.uid() = student_id);

-- Complaints: Students can insert their own complaints
CREATE POLICY "Students can insert their own complaints" 
ON public.complaints FOR INSERT 
WITH CHECK (auth.uid() = student_id);

-- Complaints: Staff/Admin can see complaints for their department or all
-- (This requires custom claims or a more complex check, keeping it simple for now)
CREATE POLICY "Staff can view all complaints" 
ON public.complaints FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (role = 'staff' OR role = 'admin')
  )
);

-- Complaints: Staff can update status and remarks
CREATE POLICY "Staff can update complaints" 
ON public.complaints FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (role = 'staff' OR role = 'admin')
  )
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, COALESCE(NEW.raw_user_meta_data->>'role', 'student'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
