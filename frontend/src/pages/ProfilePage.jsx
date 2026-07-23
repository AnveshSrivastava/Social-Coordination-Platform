import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, CalendarDays, Star, ArrowLeft, User, Edit2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { groupService } from '../services/groupService';
import { useToast } from '../context/ToastContext';
import GroupCard from '../components/group/GroupCard';
import './ProfilePage.css';

export default function ProfilePage() {
    const { user, isAuthenticated, fetchUser } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [trustScore, setTrustScore] = useState(null);
    const [myGroups, setMyGroups] = useState([]);
    const [isEditBioOpen, setIsEditBioOpen] = useState(false);
    const [bioText, setBioText] = useState(user?.bio || '');
    const [updatingBio, setUpdatingBio] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }
        const fetchTrustScore = async () => {
            try {
                const res = await userService.getTrustScore();
                if (res?.data !== undefined) setTrustScore(res.data);
            } catch (err) {
                console.error('Failed to fetch trust score:', err);
            }
        };
        const fetchMyGroups = async () => {
            try {
                const res = await groupService.getMyGroups();
                if (res?.data) setMyGroups(res.data);
            } catch (err) {
                console.error('Failed to fetch groups:', err);
            }
        };
        fetchTrustScore();
        fetchMyGroups();
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (user?.bio !== undefined) {
            setBioText(user.bio || '');
        }
    }, [user]);

    if (!user) return null;

    const joinDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    const handleSaveBio = async () => {
        setUpdatingBio(true);
        try {
            await userService.updateProfile({
                username: user.username,
                age: user.age,
                gender: user.gender,
                bio: bioText ? bioText.trim() : null,
            });
            await fetchUser();
            toast.success('Bio updated successfully!');
            setIsEditBioOpen(false);
        } catch (err) {
            toast.error(err?.message || 'Failed to update bio');
        } finally {
            setUpdatingBio(false);
        }
    };

    return (
        <div className="profile-page">
            <Navbar />
            <div className="profile-container">
                <button className="profile-back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="profile-card animate-fade-in-up">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {user.username ? user.username.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="profile-info">
                            <h2 className="profile-name">
                                @{user.username || user.email?.split('@')[0]}
                            </h2>
                            <p className="profile-email">{user.email}</p>
                            <p className="profile-phone">{user.phone}</p>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                {user.age && <Badge variant="default">🎂 Age {user.age}</Badge>}
                                {user.gender && (
                                    <Badge variant="primary">
                                        {user.gender === 'MALE' ? '👨 Male' : user.gender === 'FEMALE' ? '👩 Female' : '🧑 Other'}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="profile-bio-box" style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--color-bg-secondary, #1a1a24)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Bio</span>
                            <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                                onClick={() => setIsEditBioOpen(true)}
                            >
                                <Edit2 size={12} /> Edit
                            </button>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', margin: 0, fontStyle: user.bio ? 'normal' : 'italic' }}>
                            {user.bio || 'No bio provided yet. Tap edit to introduce yourself!'}
                        </p>
                    </div>

                    <div className="profile-stats" style={{ marginTop: '20px' }}>
                        <div className="profile-stat">
                            <div className="profile-stat-icon">
                                <Shield size={20} />
                            </div>
                            <div>
                                <span className="profile-stat-value">{trustScore ?? 'N/A'}</span>
                                <span className="profile-stat-label">Trust Score</span>
                            </div>
                        </div>
                        <div className="profile-stat">
                            <div className="profile-stat-icon">
                                <CalendarDays size={20} />
                            </div>
                            <div>
                                <span className="profile-stat-value">{joinDate}</span>
                                <span className="profile-stat-label">Joined</span>
                            </div>
                        </div>
                        <div className="profile-stat">
                            <div className="profile-stat-icon">
                                <Star size={20} />
                            </div>
                            <div>
                                <span className="profile-stat-value">
                                    {user.verified ? '✓ Verified' : 'Pending'}
                                </span>
                                <span className="profile-stat-label">Status</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Joined Groups */}
                <div className="profile-section animate-fade-in-up">
                    <h3>
                        <CalendarDays size={18} />
                        Joined Groups
                    </h3>
                    {myGroups.length > 0 ? (
                        <div className="profile-groups-list" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {myGroups.map(group => (
                                <GroupCard
                                    key={group.id}
                                    group={group}
                                    compact={true}
                                    isJoined={true}
                                    onGroupChange={() => {
                                        groupService.getMyGroups().then(res => {
                                            if (res?.data) setMyGroups(res.data);
                                        });
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="profile-empty">
                            <p>No joined groups. Explore the map to find one!</p>
                        </div>
                    )}
                </div>

                {/* Places Visited */}
                <div className="profile-section animate-fade-in-up">
                    <h3>
                        <MapPin size={18} />
                        Places Visited
                    </h3>
                    {user.placesVisited && user.placesVisited.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                            {user.placesVisited.map((placeName, idx) => (
                                <Badge key={idx} variant="primary" size="md">
                                    📍 {placeName}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <div className="profile-empty">
                            <p>No past places yet. Complete group meetups to build your journey!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Bio Modal */}
            <Modal isOpen={isEditBioOpen} onClose={() => setIsEditBioOpen(false)} title="Edit Bio">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <textarea
                        rows="4"
                        value={bioText}
                        onChange={(e) => setBioText(e.target.value)}
                        placeholder="Write a brief bio about yourself..."
                        maxLength={250}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'var(--color-bg-secondary, #1a1a24)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                            resize: 'vertical'
                        }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                        {bioText.length}/250
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Button variant="default" onClick={() => setIsEditBioOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveBio} loading={updatingBio} disabled={updatingBio}>Save Bio</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
