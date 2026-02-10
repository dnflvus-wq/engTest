import { useState, useEffect, useRef } from 'react';

const ClaySelect = ({ value, onChange, options = [], placeholder = 'Select...', className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

    return (
        <div className={`custom-select-wrapper ${className}`} ref={wrapperRef}>
            <div
                className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{selectedLabel}</span>
                <i className="fa-solid fa-chevron-down arrow"></i>
            </div>
            <div className={`custom-options ${isOpen ? '' : 'hidden'}`}>
                {options.length === 0 ? (
                    <div className="custom-option">No options available</div>
                ) : (
                    options.map((opt, idx) => (
                        <div
                            key={opt.value ?? idx}
                            className={`custom-option ${value === opt.value ? 'selected' : ''}`}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                        >
                            {opt.label}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ClaySelect;
