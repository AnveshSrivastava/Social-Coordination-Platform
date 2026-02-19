import { useState, useEffect } from 'react';
import { X, MapPin, Users, Clock, Plus, Lock } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import GroupCard from '../group/GroupCard';
import GroupFilters from '../group/GroupFilters';
import CreateGroupForm from '../group/CreateGroupForm';
import JoinPrivateForm from '../group/JoinPrivateForm';
import { useAuth } from '../../context/AuthContext';
import { placeService } from '../../services/placeService';
import './PlacePanel.css';

const CATEGORY_LABELS = {
    CAFE: { label: 'Café', variant: 'cafe' },
    RESTAURANT: { label: 'Restaurant', variant: 'restaurant' },
    ACTIVITY: { label: 'Activity', variant: 'activity' },
    CAMPUS: { label: 'Campus', variant: 'activity' },
};

export default function PlacePanel({ place, onClose, onLoginRequired }) {
    const { isAuthenticated } = useAuth();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showJoinPrivate, setShowJoinPrivate] = useState(false);
    const [groups, setGroups] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [loading, setLoading] = useState(false);

    /* In a real app, we'd fetch groups for this place from the backend.
       Since there's no direct "GET /groups?placeId=X" endpoint, this is a placeholder.
       The place panel shows the place info and group interaction UI. */
    useEffect(() => {
        if (place) {
            // Mock groups for display - in production these would come from a backend endpoint
            setGroups([]);
            setFilteredGroups([]);
        }
    }, [place]);

    if (!place) return null;

    const cat = CATEGORY_LABELS[place.category] || CATEGORY_LABELS.ACTIVITY;

    const handleAction = (action) => {
        if (!isAuthenticated) {
            onLoginRequired();
            return;
        }
        if (action === 'create') setShowCreateForm(true);
        if (action === 'joinPrivate') setShowJoinPrivate(true);
    };

    return (
        <div className="place-panel animate-slide-up">
            <div className="place-panel-handle" />
            <button className="place-panel-close" onClick={onClose}>
                <X size={20} />
            </button>

            <div className="place-panel-header">
                <div className="place-panel-info">
                    <h3 className="place-panel-name">{place.name}</h3>
                    <div className="place-panel-meta">
                        <Badge variant={cat.variant}>{cat.label}</Badge>
                        {place.activeGroupCount > 0 && (
                            <span className="place-panel-active">
                                <Users size={14} />
                                {place.activeGroupCount} active group{place.activeGroupCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="place-panel-actions">
                <Button
                    size="sm"
                    onClick={() => handleAction('create')}
                    icon={<Plus size={16} />}
                >
                    Create Group
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction('joinPrivate')}
                    icon={<Lock size={16} />}
                >
                    Join Private
                </Button>
            </div>

            {groups.length > 0 && (
                <>
                    <div className="place-panel-section-title">
                        <h4>Public Groups</h4>
                        <GroupFilters onFilterChange={setFilteredGroups} groups={groups} />
                    </div>
                    <div className="place-panel-groups">
                        {(filteredGroups.length > 0 ? filteredGroups : groups).map((g) => (
                            <GroupCard key={g.id} group={g} onLoginRequired={onLoginRequired} />
                        ))}
                    </div>
                </>
            )}

            {groups.length === 0 && (
                <div className="place-panel-empty">
                    <MapPin size={24} />
                    <p>No public groups here yet. Be the first to create one!</p>
                </div>
            )}

            {showCreateForm && (
                <CreateGroupForm
                    place={place}
                    isOpen={showCreateForm}
                    onClose={() => setShowCreateForm(false)}
                />
            )}

            {showJoinPrivate && (
                <JoinPrivateForm
                    isOpen={showJoinPrivate}
                    onClose={() => setShowJoinPrivate(false)}
                />
            )}
        </div>
    );
}
