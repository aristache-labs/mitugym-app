-- Migration: Update checkins table to replace location with membership_plan_name
-- Execute this SQL in your Supabase SQL editor

-- Step 1: Add the new membership_plan_name column
ALTER TABLE checkins ADD COLUMN membership_plan_name VARCHAR(255);

-- Step 2: Update existing records with membership plan from profiles
UPDATE checkins 
SET membership_plan_name = COALESCE(
  (SELECT membership_plan FROM profiles WHERE profiles.id = checkins.user_id),
  'Basic Plan'
)
WHERE membership_plan_name IS NULL;

-- Step 3: Remove the location column
ALTER TABLE checkins DROP COLUMN location;

-- Step 4: Make membership_plan_name NOT NULL
ALTER TABLE checkins ALTER COLUMN membership_plan_name SET NOT NULL;

-- Step 5: Add a comment for documentation
COMMENT ON COLUMN checkins.membership_plan_name IS 'The membership plan the user had when they checked in';
