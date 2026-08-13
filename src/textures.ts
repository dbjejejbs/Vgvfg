import { useMemo } from 'react';
import * as THREE from 'three';

export function useBarkTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 1024;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#3a2418';
    ctx.fillRect(0, 0, 256, 1024);
    for (let i = 0; i < 520; i++) {
      const x = Math.random() * 256;
      const w = 1.5 + Math.random() * 9;
      const dark = Math.random() > 0.5;
      const v = Math.floor(Math.random() * 40);
      ctx.fillStyle = dark
        ? `rgba(${20 + v},${12 + v / 2},${6},${0.12 + Math.random() * 0.2})`
        : `rgba(${90 + v},${60 + v / 2},${30},${0.06 + Math.random() * 0.12})`;
      ctx.fillRect(x, 0, w, 1024);
    }
    for (let i = 0; i < 2600; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 1024;
      const r = 1 + Math.random() * 3;
      const dark = Math.random() > 0.5;
      ctx.fillStyle = dark ? `rgba(20,12,6,${Math.random() * 0.3})` : `rgba(120,80,40,${Math.random() * 0.18})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 256;
      ctx.strokeStyle = `rgba(15,8,4,${0.2 + Math.random() * 0.25})`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + (Math.random() - 0.5) * 30, 300, x + (Math.random() - 0.5) * 30, 700, x + (Math.random() - 0.5) * 20, 1024);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 6);
    return tex;
  }, []);
}

export function useLeafTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
    grad.addColorStop(0, 'rgba(60,140,80,0.95)');
    grad.addColorStop(0.7, 'rgba(30,90,55,0.5)');
    grad.addColorStop(1, 'rgba(20,60,40,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `rgba(20,50,30,${Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(64 + (Math.random() - 0.5) * 50, 64 + (Math.random() - 0.5) * 50, 8 + Math.random() * 12, 4 + Math.random() * 6, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    return tex;
  }, []);
}
