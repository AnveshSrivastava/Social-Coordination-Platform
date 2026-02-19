import { AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import { groupService } from '../../services/groupService';
import { useToast } from '../../context/ToastContext';
import './ConfirmBanner.css';

export default function ConfirmBanner({ group }) {
    const toast = useToast();

    if (!group || group.status !== 'CONFIRMATION') return null;

    const handleConfirm = async () => {
        try {
            await groupService.confirm(group.id);
            toast.success('Attendance confirmed!');
        } catch (err) {
            toast.error(err.message || 'Failed to confirm');
        }
    };

    return (
        <div className="confirm-banner animate-fade-in-up">
            <div className="confirm-banner-icon">
                <AlertTriangle size={18} />
            </div>
            <div className="confirm-banner-content">
                <strong>Confirmation Required</strong>
                <p>Please confirm your attendance. Not confirming will reduce your trust score.</p>
            </div>
            <Button size="sm" onClick={handleConfirm}>Confirm Now</Button>
        </div>
    );
}
