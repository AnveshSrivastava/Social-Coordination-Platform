import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { safetyService } from '../../services/safetyService';
import { useToast } from '../../context/ToastContext';
import './SOSButton.css';

export default function SOSButton({ group }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    if (!group || group.status !== 'ACTIVE') return null;

    const handleSOS = async () => {
        setLoading(true);
        try {
            await safetyService.triggerSOS(group.id);
            toast.warning('SOS triggered. Your trusted contacts have been notified.');
            setShowConfirm(false);
        } catch (err) {
            toast.error(err.message || 'Failed to trigger SOS');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button className="sos-fab" onClick={() => setShowConfirm(true)} title="SOS Emergency">
                <AlertTriangle size={22} />
                <span>SOS</span>
            </button>

            <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="⚠️ Trigger SOS" size="sm">
                <div className="sos-modal">
                    <div className="sos-warning">
                        <AlertTriangle size={32} />
                    </div>
                    <p className="sos-desc">
                        This will send your <strong>current location</strong> and a help message to your trusted contacts
                        and notify all group members.
                    </p>
                    <div className="sos-disclaimer">
                        <strong>⚖️ Disclaimer:</strong> MeetSpot is <strong>not an emergency service</strong> and does not
                        contact police, medical, or fire services. In a real emergency, call your local emergency number
                        (112 / 100 / 101).
                    </div>
                    <div className="sos-actions">
                        <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Button>
                        <Button variant="danger" loading={loading} onClick={handleSOS} icon={<AlertTriangle size={16} />}>
                            Send SOS
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
