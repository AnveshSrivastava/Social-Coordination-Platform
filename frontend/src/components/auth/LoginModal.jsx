import { useState } from 'react';
import { Mail, Phone, Lock } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import OtpDisplayModal from './OtpDisplayModal';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './LoginModal.css';

const DEMO_EMAIL = 'mock@sca.com';
const DEMO_PHONE = '9999999999';
const DEMO_OTP = '000000';

/**
 * DEMO MODE: LoginModal component
 * This component handles OTP-based authentication with demo mode where
 * OTPs are displayed in a modal popup immediately after generation.
 */
export default function LoginModal({ isOpen, onClose }) {
    const { login } = useAuth();
    const toast = useToast();
    const [step, setStep] = useState('request'); // 'request' | 'verify'
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showOtpDisplay, setShowOtpDisplay] = useState(false);
    const [generatedOtp, setGeneratedOtp] = useState('');

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !phone) {
            setError('Both email and phone are required');
            return;
        }
        setLoading(true);
        try {
            const response = await authService.requestOtp(email, phone);
            // DEMO MODE: Show OTP display modal with the generated OTP
            if (response?.otp) {
                setGeneratedOtp(response.otp);
                setShowOtpDisplay(true);
            } else {
                // Fallback if no OTP in response
                setStep('verify');
                toast.success('OTP sent! Check your device.');
            }
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpDisplayClose = () => {
        setShowOtpDisplay(false);
        // Move to verification step and pre-fill the OTP (optional for testing)
        setStep('verify');
        // Optionally auto-fill for demo: setOtp(generatedOtp);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (!otp) {
            setError('Please enter the OTP');
            return;
        }
        setLoading(true);
        try {
            const res = await authService.verifyOtp(email, phone, otp);
            if (res?.data) {
                await login(res.data);
                toast.success('Welcome back!');
                onClose();
                resetForm();
            }
        } catch (err) {
            setError(err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep('request');
        setEmail('');
        setPhone('');
        setOtp('');
        setError('');
        setShowOtpDisplay(false);
        setGeneratedOtp('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleDemoLogin = async (e) => {
        e.preventDefault();
        setError('');
        setEmail(DEMO_EMAIL);
        setPhone(DEMO_PHONE);
        setLoading(true);
        try {
            const response = await authService.requestOtp(DEMO_EMAIL, DEMO_PHONE);
            // DEMO MODE: Show OTP display modal for demo account
            if (response?.otp) {
                setGeneratedOtp(response.otp);
                setShowOtpDisplay(true);
            } else {
                setStep('verify');
                setOtp(DEMO_OTP);
                toast.success('Demo credentials filled! OTP automatically set.');
            }
        } catch (err) {
            setError(err.message || 'Failed to request OTP for demo account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* OTP Display Modal - DEMO MODE */}
            <OtpDisplayModal isOpen={showOtpDisplay} onClose={handleOtpDisplayClose} otp={generatedOtp} email={email} />

            {/* Main Login Modal - Hidden when OTP Display Modal is shown */}
            <Modal
                isOpen={isOpen && !showOtpDisplay}
                onClose={handleClose}
                title={step === 'request' ? 'Sign In' : 'Verify OTP'}
                size="sm"
            >
                <div className="login-modal">
                    {step === 'request' ? (
                        <form onSubmit={handleRequestOtp}>
                            <p className="login-subtitle">Enter your email and phone to get started</p>
                            <div className="login-fields">
                                <Input
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    icon={<Mail size={18} />}
                                    required
                                />
                                <Input
                                    label="Phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+91 98765 43210"
                                    icon={<Phone size={18} />}
                                    required
                                />
                            </div>
                            {error && <p className="login-error">{error}</p>}
                            <Button type="submit" fullWidth loading={loading} size="lg">
                                Send OTP
                            </Button>

                            {/* Demo Account Section */}
                            <div className="demo-section">
                                <div className="demo-divider"></div>
                                <p className="demo-title">Try Demo First</p>
                                <div className="demo-credentials">
                                    <p className="demo-note">🔓 Test account for exploring the app</p>
                                    <div className="credentials-box">
                                        <div className="credential-item">
                                            <span className="label">Email:</span>
                                            <span className="value">{DEMO_EMAIL}</span>
                                        </div>
                                        <div className="credential-item">
                                            <span className="label">Phone:</span>
                                            <span className="value">{DEMO_PHONE}</span>
                                        </div>
                                        <div className="credential-item">
                                            <span className="label">OTP:</span>
                                            <span className="value">{DEMO_OTP}</span>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        fullWidth
                                        loading={loading}
                                        onClick={handleDemoLogin}
                                        style={{
                                            backgroundColor: '#f0f0f0',
                                            color: '#333',
                                            border: '1px solid #ddd',
                                        }}
                                    >
                                        Use Demo Account
                                    </Button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp}>
                            <p className="login-subtitle">
                                We sent a code to <strong>{email}</strong>
                            </p>
                            <div className="login-fields">
                                <Input
                                    label="OTP Code"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    icon={<Lock size={18} />}
                                    maxLength={6}
                                    required
                                    autoFocus
                                />
                            </div>
                            {error && <p className="login-error">{error}</p>}
                            <Button type="submit" fullWidth loading={loading} size="lg">
                                Verify & Sign In
                            </Button>
                            <button
                                type="button"
                                className="login-back"
                                onClick={() => {
                                    setStep('request');
                                    setError('');
                                    setOtp('');
                                }}
                            >
                                ← Use a different email
                            </button>
                        </form>
                    )}
                </div>
            </Modal>
        </>
    );
}

