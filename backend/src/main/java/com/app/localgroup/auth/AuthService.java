package com.app.localgroup.auth;

import com.app.localgroup.auth.exception.UnauthorizedException;
import com.app.localgroup.user.model.User;
import com.app.localgroup.user.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

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
        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
        otpStore.put(key(email, phone), new OtpEntry(otp, Instant.now()));
        return otp;
    }

    public String verifyOtpAndIssueToken(String email, String phone, String otp) {
        String mapKey = key(email, phone);
        OtpEntry entry = otpStore.get(mapKey);

        if (entry == null || !entry.otp().equals(otp)) {
            throw new UnauthorizedException("Invalid OTP");
        }

        if (Instant.now().isAfter(entry.createdAt().plusSeconds(OTP_EXPIRY_SECONDS))) {
            otpStore.remove(mapKey);
            throw new UnauthorizedException("OTP expired");
        }

        User user = userRepository.findByEmail(email)
                .map(existing -> {
                    if (!existing.getPhone().equals(phone)) {
                        throw new UnauthorizedException("Email and phone mismatch");
                    }
                    return existing;
                })
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .email(email)
                                .phone(phone)
                                .verified(true)
                                .trustScore(0)
                                .build()
                ));

        Key signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        String jwt = Jwts.builder()
                .setSubject(user.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .claim("email", user.getEmail())
                .claim("phone", user.getPhone())
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();

        otpStore.remove(mapKey);
        return jwt;
    }

    private String key(String email, String phone) {
        return email + "|" + phone;
    }

    private record OtpEntry(String otp, Instant createdAt) {}
}
