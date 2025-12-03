# API Configuration Update

## ✅ Changes Made

The frontend dashboard has been updated to use the production API at `https://api.thebackend.in`.

### Files Updated:

1. **`src/lib/api/client.ts`**
   - Updated default API URL from `http://localhost:4000` to `https://api.thebackend.in`
   - Now uses: `process.env.NEXT_PUBLIC_API_URL || 'https://api.thebackend.in'`

2. **`src/components/layout/Sidebar.tsx`**
   - Updated API docs link to use production URL
   - Now uses: `process.env.NEXT_PUBLIC_API_URL || 'https://api.thebackend.in'`

---

## Configuration

### Production (Default)

The dashboard now defaults to the production API:
- **API URL:** `https://api.thebackend.in`
- **Full API Base:** `https://api.thebackend.in/api/v1`

No configuration needed - it works out of the box!

### Local Development

If you want to use a local backend during development, create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Note:** `.env.local` is gitignored, so it won't be committed to the repository.

### Environment Variables

The dashboard uses Next.js environment variables:

- **Variable:** `NEXT_PUBLIC_API_URL`
- **Default:** `https://api.thebackend.in`
- **Usage:** Set in `.env.local` for local development

---

## Testing

After updating, verify the dashboard connects to the production API:

1. **Check Network Tab:**
   - Open browser DevTools → Network tab
   - Navigate through the dashboard
   - Verify API calls go to `https://api.thebackend.in/api/v1/...`

2. **Test Login:**
   - Try logging in with valid credentials
   - Should authenticate against production API

3. **Test API Docs Link:**
   - Click "API Docs" in the sidebar
   - Should open: `https://api.thebackend.in/api/docs`

---

## Deployment

### For Production Deployment:

No changes needed! The default is already set to production.

### For Different Environments:

Set the environment variable in your deployment platform:

**Vercel:**
- Go to Project Settings → Environment Variables
- Add: `NEXT_PUBLIC_API_URL` = `https://api.thebackend.in`

**Cloud Run / Docker:**
- Set in environment variables:
  ```bash
  NEXT_PUBLIC_API_URL=https://api.thebackend.in
  ```

**Other Platforms:**
- Set `NEXT_PUBLIC_API_URL` environment variable to your API URL

---

## Summary

✅ **Production API:** `https://api.thebackend.in` (default)  
✅ **Local Development:** Set `NEXT_PUBLIC_API_URL=http://localhost:4000` in `.env.local`  
✅ **All API calls:** Now point to production by default  
✅ **Backward Compatible:** Can still override with environment variable

---

**Last Updated:** 2025-12-03  
**API Endpoint:** `https://api.thebackend.in/api/v1`

