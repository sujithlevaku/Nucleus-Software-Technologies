import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Lenis from 'lenis';
import { 
  Terminal, ShieldCheck, Zap, Globe, Cpu, ChevronRight, 
  Volume2, VolumeX, Menu, X, ArrowUpRight 
} from 'lucide-react';

// Custom components
import NeuralCore from './components/NeuralCore';
import GlobalNetwork from './components/GlobalNetwork';
import TechGalaxy from './components/TechGalaxy';
import MissionDossiers from './components/MissionDossiers';
import CommandDashboard from './components/CommandDashboard';
import HolographicTestimonials from './components/HolographicTestimonials';
import InitiateProject from './components/InitiateProject';
import CursorFollower from './components/CursorFollower';
import ScrollProgress from './components/ScrollProgress';
import NeuralParticles from './components/NeuralParticles';
import Magnetic from './components/Magnetic';

// Simple sound synthesizer using native AudioContext
const playSound = (type: 'hover' | 'click' | 'success', isMuted: boolean) => {
  if (isMuted || typeof window === 'undefined') return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'hover') {
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.012, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === 'click') {
      osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.025, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'success') {
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      
      osc.frequency.setValueAtTime(520, audioCtx.currentTime);
      osc.frequency.setValueAtTime(784, audioCtx.currentTime + 0.08);
      osc2.frequency.setValueAtTime(1046, audioCtx.currentTime);
      osc2.frequency.setValueAtTime(1568, audioCtx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
      gain2.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
      
      osc.start();
      osc2.start();
      osc.stop(audioCtx.currentTime + 0.3);
      osc2.stop(audioCtx.currentTime + 0.3);
    }
  } catch (e) {
    // blocked or not supported
  }
};

// Animated Stats Counter Component
function AnimatedCounter({ value, duration = 1.2 }: { value: string; duration?: number }) {
  const numberPart = parseInt(value.replace(/\D/g, ''));
  const suffix = value.replace(/\d/g, '');
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = numberPart;
    if (start === end) return;

    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 20);
    
    const timer = setInterval(() => {
      start += Math.ceil(end / 30);
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [numberPart, duration]);

  return <span>{count}{suffix}</span>;
}

