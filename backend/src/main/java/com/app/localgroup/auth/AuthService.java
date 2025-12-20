package com.app.localgroup.auth;

import com.app.localgroup.user.model.User;
import com.app.localgroup.user.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Instant;
import java.util.Base64;
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

    // In-memory OTP store for MVP (email+phone -> otp)
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();

    public String generateOtp(String email, String phone) {
        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
        otpStore.put(key(email, phone), otp);
        return otp;
    }

    public String verifyOtpAndIssueToken(String email, String phone, String otp) {
        String stored = otpStore.get(key(email, phone));
        if (stored == null || !stored.equals(otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User u = User.builder().email(email).phone(phone).verified(true).build();
            return userRepository.save(u);
        });
        // build JWT
        Key key = Keys.hmacShaKeyFor(Base64.getEncoder().encode(jwtSecret.getBytes()));
        String jwt = Jwts.builder()
                .setSubject(user.getId())
                .setIssuedAt(Date.from(Instant.now()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .claim("email", user.getEmail())
                .claim("phone", user.getPhone())
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        otpStore.remove(key(email, phone));
        return jwt;
    }

    private String key(String email, String phone) {
        return email + "|" + phone;
    }
}
