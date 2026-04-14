import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, CheckCircle, XCircle, Clock, Package, MapPin, Phone, Calendar, Loader2, ShoppingBag, Receipt } from 'lucide-react';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';

const Payment = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pollingCount, setPollingCount] = useState(0);

    // Fetch order details
    useEffect(() => {
        if (!orderId || !user) {
            setError('Order ID or user not found');
            setLoading(false);
            return;
        }

        const fetchOrder = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .eq('user_id', user.id)
                    .single();

                if (fetchError) throw fetchError;
                if (!data) throw new Error('Order not found');

                setOrder(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching order:', err);
                setError(err.message || 'Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, user]);

    // Poll order status if pending (every 3s, stop after 30s = 10 polls)
    useEffect(() => {
        if (!order || order.status !== 'pending' || pollingCount >= 10) {
            return;
        }

        const pollInterval = setInterval(async () => {
            try {
                const { data, error: pollError } = await supabase
                    .from('orders')
                    .select('status')
                    .eq('id', orderId)
                    .single();

                if (!pollError && data) {
                    setOrder(prev => ({ ...prev, status: data.status }));
                    setPollingCount(prev => prev + 1);

                    // Stop polling if status changed
                    if (data.status !== 'pending') {
                        clearInterval(pollInterval);
                    }
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [order, orderId, pollingCount]);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'verified':
                return {
                    icon: CheckCircle,
                    color: 'text-green-500',
                    bgColor: 'bg-green-500/10',
                    borderColor: 'border-green-500/20',
                    title: 'Order Confirmed',
                    message: 'Your payment has been verified and order is being processed.'
                };
            case 'pending':
                return {
                    icon: Clock,
                    color: 'text-yellow-500',
                    bgColor: 'bg-yellow-500/10',
                    borderColor: 'border-yellow-500/20',
                    title: 'Payment Pending',
                    message: 'We are verifying your payment. This usually takes a few moments.'
                };
            case 'failed':
                return {
                    icon: XCircle,
                    color: 'text-red-500',
                    bgColor: 'bg-red-500/10',
                    borderColor: 'border-red-500/20',
                    title: 'Payment Failed',
                    message: 'Your payment could not be processed. Please try again.'
                };
            default:
                return {
                    icon: Clock,
                    color: 'text-gray-500',
                    bgColor: 'bg-gray-500/10',
                    borderColor: 'border-gray-500/20',
                    title: 'Order Status Unknown',
                    message: 'Unable to determine order status.'
                };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="text-accent animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
                <XCircle size={64} className="text-red-500 mb-6" />
                <h1 className="text-2xl font-display font-bold text-white mb-2">Order Not Found</h1>
                <p className="text-gray-400 mb-8 text-center">{error || 'Unable to load order details'}</p>
                <div className="flex gap-4">
                    <Button onClick={() => navigate('/orders')} variant="outline">
                        View All Orders
                    </Button>
                    <Button onClick={() => navigate('/market')} variant="primary">
                        Continue Shopping
                    </Button>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;
    const items = order.items || [];
    const delivery = order.delivery_details || {};
    const receiptNumber = order.receipt_number || order.id.slice(0, 8).toUpperCase();

    return (
        <div className="min-h-screen bg-background pt-4 md:pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Orders
                </button>

                {/* Status Card */}
                <div className={`bg-surface border ${statusConfig.borderColor} rounded-2xl p-8 mb-6 text-center`}>
                    <Logo className="w-16 h-16 mx-auto mb-6" />

                    <div className={`w-20 h-20 rounded-full ${statusConfig.bgColor} flex items-center justify-center mx-auto mb-6`}>
                        <StatusIcon size={40} className={statusConfig.color} />
                    </div>

                    <h1 className="text-3xl font-display font-bold text-white mb-2">
                        {statusConfig.title}
                    </h1>
                    <p className="text-gray-400 mb-6">{statusConfig.message}</p>

                    {order.status === 'pending' && (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <Loader2 size={16} className="animate-spin" />
                            <span>Checking payment status...</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Order Details */}
                    <div className="bg-surface border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                <Receipt size={20} className="text-accent" />
                            </div>
                            <h2 className="text-lg font-semibold text-white">Order Details</h2>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Receipt Number</span>
                                <span className="text-white font-mono">{receiptNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Order Date</span>
                                <span className="text-white">
                                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Items</span>
                                <span className="text-white">{items.length}</span>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-4 space-y-2">
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>Subtotal</span>
                                <span className="text-white">₹{(order.subtotal || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>Platform Fee</span>
                                <span className="text-white">₹{(order.platform_fee || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>GST</span>
                                <span className="text-white">₹{(order.gst || 0).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-white/10 pt-2">
                                <div className="flex justify-between">
                                    <span className="text-white font-semibold">Total</span>
                                    <span className="text-xl font-bold text-accent">₹{(order.total_amount || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Details */}
                    <div className="bg-surface border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                <MapPin size={20} className="text-accent" />
                            </div>
                            <h2 className="text-lg font-semibold text-white">Delivery Details</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-start gap-3 mb-3">
                                    <MapPin size={16} className="text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Location</p>
                                        <p className="text-white">{delivery.deliveryLocation || 'Not specified'}</p>
                                        {delivery.landmark && (
                                            <p className="text-sm text-gray-500 mt-1">{delivery.landmark}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar size={16} className="text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Delivery Schedule</p>
                                    <p className="text-white">
                                        {delivery.deliveryDate ? new Date(delivery.deliveryDate).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        }) : 'Not specified'}
                                    </p>
                                    {delivery.deliveryTime && (
                                        <p className="text-sm text-gray-500 mt-1">{delivery.deliveryTime}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone size={16} className="text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Contact</p>
                                    <p className="text-white">{delivery.contactNumber || 'Not provided'}</p>
                                </div>
                            </div>

                            {delivery.instructions && (
                                <div className="pt-3 border-t border-white/10">
                                    <p className="text-sm text-gray-400 mb-1">Special Instructions</p>
                                    <p className="text-white text-sm">{delivery.instructions}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-surface border border-white/10 rounded-2xl p-6 mt-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                            <Package size={20} className="text-accent" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Order Items</h2>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 pb-4 border-b border-white/10 last:border-0">
                                <div className="w-16 h-16 rounded-lg bg-white/5 overflow-hidden shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package size={24} className="text-gray-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">{item.title}</p>
                                    <p className="text-sm text-gray-400">Quantity: {item.quantity || 1}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-semibold">₹{(item.price || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Button
                        onClick={() => navigate('/market')}
                        variant="outline"
                        className="flex-1"
                    >
                        <ShoppingBag size={18} />
                        Continue Shopping
                    </Button>
                    <Button
                        onClick={() => navigate('/orders')}
                        variant="primary"
                        className="flex-1"
                    >
                        View All Orders
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Payment;
