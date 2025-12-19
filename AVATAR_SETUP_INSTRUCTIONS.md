# Avatar Upload Setup Instructions

## Issue
The avatar upload feature is failing with a Row Level Security (RLS) policy error because the Supabase storage bucket and policies are not set up correctly.

## Solution

### Step 1: Create the Avatars Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/amgzzlnvrrqtleicgenq
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `avatars`
   - **Public**: ✅ Yes (checked)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp, image/gif`
5. Click **"Create bucket"**

### Step 2: Set Up RLS Policies

1. Go to **SQL Editor** in your Supabase Dashboard
2. Click **"New query"**
3. Copy and paste the contents of `supabase_avatar_storage_setup.sql`
4. Click **"Run"** to execute the SQL

The SQL will create 4 RLS policies:
- ✅ **Upload Policy**: Users can upload their own avatar
- ✅ **Update Policy**: Users can update their own avatar
- ✅ **Delete Policy**: Users can delete their own avatar
- ✅ **Read Policy**: Everyone can view avatars (public access)

### Step 3: Verify Setup

After running the SQL, verify the policies were created:

```sql
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%avatar%'
ORDER BY policyname;
```

You should see 4 policies listed.

## File Structure

Avatars are stored with the following structure:
```
avatars/
  └── {user_id}/
      └── {timestamp}.{ext}
```

Example: `avatars/123e4567-e89b-12d3-a456-426614174000/1702834567890.jpg`

This structure ensures:
- Each user has their own folder
- RLS policies can verify ownership
- Easy cleanup of old avatars

## Code Changes Made

### 1. Fixed Upload Path
- Changed from: `avatars/{filename}`
- Changed to: `avatars/{user_id}/{filename}`

### 2. Fixed Old Avatar Deletion
- Properly extracts path from public URL
- Correctly removes old avatar before uploading new one

### 3. Fixed Deprecated Warning
- Changed from: `ImagePicker.MediaTypeOptions.Images`
- Changed to: `['images']`

## Testing

After setup, test the avatar upload:

1. Open the app
2. Go to **Profile** tab
3. Tap on your avatar (or initials circle)
4. Select a photo from your gallery
5. Crop to 1:1 aspect ratio
6. Confirm upload

You should see:
- ✅ Loading spinner during upload
- ✅ Success toast message
- ✅ Avatar immediately updates
- ✅ Avatar persists after app restart

## Troubleshooting

### Error: "new row violates row-level security policy"
- **Cause**: RLS policies not set up correctly
- **Solution**: Run the SQL script in Step 2

### Error: "Bucket not found"
- **Cause**: Avatars bucket doesn't exist
- **Solution**: Create the bucket in Step 1

### Avatar not displaying
- **Cause**: Bucket is not public
- **Solution**: Make sure "Public" is checked when creating the bucket

### Permission denied error
- **Cause**: Missing photo library permissions
- **Solution**: Grant permissions when prompted, or check app settings

## Database Schema

The `profiles` table should have an `avatar_url` column:

```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'avatar_url';

-- Add column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

## Security Notes

- ✅ Users can only upload/update/delete their own avatars
- ✅ File size limited to 5MB
- ✅ Only image MIME types allowed
- ✅ Public read access for displaying avatars
- ✅ Automatic cleanup of old avatars on update
