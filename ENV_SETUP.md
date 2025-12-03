# Environment Variables Setup

## ✅ No Hardcoded Backend URLs

All backend URLs are now loaded from environment variables. **No hardcoded URLs exist in the codebase.**

---

## Required Environment Variable

### `NEXT_PUBLIC_API_URL` (REQUIRED)

**Description:** The base URL of the backend API  
**Required:** Yes  
**Example:** `https://api.thebackend.in` or `http://localhost:4000`

---

## Setup Instructions

### Local Development

1. **Create `.env.local` file** in the `SNFY-Dashboard` directory:
   ```bash
   cd SNFY-Dashboard
   ```

2. **Add the environment variable:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

### Production Deployment

Set the environment variable in your deployment platform:

#### Vercel
1. Go to Project Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL` = `https://api.thebackend.in`
3. Redeploy

#### Cloud Run / Docker
Set in environment variables:
```bash
NEXT_PUBLIC_API_URL=https://api.thebackend.in
```

#### Other Platforms
Set `NEXT_PUBLIC_API_URL` environment variable to your API URL

---

## Error Handling

If `NEXT_PUBLIC_API_URL` is not set, the application will throw a clear error:

```
Error: NEXT_PUBLIC_API_URL environment variable is not set. 
Please set it in your .env.local file or deployment environment variables.
```

This ensures you catch configuration issues early.

---

## Files Updated

### ✅ Created
- `src/lib/api/config.ts` - Centralized API configuration utility
- `.env.example` - Example environment file (documentation)

### ✅ Updated
- `src/lib/api/client.ts` - Now uses `getApiBaseUrl()` from config
- `src/components/layout/Sidebar.tsx` - Now uses `getApiDocsUrl()` from config

### ✅ Removed
- All hardcoded backend URLs (`https://api.thebackend.in`, `http://localhost:4000`)

---

## Verification

To verify no hardcoded URLs exist:

```bash
# Search for hardcoded backend URLs
grep -r "api.thebackend.in\|localhost:4000" src/
# Should return no results (except in comments/docs)
```

---

## Summary

✅ **No hardcoded URLs** - All backend URLs come from environment variables  
✅ **Clear error messages** - Missing env var throws descriptive error  
✅ **Centralized configuration** - Single source of truth in `config.ts`  
✅ **Environment-specific** - Easy to switch between dev/prod  

---

**Last Updated:** 2025-12-03  
**Status:** ✅ All backend URLs now use environment variables

