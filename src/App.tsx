import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, Sparkles, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Volume2, VolumeX, X, Music2, Rotate3d, ChevronDown } from 'lucide-react';
import * as THREE from 'three';
import { memories, type Memory, finalMessage } from '@/memories';
import { useBarkTexture } from '@/textures';
import { buildTree, BARK_COLOR, type BranchSeg, type LeafPuff } from '@/tree';

type Point3 = [number, number, number];
type GardenSceneProps = { onMemory: (memory: Memory, position: Point3) => void; onSecret: () => void; finale: boolean; focusPoint: Point3 | null };

function BranchMesh({ branch, bark }: { branch: BranchSeg; bark: THREE.Texture }) {
  const quaternion = new THREE.Quaternion(...branch.quaternion);
  return <mesh position={branch.position} quaternion={quaternion} castShadow><cylinderGeometry args={[branch.radiusTop, branch.radiusBottom, branch.length, 12]} /><meshStandardMaterial color={BARK_COLOR} map={bark} roughness={0.96} /></mesh>;
}

function MemoryLeaf({ memory, position, onClick, index }: { memory: Memory; position: Point3; onClick: (memory: Memory, position: Point3) => void; index: number }) {
  const [hovered, setHovered] = useState(false);
  const leaf = useRef<THREE.Group>(null);
  const tilt = [-0.28, 0.22, -0.18, 0.24, 0][index];

  useFrame(({ clock }) => {
    if (leaf.current) leaf.current.rotation.z = tilt + Math.sin(clock.elapsedTime * 0.7 + index) * 0.025;
  });

  return <group ref={leaf} position={position} onClick={(event) => { event.stopPropagation(); onClick(memory, position); }} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
    <mesh position={[0, -0.38, -0.02]} rotation={[0, 0, tilt]}>
      <cylinderGeometry args={[0.018, 0.03, 0.75, 8]} />
      <meshStandardMaterial color="#8b6542" roughness={0.9} />
    </mesh>
    <mesh scale={hovered ? [0.46, 0.64, 0.18] : [0.42, 0.58, 0.16]} castShadow>
      <sphereGeometry args={[1, 24, 16]} />
      <meshStandardMaterial color={memory.fruitColor} roughness={0.42} emissive={memory.fruitColor} emissiveIntensity={hovered ? 0.6 : 0.18} />
    </mesh>
    <mesh position={[0, 0, 0.16]} scale={[0.05, 0.48, 0.02]}>
      <sphereGeometry args={[1, 12, 8]} />
      <meshBasicMaterial color="#fff1c9" transparent opacity={0.7} />
    </mesh>
    <mesh position={[0, 0.02, 0.19]} rotation={[Math.PI / 2, 0, 0]} scale={hovered ? [0.48, 0.65, 1] : [0.43, 0.59, 1]}>
      <torusGeometry args={[1, 0.025, 8, 32]} />
      <meshBasicMaterial color={memory.accent} transparent opacity={hovered ? 1 : 0.8} />
    </mesh>
    <pointLight color={memory.accent} intensity={hovered ? 2.4 : 0.6} distance={1.8} />
  </group>;
}

function LeafCanopy({ leaves }: { leaves: LeafPuff[] }) {
  const refs = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => refs.current.forEach((leaf, index) => { if (leaf) leaf.rotation.z = Math.sin(clock.elapsedTime * 0.75 + leaves[index].phase) * 0.045; }));
  return <>{leaves.map((leaf, index) => <mesh key={index} ref={(node) => { if (node) refs.current[index] = node; }} position={leaf.position} scale={leaf.scale} castShadow><dodecahedronGeometry args={[1, 1]} /><meshStandardMaterial color={leaf.color} roughness={0.9} emissive="#0c3223" emissiveIntensity={0.12} /></mesh>)}</>;
}

function Tree({ onMemory, onSecret }: { onMemory: (memory: Memory, position: Point3) => void; onSecret: () => void }) {
  const group = useRef<THREE.Group>(null);
  const bark = useBarkTexture();
  const tree = useMemo(() => buildTree(), []);
  const [hovered, setHovered] = useState(false);
  useFrame(({ clock }) => { if (group.current) { group.current.rotation.y += 0.00045; group.current.rotation.z = Math.sin(clock.elapsedTime * 0.55) * 0.008; } });
  return <group ref={group}>
    {tree.branches.map((branch, index) => <BranchMesh key={index} branch={branch} bark={bark} />)}
    <LeafCanopy leaves={tree.leaves} />
    {memories.map((memory, index) => <MemoryLeaf key={memory.id} memory={memory} index={index} position={tree.fruitAnchors[index]} onClick={onMemory} />)}
    <group position={tree.secretAnchor} onClick={(event) => { event.stopPropagation(); onSecret(); }} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh scale={hovered ? 0.14 : 0.1}><sphereGeometry args={[1, 20, 20]} /><meshStandardMaterial color="#f0a6b4" emissive="#f06a91" emissiveIntensity={2.2} /></mesh>
      <pointLight color="#ff8eae" intensity={hovered ? 1.8 : 0.8} distance={1.25} />
    </group>
  </group>;
}

