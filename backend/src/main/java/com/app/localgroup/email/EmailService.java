package com.app.localgroup.email;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender javaMailSender;

    /**
     * Sends OTP email to the specified recipient
     * 
     * @param toEmail The recipient email address
     * @param otp The one-time password
     * @throws Exception If email sending fails
     */
    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Your MeetSpot OTP");
            message.setText("Your OTP is: " + otp + "\n\nIt expires in 5 minutes.\n\n" +
                    "If you didn't request this OTP, please ignore this email.");
            message.setFrom("noreply@meetspot.com");

            javaMailSender.send(message);
            log.info("OTP email sent successfully to: {}", toEmail);
        } catch (Exception ex) {
            log.error("Failed to send OTP email to {}: {}", toEmail, ex.getMessage(), ex);
            throw new EmailSendingException("Failed to send OTP email", ex);
        }
    }

    /**
     * Custom exception for email sending failures
     */
    public static class EmailSendingException extends RuntimeException {
        public EmailSendingException(String message) {
            super(message);
        }

        public EmailSendingException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
