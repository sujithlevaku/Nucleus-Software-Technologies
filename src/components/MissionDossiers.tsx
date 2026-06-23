import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, ShieldAlert, Cpu, CheckSquare, Layers, FileText, ChevronRight, X, ExternalLink } from 'lucide-react';
import { MissionDossier } from '../types';

export default function MissionDossiers() {
  const [selectedDossierId, setSelectedDossierId] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedText, setDecryptedText] = useState('');

  const dossiers: MissionDossier[] = [
    {
      id: 'm-001',
      codeName: 'MISSION_001',
      client: 'Hercules Freight Platform',
      title: 'Unified Transportation Management System (TMS) & Driver App',
      description: 'Engaged to completely redesign a legacy logistics dispatch pipeline. We engineered a reactive web dashboard for central routing command, paired with a resilient offline-first React Native mobile utility for long-haul drivers.',
      techStack: ['React Native', 'Node.js', 'PostgreSQL', 'Google Routes API', 'WebSockets'],
      metrics: '34% dispatch coordination speedup, 99.8% real-time fleet telemetry sync.',
      status: 'DEPLOYED'
    },
    {
      id: 'm-002',
      codeName: 'MISSION_002',
      client: 'InterDesign Commerce',
      title: 'Headless Global Commerce Architecture Replatforming',
      description: 'Architected and built a headless e-commerce pipeline for a premier high-end interior design catalog. By decoupling the presentation layer from backend APIs, we enabled instant page loading and seamless cart transitions.',
      techStack: ['Shopify Plus API', 'Next.js', 'Tailwind CSS', 'Algolia Search', 'Stripe API'],
      metrics: '+42% user checkout throughput, 100% uptime sustained during cyber-sales spikes.',
      status: 'COMPLETED'
    },
    {
      id: 'm-003',
      codeName: 'MISSION_003',
      client: 'JCDecaux Inventory Cloud',
      title: 'Programmatic Out-of-Home (OOH) Ad Engine',
      description: 'Developed a high-concurrency programmatic ad inventory and scheduling engine. This cloud-native microservice dynamically processes real-time bidding requests and delivers targeted digital billboard allocations.',
      techStack: ['Golang', 'Kubernetes', 'AWS DynamoDB', 'Redis Cluster', 'gRPC Services'],
      metrics: 'Sub-50ms transaction seat allocation latency for 10,000+ digital panels.',
      status: 'DEPLOYED'
    },
    {
      id: 'm-004',
      codeName: 'MISSION_004',
      client: 'Vector Learning Journey',
      title: 'Enterprise Compliance & Training Infrastructure',
      description: 'Collaborated on scaling a nationwide compliance platform. Built custom React client interfaces integrated with a heavy-duty Spring Boot microservice pipeline, designed to handle massive synchronous exam concurrency.',
      techStack: ['Java Spring Boot', 'React / Next.js', 'AWS Aurora', 'Elasticsearch', 'S3'],
      metrics: 'Zero-lag testing performance supporting 5,000,000+ active certified learners.',
      status: 'ACTIVE'
    },
    {
      id: 'm-005',
      codeName: 'MISSION_005',
      client: 'Freshworks Integrations',
      title: 'Authorized Partner Core App Ecosystem Buildouts',
      description: 'As an authorized engineering partner, we designed, audited, and deployed customized telemetry widgets and deep API bridging solutions linking corporate CRMs directly with Freshdesk/Freshservice.',
      techStack: ['Freshworks SDK', 'TypeScript', 'Node.js Serverless', 'OAuth2 Gateways'],
      metrics: 'Successfully launched 8 marketplace plugins used by 120+ enterprises globally.',
      status: 'COMPLETED'
    }
  ];

  const handleDossierClick = (id: string) => {
    setSelectedDossierId(id);
    setIsDecrypting(true);
    setDecryptedText('');
    
    // Simulate terminal hacker decryption typing effect
    let progress = 0;
    const binary = '01100111011011110110111101100100';
    const interval = setInterval(() => {
      setDecryptedText(prev => prev + binary[Math.floor(Math.random() * binary.length)]);
      progress++;
      if (progress > 20) {
        clearInterval(interval);
        setIsDecrypting(false);
      }
    }, 25);
  };

  const activeDossier = dossiers.find(d => d.id === selectedDossierId);

  return (
    <section className="py-24 bg-transparent relative overflow-hidden border-t border-white/10" id="mission-dossiers-section">
      {/* Laser grids / Matrix line visual background */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.05),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16" id="dossiers-header">
          <div className="max-w-xl">
            <span className="text-[10px] font-mono tracking-[0.2em] text-slate-500 uppercase font-bold">Active Missions</span>
            <h2 className="text-3xl md:text-5xl font-sans text-white mt-3 mb-4 font-black tracking-tighter uppercase leading-[1.05]">Mission Dossiers</h2>
            <p className="text-slate-400 text-base font-light leading-relaxed">
              Archived logs of real-world enterprise architectures engineered and deployed by Nucleus. Review decrypted telemetry files below.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2.5 font-mono text-[9px] text-slate-400 bg-white/5 border border-white/10 px-4 py-2 rounded-xl" id="terminal-stats">
            <Terminal className="w-4 h-4 text-[#06B6D4]" />
            <span>SECURE_DATA_FEED_ACTIVE // PORT: 0x3000</span>
          </div>
        </div>

        {/* Dossiers Terminal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="dossiers-grid">
          {dossiers.map((dossier, i) => (
            <motion.div
              key={dossier.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, borderColor: 'rgba(109, 40, 217, 0.4)' }}
              onClick={() => handleDossierClick(dossier.id)}
              className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-6 relative overflow-hidden group cursor-pointer flex flex-col justify-between h-[320px] transition-all duration-300 shadow-lg bg-dot-pattern"
              id={`dossier-card-${dossier.id}`}
            >
              {/* Scanline CRT overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* HUD corner borders */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/15 group-hover:border-[#06B6D4] group-hover:w-4 group-hover:h-4 transition-all duration-300" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/15 group-hover:border-[#06B6D4] group-hover:w-4 group-hover:h-4 transition-all duration-300" />

              <div>
                {/* Header */}
                <div className="flex items-center justify-between font-mono text-[9px] mb-4 text-slate-500" id={`card-hdr-${dossier.id}`}>
                  <span className="group-hover:text-[#06B6D4] transition-colors">{dossier.codeName}</span>
                  <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      dossier.status === 'DEPLOYED' ? 'bg-[#06B6D4]' : dossier.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-[#EC4899]'
                    } animate-pulse`} />
                    <span className="text-slate-400 text-[8px] font-bold tracking-wider">{dossier.status}</span>
                  </div>
                </div>

                {/* Info */}
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[#6D28D9] font-bold mb-1">{dossier.client}</span>
                <h3 className="text-base font-sans font-extrabold text-white leading-snug mb-3 group-hover:text-[#06B6D4] transition-colors">
                  {dossier.title}
                </h3>
                <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed font-light">
                  {dossier.description}
                </p>
              </div>

              {/* Footer specs */}
              <div className="border-t border-white/10 pt-4 mt-4 flex items-center justify-between" id={`card-ftr-${dossier.id}`}>
                <div className="flex flex-wrap gap-1 max-w-[80%]">
                  {dossier.techStack.slice(0, 3).map(tech => (
                    <span key={tech} className="font-mono text-[8px] text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                      {tech}
                    </span>
                  ))}
                  {dossier.techStack.length > 3 && (
                    <span className="font-mono text-[8px] text-[#06B6D4] px-1.5 py-0.5">+{dossier.techStack.length - 3}</span>
                  )}
                </div>
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 group-hover:border-[#06B6D4] flex items-center justify-center text-slate-500 group-hover:text-[#06B6D4] transition-all duration-300">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Immersive Decrypted Detailed Modal File */}
        <AnimatePresence>
          {selectedDossierId && activeDossier && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4 pointer-events-auto"
              id="decryption-modal-overlay"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-slate-950 border border-slate-800/80 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative"
                id="decryption-modal-card"
              >
                {/* Simulated Decryption Loader */}
                {isDecrypting ? (
                  <div className="p-12 flex flex-col items-center justify-center text-center font-mono gap-4 min-h-[350px]">
                    <ShieldAlert className="w-12 h-12 text-cyan animate-bounce" />
                    <div className="text-sm font-bold text-cyan uppercase tracking-widest">DECRYPTING MISSION FILES...</div>
                    <div className="text-[10px] text-slate-600 max-w-xs break-all leading-normal">
                      {decryptedText}
                    </div>
                    <div className="w-40 h-1 bg-slate-900 rounded-full overflow-hidden mt-2 border border-slate-800">
                      <div className="h-full bg-cyan animate-[shimmer_1s_infinite] w-3/4" style={{
                        backgroundImage: 'linear-gradient(90deg, #06B6D4 0%, #EC4899 50%, #06B6D4 100%)',
                        backgroundSize: '200% 100%'
                      }} />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Header bar */}
                    <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-4 flex items-center justify-between font-mono text-[10px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-cyan" />
                        <span>DECRYPTED_LOG // {activeDossier.codeName}</span>
                      </div>
                      <button
                        onClick={() => setSelectedDossierId(null)}
                        className="p-1 rounded-md bg-slate-950 border border-slate-800 hover:border-pink-500 hover:text-pink-500 transition-colors cursor-pointer"
                        id="btn-close-modal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-6 md:p-8 flex flex-col gap-6" id="decrypted-modal-body">
                      {/* Sub-header */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-xs uppercase tracking-widest text-cyan font-bold bg-cyan/10 px-2 py-0.5 border border-cyan/20 rounded">
                            {activeDossier.client}
                          </span>
                          <span className="font-mono text-[9px] text-slate-500">SYSTEM SECURED ✓</span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-display font-bold text-white leading-snug">
                          {activeDossier.title}
                        </h2>
                      </div>

                      {/* Detailed text */}
                      <div className="border-l-2 border-slate-800 pl-4 py-1">
                        <span className="block font-mono text-[9px] text-slate-500 uppercase font-bold mb-1.5">OBJECTIVE & BRIEFING</span>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {activeDossier.description}
                        </p>
                      </div>

                      {/* Tech Metrics HUD Display */}
                      <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl font-mono text-xs flex flex-col gap-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-cyan/5 to-transparent pointer-events-none" />
                        <span className="text-[9px] text-pink-500 uppercase font-bold tracking-widest">DEPLOYED METRICS TELEMETRY</span>
                        <div className="text-white text-sm font-bold mt-1 pl-2 border-l-2 border-pink-500">
                          {activeDossier.metrics}
                        </div>
                      </div>

                      {/* Tech Stack list */}
                      <div>
                        <span className="block font-mono text-[9px] text-slate-500 uppercase font-bold mb-2">ENGINEERING BLUEPRINT STACK</span>
                        <div className="flex flex-wrap gap-2">
                          {activeDossier.techStack.map(tech => (
                            <span key={tech} className="font-mono text-[10px] text-cyan bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer CTA */}
                      <div className="border-t border-slate-900/80 pt-6 flex items-center justify-between" id="decrypted-modal-footer">
                        <div className="text-[10px] font-mono text-slate-600">
                          CLASSIFIED // NUCLEUS SOFT INC. © 2026
                        </div>
                        <button
                          onClick={() => setSelectedDossierId(null)}
                          className="bg-gradient-to-r from-cyan to-purple-600 hover:from-cyan/90 hover:to-purple-600/90 text-slate-950 font-display font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0"
                          id="btn-close-dossier"
                        >
                          <span>System Acknowledge</span>
                          <CheckSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
