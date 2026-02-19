import { apiClient } from '../api/client';

export const placeService = {
    async getAll(category) {
        const params = category ? `?category=${category}` : '';
        return apiClient(`/places${params}`);
    },

    async getById(id) {
        return apiClient(`/places/${id}`);
    },

    async getNearby(lat, lng, radius = 1000) {
        return apiClient(`/places/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    },
};
