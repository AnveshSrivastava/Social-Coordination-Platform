import { useState, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({ onSearch, userLocation }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isLocationBiased, setIsLocationBiased] = useState(false);
    const debounceRef = useRef(null);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (val.length < 3) {
            setResults([]);
            setShowResults(false);
            setIsLocationBiased(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const base = 'https://nominatim.openstreetmap.org/search';
                const url = new URL(base);

                url.searchParams.set('format', 'json');
                url.searchParams.set('q', val);
                url.searchParams.set('limit', '15');
                url.searchParams.set('addressdetails', '1');
                url.searchParams.set('accept-language', 'en');

                let proximityBias = false;
                if (userLocation?.lat && userLocation?.lng) {
                    proximityBias = true;
                    // Larger search radius: ~15km
                    const distance = 0.15;
                    const minLon = userLocation.lng - distance;
                    const maxLon = userLocation.lng + distance;
                    const minLat = userLocation.lat - distance;
                    const maxLat = userLocation.lat + distance;
                    
                    // Use strict bounding first
                    url.searchParams.set('viewbox', `${minLon},${maxLat},${maxLon},${minLat}`);
                    url.searchParams.set('bounded', '1');
                    url.searchParams.set('lat', String(userLocation.lat));
                    url.searchParams.set('lon', String(userLocation.lng));
                }

                const response = await fetch(url.toString(), {
                    headers: {
                        'User-Agent': 'social-coordination-platform/1.0 (your-email@example.com)',
                    },
                });
                let data = await response.json();

                // If bounded search returned no results, try wider search
                if (proximityBias && data.length === 0) {
                    const widerUrl = new URL(base);
                    widerUrl.searchParams.set('format', 'json');
                    widerUrl.searchParams.set('q', val);
                    widerUrl.searchParams.set('limit', '15');
                    widerUrl.searchParams.set('addressdetails', '1');
                    widerUrl.searchParams.set('accept-language', 'en');
                    widerUrl.searchParams.set('lat', String(userLocation.lat));
                    widerUrl.searchParams.set('lon', String(userLocation.lng));
                    // Wider distance: ~50km for fallback
                    const widerDistance = 0.4;
                    const minLon = userLocation.lng - widerDistance;
                    const maxLon = userLocation.lng + widerDistance;
                    const minLat = userLocation.lat - widerDistance;
                    const maxLat = userLocation.lat + widerDistance;
                    widerUrl.searchParams.set('viewbox', `${minLon},${maxLat},${maxLon},${minLat}`);
                    widerUrl.searchParams.set('bounded', '1');

                    const widerResponse = await fetch(widerUrl.toString(), {
                        headers: {
                            'User-Agent': 'social-coordination-platform/1.0',
                        },
                    });
                    data = await widerResponse.json();
                }

                // Calculate distance and apply aggressive proximity sorting
                const sorted = data
                    .map((item) => {
                        const itemLat = parseFloat(item.lat);
                        const itemLon = parseFloat(item.lon);
                        const dist = userLocation
                            ? Math.hypot(itemLat - userLocation.lat, itemLon - userLocation.lng)
                            : Number.MAX_VALUE;
                        return {
                            ...item,
                            distToUser: dist,
                        };
                    })
                    .sort((a, b) => a.distToUser - b.distToUser);

                setResults(sorted);
                setIsLocationBiased(proximityBias);
                setShowResults(true);
            } catch (err) {
                console.error('Geocoding error:', err);
            } finally {
                setSearching(false);
            }
        }, 400);
    };

    const handleSelect = (result) => {
        setQuery(result.display_name.split(',')[0]);
        setShowResults(false);
        onSearch({
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            name: result.display_name,
        });
    };

    return (
        <div className="search-bar glass">
            <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    className="search-input"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search places, areas..."
                    onFocus={() => results.length > 0 && setShowResults(true)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                />
                {searching && <Loader2 size={18} className="search-spinner" />}
            </div>

            {showResults && results.length > 0 && (
                <div className="search-results">
                    {isLocationBiased && results.length > 0 && (
                        <div className="search-bias-hint">
                            📍 Showing results near your location
                        </div>
                    )}
                    {results.map((r) => {
                        const distance = r.distToUser;
                        const distLabel =
                            distance < 1
                                ? `${(distance * 111).toFixed(0)} m`
                                : `${distance.toFixed(1)} km`;
                        return (
                            <button
                                key={r.place_id}
                                className="search-result-item"
                                onClick={() => handleSelect(r)}
                            >
                                <MapPin size={14} />
                                <div className="search-result-text">
                                    <span>{r.display_name}</span>
                                    {isLocationBiased && distance < Number.MAX_VALUE && (
                                        <span className="search-result-dist">{distLabel}</span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
