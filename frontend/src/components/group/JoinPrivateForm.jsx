import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Lock } from 'lucide-react';
import { groupService } from '../../services/groupService';
import { useToast } from '../../context/ToastContext';

export default function JoinPrivateForm({ isOpen, onClose }) {
    const toast = useToast();
    const [groupId, setGroupId] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupId || !code) return;
        setLoading(true);
        try {
            await groupService.joinPrivate(groupId, code);
            toast.success('Joined private group!');
            onClose();
        } catch (err) {
            toast.error(err.message || 'Invalid group ID or code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Join Private Group" size="sm">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    Enter the group ID and invite code shared by your friend.
                </p>
                <Input
                    label="Group ID"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    placeholder="e.g. 507f1f77bcf86cd799439011"
                    required
                />
                <Input
                    label="Invite Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter invite code"
                    icon={<Lock size={18} />}
                    required
                />
                <Button type="submit" fullWidth loading={loading} size="lg">
                    Join Group
                </Button>
            </form>
        </Modal>
    );
}
