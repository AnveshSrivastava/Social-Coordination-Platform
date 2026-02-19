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
    ACTIVITY: { emoji: '🎯', cssClass: 'activity', label: 'Activity' },
    CAMPUS: { emoji: '🏫', cssClass: 'activity', label: 'Campus' },
    PARK: { emoji: '🌳', cssClass: 'activity', label: 'Park' },
    TOURIST: { emoji: '📸', cssClass: 'activity', label: 'Tourist Spot' },
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
function LocationHandler({ onLocationFound }) {
    const map = useMap();

    useEffect(() => {
        map.locate({ setView: true, maxZoom: DEFAULT_ZOOM });
        map.on('locationfound', (e) => {
            onLocationFound(e.latlng);
        });
        map.on('locationerror', () => {
            console.warn('Geolocation denied or unavailable.');
        });
    }, [map, onLocationFound]);

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

/* ─── Inner component: fetch on map move ─── */
function MapMoveHandler({ onMoveEnd }) {
    useMapEvents({
        moveend: (e) => {
            const center = e.target.getCenter();
            onMoveEnd(center);
        },
    });
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
    park: 'PARK',
    garden: 'PARK',
    playground: 'ACTIVITY',
    bar: 'RESTAURANT',
    fast_food: 'RESTAURANT',
    ice_cream: 'CAFE',
    pub: 'RESTAURANT',
    attraction: 'TOURIST',
    museum: 'TOURIST',
    viewpoint: 'TOURIST',
    artwork: 'TOURIST',
    theme_park: 'ACTIVITY',
    cinema: 'ACTIVITY',
    theatre: 'ACTIVITY',
    bowling_alley: 'ACTIVITY',
    water_park: 'ACTIVITY',
};

async function fetchOverpassPlaces(lat, lng, radiusMeters = 1500) {
    const query = `
    [out:json][timeout:8];
    (
      node["amenity"~"cafe|restaurant|fast_food|bar|pub|ice_cream"](around:${radiusMeters},${lat},${lng});
      node["leisure"~"park|garden|playground"](around:${radiusMeters},${lat},${lng});
      node["tourism"~"attraction|museum|viewpoint|artwork|theme_park"](around:${radiusMeters},${lat},${lng});
    );
    out body 50;
  `;

    const res = await fetch(OVERPASS_URL, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!res.ok) throw new Error('Overpass fetch failed');
    const json = await res.json();

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
}

/* ════════════════════════════════════════════
   MAIN MapView COMPONENT
   ════════════════════════════════════════════ */
export default function MapView({ onPlaceSelect, places, setPlaces, setLoading, searchResult }) {
    const [userPos, setUserPos] = useState(null);
    const lastFetchRef = useRef(null);
    const fetchingRef = useRef(false);

    /* ── Handle location found ── */
    const handleLocationFound = useCallback((latlng) => {
        setUserPos(latlng);
        loadPlaces(latlng.lat, latlng.lng);
    }, []);

    /* ── Handle map move ── */
    const handleMoveEnd = useCallback((center) => {
        if (lastFetchRef.current) {
            const dist = center.distanceTo(lastFetchRef.current);
            if (dist < 300) return; // debounce within 300m
        }
        loadPlaces(center.lat, center.lng);
    }, []);

    /* ── Load places (backend + Overpass fallback) ── */
    const loadPlaces = async (lat, lng) => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;
        lastFetchRef.current = L.latLng(lat, lng);
        setLoading(true);

        try {
            // Try backend first
            const res = await placeService.getNearby(lat, lng, 2000);
            if (res?.data && res.data.length > 0) {
                const filtered = res.data.filter((p) =>
                    ['CAFE', 'RESTAURANT', 'ACTIVITY', 'PARK', 'TOURIST'].includes(p.category)
                );
                if (filtered.length > 0) {
                    setPlaces(filtered);
                    setLoading(false);
                    fetchingRef.current = false;
                    return;
                }
            }
        } catch {
            // Backend unavailable — fall through to Overpass
        }

        // Fallback: Overpass API for real OSM data
        try {
            const osmPlaces = await fetchOverpassPlaces(lat, lng);
            setPlaces(osmPlaces);
        } catch (err) {
            console.error('Overpass fetch failed:', err);
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    };

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
                <LocationHandler onLocationFound={handleLocationFound} />
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
                {places.map((place) => {
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
