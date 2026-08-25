'use client';
import { useEffect, useRef } from 'react';

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  alpha: number;
  phase: number;
  speed: number;
}

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const blobsRef = useRef<Blob[]>([]);

  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: NodeJS.Timeout | undefined;
    let ro: ResizeObserver | undefined;
    let onVisibility: (() => void) | undefined;

    const startCanvasAnimation = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      // Paused when tab is hidden — saves GPU when not visible
      let paused = false;
      onVisibility = () => { paused = document.hidden; };
      document.addEventListener('visibilitychange', onVisibility);

      // Downscaled canvas — renders at low resolution, CSS scales up
      const SCALE = 0.35;
      const resize = () => {
        canvas.width = Math.floor(window.innerWidth * SCALE);
        canvas.height = Math.floor(window.innerHeight * SCALE);
      };
      resize();

      ro = new ResizeObserver(resize);
      ro.observe(document.documentElement);

      const palette = [
        { h: 210, s: 90, l: 18 },  // deep blue
        { h: 220, s: 80, l: 22 },  // navy
        { h: 195, s: 100, l: 28 }, // electric teal/cyan
        { h: 240, s: 70, l: 20 },  // indigo
        { h: 205, s: 95, l: 24 },  // azure
      ];

      blobsRef.current = Array.from({ length: 5 }, (_, i) => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        radius: canvas.width * (0.38 + Math.random() * 0.32),
        hue: palette[i].h,
        alpha: 0.55 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
        speed: 0.006 + Math.random() * 0.006,
      }));

      const W = () => canvas.width;
      const H = () => canvas.height;

      const draw = () => {
        if (paused) {
          rafRef.current = requestAnimationFrame(draw);
          return;
        }

        ctx.fillStyle = '#05060f';
        ctx.fillRect(0, 0, W(), H());

        for (const b of blobsRef.current) {
          b.phase += b.speed;
          b.x += b.vx + Math.sin(b.phase * 0.7) * 0.12;
          b.y += b.vy + Math.cos(b.phase * 0.5) * 0.10;

          if (b.x < -b.radius) b.x = W() + b.radius;
          if (b.x > W() + b.radius) b.x = -b.radius;
          if (b.y < -b.radius) b.y = H() + b.radius;
          if (b.y > H() + b.radius) b.y = -b.radius;

          const r = b.radius * (0.88 + 0.12 * Math.sin(b.phase * 1.3));
          const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
          grad.addColorStop(0, `hsla(${b.hue}, 90%, 32%, ${b.alpha})`);
          grad.addColorStop(0.45, `hsla(${b.hue + 12}, 80%, 20%, ${b.alpha * 0.55})`);
          grad.addColorStop(1, `hsla(${b.hue}, 70%, 10%, 0)`);

          ctx.globalCompositeOperation = 'screen';
          ctx.beginPath();
          ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        ctx.globalCompositeOperation = 'source-over';
        const vign = ctx.createRadialGradient(W() / 2, H() / 2, W() * 0.2, W() / 2, H() / 2, W() * 0.85);
        vign.addColorStop(0, 'rgba(0,0,0,0)');
        vign.addColorStop(1, 'rgba(2,3,10,0.72)');
        ctx.fillStyle = vign;
        ctx.fillRect(0, 0, W(), H());

        rafRef.current = requestAnimationFrame(draw);
      };

      rafRef.current = requestAnimationFrame(draw);
    };

    // Defer background animation start until after initial shell render
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = (window as any).requestIdleCallback(startCanvasAnimation, { timeout: 500 });
    } else {
      timeoutId = setTimeout(startCanvasAnimation, 50);
    }

    return () => {
      if (idleId && 'cancelIdleCallback' in window) (window as any).cancelIdleCallback(idleId);
      if (timeoutId) clearTimeout(timeoutId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (ro) ro.disconnect();
      if (onVisibility) document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: -2,
        pointerEvents: 'none',
        transform: 'translate3d(0,0,0)',
        backfaceVisibility: 'hidden',
        willChange: 'transform',
        objectFit: 'cover',
        filter: 'blur(12px)',
      }}
    />
  );
}
