import { useState } from 'react';
import { Users, Clock, CalendarDays, Check } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { groupService } from '../../services/groupService';
import { useToast } from '../../context/ToastContext';
import './GroupCard.css';

const STATUS_MAP = {
    JOINABLE: { label: 'Open', variant: 'success' },
    CONFIRMATION: { label: 'Confirming', variant: 'warning' },
    ACTIVE: { label: 'Active', variant: 'primary' },
    EXPIRED: { label: 'Expired', variant: 'default' },
    CREATED: { label: 'New', variant: 'primary' },
};

export default function GroupCard({ group, onLoginRequired, compact = false, onGroupChange, isJoined = false }) {
    const { isAuthenticated } = useAuth();
    const toast = useToast();
    const [joining, setJoining] = useState(false);
    const [localJoined, setLocalJoined] = useState(isJoined);
    const [localMemberCount, setLocalMemberCount] = useState(group.memberCount || 1);

    const status = STATUS_MAP[group.status] || STATUS_MAP.CREATED;
    const dateStr = group.dateTime
        ? new Date(group.dateTime).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
        })
        : 'TBD';

    const handleJoin = async () => {
        // Pre-flight auth check — prevent 400/401 by showing login modal
        if (!isAuthenticated || !localStorage.getItem('jwt_token')) {
            onLoginRequired?.();
            return;
        }
        setJoining(true);
        try {
            await groupService.join(group.id);
            // Optimistic UI update
            setLocalJoined(true);
            setLocalMemberCount((c) => c + 1);
            toast.success('Joined group successfully!');
            onGroupChange?.();
        } catch (err) {
            const msg = err.status === 400
                ? 'Could not join — you may already be a member or the group is full.'
                : (err.message || 'Failed to join group');
            toast.error(msg);
        } finally {
            setJoining(false);
        }
    };

    const handleConfirm = async () => {
        try {
            await groupService.confirm(group.id);
            toast.success('Attendance confirmed!');
            onGroupChange?.();
        } catch (err) {
            toast.error(err.message || 'Failed to confirm');
        }
    };

    const isAlreadyJoined = localJoined || isJoined;

    return (
        <div className={`group-card ${compact ? 'group-card--compact' : ''}`}>
            <div className="group-card-top">
                <Badge variant={status.variant}>{status.label}</Badge>
                <Badge variant={group.visibility === 'PRIVATE' ? 'warning' : 'default'}>
                    {group.visibility === 'PRIVATE' ? '🔒 Private' : 'Public'}
                </Badge>
            </div>
            <div className="group-card-info">
                <div className="group-card-detail">
                    <CalendarDays size={14} />
                    <span>{dateStr}</span>
                </div>
                <div className="group-card-detail">
                    <Users size={14} />
                    <span>{localMemberCount}/{group.maxSize} members</span>
                </div>
            </div>
            <div className="group-card-actions">
                {group.status === 'JOINABLE' && !isAlreadyJoined && (
                    <Button size="sm" onClick={handleJoin} loading={joining} disabled={joining}>
                        Join Group
                    </Button>
                )}
                {group.status === 'JOINABLE' && isAlreadyJoined && (
                    <Badge variant="success" size="md">
                        <Check size={14} style={{ marginRight: 4 }} /> Joined
                    </Badge>
                )}
                {group.status === 'CONFIRMATION' && (
                    <Button size="sm" variant="secondary" onClick={handleConfirm}>Confirm</Button>
                )}
                {group.status === 'ACTIVE' && (
                    <Badge variant="success" size="md">● Live</Badge>
                )}
            </div>
        </div>
    );
}
