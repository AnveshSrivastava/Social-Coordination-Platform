import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, CalendarDays, Edit2, CheckCircle2, UserCheck, Sparkles, Award } from 'lucide-react';
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
        ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
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

    const formattedTrustScore = trustScore !== null && trustScore !== undefined ? trustScore : (user.trustScore ?? 0);

    return (
        <div className="profile-dashboard-layout">
            <Navbar />
            
            <main className="profile-dashboard-main">
                {/* Header Banner */}
                <header className="profile-dashboard-header animate-fade-in-up">
                    <div>
                        <h1 className="profile-dashboard-title">Dashboard Overview</h1>
                        <p className="profile-dashboard-subtitle">
                            Manage your social profile and upcoming meetups.
                        </p>
                    </div>
                </header>

                <div className="profile-dashboard-grid">
                    {/* Left Column: User Identity Card */}
                    <aside className="profile-sidebar-col animate-fade-in-up">
                        {/* Main Profile Card */}
                        <div className="profile-identity-card">
                            <div className="profile-avatar-wrapper">
                                <div className="profile-avatar-circle">
                                    {user.username
                                        ? user.username.charAt(0).toUpperCase()
                                        : user.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                {user.verified && (
                                    <div className="profile-avatar-verified-badge" title="Identity Verified">
                                        <CheckCircle2 size={16} />
                                    </div>
                                )}
                            </div>

                            <h2 className="profile-user-name">
                                {user.username ? `@${user.username}` : user.email?.split('@')[0]}
                            </h2>
                            <p className="profile-user-email">{user.email}</p>
                            {user.phone && <p className="profile-user-phone">{user.phone}</p>}

                            <div className="profile-badges-row">
                                {user.age && <span className="profile-tag-pill">🎂 Age {user.age}</span>}
                                {user.gender && (
                                    <span className="profile-tag-pill">
                                        {user.gender === 'MALE' ? '👨 Male' : user.gender === 'FEMALE' ? '👩 Female' : '🧑 Other'}
                                    </span>
                                )}
                            </div>

                            {/* 2-Stat Row: Meetups & Trips */}
                            <div className="profile-stats-grid-2">
                                <div className="profile-stat-box">
                                    <span className="profile-stat-num">{myGroups.length}</span>
                                    <span className="profile-stat-lbl">MEETUPS</span>
                                </div>
                                <div className="profile-stat-box">
                                    <span className="profile-stat-num">{user.totalTrips || 0}</span>
                                    <span className="profile-stat-lbl">TRIPS</span>
                                </div>
                            </div>
                        </div>

                        {/* Trust Score Circular Card */}
                        <div className="profile-trust-card">
                            <div className="profile-trust-header">
                                <Shield size={16} />
                                <span>TRUST HUB</span>
                            </div>
                            <div className="profile-trust-body">
                                <div className="profile-trust-gauge">
                                    <svg viewBox="0 0 36 36" className="profile-circular-chart">
                                        <path
                                            className="circle-bg"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <path
                                            className="circle"
                                            strokeDasharray={`${Math.min(Math.max((formattedTrustScore / 10) * 100, 15), 100)}, 100`}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <text x="18" y="20.35" className="percentage">{formattedTrustScore}</text>
                                    </svg>
                                </div>
                                <div className="profile-trust-info">
                                    <h4>Trust Score</h4>
                                    <p>{formattedTrustScore >= 8 ? 'High Reliability Status' : 'Good Standing'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Status / Verification Cards */}
                        <div className="profile-meta-cards-stack">
                            <div className="profile-meta-card">
                                <div className="profile-meta-icon">
                                    <UserCheck size={18} />
                                </div>
                                <div>
                                    <h5>Identity {user.verified ? 'Verified' : 'Pending'}</h5>
                                    <p>{user.verified ? 'Account verified' : 'Verification pending'}</p>
                                </div>
                            </div>

                            <div className="profile-meta-card">
                                <div className="profile-meta-icon">
                                    <CalendarDays size={18} />
                                </div>
                                <div>
                                    <h5>Member since {joinDate}</h5>
                                    <p>MeetSpot Social Tier</p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Right Main Column */}
                    <div className="profile-content-col animate-fade-in-up">
                        {/* Bio Card */}
                        <section className="profile-card-section">
                            <div className="profile-section-header-row">
                                <h3 className="profile-section-heading">
                                    <Sparkles size={18} /> Bio & About
                                </h3>
                                <button
                                    type="button"
                                    className="profile-edit-btn"
                                    onClick={() => setIsEditBioOpen(true)}
                                >
                                    <Edit2 size={14} /> Edit
                                </button>
                            </div>
                            <p className="profile-bio-text">
                                {user.bio || 'No bio provided yet. Tap Edit to introduce yourself to your meetup partners!'}
                            </p>
                        </section>

                        {/* My Meetups Section */}
                        <section className="profile-card-section">
                            <div className="profile-section-header-row">
                                <h3 className="profile-section-heading">
                                    <CalendarDays size={18} /> My Meetups ({myGroups.length})
                                </h3>
                            </div>

                            {myGroups.length > 0 ? (
                                <div className="profile-meetups-grid">
                                    {myGroups.map((group) => (
                                        <GroupCard
                                            key={group.id}
                                            group={group}
                                            compact={true}
                                            isJoined={true}
                                            onGroupChange={() => {
                                                groupService.getMyGroups().then((res) => {
                                                    if (res?.data) setMyGroups(res.data);
                                                });
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="profile-empty-state">
                                    <CalendarDays size={32} />
                                    <p>No active or past meetups yet.</p>
                                    <span>Explore the map to find or host your first meetup!</span>
                                </div>
                            )}
                        </section>

                        {/* Places Visited Section */}
                        {user.placesVisited && user.placesVisited.length > 0 && (
                            <section className="profile-card-section">
                                <div className="profile-section-header-row">
                                    <h3 className="profile-section-heading">
                                        <MapPin size={18} /> Places Visited ({user.placesVisited.length})
                                    </h3>
                                </div>
                                <div className="profile-places-tags">
                                    {user.placesVisited.map((placeName, idx) => (
                                        <Badge key={idx} variant="primary" size="md">
                                            📍 {placeName}
                                        </Badge>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </main>

            {/* Edit Bio Modal */}
            <Modal isOpen={isEditBioOpen} onClose={() => setIsEditBioOpen(false)} title="Edit Bio">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <textarea
                        rows="4"
                        value={bioText}
                        onChange={(e) => setBioText(e.target.value)}
                        placeholder="Write a brief bio about yourself..."
                        maxLength={250}
                        className="profile-bio-textarea"
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                        {bioText.length}/250
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Button variant="default" onClick={() => setIsEditBioOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveBio} loading={updatingBio} disabled={updatingBio}>
                            Save Bio
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
