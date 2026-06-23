import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export default function NeuralParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;

    // Responsive Canvas Sizing with ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      
      // Update canvas viewport dimensions
      width = newWidth;
      height = newHeight;
      canvas.width = newWidth * window.devicePixelRatio;
      canvas.height = newHeight * window.devicePixelRatio;
      canvas.style.width = `${newWidth}px`;
      canvas.style.height = `${newHeight}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Re-initialize particles based on density
      const densityMultiplier = 0.00004; // Adjust density
      const numParticles = Math.min(80, Math.max(25, Math.floor(width * height * densityMultiplier)));
      
      particles = Array.from({ length: numParticles }, () => {
        const isCyan = Math.random() > 0.4;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 2 + 1,
          color: isCyan ? 'rgba(6, 182, 212, 0.45)' : 'rgba(109, 40, 217, 0.4)'
        };
      });
    });

    resizeObserver.observe(container);

    // Track mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Boundary wrapping
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      const maxDistance = 105;
      const mouseMaxDistance = 145;

      // Draw neural linkages between neighboring nodes
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Link with other close nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            // Use subtle gradient or cyan linkage
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        // Link with mouse cursor
        if (mouseRef.current.x !== -1000) {
          const mdx = p1.x - mouseRef.current.x;
          const mdy = p1.y - mouseRef.current.y;
          const mdist = Math.hypot(mdx, mdy);

          if (mdist < mouseMaxDistance) {
            const mAlpha = (1 - mdist / mouseMaxDistance) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            // Use pink gradient connections for cursor
            ctx.strokeStyle = `rgba(236, 72, 153, ${mAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
      id="neural-particle-wrapper"
    >
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full opacity-[0.8]" 
        id="neural-particles-canvas"
      />
    </div>
  );
}