function GroundLife() {
  const grass = useMemo(() => Array.from({ length: 70 }, (_, i) => ({ x: (Math.random() - 0.5) * 8, z: (Math.random() - 0.5) * 5, h: 0.16 + Math.random() * 0.34, r: Math.random() * Math.PI, phase: Math.random() * Math.PI * 2 })), []);
  const flowers = useMemo(() => Array.from({ length: 24 }, (_, i) => ({ x: (Math.random() - 0.5) * 7, z: (Math.random() - 0.5) * 4.2, c: ['#f2b0be', '#f6d78d', '#e9d4ee'][i % 3] })), []);
  const grassRefs = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => grassRefs.current.forEach((blade, index) => { if (blade) blade.rotation.z = Math.sin(clock.elapsedTime * 1.15 + grass[index].phase) * 0.08; }));
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]} receiveShadow><circleGeometry args={[5.8, 64]} /><meshStandardMaterial color="#102d2c" roughness={1} /></mesh>
    {grass.map((blade, i) => <mesh key={i} ref={(node) => { if (node) grassRefs.current[i] = node; }} position={[blade.x, blade.h / 2 - 0.2, blade.z]} rotation={[0, blade.r, 0]}><coneGeometry args={[0.035, blade.h, 5]} /><meshStandardMaterial color={i % 3 ? '#29614a' : '#3a7953'} roughness={0.95} /></mesh>)}
    {flowers.map((flower, i) => <group key={i} position={[flower.x, 0.02, flower.z]}><mesh position={[0, 0.17, 0]}><cylinderGeometry args={[0.012, 0.012, 0.34, 5]} /><meshStandardMaterial color="#54825c" /></mesh><mesh position={[0, 0.36, 0]}><sphereGeometry args={[0.1, 8, 8]} /><meshStandardMaterial color={flower.c} emissive={flower.c} emissiveIntensity={0.3} /></mesh></group>)}
  </group>;
}

function CameraFocus({ controls, focusPoint }: { controls: React.RefObject<any>; focusPoint: Point3 | null }) {
  useFrame(({ camera }) => {
    if (!focusPoint || !controls.current) return;
    const target = new THREE.Vector3(...focusPoint);
    controls.current.target.lerp(target, 0.045);
    const desired = target.clone().add(new THREE.Vector3(0.8, 0.25, 3.2));
    camera.position.lerp(desired, 0.035);
  });
  return null;
}

function GardenScene({ onMemory, onSecret, finale, focusPoint }: GardenSceneProps) {
  const controls = useRef<any>(null);
  return <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 2.3, 8.2], fov: 42 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
    <color attach="background" args={['#0b1b2b']} /><fog attach="fog" args={['#0b1b2b', 5, 15]} />
    <ambientLight intensity={0.5} color="#a4a7c5" /><directionalLight position={[-4, 7, 5]} intensity={2.5} color="#ffd29b" castShadow shadow-mapSize={[1024, 1024]} /><pointLight position={[3, 2, 2]} intensity={5} distance={8} color="#f19aa9" /><pointLight position={[-3, 1, -2]} intensity={3} distance={7} color="#dba875" />
    <Stars radius={40} depth={22} count={900} factor={1.2} saturation={0.3} fade speed={0.4} /><Sparkles count={window.innerWidth < 700 ? 34 : 70} scale={[8, 5, 6]} size={2.1} speed={0.25} color="#f7dca4" />
    <GroundLife /><Tree onMemory={onMemory} onSecret={onSecret} /><OrbitControls ref={controls} enablePan={false} minDistance={5} maxDistance={11} minPolarAngle={Math.PI / 3.1} maxPolarAngle={Math.PI / 1.9} enableDamping dampingFactor={0.06} target={[0, 2.1, 0]} /><CameraFocus controls={controls} focusPoint={focusPoint} /><Environment preset="sunset" background={false} />
    {finale && <pointLight position={[0, 3.4, 3]} color="#ffcf95" intensity={12} distance={8} />}
  </Canvas>;
}

