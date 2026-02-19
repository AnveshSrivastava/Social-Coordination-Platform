import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { CalendarDays, Users, Lock, Globe } from 'lucide-react';
import { groupService } from '../../services/groupService';
import { useToast } from '../../context/ToastContext';
import './CreateGroupForm.css';

export default function CreateGroupForm({ place, isOpen, onClose }) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        dateTime: '',
        maxSize: 4,
        visibility: 'PUBLIC',
        inviteCode: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const body = {
                dateTime: new Date(form.dateTime).toISOString(),
                maxSize: parseInt(form.maxSize),
                visibility: form.visibility,
            };

            // Use mapPlace flow if place has external data
            if (place.externalPlaceId || place.source === 'MAP') {
                body.mapPlace = {
                    name: place.name,
                    category: place.category,
                    latitude: place.latitude || place.coordinates?.[1],
                    longitude: place.longitude || place.coordinates?.[0],
                    externalPlaceId: place.externalPlaceId || place.id,
                    source: 'MAP',
                };
            } else {
                body.placeId = place.id;
            }

            if (form.visibility === 'PRIVATE') {
                body.inviteCode = form.inviteCode;
            }

            await groupService.create(body);
            toast.success('Group created successfully!');
            onClose();
        } catch (err) {
            toast.error(err.message || 'Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create a Group" size="md">
            <form className="create-group-form" onSubmit={handleSubmit}>
                <div className="cgf-place-badge">
                    <span>📍 {place.name}</span>
                </div>

                <Input
                    label="Date & Time"
                    type="datetime-local"
                    value={form.dateTime}
                    onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                    icon={<CalendarDays size={18} />}
                    required
                    min={new Date().toISOString().slice(0, 16)}
                />

                <div className="cgf-row">
                    <div className="cgf-field">
                        <label className="input-label">
                            <Users size={14} /> Group Size
                        </label>
                        <div className="cgf-size-selector">
                            {[2, 3, 4, 5, 6].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    className={`cgf-size-btn ${form.maxSize === n ? 'cgf-size-btn--active' : ''}`}
                                    onClick={() => setForm({ ...form, maxSize: n })}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="cgf-field">
                        <label className="input-label">Visibility</label>
                        <div className="cgf-vis-selector">
                            <button
                                type="button"
                                className={`cgf-vis-btn ${form.visibility === 'PUBLIC' ? 'cgf-vis-btn--active' : ''}`}
                                onClick={() => setForm({ ...form, visibility: 'PUBLIC' })}
                            >
                                <Globe size={14} /> Public
                            </button>
                            <button
                                type="button"
                                className={`cgf-vis-btn ${form.visibility === 'PRIVATE' ? 'cgf-vis-btn--active' : ''}`}
                                onClick={() => setForm({ ...form, visibility: 'PRIVATE' })}
                            >
                                <Lock size={14} /> Private
                            </button>
                        </div>
                    </div>
                </div>

                {form.visibility === 'PRIVATE' && (
                    <Input
                        label="Invite Code"
                        type="text"
                        value={form.inviteCode}
                        onChange={(e) => setForm({ ...form, inviteCode: e.target.value })}
                        placeholder="Create a code for your group"
                        icon={<Lock size={18} />}
                        required
                    />
                )}

                <Button type="submit" fullWidth loading={loading} size="lg">
                    Create Group
                </Button>
            </form>
        </Modal>
    );
}
