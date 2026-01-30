import React from 'react';

const Logo = ({ className = "w-10 h-10" }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Node C Shape */}
            <path
                d="M 80 30 C 70 10, 30 10, 20 50 C 10 90, 70 90, 80 70"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
            />

            {/* Nodes (Dots) */}
            <circle cx="80" cy="30" r="6" fill="white" />
            <circle cx="20" cy="50" r="6" fill="white" />
            <circle cx="80" cy="70" r="6" fill="white" />

            {/* Connecting Lines (Network effect) */}
            <line x1="80" y1="30" x2="50" y2="20" stroke="white" strokeWidth="2" opacity="0.5" />
            <line x1="50" y1="20" x2="20" y2="50" stroke="white" strokeWidth="2" opacity="0.5" />
            <line x1="20" y1="50" x2="50" y2="80" stroke="white" strokeWidth="2" opacity="0.5" />
            <line x1="50" y1="80" x2="80" y2="70" stroke="white" strokeWidth="2" opacity="0.5" />

            {/* Extra decorative nodes */}
            <circle cx="50" cy="20" r="4" fill="white" />
            <circle cx="50" cy="80" r="4" fill="white" />
        </svg>
    );
};

export default Logo;
