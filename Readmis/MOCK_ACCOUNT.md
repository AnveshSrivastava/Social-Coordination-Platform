# Mock/Demo Account Setup

## Overview
A mock account has been created for testing and demo purposes. This allows recruiters, testers, and users to explore the application without needing to use their actual phone number or email.

---

## Demo Credentials

| Field | Value |
|-------|-------|
| **Email** | `mock@sca.com` |
| **Phone** | `9999999999` |
| **OTP** | `000000` |

---

## How to Use

### Frontend
1. Open the application and click on the **Sign In** button
2. You'll see the login modal with two options:
   - **Manual Entry**: Enter credentials manually
   - **Try Demo First**: Click the "Use Demo Account" button (Recommended)

3. When you click "Use Demo Account":
   - The demo email and phone number are automatically filled
   - An OTP request is sent to the backend
   - The OTP field is automatically set to `000000`
   - Click "Verify & Sign In" to complete authentication

4. You're now logged in as the demo user and can explore the app!

---

## Backend Implementation

### Authentication Flow
The mock account has special handling in the authentication service:

1. **OTP Generation** (`AuthService.generateOtp`)
   - For mock account: Returns `000000` instead of generating a random OTP
   - Email notification is skipped for mock account

2. **OTP Verification** (`AuthService.verifyOtpAndIssueToken`)
   - For mock account: Validates against the static OTP `000000`
   - OTP expiry check is bypassed for mock account
   - JWT token is issued just like regular users

### Constants
Mock account credentials are defined in [Constants.java](backend/src/main/java/com/app/localgroup/common/Constants.java):

```java
public static final String MOCK_ACCOUNT_EMAIL = "mock@sca.com";
public static final String MOCK_ACCOUNT_PHONE = "9999999999";
public static final String MOCK_ACCOUNT_OTP = "000000";
```

### Separation from Production
- Mock account logic is clearly separated with conditional checks
- The mock account does NOT bypass normal user creation and authorization flows
- The mock account is treated as a regular user after authentication
- All logging includes "DEMO" prefix for easy identification

---

## What Can the Demo User Do?

Once logged in as the demo user, you can:
- ✅ Explore all features of the application
- ✅ Create and join groups
- ✅ View the map and places
- ✅ Send chat messages
- ✅ Report safety events
- ✅ Access profile settings
- ✅ Use all UI components

---

## Important Notes

1. **For Testing Only**: This account should only be used for testing and demo purposes.

2. **Production Environment**: In production, the mock account credentials will still be valid unless explicitly disabled.

3. **Security**: The mock OTP (`000000`) is intentionally simple and non-random for easy testing.

4. **Data Persistence**: The demo user account is stored in the database like any other user. Be mindful when running tests.

5. **Shared Access**: Since credentials are public, the demo account may have multiple users accessing it simultaneously.

---

## Technical Details

### Files Modified

**Backend:**
- [Constants.java](backend/src/main/java/com/app/localgroup/common/Constants.java) - Added mock account constants
- [AuthService.java](backend/src/main/java/com/app/localgroup/auth/AuthService.java) - Added mock account handling in `generateOtp()` and `verifyOtpAndIssueToken()`

**Frontend:**
- [LoginModal.jsx](frontend/src/components/auth/LoginModal.jsx) - Added demo section with credentials and auto-fill button
- [LoginModal.css](frontend/src/components/auth/LoginModal.css) - Added styling for demo section

---

## Logging

When the demo account is used, special logging is added with "DEMO" prefix:
- `DEMO: OTP requested for mock account...`
- `DEMO: OTP verified for mock account`
- `DEMO: Mock account authenticated`
- `DEMO: Mock account created and verified`

You can search for "DEMO" in application logs to track demo account usage.

---

## Future Enhancements

Consider these improvements if needed:
1. Add environment variable to disable mock account in production
2. Add rate limiting specifically for mock account
3. Track demo account usage metrics
4. Add admin dashboard to view demo account activity
5. Automatically reset demo account data periodically
