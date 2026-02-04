import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
    Zap, Star, Circle, Triangle, Sparkles, X, Hexagon
} from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    onClick,
    className = '',
    type = 'button',
    fullWidth = false,
    to,
    href,
    withDoodles = true,
    disabled
}) => {
    const btnRef = useRef(null);
    const [exploding, setExploding] = useState(false);

    const handleExplosion = (e) => {
        if (disabled) return;
        setExploding(true);
        setTimeout(() => setExploding(false), 700);
        if (onClick) onClick(e);
    };

    // NOTE: Using 'group/btn' here to isolate hover state from parent groups (like cards)
    const baseStyles = "relative group/btn font-display font-bold uppercase tracking-widest text-xs px-8 py-4 transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-none flex items-center justify-center gap-2 rounded-full";

    const variants = {
        primary: "bg-white text-black border border-transparent hover:bg-zinc-200",
        outline: "border border-white/20 text-white hover:border-white hover:bg-white/5",
        ghost: "text-gray-400 hover:text-white hover:bg-white/5",
        accent: "bg-accent text-white border border-transparent hover:bg-accent/90"
    };

    const widthClass = fullWidth ? "w-full" : "";
    const combinedClassName = `${baseStyles} ${variants[variant]} ${widthClass} ${className}`;

    // Adjusted spacing: Max 40px from button (roughly 2.5rem / -10)
    // Sizing: Max 20px icons
    const getCls = (baseCls, hoverCls, explodeCls) => {
        if (exploding) {
            // EXPLOSION: Force high z-index and massive translation
            return `opacity-0 ${explodeCls} transition-all duration-700 ease-out z-50`;
        }
        // HOVER: Scoped to 'group-hover/btn'
        return `opacity-0 group-hover/btn:opacity-100 ${hoverCls} transition-all duration-300 ease-out ${baseCls}`;
    };

    const DoodleSurround = () => (
        <span className="absolute inset-0 pointer-events-none overflow-visible">
            {/* --- TOP GROUP --- */}
            {/* Center Zap: 20px */}
            <span className={`absolute left-1/2 -translate-x-1/2 ${getCls('-top-12', '-top-8', '-translate-y-[80vh]')} delay-75 text-white`}>
                <Zap size={20} fill="currentColor" />
            </span>
            {/* Left Arrow: 20px */}
            <span className={`absolute left-0 ${getCls('-top-10', '-top-6', '-translate-y-[80vh] -translate-x-[20vw]')} delay-0 text-white -rotate-12`}>
                <ArrowDown size={20} strokeWidth={3} />
            </span>
            {/* Right Star: 16px */}
            <span className={`absolute right-0 ${getCls('-top-10', '-top-6', '-translate-y-[80vh] translate-x-[20vw]')} delay-100 text-white rotate-12`}>
                <Star size={16} fill="currentColor" />
            </span>

            {/* --- BOTTOM GROUP --- */}
            {/* Center Hex: 18px */}
            <span className={`absolute left-1/2 -translate-x-1/2 ${getCls('-bottom-12', '-bottom-8', 'translate-y-[80vh]')} delay-75 text-white`}>
                <Hexagon size={18} strokeWidth={3} />
            </span>
            {/* Left X: 16px */}
            <span className={`absolute left-0 ${getCls('-bottom-10', '-bottom-6', 'translate-y-[80vh] -translate-x-[20vw]')} delay-0 text-white rotate-12`}>
                <X size={16} strokeWidth={4} />
            </span>
            {/* Right Arrow: 20px */}
            <span className={`absolute right-0 ${getCls('-bottom-10', '-bottom-6', 'translate-y-[80vh] translate-x-[20vw]')} delay-100 text-white -rotate-12`}>
                <ArrowDown size={20} strokeWidth={3} className="rotate-180" />
            </span>

            {/* --- LEFT GROUP --- */}
            {/* Mid Arrow: 20px */}
            <span className={`absolute top-1/2 -translate-y-1/2 ${getCls('-left-12', '-left-8', '-translate-x-[80vw]')} delay-50 text-white`}>
                <ArrowRight size={20} strokeWidth={3} />
            </span>
            {/* Top Sparkles: 16px */}
            <span className={`absolute top-0 ${getCls('-left-8', '-left-5', '-translate-x-[80vw] -translate-y-[20vh]')} delay-100 text-white`}>
                <Sparkles size={16} fill="currentColor" />
            </span>

            {/* --- RIGHT GROUP --- */}
            {/* Mid Arrow: 20px */}
            <span className={`absolute top-1/2 -translate-y-1/2 ${getCls('-right-12', '-right-8', 'translate-x-[80vw]')} delay-50 text-white`}>
                <ArrowLeft size={20} strokeWidth={3} />
            </span>
            {/* Bottom Triangle: 16px */}
            <span className={`absolute bottom-0 ${getCls('-right-8', '-right-5', 'translate-x-[80vw] translate-y-[20vh]')} delay-100 text-white rotate-45`}>
                <Triangle size={16} fill="currentColor" />
            </span>
        </span>
    );

    const content = (
        <>
            <span className="relative z-10">{children}</span>
            {withDoodles && <DoodleSurround />}
        </>
    );

    if (to) {
        return (
            <Link
                to={to}
                className={combinedClassName}
                ref={btnRef}
                onClick={handleExplosion}
            >
                {content}
            </Link>
        );
    }

    if (href) {
        return (
            <a
                href={href}
                className={combinedClassName}
                target="_blank"
                rel="noopener noreferrer"
                ref={btnRef}
                onClick={handleExplosion}
            >
                {content}
            </a>
        );
    }

    return (
        <button
            ref={btnRef}
            type={type}
            className={combinedClassName}
            onClick={handleExplosion}
            disabled={disabled}
        >
            {content}
        </button>
    );
};

export default Button;
