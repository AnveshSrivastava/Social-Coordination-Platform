import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin, Users, Shield, MessageCircle, Navigation,
    CheckCircle, Star, ArrowRight, Compass, Zap, Heart,
    Sparkles, Radio, UserCheck, ShieldAlert
} from 'lucide-react';
import Button from '../components/ui/Button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import './LandingPage.css';

const TESTIMONIALS = [
    { name: 'Priya M.', text: 'Found the best café group last weekend. Felt completely safe with the SOS feature!', rating: 5, location: 'Bangalore' },
    { name: 'Rahul S.', text: 'Love how easy it is to create a group and invite friends with a code. Super clean UI.', rating: 5, location: 'Delhi' },
    { name: 'Sneha K.', text: 'The confirmation system ensures everyone actually shows up. No more ghosting!', rating: 5, location: 'Mumbai' },
    { name: 'Arjun D.', text: 'Great for exploring new restaurants with like-minded people nearby.', rating: 5, location: 'Hyderabad' },
];

const TIPS = [
    { icon: <Users size={22} />, title: 'Start Small', text: 'Begin with groups of 2-4 people for your first meetup. Smaller groups build trust faster.' },
    { icon: <Shield size={22} />, title: 'Share Your Plan', text: 'Always let someone know where you are going. Use our SOS feature for added safety.' },
    { icon: <Navigation size={22} />, title: 'Pick Public Spots', text: 'Choose cafés, restaurants, or well-known activity venues for your first few meetups.' },
    { icon: <CheckCircle size={22} />, title: 'Confirm Early', text: 'Confirm your attendance ahead of time. It helps the group plan better and builds trust.' },
];

