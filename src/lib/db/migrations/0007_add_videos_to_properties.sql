-- Add missing 'videos' column to properties if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'properties'
      AND column_name = 'videos'
  ) THEN
    ALTER TABLE "properties" ADD COLUMN "videos" jsonb DEFAULT '[]'::jsonb;
  END IF;
END$$;

