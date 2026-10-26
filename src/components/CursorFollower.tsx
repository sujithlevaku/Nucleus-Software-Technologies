import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  glowColor: string;
  birth: number;
  life: number;
}

export default function CursorFollower() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const isHoveredRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Keep isHoveredRef in sync with state
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  // Core motion values for mouse coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Springs for smooth physics-based lag
  const springConfig = { damping: 25, stiffness: 200, mass: 0.6 };
  const ringX = useSpring(mouseX, springConfig);
  const ringY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Disable on mobile/tablet devices
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI canvas resolution
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle emitter helper
    const spawnParticles = (x: number, y: number) => {
      if (prefersReducedMotion) return;

      const now = performance.now();
      const isTargetHovered = isHoveredRef.current;
      
      // Determine color themes (cyan by default, pink/magenta on hover)
      const primaryColor = isTargetHovered ? '236, 72, 153' : '6, 182, 212';
      const glowColor = isTargetHovered ? 'rgba(236, 72, 153, 0.6)' : 'rgba(6, 182, 212, 0.5)';

      // Emit 1-2 faint digital data motes
      const count = Math.random() > 0.4 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        // Slight random offset around mouse tip
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 4;
        const px = x + Math.cos(angle) * dist;
        const py = y + Math.sin(angle) * dist;

        // Subtle gentle drift
        const speed = 0.2 + Math.random() * 0.35;
        const driftAngle = Math.random() * Math.PI * 2;
        const vx = Math.cos(driftAngle) * speed;
        const vy = Math.sin(driftAngle) * speed - 0.15; // faint upward buoyant drift

        // 400ms to 550ms dissipation lifetime
        const life = 420 + Math.random() * 140;
        const size = 1.2 + Math.random() * 1.6;

        particlesRef.current.push({
          x: px,
          y: py,
          vx,
          vy,
          size,
          color: primaryColor,
          glowColor,
          birth: now,
          life,
        });
      }

      // Cap maximum active particles to prevent runaway count on rapid gestures
      if (particlesRef.current.length > 70) {
        particlesRef.current.splice(0, particlesRef.current.length - 70);
      }
    };

    // Render loop for particle trail
    const renderLoop = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const particles = particlesRef.current;
      const survivingParticles: Particle[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const age = now - p.birth;

        if (age < p.life) {
          const progress = age / p.life;
          // Smooth evanescent dissipation curve
          const alpha = (1 - progress) * 0.65;
          const currentSize = Math.max(0.4, p.size * (1 - progress * 0.25));

          // Draw digital particle
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
          ctx.shadowColor = p.glowColor;
          ctx.shadowBlur = 6 * (1 - progress);
          ctx.fill();
          ctx.restore();

          // Advance physics
          p.x += p.vx;
          p.y += p.vy;

          survivingParticles.push(p);
        }
      }

      particlesRef.current = survivingParticles;
      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const last = lastPosRef.current;
      if (!last) {
        lastPosRef.current = { x: e.clientX, y: e.clientY };
        spawnParticles(e.clientX, e.clientY);
        return;
      }

      // Calculate travel distance
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      const dist = Math.hypot(dx, dy);

      // Only spawn when mouse has moved enough to prevent pile-up
      if (dist >= 6) {
        // Interpolate points along the path for ultra-smooth trails during quick swipes
        const steps = Math.min(Math.floor(dist / 10), 3);
        if (steps > 1) {
          for (let step = 1; step <= steps; step++) {
            const ix = last.x + (dx * step) / steps;
            const iy = last.y + (dy * step) / steps;
            spawnParticles(ix, iy);
          }
        } else {
          spawnParticles(e.clientX, e.clientY);
        }
        lastPosRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Traverses ancestors to find interactive elements
      const isInteractive = !!target.closest(
        'button, a, input, select, textarea, [role="button"], .cursor-pointer, [id^="btn-"], [id^="stat-box-"], [id^="dossier-card-"], [id^="testimonial-card-"]'
      );
      setIsHovered(isInteractive);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeaveWindow = () => {
      setIsVisible(false);
      lastPosRef.current = null;
    };
    const handleMouseEnterWindow = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.removeEventListener('mouseenter', handleMouseEnterWindow);
    };
  }, [mouseX, mouseY, isVisible]);

  return (
    <>
      {/* 0. Canvas Overlay for Lingering Digital Particle Trail */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9998] mix-blend-screen w-full h-full"
        aria-hidden="true"
      />

      {isVisible && (
        <>
          {/* 1. Elegant Lagging Outer Glowing Ring */}
          <motion.div
            style={{
              x: ringX,
              y: ringY,
              translateX: '-50%',
              translateY: '-50%',
            }}
            animate={{
              scale: isClicked ? 0.85 : isHovered ? 1.7 : 1,
              borderColor: isHovered ? '#EC4899' : '#06B6D4',
              backgroundColor: isHovered ? 'rgba(236, 72, 153, 0.08)' : 'rgba(6, 182, 212, 0.03)',
              boxShadow: isHovered 
                ? '0 0 25px rgba(236, 72, 153, 0.45), inset 0 0 10px rgba(236, 72, 153, 0.25)' 
                : '0 0 12px rgba(6, 182, 212, 0.15)',
            }}
            transition={{
              scale: { type: 'spring', damping: 20, stiffness: 250 },
              borderColor: { duration: 0.15 },
              backgroundColor: { duration: 0.15 },
              boxShadow: { duration: 0.15 },
            }}
            className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[#06B6D4]/50 pointer-events-none z-[9999] mix-blend-screen"
          >
            {/* Subtle decorative crosshair notches inside the ring */}
            <motion.div 
              animate={{ rotate: isHovered ? 180 : 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full flex items-center justify-center opacity-60"
            >
              {/* Top Notch */}
              <div className="absolute top-0 w-[1px] h-1.5 bg-[#06B6D4]" style={{ backgroundColor: isHovered ? '#EC4899' : '#06B6D4' }} />
              {/* Bottom Notch */}
              <div className="absolute bottom-0 w-[1px] h-1.5 bg-[#06B6D4]" style={{ backgroundColor: isHovered ? '#EC4899' : '#06B6D4' }} />
              {/* Left Notch */}
              <div className="absolute left-0 h-[1px] w-1.5 bg-[#06B6D4]" style={{ backgroundColor: isHovered ? '#EC4899' : '#06B6D4' }} />
              {/* Right Notch */}
              <div className="absolute right-0 h-[1px] w-1.5 bg-[#06B6D4]" style={{ backgroundColor: isHovered ? '#EC4899' : '#06B6D4' }} />
            </motion.div>
          </motion.div>

          {/* 2. Responsive Laser Core (follows mouse slightly faster) */}
          <motion.div
            style={{
              x: ringX,
              y: ringY,
              translateX: '-50%',
              translateY: '-50%',
            }}
            animate={{
              scale: isClicked ? 0.6 : isHovered ? 1.4 : 1,
              backgroundColor: isHovered ? '#EC4899' : '#06B6D4',
              boxShadow: isHovered 
                ? '0 0 15px rgba(236, 72, 153, 0.9)' 
                : '0 0 10px rgba(6, 182, 212, 0.7)',
            }}
            transition={{
              scale: { type: 'spring', damping: 15, stiffness: 300 },
              backgroundColor: { duration: 0.15 },
            }}
            className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full pointer-events-none z-[9999] mix-blend-screen"
          />
        </>
      )}
    </>
  );
}