export default function LandingPage() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'MeetSpot — Discover Places, Meet People, Explore Together';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'MeetSpot is a location-first platform where you discover nearby cafés, restaurants, and activity spots, and join or create small meetup groups with verified members. Safe, social, and spontaneous.');
        }
        setMetaTag('og:title', 'MeetSpot — Discover Places, Meet People, Explore Together');
        setMetaTag('og:description', 'Join verified groups at nearby places. Safe social exploration made easy.');
        setMetaTag('og:type', 'website');
    }, []);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="landing-new">
            <Navbar transparent />

            {/* Hero Section */}
            <header className="landing-hero">
                <div className="hero-backdrop" />
                <div className="hero-container animate-fade-in-up">
                    <div className="hero-pill-badge">
                        <Sparkles size={14} />
                        <span>Discover & Connect</span>
                    </div>

                    <h1 className="hero-headline">
                        Find Your People.<br />
                        <span className="gradient-text-indigo">Explore Together.</span>
                    </h1>

                    <p className="hero-subtext">
                        Discover nearby cafés, restaurants, and activity spots. Join small meetup groups,
                        confirm attendance, chat in real-time, and explore safety with verified members.
                    </p>

                    <div className="hero-button-group">
                        <button className="hero-btn-primary" onClick={() => navigate('/map')}>
                            Get Started
                        </button>
                        <button className="hero-btn-secondary" onClick={() => scrollToSection('how-it-works')}>
                            Learn More
                        </button>
                    </div>

                    <div className="hero-features-bar">
                        <div className="hero-feature-item">
                            <Zap size={16} />
                            <span><strong>Instant</strong> group creation</span>
                        </div>
                        <div className="hero-feature-item">
                            <Shield size={16} />
                            <span><strong>SOS</strong> safety system</span>
                        </div>
                        <div className="hero-feature-item">
                            <MessageCircle size={16} />
                            <span><strong>Live</strong> group chat</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* How It Works Section */}
            <section className="landing-section" id="how-it-works">
                <div className="landing-section-inner">
                    <div className="section-header-block">
                        <span className="section-category-tag">SIMPLE & INTUITIVE</span>
                        <h2 className="section-main-heading">How It Works</h2>
                        <p className="section-sub-heading">Three simple steps to start exploring with new people</p>
                    </div>

                    <div className="steps-container">
                        <div className="step-box-card">
                            <div className="step-badge-num">1</div>
                            <div className="step-icon-wrapper step-icon--blue">
                                <MapPin size={26} />
                            </div>
                            <h3>Discover Places</h3>
                            <p>Open the map and browse nearby cafés, restaurants, and activity spots. Search or let us find places around you.</p>
                        </div>

                        <div className="step-box-card">
                            <div className="step-badge-num">2</div>
                            <div className="step-icon-wrapper step-icon--indigo">
                                <Users size={26} />
                            </div>
                            <h3>Join or Create</h3>
                            <p>See available groups at each place, or create your own. Set the date, group size, and invite friends privately.</p>
                        </div>

                        <div className="step-box-card">
                            <div className="step-badge-num">3</div>
                            <div className="step-icon-wrapper step-icon--purple">
                                <Navigation size={26} />
                            </div>
                            <h3>Confirm & Explore</h3>
                            <p>Confirm your attendance, chat with your group in real-time, and use SOS if you ever feel unsafe during your outing.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Built with Safety First Section */}
            <section className="landing-section section--navy" id="safety">
                <div className="landing-section-inner">
                    <div className="section-header-block">
                        <span className="section-category-tag tag--light">YOUR SAFETY MATTERS</span>
                        <h2 className="section-main-heading heading--light">Built with Safety First</h2>
                        <p className="section-sub-heading desc--light">Every feature is designed with your wellbeing in mind</p>
                    </div>

                    <div className="safety-cards-grid">
                        <div className="safety-glass-card">
                            <div className="safety-card-icon">
                                <ShieldAlert size={22} />
                            </div>
                            <h3>SOS Emergency</h3>
                            <p>One tap sends your location and a help message to your trusted contacts during active meetups.</p>
                        </div>

                        <div className="safety-glass-card">
                            <div className="safety-card-icon">
                                <UserCheck size={22} />
                            </div>
                            <h3>Attendance</h3>
                            <p>Members must confirm before events. No-shows lower trust scores, encouraging accountability.</p>
                        </div>

                        <div className="safety-glass-card">
                            <div className="safety-card-icon">
                                <Radio size={22} />
                            </div>
                            <h3>Reporting</h3>
                            <p>If a majority of members report someone, they are removed. The community self-moderates.</p>
                        </div>

                        <div className="safety-glass-card">
                            <div className="safety-card-icon">
                                <Users size={22} />
                            </div>
                            <h3>Small Groups</h3>
                            <p>Groups are limited to 2-6 people, creating intimate, manageable meetups — not crowded events.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="landing-section" id="testimonials">
                <div className="landing-section-inner">
                    <div className="section-header-block">
                        <span className="section-category-tag">COMMUNITY VOICES</span>
                        <h2 className="section-main-heading">What Our Users Say</h2>
                    </div>

                    <div className="testimonials-grid-4">
                        {TESTIMONIALS.map((item, idx) => (
                            <div key={idx} className="review-quote-card">
                                <div className="review-stars-row">
                                    {Array.from({ length: item.rating }, (_, i) => (
                                        <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                                    ))}
                                </div>
                                <p className="review-body-text">"{item.text}"</p>
                                <div className="review-user-info">
                                    <div className="review-avatar-circle">{item.name.charAt(0)}</div>
                                    <div>
                                        <span className="review-user-name">{item.name}</span>
                                        <span className="review-user-city">{item.location}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Travel Tips Section */}
            <section className="landing-section section--soft-indigo" id="tips">
                <div className="landing-section-inner">
                    <div className="section-header-block">
                        <span className="section-category-tag">PRO TIPS</span>
                        <h2 className="section-main-heading">Group Travel Tips</h2>
                        <p className="section-sub-heading">Make the most of your social exploration experience</p>
                    </div>

                    <div className="tips-grid-4">
                        {TIPS.map((tip, idx) => (
                            <div key={idx} className="tip-box-card">
                                <div className="tip-card-icon">{tip.icon}</div>
                                <h3>{tip.title}</h3>
                                <p>{tip.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ready to Explore CTA Banner */}
            <section className="landing-section section--cta-wrapper">
                <div className="landing-section-inner">
                    <div className="cta-banner-gradient-card">
                        <h2>Ready to Explore?</h2>
                        <p>Join thousands of people discovering new places and making real connections.</p>
                        <button className="cta-banner-white-btn" onClick={() => navigate('/map')}>
                            <span>Start Exploring</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

function setMetaTag(property, content) {
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
}
