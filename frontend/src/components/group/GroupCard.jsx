import { useEffect, useState } from 'react';
import { Users, Clock, CalendarDays, Check, Edit3 } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
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
    const { isAuthenticated, user } = useAuth();
    const toast = useToast();
    const [joining, setJoining] = useState(false);
    const [localJoined, setLocalJoined] = useState(isJoined);
    const [confirmed, setConfirmed] = useState(group.confirmed || false);
    const [localMemberCount, setLocalMemberCount] = useState(group.memberCount || 1);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editDateTime, setEditDateTime] = useState(group.dateTime ? group.dateTime.slice(0, 16) : '');
    const [editMaxSize, setEditMaxSize] = useState(group.maxSize || 2);
    const [updating, setUpdating] = useState(false);

    const isAdmin = user?.id === group.creatorId;

    useEffect(() => {
        setEditDateTime(group.dateTime ? group.dateTime.slice(0, 16) : '');
        setEditMaxSize(group.maxSize || 2);
        setLocalMemberCount(group.memberCount || 1);
        setConfirmed(group.confirmed || false);
    }, [group]);

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
            setConfirmed(true);
            window.dispatchEvent(new CustomEvent('group-confirmed', { detail: { groupId: group.id } }));
            toast.success('Attendance confirmed!');
            onGroupChange?.();
        } catch (err) {
            toast.error(err.message || 'Failed to confirm');
        }
    };

    const handleUpdate = async () => {
        if (!editDateTime && !editMaxSize) {
            toast.error('Specify date/time or size to update');
            return;
        }
        const payload = {};
        if (editDateTime) payload.dateTime = new Date(editDateTime).toISOString();
        if (editMaxSize && editMaxSize > 0) payload.maxSize = Number(editMaxSize);

        setUpdating(true);
        try {
            await groupService.update(group.id, payload);
            toast.success('Group updated successfully!');
            setIsEditOpen(false);
            onGroupChange?.();
        } catch (err) {
            toast.error(err.message || 'Update failed');
        } finally {
            setUpdating(false);
        }
    };

    const isAlreadyJoined = localJoined || isJoined || confirmed;

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
                {isAdmin && (group.status === 'CREATED' || group.status === 'JOINABLE') && (
                    <Button size="sm" variant="secondary" icon={<Edit3 size={14} />} onClick={() => setIsEditOpen(true)}>
                        Edit Group
                    </Button>
                )}
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
                {group.status === 'CONFIRMATION' && !confirmed && (
                    <Button size="sm" variant="secondary" onClick={handleConfirm}>Confirm</Button>
                )}
                {group.status === 'CONFIRMATION' && confirmed && (
                    <Badge variant="success" size="md">
                        <Check size={14} style={{ marginRight: 4 }} /> Confirmed
                    </Badge>
                )}
                {group.status === 'ACTIVE' && (
                    <Badge variant="success" size="md">● Live</Badge>
                )}
            </div>
            {group.status === 'CONFIRMATION' && (
                <div className="group-card-confirmation-progress">
                    Confirmed {group.confirmationConfirmedCount || 0} / {group.confirmationEligibleCount || 0} eligible users
                </div>
            )}
            {(group.status === 'CONFIRMATION' || group.status === 'ACTIVE') && group.members && group.members.length > 0 && (
                <div className="group-card-active-members">
                    <h4>Members</h4>
                    <div className="group-card-active-members-list">
                        {group.members.map((member) => (
                            <div key={member.userId} className="group-card-member-item">
                                <div>{member.name || member.userId}</div>
                                <div>Trust: {member.trustScore}</div>
                                <div>Trips: {member.totalTrips}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Group">
                <div className="form-row">
                    <label>Date & Time</label>
                    <input
                        type="datetime-local"
                        value={editDateTime}
                        onChange={(e) => setEditDateTime(e.target.value)}
                    />
                </div>
                <div className="form-row">
                    <label>Group Size</label>
                    <input
                        type="number"
                        min="2"
                        max="6"
                        value={editMaxSize}
                        onChange={(e) => setEditMaxSize(e.target.value)}
                    />
                </div>
                <div className="modal-actions">
                    <Button size="sm" onClick={() => setIsEditOpen(false)} variant="default">Cancel</Button>
                    <Button size="sm" onClick={handleUpdate} loading={updating} disabled={updating}>Save</Button>
                </div>
            </Modal>
        </div>
    );
}
