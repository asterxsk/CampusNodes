import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, MapPin, Clock, Package, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const { cartItems, clearCart } = useCart();

    // Check if this is a direct "Buy Now" purchase
    const directPurchase = location.state?.directPurchase;
    const directItem = location.state?.item;

    // Use direct item or cart items
    const items = directPurchase && directItem ? [directItem] : cartItems;

    const [formData, setFormData] = useState({
        deliveryLocation: '',
        landmark: '',
        deliveryDate: '',
        deliveryTime: '',
        contactNumber: '',
        instructions: ''
    });

    const [errors, setErrors] = useState({});

    // Helper to parse price reliably
    const parsePrice = (price) => {
        if (typeof price === 'number') return price;
        if (!price) return 0;
        const matches = String(price).match(/[0-9.]+/);
        if (matches) return parseFloat(matches[0]) || 0;
        return 0;
    };

    // Calculate totals with safety checks
    const subtotal = items.reduce((sum, item) => sum + parsePrice(item.price), 0);
    const platformFee = subtotal * 0.05; // 5% Campus Nodes fee
    const gst = (subtotal + platformFee) * 0.18; // 18% GST
    const total = subtotal + platformFee + gst;

    // Available time slots
    const timeSlots = [
        '09:00 AM - 11:00 AM',
        '11:00 AM - 01:00 PM',
        '02:00 PM - 04:00 PM',
        '04:00 PM - 06:00 PM',
        '06:00 PM - 08:00 PM'
    ];

    // Common campus locations
    const campusLocations = [
        'Main Gate',
        'Library',
        'Cafeteria',
        'Hostel Block A',
        'Hostel Block B',
        'Sports Complex',
        'Admin Building',
        'Engineering Block',
        'Science Block',
        'Arts Block'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.deliveryLocation.trim()) {
            newErrors.deliveryLocation = 'Delivery location is required';
        }

        // Date Validation
        const selectedDate = new Date(formData.deliveryDate);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Reset time for accurate date comparison
        const currentYear = currentDate.getFullYear();

        if (!formData.deliveryDate) {
            newErrors.deliveryDate = 'Delivery date is required';
        } else if (isNaN(selectedDate.getTime())) {
            newErrors.deliveryDate = 'Invalid date';
        } else if (selectedDate < currentDate) {
            newErrors.deliveryDate = 'Delivery date cannot be in the past';
        } else if (selectedDate.getFullYear() < currentYear || selectedDate.getFullYear() > currentYear + 1) {
            // Basic sanity check: prevent year 0001 or far future
            newErrors.deliveryDate = 'Please select a valid date within this year';
        }

        if (!formData.deliveryTime) {
            newErrors.deliveryTime = 'Delivery time is required';
        }
        if (!formData.contactNumber.trim()) {
            newErrors.contactNumber = 'Contact number is required';
        } else if (!/^[0-9]{10}$/.test(formData.contactNumber)) {
            newErrors.contactNumber = 'Enter a valid 10-digit number';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fill all required fields');
            return;
        }

        // Store order details and proceed to payment
        const orderDetails = {
            items,
            subtotal,
            platformFee,
            gst,
            total,
            delivery: formData
        };

        // In a real app, you'd save this to state/localStorage before redirecting
        sessionStorage.setItem('pendingOrder', JSON.stringify(orderDetails));

        // Navigate to payment gateway
        navigate('/payment', { state: { orderDetails } });
    };

    // Get minimum date (today)
    const today = new Date().toISOString().split('T')[0];

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-background pt-4 md:pt-24 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center py-20">
                    <Package size={64} className="text-gray-600 mx-auto mb-6" />
                    <h1 className="text-2xl font-display font-bold text-white mb-4">No items to checkout</h1>
                    <Button onClick={() => navigate('/market')} variant="primary">
                        Browse Marketplace
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-4 md:pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} /> Back
                </button>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Delivery Form */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-display font-bold text-white mb-2">Delivery Details</h1>
                        <p className="text-gray-400 mb-8">Tell us when and where to deliver your items</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Location Section */}
                            <div className="bg-surface border border-white/10 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                        <MapPin size={20} className="text-accent" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-white">Delivery Location</h2>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Select Location <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            name="deliveryLocation"
                                            value={formData.deliveryLocation}
                                            onChange={handleChange}
                                            className={`w-full bg-background border ${errors.deliveryLocation ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors`}
                                        >
                                            <option value="">Choose a location...</option>
                                            {campusLocations.map(loc => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                            <option value="other">Other (specify in landmark)</option>
                                        </select>
                                        {errors.deliveryLocation && (
                                            <p className="text-red-400 text-xs mt-1">{errors.deliveryLocation}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Landmark / Additional Details
                                        </label>
                                        <input
                                            type="text"
                                            name="landmark"
                                            value={formData.landmark}
                                            onChange={handleChange}
                                            placeholder="e.g., Near the vending machine, Room 204"
                                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Time Section */}
                            <div className="bg-surface border border-white/10 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                        <Clock size={20} className="text-accent" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-white">Delivery Time</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Delivery Date <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="deliveryDate"
                                            value={formData.deliveryDate}
                                            onChange={handleChange}
                                            min={today}
                                            className={`w-full bg-background border ${errors.deliveryDate ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors`}
                                        />
                                        {errors.deliveryDate && (
                                            <p className="text-red-400 text-xs mt-1">{errors.deliveryDate}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Time Slot <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            name="deliveryTime"
                                            value={formData.deliveryTime}
                                            onChange={handleChange}
                                            className={`w-full bg-background border ${errors.deliveryTime ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors`}
                                        >
                                            <option value="">Select a time slot...</option>
                                            {timeSlots.map(slot => (
                                                <option key={slot} value={slot}>{slot}</option>
                                            ))}
                                        </select>
                                        {errors.deliveryTime && (
                                            <p className="text-red-400 text-xs mt-1">{errors.deliveryTime}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Section */}
                            <div className="bg-surface border border-white/10 rounded-2xl p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Contact Number <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={handleChange}
                                            placeholder="10-digit mobile number"
                                            maxLength={10}
                                            className={`w-full bg-background border ${errors.contactNumber ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors`}
                                        />
                                        {errors.contactNumber && (
                                            <p className="text-red-400 text-xs mt-1">{errors.contactNumber}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Special Instructions (Optional)
                                        </label>
                                        <textarea
                                            name="instructions"
                                            value={formData.instructions}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Any special requests or instructions..."
                                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-96">
                        <div className="bg-surface border border-white/10 rounded-2xl p-6 sticky top-24">
                            <h2 className="text-xl font-display font-bold text-white mb-6">Order Summary</h2>

                            {/* Items Preview */}
                            <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
                                {items.map(item => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package size={16} className="text-gray-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{item.title}</p>
                                            <p className="text-xs text-gray-400">₹{parsePrice(item.price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-white/10 pt-4 space-y-3 mb-6">
                                <div className="flex justify-between text-gray-400 text-sm">
                                    <span>Subtotal</span>
                                    <span className="text-white">₹{subtotal.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between text-gray-400 text-sm">
                                    <span>Platform Fee (5%)</span>
                                    <span className="text-white">₹{platformFee.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-gray-400 text-sm">
                                    <span>GST (18%)</span>
                                    <span className="text-white">₹{gst.toFixed(2)}</span>
                                </div>

                                <div className="border-t border-white/10 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-white font-semibold">Total</span>
                                        <span className="text-xl font-bold text-accent">₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                variant="primary"
                                className="w-full py-3 flex items-center justify-center gap-2"
                            >
                                <CreditCard size={18} />
                                Proceed to Payment
                            </Button>

                            <div className="flex items-center justify-center gap-2 mt-4">
                                <img src="https://badges.razorpay.com/badge-light.png" alt="Razorpay" className="h-6 opacity-50"
                                    onError={(e) => e.target.style.display = 'none'} />
                                <span className="text-xs text-gray-500">Secure Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
