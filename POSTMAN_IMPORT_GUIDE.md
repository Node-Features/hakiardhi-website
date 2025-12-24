# How to Import Postman Collection & Environment

## Step-by-Step Import Instructions

### Method 1: Drag & Drop (Easiest)

1. **Open Postman Desktop Application**

2. **Drag and Drop Files**
   - Locate the two JSON files in your file explorer:
     - `Digital_Ecosystem_API.postman_collection.json`
     - `Digital_Ecosystem.postman_environment.json`
   - Drag both files into the Postman window
   - Postman will automatically detect and import them

3. **Verify Import**
   - Collection appears in the left sidebar under "Collections"
   - Environment appears in the environment dropdown (top right)

---

### Method 2: Using Import Button

#### Step 1: Import the Collection

1. **Open Postman**

2. **Click Import Button**
   - Look for the "Import" button in the top left
   - OR press `Ctrl+O` (Windows/Linux) or `Cmd+O` (Mac)

3. **Select File**
   - Click "Upload Files" or "Choose Files"
   - Navigate to: `Backend/v1/Digital_Ecosystem_API.postman_collection.json`
   - Click "Open"

4. **Confirm Import**
   - Postman will show a preview
   - Click "Import" button
   - ✅ Collection imported successfully!

#### Step 2: Import the Environment

1. **Click Import Button Again**
   - Click "Import" in the top left
   - OR press `Ctrl+O` / `Cmd+O`

2. **Select Environment File**
   - Click "Upload Files"
   - Navigate to: `Backend/v1/Digital_Ecosystem.postman_environment.json`
   - Click "Open"

3. **Confirm Import**
   - Click "Import" button
   - ✅ Environment imported successfully!

---

### Method 3: Import from Folder

1. **Click Import**

2. **Select "Folder" Tab**
   - Click on the "Folder" tab in the import dialog

3. **Choose Folder**
   - Select the `Backend/v1/` folder
   - Postman will scan and find both JSON files

4. **Import All**
   - Click "Import"
   - Both collection and environment will be imported together

---

## After Import: Configuration

### Step 1: Select the Environment

1. **Find Environment Dropdown**
   - Look at the top-right corner of Postman
   - Click the environment dropdown (says "No Environment" by default)

2. **Select Environment**
   - Choose "Digital Ecosystem Environment"
   - ✅ Environment is now active

### Step 2: Configure Environment Variables

1. **View Environment Variables**
   - Click the eye icon (👁️) next to the environment dropdown
   - OR click the environment name and select "Edit"

2. **Update Base URL** (Important!)
   - Find the `base_url` variable
   - Update the value to your API server:
     - Local: `http://localhost:3000`
     - Staging: `https://staging-api.yourdomain.com`
     - Production: `https://api.yourdomain.com`

3. **Set Login Credentials**
   - `default_email` - Your admin email
   - `default_password` - Your admin password

4. **Save Changes**
   - Click "Save" or "Update"

### Step 3: Test the Setup

1. **Run Login Request**
   - Navigate to: **Collections > Digital Ecosystem API > Authentication > Login**
   - Click "Send"

2. **Check Response**
   - You should get a 200 OK response
   - Check the Postman Console (View > Show Postman Console)
   - You should see: "✅ Tokens and user details saved to environment"

3. **Verify Variables**
   - Click the eye icon (👁️) to view environment
   - You should see values for:
     - `access_token`
     - `user_id`
     - `user_email`

4. **Test Authenticated Request**
   - Navigate to: **Collections > Digital Ecosystem API > Users > List Users**
   - Click "Send"
   - You should get a 200 OK response with user data

---

## Troubleshooting Import Issues

### Issue: "Failed to import"

**Solutions:**
- Ensure the JSON files are not corrupted
- Check that you're using Postman Desktop (not web version for local APIs)
- Try Method 1 (drag & drop) instead
- Restart Postman and try again

### Issue: Environment not showing up

**Solutions:**
- Click the environment dropdown (top right)
- Look for "Digital Ecosystem Environment"
- If not there, re-import the environment file
- Make sure you imported the `.postman_environment.json` file

### Issue: Collection imported but folders are empty

**Solutions:**
- This shouldn't happen, but if it does:
- Re-download the collection file
- Clear Postman cache (Settings > Data)
- Try importing again

### Issue: Variables not working

**Solutions:**
- Ensure environment is selected (not "No Environment")
- Check variable names match (case-sensitive)
- Click eye icon to verify variables exist
- Try running Login endpoint first to populate auth variables

---

## Quick Verification Checklist

After import, verify:

- ✅ Collection "Digital Ecosystem API" appears in Collections sidebar
- ✅ Environment "Digital Ecosystem Environment" appears in dropdown
- ✅ Environment is selected (shown in top-right dropdown)
- ✅ `base_url` is set correctly
- ✅ `default_email` and `default_password` are set
- ✅ Login request works and saves `access_token`
- ✅ List Users request works with authentication

---

## File Locations

The files you need to import are in:

```
Backend/v1/
├── Digital_Ecosystem_API.postman_collection.json (Collection)
└── Digital_Ecosystem.postman_environment.json    (Environment)
```

---

## Next Steps

Once imported and configured:

1. **Read the Quick Start** → `QUICK_START.md`
2. **Try Example Workflows** → See `POSTMAN_COLLECTION_GUIDE.md`
3. **Explore Endpoints** → Browse the collection folders
4. **Check API Reference** → `API_ENDPOINTS_REFERENCE.md`

---

## Video Tutorial Alternative

If you prefer video instructions, Postman has official guides:
1. Go to: https://learning.postman.com/
2. Search for: "Import collections"
3. Watch the 2-minute tutorial

---

## Additional Resources

- **Postman Documentation:** https://learning.postman.com/docs/getting-started/importing-and-exporting-data/
- **Collection Guide:** `POSTMAN_COLLECTION_GUIDE.md`
- **Quick Reference:** `QUICK_START.md`
- **Endpoints List:** `API_ENDPOINTS_REFERENCE.md`

---

## Need Help?

If you encounter any issues:
1. Check the Postman Console for errors (View > Show Postman Console)
2. Verify your API server is running
3. Ensure environment variables are set correctly
4. Try re-importing the files

---

**That's it! You're ready to use the Digital Ecosystem API collection! 🚀**
