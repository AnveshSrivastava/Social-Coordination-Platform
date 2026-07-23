import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, UserCheck, FileText, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './CompleteProfilePage.css';

export default function CompleteProfilePage() {
    const { user, isAuthenticated, profileComplete, logout, fetchUser } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [username, setUsername] = useState(user?.username || '');
    const [age, setAge] = useState(user?.age || '');
    const [gender, setGender] = useState(user?.gender || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        } else if (profileComplete) {
            navigate('/map');
        }
    }, [isAuthenticated, profileComplete, navigate]);

    useEffect(() => {
        if (user) {
            if (user.username) setUsername(user.username);
            if (user.age) setAge(user.age);
            if (user.gender) setGender(user.gender);
            if (user.bio) setBio(user.bio);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const trimmedUsername = username.trim();
        if (!trimmedUsername) {
            setError('Username is required');
            return;
        }

        const usernameRegex = /^[a-zA-Z0-9_]{3,25}$/;
        if (!usernameRegex.test(trimmedUsername)) {
            setError('Username must be 3–25 characters and contain only letters, numbers, and underscores');
            return;
        }

        const parsedAge = parseInt(age, 10);
        if (isNaN(parsedAge) || parsedAge < 13 || parsedAge > 99) {
            setError('Age must be between 13 and 99');
            return;
        }

        if (!gender) {
            setError('Please select your gender');
            return;
        }

        setLoading(true);

        try {
            const body = {
                username: trimmedUsername,
                age: parsedAge,
                gender,
                bio: bio ? bio.trim() : null,
            };

            await userService.updateProfile(body);
            await fetchUser();
            toast.success('Profile completed successfully!');
            navigate('/map');
        } catch (err) {
            const msg = err?.data
                ? Object.values(err.data).join(', ')
                : (err?.message || 'Failed to update profile');
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="complete-profile-page">
            <div className="cp-card animate-fade-in-up">
                <div className="cp-header">
                    <div className="cp-avatar-placeholder">
                        {username ? username.charAt(0).toUpperCase() : '👋'}
                    </div>
                    <h2>Complete Your Profile</h2>
                    <p className="cp-subtitle">
                        Please set up your profile before joining or creating groups on MeetSpot.
                    </p>
                </div>

                {error && (
                    <div className="cp-error-banner">
                        <ShieldAlert size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="cp-form">
                    <Input
                        label="Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. alex_99"
                        icon={<User size={18} />}
                        required
                        disabled={Boolean(user?.username)}
                    />
                    <span className="cp-field-hint">
                        3–25 characters, letters, numbers, and underscores only.
                    </span>

                    <Input
                        label="Age"
                        type="number"
                        min="13"
                        max="99"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="e.g. 24"
                        icon={<Calendar size={18} />}
                        required
                        disabled={Boolean(user?.age)}
                    />
                    {user?.age && (
                        <span className="cp-field-hint cp-field-hint--lock">
                            🔒 Age cannot be changed after setup.
                        </span>
                    )}

                    <div className="cp-field">
                        <label className="input-label">
                            <UserCheck size={16} /> Gender
                            {user?.gender && <span className="cp-lock-badge">🔒 Immutable</span>}
                        </label>
                        <div className="cp-gender-options">
                            {[
                                { value: 'MALE', label: 'Male', icon: '👨' },
                                { value: 'FEMALE', label: 'Female', icon: '👩' },
                                { value: 'OTHER', label: 'Other', icon: '🧑' },
                            ].map((g) => (
                                <button
                                    key={g.value}
                                    type="button"
                                    disabled={Boolean(user?.gender)}
                                    className={`cp-gender-btn ${gender === g.value ? 'cp-gender-btn--active' : ''}`}
                                    onClick={() => setGender(g.value)}
                                >
                                    <span>{g.icon}</span> {g.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="cp-field">
                        <label className="input-label">
                            <FileText size={16} /> Bio (Optional)
                        </label>
                        <textarea
                            className="cp-bio-input"
                            rows="3"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell potential group members a bit about yourself..."
                            maxLength={250}
                        />
                        <span className="cp-char-counter">{bio.length}/250</span>
                    </div>

                    <Button type="submit" fullWidth loading={loading} size="lg">
                        Save Profile & Continue
                    </Button>

                    <button
                        type="button"
                        className="cp-logout-link"
                        onClick={() => {
                            logout();
                            navigate('/');
                        }}
                    >
                        <LogOut size={16} /> Sign out
                    </button>
                </form>
            </div>
        </div>
    );
}
