import React, { useRef, useEffect, useCallback, useState } from 'react';

const PixelGrid = () => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const nodesRef = useRef([]);
    const dimensionsRef = useRef({ width: 0, height: 0 });
    const lastFrameTimeRef = useRef(0);
    const isVisibleRef = useRef(true);
    const [isLowPerformance, setIsLowPerformance] = useState(false);

    // Performance-adaptive settings
    const getSettings = useCallback(() => {
        const screenArea = window.innerWidth * window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x

        // Detect low performance mode (very large canvas area or low DPR devices)
        const isLargeScreen = screenArea > 2000000; // > 2MP
        const isVeryLargeScreen = screenArea > 4000000; // > 4MP (like 4K or very zoomed out)

        if (isVeryLargeScreen) {
            return {
                NODE_SIZE: 2,
                GRID_GAP: 60, // Much larger gap = fewer nodes
                CONNECTION_DISTANCE: 120,
                ACTIVE_COUNT: 20,
                PULSE_SPEED: 0.06,
                SWAP_COUNT: 2,
                TARGET_FPS: 20, // Lower FPS for large screens
                SCALE: 1 / dpr
            };
        } else if (isLargeScreen) {
            return {
                NODE_SIZE: 2,
                GRID_GAP: 40,
                CONNECTION_DISTANCE: 100,
                ACTIVE_COUNT: 25,
                PULSE_SPEED: 0.07,
                SWAP_COUNT: 3,
                TARGET_FPS: 24,
                SCALE: 1 / dpr
            };
        } else {
            return {
                NODE_SIZE: 2,
                GRID_GAP: 25,
                CONNECTION_DISTANCE: 100,
                ACTIVE_COUNT: 35,
                PULSE_SPEED: 0.08,
                SWAP_COUNT: 4,
                TARGET_FPS: 30,
                SCALE: 1 / dpr
            };
        }
    }, []);

    const settingsRef = useRef(getSettings());

    // Initialize nodes on the grid
    const initNodes = useCallback((width, height) => {
        const settings = settingsRef.current;
        const nodes = [];
        const cols = Math.floor(width / settings.GRID_GAP);
        const rows = Math.floor(height / settings.GRID_GAP);

        // Limit total nodes for performance
        const maxNodes = 800;
        const totalPossible = cols * rows;
        const skip = totalPossible > maxNodes ? Math.ceil(totalPossible / maxNodes) : 1;

        let nodeIndex = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                nodeIndex++;
                if (skip > 1 && nodeIndex % skip !== 0) continue;

                nodes.push({
                    x: col * settings.GRID_GAP + settings.GRID_GAP / 2,
                    y: row * settings.GRID_GAP + settings.GRID_GAP / 2,
                    brightness: 0,
                    targetBrightness: 0,
                    pulsePhase: Math.random() * Math.PI * 2
                });
            }
        }

        // Activate random nodes
        const shuffled = [...Array(nodes.length).keys()].sort(() => Math.random() - 0.5);
        const activeCount = Math.min(settings.ACTIVE_COUNT, nodes.length);
        for (let i = 0; i < activeCount; i++) {
            nodes[shuffled[i]].targetBrightness = 1;
        }

        setIsLowPerformance(nodes.length < 200); // Flag if we reduced nodes significantly
        return nodes;
    }, []);

    // Randomly swap active nodes
    const swapActiveNodes = useCallback(() => {
        const nodes = nodesRef.current;
        const settings = settingsRef.current;
        if (nodes.length === 0) return;

        const activeIndices = [];
        const inactiveIndices = [];

        nodes.forEach((node, i) => {
            if (node.targetBrightness > 0.5) activeIndices.push(i);
            else inactiveIndices.push(i);
        });

        const swapCount = Math.min(settings.SWAP_COUNT, activeIndices.length, inactiveIndices.length);
        for (let i = 0; i < swapCount; i++) {
            if (activeIndices.length === 0 || inactiveIndices.length === 0) break;

            const activeIdx = activeIndices.splice(Math.floor(Math.random() * activeIndices.length), 1)[0];
            const inactiveIdx = inactiveIndices.splice(Math.floor(Math.random() * inactiveIndices.length), 1)[0];

            nodes[activeIdx].targetBrightness = 0;
            nodes[inactiveIdx].targetBrightness = 1;
        }
    }, []);

    // Throttled animation loop
    const animate = useCallback((timestamp) => {
        if (!isVisibleRef.current) {
            animationRef.current = requestAnimationFrame(animate);
            return;
        }

        const settings = settingsRef.current;
        const frameInterval = 1000 / settings.TARGET_FPS;
        const elapsed = timestamp - lastFrameTimeRef.current;

        if (elapsed < frameInterval) {
            animationRef.current = requestAnimationFrame(animate);
            return;
        }

        lastFrameTimeRef.current = timestamp - (elapsed % frameInterval);

        const canvas = canvasRef.current;
        if (!canvas) {
            animationRef.current = requestAnimationFrame(animate);
            return;
        }

        const ctx = canvas.getContext('2d', { alpha: true });
        const { width, height } = dimensionsRef.current;

        ctx.clearRect(0, 0, width, height);

        const nodes = nodesRef.current;
        const time = timestamp * 0.002;

        // Batch update brightness
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const pulseFactor = Math.sin(time + node.pulsePhase) * 0.3 + 0.7;
            const target = node.targetBrightness * pulseFactor;
            node.brightness += (target - node.brightness) * settings.PULSE_SPEED;
        }

        // Only draw connections if not in ultra-low performance mode
        if (nodes.length > 50) {
            const brightNodes = [];
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].brightness > 0.2) brightNodes.push(nodes[i]);
            }

            // Limit connections for performance
            const maxConnections = 50;
            let connectionCount = 0;

            ctx.lineWidth = 1;
            for (let i = 0; i < brightNodes.length && connectionCount < maxConnections; i++) {
                for (let j = i + 1; j < brightNodes.length && connectionCount < maxConnections; j++) {
                    const n1 = brightNodes[i];
                    const n2 = brightNodes[j];
                    const dx = n2.x - n1.x;
                    const dy = n2.y - n1.y;
                    const distSq = dx * dx + dy * dy;
                    const maxDistSq = settings.CONNECTION_DISTANCE * settings.CONNECTION_DISTANCE;

                    if (distSq < maxDistSq) {
                        const opacity = (1 - Math.sqrt(distSq) / settings.CONNECTION_DISTANCE) * Math.min(n1.brightness, n2.brightness) * 0.4;
                        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.stroke();
                        connectionCount++;
                    }
                }
            }
        }

        // Draw nodes - simplified for performance
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.brightness > 0.1) {
                const alpha = node.brightness;

                // Glow
                ctx.beginPath();
                ctx.arc(node.x, node.y, settings.NODE_SIZE * 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.15})`;
                ctx.fill();

                // Core
                ctx.beginPath();
                ctx.arc(node.x, node.y, settings.NODE_SIZE, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
                ctx.fill();
            } else if (node.brightness > 0.01) {
                // Dim inactive - only if brightness is notable
                ctx.beginPath();
                ctx.arc(node.x, node.y, settings.NODE_SIZE * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                ctx.fill();
            }
        }

        animationRef.current = requestAnimationFrame(animate);
    }, []);

    // Handle resize with debounce
    useEffect(() => {
        let resizeTimeout;

        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (canvasRef.current) {
                    settingsRef.current = getSettings();
                    const width = window.innerWidth;
                    const height = window.innerHeight;
                    dimensionsRef.current = { width, height };
                    canvasRef.current.width = width;
                    canvasRef.current.height = height;
                    nodesRef.current = initNodes(width, height);
                }
            }, 100);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
        };
    }, [initNodes, getSettings]);

    // Visibility API - pause when tab is hidden
    useEffect(() => {
        const handleVisibilityChange = () => {
            isVisibleRef.current = !document.hidden;
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Start animation
    useEffect(() => {
        animationRef.current = requestAnimationFrame(animate);

        // Swap active nodes - slower interval for performance
        const swapInterval = setInterval(swapActiveNodes, 500);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            clearInterval(swapInterval);
        };
    }, [animate, swapActiveNodes]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
                background: 'transparent',
                willChange: 'transform',
                transform: 'translateZ(0)'
            }}
        />
    );
};

export default PixelGrid;
