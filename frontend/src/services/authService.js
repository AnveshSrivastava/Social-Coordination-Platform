import { apiClient } from '../api/client';

/**
 * DEMO MODE: Auth Service
 * This service handles OTP-based authentication in demo mode where
 * OTPs are returned directly in the API response for display in the UI.
 */
export const authService = {
    async requestOtp(email, phone) {
        const response = await apiClient('/auth/request-otp', {
            method: 'POST',
            body: { email, phone },
        });
        
        // Extract OTP from response for demo mode display
        if (response?.data?.otp) {
            return {
                ...response,
                otp: response.data.otp,
                email: email,
            };
        }
        
        return response;
    },

    async verifyOtp(email, phone, otp) {
        const response = await apiClient('/auth/verify-otp', {
            method: 'POST',
            body: { email, phone, otp },
        });
        if (response?.data) {
            localStorage.setItem('jwt_token', response.data);
        }
        return response;
    },

    getToken() {
        return localStorage.getItem('jwt_token');
    },

    isAuthenticated() {
        return !!localStorage.getItem('jwt_token');
    },

    logout() {
        localStorage.removeItem('jwt_token');
    },
};
