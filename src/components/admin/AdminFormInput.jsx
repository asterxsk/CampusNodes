import React from 'react';

/**
 * Reusable form input component for admin console
 * @param {string} label - Input label
 * @param {string} value - Input value
 * @param {Function} onChange - Change handler
 * @param {string} [type='text'] - Input type
 * @param {string} [placeholder] - Placeholder text
 * @param {boolean} [required] - Whether input is required
 * @param {string} [className=''] - Additional wrapper classes
 * @param {Object} [props] - Additional input props
 */
const AdminFormInput = ({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    required,
    className = '',
    ...props
}) => {
    return (
        <div className={className}>
            <label className="block text-xs text-gray-400 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-accent outline-none transition-colors"
                {...props}
            />
        </div>
    );
};

/**
 * Reusable textarea component for admin console
 * @param {string} label - Input label
 * @param {string} value - Input value
 * @param {Function} onChange - Change handler
 * @param {string} [placeholder] - Placeholder text
 * @param {boolean} [required] - Whether input is required
 * @param {string} [className=''] - Additional wrapper classes
 * @param {number} [rows=3] - Number of rows
 * @param {Object} [props] - Additional textarea props
 */
const AdminFormTextarea = ({
    label,
    value,
    onChange,
    placeholder,
    required,
    className = '',
    rows = 3,
    ...props
}) => {
    return (
        <div className={className}>
            <label className="block text-xs text-gray-400 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                rows={rows}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-accent outline-none transition-colors resize-none"
                {...props}
            />
        </div>
    );
};

/**
 * Reusable select component for admin console
 * @param {string} label - Input label
 * @param {string} value - Input value
 * @param {Function} onChange - Change handler
 * @param {Array} options - Array of {value, label} options
 * @param {boolean} [required] - Whether input is required
 * @param {string} [className=''] - Additional wrapper classes
 * @param {Object} [props] - Additional select props
 */
const AdminFormSelect = ({
    label,
    value,
    onChange,
    options,
    required,
    className = '',
    ...props
}) => {
    return (
        <div className={className}>
            <label className="block text-xs text-gray-400 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
                value={value}
                onChange={onChange}
                required={required}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-accent outline-none transition-colors"
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export { AdminFormInput, AdminFormTextarea, AdminFormSelect };
export default AdminFormInput;
