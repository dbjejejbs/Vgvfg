import * as THREE from 'three';

export type BranchSeg = {
  position: [number, number, number];
  quaternion: [number, number, number, number];
  length: number;
  radiusTop: number;
  radiusBottom: number;
};

export type LeafPuff = {
  position: [number, number, number];
  scale: number;
  color: string;
  phase: number;
};

export type TreeData = {
  branches: BranchSeg[];
  leaves: LeafPuff[];
  fruitAnchors: [number, number, number][];
  secretAnchor: [number, number, number];
};

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LEAF_COLORS = ['#1b5e3a', '#236b45', '#2d7a52', '#174830', '#1f6347', '#28704a'];
const BARK_COLOR = '#4a2c1c';

const UP = new THREE.Vector3(0, 1, 0);

export function buildTree(seed = 11): TreeData {
  const rand = mulberry32(seed);
  const branches: BranchSeg[] = [];
  const leaves: LeafPuff[] = [];
  const fruitAnchors: [number, number, number][] = [];
  const up = UP;

  function addSegment(start: THREE.Vector3, dir: THREE.Vector3, len: number, r1: number, r2: number) {
    const end = start.clone().add(dir.clone().multiplyScalar(len));
    const mid = start.clone().lerp(end, 0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
    branches.push({
      position: [mid.x, mid.y, mid.z],
      quaternion: [quat.x, quat.y, quat.z, quat.w],
      length: len,
      radiusTop: r2,
      radiusBottom: r1,
    });
    return end;
  }

  function makeBranch(start: THREE.Vector3, dir: THREE.Vector3, len: number, thick: number, depth: number) {
    const segCount = depth <= 1 ? 3 : 2;
    const segLen = len / segCount;
    let pos = start.clone();
    let curDir = dir.clone();

    for (let s = 0; s < segCount; s++) {
      curDir.x += (rand() - 0.5) * 0.1;
      curDir.z += (rand() - 0.5) * 0.1;
      curDir.normalize();
      const r1 = thick * (1 - (s / segCount) * 0.22);
      const r2 = thick * (1 - ((s + 1) / segCount) * 0.22);
      pos = addSegment(pos, curDir, segLen, r1, r2);
    }

    if (depth < 3) {
      const numChildren = depth === 0 ? 3 : depth === 1 ? 2 + Math.floor(rand() * 2) : 2;
      for (let i = 0; i < numChildren; i++) {
        const newDir = curDir.clone();
        const spread = 0.38 + depth * 0.1;
        const angle = (i / Math.max(numChildren - 1, 1) - 0.5) * spread * 2 + (rand() - 0.5) * 0.3;
        const perp = new THREE.Vector3().crossVectors(newDir, up).normalize();
        if (perp.length() < 0.01) perp.set(1, 0, 0);
        newDir.applyAxisAngle(perp, angle);
        const tiltAxis = new THREE.Vector3().crossVectors(newDir, perp).normalize();
        newDir.applyAxisAngle(tiltAxis, (rand() - 0.5) * 0.35);
        newDir.normalize();
        makeBranch(pos, newDir, len * (0.62 + rand() * 0.1), thick * (0.58 + rand() * 0.08), depth + 1);
      }
    } else {
      const numPuffs = 3 + Math.floor(rand() * 2);
      for (let i = 0; i < numPuffs; i++) {
        const offset = new THREE.Vector3(
          (rand() - 0.5) * 0.85,
          (rand() - 0.5) * 0.85,
          (rand() - 0.5) * 0.85,
        );
        leaves.push({
          position: [pos.x + offset.x, pos.y + offset.y, pos.z + offset.z],
          scale: 0.38 + rand() * 0.3,
          color: LEAF_COLORS[Math.floor(rand() * LEAF_COLORS.length)],
          phase: rand() * Math.PI * 2,
        });
      }
      if (fruitAnchors.length < 5 && rand() > 0.3) {
        fruitAnchors.push([pos.x, pos.y - 0.22, pos.z]);
      }
    }
  }

  // Root flares
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + rand() * 0.3;
    const rootDir = new THREE.Vector3(Math.cos(angle) * 0.6, -0.25, Math.sin(angle) * 0.6).normalize();
    const rootLen = 0.45 + rand() * 0.25;
    let pos = new THREE.Vector3(Math.cos(angle) * 0.15, 0.05, Math.sin(angle) * 0.15);
    let curDir = rootDir.clone();
    for (let s = 0; s < 2; s++) {
      curDir.y -= 0.15;
      curDir.normalize();
      const r1 = 0.16 * (1 - s * 0.35);
      const r2 = 0.08 * (1 - s * 0.4);
      pos = addSegment(pos, curDir, rootLen / 2, r1, r2);
    }
  }

  makeBranch(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 1.5, 0.34, 0);

  while (fruitAnchors.length < 5 && leaves.length > 0) {
    const leaf = leaves[Math.floor(rand() * leaves.length)];
    fruitAnchors.push([leaf.position[0], leaf.position[1] - 0.2, leaf.position[2]]);
  }

  const secretIdx = Math.floor(rand() * leaves.length);
  const secretAnchor: [number, number, number] = leaves.length > 0
    ? [leaves[secretIdx].position[0] * 0.6, leaves[secretIdx].position[1] - 0.15, leaves[secretIdx].position[2] * 0.6]
    : [0.3, 2.8, 0.2];

  const visibleFruitAnchors: [number, number, number][] = [
    [-1.22, 2.56, 0.62],
    [1.22, 2.82, 0.68],
    [-1.48, 3.35, 0.58],
    [1.48, 3.55, 0.62],
    [0.04, 4.14, 0.56],
  ];

  return { branches, leaves, fruitAnchors: visibleFruitAnchors, secretAnchor };
}

export { BARK_COLOR };
