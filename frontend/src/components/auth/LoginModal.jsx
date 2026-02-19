import { useState } from 'react';
import { Mail, Phone, Lock } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose }) {
    const { login } = useAuth();
    const toast = useToast();
    const [step, setStep] = useState('request'); // 'request' | 'verify'
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !phone) {
            setError('Both email and phone are required');
            return;
        }
        setLoading(true);
        try {
            await authService.requestOtp(email, phone);
            setStep('verify');
            toast.success('OTP sent! Check your device.');
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
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
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={step === 'request' ? 'Sign In' : 'Verify OTP'} size="sm">
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
                            onClick={() => { setStep('request'); setError(''); setOtp(''); }}
                        >
                            ← Use a different email
                        </button>
                    </form>
                )}
            </div>
        </Modal>
    );
}
