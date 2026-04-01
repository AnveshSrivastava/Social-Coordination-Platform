import { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair } from 'lucide-react';
import { placeService } from '../../services/placeService';
import './MapView.css';

const DEFAULT_ZOOM = 15;

const CATEGORY_CONFIG = {
    CAFE: { emoji: '☕', cssClass: 'cafe', label: 'Café' },
    RESTAURANT: { emoji: '🍽️', cssClass: 'restaurant', label: 'Restaurant' },
    MALL: { emoji: '🛍️', cssClass: 'mall', label: 'Mall' },
    CINEMA: { emoji: '🎬', cssClass: 'cinema', label: 'Cinema' },
    BOWLING_ALLEY: { emoji: '🎳', cssClass: 'bowling', label: 'Bowling Alley' },
    BAR: { emoji: '🍸', cssClass: 'bar', label: 'Bar' },
    NIGHTCLUB: { emoji: '🕺', cssClass: 'nightclub', label: 'Nightclub' },
    AMUSEMENT_PARK: { emoji: '🎡', cssClass: 'amusement', label: 'Amusement Park' },
    PLACE_OF_WORSHIP: { emoji: '🛕', cssClass: 'worship', label: 'Place of Worship' },
    PARK: { emoji: '🌳', cssClass: 'park', label: 'Park' },
    TOURIST: { emoji: '📸', cssClass: 'tourist', label: 'Tourist Spot' },
    ACTIVITY: { emoji: '🎯', cssClass: 'activity', label: 'Activity' },
};

