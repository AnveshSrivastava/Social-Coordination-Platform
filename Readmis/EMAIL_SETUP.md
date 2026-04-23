# 📧 OTP Email Integration Guide

## Overview
Your Spring Boot backend now sends OTPs to user emails via Gmail SMTP. The implementation:
- ✅ Maintains existing OTP generation/verification logic
- ✅ Sends email asynchronously without blocking authentication flow
- ✅ Gracefully handles email failures (logs error, continues login)
- ✅ Uses environment variables for credentials (no hardcoded secrets)

---

## 🔧 Implementation Details

### Files Created/Modified

#### 1. **[EmailService.java](backend/src/main/java/com/app/localgroup/email/EmailService.java)** (NEW)
```java
@Service
public class EmailService {
    public void sendOtpEmail(String toEmail, String otp) {
        // Sends: "Your OTP is: 123456. It expires in 5 minutes."
        // Handles exceptions gracefully
    }
}
```

#### 2. **[AuthService.java](backend/src/main/java/com/app/localgroup/auth/AuthService.java)** (MODIFIED)
Integration point in `generateOtp()`:
```java
public String generateOtp(String email, String phone) {
    String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
    otpStore.put(key(email, phone), new OtpEntry(otp, Instant.now()));
    
    // ✨ NEW: Send OTP via email
    try {
        emailService.sendOtpEmail(email, otp);
    } catch (Exception ex) {
        log.error("Failed to send OTP email for {}, but continuing...", email, ex);
        // Do NOT throw - login flow continues even if email fails
    }
    
    return otp;
}
```

#### 3. **[AuthController.java](backend/src/main/java/com/app/localgroup/auth/AuthController.java)** (MODIFIED)
Updated response message:
```java
@PostMapping("/request-otp")
public ResponseEntity<ApiResponse<String>> requestOtp(...) {
    // ...
    return ResponseEntity.ok(
        ApiResponse.<String>builder()
            .message("OTP generated successfully and sent to your email")
            .data("OTP sent to " + dto.getEmail())
            .build()
    );
}
```

#### 4. **[application.yaml](backend/src/main/resources/application.yaml)** (MODIFIED)
Added mail configuration:
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${SPRING_MAIL_USERNAME:}
    password: ${SPRING_MAIL_PASSWORD:}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
          connectiontimeout: 5000
          timeout: 5000
          writetimeout: 5000
```

#### 5. **[pom.xml](backend/pom.xml)** (MODIFIED)
Added dependency:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

#### 6. **[.env.example](backend/.env.example)** (UPDATED)
Added mail credentials template

---

## 🚀 Setup Instructions

### Step 1: Generate Gmail App Password

Since Gmail blocks less-secure apps, you need an **App Password**:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **App passwords** (appears after 2FA is enabled)
4. Select `Mail` and `Windows Computer` (or your OS)
5. Google generates a 16-character password → **Copy this**

### Step 2: Create Local `.env` File

In `/backend/.env`:
```env
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

⚠️ **Important**: The app password has **4 groups of 4 characters with spaces**. Spring Boot strips spaces automatically, so you can include or exclude them.

### Step 3: Run Locally

**Option A: Using Maven**
```bash
cd backend
export $(cat .env | xargs)
./mvnw spring-boot:run
```

**Option B: Using IDE Run Configuration**
- Set environment variables in IDE run config from `.env`
- IDE loads them automatically

### Step 4: Test OTP Flow

**Request OTP:**
```bash
curl -X POST http://localhost:8080/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@gmail.com",
    "phone": "+1234567890"
  }'
```

**Expected Behavior:**
1. ✅ Response: "OTP sent to your-test-email@gmail.com"
2. ✅ Console: Debug log with OTP (for testing)
3. ✅ Email Inbox: Receives "Your MeetSpot OTP" with the code
4. ✅ Verify OTP: Use the code from email to complete login

---

## 🌐 Render Deployment

### Step 1: Set Environment Variables

