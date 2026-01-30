import React from 'react';
import Logo from '../components/ui/Logo';

const Payment = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col justify-center items-center">
            <Logo className="w-16 h-16 mb-8" />
            <h1 className="text-3xl font-display font-bold text-white tracking-widest uppercase text-center max-w-lg leading-relaxed">
                Payment Gateway <br /> Integration Pending
            </h1>
            <p className="text-gray-500 mt-4 text-sm">This is a secure checkout placeholder.</p>
        </div>
    );
};

export default Payment;