function createPinIcon(category) {
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.ACTIVITY;
    return L.divIcon({
        className: '',
        html: `<div class="map-pin map-pin--${config.cssClass}"><span class="map-pin-inner">${config.emoji}</span></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
    });
}

/* ─── Inner component: handles geolocation + watch ─── */
function LocationHandler({ onLocationFound, onUserLocationChange }) {
    const map = useMap();

    useEffect(() => {
        map.locate({ setView: true, maxZoom: DEFAULT_ZOOM });
        map.on('locationfound', (e) => {
            onLocationFound(e.latlng);
            if (onUserLocationChange) {
                onUserLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng });
            }
        });
        map.on('locationerror', () => {
            console.warn('Geolocation denied or unavailable.');
        });
    }, [map, onLocationFound, onUserLocationChange]);

    return null;
}

/* ─── Inner component: fly to search result ─── */
function SearchResultHandler({ searchResult }) {
    const map = useMap();
    useEffect(() => {
        if (searchResult) {
            map.flyTo([searchResult.lat, searchResult.lng], DEFAULT_ZOOM, { duration: 1.5 });
        }
    }, [searchResult, map]);
    return null;
}

/* ─── Inner component: fetch on map move (debounced) ─── */
function MapMoveHandler({ onMoveEnd }) {
    const debounceRef = useRef(null);
    useMapEvents({
        moveend: (e) => {
            const map = e.target;
            const center = map.getCenter();
            const zoom = map.getZoom();

            // skip huge viewport queries at low zoom level to avoid Overpass 504
            if (zoom < 11) {
                return;
            }

            // Clear any pending debounce
            if (debounceRef.current) clearTimeout(debounceRef.current);
            // Wait 1.2 seconds after last move before fetching
            debounceRef.current = setTimeout(() => {
                onMoveEnd(center);
            }, 1200);
        },
    });
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);
    return null;
}

/* ─── Inner component: RECENTER button (Uber-style) ─── */
function RecenterButton({ userPos }) {
    const map = useMap();
    if (!userPos) return null;

    const handleRecenter = () => {
        map.flyTo(userPos, DEFAULT_ZOOM, { duration: 0.8 });
    };

    return (
        <button
            className="recenter-btn"
            onClick={handleRecenter}
            title="Back to my location"
            aria-label="Recenter map to my location"
        >
            <Crosshair size={20} />
        </button>
    );
}

/* ─── Inner component: ZOOM gesture fix ─── */
function ZoomFix() {
    const map = useMap();
    useEffect(() => {
        // Enable all zoom interactions
        map.scrollWheelZoom.enable();
        map.doubleClickZoom.enable();
        if (map.touchZoom) map.touchZoom.enable();
        if (map.boxZoom) map.boxZoom.enable();
        map.dragging.enable();
    }, [map]);
    return null;
}

/* ─── Overpass API: fetch real OSM nearby places ─── */
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const OVERPASS_CATEGORY_MAP = {
    cafe: 'CAFE',
    restaurant: 'RESTAURANT',
    bar: 'BAR',
    pub: 'BAR',
    fast_food: 'RESTAURANT',
    ice_cream: 'CAFE',
    cinema: 'CINEMA',
    bowling_alley: 'BOWLING_ALLEY',
    nightclub: 'NIGHTCLUB',
    place_of_worship: 'PLACE_OF_WORSHIP',
    attraction: 'TOURIST',
    museum: 'TOURIST',
    theme_park: 'AMUSEMENT_PARK',
    amusement_park: 'AMUSEMENT_PARK',
    mall: 'MALL',
};

/* ─── Retry with exponential backoff for resilience ─── */
async function fetchWithRetry(url, options, maxRetries = 3, baseDelayMs = 1000) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

            const res = await fetch(url, {
                ...options,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (res.ok) return res;

            // Retry on 429 (rate limit) or 503/504 (server errors)
            if ([429, 503, 504].includes(res.status) && attempt < maxRetries - 1) {
                const delayMs = baseDelayMs * Math.pow(2, attempt);
                console.warn(`Overpass returned ${res.status}, retrying in ${delayMs}ms...`);
                await new Promise((r) => setTimeout(r, delayMs));
                continue;
            }

            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        } catch (err) {
            // Retry on network/timeout errors
            if (attempt < maxRetries - 1 && (err.name === 'AbortError' || err instanceof TypeError)) {
                const delayMs = baseDelayMs * Math.pow(2, attempt);
                console.warn(`Overpass request failed (${err.message}), retrying in ${delayMs}ms...`);
                await new Promise((r) => setTimeout(r, delayMs));
                continue;
            }

            throw err;
        }
    }
}

async function fetchOverpassPlaces(lat, lng, radiusMeters = 1200) {
    // Avoid too large area on each map move to prevent 504 gateway timeout.
    const query = `
    [out:json][timeout:10];
    (
      node["amenity"~"cafe|restaurant|fast_food|bar|pub|ice_cream|cinema|bowling_alley|nightclub|place_of_worship"](around:${radiusMeters},${lat},${lng});
      way["amenity"~"cafe|restaurant|fast_food|bar|pub|ice_cream|cinema|bowling_alley|nightclub|place_of_worship"](around:${radiusMeters},${lat},${lng});
      node["tourism"~"attraction|museum|theme_park|amusement_park"](around:${radiusMeters},${lat},${lng});
      way["tourism"~"attraction|museum|theme_park|amusement_park"](around:${radiusMeters},${lat},${lng});
      node["shop"="mall"](around:${radiusMeters},${lat},${lng});
      way["shop"="mall"](around:${radiusMeters},${lat},${lng});
    );
    out center 80;
  `;

    try {
        const res = await fetchWithRetry(OVERPASS_URL, {
            method: 'POST',
            body: `data=${encodeURIComponent(query)}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const json = await res.json();

        if (!json.elements) {
            console.warn('Overpass API returned empty elements array');
            return [];
        }

        const seen = new Set();
        return json.elements
            .filter((el) => el.tags?.name && el.lat && el.lon)
            .filter((el) => {
                // Deduplicate by name + rough location
                const key = `${el.tags.name}_${el.lat.toFixed(3)}_${el.lon.toFixed(3)}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .map((el) => {
                const amenity = el.tags.amenity || el.tags.leisure || el.tags.tourism || '';
                const category = OVERPASS_CATEGORY_MAP[amenity] || 'ACTIVITY';
                return {
                    id: `osm-${el.id}`,
                    name: el.tags.name,
                    category,
                    latitude: el.lat,
                    longitude: el.lon,
                    source: 'OSM',
                    externalPlaceId: `osm-${el.id}`,
                    tags: el.tags,
                };
            });
    } catch (err) {
        console.error('Overpass API failed after retries:', err.message);
        // Return empty array instead of crashing
        return [];
    }
}

/* ════════════════════════════════════════════
   MAIN MapView COMPONENT
   ════════════════════════════════════════════ */
const ALLOWED_PLACE_CATEGORIES = new Set([
    'CAFE',
    'RESTAURANT',
    'MALL',
    'CINEMA',
    'BOWLING_ALLEY',
    'BAR',
    'NIGHTCLUB',
    'TOURIST',
    'AMUSEMENT_PARK',
    'PLACE_OF_WORSHIP',
    'ACTIVITY',
]);

export default function MapView({ onPlaceSelect, places, setPlaces, setLoading, searchResult, onUserLocationChange, placeFilter }) {
    const [userPos, setUserPos] = useState(null);
    const lastFetchRef = useRef(null);
    const fetchingRef = useRef(false);

    /* ── Load places (backend + Overpass fallback) ── */
    const loadPlaces = useCallback(async (lat, lng) => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;
        lastFetchRef.current = L.latLng(lat, lng);
        setLoading(true);

        try {
            // Try backend first
            const res = await placeService.getNearby(lat, lng, 2000);
            if (res?.data && res.data.length > 0) {
                const filtered = res.data.filter((p) => ALLOWED_PLACE_CATEGORIES.has(p.category));
                if (filtered.length > 0) {
                    setPlaces(filtered);
                    setLoading(false);
                    fetchingRef.current = false;
                    return;
                }
            }
        } catch (err) {
            console.warn('Backend place service unavailable, falling back to Overpass API:', err.message);
            // Backend unavailable — fall through to Overpass
        }

        // Fallback: Overpass API for real OSM data
        try {
            const osmPlaces = await fetchOverpassPlaces(lat, lng);
            if (osmPlaces.length > 0) {
                const normalized = osmPlaces.filter((p) => ALLOWED_PLACE_CATEGORIES.has(p.category));
                setPlaces(normalized);
            } else {
                console.warn('No places found from Overpass API');
                setPlaces([]);
            }
        } catch (err) {
            console.error('Fatal error loading places:', err.message);
            setPlaces([]); // Show empty state
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, [setPlaces, setLoading]);

    /* ── Handle location found ── */
    const handleLocationFound = useCallback(
        (latlng) => {
            setUserPos(latlng);
            if (onUserLocationChange) onUserLocationChange({ lat: latlng.lat, lng: latlng.lng });
            loadPlaces(latlng.lat, latlng.lng);
        },
        [loadPlaces, onUserLocationChange]
    );

    /* ── Handle map move ── */
    const handleMoveEnd = useCallback(
        (center) => {
            if (lastFetchRef.current) {
                const dist = center.distanceTo(lastFetchRef.current);
                if (dist < 300) return; // debounce within 300m
            }
            loadPlaces(center.lat, center.lng);
        },
        [loadPlaces]
    );

    const defaultCenter = [28.6139, 77.2090]; // Delhi

    return (
        <div className="map-view-wrapper">
            <MapContainer
                center={defaultCenter}
                zoom={DEFAULT_ZOOM}
                className="map-container"
                zoomControl={true}
                attributionControl={false}
                scrollWheelZoom={true}
                doubleClickZoom={true}
                touchZoom={true}
                boxZoom={true}
                dragging={true}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                <LocationHandler onLocationFound={handleLocationFound} onUserLocationChange={onUserLocationChange} />
                <MapMoveHandler onMoveEnd={handleMoveEnd} />
                <SearchResultHandler searchResult={searchResult} />
                <ZoomFix />
                <RecenterButton userPos={userPos} />

                {/* User location marker */}
                {userPos && (
                    <Marker
                        position={userPos}
                        icon={L.divIcon({
                            className: '',
                            html: '<div class="user-pin"><div class="user-pin-dot"></div><div class="user-pin-ring"></div></div>',
                            iconSize: [20, 20],
                            iconAnchor: [10, 10],
                        })}
                    />
                )}

                {/* Place markers */}
                {places
                    .filter((place) => {
                        if (!placeFilter || placeFilter === 'ALL') return true;
                        return place.category === placeFilter;
                    })
                    .map((place) => {
                        const lat = place.latitude || place.coordinates?.[1];
                        const lng = place.longitude || place.coordinates?.[0];
                        if (!lat || !lng) return null;
                        const catConfig = CATEGORY_CONFIG[place.category] || CATEGORY_CONFIG.ACTIVITY;
                        return (
                        <Marker
                            key={place.id}
                            position={[lat, lng]}
                            icon={createPinIcon(place.category)}
                            eventHandlers={{
                                click: () => onPlaceSelect(place),
                            }}
                        >
                            <Popup className="place-popup" closeButton={false} autoPan={false}>
                                <div className="place-popup-content">
                                    <span className="place-popup-emoji">{catConfig.emoji}</span>
                                    <div>
                                        <strong>{place.name}</strong>
                                        <span className="place-popup-cat">{catConfig.label}</span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
