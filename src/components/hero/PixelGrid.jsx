import React, { useRef, useEffect, useCallback } from 'react';

const PixelGrid = () => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const nodesRef = useRef([]);
    const dimensionsRef = useRef({ width: 0, height: 0 });

    const NODE_SIZE = 2; // Smaller pixels for performance
    const GRID_GAP = 25; // Slightly larger gap = fewer nodes
    const CONNECTION_DISTANCE = 100; // Larger connection distance
    const ACTIVE_COUNT = 35; // More active nodes
    const PULSE_SPEED = 0.08; // Faster transitions
    const SWAP_COUNT = 4; // More swaps per interval

    // Initialize nodes on the grid
    const initNodes = useCallback((width, height) => {
        const nodes = [];
        const cols = Math.floor(width / GRID_GAP);
        const rows = Math.floor(height / GRID_GAP);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                nodes.push({
                    x: col * GRID_GAP + GRID_GAP / 2,
                    y: row * GRID_GAP + GRID_GAP / 2,
                    brightness: 0,
                    targetBrightness: 0,
                    pulsePhase: Math.random() * Math.PI * 2
                });
            }
        }

        // Activate random nodes
        const shuffled = [...Array(nodes.length).keys()].sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(ACTIVE_COUNT, nodes.length); i++) {
            nodes[shuffled[i]].targetBrightness = 1;
        }

        return nodes;
    }, []);

    // Randomly swap active nodes
    const swapActiveNodes = useCallback(() => {
        const nodes = nodesRef.current;
        if (nodes.length === 0) return;

        const activeIndices = [];
        const inactiveIndices = [];

        nodes.forEach((node, i) => {
            if (node.targetBrightness > 0.5) activeIndices.push(i);
            else inactiveIndices.push(i);
        });

        // Swap multiple nodes at once
        const swapCount = Math.min(SWAP_COUNT, activeIndices.length, inactiveIndices.length);
        for (let i = 0; i < swapCount; i++) {
            if (activeIndices.length === 0 || inactiveIndices.length === 0) break;

            const activeIdx = activeIndices.splice(Math.floor(Math.random() * activeIndices.length), 1)[0];
            const inactiveIdx = inactiveIndices.splice(Math.floor(Math.random() * inactiveIndices.length), 1)[0];

            nodes[activeIdx].targetBrightness = 0;
            nodes[inactiveIdx].targetBrightness = 1;
        }
    }, []);

    // Animation loop - optimized
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { width, height } = dimensionsRef.current;

        ctx.clearRect(0, 0, width, height);

        const nodes = nodesRef.current;
        const time = Date.now() * 0.002;

        // Batch update brightness
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const pulseFactor = Math.sin(time + node.pulsePhase) * 0.3 + 0.7;
            const target = node.targetBrightness * pulseFactor;
            node.brightness += (target - node.brightness) * PULSE_SPEED;
        }

        // Draw connections - only between bright nodes
        ctx.lineWidth = 1;
        const brightNodes = [];
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].brightness > 0.15) brightNodes.push(nodes[i]);
        }

        ctx.beginPath();
        for (let i = 0; i < brightNodes.length; i++) {
            for (let j = i + 1; j < brightNodes.length; j++) {
                const n1 = brightNodes[i];
                const n2 = brightNodes[j];
                const dx = n2.x - n1.x;
                const dy = n2.y - n1.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
                    const opacity = (1 - Math.sqrt(distSq) / CONNECTION_DISTANCE) * Math.min(n1.brightness, n2.brightness) * 0.4;
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.beginPath();
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(n2.x, n2.y);
                    ctx.stroke();
                }
            }
        }

        // Draw nodes - monochrome white/gray
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.brightness > 0.05) {
                const alpha = node.brightness;

                // Simple glow - no gradient for performance
                ctx.beginPath();
                ctx.arc(node.x, node.y, NODE_SIZE * 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.15})`;
                ctx.fill();

                // Core pixel
                ctx.beginPath();
                ctx.arc(node.x, node.y, NODE_SIZE, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
                ctx.fill();
            } else {
                // Dim inactive pixel
                ctx.beginPath();
                ctx.arc(node.x, node.y, NODE_SIZE * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                ctx.fill();
            }
        }

        animationRef.current = requestAnimationFrame(animate);
    }, []);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                const width = window.innerWidth;
                const height = window.innerHeight;
                dimensionsRef.current = { width, height };
                canvasRef.current.width = width;
                canvasRef.current.height = height;
                nodesRef.current = initNodes(width, height);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [initNodes]);

    // Start animation
    useEffect(() => {
        animate();

        // Swap active nodes frequently
        const swapInterval = setInterval(swapActiveNodes, 300); // Much faster swapping

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            clearInterval(swapInterval);
        };
    }, [animate, swapActiveNodes]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none"
            style={{ background: 'transparent' }}
        />
    );
};

export default PixelGrid;
