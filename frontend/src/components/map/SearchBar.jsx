import { useState, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({ onSearch }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const debounceRef = useRef(null);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (val.length < 3) {
            setResults([]);
            setShowResults(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&addressdetails=1`
                );
                const data = await response.json();
                setResults(data);
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
                    {results.map((r) => (
                        <button
                            key={r.place_id}
                            className="search-result-item"
                            onClick={() => handleSelect(r)}
                        >
                            <MapPin size={14} />
                            <span>{r.display_name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
