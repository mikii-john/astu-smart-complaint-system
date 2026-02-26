-- Migration: Fix infinite recursion in RLS policies
-- Description: This migration replaces recursive RLS policies with non-recursive versions using auth.jwt().
-- It covers profiles, complaints, and storage objects.

-- 1. CLEAN UP PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins and staff can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- 2. CREATE NON-RECURSIVE PROFILES POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Admins and staff can view all profiles (using JWT metadata to avoid recursion)
CREATE POLICY "Admins and staff can view all profiles"
ON public.profiles FOR SELECT
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'staff')
);

-- Users can insert their own profile (Required for new signups and fallback creation)
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- 3. FIX COMPLAINTS POLICIES (if they use EXISTS with profiles)
DROP POLICY IF EXISTS "Staff can view all complaints" ON public.complaints;
DROP POLICY IF EXISTS "Staff can update complaints" ON public.complaints;

CREATE POLICY "Staff can view all complaints"
ON public.complaints FOR SELECT
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('staff', 'admin')
);

CREATE POLICY "Staff can update complaints"
ON public.complaints FOR UPDATE
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('staff', 'admin')
);

-- 4. FIX STORAGE POLICIES
DROP POLICY IF EXISTS "Staff and admins can view all attachments" ON storage.objects;

CREATE POLICY "Staff and admins can view all attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'complaint-attachments' AND
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('staff', 'admin')
);
