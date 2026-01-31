import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { MARKET_ITEMS } from '../data/marketItems';
import { ArrowLeft, Star, ShoppingCart, CreditCard } from 'lucide-react';
import Button from '../components/ui/Button';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth(); // Auth Check
    const product = MARKET_ITEMS.find(item => item.id === parseInt(id));
    const [selectedImage, setSelectedImage] = useState(0);

    const handleBuy = () => {
        if (!user) {
            navigate('/signup');
            return;
        }
        navigate('/payment');
    };

    const handleAddToCart = () => {
        if (!user) {
            navigate('/signup');
            return;
        }
        addToCart(product);
    };

    if (!product) return <div className="text-white pt-32 text-center">Product not found</div>;

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Market
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-[4/3] bg-surface border border-white/10 rounded-lg overflow-hidden">
                            <img
                                src={product.images[selectedImage]}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`w-24 h-24 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-accent' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-accent font-bold uppercase tracking-wider text-sm">{product.category}</span>
                            <div className="flex items-center gap-1 text-yellow-500">
                                <Star size={16} fill="currentColor" />
                                <span className="text-white font-bold">{product.trustScore}</span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">{product.title}</h1>
                        <p className="text-3xl text-white font-light mb-8">{product.price}</p>

                        <div className="bg-surface border border-white/5 p-6 rounded-lg mb-8">
                            <p className="text-gray-300 leading-relaxed mb-4">
                                {product.description || "No description provided."}
                            </p>
                            <p className="text-sm text-gray-500">Sold by <span className="text-white font-bold">@{product.seller}</span></p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={handleBuy}
                                variant="primary"
                                fullWidth
                                className="flex items-center justify-center gap-2"
                            >
                                <CreditCard size={18} /> Buy Now
                            </Button>

                            <Button
                                onClick={handleAddToCart}
                                variant="outline"
                                fullWidth
                                className="flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={18} /> Add to Cart
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
