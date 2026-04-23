# 📧 OTP Email Integration - Quick Reference

## What Changed?

| What | Before | After |
|------|--------|-------|
| **OTP Sending** | Only logged to console | Logged + sent to email |
| **Email Service** | ❌ None | ✅ EmailService (JavaMailSender) |
| **Error Handling** | Would break login if issue | Continues login, logs error |
| **Credentials** | Hardcoded in yaml | Environment variables |
| **Configuration** | Minimal | Full SMTP config |

---

## 🚀 Quick Setup (5 minutes)

```bash
# 1. Create .env file
cd backend
cp .env.example .env

# 2. Edit .env with your Gmail credentials
# SPRING_MAIL_USERNAME=your-email@gmail.com
# SPRING_MAIL_PASSWORD=xxxx xxxx xxxx xxxx (App Password from Google)

# 3. Install dependencies
./mvnw clean install

# 4. Run and test
export $(cat .env | xargs)
./mvnw spring-boot:run

# 5. Test OTP endpoint
curl -X POST http://localhost:8080/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","phone":"+1234567890"}'
```

---

## 📝 Code Integration Summary

### 1. EmailService (NEW)
**Location:** `src/main/java/com/app/localgroup/email/EmailService.java`

```java
@Service
public class EmailService {
    public void sendOtpEmail(String toEmail, String otp) {
        // Sends email with OTP
    }
}
```

### 2. AuthService (MODIFIED)
**Method:** `generateOtp()`

**Before:**
```java
public String generateOtp(String email, String phone) {
    String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
    otpStore.put(key(email, phone), new OtpEntry(otp, Instant.now()));
    log.debug("OTP generated...", otp);
    return otp;
}
```

**After:**
```java
public String generateOtp(String email, String phone) {
    String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
    otpStore.put(key(email, phone), new OtpEntry(otp, Instant.now()));
    log.debug("OTP generated...", otp);
    
    // ✨ NEW CODE ✨
    try {
        emailService.sendOtpEmail(email, otp);  // <-- Send email
    } catch (Exception ex) {
        log.error("Failed to send email, but continuing...", ex);
        // Don't throw - login flow continues
    }
    
    return otp;
}
```

### 3. AuthController (MODIFIED)
**Endpoint:** `POST /auth/request-otp`

Response updated to: `"OTP generated successfully and sent to your email"`

---

## 🔧 Configuration Files

### application.yaml
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${SPRING_MAIL_USERNAME}
    password: ${SPRING_MAIL_PASSWORD}
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true
      mail.smtp.starttls.required: true
```

### pom.xml
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

### .env (local)
```env
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

---

## 📧 Email Template

**Subject:** Your MeetSpot OTP

**Body:**
```
Your OTP is: 123456

It expires in 5 minutes.

If you didn't request this OTP, please ignore this email.
```

---

## ✅ Key Features

✅ **Non-Blocking:** Email failure doesn't break login  
✅ **Secure:** Credentials in environment variables only  
✅ **Debuggable:** OTP still logged for dev testing  
✅ **Gmail Integration:** Uses Gmail SMTP (smtp.gmail.com:587)  
✅ **Graceful Degradation:** Continues if email service fails  
✅ **Production Ready:** Proper exception handling and logging  

---

## 🎯 Deployment Checklist

- [ ] Generated Gmail App Password (not regular password)
- [ ] Set `SPRING_MAIL_USERNAME` in Render Environment
- [ ] Set `SPRING_MAIL_PASSWORD` in Render Environment
- [ ] Rebuilt and redeployed application
- [ ] Tested OTP endpoint on Render
- [ ] Email received successfully
- [ ] Verified OTP works for login

---

## 🐛 Debug Commands

**View mail configuration:**
```bash
# Add to application.yaml temporarily to debug
logging:
  level:
    org.springframework.mail: DEBUG
```

**Monitor email logs:**
```bash
# On Render, check build/deployment logs
# Should see: "OTP email sent successfully to: user@example.com"
```

**Test SMTP connection locally:**
```bash
telnet smtp.gmail.com 587
```

---

## 📚 Full Documentation
See [EMAIL_SETUP.md](EMAIL_SETUP.md) for comprehensive guide with troubleshooting.
