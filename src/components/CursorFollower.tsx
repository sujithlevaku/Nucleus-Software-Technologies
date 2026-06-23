import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function CursorFollower() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

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

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
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
    const handleMouseLeaveWindow = () => setIsVisible(false);
    const handleMouseEnterWindow = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.removeEventListener('mouseenter', handleMouseEnterWindow);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
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
  );
}
