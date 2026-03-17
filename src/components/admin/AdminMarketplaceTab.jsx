import React, { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2, Image as ImageIcon, Loader2, X, AlertCircle, Edit2 } from 'lucide-react';
import useAdminFetch from '../../hooks/useAdminFetch';
import useAdminCrud from '../../hooks/useAdminCrud';
import AdminTabHeader from './AdminTabHeader';
import AdminFormInput, { AdminFormSelect } from './AdminFormInput';
import AdminCardGrid from './AdminCardGrid';
import AdminLoadingSpinner from './AdminLoadingSpinner';
import AdminEmptyState from './AdminEmptyState';

const CATEGORIES = ['Lab Gear', 'Electronics', 'Tools'];

const AdminMarketplaceTab = () => {
    const toast = useToast();
    const { data: items, loading, error, fetch } = useAdminFetch(
        'marketplace_items',
        'created_at',
        'desc'
    );
    const { handleDelete, handleClearAll, processing } = useAdminCrud(
        'marketplace_items',
        fetch
    );
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [seller, setSeller] = useState('CampusNodes Admin');
    const [trustScore, setTrustScore] = useState(0);
    const [imageFiles, setImageFiles] = useState([]);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(prev => [...prev, ...files].slice(0, 4)); // Max 4 images
    };

    const removeFile = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };
    
    const resetForm = useCallback(() => {
        setEditingItem(null);
        setTitle('');
        setPrice('');
        setCategory(CATEGORIES[0]);
        setSeller('CampusNodes Admin');
        setTrustScore(0);
        setImageFiles([]);
        setShowForm(false);
    }, []);

    const handleEdit = (item) => {
        setEditingItem(item);
        setTitle(item.title);
        setPrice(item.price);
        setCategory(item.category);
        setSeller(item.seller);
        setTrustScore(item.trust_score || 0);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !price) return;

        setUploading(true);
        try {
            let currentImageUrl = editingItem?.image_url || null;

            // Handle image upload if new files selected
            if (imageFiles.length > 0) {
                const imageUrls = [];
                for (const file of imageFiles) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage
                        .from('marketplace-images')
                        .upload(fileName, file);

                    if (uploadError) throw uploadError;

                    const { data } = supabase.storage.from('marketplace-images').getPublicUrl(fileName);
                    imageUrls.push(data.publicUrl);
                }
                currentImageUrl = imageUrls[0];
            }

            const itemData = {
                title,
                price,
                category,
                seller,
                trust_score: parseInt(trustScore) || 100,
                image_url: currentImageUrl
            };

            if (editingItem) {
                const { error } = await supabase
                    .from('marketplace_items')
                    .update(itemData)
                    .eq('id', editingItem.id);

                if (error) throw error;
                toast.success('Item updated successfully!');
            } else {
                const { error } = await supabase
                    .from('marketplace_items')
                    .insert([itemData]);

                if (error) throw error;
                toast.success('Item added successfully!');
            }

            // Reset
            resetForm();
            fetch();

        } catch (error) {
            console.error('Submit error:', error);
            toast.error(`Failed to ${editingItem ? 'update' : 'add'} item: ` + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteWithImage = useCallback(async (id, imageUrl) => {
        // Delete image from storage first if it exists
        if (imageUrl) {
            const parts = imageUrl.split('/');
            const path = parts[parts.length - 1];
            await supabase.storage.from('marketplace-images').remove([path]);
        }
        await handleDelete(id, 'id', { successMessage: 'Item deleted successfully' });
    }, [handleDelete]);

    const handleClearAllItems = useCallback(async () => {
        await handleClearAll({
            successMessage: 'All items cleared successfully',
            clearMessage: 'Are you absolutely sure? This will permanently delete ALL marketplace items from the database. This action cannot be undone.'
        });
    }, [handleClearAll]);

    return (
        <div className="space-y-6">
            <AdminTabHeader
                title="Marketplace Management"
                showForm={showForm}
                onToggleForm={() => {
                    if (showForm) resetForm();
                    else setShowForm(true);
                }}
                onClearAll={handleClearAllItems}
                processing={processing}
                addButtonText={editingItem ? "Cancel Edit" : "Add Item"}
                clearButtonText="Clear DB Items"
            />

            {showForm && (
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-6">
                    <h4 className="text-lg font-bold text-white mb-4">
                        {editingItem ? 'Edit Item' : 'Create New Item'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <AdminFormInput
                                label="Title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                placeholder="e.g. iPad Pro M1"
                            />
                            <AdminFormInput
                                label="Price (with currency)"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                required
                                placeholder="e.g. ₹45000"
                            />
                            <AdminFormSelect
                                label="Category"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                options={CATEGORIES.map(c => ({ value: c, label: c }))}
                            />
                            <AdminFormInput
                                label="Seller Name"
                                value={seller}
                                onChange={e => setSeller(e.target.value)}
                            />
                            <AdminFormInput
                                label="Trust Score (0-100)"
                                type="number"
                                min="0"
                                max="100"
                                value={trustScore}
                                onChange={e => setTrustScore(e.target.value)}
                            />
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">
                                    {editingItem ? 'Replace Image (Max 4)' : 'Images (Max 4)'}
                                </label>
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center justify-center gap-2 w-full bg-black/50 border border-dashed border-white/20 hover:border-accent hover:text-accent rounded-lg p-2.5 text-gray-400 text-sm cursor-pointer transition-colors">
                                        <ImageIcon size={16} />
                                        {editingItem ? 'Select New Files' : 'Select Files'}
                                        <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {imageFiles.length > 0 && (
                            <div className="flex gap-2 mt-2">
                                {imageFiles.map((file, i) => (
                                    <div key={i} className="relative w-16 h-16 bg-black rounded-lg overflow-hidden border border-white/10">
                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-50" alt="Preview" />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            className="absolute inset-0 m-auto w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={uploading}
                                className="px-6 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-black font-bold rounded-lg transition-colors flex items-center gap-2"
                            >
                                {uploading ? <Loader2 size={18} className="animate-spin" /> : (editingItem ? <Edit2 size={18} /> : <Plus size={18} />)}
                                {editingItem ? 'Update Item' : 'Publish Item'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <AdminCardGrid
                loading={loading}
                error={error}
                data={items}
                onRetry={fetch}
                loadingMessage="Loading marketplace items..."
            >
                {items.map(item => (
                    <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col group hover:border-white/20 transition-colors">
                        <div className="aspect-video bg-black/50 relative overflow-hidden">
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    <ImageIcon size={32} />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="p-2 bg-accent text-black rounded-lg hover:bg-accent-hover shadow-lg transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteWithImage(item.id, item.image_url)}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-[10px] font-bold text-accent uppercase tracking-wider">
                                {item.category}
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-white mb-1 truncate">{item.title}</h4>
                            <div className="flex items-center justify-between text-sm text-gray-400">
                                <span className="text-white font-medium">{item.price}</span>
                                <span>score: {item.trust_score}</span>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 truncate">Seller: {item.seller}</div>
                        </div>
                    </div>
                ))}
            </AdminCardGrid>
        </div>
    );
};

export default AdminMarketplaceTab;
