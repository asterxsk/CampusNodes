import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const CustomCursor = () => {
    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const location = useLocation();

    // Physics State
    const pos = useRef({ x: 0, y: 0 }); // Mouse Position
    const ringPos = useRef({ x: 0, y: 0 }); // Ring Position (Lerped)

    // React State
    const [hidden, setHidden] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [linkHovered, setLinkHovered] = useState(false);

    // Mobile/Touch Check
    const [isTouch, setIsTouch] = useState(false);
    useEffect(() => {
        setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    }, []);

    // Config
    const LERP_FACTOR = 0.15;

    // ... (rest of logic)

    useEffect(() => {
        const handleMouseOver = (e) => {
            const isClickable = e.target.closest('a, button, [role="button"], input[type="submit"], .clickable');
            setLinkHovered(!!isClickable);
        };

        document.addEventListener('mouseover', handleMouseOver);
        return () => document.removeEventListener('mouseover', handleMouseOver);
    }, [location]);

    // ... (existing listeners 2) ...

    // Mobile Check (Moved to end)

    useEffect(() => {
        let rafId;

        const onMouseMove = (e) => {
            setHidden(false);
            pos.current = { x: e.clientX, y: e.clientY };
            if (dotRef.current) {
                dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
            }
            if (Math.random() > 0.7) spawnParticle(e.clientX, e.clientY);
        };

        const onMouseDown = () => setClicked(true);
        const onMouseUp = () => setClicked(false);
        // On mouse leave, we just hide visually, but keep the loop running safely or paused.
        const onMouseEnter = () => setHidden(false);
        const onMouseOut = (e) => {
            if (e.relatedTarget === null) setHidden(true);
        };

        const spawnParticle = (x, y) => {
            if (!document.body) return; // Safety check
            const particle = document.createElement('div');
            // ... logic ...
            const size = Math.random() * 4 + 2;
            const shape = linkHovered
                ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                : 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
            const angle = Math.random() * 360;

            Object.assign(particle.style, {
                position: 'fixed',
                left: '0', top: '0',
                width: `${size}px`, height: `${size}px`,
                backgroundColor: 'white',
                clipPath: shape,
                pointerEvents: 'none',
                zIndex: 9998,
                transform: `translate(${x}px, ${y}px) rotate(${angle}deg)`,
                opacity: 0.6,
                transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
                willChange: 'transform, opacity'
            });

            document.body.appendChild(particle);

            const driftX = (Math.random() - 0.5) * 60;
            const driftY = (Math.random() - 0.5) * 60;

            requestAnimationFrame(() => {
                if (!particle) return;
                particle.style.transform = `translate(${x - driftX}px, ${y - driftY}px) rotate(${angle + 180}deg) scale(0)`;
                particle.style.opacity = 0;
            });

            setTimeout(() => {
                if (particle && particle.parentNode) particle.remove();
            }, 600);
        };

        // Ring Physics Loop
        const loop = () => {
            // Check if refs exist. If hidden (opacity 0), they still exist in DOM.
            if (!ringRef.current) return;

            ringPos.current.x += (pos.current.x - ringPos.current.x) * LERP_FACTOR;
            ringPos.current.y += (pos.current.y - ringPos.current.y) * LERP_FACTOR;

            ringRef.current.style.transform = `translate(${ringPos.current.x - 20}px, ${ringPos.current.y - 20}px)`;

            rafId = requestAnimationFrame(loop);
        };

        // Start loop
        loop();

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("mouseenter", onMouseEnter);
        document.addEventListener("mouseout", onMouseOut);

        return () => {
            cancelAnimationFrame(rafId);
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("mouseenter", onMouseEnter);
            document.removeEventListener("mouseout", onMouseOut);
        };
    }, [linkHovered]); // Dependency stays same

    // Mobile/Touch Check - Moved here to respect Rules of Hooks
    if (isTouch) return null;

    // SVG Paths
    const hexPath = "M 20 1 L 37 10.5 L 37 29.5 L 20 39 L 3 29.5 L 3 10.5 Z";
    const circlePath = "M 20 1 A 19 19 0 1 1 20 39 A 19 19 0 1 1 20 1 Z";

    return (
        <>
            {/* Center Dot */}
            <div
                ref={dotRef}
                className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform"
                style={{ top: 0, left: 0 }}
            >
                <div
                    className={`w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-300 ease-out ${hidden ? 'scale-0 opacity-0' : clicked ? 'scale-50 opacity-100' : linkHovered ? 'scale-150 opacity-100' : 'scale-100 opacity-100'}`}
                />
            </div>
            {/* Ring */}
            <div
                ref={ringRef}
                className="fixed top-0 left-0 w-10 h-10 pointer-events-none z-[9998] mix-blend-difference will-change-transform"
                style={{ top: 0, left: 0 }}
            >
                <svg
                    className={`w-full h-full transition-all duration-500 ease-out ${hidden ? 'scale-0 opacity-0' : clicked ? 'scale-75 opacity-100' : linkHovered ? 'scale-125 rotate-180 opacity-100' : 'scale-100 opacity-100'}`}
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d={linkHovered ? hexPath : circlePath}
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        style={{ transition: 'd 0.3s ease-out' }}
                    />
                </svg>
            </div>
        </>
    );
};

export default CustomCursor;
