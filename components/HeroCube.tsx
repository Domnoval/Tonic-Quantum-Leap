import React, { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const NEON = {
  magenta: '#FF006E',
  cyan: '#00FFD1',
  purple: '#7B2FBE',
  gold: '#C9A84C',
};

/* ── 4D Tesseract helpers ── */

// 16 vertices of a 4D hypercube (±1, ±1, ±1, ±1)
function buildHypercubeVertices(): number[][] {
  const verts: number[][] = [];
  for (let i = 0; i < 16; i++) {
    verts.push([
      (i & 1) ? 1 : -1,
      (i & 2) ? 1 : -1,
      (i & 4) ? 1 : -1,
      (i & 8) ? 1 : -1,
    ]);
  }
  return verts;
}

// Edges: pairs that differ in exactly one coordinate
function buildHypercubeEdges(verts: number[][]): [number, number][] {
  const edges: [number, number][] = [];
  for (let i = 0; i < verts.length; i++) {
    for (let j = i + 1; j < verts.length; j++) {
      let diff = 0;
      for (let k = 0; k < 4; k++) if (verts[i][k] !== verts[j][k]) diff++;
      if (diff === 1) edges.push([i, j]);
    }
  }
  return edges;
}

// 4D rotation in a plane (indices a, b)
function rotate4D(v: number[], a: number, b: number, angle: number): number[] {
  const out = [...v];
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  out[a] = v[a] * c - v[b] * s;
  out[b] = v[a] * s + v[b] * c;
  return out;
}

// Project 4D → 3D with perspective
function project4Dto3D(v: number[], dist: number): THREE.Vector3 {
  const w = v[3];
  const f = 1 / (dist - w);
  return new THREE.Vector3(v[0] * f, v[1] * f, v[2] * f);
}

const HYPER_VERTS = buildHypercubeVertices();
const HYPER_EDGES = buildHypercubeEdges(HYPER_VERTS);

/* ── Tesseract wireframe component ── */

interface TesseractProps {
  opacity: number;
}

function Tesseract({ opacity }: TesseractProps) {
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const matRef = useRef<THREE.LineBasicMaterial>(null);
  const angleRef = useRef({ xw: 0, yz: 0 });

  // Pre-allocate position buffer
  const positions = useMemo(() => new Float32Array(HYPER_EDGES.length * 6), []);

  useFrame((_state, delta) => {
    angleRef.current.xw += delta * 0.5;
    angleRef.current.yz += delta * 0.3;

    const { xw, yz } = angleRef.current;

    // Rotate and project all vertices
    const projected = HYPER_VERTS.map((v) => {
      let r = rotate4D(v, 0, 3, xw); // XW plane
      r = rotate4D(r, 1, 2, yz);     // YZ plane
      return project4Dto3D(r, 3);
    });

    // Fill edge positions
    for (let i = 0; i < HYPER_EDGES.length; i++) {
      const [a, b] = HYPER_EDGES[i];
      const pa = projected[a];
      const pb = projected[b];
      const off = i * 6;
      positions[off] = pa.x;
      positions[off + 1] = pa.y;
      positions[off + 2] = pa.z;
      positions[off + 3] = pb.x;
      positions[off + 4] = pb.y;
      positions[off + 5] = pb.z;
    }

    if (geomRef.current) {
      geomRef.current.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
      geomRef.current.computeBoundingSphere();
    }
    if (matRef.current) {
      matRef.current.opacity = opacity;
    }
  });

  return (
    <lineSegments>
      <bufferGeometry ref={geomRef} />
      <lineBasicMaterial
        ref={matRef}
        color={NEON.cyan}
        transparent
        opacity={opacity}
        depthWrite={false}
        linewidth={1}
      />
    </lineSegments>
  );
}

/* ── Procedural mandala texture ── */

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

  const rings = [40, 80, 120, 160, 200];
  rings.forEach((r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(201,168,76,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * 200, cy + Math.sin(angle) * 200);
    ctx.strokeStyle = 'rgba(123,47,190,0.25)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  for (const ring of [80, 160]) {
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * ring, cy + Math.sin(angle) * ring, 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,255,209,0.3)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(201,168,76,0.5)';
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/* ── Grid texture factory (parameterized by color) ── */

function createGridTexture(lineColor: THREE.Color, nodeColor: THREE.Color, nodeBrightness: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);

  const gridSize = 32;
  const lines = size / gridSize;

  const lr = Math.round(lineColor.r * 255);
  const lg = Math.round(lineColor.g * 255);
  const lb = Math.round(lineColor.b * 255);

  const nr = Math.round(nodeColor.r * 255);
  const ng = Math.round(nodeColor.g * 255);
  const nb = Math.round(nodeColor.b * 255);

  for (let i = 0; i <= lines; i++) {
    const pos = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(size, pos);
    ctx.strokeStyle = `rgba(${lr},${lg},${lb},0.4)`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, size);
    ctx.strokeStyle = `rgba(${lr},${lg},${lb},0.4)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  for (let i = 0; i <= lines; i++) {
    for (let j = 0; j <= lines; j++) {
      const x = i * gridSize;
      const y = j * gridSize;
      const dx = (x - size / 2) / (size / 2);
      const dy = (y - size / 2) / (size / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.85) {
        const alpha = (0.6 + 0.4 * nodeBrightness) * (1 - dist);
        ctx.beginPath();
        ctx.arc(x, y, 2 + nodeBrightness * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${nr},${ng},${nb},${alpha})`;
        ctx.fill();
      }
    }
  }

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
}

