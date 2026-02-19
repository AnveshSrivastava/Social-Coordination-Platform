import { useState } from 'react';
import { Users } from 'lucide-react';
import MapView from '../components/map/MapView';
import SearchBar from '../components/map/SearchBar';
import PlacePanel from '../components/map/PlacePanel';
import Navbar from '../components/layout/Navbar';
import LoginModal from '../components/auth/LoginModal';
import MyGroupsDrawer from '../components/group/MyGroupsDrawer';
import ConfirmBanner from '../components/group/ConfirmBanner';
import ChatPanel from '../components/chat/ChatPanel';
import SOSButton from '../components/safety/SOSButton';
import { useAuth } from '../context/AuthContext';
import './MapPage.css';

export default function MapPage() {
    const { isAuthenticated } = useAuth();
    const [places, setPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [showMyGroups, setShowMyGroups] = useState(false);
    const [chatGroup, setChatGroup] = useState(null);
    const [searchResult, setSearchResult] = useState(null);

    // Placeholder groups (would come from user's actual groups in production)
    const [myGroups] = useState([]);

    // Check for groups needing confirmation
    const confirmGroup = myGroups.find((g) => g.status === 'CONFIRMATION');
    // Check for active group (for SOS)
    const activeGroup = myGroups.find((g) => g.status === 'ACTIVE');

    const handleSearch = (result) => {
        setSearchResult(result);
    };

    const handlePlaceSelect = (place) => {
        setSelectedPlace(place);
    };

    return (
        <div className="map-page">
            <Navbar onLoginClick={() => setShowLogin(true)} />

            <div className="map-wrapper">
                <MapView
                    onPlaceSelect={handlePlaceSelect}
                    places={places}
                    setPlaces={setPlaces}
                    setLoading={setLoading}
                    searchResult={searchResult}
                />

                <SearchBar onSearch={handleSearch} />

                {loading && (
                    <div className="map-loading">
                        <div className="map-loading-spinner" />
                        <span>Finding places...</span>
                    </div>
                )}
            </div>

            {/* Confirmation Banner */}
            {confirmGroup && <ConfirmBanner group={confirmGroup} />}

            {/* Place Panel */}
            {selectedPlace && (
                <PlacePanel
                    place={selectedPlace}
                    onClose={() => setSelectedPlace(null)}
                    onLoginRequired={() => setShowLogin(true)}
                />
            )}

            {/* My Groups FAB */}
            {isAuthenticated && (
                <button
                    className="my-groups-fab"
                    onClick={() => setShowMyGroups(true)}
                    title="My Groups"
                >
                    <Users size={22} />
                </button>
            )}

            {/* My Groups Drawer */}
            <MyGroupsDrawer
                isOpen={showMyGroups}
                onClose={() => setShowMyGroups(false)}
                groups={myGroups}
                onOpenChat={(g) => { setChatGroup(g); setShowMyGroups(false); }}
            />

            {/* Chat Panel */}
            <ChatPanel
                group={chatGroup}
                isOpen={!!chatGroup}
                onClose={() => setChatGroup(null)}
            />

            {/* SOS Button */}
            <SOSButton group={activeGroup} />

            {/* Login Modal */}
            <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </div>
    );
}
