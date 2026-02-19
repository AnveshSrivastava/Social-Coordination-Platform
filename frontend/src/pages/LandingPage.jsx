import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin, Users, Shield, MessageCircle, Navigation,
    CheckCircle, Star, ArrowRight, Compass, Zap, Heart
} from 'lucide-react';
import Button from '../components/ui/Button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import './LandingPage.css';

const TESTIMONIALS = [
    { name: 'Priya M.', text: "Found the best café group last weekend. Felt completely safe with the SOS feature!", rating: 5, location: 'Bangalore' },
    { name: 'Rahul S.', text: 'Love how easy it is to create a group and invite friends with a code. Super clean UI.', rating: 5, location: 'Delhi' },
    { name: 'Sneha K.', text: 'The confirmation system ensures everyone actually shows up. No more ghosting!', rating: 4, location: 'Mumbai' },
    { name: 'Arjun D.', text: 'Great for exploring new restaurants with like-minded people nearby.', rating: 5, location: 'Hyderabad' },
];

const TIPS = [
    { icon: <Users size={24} />, title: 'Start Small', text: 'Begin with groups of 2-4 people for your first meetup. Smaller groups build trust faster.' },
    { icon: <Shield size={24} />, title: 'Share Your Plan', text: 'Always let someone know where you are going. Use our SOS feature for added safety.' },
    { icon: <Navigation size={24} />, title: 'Pick Public Spots', text: 'Choose cafés, restaurants, or well-known activity venues for your first few meetups.' },
    { icon: <CheckCircle size={24} />, title: 'Confirm Early', text: 'Confirm your attendance ahead of time. It helps the group plan better and builds trust.' },
];

export default function LandingPage() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'MeetSpot — Discover Places, Meet People, Explore Together';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'MeetSpot is a location-first platform where you discover nearby cafés, restaurants, and activity spots, and join or create small meetup groups with verified members. Safe, social, and spontaneous.');
        }
        // OpenGraph
        setMetaTag('og:title', 'MeetSpot — Discover Places, Meet People, Explore Together');
        setMetaTag('og:description', 'Join verified groups at nearby places. Safe social exploration made easy.');
        setMetaTag('og:type', 'website');
    }, []);

    return (
        <div className="landing">
            <Navbar transparent />

            {/* Hero */}
            <section className="hero">
                <div className="hero-bg" />
                <div className="hero-content animate-fade-in-up">
                    <div className="hero-badge">
                        <Compass size={14} />
                        Discover & Connect
                    </div>
                    <h1 className="hero-title">
                        Find Your People.<br />
                        <span className="gradient-text">Explore Together.</span>
                    </h1>
                    <p className="hero-subtitle">
                        Discover nearby cafés, restaurants, and activity spots. Join small meetup groups,
                        confirm attendance, chat in real-time, and explore safely with verified members.
                    </p>
                    <div className="hero-actions">
                        <Button size="lg" onClick={() => navigate('/map')} icon={<MapPin size={20} />}>
                            Get Started
                        </Button>
                        <Button size="lg" variant="ghost" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                            Learn More
                        </Button>
                    </div>
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <Zap size={16} />
                            <span><strong>Instant</strong> group creation</span>
                        </div>
                        <div className="hero-stat">
                            <Shield size={16} />
                            <span><strong>SOS</strong> safety system</span>
                        </div>
                        <div className="hero-stat">
                            <MessageCircle size={16} />
                            <span><strong>Live</strong> group chat</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="section" id="how-it-works">
                <div className="section-inner">
                    <div className="section-header">
                        <span className="section-label">Simple & Intuitive</span>
                        <h2 className="section-title">How It Works</h2>
                        <p className="section-desc">Three simple steps to start exploring with new people</p>
                    </div>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <div className="step-icon step-icon--discover"><MapPin size={28} /></div>
                            <h3>Discover Places</h3>
                            <p>Open the map and browse nearby cafés, restaurants, and activity spots. Search or let us find places around you.</p>
                        </div>
                        <div className="step-connector"><ArrowRight size={24} /></div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <div className="step-icon step-icon--join"><Users size={28} /></div>
                            <h3>Join or Create a Group</h3>
                            <p>See available groups at each place, or create your own. Set the date, group size, and invite friends privately.</p>
                        </div>
                        <div className="step-connector"><ArrowRight size={24} /></div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <div className="step-icon step-icon--explore"><Navigation size={28} /></div>
                            <h3>Confirm & Explore</h3>
                            <p>Confirm your attendance, chat with your group in real-time, and use SOS if you ever feel unsafe.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Safety */}
            <section className="section section--dark" id="safety">
                <div className="section-inner">
                    <div className="section-header">
                        <span className="section-label section-label--light">Your Safety Matters</span>
                        <h2 className="section-title section-title--light">Built with Safety First</h2>
                        <p className="section-desc section-desc--light">Every feature is designed with your wellbeing in mind</p>
                    </div>
                    <div className="safety-grid">
                        <div className="safety-card">
                            <div className="safety-icon"><Shield size={24} /></div>
                            <h3>SOS Emergency Button</h3>
                            <p>One tap sends your location and a help message to your trusted contacts during active meetups.</p>
                        </div>
                        <div className="safety-card">
                            <div className="safety-icon"><CheckCircle size={24} /></div>
                            <h3>Attendance Confirmation</h3>
                            <p>Members must confirm before events. No-shows lower trust scores, encouraging accountability.</p>
                        </div>
                        <div className="safety-card">
                            <div className="safety-icon"><Users size={24} /></div>
                            <h3>Community Reporting</h3>
                            <p>If a majority of members report someone, they are removed. The community self-moderates.</p>
                        </div>
                        <div className="safety-card">
                            <div className="safety-icon"><Heart size={24} /></div>
                            <h3>Small Group Sizes</h3>
                            <p>Groups are limited to 2-6 people, creating intimate, manageable meetups — not crowded events.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="section" id="testimonials">
                <div className="section-inner">
                    <div className="section-header">
                        <span className="section-label">Community Voices</span>
                        <h2 className="section-title">What Our Users Say</h2>
                    </div>
                    <div className="testimonials-grid">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="testimonial-card">
                                <div className="testimonial-stars">
                                    {Array.from({ length: t.rating }, (_, j) => (
                                        <Star key={j} size={14} fill="#F59E0B" color="#F59E0B" />
                                    ))}
                                </div>
                                <p className="testimonial-text">"{t.text}"</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                                    <div>
                                        <span className="testimonial-name">{t.name}</span>
                                        <span className="testimonial-location">{t.location}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tips */}
            <section className="section section--soft" id="tips">
                <div className="section-inner">
                    <div className="section-header">
                        <span className="section-label">Pro Tips</span>
                        <h2 className="section-title">Group Travel Tips</h2>
                        <p className="section-desc">Make the most of your social exploration experience</p>
                    </div>
                    <div className="tips-grid">
                        {TIPS.map((tip, i) => (
                            <div key={i} className="tip-card">
                                <div className="tip-icon">{tip.icon}</div>
                                <h3>{tip.title}</h3>
                                <p>{tip.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section cta-section">
                <div className="section-inner">
                    <div className="cta-content">
                        <h2>Ready to Explore?</h2>
                        <p>Join thousands of people discovering new places and making real connections.</p>
                        <Button size="lg" onClick={() => navigate('/map')} icon={<ArrowRight size={20} />}>
                            Start Exploring
                        </Button>
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
