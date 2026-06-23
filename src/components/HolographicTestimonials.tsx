import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Quote, Sparkles, MessageSquareCode } from 'lucide-react';
import { Testimonial } from '../types';

export default function HolographicTestimonials() {
  const testimonials: Testimonial[] = [
    {
      id: 't-001',
      author: 'Scott DeSimone',
      role: 'CEO & Founder',
      company: 'Really Great Reading',
      quote: 'Among the best engineering partners I’ve worked with in over 20 years of building high-performance technologies. Nucleus delivers flawless quality under tight schedules.',
      avatarUrl: 'SD'
    },
    {
      id: 't-002',
      author: 'Girish Mathrubootham',
      role: 'Founder & CEO',
      company: 'Freshworks',
      quote: 'A diverse run of software integration projects, every single one of them an absolute success. Their attention to platform scalability and performance metrics is spectacular.',
      avatarUrl: 'GM'
    },
    {
      id: 't-003',
      author: 'Tim Adams',
      role: 'President',
      company: 'Time Customer Service',
      quote: 'Fifteen-plus years in, and the Nucleus team maintains the exact same enthusiasm, engineering discipline, and customer-first integrity as they did on day one of our collaboration.',
      avatarUrl: 'TA'
    }
  ];

  return (
    <section className="py-24 bg-transparent relative overflow-hidden border-t border-white/10" id="testimonials-section">
      {/* Immersive background spotlights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16" id="testimonials-header">
          <span className="text-[10px] font-mono tracking-[0.2em] text-slate-500 uppercase font-bold">Client Validation</span>
          <h2 className="text-3xl md:text-5xl font-sans text-white mt-3 mb-4 font-black tracking-tighter uppercase leading-[1.05]">Testimonials</h2>
          <p className="text-slate-400 max-w-xl text-base font-light leading-relaxed">
            Direct transmissions from global executives and visionaries who run core operations on Nucleus custom software.
          </p>
        </div>

        {/* Testimonial Cards Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="testimonials-grid">
          {testimonials.map((test, index) => (
            <TiltCard key={test.id} testimonial={test} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

// 3D Tilt Card Component for the holographic feel
function TiltCard({ testimonial, index }: { testimonial: Testimonial; index: number; key?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ rotateX: 0, rotateY: 0, shineX: 50, shineY: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Mouse coords relative to card
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize from -1 to 1
    const normalizedX = (x / width) - 0.5;
    const normalizedY = (y / height) - 0.5;

    // Calculate rotation angles (max 12 degrees)
    const rotateX = -normalizedY * 16;
    const rotateY = normalizedX * 16;

    // Calculate shine position (0 to 100)
    const shineX = (x / width) * 100;
    const shineY = (y / height) * 100;

    setCoords({ rotateX, rotateY, shineX, shineY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Smooth reset
    setCoords({ rotateX: 0, rotateY: 0, shineX: 50, shineY: 50 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${coords.rotateX}deg) rotateY(${coords.rotateY}deg) scale3d(${isHovered ? '1.02, 1.02, 1.02' : '1, 1, 1'})`,
        transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
      }}
      className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 flex flex-col justify-between h-[360px] cursor-pointer shadow-2xl group overflow-hidden backdrop-blur-md bg-dot-pattern"
      id={`testimonial-card-${testimonial.id}`}
    >
      {/* Holographic Iridescent Shine Overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${coords.shineX}% ${coords.shineY}%, rgba(6, 182, 212, 0.15) 0%, rgba(236, 72, 153, 0.1) 40%, transparent 70%)`
        }}
        id={`shine-overlay-${testimonial.id}`}
      />

      {/* Cybernetic Tech lines overlay */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/10 group-hover:border-[#EC4899] transition-colors" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/10 group-hover:border-[#06B6D4] transition-colors" />

      {/* Card Header Quote Icon */}
      <div className="flex items-center justify-between mb-6" style={{ transform: 'translateZ(20px)' }} id={`hdr-${testimonial.id}`}>
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#06B6D4] group-hover:border-[#06B6D4]/50 transition-colors">
          <Quote className="w-5 h-5 text-[#06B6D4] animate-pulse" />
        </div>
        <div className="flex items-center gap-1 font-mono text-[8px] text-slate-500 group-hover:text-pink-500 transition-colors">
          <Sparkles className="w-3 h-3 text-pink-500" />
          <span>HOLOGRAPHIC_COM_FEED</span>
        </div>
      </div>

      {/* Quote text */}
      <div className="flex-1" style={{ transform: 'translateZ(30px)' }} id={`body-${testimonial.id}`}>
        <p className="text-slate-300 font-sans text-sm md:text-base leading-relaxed font-light italic">
          "{testimonial.quote}"
        </p>
      </div>

      {/* Author Profile Footer */}
      <div className="border-t border-white/10 pt-6 mt-6 flex items-center gap-4" style={{ transform: 'translateZ(40px)' }} id={`ftr-${testimonial.id}`}>
        {/* Holographic Avatar */}
        <div className="relative w-12 h-12 rounded-full bg-white/5 border border-white/10 group-hover:border-[#06B6D4] flex items-center justify-center text-white font-mono text-sm font-bold shadow-inner overflow-hidden select-none">
          {/* Neon scanlines on avatar */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#06B6D4]/20 to-transparent animate-pulse" />
          <span className="relative z-10 text-[#06B6D4]">{testimonial.avatarUrl}</span>
        </div>

        <div>
          <h4 className="font-sans font-extrabold text-white text-sm tracking-wide uppercase">
            {testimonial.author}
          </h4>
          <p className="text-xs text-slate-400 font-mono">
            {testimonial.role}, <span className="text-[#6D28D9] font-bold">{testimonial.company}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
