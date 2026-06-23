import React from 'react';
import { motion } from 'motion/react';

interface BrandLogo {
  name: string;
  color: string;
  glowColor: string;
  svg: React.ReactNode;
}

export default function GlobalNetwork() {
  const brands: BrandLogo[] = [
    {
      name: 'Freshworks',
      color: 'text-emerald-400 group-hover:text-emerald-400',
      glowColor: 'shadow-emerald-500/50',
      svg: (
        <svg className="w-24 h-8 transition-all duration-300" viewBox="0 0 120 32" fill="currentColor">
          <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <path d="M12 16a4 4 0 0 1 8 0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M16 10v12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <text x="34" y="21" fontFamily='"Inter", sans-serif' fontWeight="700" fontSize="13" letterSpacing="0.5">freshworks</text>
        </svg>
      )
    },
    {
      name: 'Disney',
      color: 'text-indigo-400 group-hover:text-indigo-400',
      glowColor: 'shadow-indigo-500/50',
      svg: (
        <svg className="w-24 h-8 transition-all duration-300" viewBox="0 0 120 32" fill="currentColor">
          <text x="10" y="22" fontFamily='"Playfair Display", "Georgia", serif' fontWeight="900" fontSize="20" fontStyle="italic" letterSpacing="-1">DISNEY</text>
          <path d="M6 10 C 25 2, 45 32, 90 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    },
    {
      name: 'IBM',
      color: 'text-blue-500 group-hover:text-blue-400',
      glowColor: 'shadow-blue-500/50',
      svg: (
        <svg className="w-24 h-8 transition-all duration-300" viewBox="0 0 120 32" fill="currentColor">
          <g fill="currentColor">
            {/* Minimal stripes representation of IBM */}
            <rect x="10" y="6" width="70" height="2" />
            <rect x="10" y="9" width="70" height="2" />
            <rect x="10" y="12" width="70" height="2" />
            <rect x="10" y="15" width="70" height="2" />
            <rect x="10" y="18" width="70" height="2" />
            <rect x="10" y="21" width="70" height="2" />
            <rect x="10" y="24" width="70" height="2" />
          </g>
          <text x="85" y="22" fontFamily='"Space Grotesk", sans-serif' fontWeight="800" fontSize="16" letterSpacing="1">IBM</text>
        </svg>
      )
    },
    {
      name: 'Verizon',
      color: 'text-red-500 group-hover:text-red-500',
      glowColor: 'shadow-red-500/50',
      svg: (
        <svg className="w-24 h-8 transition-all duration-300" viewBox="0 0 120 32" fill="currentColor">
          <text x="10" y="21" fontFamily='"Inter", sans-serif' fontWeight="800" fontSize="15" letterSpacing="-0.5">verizon</text>
          {/* Verizon red check mark */}
          <path d="M78 8 L83 14 L95 4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      name: 'Knoll',
      color: 'text-orange-500 group-hover:text-orange-500',
      glowColor: 'shadow-orange-500/50',
      svg: (
        <svg className="w-24 h-8 transition-all duration-300" viewBox="0 0 120 32" fill="currentColor">
          <text x="15" y="23" fontFamily='"Inter", sans-serif' fontWeight="900" fontSize="19" letterSpacing="-0.5">Knoll</text>
          <circle cx="85" cy="18" r="4" fill="currentColor" />
        </svg>
      )
    },
    {
      name: 'Swiggy',
      color: 'text-amber-500 group-hover:text-amber-500',
      glowColor: 'shadow-amber-500/50',
      svg: (
        <svg className="w-24 h-8 transition-all duration-300" viewBox="0 0 120 32" fill="currentColor">
          <path d="M12 24c0-5 3-9 7-11 1-1 3-3 2-5-1-2-4-2-6 0-3 3-5 7-5 11 0 3 1 4 3 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M22 8c0 5-3 9-7 11-1 1-3 3-2 5 1 2 4 2 6 0 3-3 5-7 5-11 0-3-1-4-3-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <text x="36" y="21" fontFamily='"Inter", sans-serif' fontWeight="800" fontSize="13" letterSpacing="0.2">SWIGGY</text>
        </svg>
      )
    }
  ];

  return (
    <div className="relative py-12 md:py-16 w-full" id="trusted-by-section">
      {/* Decorative backdrop glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[80%] h-8 bg-gradient-to-r from-pink-500/5 via-purple-500/10 to-cyan/5 blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-md rounded-3xl p-8 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 relative overflow-hidden" id="trusted-by-card">
          {/* Sci fi tech decoration in the corner */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20" />
          
          <div className="flex flex-col gap-1.5 text-center md:text-left shrink-0" id="trusted-title-container">
            <span className="text-[10px] font-mono tracking-[0.2em] text-slate-500 uppercase font-bold">Global Network Nodes</span>
            <h3 className="font-sans text-xs text-slate-400 font-light">Powering enterprise mission systems</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-4 w-full md:w-auto items-center justify-items-center" id="logos-grid">
            {brands.map((brand, i) => (
              <motion.div
                key={brand.name}
                className="group relative flex items-center justify-center p-3 rounded-lg hover:bg-slate-900/30 border border-transparent hover:border-slate-800/50 transition-all duration-300 cursor-pointer"
                whileHover={{ y: -3, scale: 1.05 }}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                id={`brand-${brand.name.toLowerCase()}`}
              >
                {/* Neon brand glow underlying the logo */}
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-cyan/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm pointer-events-none`} />
                
                <span className="text-slate-600 group-hover:text-white transition-colors duration-300">
                  <div className={`transition-all duration-300 ${brand.color}`}>
                    {brand.svg}
                  </div>
                </span>
                
                {/* Tech micro line on hover */}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 group-hover:w-8" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