function TypewriterMessage() {
  const [line, setLine] = useState(0);
  const [visible, setVisible] = useState('');
  useEffect(() => {
    if (line >= finalMessage.length) return;
    setVisible('');
    let index = 0;
    const timer = window.setInterval(() => { setVisible(finalMessage[line].slice(0, index + 1)); index += 1; if (index >= finalMessage[line].length) { window.clearInterval(timer); window.setTimeout(() => setLine((current) => current + 1), 500); } }, line === 0 ? 75 : 28);
    return () => window.clearInterval(timer);
  }, [line]);
  return <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="final-letter">
    {finalMessage.map((_, index) => <p key={index} className={index === 0 ? 'letter-title' : index === finalMessage.length - 1 ? 'letter-signoff' : ''}>{index < line ? finalMessage[index] : index === line ? visible : ''}</p>)}
  </motion.div>;
}

function App() {
  const [entered, setEntered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [focusPoint, setFocusPoint] = useState<Point3 | null>(null);
  const [secretOpen, setSecretOpen] = useState(false);
  const [finale, setFinale] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 1800); return () => window.clearTimeout(timer); }, []);
  const enterGarden = () => { setEntered(true); audio.current?.play().then(() => setMusicOn(true)).catch(() => setMusicOn(false)); };
  const toggleMusic = () => { if (!audio.current) return; if (musicOn) { audio.current.pause(); setMusicOn(false); } else { audio.current.play().then(() => setMusicOn(true)).catch(() => setMusicOn(false)); } };

  if (loading) return <main className="loading-screen"><div className="loader-orbit"><Heart size={27} fill="currentColor" /></div><p>Growing something special for you...</p><span>✦</span></main>;

  return <main className="app-shell">
    <audio ref={audio} src="/audio/birthday-song.mp3" loop preload="auto" />
    <AnimatePresence mode="wait">
      {!entered ? <motion.section key="intro" className="intro-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.08 }} transition={{ duration: 1.1 }}>
        <div className="intro-stars" />
        <div className="intro-copy"><motion.p className="intro-kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>Hey, my love...</motion.p><motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>I made something<br /><em>special</em> for you.</motion.h1><motion.p className="intro-birthday" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>Happy Birthday <span>♥</span></motion.p><motion.button className="garden-button" onClick={enterGarden} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.35 }}>Enter My Little Garden <span>↗</span></motion.button></div>
      </motion.section> : <motion.section key="garden" className="garden-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
        <div className="garden-canvas"><Suspense fallback={<div className="canvas-loading">Preparing the garden...</div>}><GardenScene onMemory={(memory, position) => { setSelectedMemory(memory); setFocusPoint(position); }} onSecret={() => setSecretOpen(true)} finale={finale} focusPoint={focusPoint} /></Suspense></div>
        <header className="garden-header"><div className="brand-mark">M<span>♥</span></div><div><p className="garden-title">Happy Birthday, My Love</p><p className="garden-subtitle">Rotate the tree and discover our memories.</p></div></header>
        <div className="garden-hint"><Rotate3d size={15} /><span>drag to wander</span><ChevronDown size={13} /></div>
        <button className="music-toggle" onClick={toggleMusic} aria-label={musicOn ? 'Turn music off' : 'Turn music on'}>{musicOn ? <Volume2 size={17} /> : <VolumeX size={17} />}<span>{musicOn ? 'playing softly' : 'music off'}</span><Music2 size={14} /></button>
        <motion.button className="final-button" onClick={() => setFinale(true)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}><Heart size={15} fill="currentColor" /> One Last Thing</motion.button>
        <AnimatePresence>{finale && <motion.div className="final-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="final-glow" /><TypewriterMessage /><button className="close-final" onClick={() => setFinale(false)}><X size={18} /></button></motion.div>}</AnimatePresence>
        <AnimatePresence>{(selectedMemory || secretOpen) && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setSelectedMemory(null); setFocusPoint(null); setSecretOpen(false); }}><motion.div className="memory-modal" initial={{ opacity: 0, y: 30, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.96 }} onClick={(event) => event.stopPropagation()}>{selectedMemory ? <><button className="modal-close" onClick={() => { setSelectedMemory(null); setFocusPoint(null); }}><X size={18} /></button><img src={selectedMemory.image} alt={selectedMemory.title} /><div className="modal-content"><span className="modal-number">0{selectedMemory.id} <i /> a memory</span><h2>{selectedMemory.title}</h2><p>{selectedMemory.text}</p><div className="modal-heart"><Heart size={16} fill="currentColor" /></div></div></> : <><button className="modal-close" onClick={() => setSecretOpen(false)}><X size={18} /></button><div className="secret-art"><Heart size={44} fill="currentColor" /></div><div className="modal-content secret-copy"><span className="modal-number">a little secret <i /></span><h2>You found my little secret</h2><p>No matter how many times I could choose, I'd still choose you.</p><div className="modal-heart"><Heart size={16} fill="currentColor" /></div></div></>}</motion.div></motion.div>}</AnimatePresence>
      </motion.section>}
    </AnimatePresence>
  </main>;
}

export default App;
