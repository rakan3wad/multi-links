-- Add avatar_url column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Update types for the profiles table
ALTER TABLE public.profiles
ALTER COLUMN avatar_url TYPE TEXT,
ALTER COLUMN avatar_url DROP NOT NULL;

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
