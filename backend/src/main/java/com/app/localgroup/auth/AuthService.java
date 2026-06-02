package com.app.localgroup.auth;

import com.app.localgroup.auth.exception.UnauthorizedException;
import com.app.localgroup.common.Constants;
import com.app.localgroup.user.model.User;
import com.app.localgroup.user.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * AuthService for OTP-based authentication.
 * 
 * DEMO MODE IMPLEMENTATION:
 * This service operates in demo/testing mode where:
 * - OTPs are logged to console and returned in API responses
 * - Email delivery is disabled
 * - This is intended for project evaluation and recruiter demonstrations
 * 
 * For production use, implement proper email/SMS delivery and remove OTP from responses.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    // In-memory OTP store for MVP
    // key -> OTP + timestamp
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    private static final long OTP_EXPIRY_SECONDS = 300; // 5 minutes

    public String generateOtp(String email, String phone) {
        // Check if this is the mock account
        boolean isMockAccount = Constants.MOCK_ACCOUNT_EMAIL.equals(email) && 
                                Constants.MOCK_ACCOUNT_PHONE.equals(phone);
        
        String otp = isMockAccount ? Constants.MOCK_ACCOUNT_OTP : 
                     String.valueOf((int) (Math.random() * 900000) + 100000);
        
        otpStore.put(key(email, phone), new OtpEntry(otp, Instant.now()));
        
        // DEMO MODE: Log OTP to console for display in UI
        if (isMockAccount) {
            log.info("===============================================================");
            log.info("DEMO MODE - OTP GENERATED FOR MOCK ACCOUNT");
            log.info("Email: {}", email);
            log.info("Phone: {}", phone);
            log.info("OTP: {}", otp);
            log.info("===============================================================");
        } else {
            log.info("===============================================================");
            log.info("DEMO MODE - OTP GENERATED");
            log.info("Email: {}", email);
            log.info("Phone: {}", phone);
            log.info("OTP: {}", otp);
            log.info("===============================================================");
        }
        
        return otp;
    }

    public String verifyOtpAndIssueToken(String email, String phone, String otp) {
        String mapKey = key(email, phone);
        
        // Check if this is the mock account
        boolean isMockAccount = Constants.MOCK_ACCOUNT_EMAIL.equals(email) && 
                                Constants.MOCK_ACCOUNT_PHONE.equals(phone);
        
        if (isMockAccount) {
            // For mock account, validate against the static mock OTP
            if (!Constants.MOCK_ACCOUNT_OTP.equals(otp)) {
                log.warn("DEMO: Invalid OTP for mock account - received: {}", otp);
                throw new UnauthorizedException("Invalid OTP");
            }
            log.info("DEMO: OTP verified for mock account");
        } else {
            // Normal OTP validation flow (demo mode)
            OtpEntry entry = otpStore.get(mapKey);

            if (entry == null) {
                log.warn("OTP verification failed: No OTP found for email: {}, phone: {}", email, phone);
                throw new UnauthorizedException("Invalid OTP");
            }

            if (!entry.otp().equals(otp)) {
                log.warn("OTP verification failed: Invalid OTP for email: {}, phone: {}", email, phone);
                throw new UnauthorizedException("Invalid OTP");
            }

            if (Instant.now().isAfter(entry.createdAt().plusSeconds(OTP_EXPIRY_SECONDS))) {
                otpStore.remove(mapKey);
                log.warn("OTP verification failed: OTP expired for email: {}, phone: {}", email, phone);
                throw new UnauthorizedException("OTP expired");
            }
        }

        try {
            User user = userRepository.findByEmail(email)
                    .map(existing -> {
                        if (!existing.getPhone().equals(phone)) {
                            log.warn("Email/phone mismatch: email={}, existing phone={}, provided phone={}", 
                                    email, existing.getPhone(), phone);
                            throw new UnauthorizedException("Email and phone mismatch");
                        }
                        if (isMockAccount) {
                            log.info("DEMO: Mock account authenticated");
                        } else {
                            log.info("Existing user verified: {}", email);
                        }
                        return existing;
                    })
                    .orElseGet(() -> {
                        User newUser = userRepository.save(
                                User.builder()
                                        .email(email)
                                        .phone(phone)
                                        .verified(true)
                                        .trustScore(0)
                                        .build()
                        );
                        if (isMockAccount) {
                            log.info("DEMO: Mock account created and verified");
                        } else {
                            log.info("New user created and verified: {}", email);
                        }
                        return newUser;
                    });

            Key signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

            String jwt = Jwts.builder()
                    .setSubject(user.getId())
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                    .claim("email", user.getEmail())
                    .claim("phone", user.getPhone())
                    .signWith(signingKey, SignatureAlgorithm.HS256)
                    .compact();

            if (!isMockAccount) {
                otpStore.remove(mapKey);
            }
            
            log.info("JWT issued successfully for user: {}", email);
            return jwt;
        } catch (Exception ex) {
            log.error("Error during OTP verification or JWT generation: ", ex);
            throw ex;
        }
    }

    private String key(String email, String phone) {
        return email + "|" + phone;
    }

    private record OtpEntry(String otp, Instant createdAt) {}
}
