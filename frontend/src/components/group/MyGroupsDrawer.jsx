import { Users, MessageCircle, CalendarDays } from 'lucide-react';
import Drawer from '../ui/Drawer';
import Badge from '../ui/Badge';
import './MyGroupsDrawer.css';

const STATUS_MAP = {
    JOINABLE: { label: 'Upcoming', variant: 'primary' },
    CONFIRMATION: { label: 'Confirm', variant: 'warning' },
    ACTIVE: { label: 'Active', variant: 'success' },
    EXPIRED: { label: 'Expired', variant: 'default' },
    CREATED: { label: 'New', variant: 'primary' },
};

export default function MyGroupsDrawer({ isOpen, onClose, groups = [], onOpenChat }) {
    const activeGroups = groups.filter((g) => g.status === 'ACTIVE');
    const upcomingGroups = groups.filter((g) => ['JOINABLE', 'CONFIRMATION', 'CREATED'].includes(g.status));

    return (
        <Drawer isOpen={isOpen} onClose={onClose} title="My Groups">
            <div className="mgd-content">
                {activeGroups.length > 0 && (
                    <section className="mgd-section">
                        <h4 className="mgd-section-title">🟢 Active Now</h4>
                        {activeGroups.map((g) => (
                            <div key={g.id} className="mgd-group-item mgd-group-item--active">
                                <div className="mgd-group-info">
                                    <Badge variant="success">Active</Badge>
                                    <span className="mgd-group-meta">
                                        <Users size={12} /> {g.memberCount || 1}/{g.maxSize}
                                    </span>
                                </div>
                                <button className="mgd-chat-btn" onClick={() => onOpenChat?.(g)}>
                                    <MessageCircle size={16} />
                                    Chat
                                </button>
                            </div>
                        ))}
                    </section>
                )}

                {upcomingGroups.length > 0 && (
                    <section className="mgd-section">
                        <h4 className="mgd-section-title">📅 Upcoming</h4>
                        {upcomingGroups.map((g) => {
                            const st = STATUS_MAP[g.status] || STATUS_MAP.CREATED;
                            return (
                                <div key={g.id} className="mgd-group-item">
                                    <div className="mgd-group-info">
                                        <Badge variant={st.variant}>{st.label}</Badge>
                                        <span className="mgd-group-meta">
                                            <CalendarDays size={12} />
                                            {g.dateTime
                                                ? new Date(g.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                                                : 'TBD'}
                                        </span>
                                        <span className="mgd-group-meta">
                                            <Users size={12} /> {g.memberCount || 1}/{g.maxSize}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                )}

                {groups.length === 0 && (
                    <div className="mgd-empty">
                        <Users size={32} />
                        <p>You haven't joined any groups yet.</p>
                        <span>Tap on a place to find or create one!</span>
                    </div>
                )}
            </div>
        </Drawer>
    );
}
