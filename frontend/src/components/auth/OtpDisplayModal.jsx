import { Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import './OtpDisplayModal.css';

/**
 * DEMO MODE Component
 * 
 * This modal displays the generated OTP for demo/testing purposes.
 * In production, OTPs should be sent via email/SMS and this component
 * should not display the OTP directly.
 */
export default function OtpDisplayModal({ isOpen, onClose, otp, email }) {
    const [copied, setCopied] = useState(false);

    const handleCopyOtp = async () => {
        try {
            await navigator.clipboard.writeText(otp);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy OTP:', err);
        }
    };

    const handleDismiss = () => {
        setCopied(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleDismiss} title="Demo Authentication Mode" size="sm">
            <div className="otp-display-modal">
                <div className="demo-notice">
                    <div className="demo-icon">🎯</div>
                    <h3>Demo Mode Active</h3>
                    <p className="demo-message">
                        Email delivery is disabled for project demonstration.
                    </p>
                </div>

                <div className="otp-info">
                    <p className="otp-label">Your OTP:</p>
                    <div className="otp-container">
                        <div className="otp-display">{otp}</div>
                        <button
                            className={`copy-button ${copied ? 'copied' : ''}`}
                            onClick={handleCopyOtp}
                            title={copied ? 'Copied!' : 'Copy OTP'}
                            type="button"
                        >
                            {copied ? (
                                <>
                                    <CheckCircle size={20} />
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={20} />
                                    <span>Copy</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="otp-details">
                    <p className="detail-item">
                        <span className="label">Sent to:</span>
                        <span className="value">{email}</span>
                    </p>
                    <p className="detail-item">
                        <span className="label">Expires in:</span>
                        <span className="value">5 minutes</span>
                    </p>
                </div>

                <div className="demo-notice-footer">
                    ⚠️ This is a demo implementation for project evaluation. In production, OTPs should be
                    delivered via email or SMS.
                </div>

                <Button fullWidth onClick={handleDismiss} size="lg" style={{ marginTop: '1.5rem' }}>
                    Got it, continue to verification
                </Button>
            </div>
        </Modal>
    );
}
