import { apiClient } from '../api/client';

export const groupService = {
    async create(groupData) {
        return apiClient('/groups', {
            method: 'POST',
            body: groupData,
        });
    },

    async join(groupId) {
        return apiClient(`/groups/${groupId}/join`, {
            method: 'POST',
        });
    },

    async joinPrivate(groupId, inviteCode) {
        return apiClient(`/groups/${groupId}/join-private?inviteCode=${encodeURIComponent(inviteCode)}`, {
            method: 'POST',
        });
    },

    async leave(groupId) {
        return apiClient(`/groups/${groupId}/leave`, {
            method: 'POST',
        });
    },

    async confirm(groupId) {
        return apiClient(`/groups/${groupId}/confirm`, {
            method: 'POST',
        });
    },
};
