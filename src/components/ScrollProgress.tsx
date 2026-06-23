import React from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  
  // Smooth spring for high-quality, physics-based transition
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-[#06B6D4] origin-left z-50 shadow-[0_0_10px_#06B6D4,0_0_20px_rgba(6,182,212,0.6)] pointer-events-none"
      id="scroll-depth-indicator"
    />
  );
}
