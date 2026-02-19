import { Users, Clock, CalendarDays } from 'lucide-react';
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

export default function GroupCard({ group, onLoginRequired, compact = false }) {
    const { isAuthenticated } = useAuth();
    const toast = useToast();

    const status = STATUS_MAP[group.status] || STATUS_MAP.CREATED;
    const dateStr = group.dateTime
        ? new Date(group.dateTime).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
        })
        : 'TBD';

    const handleJoin = async () => {
        if (!isAuthenticated) {
            onLoginRequired?.();
            return;
        }
        try {
            await groupService.join(group.id);
            toast.success('Joined group successfully!');
        } catch (err) {
            toast.error(err.message || 'Failed to join group');
        }
    };

    const handleConfirm = async () => {
        try {
            await groupService.confirm(group.id);
            toast.success('Attendance confirmed!');
        } catch (err) {
            toast.error(err.message || 'Failed to confirm');
        }
    };

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
                    <span>{group.memberCount || 1}/{group.maxSize} members</span>
                </div>
            </div>
            <div className="group-card-actions">
                {group.status === 'JOINABLE' && (
                    <Button size="sm" onClick={handleJoin}>Join Group</Button>
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
