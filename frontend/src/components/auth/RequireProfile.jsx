import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * RequireProfile component
 * Guard component that ensures logged-in users complete their profile
 * before accessing application pages.
 *
 * @param {boolean} requireAuth - If true, unauthenticated users are redirected to landing page.
 *                                 If false (default for /map), guests may view the page.
 */
export default function RequireProfile({ children, requireAuth = false }) {
    const { isAuthenticated, profileComplete, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: 'var(--color-text-secondary, #666)'
            }}>
                <span>Loading profile...</span>
            </div>
        );
    }

    // Route requires authentication (e.g. /profile) and user is a guest
    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // User is logged in but has not completed mandatory profile setup
    if (isAuthenticated && !profileComplete) {
        return <Navigate to="/complete-profile" replace />;
    }

    return children;
}
