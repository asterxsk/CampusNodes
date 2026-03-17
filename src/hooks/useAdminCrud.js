import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';

/**
 * Custom hook for unified CRUD operations in admin console
 * @param {string} table - The table name to perform operations on
 * @param {Function} [fetchFn] - Optional callback to refetch data after operations
 * @returns {Object} { handleDelete, handleClearAll, handleInsert, handleUpdate, processing }
 */
const useAdminCrud = (table, fetchFn = null) => {
    const { showConfirm } = useModal();
    const toast = useToast();
    const [processing, setProcessing] = useState(false);

    /**
     * Delete a single record with confirmation dialog
     * @param {string|number} id - The ID of the record to delete
     * @param {string} [idColumn='id'] - The column name for the ID
     * @param {Object} [options] - Additional options
     * @param {string} [options.storageBucket] - Optional storage bucket for file deletion
     * @param {string} [options.storagePath] - Optional path for storage deletion
     * @param {string} [options.successMessage='Record deleted successfully']
     * @param {string} [options.deleteMessage='Are you sure you want to delete this item? This action cannot be undone.']
     */
    const handleDelete = useCallback(async (id, idColumn = 'id', options = {}) => {
        const {
            storageBucket,
            storagePath,
            successMessage = 'Record deleted successfully',
            deleteMessage = 'Are you sure you want to delete this item? This action cannot be undone.',
            onDelete
        } = options;

        const confirmed = await showConfirm({
            title: `Delete ${table.slice(0, -1) || 'Item'}`,
            message: deleteMessage,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger'
        });

        if (!confirmed) return false;

        setProcessing(true);
        try {
            // Delete from storage if bucket and path provided
            if (storageBucket && storagePath) {
                const pathParts = storagePath.split('/');
                const fileName = pathParts[pathParts.length - 1];
                await supabase.storage.from(storageBucket).remove([fileName]);
            }

            // Delete from database
            const { error } = await supabase
                .from(table)
                .delete()
                .eq(idColumn, id);

            if (error) throw error;

            // Custom onDelete callback
            if (onDelete) {
                await onDelete(id);
            }

            // Refetch data
            if (fetchFn) {
                await fetchFn();
            }

            toast.success(successMessage);
            return true;
        } catch (error) {
            console.error('Error deleting record:', error);
            toast.error(`Failed to delete: ${error.message}`);
            return false;
        } finally {
            setProcessing(false);
        }
    }, [table, fetchFn, showConfirm, toast]);

    /**
     * Clear all records from the table with confirmation
     * @param {Object} [options] - Additional options
     * @param {string} [options.successMessage='All records cleared successfully']
     * @param {string} [options.clearMessage='Are you absolutely sure? This will permanently delete ALL records from the database. This action cannot be undone.']
     */
    const handleClearAll = useCallback(async (options = {}) => {
        const {
            successMessage = 'All records cleared successfully',
            clearMessage = 'Are you absolutely sure? This will permanently delete ALL records from the database. This action cannot be undone.'
        } = options;

        const confirmed = await showConfirm({
            title: `Clear All ${table}`,
            message: clearMessage,
            confirmText: 'Delete All',
            cancelText: 'Cancel',
            variant: 'danger'
        });

        if (!confirmed) return false;

        setProcessing(true);
        try {
            // Use neq filter to delete all records
            const { error } = await supabase
                .from(table)
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (error) throw error;

            // Refetch data
            if (fetchFn) {
                await fetchFn();
            }

            toast.success(successMessage);
            return true;
        } catch (error) {
            console.error('Error clearing records:', error);
            toast.error(`Failed to clear: ${error.message}`);
            return false;
        } finally {
            setProcessing(false);
        }
    }, [table, fetchFn, showConfirm, toast]);

    /**
     * Insert a new record
     * @param {Object} data - The data to insert
     * @param {string} [successMessage='Record added successfully']
     */
    const handleInsert = useCallback(async (data, successMessage = 'Record added successfully') => {
        setProcessing(true);
        try {
            const { error } = await supabase
                .from(table)
                .insert([data]);

            if (error) throw error;

            // Refetch data
            if (fetchFn) {
                await fetchFn();
            }

            toast.success(successMessage);
            return true;
        } catch (error) {
            console.error('Error inserting record:', error);
            toast.error(`Failed to add: ${error.message}`);
            return false;
        } finally {
            setProcessing(false);
        }
    }, [table, fetchFn, toast]);

    /**
     * Update an existing record
     * @param {string|number} id - The ID of the record to update
     * @param {Object} data - The data to update
     * @param {string} [idColumn='id'] - The column name for the ID
     * @param {string} [successMessage='Record updated successfully']
     */
    const handleUpdate = useCallback(async (id, data, idColumn = 'id', successMessage = 'Record updated successfully') => {
        setProcessing(true);
        try {
            const { error } = await supabase
                .from(table)
                .update(data)
                .eq(idColumn, id);

            if (error) throw error;

            // Refetch data
            if (fetchFn) {
                await fetchFn();
            }

            toast.success(successMessage);
            return true;
        } catch (error) {
            console.error('Error updating record:', error);
            toast.error(`Failed to update: ${error.message}`);
            return false;
        } finally {
            setProcessing(false);
        }
    }, [table, fetchFn, toast]);

    return {
        handleDelete,
        handleClearAll,
        handleInsert,
        handleUpdate,
        processing,
        setProcessing
    };
};

export default useAdminCrud;
