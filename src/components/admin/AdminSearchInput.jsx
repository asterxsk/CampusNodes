import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Reusable search input component for admin console
 * @param {string} value - Current search value
 * @param {Function} onChange - Callback when value changes
 * @param {string} [placeholder='Search...'] - Placeholder text
 * @param {string} [className=''] - Additional CSS classes
 * @param {string} [width='w-64'] - Input width class
 */
const AdminSearchInput = ({
    value,
    onChange,
    placeholder = 'Search...',
    className = '',
    width = 'w-64'
}) => {
    return (
        <div className={`relative ${className}`}>
            <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
            />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent text-sm ${width}`}
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
};

export default AdminSearchInput;
