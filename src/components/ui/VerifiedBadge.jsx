import React from 'react';
import { ShieldCheck } from 'lucide-react';

const VerifiedBadge = ({ size = 16, className = "" }) => {
    return (
        <span className={`inline-flex items-center justify-center text-blue-400 bg-blue-400/10 rounded-full p-0.5 ${className}`} title="Verified Official Account">
            <ShieldCheck size={size} className="fill-blue-500/20" />
        </span>
    );
};

export default VerifiedBadge;
