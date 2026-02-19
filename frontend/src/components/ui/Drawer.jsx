import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './Drawer.css';

export default function Drawer({ isOpen, onClose, title, children, side = 'right' }) {
    const overlayRef = useRef(null);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="drawer-overlay"
            ref={overlayRef}
            onClick={(e) => e.target === overlayRef.current && onClose()}
        >
            <div className={`drawer drawer--${side}`}>
                <div className="drawer-header">
                    <h3 className="drawer-title">{title}</h3>
                    <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
                        <X size={20} />
                    </button>
                </div>
                <div className="drawer-body">{children}</div>
            </div>
        </div>
    );
}
