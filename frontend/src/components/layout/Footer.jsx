import { MapPin, Heart, Shield } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import './Footer.css';

export default function Footer() {
    const toast = useToast();

    const handleComingSoon = (e, featureName) => {
        e.preventDefault();
        toast.info(`${featureName} documentation will be published prior to public launch.`);
    };

    const scrollToSection = (e, id) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <MapPin size={20} />
                    </div>
                    <span className="footer-brand-text">MeetSpot</span>
                    <p className="footer-tagline">
                        Discover. Connect. Explore Together.<br />
                        The premium social platform for modern explorers.
                    </p>
                </div>

                <div className="footer-links">
                    <div className="footer-col">
                        <h4>Platform</h4>
                        <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')}>How It Works</a>
                        <a href="#safety" onClick={(e) => scrollToSection(e, 'safety')}>Safety</a>
                        <a href="#testimonials" onClick={(e) => scrollToSection(e, 'testimonials')}>Reviews</a>
                        <a href="#tips" onClick={(e) => scrollToSection(e, 'tips')}>Travel Tips</a>
                    </div>
                    <div className="footer-col">
                        <h4>Legal & Support</h4>
                        <a href="#privacy" onClick={(e) => handleComingSoon(e, 'Privacy Policy')}>Privacy Policy</a>
                        <a href="#terms" onClick={(e) => handleComingSoon(e, 'Terms of Service')}>Terms of Service</a>
                        <a href="#community" onClick={(e) => handleComingSoon(e, 'Community Guidelines')}>Community Guidelines</a>
                        <a href="#contact" onClick={(e) => handleComingSoon(e, 'Support Contact')}>Contact Us</a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>
                        Made with <Heart size={14} className="footer-heart" /> for safer social exploration
                    </p>
                    <p className="footer-copy">© {new Date().getFullYear()} MeetSpot Inc. Premium Social Experiences.</p>
                    <div className="footer-safety-note">
                        <Shield size={14} />
                        <span>MeetSpot is not an emergency service and does not contact law enforcement.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
