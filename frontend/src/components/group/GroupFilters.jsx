import { useState } from 'react';
import { Filter } from 'lucide-react';
import './GroupFilters.css';

export default function GroupFilters({ onFilterChange, groups }) {
    const [date, setDate] = useState('');
    const [minMembers, setMinMembers] = useState('');

    const applyFilters = (newDate, newMin) => {
        let filtered = [...groups];
        if (newDate) {
            filtered = filtered.filter((g) => {
                const gDate = new Date(g.dateTime).toDateString();
                return gDate === new Date(newDate).toDateString();
            });
        }
        if (newMin) {
            filtered = filtered.filter((g) => (g.memberCount || 1) >= parseInt(newMin));
        }
        onFilterChange(filtered);
    };

    return (
        <div className="group-filters">
            <Filter size={14} />
            <input
                type="date"
                className="gf-input"
                value={date}
                onChange={(e) => { setDate(e.target.value); applyFilters(e.target.value, minMembers); }}
                title="Filter by date"
            />
            <select
                className="gf-input"
                value={minMembers}
                onChange={(e) => { setMinMembers(e.target.value); applyFilters(date, e.target.value); }}
                title="Min members"
            >
                <option value="">Members</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
            </select>
        </div>
    );
}
