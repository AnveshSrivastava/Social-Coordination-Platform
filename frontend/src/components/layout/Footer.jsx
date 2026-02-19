import { MapPin, Heart, Shield } from 'lucide-react';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <MapPin size={20} />
                    </div>
                    <span className="footer-brand-text">MeetSpot</span>
                    <p className="footer-tagline">Discover. Connect. Explore Together.</p>
                </div>

                <div className="footer-links">
                    <div className="footer-col">
                        <h4>Platform</h4>
                        <a href="#how-it-works">How It Works</a>
                        <a href="#safety">Safety</a>
                        <a href="#about">About Us</a>
                    </div>
                    <div className="footer-col">
                        <h4>Legal</h4>
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                        <a href="#community">Community Guidelines</a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>
                        Made with <Heart size={14} className="footer-heart" /> for safer social exploration
                    </p>
                    <p className="footer-copy">© {new Date().getFullYear()} MeetSpot. All rights reserved.</p>
                    <div className="footer-safety-note">
                        <Shield size={14} />
                        <span>MeetSpot is not an emergency service and does not contact authorities.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
