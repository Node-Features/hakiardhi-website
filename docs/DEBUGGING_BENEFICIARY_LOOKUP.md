# Debugging Beneficiary Lookup

## Console Logs to Watch For

### 1. Component Mount (Should see immediately)
```
🚀 IncidentForm mounted - initializing...
📋 Props: { formId: "...", hasInitialData: false, ... }
```
**If you DON'T see this:** The component isn't loading at all.

---

### 2. Button Click (When you click "Check")
```
🖱️ Check button clicked!
📱 Current phone value: 255788114830
```
**If you DON'T see this:**
- Button click handler isn't working
- Button might be disabled
- Check if phone number has 10+ characters

---

### 3. Function Called (Right after button click)
```
🎯 lookupBeneficiary CALLED with: 255788114830
📏 Phone length: 12
🔍 Starting lookup for phone: 255788114830
```
**If you DON'T see this:**
- Function isn't being called
- JavaScript error preventing execution

---

### 4. API Request (From axios interceptor)
```
🚀 GET /api/admin/beneficiaries/lookup?phone_number=255788114830
```
**If you DON'T see this:**
- Request isn't being sent
- Check beneficiariesService implementation

---

### 5. API Response (After request completes)
```
📞 Lookup response: { success: true, exists: true, data: {...} }
✅ Beneficiary found: { first_name: "Mrisho", ... }
✅ Form auto-populated with: { name: "Mrisho Salum", ... }
✅ GET /api/admin/beneficiaries/lookup - 200
```
**If you DON'T see this:**
- Request failed
- Check Network tab for error

---

## Step-by-Step Testing

### Step 1: Open Browser Console
```
Press F12 → Console tab
Clear console (trash icon)
```

### Step 2: Navigate to Form
```
Go to incident form page
You should see:
  🚀 IncidentForm mounted - initializing...
```

### Step 3: Enter Phone Number
```
Type: 255788114830

You should see in console:
  (nothing yet - this is normal)
```

### Step 4: Click "Check" Button
```
Click the "Check" button

You should see in order:
  1. 🖱️ Check button clicked!
  2. 📱 Current phone value: 255788114830
  3. 🎯 lookupBeneficiary CALLED with: 255788114830
  4. 📏 Phone length: 12
  5. 🔍 Starting lookup for phone: 255788114830
  6. 🚀 GET /api/admin/beneficiaries/lookup?phone_number=255788114830
  7. 📞 Lookup response: {...}
  8. ✅ Beneficiary found: {...}
  9. ✅ GET /api/admin/beneficiaries/lookup - 200
```

---

## Troubleshooting

### Issue: No logs at all
**Cause:** Component not loading
**Solution:**
- Check if you're on the correct page
- Check React DevTools to see if component exists
- Look for JavaScript errors in Console

### Issue: No "Check button clicked" log
**Cause:** Button click not working
**Check:**
```javascript
// Is button disabled?
disabled={isLoading || formData.beneficiary.phone_number.trim().length < 10}

// Does phone have 10+ characters?
console.log(formData.beneficiary.phone_number.length);
```

### Issue: Button clicked but no "lookupBeneficiary CALLED"
**Cause:** Function not executing
**Check:**
- JavaScript error before function call
- Look for error in Console (red text)

### Issue: Function called but no "🚀 GET" log
**Cause:** API request not being sent
**Check:**
1. beneficiariesService.lookupByPhone exists
2. authApi is configured correctly
3. Check Network tab for failed request

### Issue: "🚀 GET" log but no response
**Cause:** Request hanging or failed
**Check:**
1. Open Network tab (F12 → Network)
2. Look for request to `/api/admin/beneficiaries/lookup`
3. Check status code (should be 200)
4. Check response body

### Issue: 404 Not Found
**Cause:** Endpoint doesn't exist on backend
**Check:**
```bash
# Test endpoint directly
curl https://hakiardhi-api.vercel.app/api/admin/beneficiaries/lookup?phone_number=255788114830
```

### Issue: CORS Error
**Cause:** Cross-origin request blocked
**Solution:** Verify next.config.ts proxy is correct

### Issue: 401 Unauthorized
**Cause:** Not authenticated
**Check:**
- localStorage.getItem('access_token')
- Login first before testing

---

## Quick Diagnostic

Copy and paste this in Console:
```javascript
// Check if component is mounted
console.log('Component mounted:', !!document.querySelector('form'));

// Check phone value
console.log('Phone value:', document.querySelector('input[type="tel"]')?.value);

// Check button exists
console.log('Button exists:', !!document.querySelector('button:has(span:contains("Check"))'));

// Check if lookupBeneficiary exists
console.log('Function exists:', typeof lookupBeneficiary);
```

---

## Expected Full Console Output

```
🚀 IncidentForm mounted - initializing...
📋 Props: { formId: "incident-form", hasInitialData: false, ... }
🚀 GET /api/admin/categories?type=incident
🚀 GET /api/admin/beneficiaries?status=active&limit=1000
🚀 GET /api/admin/regions?limit=1000
✅ GET /api/admin/categories - 200
✅ GET /api/admin/regions - 200
✅ GET /api/admin/beneficiaries - 200

[User types phone and clicks Check]

🖱️ Check button clicked!
📱 Current phone value: 255788114830
🎯 lookupBeneficiary CALLED with: 255788114830
📏 Phone length: 12
🔍 Starting lookup for phone: 255788114830
🚀 GET /api/admin/beneficiaries/lookup?phone_number=255788114830
📞 Lookup response: { success: true, exists: true, data: {...} }
✅ Beneficiary found: { first_name: "Mrisho", last_name: "Salum", ... }
✅ Form auto-populated with: { name: "Mrisho Salum", phone: "255788114830" }
✅ GET /api/admin/beneficiaries/lookup - 200
```

---

## Network Tab Inspection

1. Open F12 → Network tab
2. Filter: XHR or Fetch
3. Click "Check" button
4. Look for request to `lookup?phone_number=...`

**Expected:**
- **Status:** 200 OK
- **Method:** GET
- **URL:** /api/admin/beneficiaries/lookup?phone_number=255788114830
- **Response:** JSON with beneficiary data

**If request is missing:**
- Function isn't calling the API
- Check Console logs

**If request fails (red):**
- Click on request
- Check Response tab for error message
- Check Headers tab for status code

---

## After Testing

Share these details:

1. **What logs do you see?** (copy from Console)
2. **What's in Network tab?** (screenshot or describe)
3. **Any errors?** (red text in Console)
4. **Phone number used:** (e.g., 255788114830)
5. **Button disabled?** (is Check button clickable?)

This will help identify exactly where the issue is!
