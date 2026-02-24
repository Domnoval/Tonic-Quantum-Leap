import React, { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const NEON = {
  magenta: '#FF006E',
  cyan: '#00FFD1',
  purple: '#7B2FBE',
  gold: '#C9A84C',
  warmGold: '#E8C547',
};

/* ── 4D Tesseract helpers ── */

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

function rotate4D(v: number[], a: number, b: number, angle: number): number[] {
  const out = [...v];
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  out[a] = v[a] * c - v[b] * s;
  out[b] = v[a] * s + v[b] * c;
  return out;
}

function project4Dto3D(v: number[], dist: number): THREE.Vector3 {
  const w = v[3];
  const f = 1 / (dist - w);
  return new THREE.Vector3(v[0] * f, v[1] * f, v[2] * f);
}

const HYPER_VERTS = buildHypercubeVertices();
const HYPER_EDGES = buildHypercubeEdges(HYPER_VERTS);

/* ── Tesseract wireframe ── */

function Tesseract({ opacity }: { opacity: number }) {
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const matRef = useRef<THREE.LineBasicMaterial>(null);
  const angleRef = useRef({ xw: 0, yz: 0 });
  const positions = useMemo(() => new Float32Array(HYPER_EDGES.length * 6), []);

  useFrame((_state, delta) => {
    angleRef.current.xw += delta * 0.5;
    angleRef.current.yz += delta * 0.3;
    const { xw, yz } = angleRef.current;

    const projected = HYPER_VERTS.map((v) => {
      let r = rotate4D(v, 0, 3, xw);
      r = rotate4D(r, 1, 2, yz);
      return project4Dto3D(r, 3);
    });

    for (let i = 0; i < HYPER_EDGES.length; i++) {
      const [a, b] = HYPER_EDGES[i];
      const pa = projected[a];
      const pb = projected[b];
      const off = i * 6;
      positions[off] = pa.x; positions[off + 1] = pa.y; positions[off + 2] = pa.z;
      positions[off + 3] = pb.x; positions[off + 4] = pb.y; positions[off + 5] = pb.z;
    }

    if (geomRef.current) {
      geomRef.current.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
      geomRef.current.computeBoundingSphere();
    }
    if (matRef.current) matRef.current.opacity = opacity;
  });

  return (
    <lineSegments>
      <bufferGeometry ref={geomRef} />
      <lineBasicMaterial ref={matRef} color={NEON.warmGold} transparent opacity={opacity} depthWrite={false} linewidth={1} />
    </lineSegments>
  );
}

/* ── Typographic cube face — every face is MADE of letters ── */

function createTypeFaceTexture(faceIndex: number): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;

  ctx.clearRect(0, 0, size, size);

  // Unique seed per face
  const seed = faceIndex * 47;

  // Layer 1: Dense background — tiny "TONIC THOUGHT" repeated, rotated
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(((seed * 0.3) % 6) - 3);
  ctx.translate(-cx, -cy);
  ctx.font = '600 18px "Courier New", Courier, monospace';
  ctx.fillStyle = 'rgba(123,47,190,0.13)';
  const bgLine = 'TONIC THOUGHT '.repeat(8);
  for (let y = -20; y < size + 40; y += 22) {
    const offset = ((y + seed * 13) % 80) - 40;
    ctx.fillText(bgLine, -200 + offset, y);
  }
  ctx.restore();

  // Layer 2: Medium diagonal text stripes
  ctx.save();
  ctx.translate(cx, cy);
  const diagAngle = [0.785, -0.785, 0.52, -0.52, 1.05, -1.05][faceIndex];
  ctx.rotate(diagAngle);
  ctx.translate(-cx, -cy);
  ctx.font = '700 36px "Courier New", Courier, monospace';
  ctx.fillStyle = 'rgba(201,168,76,0.15)';
  const words = ['TONIC', 'THOUGHT', 'STUDIOS'];
  for (let y = -100; y < size + 200; y += 48) {
    const word = words[(Math.abs(y + seed) >> 5) % words.length];
    const spacing = word.length * 30;
    for (let x = -200; x < size + 200; x += spacing + 60) {
      ctx.fillText(word, x + ((y * 0.3 + seed) % 40), y);
    }
  }
  ctx.restore();

  // Layer 3: Large scattered accent letters
  const accents = ['T', 'O', 'N', 'I', 'C', 'T', 'H', 'O', 'U', 'G', 'H', 'T'];
  for (let i = 0; i < 10; i++) {
    const ax = ((seed * 73 + i * 137) % size);
    const ay = ((seed * 51 + i * 193) % size);
    const aRot = ((seed + i * 89) % 628) / 100;
    const aSize = 140 + ((seed + i * 43) % 100);
    const letter = accents[(i + faceIndex) % accents.length];

    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(aRot);
    ctx.font = `900 ${aSize}px "Courier New", Courier, monospace`;
    ctx.fillStyle = `rgba(201,168,76,${0.05 + (i % 4) * 0.025})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 0, 0);
    ctx.restore();
  }

  // Layer 4: Hero text — different treatment per face for variety
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (faceIndex === 4 || faceIndex === 5) {
    // Front / back — full brand, big and glowing
    ctx.shadowColor = '#C9A84C';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#C9A84C';
    ctx.font = '900 150px "Courier New", Courier, monospace';
    ctx.fillText('TONIC', cx, cy - 70);
    ctx.font = '900 95px "Courier New", Courier, monospace';
    ctx.fillText('THOUGHT', cx, cy + 70);
    // Bright core
    ctx.shadowBlur = 15;
    ctx.fillStyle = 'rgba(255,245,210,0.9)';
    ctx.font = '900 150px "Courier New", Courier, monospace';
    ctx.fillText('TONIC', cx, cy - 70);
    ctx.font = '900 95px "Courier New", Courier, monospace';
    ctx.fillText('THOUGHT', cx, cy + 70);
    ctx.shadowBlur = 0;
  } else if (faceIndex === 0 || faceIndex === 1) {
    // Left / right — vertical stacked letters
    ctx.shadowColor = '#C9A84C';
    ctx.shadowBlur = 25;
    ctx.fillStyle = 'rgba(201,168,76,0.75)';
    ctx.font = '900 110px "Courier New", Courier, monospace';
    const word = faceIndex === 0 ? 'TONIC' : 'THINK';
    for (let i = 0; i < word.length; i++) {
      ctx.fillText(word[i], cx, 120 + i * 170);
    }
    ctx.shadowBlur = 0;
  } else {
    // Top / bottom — spread text with rotation
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(faceIndex === 2 ? 0 : Math.PI);
    ctx.shadowColor = '#C9A84C';
    ctx.shadowBlur = 20;
    ctx.fillStyle = 'rgba(201,168,76,0.6)';
    ctx.font = '900 90px "Courier New", Courier, monospace';
    ctx.fillText('TONIC', 0, -40);
    ctx.font = '900 60px "Courier New", Courier, monospace';
    ctx.fillText('THOUGHT', 0, 50);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Subtle edge vignette
  const gradient = ctx.createRadialGradient(cx, cy, size * 0.3, cx, cy, size * 0.52);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.globalCompositeOperation = 'destination-out';
  // Actually let's NOT vignette — let the text fill the whole face
  ctx.globalCompositeOperation = 'source-over';

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/* ── Grid texture ── */

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
    ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(size, pos);
    ctx.strokeStyle = `rgba(${lr},${lg},${lb},0.4)`; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, size);
    ctx.strokeStyle = `rgba(${lr},${lg},${lb},0.4)`; ctx.lineWidth = 1; ctx.stroke();
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

/* ── Sacred typographic cube with tesseract morph ── */

interface SceneProps {
  active: boolean;
  setActive: (v: boolean) => void;
}

function SacredCube({ active, setActive }: SceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const wireMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const morphRef = useRef(0);
  const cubeMatsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);

  // Generate unique typographic texture for each face
  const faceTextures = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => createTypeFaceTexture(i)), []);

  // 6 materials — one per face, each with its own typographic texture
  const cubeMaterials = useMemo(() => {
    const mats = faceTextures.map((tex, i) => {
      const isFront = i === 4 || i === 5;
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(NEON.warmGold),
        transmission: 0.7,
        roughness: 0.1,
        metalness: 0.15,
        transparent: true,
        opacity: 0.6,
        map: tex,
        emissive: new THREE.Color(NEON.warmGold),
        emissiveMap: tex,
        emissiveIntensity: isFront ? 0.5 : 0.25,
        side: THREE.DoubleSide as THREE.Side,
      });
    });
    cubeMatsRef.current = mats;
    return mats;
  }, [faceTextures]);

  const handlePointerOver = useCallback(() => setActive(true), [setActive]);
  const handlePointerOut = useCallback(() => setActive(false), [setActive]);
  const handleClick = useCallback(() => setActive(!active), [active, setActive]);

  useFrame((_state, delta) => {
    morphRef.current = THREE.MathUtils.lerp(morphRef.current, active ? 1 : 0, 0.05);
    const m = morphRef.current;

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

    // Fade cube out, tesseract in
    for (const mat of cubeMatsRef.current) {
      mat.opacity = 0.75 * (1 - m);
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
      <mesh ref={meshRef} material={cubeMaterials}>
        <boxGeometry args={[2, 2, 2]} />
      </mesh>

      <mesh ref={wireRef} scale={[1.02, 1.02, 1.02]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial
          ref={wireMatRef}
          color={new THREE.Color(NEON.warmGold)}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

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
  const texRef = useRef<THREE.CanvasTexture | null>(null);
  const frameCountRef = useRef(0);

  const initialTex = useMemo(
    () => createGridTexture(new THREE.Color(NEON.magenta), new THREE.Color(NEON.cyan), 0), []);

  useFrame(() => {
    const targetLine = new THREE.Color(active ? NEON.cyan : NEON.magenta);
    const targetNode = new THREE.Color(active ? '#FFFFFF' : NEON.cyan);
    gridColorRef.current.lerp(targetLine, 0.05);
    nodeColorRef.current.lerp(targetNode, 0.05);
    brightnessRef.current = THREE.MathUtils.lerp(brightnessRef.current, active ? 1 : 0, 0.05);

    frameCountRef.current++;
    if (frameCountRef.current % 3 === 0 && matRef.current) {
      if (texRef.current) texRef.current.dispose();
      texRef.current = createGridTexture(gridColorRef.current, nodeColorRef.current, brightnessRef.current);
      matRef.current.map = texRef.current;
      matRef.current.needsUpdate = true;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial ref={matRef} map={initialTex} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/* ── Main 3D hero scene ── */

const HeroCube: React.FC = () => {
  const [active, setActive] = useState(false);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 50 }}
        style={{ background: 'transparent', cursor: 'pointer' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.15} />
        <pointLight position={[0, 0, 0]} color={NEON.warmGold} intensity={3} distance={8} />
        <pointLight position={[0, -2, 0]} color={NEON.gold} intensity={0.5} distance={6} />
        <pointLight position={[2, 2, 2]} color={NEON.warmGold} intensity={0.4} distance={10} />

        <SacredCube active={active} setActive={setActive} />
        {/* Grid removed — video background has its own */}

        <OrbitControls
          autoRotate
          autoRotateSpeed={0.3}
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          rotateSpeed={0.8}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
        />
      </Canvas>
    </div>
  );
};

export default HeroCube;
