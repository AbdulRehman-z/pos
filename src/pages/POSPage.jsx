import React, { useState } from 'react';
import ProductGrid from '../components/pos/ProductGrid';
import OrderCart from '../components/pos/OrderCart';

const POSPage = () => {
    const [cart, setCart] = useState([]);

    const addToCart = (product) => {
        setCart((prev) => {
            const existing = prev.find(p => p._id === product._id);
            if (existing) {
                return prev.map(p => p._id === product._id ? { ...p, qty: p.qty + 1 } : p);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const removeFromCart = (productId, categoryId = null) => {
        setCart((prev) => {
            if (categoryId) {
                return prev.filter(p => (typeof p.category_id === 'object' ? p.category_id?._id : p.category_id) !== categoryId);
            }
            return prev.filter(p => p._id !== productId);
        });
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] p-4 gap-6 bg-[#0a0a0a] overflow-hidden">
            {/* Left Side: Order Cart Form */}
            <div className="w-full md:w-[45%] lg:w-[40%] h-full">
                <OrderCart cart={cart} setCart={setCart} />
            </div>

            {/* Right Side: Product Selection */}
            <div className="w-full md:w-[55%] lg:w-[60%] h-full">
                <ProductGrid onAddToCart={addToCart} onRemoveFromCart={removeFromCart} />
            </div>
        </div>
    );
};

export default POSPage;
