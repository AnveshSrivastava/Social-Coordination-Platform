import { apiClient } from '../api/client';

export const authService = {
    async requestOtp(email, phone) {
        return apiClient('/auth/request-otp', {
            method: 'POST',
            body: { email, phone },
        });
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
