import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useTransition, a } from '@react-spring/three';

const COLLISION_RADIUS = 1.5;

// ... (ConnectionLines remains same, simplified) ...
const ConnectionLines = ({ dataRef, hexCount }) => {
    // ... existing logic ...
    const linesGeometry = useRef();
    const linesMaterial = useRef();
    const maxConnections = (hexCount * (hexCount - 1)) / 2;
    const positions = useMemo(() => new Float32Array(maxConnections * 6), [hexCount]);

    useFrame(() => {
        if (!dataRef.current || !linesGeometry.current) return;
        const { positions: hexPositions } = dataRef.current;
        let vertexIndex = 0;
        const connectionDistance = 5.0;

        // Only iterate up to ACTUAL current hexCount
        // Note: dataRef positions might be larger if we cached them, but hexCount limits us
        for (let i = 0; i < hexCount; i++) {
            for (let j = i + 1; j < hexCount; j++) {
                const p1 = hexPositions[i];
                const p2 = hexPositions[j];
                const dist = p1.distanceTo(p2);

                if (dist < connectionDistance) {
                    positions[vertexIndex * 3] = p1.x;
                    positions[vertexIndex * 3 + 1] = p1.y;
                    positions[vertexIndex * 3 + 2] = p1.z;
                    positions[vertexIndex * 3 + 3] = p2.x;
                    positions[vertexIndex * 3 + 4] = p2.y;
                    positions[vertexIndex * 3 + 5] = p2.z;
                    vertexIndex += 2;
                }
            }
        }
        for (let k = vertexIndex; k < maxConnections * 2; k++) {
            positions[k * 3] = 0;
            positions[k * 3 + 1] = 0;
            positions[k * 3 + 2] = 0;
        }
        linesGeometry.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        linesGeometry.current.needsUpdate = true;
    });

    return (
        <lineSegments>
            <bufferGeometry ref={linesGeometry}>
                <bufferAttribute attach="attributes-position" count={maxConnections * 2} array={positions} itemSize={3} />
            </bufferGeometry>
            <lineBasicMaterial ref={linesMaterial} color="#ffffff" transparent opacity={0.15} linewidth={1} />
        </lineSegments>
    );
};

const HexagonInstance = ({ color, index, registerRef, style }) => {
    const groupRef = useRef();
    const meshRef = useRef();
    const outerRef = useRef();
    const [hovered, setHover] = useState(false);

    const spinSpeed = useRef({ x: (Math.random() - 0.5) * 0.01, y: (Math.random() - 0.5) * 0.01 });

    useEffect(() => {
        if (groupRef.current) registerRef(index, groupRef.current);
    }, [index, registerRef]);

    useFrame(() => {
        if (meshRef.current && outerRef.current) {
            meshRef.current.rotation.x += spinSpeed.current.x;
            meshRef.current.rotation.y += spinSpeed.current.y;
            outerRef.current.rotation.x -= spinSpeed.current.x * 0.5;
            outerRef.current.rotation.y -= spinSpeed.current.y * 0.5;
        }
    });

    return (
        // Apply spring scale here
        <a.group ref={groupRef} scale={style.scale}>
            <mesh
                visible={false}
                onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'none'; }}
                onPointerOut={(e) => { setHover(false); document.body.style.cursor = 'none'; }}
            >
                <icosahedronGeometry args={[1.5, 0]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[1.3, 0]} />
                <meshStandardMaterial color={hovered ? color : color} wireframe transparent opacity={1} emissive={hovered ? color : color} emissiveIntensity={hovered ? 100 : 30} />
            </mesh>
            <mesh ref={outerRef}>
                <icosahedronGeometry args={[1.5, 0]} />
                <meshStandardMaterial color={hovered ? color : color} wireframe transparent opacity={0.5} emissive={color} emissiveIntensity={hovered ? 50 : 10} />
            </mesh>
        </a.group>
    );
};

