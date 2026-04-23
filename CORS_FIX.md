# 🔗 CORS Configuration Guide

## Problem You Just Fixed

**Error:**
```
Access to fetch at 'https://social-coordination-platform.onrender.com/places/nearby...' 
from origin 'https://meetspots.netlify.app' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Root Cause:**
Your backend had a CORS configuration issue:
```java
// ❌ WRONG - This doesn't work when allowCredentials=true
configuration.setAllowedOriginPatterns(List.of("*"));
configuration.setAllowCredentials(true);
```

**CORS Security Rule:**
> When `allowCredentials=true` (for JWT tokens), you **CANNOT** use wildcard `"*"`. You must explicitly list allowed origins.

---

## Solution Applied

**[SecurityConfig.java](backend/src/main/java/com/app/localgroup/config/SecurityConfig.java)** Updated:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // ✅ CORRECT - Explicit origins when credentials are allowed
    configuration.setAllowedOrigins(List.of(
        "http://localhost:3000",        // Local dev
        "http://localhost:5173",        // Vite alt port
        "https://meetspots.netlify.app" // Production
    ));
    
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L); // Cache preflight for 1 hour

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

## How CORS Works

### 1. Browser Sends Preflight Request (OPTIONS)
```
OPTIONS /places/nearby
Origin: https://meetspots.netlify.app
Access-Control-Request-Method: GET
```

### 2. Backend Responds with CORS Headers
```
Access-Control-Allow-Origin: https://meetspots.netlify.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: *
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

### 3. Browser Allows Actual Request
If headers match, browser sends the real request.

---

## Adding New Origins

If you deploy frontend to a new domain, add it here:

```java
configuration.setAllowedOrigins(List.of(
    "http://localhost:3000",
    "http://localhost:5173",
    "https://meetspots.netlify.app",
    "https://new-domain.com"  // ← Add new frontend URL
));
```

Then rebuild and redeploy:
```bash
./mvnw clean package
# Deploy to Render
git add .
git commit -m "CORS: Add new frontend domain"
git push
```

---

## Troubleshooting

### Still Getting CORS Error?

**Step 1: Clear Browser Cache**
```
Chrome DevTools → Network → Disable Cache
Then refresh page
```

**Step 2: Check Exact Frontend URL**
```javascript
// In browser console
console.log(window.location.origin)
// Copy exact URL and add to SecurityConfig
```

**Step 3: Verify Backend Deployment**
Check Render logs to confirm the updated SecurityConfig is deployed:
```
git push
# Wait 2-3 minutes for Render to rebuild
```

**Step 4: Test with curl**
```bash
curl -X GET https://social-coordination-platform.onrender.com/places/nearby \
  -H "Origin: https://meetspots.netlify.app" \
  -v
# Look for: Access-Control-Allow-Origin header in response
```

### Wildcard Origins Don't Work?

❌ **This won't work:**
```java
configuration.setAllowedOrigins(List.of("*")); // ← WRONG
configuration.setAllowCredentials(true);       // Can't mix!
```

✅ **Use this instead:**
```java
configuration.setAllowedOrigins(List.of("https://example.com"));
configuration.setAllowCredentials(true);
```

---

## CORS Configuration Reference

| Setting | What It Does |
|---------|-------------|
| `setAllowedOrigins()` | Which domains can access the API |
| `setAllowedMethods()` | Which HTTP methods are allowed |
| `setAllowedHeaders()` | Which request headers are allowed |
| `setAllowCredentials(true)` | Allow JWT/cookies to be sent |
| `setMaxAge()` | Cache preflight for N seconds |

---

## Common CORS Scenarios

### Local Development
```java
List.of("http://localhost:3000", "http://localhost:5173")
```

### Production
```java
List.of("https://yourdomain.com")
```

### Multiple Frontends
```java
List.of(
    "http://localhost:3000",
    "https://app.yourdomain.com",
    "https://admin.yourdomain.com"
)
```

### Development + Production
```java
List.of(
    "http://localhost:3000",
    "http://localhost:5173",
    "https://yourdomain.com"
)
```

---

## Security Notes

⚠️ **DO NOT do this in production:**
```java
// ❌ NEVER use wildcard with credentials
configuration.setAllowedOriginPatterns(List.of("*"));
configuration.setAllowCredentials(true);
```

✅ **Always be specific:**
```java
// ✅ Only allow trusted domains
configuration.setAllowedOrigins(List.of("https://trusted-domain.com"));
configuration.setAllowCredentials(true);
```

---

## Next Steps

1. **Rebuild & Deploy:**
   ```bash
   git add backend/src/main/java/com/app/localgroup/config/SecurityConfig.java
   git commit -m "Fix: CORS configuration for production"
   git push
   # Render will auto-rebuild in 2-3 minutes
   ```

2. **Test in Browser:**
   - Go to https://meetspots.netlify.app
   - Open DevTools → Console
   - Try fetching nearby places
   - Check that you see data (not CORS error)

3. **Monitor Logs:**
   - Check Render deployment logs
   - No more CORS-related errors should appear

---

## References

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Spring Boot CORS](https://spring.io/guides/gs/rest-service-cors/)
- [Common CORS Issues](https://developer.chrome.com/blog/private-network-access-preflight/)
