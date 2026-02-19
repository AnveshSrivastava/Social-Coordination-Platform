import { apiClient } from '../api/client';

export const userService = {
    async getProfile() {
        return apiClient('/users/me');
    },

    async getTrustScore() {
        return apiClient('/users/trust-score');
    },

    async blockUser(userId) {
        return apiClient(`/users/block/${userId}`, {
            method: 'POST',
        });
    },
};