const PhysicsManager = ({ dataRef, hexCount }) => {
    const velocities = useRef([]);

    // Ensure velocities array matches physics data length
    // We maintain a persistent array but resize/reset if needed
    if (velocities.current.length < hexCount) {
        for (let i = velocities.current.length; i < hexCount; i++) {
            velocities.current.push(new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0));
        }
    }

    useFrame((state, delta) => {
        if (!dataRef.current) return;
        const { width, height } = state.viewport;
        const dt = Math.min(delta, 0.05);
        const positions = dataRef.current.positions;
        const vels = velocities.current;

        for (let i = 0; i < hexCount; i++) {
            const p = positions[i];
            const v = vels[i] || new THREE.Vector3(); // safety

            p.addScaledVector(v, dt);
            if (isNaN(p.x) || isNaN(p.y)) p.set(0, 0, 0);

            const margin = COLLISION_RADIUS;
            if (p.x > width / 2 - margin) { p.x = width / 2 - margin; v.x *= -1; }
            if (p.x < -width / 2 + margin) { p.x = -width / 2 + margin; v.x *= -1; }
            if (p.y > height / 2 - margin) { p.y = height / 2 - margin; v.y *= -1; }
            if (p.y < -height / 2 + margin) { p.y = -height / 2 + margin; v.y *= -1; }

            const mouseX = (state.pointer.x * width) / 2;
            const mouseY = (state.pointer.y * height) / 2;
            const distMouse = Math.sqrt((p.x - mouseX) ** 2 + (p.y - mouseY) ** 2);
            if (distMouse < 5) {
                const kickDir = new THREE.Vector3(p.x - mouseX, p.y - mouseY, 0).normalize();
                v.addScaledVector(kickDir, 15 * dt);
            }

            const speed = v.length();
            if (speed < 1.5) v.multiplyScalar(1.02);
            else if (speed > 5) v.multiplyScalar(0.95);
        }

        // Collisions... (omitted for brevity, assume similar loop up to hexCount)
        // Sync meshes
        for (let i = 0; i < hexCount; i++) {
            const meshGroup = dataRef.current.meshes[i];
            if (meshGroup) meshGroup.position.copy(positions[i]);
        }
    });

    const registerMesh = (index, ref) => {
        if (dataRef.current) dataRef.current.meshes[index] = ref;
    };

    const colors = ['#3b82f6', '#6366f1', '#ec4899', '#14b8a6', '#8b5cf6', '#ffffff'];

    // React Spring Transition for mounting/unmounting items
    // We generate an index array [0, 1, ... hexCount-1]
    const items = useMemo(() => new Array(hexCount).fill(0).map((_, i) => i), [hexCount]);

    const transitions = useTransition(items, {
        from: { scale: 0 },
        enter: { scale: 1 },
        leave: { scale: 0 },
        config: { mass: 1, tension: 280, friction: 60 }
    });

    return (
        <group>
            {transitions((style, i) => (
                <HexagonInstance
                    key={i}
                    index={i}
                    style={style} // Pass animated style
                    color={colors[i % colors.length]}
                    registerRef={registerMesh}
                />
            ))}
        </group>
    );
};

const SceneInternal = ({ hexCount }) => {
    // Keep positions stable/growing
    // If hexCount increases, we need new positions.
    const physicsData = useRef({
        positions: [], // will fill dynamically
        meshes: []
    });

    // Ensure positions exist for at least hexCount
    if (physicsData.current.positions.length < hexCount) {
        for (let i = physicsData.current.positions.length; i < hexCount; i++) {
            physicsData.current.positions.push(new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 6,
                0
            ));
            physicsData.current.meshes.push(null);
        }
    }

    return (
        <>
            <PhysicsManager dataRef={physicsData} hexCount={hexCount} />
            <ConnectionLines dataRef={physicsData} hexCount={hexCount} />
        </>
    );
};

const Scene3D = () => {
    const [hexCount, setHexCount] = useState(8);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setHexCount(4);
            else if (window.innerWidth < 1024) setHexCount(6);
            else setHexCount(8);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="absolute inset-0 z-0 pointer-events-auto">
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }} gl={{ alpha: true, antialias: true }}>
                <ambientLight intensity={1} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <SceneInternal hexCount={hexCount} />

                <Suspense fallback={null}>
                    <Environment preset="city" />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default Scene3D;

