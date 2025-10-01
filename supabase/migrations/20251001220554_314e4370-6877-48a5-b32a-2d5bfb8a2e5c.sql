-- Create students table for academic management system
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  course TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read students (public academic data)
CREATE POLICY "Anyone can view students"
  ON public.students
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert students
CREATE POLICY "Anyone can create students"
  ON public.students
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow anyone to update students
CREATE POLICY "Anyone can update students"
  ON public.students
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy to allow anyone to delete students
CREATE POLICY "Anyone can delete students"
  ON public.students
  FOR DELETE
  USING (true);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to automatically update updated_at on row update
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster searches by registration number
CREATE INDEX idx_students_registration_number ON public.students(registration_number);

-- Create index for faster searches by email
CREATE INDEX idx_students_email ON public.students(email);

-- Create index for faster searches by name
CREATE INDEX idx_students_name ON public.students(name);