import { apiClient } from '../api/client';

export const userService = {
    async getProfile() {
        return apiClient('/users/me');
    },

    async updateProfile(profileData) {
        return apiClient('/users/profile', {
            method: 'PATCH',
            body: profileData,
        });
    },

    async getPublicProfile(userId) {
        return apiClient(`/users/${userId}`);
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
