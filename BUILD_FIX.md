# Build Fix - Environment Variable Handling

## Issue

The Docker build was failing because `NEXT_PUBLIC_API_URL` was required at build time but wasn't set, causing the build to fail with:
```
ERROR: build step 0 "gcr.io/cloud-builders/docker" failed
```

## Root Cause

The `getApiBaseUrl()` function was throwing an error if `NEXT_PUBLIC_API_URL` wasn't set, and this was being called at module load time during the Docker build process.

## Solution

### 1. Updated Dockerfile
Added build-time environment variable:
```dockerfile
ARG NEXT_PUBLIC_API_URL=https://api.thebackend.in
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
```

This ensures the environment variable is available during the build process.

### 2. Made Config Build-Safe
Updated `src/lib/api/config.ts` to handle build-time gracefully:
- During build/SSR (when `window === undefined`), returns a placeholder if env var isn't set
- At runtime (client-side), validates and throws error if not set

### 3. Made API Client Lazy-Load
Updated `src/lib/api/client.ts` to lazy-load the API base URL:
- Prevents immediate evaluation at module load time
- Only loads when actually needed

## Files Changed

- ✅ `Dockerfile` - Added build-time `NEXT_PUBLIC_API_URL`
- ✅ `src/lib/api/config.ts` - Made build-safe with placeholder fallback
- ✅ `src/lib/api/client.ts` - Made API URL lazy-loaded

## Build Process

### During Build:
1. Dockerfile sets `NEXT_PUBLIC_API_URL=https://api.thebackend.in` (or via build arg)
2. Next.js build process can access the env var
3. If not set, placeholder is used (prevents build failure)

### At Runtime:
1. Environment variable must be set (via Cloud Run env vars)
2. If not set, clear error is thrown
3. Actual API calls use the runtime environment variable

## Cloud Build Configuration

When building with Cloud Build, you can override the API URL:

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '--build-arg'
      - 'NEXT_PUBLIC_API_URL=https://api.thebackend.in'
      - '-t'
      - 'gcr.io/$PROJECT_ID/snfy-dashboard'
      - '.'
```

Or set it as a substitution variable:
```yaml
substitutions:
  _API_URL: 'https://api.thebackend.in'
```

## Cloud Run Environment Variable

**Important:** You still need to set `NEXT_PUBLIC_API_URL` in Cloud Run runtime environment variables:

```bash
gcloud run services update snfy-dashboard \
  --set-env-vars "NEXT_PUBLIC_API_URL=https://api.thebackend.in" \
  --region europe-west1
```

This ensures the correct API URL is used at runtime.

## Verification

After deployment:
1. Check build logs - should complete successfully
2. Check runtime logs - should show correct API URL being used
3. Test dashboard - should connect to production API

---

**Last Updated:** 2025-12-03  
**Status:** ✅ Build should now succeed










