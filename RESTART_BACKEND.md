# Quick Fix: Restart Backend to Apply Filter Changes

## The Problem

The backend code has been updated to handle the new filter parameters with a temporary fallback, but the running server needs to be restarted to apply these changes.

## Quick Restart Steps

### Option 1: Using Task Manager (Easiest)
1. Press `Ctrl + Shift + Esc` to open Task Manager
2. Find all "Node.js" processes
3. Right-click each one → End Task
4. Open terminal in `Backend/v1` folder
5. Run: `npm run dev`

### Option 2: Using Command Line
```bash
# Kill the process on port 3001 (PID: 23204)
taskkill /PID 23204 /F

# Navigate to backend folder
cd C:\Users\user\Documents\PROJECTS\HAKIARDHI\Digital_Ecosystem\Backend\v1

# Restart the server
npm run dev
```

### Option 3: Using npm-run-all (if .next permission errors persist)
```bash
# Clean the .next folder
cd C:\Users\user\Documents\PROJECTS\HAKIARDHI\Digital_Ecosystem\Backend\v1
rm -rf .next

# Restart the server
npm run dev
```

## What Changed

The analytics service now has a **temporary fallback mechanism**:
1. First, it tries to call the RPC function with all new parameters
2. If that fails (because the database hasn't been updated), it falls back to the basic parameters
3. This allows the dashboard to work while you update the database

## Expected Behavior After Restart

### ✅ Dashboard will load without errors
- Filters will appear and be selectable
- Data will load from the API
- Year/quarter/month filters will work partially (won't filter data yet, but won't crash)

### ⚠️ Time filtering won't actually filter data yet
- You can select year 2025, but it will return all data
- To make time filtering actually work, you must update the database RPC function

## Console Warnings

After restart, you'll see warnings in the backend console:
```
⚠ RPC function not updated yet, falling back to basic parameters
⚠ Please update rpc_get_admin_dashboard to accept new filter parameters
⚠ See: Backend/v1/DATABASE_FILTER_UPDATE.md for instructions
```

This is **normal and expected**. The warnings will disappear once you update the database.

## Next Steps After Restart

1. ✅ Verify dashboard loads without 500 errors
2. ✅ Verify filters are selectable
3. ✅ Verify data displays (even if not filtered by time yet)
4. ⚠️ Update database RPC function following `DATABASE_FILTER_UPDATE.md`
5. ✅ Test time filtering actually filters data

## If Problems Persist

### Error: "Port 3001 already in use"
```bash
# Find process on port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Restart
npm run dev
```

### Error: "EPERM: operation not permitted, open '.next/trace'"
```bash
# Close VSCode if it's open in the Backend folder
# Delete .next folder
rm -rf .next

# Restart
npm run dev
```

### Error: Still getting 500 errors after restart
Check the backend console for specific error messages and share them.

---

**Quick Command to Restart:**
```bash
taskkill /PID 23204 /F && cd C:\Users\user\Documents\PROJECTS\HAKIARDHI\Digital_Ecosystem\Backend\v1 && npm run dev
```
