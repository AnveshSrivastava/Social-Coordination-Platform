package com.app.localgroup.config.jwt;

import com.app.localgroup.common.Constants;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.Key;
import java.util.Base64;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader(Constants.AUTH_HEADER);
        if (StringUtils.hasText(header) && header.startsWith(Constants.TOKEN_PREFIX)) {
            String token = header.substring(Constants.TOKEN_PREFIX.length());
            try {
                Key key = Keys.hmacShaKeyFor(Base64.getEncoder().encode(jwtSecret.getBytes()));
                Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
                String userId = claims.getSubject();
                if (userId != null) {
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception ex) {
                log.warn("Failed to parse/validate JWT: {}", ex.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }
}
