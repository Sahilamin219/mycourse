/*
  # Add weak_portions column to debate_analysis

  1. Changes
    - Add `weak_portions` (jsonb) column to `debate_analysis` table
      - Stores array of objects with: text, reason, alternative
      - Allows AI to highlight specific weak arguments with alternatives

  2. Notes
    - Uses jsonb for flexible structure
    - Nullable as not all analyses will have weak portions identified
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'debate_analysis' AND column_name = 'weak_portions'
  ) THEN
    ALTER TABLE debate_analysis ADD COLUMN weak_portions jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
