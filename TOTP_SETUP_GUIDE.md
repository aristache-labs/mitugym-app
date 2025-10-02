# TOTP QR Code - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Add Environment Variables

Create a `.env` file in the project root:

```env
# Your existing Supabase config (already set)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key

# New: Add these lines for TOTP
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_API_KEY=your_api_key_from_webpanel
```

**Where to find these values:**
- `API_URL`: Your web panel URL (use `http://localhost:3000` for local testing)
- `API_KEY`: Get from web panel admin or `.env` file in `mitugym-app-webpanel`

### Step 2: Verify Web Panel is Running

Make sure the web panel has the TOTP endpoints deployed:

```powershell
# In web panel directory
npm run dev
```

Verify these endpoints exist:
- `GET /api/member/totp-setup/:memberId` - Setup TOTP
- `POST /api/checkin` - Check-in with TOTP
- `POST /api/checkin/verify` - Verify TOTP

### Step 3: Test the Implementation

1. **Start your mobile app** (you mentioned you handle this yourself)
2. **Navigate to QR tab** in bottom navigation
3. **Watch console for logs:**
   ```
   No TOTP secret found, setting up...
   TOTP setup successful
   ```
4. **Verify QR code appears** with actual scannable QR
5. **Check countdown timer** updates every second
6. **Wait 30 seconds** and verify code auto-refreshes

### Step 4: Test Scanning (Optional)

If you have the web panel scanner ready:

1. Open web panel check-in page
2. Scan the QR code from mobile app
3. Should see: `✅ Check-in successful`

## 📋 What Changed in Your App

### Files Modified
1. ✅ `lib/store.ts` - Added TOTP state management
2. ✅ `app/(tabs)/qr.tsx` - TOTP initialization
3. ✅ `components/QRCard.tsx` - QR code rendering

### Files Created
1. ✅ `utils/totp.ts` - TOTP utilities
2. ✅ `TOTP_MOBILE_IMPLEMENTATION.md` - Full documentation
3. ✅ `TOTP_SETUP_GUIDE.md` - This file

### Packages Added
- `otpauth` - TOTP generation
- `expo-secure-store` - Secure storage
- `react-native-qrcode-svg` - QR rendering
- `react-native-svg` - SVG support

## 🔧 Configuration Examples

### Local Development
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_API_KEY=dev_api_key_12345
```

### Production
```env
EXPO_PUBLIC_API_URL=https://api.mitugym.com
EXPO_PUBLIC_API_KEY=prod_api_key_secure_random_string
```

### Using Local Network IP (for testing on physical device)
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
EXPO_PUBLIC_API_KEY=dev_api_key_12345
```

Replace `192.168.1.100` with your computer's local IP address.

## ✅ Verification Checklist

After setup, verify these:

- [ ] Environment variables are set in `.env`
- [ ] Web panel is running and accessible
- [ ] Mobile app opens QR screen without errors
- [ ] QR code is visible and scannable
- [ ] Countdown timer shows and updates (0:30 → 0:29 → ...)
- [ ] Code auto-refreshes after 30 seconds
- [ ] Console shows "TOTP setup successful"
- [ ] Shield icon appears in status banner
- [ ] Code is formatted as "123 456"

## 🐛 Troubleshooting

### "No TOTP secret found" keeps appearing
**Solution:** Check if API URL and API KEY are correct in `.env`

### QR code shows icon instead of actual QR
**Solution:** TOTP setup failed. Check:
1. Web panel is running
2. API key is valid
3. Network connection is available
4. Check console for error messages

### Code doesn't refresh after 30 seconds
**Solution:** Check device time settings - enable automatic time

### Can't scan QR code
**Solution:**
1. Increase screen brightness to 100%
2. Hold device 6-8 inches from scanner
3. Keep screen steady for 2-3 seconds
4. Verify scanner supports alphanumeric QR codes

## 📱 User Experience Flow

```
User opens QR tab
        ↓
App checks for TOTP secret
        ↓
If not found → Call API to set up
        ↓
Store secret securely
        ↓
Generate first TOTP code
        ↓
Display QR code (member_id:123456)
        ↓
Update countdown every second
        ↓
Auto-refresh code every 30 seconds
```

## 🔐 Security Benefits

| Feature | Benefit |
|---------|---------|
| 30-second rotation | Prevents QR code sharing |
| Encrypted storage | Secrets secure in device keychain |
| Time-based | Old codes become invalid |
| Member-specific | Each user has unique secret |
| Offline capable | Works without internet |

## 💡 Pro Tips

1. **First-time setup requires internet** - After that, works offline
2. **Keep device time accurate** - Enable automatic time synchronization
3. **Brightness matters** - Max brightness for scanning
4. **Fallback exists** - If TOTP fails, app uses legacy token system
5. **No manual setup needed** - Everything happens automatically

## 📞 Support

**Common Questions:**

**Q: Do I need to do anything for existing users?**
A: No! The app automatically sets up TOTP the first time they open the QR screen.

**Q: What if the API is down?**
A: App falls back to the legacy token system automatically.

**Q: Can I disable TOTP?**
A: Yes, just remove the environment variables and app uses legacy mode.

**Q: How do I reset TOTP for a user?**
A: Delete the TOTP secret from their profile in database, app will re-setup on next QR open.

## 🎯 Next Steps

1. **Add environment variables** to `.env` file
2. **Restart your app** (if it's running)
3. **Test QR screen** to verify TOTP works
4. **Scan QR code** with web panel to test end-to-end
5. **Monitor logs** for any errors

---

**Need Help?**
- Check `TOTP_MOBILE_IMPLEMENTATION.md` for full documentation
- Review web panel docs at `mitugym-app-webpanel\TOTP_IMPLEMENTATION_SUMMARY.md`
- Check console logs for detailed error messages

**Ready to Test?** ✅
Open the QR tab and watch the magic happen!