export default function App() {
  const [isMuted, setIsMuted] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('HOME');

  // Initialize Lenis Smooth Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const handleNavClick = (sectionId: string, tabName: string) => {
    playSound('click', isMuted);
    setActiveTab(tabName);
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { name: 'HOME', id: 'neural-core-hero' },
    { name: 'SERVICES', id: 'services-galaxy-section' },
    { name: 'MISSIONS', id: 'mission-dossiers-section' },
    { name: 'VITALS', id: 'command-dashboard-section' },
    { name: 'HOLO_FEED', id: 'testimonials-section' },
    { name: 'CONNECT', id: 'contact-footer' }
  ];

  const stats = [
    { id: 'stat-years', value: '15+', label: 'Years in Business' },
    { id: 'stat-clients', value: '200+', label: 'Clients Served' },
    { id: 'stat-projects', value: '500+', label: 'Projects Delivered' },
    { id: 'stat-tech', value: '50+', label: 'Technologies Integrated' }
  ];

  return (
    <div className="bg-[#020617] text-slate-200 min-h-screen relative font-sans overflow-x-hidden antialiased">
      {/* Scroll depth indicator progress bar */}
      <ScrollProgress />

      {/* Background Ambient Glows from Bento Grid Design */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#6D28D9]/15 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#06B6D4]/10 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[35%] right-[-5%] w-[35%] h-[35%] bg-[#EC4899]/5 rounded-full blur-[120px] pointer-events-none z-0" />
      
      {/* Interactive Neural Particle Canvas Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <NeuralParticles />
      </div>
      
      {/* Global scanline crt overlay */}
      <div className="scanlines" />

      {/* Futuristic Floating Header */}
      <header className="fixed top-0 inset-x-0 z-40 px-6 pt-6 pointer-events-none" id="command-header">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 backdrop-blur-md shadow-2xl pointer-events-auto relative overflow-hidden animate-fade-in" id="navigation-hud">
          {/* Neon framing visual indicators */}
          <div className="absolute top-0 left-0 w-12 h-[1px] bg-cyan/40" />
          <div className="absolute top-0 right-0 w-12 h-[1px] bg-pink-500/40" />

          {/* Logo brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => handleNavClick('neural-core-hero', 'HOME')}
            onMouseEnter={() => playSound('hover', isMuted)}
            id="brand-logo"
          >
            <div className="h-9 px-2 py-1 bg-white rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.35)] border border-cyan/30">
              <img 
                src="/assets/aistudio/unnamed_9c5495db.jpg" 
                alt="Nucleus Soft Tech Logo" 
                className="h-6 w-auto object-contain" 
              />
            </div>
            <div className="flex flex-col">
              <div className="text-xs tracking-[0.2em] font-black uppercase text-white">Nucleus <span className="font-light opacity-60 text-cyan text-[10px]">Soft Tech</span></div>
              <div className="flex items-center gap-1.5 font-mono text-[7px] tracking-widest text-[#06B6D4] uppercase font-bold">
                <div className="w-1 h-1 rounded-full bg-[#06B6D4] animate-pulse"></div> UPLINK: STABLE
              </div>
            </div>
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/40 p-1 border border-slate-900 rounded-xl" id="nav-desktop">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.id, item.name)}
                onMouseEnter={() => playSound('hover', isMuted)}
                className={`font-mono text-[9px] font-bold tracking-widest px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === item.name
                    ? 'text-white bg-slate-800 border-b-2 border-cyan shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                id={`nav-item-${item.name.toLowerCase()}`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Auxiliary system indicators (Mute audio, Status LEDs) */}
          <div className="flex items-center gap-4" id="header-utilities">
            <button
              onClick={() => {
                setIsMuted(prev => !prev);
                if (isMuted) setTimeout(() => playSound('success', false), 50);
              }}
              onMouseEnter={() => playSound('hover', isMuted)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 font-mono text-[9px] shadow-sm"
              title={isMuted ? "Enable Interface Sounds" : "Mute Interface Sounds"}
              id="audio-synth-toggle"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-pink-500" />
                  <span className="hidden sm:inline">MUTE</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-cyan animate-pulse" />
                  <span className="hidden sm:inline text-cyan">SOUNDS</span>
                </>
              )}
            </button>

            {/* Mobile Nav Menu button */}
            <button
              onClick={() => {
                playSound('click', isMuted);
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Slide-out */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[88px] z-30 mx-6 bg-slate-950/95 border border-slate-900/90 rounded-2xl p-6 backdrop-blur-lg flex flex-col gap-3 shadow-2xl"
            id="mobile-nav-panel"
          >
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.id, item.name)}
                className={`font-mono text-left text-xs font-bold tracking-widest p-3 rounded-xl border transition-all ${
                  activeTab === item.name
                    ? 'text-cyan bg-cyan/5 border-cyan/20'
                    : 'text-slate-400 bg-slate-900/20 border-transparent'
                }`}
                id={`mobile-nav-item-${item.name.toLowerCase()}`}
              >
                {item.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Wrapper */}
      <main className="relative z-10" id="command-center-main-stage">
        
        {/* 1. HERO SECTION: "The Neural Core" */}
        <section className="pt-32 md:pt-40 pb-20 px-6 max-w-7xl mx-auto" id="neural-core-hero">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" id="hero-layout">
            
            {/* Left Column Text & CTAs */}
            <div className="lg:col-span-6 flex flex-col gap-6" id="hero-content">
              <div>
                <span className="font-mono text-[10px] text-cyan uppercase tracking-[0.3em] font-extrabold mb-3.5 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan animate-pulse" />
                  <span>TRANSMISSION_CONNECTED // TORONTO_HUB</span>
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-white" id="hero-headline">
                  ENGINEERING THE<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] via-[#EC4899] to-[#06B6D4] font-black" id="hero-gradient-text">
                    INTELLIGENT FUTURE
                  </span>
                </h1>
              </div>

              <p className="text-slate-400 text-lg font-light leading-relaxed max-w-xl" id="hero-subheadline">
                Airlines run on fuel. Great ones run on code. We build AI, Cloud, and Enterprise software for ambitious brands.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mt-2" id="hero-ctas">
                <Magnetic className="w-full sm:w-auto">
                  <button
                    onClick={() => handleNavClick('contact-footer', 'CONNECT')}
                    onMouseEnter={() => playSound('hover', isMuted)}
                    className="w-full px-8 py-3.5 bg-[#6D28D9] text-white rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(109,40,217,0.4)] hover:shadow-[0_0_30px_rgba(109,40,217,0.6)] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                    id="btn-strategy-call"
                  >
                    <span>Initiate Strategy</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Magnetic>
                <Magnetic className="w-full sm:w-auto">
                  <button
                    onClick={() => handleNavClick('mission-dossiers-section', 'MISSIONS')}
                    onMouseEnter={() => playSound('hover', isMuted)}
                    className="w-full px-8 py-3.5 border border-white/20 hover:bg-white/5 rounded-xl font-bold text-sm text-white uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                    id="btn-mission-dossiers"
                  >
                    <span>Mission Dossiers</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </Magnetic>
              </div>
            </div>

            {/* Right Column: 3D Canvas Sphere */}
            <div className="lg:col-span-6 w-full relative" id="hero-visual">
              {/* Decorative bento background element for core */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent border border-white/5 rounded-3xl pointer-events-none -z-10" />
              <NeuralCore />
            </div>

          </div>

          {/* Stats Bar (Refactored to Bento Grid Metric Card) */}
          <div className="mt-20 border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-md rounded-3xl p-8 relative overflow-hidden shadow-2xl bg-dot-pattern" id="hero-stats-bar">
            {/* Corner sci-fi layout brackets */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/20" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/20" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/20" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/20" />
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-white/10" id="stats-grid">
              {stats.map((stat, i) => (
                <div 
                  key={stat.id} 
                  className={`flex flex-col items-center text-center ${i > 0 ? 'pt-6 lg:pt-0' : ''}`}
                  id={`stat-box-${stat.id}`}
                >
                  <div className="text-4xl font-black text-white mb-2 font-sans tracking-tight">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. TRUSTED BY: "The Global Network" */}
        <GlobalNetwork />

        {/* 3. SERVICES: "The Technology Galaxy" */}
        <TechGalaxy />

        {/* 4. CASE STUDIES: "Mission Dossiers" */}
        <MissionDossiers />

        {/* 5. THE COMMAND DASHBOARD */}
        <CommandDashboard />

        {/* 6. SUCCESS STORIES: "Holographic Testimonials" */}
        <HolographicTestimonials />

        {/* 7. FOOTER: "Initiate Project" (Glass Form + Radar Brampton Map) */}
        <InitiateProject />

      </main>

      {/* Futuristic Cursor follower HUD */}
      <CursorFollower />
    </div>
  );
}
