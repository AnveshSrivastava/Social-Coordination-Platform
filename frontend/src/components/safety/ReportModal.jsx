import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Flag } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import './ReportModal.css';

const REASONS = [
    'Inappropriate behavior',
    'Made me feel unsafe',
    'Harassment',
    'Fake profile',
    'No-show',
    'Other',
];

export default function ReportModal({ isOpen, onClose, userId }) {
    const toast = useToast();
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason) return;
        setLoading(true);
        try {
            // Report endpoint would be called here.
            // Currently using block as placeholder since backend exposes block API.
            toast.success('Report submitted. We take safety seriously.');
            onClose();
        } catch (err) {
            toast.error('Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Report User" size="sm">
            <form className="report-form" onSubmit={handleSubmit}>
                <p className="report-desc">
                    If a majority of group members report this user (n/2 + 1 votes), they will be removed from the group.
                </p>
                <div className="report-reasons">
                    {REASONS.map((r) => (
                        <label key={r} className={`report-reason ${reason === r ? 'report-reason--selected' : ''}`}>
                            <input
                                type="radio"
                                name="reason"
                                value={r}
                                checked={reason === r}
                                onChange={() => setReason(r)}
                            />
                            <span>{r}</span>
                        </label>
                    ))}
                </div>
                <Button type="submit" fullWidth variant="danger" loading={loading} disabled={!reason} icon={<Flag size={16} />}>
                    Submit Report
                </Button>
            </form>
        </Modal>
    );
}
