# TOTP Auto-Setup for New Members

## 📋 Current Status

✅ **Mobile App (Option 1)**: Now automatically sets up TOTP during signup
❌ **Backend (Option 2)**: Needs to be implemented in web panel

---

## 🎯 Option 1: Mobile App Auto-Setup (IMPLEMENTED)

### What I Just Added:

The mobile app now automatically calls `initializeTOTP()` right after successful signup. This means:

1. ✅ User signs up
2. ✅ Profile is created in database
3. ✅ Mobile app immediately calls `/api/member/totp-setup/:memberId`
4. ✅ TOTP secret is generated and stored
5. ✅ User can use QR code immediately

### Code Added to `lib/store.ts`:

```typescript
if (data.session) {
  console.log('Session exists, profile created automatically by trigger');

  // Initialize TOTP for new user
  try {
    await get().initializeTOTP();
  } catch (totpError) {
    console.error('Failed to initialize TOTP during signup:', totpError);
    // Don't fail signup if TOTP setup fails
  }

  get().showToast('Account created successfully!', 'success');
}
```

### Pros:
- ✅ Works immediately (already implemented)
- ✅ No backend changes needed
- ✅ Uses existing TOTP setup endpoint

### Cons:
- ❌ Requires internet connection during signup
- ❌ If API call fails, user won't have TOTP (falls back to legacy)
- ❌ Only works if user signs up via mobile app

---

## 🚀 Option 2: Backend Auto-Setup (RECOMMENDED)

### Approach A: Database Trigger (Best for Supabase)

Create a PostgreSQL function that automatically generates a TOTP secret when a new profile is created.

#### Step 1: Create the Function

```sql
-- Function to generate a random Base32 secret (160 bits)
CREATE OR REPLACE FUNCTION generate_totp_secret()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  result text := '';
  i integer;
BEGIN
  -- Generate 32 random characters (160 bits)
  FOR i IN 1..32 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

#### Step 2: Create the Trigger

```sql
-- Function to set TOTP secret on new profile
CREATE OR REPLACE FUNCTION set_totp_secret_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set totp_secret if it's NULL
  IF NEW.totp_secret IS NULL THEN
    NEW.totp_secret := generate_totp_secret();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on profiles table
CREATE TRIGGER trigger_set_totp_secret
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_totp_secret_on_insert();
```

#### Step 3: Apply via Supabase Migration

Create a new migration file in your web panel:

```bash
# In mitugym-app-webpanel directory
# Create: supabase/migrations/YYYYMMDDHHMMSS_auto_generate_totp_secrets.sql
```

```sql
-- Auto-generate TOTP secrets for new members
-- Migration: auto_generate_totp_secrets

-- Function to generate Base32 TOTP secret
CREATE OR REPLACE FUNCTION generate_totp_secret()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..32 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-set TOTP secret on profile creation
CREATE OR REPLACE FUNCTION set_totp_secret_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.totp_secret IS NULL THEN
    NEW.totp_secret := generate_totp_secret();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_set_totp_secret ON profiles;
CREATE TRIGGER trigger_set_totp_secret
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_totp_secret_on_insert();

-- Backfill existing members without TOTP secrets (optional)
UPDATE profiles 
SET totp_secret = generate_totp_secret() 
WHERE totp_secret IS NULL;
```

#### Step 4: Apply the Migration

```bash
# Using MCP (recommended)
# The migration will be applied via Supabase MCP tools

# Or manually in Supabase Dashboard:
# Go to SQL Editor and run the migration
```

### Pros:
- ✅ **100% automated** - Works for all signup methods (web, mobile, admin)
- ✅ **No API dependency** - Works even if API is down
- ✅ **Immediate** - Secret available as soon as profile is created
- ✅ **Reliable** - Database-level guarantee
- ✅ **Backfill support** - Can update existing users automatically

### Cons:
- ❌ Requires database migration
- ❌ Need access to Supabase

---

### Approach B: Modify Signup Endpoint (Alternative)

If you can't use database triggers, modify the web panel's signup endpoint:

```typescript
// In web panel: src/app/api/auth/signup/route.ts (or similar)

import { generateTOTPSecret } from '@/lib/totp';

export async function POST(request: Request) {
  const { email, password, ...profileData } = await request.json();
  
  // Create user in Supabase
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) throw authError;

  // Generate TOTP secret
  const totpSecret = generateTOTPSecret(); // Your existing function

  // Create profile with TOTP secret
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email,
      totp_secret: totpSecret, // ← Add this
      ...profileData,
    });

  if (profileError) throw profileError;

  return Response.json({ success: true });
}
```

---

## 🎯 Recommended Implementation Plan

### Phase 1: Use Mobile App Auto-Setup (Already Done ✅)
- Works immediately
- No backend changes needed
- Handles most cases

### Phase 2: Add Database Trigger (Recommended Next Step)
1. Create the migration file in web panel
2. Apply via Supabase MCP or SQL Editor
3. Backfill existing users
4. All future signups automatically have TOTP

### Phase 3: Monitoring
- Check that new signups have `totp_secret` populated
- Monitor TOTP setup failures in mobile app
- Eventually remove fallback to legacy tokens

---

## 🔍 How to Check if TOTP is Set Up

### For a Specific Member:

```sql
-- Check in Supabase SQL Editor
SELECT 
  id, 
  email, 
  totp_secret IS NOT NULL as has_totp,
  totp_secret
FROM profiles 
WHERE email = 'user@example.com';
```

### For All Members:

```sql
SELECT 
  COUNT(*) FILTER (WHERE totp_secret IS NOT NULL) as with_totp,
  COUNT(*) FILTER (WHERE totp_secret IS NULL) as without_totp,
  COUNT(*) as total
FROM profiles;
```

---

## ✅ Testing the Auto-Setup

### Test New Signup:

1. **Create a new account** via mobile app
2. **Check the database**:
   ```sql
   SELECT totp_secret FROM profiles WHERE email = 'newuser@test.com';
   ```
3. **Open QR screen** - Should show TOTP QR code immediately
4. **No error messages** in console

### Expected Result:
- ✅ Profile created with `totp_secret` populated
- ✅ QR screen shows rotating code
- ✅ Code refreshes every 30 seconds
- ✅ No "TOTP not configured" errors

---

## 🐛 Troubleshooting

### Mobile App Says "TOTP not configured"
- Check if `totp_secret` exists in database
- Check `.env` file has correct API URL and key
- Check web panel API is running and accessible
- Check network connection

### Database Trigger Not Working
- Verify trigger exists: `\d+ profiles` in psql
- Check trigger is enabled
- Test the function manually:
  ```sql
  SELECT generate_totp_secret();
  ```

### Want to Reset TOTP for a User
```sql
UPDATE profiles 
SET totp_secret = generate_totp_secret() 
WHERE id = 'user-id-here';
```

---

## 📊 Migration Status

- [x] Option 1: Mobile app auto-setup ✅ **IMPLEMENTED**
- [ ] Option 2: Database trigger (recommended next)
- [ ] Backfill existing users
- [ ] Remove legacy token system

---

**Next Steps:**
1. ✅ Mobile app now auto-creates TOTP on signup
2. 🔄 Consider adding database trigger for 100% coverage
3. 🔄 Test with new signups
4. 🔄 Monitor for any issues


