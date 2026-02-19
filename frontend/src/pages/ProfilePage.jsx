import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, CalendarDays, Star, ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import './ProfilePage.css';

export default function ProfilePage() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [trustScore, setTrustScore] = useState(null);

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
        fetchTrustScore();
    }, [isAuthenticated, navigate]);

    if (!user) return null;

    const joinDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

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
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="profile-info">
                            <h2 className="profile-name">{user.email?.split('@')[0]}</h2>
                            <p className="profile-email">{user.email}</p>
                            <p className="profile-phone">{user.phone}</p>
                        </div>
                    </div>

                    <div className="profile-stats">
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

                {/* Scheduled Groups */}
                <div className="profile-section animate-fade-in-up">
                    <h3>
                        <CalendarDays size={18} />
                        Scheduled Groups
                    </h3>
                    <div className="profile-empty">
                        <p>No scheduled groups. Explore the map to find one!</p>
                    </div>
                </div>

                {/* Past Places */}
                <div className="profile-section animate-fade-in-up">
                    <h3>
                        <MapPin size={18} />
                        Places Visited
                    </h3>
                    <div className="profile-empty">
                        <p>No past places yet. Start exploring!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
