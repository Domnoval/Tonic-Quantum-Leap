import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const NEON = {
  magenta: '#FF006E',
  cyan: '#00FFD1',
  purple: '#7B2FBE',
  gold: '#C9A84C',
};

/** Procedural sacred geometry mandala texture */
function createMandalaTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;

  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.clearRect(0, 0, size, size);

  // Concentric circles
  const rings = [40, 80, 120, 160, 200];
  rings.forEach((r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(201,168,76,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Radial lines
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * 200, cy + Math.sin(angle) * 200);
    ctx.strokeStyle = 'rgba(123,47,190,0.25)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  // Satellite circles at intersections
  for (let ring of [80, 160]) {
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * ring, cy + Math.sin(angle) * ring, 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,255,209,0.3)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(201,168,76,0.5)';
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/** The sacred geometry cube */
function SacredCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  const mandalaTexture = useMemo(() => createMandalaTexture(), []);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.1;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y += delta * 0.15;
      wireRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.1;
    }
  });

  return (
    <group>
      {/* Main translucent cube */}
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshPhysicalMaterial
          color={new THREE.Color(NEON.purple)}
          transmission={0.6}
          roughness={0.1}
          metalness={0.1}
          transparent
          opacity={0.7}
          map={mandalaTexture}
          emissive={new THREE.Color(NEON.gold)}
          emissiveIntensity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wireframe glow overlay */}
      <mesh ref={wireRef} scale={[1.02, 1.02, 1.02]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial
          color={new THREE.Color(NEON.cyan)}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

/** Neon grid platform below the cube */
function NeonGrid() {
  const gridTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, size, size);

    const gridSize = 32;
    const lines = size / gridSize;

    // Grid lines
    for (let i = 0; i <= lines; i++) {
      const pos = i * gridSize;
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(size, pos);
      ctx.strokeStyle = 'rgba(255,0,110,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Vertical
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(0 + pos, size);
      ctx.strokeStyle = 'rgba(255,0,110,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Intersection nodes
    for (let i = 0; i <= lines; i++) {
      for (let j = 0; j <= lines; j++) {
        const x = i * gridSize;
        const y = j * gridSize;
        // Fade at edges
        const dx = (x - size / 2) / (size / 2);
        const dy = (y - size / 2) / (size / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.85) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,255,209,${0.6 * (1 - dist)})`;
          ctx.fill();
        }
      }
    }

    // Radial fade
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.7, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial
        map={gridTexture}
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Main 3D hero scene */
const HeroCube: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    >
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 0, 0]} color={NEON.gold} intensity={2} distance={8} />
        <pointLight position={[0, -2, 0]} color={NEON.magenta} intensity={0.5} distance={6} />
        <pointLight position={[2, 2, 2]} color={NEON.purple} intensity={0.3} distance={10} />

        {/* Fog */}
        <fog attach="fog" args={[NEON.purple, 5, 15]} />

        {/* Scene objects */}
        <SacredCube />
        <NeonGrid />

        {/* Controls */}
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.3}
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
};

export default HeroCube;
