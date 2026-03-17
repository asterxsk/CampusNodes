import React from 'react';
import { Plus, X, Trash2, Loader2 } from 'lucide-react';

/**
 * Reusable header component for admin tabs
 * @param {string} title - Tab title
 * @param {boolean} showForm - Whether form is visible
 * @param {Function} onToggleForm - Toggle form visibility
 * @param {Function} onClearAll - Clear all callback
 * @param {boolean} processing - Processing state
 * @param {string} [addButtonText='Add'] - Add button text
 * @param {string} [clearButtonText='Clear All'] - Clear button text
 * @param {string} [clearButtonVariant='danger'] - Clear button variant: 'danger' | 'default'
 * @param {React.ReactNode} [extraActions] - Additional action buttons
 */
const AdminTabHeader = ({
    title,
    showForm,
    onToggleForm,
    onClearAll,
    processing,
    addButtonText = 'Add',
    clearButtonText = 'Clear All',
    clearButtonVariant = 'danger',
    extraActions
}) => {
    return (
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <div className="flex gap-3 items-center">
                {extraActions}
                {onClearAll && (
                    <button
                        onClick={onClearAll}
                        disabled={processing}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm font-bold flex items-center gap-2 disabled:opacity-50 ${clearButtonVariant === 'danger'
                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {processing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        {clearButtonText}
                    </button>
                )}
                <button
                    onClick={onToggleForm}
                    className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-black rounded-lg transition-colors text-sm font-bold"
                >
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? 'Cancel' : addButtonText}
                </button>
            </div>
        </div>
    );
};

export default AdminTabHeader;
