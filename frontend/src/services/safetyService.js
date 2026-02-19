import { apiClient } from '../api/client';

export const safetyService = {
    async triggerSOS(groupId) {
        return apiClient(`/safety/sos/${groupId}`, {
            method: 'POST',
        });
    },
};
