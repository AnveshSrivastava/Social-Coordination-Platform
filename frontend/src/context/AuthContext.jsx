import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const fetchUser = useCallback(async () => {
        try {
            const res = await userService.getProfile();
            if (res?.data) {
                setUser(res.data);
                setIsAuthenticated(true);
            }
        } catch {
            setUser(null);
            setIsAuthenticated(false);
            authService.logout();
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authService.isAuthenticated()) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [fetchUser]);

    const login = async (token) => {
        localStorage.setItem('jwt_token', token);
        await fetchUser();
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export default AuthContext;
