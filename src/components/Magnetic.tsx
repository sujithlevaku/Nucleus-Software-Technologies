import React, { useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

interface MagneticProps {
  children: React.ReactNode;
  range?: number;      // Proximity distance in pixels to trigger magnetism
  strength?: number;   // Strength multiplier of the pull effect (0 to 1)
  className?: string;  // Custom styling classes for the container wrapper
}

export default function Magnetic({
  children,
  range = 90,
  strength = 0.35,
  className = '',
}: MagneticProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Core motion values for translation offset
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Responsive spring physics configuration for organic lag and snapback
  const springConfig = { damping: 15, stiffness: 140, mass: 0.15 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    
    // Find absolute center point of target element
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate displacement vectors
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist < range) {
      setIsHovered(true);
      // Pull toward cursor by proportional offset
      x.set(dx * strength);
      y.set(dy * strength);
    } else {
      setIsHovered(false);
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        y: springY,
      }}
      className={`inline-block ${className}`}
      animate={{
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{
        scale: { type: 'spring', damping: 20, stiffness: 200 },
      }}
    >
      {children}
    </motion.div>
  );
}