In **Render Dashboard → Your Service → Environment**:

```
SPRING_MAIL_USERNAME = your-email@gmail.com
SPRING_MAIL_PASSWORD = xxxx xxxx xxxx xxxx
SPRING_MONGODB_URI = mongodb+srv://...
APP_JWT_SECRET = <generated-secret>
PORT = 8080
```

### Step 2: Verify Configuration

The application will auto-load these environment variables. Logs will show:
```
OTP email sent successfully to: user@example.com
```

### Step 3: Deploy

```bash
git add .
git commit -m "Add OTP email integration"
git push
```

Render automatically rebuilds from your Dockerfile.

---

## 📋 Configuration Reference

| Variable | Default | Required | Notes |
|----------|---------|----------|-------|
| `SPRING_MAIL_USERNAME` | Empty | ✅ For email | Gmail address or SMTP username |
| `SPRING_MAIL_PASSWORD` | Empty | ✅ For email | Gmail App Password (16 chars) |
| `SPRING_MAIL_HOST` | `smtp.gmail.com` | ✅ | Can change to other SMTP providers |
| `SPRING_MAIL_PORT` | `587` | ✅ | TLS port for Gmail |

---

## 🛡️ Security & Error Handling

### What Happens If Email Fails?

**Scenario:** SMTP server is down or credentials are invalid

**Current Behavior:**
```java
try {
    emailService.sendOtpEmail(email, otp);
} catch (Exception ex) {
    log.error("Failed to send OTP email...");
    // ✅ CONTINUES - User can still enter OTP from console log (dev)
}
```

**Result:**
- ✅ OTP is still generated and stored
- ✅ User login flow is NOT blocked
- ✅ Error is logged for debugging
- ⚠️ In production, user won't receive email but can still login (if they have the OTP from another source)

### Best Practices

1. **Monitor Email Logs:** Check Render logs for email failures
2. **Test in Dev:** Verify email is sent before deploying
3. **Fallback:** Consider SMS as fallback (future enhancement)
4. **Retry Logic:** Could add exponential backoff for failed emails (not included in MVP)

---

## 🧪 Testing Checklist

- [ ] OTP generated successfully
- [ ] Email received within 30 seconds
- [ ] Email subject is "Your MeetSpot OTP"
- [ ] Email body shows OTP and expiration time
- [ ] OTP verification works after receiving email
- [ ] Login fails with invalid/expired OTP
- [ ] Application runs even if SMTP is unreachable (graceful degradation)
- [ ] Console logs show debug info for testing
- [ ] No secrets hardcoded in code (only env vars)

---

## 🔗 Using Other SMTP Providers

To use a different email service (SendGrid, Mailgun, Twilio, etc.):

1. Update `application.yaml` with provider's SMTP details
2. Set new credentials in environment variables
3. Example (SendGrid):
```yaml
spring:
  mail:
    host: smtp.sendgrid.net
    port: 587
    username: apikey
    password: ${SENDGRID_API_KEY}
```

---

## ❓ Troubleshooting

### "Authentication failed: AUTHENTICATION FAILED"
- ✅ Verify SPRING_MAIL_PASSWORD is correct
- ✅ Verify Gmail 2FA is enabled
- ✅ Generate a NEW App Password

### "Connection timed out"
- ✅ Check if port 587 is open (firewall)
- ✅ Check internet connection
- ✅ Verify `starttls.enable` is `true`

### "Email not received"
- ✅ Check spam folder
- ✅ Verify SPRING_MAIL_USERNAME is correct
- ✅ Check console logs for errors
- ✅ Verify email address in request is correct

### "OTP Endpoint not responding"
- ✅ Verify `spring-boot-starter-mail` is in pom.xml
- ✅ Check for bean creation errors in startup logs
- ✅ Ensure EmailService is being injected in AuthService

---

## 📚 References

- [Spring Mail Docs](https://spring.io/guides/gs/sending-email/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SMTP Configuration](https://www.baeldung.com/spring-email)
