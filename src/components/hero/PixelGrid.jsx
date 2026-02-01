import React, { useRef, useEffect, useState, useCallback } from 'react';

const PixelGrid = () => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const nodesRef = useRef([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const NODE_SIZE = 4; // Size of each LED pixel
    const GRID_GAP = 20; // Gap between nodes
    const CONNECTION_DISTANCE = 80; // Distance for nodes to connect
    const ACTIVE_COUNT = 25; // Number of active (lit) nodes at any time
    const PULSE_SPEED = 0.03; // Speed of pulsing animation

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
                    pulsePhase: Math.random() * Math.PI * 2,
                    isActive: false,
                    color: getRandomColor()
                });
            }
        }

        // Activate random nodes
        const shuffled = [...Array(nodes.length).keys()].sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(ACTIVE_COUNT, nodes.length); i++) {
            nodes[shuffled[i]].isActive = true;
            nodes[shuffled[i]].targetBrightness = 1;
        }

        return nodes;
    }, []);

    const getRandomColor = () => {
        const colors = [
            { r: 34, g: 211, b: 238 },   // Accent cyan
            { r: 59, g: 130, b: 246 },   // Blue
            { r: 139, g: 92, b: 246 },   // Purple
            { r: 236, g: 72, b: 153 },   // Pink
            { r: 255, g: 255, b: 255 },  // White
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    // Randomly swap active nodes
    const swapActiveNodes = useCallback(() => {
        const nodes = nodesRef.current;
        if (nodes.length === 0) return;

        // Find current active and inactive nodes
        const activeIndices = [];
        const inactiveIndices = [];

        nodes.forEach((node, i) => {
            if (node.isActive) activeIndices.push(i);
            else inactiveIndices.push(i);
        });

        // Swap 1-2 random active with inactive
        const swapCount = Math.min(2, activeIndices.length, inactiveIndices.length);
        for (let i = 0; i < swapCount; i++) {
            const activeIdx = activeIndices[Math.floor(Math.random() * activeIndices.length)];
            const inactiveIdx = inactiveIndices[Math.floor(Math.random() * inactiveIndices.length)];

            nodes[activeIdx].isActive = false;
            nodes[activeIdx].targetBrightness = 0;

            nodes[inactiveIdx].isActive = true;
            nodes[inactiveIdx].targetBrightness = 1;
            nodes[inactiveIdx].color = getRandomColor();

            // Remove swapped indices
            activeIndices.splice(activeIndices.indexOf(activeIdx), 1);
            inactiveIndices.splice(inactiveIndices.indexOf(inactiveIdx), 1);
        }
    }, []);

    // Animation loop
    const animate = useCallback((ctx, width, height) => {
        ctx.clearRect(0, 0, width, height);

        const nodes = nodesRef.current;
        const time = Date.now() * 0.001;

        // Update node brightness with smooth transitions
        nodes.forEach(node => {
            const pulseFactor = Math.sin(time * 2 + node.pulsePhase) * 0.3 + 0.7;
            const target = node.targetBrightness * pulseFactor;
            node.brightness += (target - node.brightness) * PULSE_SPEED;
        });

        // Draw connections between active nodes in proximity
        ctx.lineWidth = 1;
        const activeNodes = nodes.filter(n => n.brightness > 0.1);

        for (let i = 0; i < activeNodes.length; i++) {
            for (let j = i + 1; j < activeNodes.length; j++) {
                const n1 = activeNodes[i];
                const n2 = activeNodes[j];
                const dx = n2.x - n1.x;
                const dy = n2.y - n1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DISTANCE) {
                    const opacity = (1 - dist / CONNECTION_DISTANCE) * Math.min(n1.brightness, n2.brightness) * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(n2.x, n2.y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.stroke();
                }
            }
        }

        // Draw nodes (pixels)
        nodes.forEach(node => {
            if (node.brightness > 0.01) {
                const { r, g, b } = node.color;
                const alpha = node.brightness;

                // Glow effect
                const gradient = ctx.createRadialGradient(
                    node.x, node.y, 0,
                    node.x, node.y, NODE_SIZE * 3
                );
                gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.8})`);
                gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.2})`);
                gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

                ctx.beginPath();
                ctx.arc(node.x, node.y, NODE_SIZE * 3, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Core pixel
                ctx.beginPath();
                ctx.arc(node.x, node.y, NODE_SIZE / 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.fill();
            } else {
                // Dim inactive pixel
                ctx.beginPath();
                ctx.arc(node.x, node.y, NODE_SIZE / 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.fill();
            }
        });

        animationRef.current = requestAnimationFrame(() => animate(ctx, width, height));
    }, []);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                const width = window.innerWidth;
                const height = window.innerHeight;
                setDimensions({ width, height });
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
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        animate(ctx, dimensions.width, dimensions.height);

        // Swap active nodes periodically
        const swapInterval = setInterval(swapActiveNodes, 800);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            clearInterval(swapInterval);
        };
    }, [dimensions, animate, swapActiveNodes]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none"
            style={{ background: 'transparent' }}
        />
    );
};

export default PixelGrid;
