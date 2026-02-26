import React from 'react';

const LoadingSpinner = ({ size = 40, className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        className="animate-spin"
        style={{
          animationDuration: '1s',
          animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-white/10"
        />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-white"
          strokeDasharray="80"
          strokeDashoffset="60"
        />
      </svg>
    </div>
  );
};

export default LoadingSpinner;
