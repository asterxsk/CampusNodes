import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2, Loader2, X, BookOpen, Printer, Wrench, Camera, Code, Calendar } from 'lucide-react';
import useAdminFetch from '../../hooks/useAdminFetch';
import useAdminCrud from '../../hooks/useAdminCrud';
import AdminTabHeader from './AdminTabHeader';
import AdminFormInput, { AdminFormTextarea, AdminFormSelect } from './AdminFormInput';
import AdminCardGrid from './AdminCardGrid';

const ICON_MAP = {
    'BookOpen': <BookOpen size={20} />,
    'Printer': <Printer size={20} />,
    'Wrench': <Wrench size={20} />,
    'Camera': <Camera size={20} />,
    'Code': <Code size={20} />,
    'Calendar': <Calendar size={20} />
};

const AdminServicesTab = () => {
    const toast = useToast();
    const { data: services, loading, error, fetch } = useAdminFetch(
        'services',
        'created_at',
        'desc'
    );
    const { handleDelete, handleClearAll, processing } = useAdminCrud(
        'services',
        fetch
    );
    const [showForm, setShowForm] = useState(false);
    const [adding, setAdding] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('BookOpen');
    const [provider, setProvider] = useState('CampusNodes Admin');
    const [availableCount, setAvailableCount] = useState(1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !description) return;

        setAdding(true);
        try {
            const { error } = await supabase
                .from('services')
                .insert([{
                    title,
                    description,
                    icon,
                    provider,
                    availableCount: parseInt(availableCount) || 1
                }]);

            if (error) throw error;

            // Reset
            setShowForm(false);
            setTitle('');
            setDescription('');
            fetch();
            toast.success('Service added successfully!');

        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Failed to add service: ' + error.message);
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteService = async (id) => {
        await handleDelete(id, 'id', {
            successMessage: 'Service deleted successfully',
            deleteMessage: 'Are you sure you want to delete this service?'
        });
    };

    const handleClearAllServices = async () => {
        await handleClearAll({
            successMessage: 'All services cleared successfully',
            clearMessage: 'Are you absolutely sure? This will permanently delete ALL services from the database. This action cannot be undone.'
        });
    };

    return (
        <div className="space-y-6">
            <AdminTabHeader
                title="Services Management"
                showForm={showForm}
                onToggleForm={() => setShowForm(!showForm)}
                onClearAll={handleClearAllServices}
                processing={processing}
                addButtonText="Add Service"
                clearButtonText="Clear DB Services"
            />

            {showForm && (
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-6">
                    <h4 className="text-lg font-bold text-white mb-4">Create New Service</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <AdminFormInput
                                label="Title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                placeholder="e.g. Peer Tutoring"
                            />
                            <AdminFormInput
                                label="Provider Name"
                                value={provider}
                                onChange={e => setProvider(e.target.value)}
                                required
                            />
                            <div className="col-span-2">
                                <AdminFormTextarea
                                    label="Description"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    required
                                    placeholder="Describe the service..."
                                    rows={4}
                                />
                            </div>
                            <AdminFormSelect
                                label="Icon"
                                value={icon}
                                onChange={e => setIcon(e.target.value)}
                                options={Object.keys(ICON_MAP).map(key => ({ value: key, label: key }))}
                            />
                            <AdminFormInput
                                label="Available Count"
                                type="number"
                                min="0"
                                value={availableCount}
                                onChange={e => setAvailableCount(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={adding}
                                className="px-6 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-black font-bold rounded-lg transition-colors flex items-center gap-2"
                            >
                                {adding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                Publish Service
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <AdminCardGrid
                loading={loading}
                error={error}
                data={services}
                onRetry={fetch}
                loadingMessage="Loading services..."
            >
                {services.map(service => (
                    <div key={service.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col group hover:border-white/20 transition-colors relative">
                        <button
                            onClick={() => handleDeleteService(service.id)}
                            className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                        >
                            <Trash2 size={16} />
                        </button>

                        <div className="text-gray-400 mb-3">
                            {ICON_MAP[service.icon] || <BookOpen size={20} />}
                        </div>
                        <h4 className="font-bold text-white mb-1 truncate pr-8">{service.title}</h4>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-3 flex-1">{service.description}</p>

                        <div className="flex items-center justify-between text-xs pt-3 border-t border-white/5">
                            <span className="text-accent font-medium">{service.availableCount} Available</span>
                            <span className="text-gray-500">By: {service.provider}</span>
                        </div>
                    </div>
                ))}
            </AdminCardGrid>
        </div>
    );
};

export default AdminServicesTab;
