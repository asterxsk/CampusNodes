/*
    Cubes.jsx
    High-performance WebGL implementation of the interactive grid.
    Features:
    - InstancedMesh for 60fps performance with 1000+ cubes.
    - Custom shaders for "Flat-to-3D" tilt effect on hover.
    - Dim blue dashed aesthetics.
*/

import React, { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Vertex Shader
// Handles the "Tilt" animation.
// Default state: Flat facing camera.
// Hover state: Rotates to reveal 3D shape.
const vertexShader = `
    varying vec2 vUv;
    varying float vHover;

    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;

    // Rotation helper
    mat4 rotationMatrix(vec3 axis, float angle) {
        axis = normalize(axis);
        float s = sin(angle);
        float c = cos(angle);
        float oc = 1.0 - c;
        return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                    0.0,                                0.0,                                0.0,                                1.0);
    }

    void main() {
        vUv = uv;
        
        // Instance position
        vec3 pos = instanceMatrix[3].xyz;
        
        // Calculate distance from mouse to this instance in world space (XY plane)
        // Adjust multiplier to fine tune the "radius" of effect
        float dist = distance(pos.xy, uMouse * 35.0); 
        
        // 1.0 when close, 0.0 when far
        float influence = smoothstep(6.0, 0.0, dist); 
        vHover = influence;

        vec3 newPos = position;

        // TILT EFFECT
        // When hovered (influence > 0), rotate the cube.
        // We rotate around a diagonal axis [1, -1, 0] to reveal the top-left or bottom-right sides
        if (influence > 0.0) {
            float angle = influence * 0.7; // Max rotation ~40 degrees
            mat4 rot = rotationMatrix(vec3(1.0, -1.0, 0.0), angle);
            newPos = (rot * vec4(newPos, 1.0)).xyz;
        }

        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(newPos, 1.0);
    }
`;

// Fragment Shader
// Renders the box with dim blue dashed lines.
const fragmentShader = `
    varying vec2 vUv;
    varying float vHover;

    void main() {
        // --- Dashed Border Logic ---
        float borderThickness = 0.06; // Slightly thicker for visibility
        float dashFreq = 15.0; // Dash density
        
        // Distance to nearest edge
        vec2 d = step(vec2(borderThickness), vUv) - step(vec2(1.0 - borderThickness), vUv);
        float atEdge = 1.0 - (d.x * d.y); // 1.0 if at border, 0.0 if center

        // Dash pattern
        // Vertical edges use Y, horizontal use X
        float dash = 0.0;
        if (vUv.x < borderThickness || vUv.x > 1.0 - borderThickness) {
            dash = step(0.0, sin(vUv.y * dashFreq));
        } else if (vUv.y < borderThickness || vUv.y > 1.0 - borderThickness) {
            dash = step(0.0, sin(vUv.x * dashFreq));
        }
        
        // Final pixel opacity
        float alpha = atEdge * dash;

        // --- Color ---
        vec3 black = vec3(0.0);
        // Dim Blue: R:0.2, G:0.3, B:0.8
        vec3 dimBlue = vec3(0.25, 0.35, 0.85); 
        
        // Slightly brighten the blue on hover
        vec3 finalColor = mix(dimBlue, dimBlue * 1.5, vHover);

        // Discard center pixels (transparency)
        if (alpha < 0.1) discard;

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

const CubeGrid = () => {
    const meshRef = useRef();
    const { viewport } = useThree();

    // Grid Configuration
    // 40x25 covers most 16:9 screens without overdrawing too much
    // 60x40 covers essentially any resolution
    const cols = 60;
    const rows = 40;
    const spacing = 1.6;

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(9999, 9999) }, // Init off-screen
        uResolution: { value: new THREE.Vector2(1, 1) }
    }), []);

    // Helper for matrix updates
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const initGrid = useCallback((instancedMesh) => {
        if (!instancedMesh) return;

        let i = 0;
        // Center the grid
        const width = cols * spacing;
        const height = rows * spacing;
        const offsetX = width / 2;
        const offsetY = height / 2;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                dummy.position.set(
                    x * spacing - offsetX,
                    y * spacing - offsetY,
                    0
                );
                dummy.scale.set(1, 1, 1);
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(i++, dummy.matrix);
            }
        }
        instancedMesh.instanceMatrix.needsUpdate = true;
    }, [dummy]);

    useFrame((state) => {
        if (meshRef.current) {
            // Update time
            meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();

            // Map mouse to world space
            // Our camera is at Z=30 looking at Z=0.
            // Using a simple perspective mapping.
            // Normalized mouse (-1 to 1) -> World Coords
            const x = (state.mouse.x * viewport.width) / 2;
            const y = (state.mouse.y * viewport.height) / 2;

            meshRef.current.material.uniforms.uMouse.value.set(x, y);
        }
    });

    return (
        <instancedMesh
            ref={(node) => { meshRef.current = node; initGrid(node); }}
            args={[null, null, cols * rows]}
            position={[0, 0, 0]}
        >
            <boxGeometry args={[1, 1, 1]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
            />
        </instancedMesh>
    );
};

const Cubes = () => {
    return (
        <div style={{ width: '100%', height: '100%', background: '#000000' }}>
            {/* 
                Orthographic Camera ensures perfectly flat squares by default 
                Zoom level controls how "big" the grid looks.
            */}
            <Canvas orthographic camera={{ position: [0, 0, 50], zoom: 25 }}>
                <color attach="background" args={['#000000']} />
                <CubeGrid />
            </Canvas>
        </div>
    );
};

export default Cubes;
