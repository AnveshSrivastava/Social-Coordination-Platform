import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, ChevronDown, MapPin, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const LANDING_LINKS = [
    { label: 'About', href: '#how-it-works' },
    { label: 'Safety', href: '#safety' },
    { label: 'Reviews', href: '#testimonials' },
    { label: 'Travel Tips', href: '#tips' },
];

export default function Navbar({ onLoginClick, transparent = false }) {
    const { user, isAuthenticated, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Lock body scroll when mobile menu open
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate('/');
    };

    const isLandingPage = location.pathname === '/';

    const scrollToSection = (href) => {
        setMobileMenuOpen(false);
        const el = document.querySelector(href);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <nav className={`navbar ${transparent ? 'navbar--transparent' : ''} ${isLandingPage ? 'navbar--landing' : ''}`}>
            <div className="navbar-inner">
                {/* Logo */}
                <Link to="/" className="navbar-brand">
                    <div className="navbar-logo">
                        <MapPin size={22} />
                    </div>
                    <span className="navbar-brand-text">MeetSpot</span>
                </Link>

                {/* Desktop nav links (landing page only) */}
                {isLandingPage && (
                    <div className="navbar-links">
                        {LANDING_LINKS.map((link) => (
                            <button
                                key={link.href}
                                className="navbar-link"
                                onClick={() => scrollToSection(link.href)}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Right side: CTA + Auth + Hamburger */}
                <div className="navbar-actions">
                    {/* Get Started CTA on landing */}
                    {isLandingPage && (
                        <button
                            className="navbar-cta-btn"
                            onClick={() => navigate('/map')}
                        >
                            Get Started
                        </button>
                    )}

                    {/* Sign-in on other pages */}
                    {!isLandingPage && !isAuthenticated && (
                        <button className="navbar-login-btn" onClick={onLoginClick}>
                            Sign In
                        </button>
                    )}

                    {/* Authenticated user dropdown */}
                    {isAuthenticated && (
                        <div className="navbar-profile" ref={dropdownRef}>
                            <button
                                className="navbar-profile-btn"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <div className="navbar-avatar">
                                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <ChevronDown size={16} className={`navbar-chevron ${dropdownOpen ? 'navbar-chevron--open' : ''}`} />
                            </button>

                            {dropdownOpen && (
                                <div className="navbar-dropdown animate-scale-in">
                                    <div className="navbar-dropdown-header">
                                        <span className="navbar-dropdown-email">{user?.email}</span>
                                        <span className="navbar-dropdown-phone">{user?.phone}</span>
                                    </div>
                                    <div className="navbar-dropdown-divider" />
                                    <Link
                                        to="/profile"
                                        className="navbar-dropdown-item"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <User size={16} />
                                        <span>Profile</span>
                                    </Link>
                                    <button className="navbar-dropdown-item navbar-dropdown-item--danger" onClick={handleLogout}>
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile hamburger (landing only) */}
                    {isLandingPage && (
                        <button
                            className="navbar-hamburger"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile overlay menu */}
            {mobileMenuOpen && isLandingPage && (
                <div className="navbar-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
                    <div className="navbar-mobile-menu" onClick={(e) => e.stopPropagation()}>
                        <div className="navbar-mobile-links">
                            {LANDING_LINKS.map((link) => (
                                <button
                                    key={link.href}
                                    className="navbar-mobile-link"
                                    onClick={() => scrollToSection(link.href)}
                                >
                                    {link.label}
                                </button>
                            ))}
                        </div>
                        <div className="navbar-mobile-cta">
                            <button
                                className="navbar-mobile-cta-btn"
                                onClick={() => { setMobileMenuOpen(false); navigate('/map'); }}
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
