import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Package, Receipt, CheckCircle, Clock, XCircle, ShoppingBag, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';

const Orders = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (fetchError) throw fetchError;

                setOrders(data || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError(err.message || 'Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, navigate]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified':
                return {
                    icon: CheckCircle,
                    label: 'Confirmed',
                    className: 'bg-green-500/10 text-green-500 border-green-500/20'
                };
            case 'pending':
                return {
                    icon: Clock,
                    label: 'Pending',
                    className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                };
            case 'failed':
                return {
                    icon: XCircle,
                    label: 'Failed',
                    className: 'bg-red-500/10 text-red-500 border-red-500/20'
                };
            default:
                return {
                    icon: Clock,
                    label: 'Unknown',
                    className: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="text-accent animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
                <XCircle size={64} className="text-red-500 mb-6" />
                <h1 className="text-2xl font-display font-bold text-white mb-2">Error Loading Orders</h1>
                <p className="text-gray-400 mb-8">{error}</p>
                <Button onClick={() => window.location.reload()} variant="primary">
                    Retry
                </Button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-background pt-4 md:pt-24 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center py-20">
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                        <Package size={48} className="text-gray-600" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white mb-4">No Orders Yet</h1>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                        You haven't placed any orders yet. Start shopping to see your order history here.
                    </p>
                    <Button onClick={() => navigate('/market')} variant="primary">
                        <ShoppingBag size={18} />
                        Browse Marketplace
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-4 md:pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-white mb-2">My Orders</h1>
                    <p className="text-gray-400">View and track all your orders</p>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {orders.map((order) => {
                        const statusBadge = getStatusBadge(order.status);
                        const StatusIcon = statusBadge.icon;
                        const items = order.items || [];
                        const itemCount = items.length;
                        const receiptNumber = order.receipt_number || order.id.slice(0, 8).toUpperCase();
                        const orderDate = new Date(order.created_at);

                        return (
                            <div
                                key={order.id}
                                onClick={() => navigate(`/orders/${order.id}`)}
                                className="bg-surface border border-white/10 rounded-2xl p-6 hover:border-accent/50 transition-all cursor-pointer group"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                            <Receipt size={24} className="text-accent" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-semibold text-white group-hover:text-accent transition-colors">
                                                    #{receiptNumber}
                                                </h3>
                                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${statusBadge.className}`}>
                                                    <StatusIcon size={14} />
                                                    {statusBadge.label}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400">
                                                {orderDate.toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 sm:text-right">
                                        <div>
                                            <p className="text-sm text-gray-400 mb-1">Items</p>
                                            <p className="text-white font-semibold">{itemCount}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400 mb-1">Total</p>
                                            <p className="text-xl font-bold text-accent">₹{(order.total_amount || 0).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                {items.length > 0 && (
                                    <div className="border-t border-white/10 pt-4">
                                        <div className="flex items-center gap-3 overflow-x-auto pb-2">
                                            {items.slice(0, 4).map((item, index) => (
                                                <div key={index} className="flex items-center gap-2 shrink-0">
                                                    <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden">
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package size={16} className="text-gray-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-gray-400 max-w-[150px] truncate">
                                                        {item.title}
                                                    </span>
                                                </div>
                                            ))}
                                            {items.length > 4 && (
                                                <span className="text-sm text-gray-500 shrink-0">
                                                    +{items.length - 4} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Continue Shopping */}
                <div className="mt-8 text-center">
                    <Button onClick={() => navigate('/market')} variant="outline">
                        <ShoppingBag size={18} />
                        Continue Shopping
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Orders;