/* ── Sacred cube with tesseract morph ── */

interface SceneProps {
  active: boolean;
  setActive: (v: boolean) => void;
}

function SacredCube({ active, setActive }: SceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const cubeMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const wireMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const morphRef = useRef(0);

  const mandalaTexture = useMemo(() => createMandalaTexture(), []);

  const handlePointerOver = useCallback(() => setActive(true), [setActive]);
  const handlePointerOut = useCallback(() => setActive(false), [setActive]);
  const handleClick = useCallback(() => setActive(!active), [active, setActive]);

  useFrame((_state, delta) => {
    // Morph progress
    morphRef.current = THREE.MathUtils.lerp(morphRef.current, active ? 1 : 0, 0.05);
    const m = morphRef.current;

    // Rotate cube
    const rotY = delta * 0.15;
    const rotX = Math.sin(Date.now() * 0.0003) * 0.1;
    if (meshRef.current) {
      meshRef.current.rotation.y += rotY;
      meshRef.current.rotation.x = rotX;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y += rotY;
      wireRef.current.rotation.x = rotX;
    }

    // Fade cube out as tesseract fades in
    if (cubeMatRef.current) {
      cubeMatRef.current.opacity = 0.7 * (1 - m);
    }
    if (wireMatRef.current) {
      wireMatRef.current.opacity = 0.3 * (1 - m);
    }
  });

  return (
    <group
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Main translucent cube */}
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshPhysicalMaterial
          ref={cubeMatRef}
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
          ref={wireMatRef}
          color={new THREE.Color(NEON.cyan)}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Tesseract */}
      <Tesseract opacity={morphRef.current} />
    </group>
  );
}

/* ── Neon grid with color transitions ── */

function NeonGrid({ active }: { active: boolean }) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const gridColorRef = useRef(new THREE.Color(NEON.magenta));
  const nodeColorRef = useRef(new THREE.Color(NEON.cyan));
  const brightnessRef = useRef(0);

  // We regenerate the grid texture each frame during transitions (throttled)
  const texRef = useRef<THREE.CanvasTexture | null>(null);
  const frameCountRef = useRef(0);

  // Initial texture
  const initialTex = useMemo(
    () => createGridTexture(new THREE.Color(NEON.magenta), new THREE.Color(NEON.cyan), 0),
    [],
  );

  useFrame(() => {
    const targetLine = new THREE.Color(active ? NEON.cyan : NEON.magenta);
    const targetNode = new THREE.Color(active ? '#FFFFFF' : NEON.cyan);
    gridColorRef.current.lerp(targetLine, 0.05);
    nodeColorRef.current.lerp(targetNode, 0.05);
    brightnessRef.current = THREE.MathUtils.lerp(brightnessRef.current, active ? 1 : 0, 0.05);

    // Update texture every 3 frames to save perf
    frameCountRef.current++;
    if (frameCountRef.current % 3 === 0 && matRef.current) {
      if (texRef.current) texRef.current.dispose();
      texRef.current = createGridTexture(
        gridColorRef.current,
        nodeColorRef.current,
        brightnessRef.current,
      );
      matRef.current.map = texRef.current;
      matRef.current.needsUpdate = true;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial
        ref={matRef}
        map={initialTex}
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Main 3D hero scene ── */

const HeroCube: React.FC = () => {
  const [active, setActive] = useState(false);

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
        style={{ background: 'transparent', cursor: 'pointer' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 0, 0]} color={NEON.gold} intensity={2} distance={8} />
        <pointLight position={[0, -2, 0]} color={NEON.magenta} intensity={0.5} distance={6} />
        <pointLight position={[2, 2, 2]} color={NEON.purple} intensity={0.3} distance={10} />

        <fog attach="fog" args={[NEON.purple, 5, 15]} />

        <SacredCube active={active} setActive={setActive} />
        <NeonGrid active={active} />

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
