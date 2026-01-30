import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

const BouncingHexagon = ({ initialPos, initialVel, color }) => {
    const meshRef = useRef();
    // Mutable velocity ref ensures changes persist across renders without causing re-renders
    const vel = useRef(initialVel ? new THREE.Vector3(...initialVel) : new THREE.Vector3(0, 0, 0));

    // Random spin speed
    const spin = useRef({ x: Math.random() * 0.01, y: Math.random() * 0.01 });

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Cap delta to prevent huge jumps
        const dt = Math.min(delta, 0.1);

        // 1. Update Position
        meshRef.current.position.addScaledVector(vel.current, dt);

        // 2. Wall Bounce (Viewport Edges)
        const { width, height } = state.viewport;
        const radius = 1.2; // approx radius
        const pos = meshRef.current.position;

        // X Bounce
        if (pos.x > width / 2 - radius) {
            pos.x = width / 2 - radius;
            vel.current.x *= -1;
        } else if (pos.x < -width / 2 + radius) {
            pos.x = -width / 2 + radius;
            vel.current.x *= -1;
        }

        // Y Bounce
        if (pos.y > height / 2 - radius) {
            pos.y = height / 2 - radius;
            vel.current.y *= -1;
        } else if (pos.y < -height / 2 + radius) {
            pos.y = -height / 2 + radius;
            vel.current.y *= -1;
        }

        // 3. Central Repulsion (Avoid "CAMPUS NODES" Text)
        // Assume text is roughly at 0,0 with radius ~3
        const distCenter = pos.length(); // distance from 0,0
        if (distCenter < 3.5) {
            // Push away from center
            const repulsion = pos.clone().normalize().multiplyScalar(10 * dt);
            vel.current.add(repulsion);
            // Normalize velocity to prevent unlimited acceleration
            vel.current.clampLength(1, 4);
        }

        // 4. Mouse Repulsion ("Divert from path")
        // Mouse in viewport coords
        const mouseX = (state.pointer.x * width) / 2;
        const mouseY = (state.pointer.y * height) / 2;
        const distMouse = Math.sqrt(
            Math.pow(pos.x - mouseX, 2) +
            Math.pow(pos.y - mouseY, 2)
        );

        if (distMouse < 4) {
            // Direction from mouse to object
            const dir = new THREE.Vector3(pos.x - mouseX, pos.y - mouseY, 0).normalize();
            // Apply force
            vel.current.addScaledVector(dir, 15 * dt);
            // Normalize again
            vel.current.clampLength(1, 5);
        }

        // 5. Spin
        meshRef.current.rotation.x += spin.current.x;
        meshRef.current.rotation.y += spin.current.y;
    });

    return (
        <mesh
            ref={meshRef}
            position={initialPos}
            onPointerOver={(e) => {
                e.stopPropagation();
                if (meshRef.current) {
                    meshRef.current.material.emissiveIntensity = 3;
                    meshRef.current.material.color.set("#00ffff");
                }
            }}
            onPointerOut={(e) => {
                if (meshRef.current) {
                    meshRef.current.material.emissiveIntensity = 0.5;
                    meshRef.current.material.color.set(color);
                }
            }}
        >
            <icosahedronGeometry args={[1.2, 0]} />
            <meshStandardMaterial
                color={color}
                wireframe
                emissive={color}
                emissiveIntensity={0.5}
                transparent
                opacity={0.6}
            />
        </mesh>
    );
};

const HexagonManager = () => {
    // Generate hexagons once. We interpret 'randomly around the screen' as initial random spread.
    // We use a fixed spread assuming a standard desktop viewport, bouncing logic will handle resize constraint.
    const hexagons = useMemo(() => {
        const colors = ['#3b82f6', '#6366f1', '#ec4899', '#14b8a6', '#8b5cf6', '#ffffff'];
        return new Array(8).fill().map((_, i) => ({
            position: [
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 8,
                0
            ],
            velocity: [
                (Math.random() - 0.5) * 3, // Random speed
                (Math.random() - 0.5) * 3,
                0
            ],
            color: colors[i % colors.length]
        }));
    }, []);

    return (
        <group>
            {hexagons.map((hex, i) => (
                <BouncingHexagon
                    key={i}
                    initialPos={hex.position}
                    initialVel={hex.velocity}
                    color={hex.color}
                />
            ))}
        </group>
    );
};

const Scene3D = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-auto">
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }} gl={{ alpha: true, antialias: true }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />

                <HexagonManager />

                <Environment preset="city" />
            </Canvas>
        </div>
    );
};

export default Scene3D;
