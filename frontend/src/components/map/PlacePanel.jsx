import { useState, useEffect, useCallback } from 'react';
import { X, MapPin, Users, Clock, Plus, Lock } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import GroupCard from '../group/GroupCard';
import GroupFilters from '../group/GroupFilters';
import CreateGroupForm from '../group/CreateGroupForm';
import JoinPrivateForm from '../group/JoinPrivateForm';
import { useAuth } from '../../context/AuthContext';
import { groupService } from '../../services/groupService';
import './PlacePanel.css';

const CATEGORY_LABELS = {
    CAFE: { label: 'Café', variant: 'cafe' },
    RESTAURANT: { label: 'Restaurant', variant: 'restaurant' },
    MALL: { label: 'Mall', variant: 'activity' },
    CINEMA: { label: 'Cinema', variant: 'activity' },
    BOWLING_ALLEY: { label: 'Bowling', variant: 'activity' },
    BAR: { label: 'Bar', variant: 'activity' },
    NIGHTCLUB: { label: 'Nightclub', variant: 'activity' },
    AMUSEMENT_PARK: { label: 'Amusement', variant: 'activity' },
    PLACE_OF_WORSHIP: { label: 'Place of Worship', variant: 'worship' },
    TOURIST: { label: 'Tourist Spot', variant: 'tourist' },
    PARK: { label: 'Park', variant: 'activity' },
    ACTIVITY: { label: 'Activity', variant: 'activity' },
    CAMPUS: { label: 'Campus', variant: 'activity' },
};

export default function PlacePanel({ place, onClose, onLoginRequired, onGroupChange, myGroups = [] }) {
    const { isAuthenticated } = useAuth();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showJoinPrivate, setShowJoinPrivate] = useState(false);
    const [groups, setGroups] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchPlaceGroups = useCallback(async () => {
        if (!place) return;
        setLoading(true);
        try {
            const placeId = place.id || place.externalPlaceId;
            if (placeId) {
                const res = await groupService.getGroupsByPlace(placeId);
                if (res?.data) {
                    setGroups(res.data);
                }
            }
        } catch (err) {
            console.error('Failed to fetch place groups', err);
        } finally {
            setLoading(false);
        }
    }, [place]);

    useEffect(() => {
        if (place) {
            setGroups([]);
            setFilteredGroups([]);
            fetchPlaceGroups();
        }
    }, [place, refreshKey, fetchPlaceGroups]);

    // Force a refresh of groups data
    const triggerRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
        if (onGroupChange) onGroupChange();
    }, [onGroupChange]);

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

    const handleExplore = () => {
        let url;

        if (place.name) {
            url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
        } else {
            const lat = place.latitude || place.coordinates?.[1];
            const lng = place.longitude || place.coordinates?.[0];
            if (lat && lng) {
                url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
            } else {
                // Fallback to a generic search if no data
                url = 'https://www.google.com/maps';
            }
        }

        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Build a set of joined group IDs for quick lookup
    const joinedGroupIds = new Set(myGroups.map((g) => g.id));

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
                <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExplore}
                    icon={<MapPin size={16} />}
                >
                    Explore this place
                </Button>
            </div>

            {loading && (
                <div className="place-panel-loading">
                    <span>Loading groups…</span>
                </div>
            )}

            {!loading && groups.length > 0 && (
                <>
                    <div className="place-panel-section-title">
                        <h4>Public Groups</h4>
                        <GroupFilters onFilterChange={setFilteredGroups} groups={groups} />
                    </div>
                    <div className="place-panel-groups">
                        {(filteredGroups.length > 0 ? filteredGroups : groups).map((g) => (
                            <GroupCard
                                key={g.id}
                                group={g}
                                onLoginRequired={onLoginRequired}
                                isJoined={joinedGroupIds.has(g.id)}
                                onGroupChange={triggerRefresh}
                            />
                        ))}
                    </div>
                </>
            )}

            {!loading && groups.length === 0 && (
                <div className="place-panel-empty">
                    <MapPin size={24} />
                    <p>No public groups here yet. Be the first to create one!</p>
                </div>
            )}

            {showCreateForm && (
                <CreateGroupForm
                    place={place}
                    isOpen={showCreateForm}
                    onClose={() => {
                        setShowCreateForm(false);
                        triggerRefresh();
                    }}
                />
            )}

            {showJoinPrivate && (
                <JoinPrivateForm
                    isOpen={showJoinPrivate}
                    onClose={() => {
                        setShowJoinPrivate(false);
                        triggerRefresh();
                    }}
                />
            )}
        </div>
    );
}
