import React from 'react';
import Logo from '../components/ui/Logo';

const Settings = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col justify-center items-center">
            <Logo className="w-20 h-20 mb-8 opacity-50" />
            <h1 className="text-2xl font-display font-bold text-white tracking-widest">SETTINGS</h1>
            <p className="text-gray-500 mt-2">Nothing to see here yet.</p>
        </div>
    );
};

export default Settings;
