import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Shield, Globe, Smartphone, Cloud, RefreshCw, ShoppingBag, Zap, Layers, ChevronRight, CheckCircle2 } from 'lucide-react';
import { ServiceNode } from '../types';

export default function TechGalaxy() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('ai-ml');
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Orbit animation loop
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setOrbitAngle(prev => (prev + 0.15) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [isPaused]);

  const serviceNodes: (ServiceNode & { icon: any; shortDesc: string })[] = [
    {
      id: 'ai-ml',
      name: 'AI & Machine Learning',
      shortDesc: 'LLM apps, RAG pipelines, production ML',
      description: 'Custom Large Language Model applications, Retrieval-Augmented Generation (RAG) semantic indexing systems, and high-performance production-ready ML infrastructure.',
      businessOutcomes: [
        '90% faster document ingestion & synthesis',
        'Automated support routing with 95% precision',
        '24/7 secure, autonomous cognitive agents'
      ],
      techStack: ['Gemini Pro', 'OpenAI API', 'LangChain', 'Python', 'PyTorch', 'VectorDBs'],
      x: 0, y: 0, // dynamic
      icon: Cpu
    },
    {
      id: 'cloud-devops',
      name: 'Cloud & DevOps',
      shortDesc: 'AWS, GCP, 99.99% reliability engineering',
      description: 'Zero-trust multi-cloud engineering spanning AWS, GCP, and Azure with automated Kubernetes clusters and immutable infrastructure-as-code.',
      businessOutcomes: [
        '99.99% high-availability operational uptime',
        '60% infrastructure billing cost reductions',
        '1-click secure multi-region failovers'
      ],
      techStack: ['AWS', 'Google Cloud', 'Kubernetes', 'Terraform', 'GitHub Actions', 'Docker'],
      x: 0, y: 0,
      icon: Cloud
    },
    {
      id: 'web-dev',
      name: 'Web & App Development',
      shortDesc: 'End-to-end platforms with high polish',
      description: 'High-polish, custom enterprise web applications optimized for sub-second performance, standard UI styling, and absolute structural safety.',
      businessOutcomes: [
        '100ms Page load speeds (Core Web Vitals)',
        'Enhanced client-retention metrics by 40%',
        'Fully modular, scalable frontend frameworks'
      ],
      techStack: ['React / Vite', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express'],
      x: 0, y: 0,
      icon: Globe
    },
    {
      id: 'mobile-dev',
      name: 'Mobile App Development',
      shortDesc: 'Native iOS/Android & Cross-platform',
      description: 'Stellar native Swift/Kotlin and cross-platform mobile products emphasizing smooth 120Hz scrolling, biometric login, and robust offline sync.',
      businessOutcomes: [
        'App Store featured-grade responsiveness',
        'Single-codebase cross-platform efficiency',
        'Seamless push notifications & deep-linking'
      ],
      techStack: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'Fastlane'],
      x: 0, y: 0,
      icon: Smartphone
    },
    {
      id: 'modernization',
      name: 'Software Modernization',
      shortDesc: 'Re-platforming legacy enterprise stacks',
      description: 'Injecting agility into rigid legacy systems by refactoring monolith code bases into scalable, highly-maintainable serverless or microservice structures.',
      businessOutcomes: [
        'Eliminated legacy developer bottleneck',
        '80% reduction in production deployment risks',
        'Modern, decoupled API-first architecture'
      ],
      techStack: ['Microservices', 'GraphQL', 'Docker', 'Spring Boot', 'Golang', 'gRPC'],
      x: 0, y: 0,
      icon: RefreshCw
    },
    {
      id: 'security',
      name: 'Cyber Security',
      shortDesc: 'Zero-trust, SOC2 posture, auditing',
      description: 'End-to-end application hardening, identity integration, automated vulnerability scanning, and ready-to-certify ISO 27001 / SOC 2 postures.',
      businessOutcomes: [
        '100% encrypted active-transit data flows',
        'Continuous compliance mapping and alerts',
        'Automated DDoS & active threat blocking'
      ],
      techStack: ['Auth0', 'Vault', 'WAF', 'ISO 27001', 'Clair Scans', 'OAuth2 / OIDC'],
      x: 0, y: 0,
      icon: Shield
    },
    {
      id: 'ecommerce',
      name: 'eCommerce Engineering',
      shortDesc: 'Omnichannel commerce that lifts AOV',
      description: 'Next-generation headless commerce pipelines designed to withstand sudden Black Friday spikes, integrate legacy warehouses, and maximize cart value.',
      businessOutcomes: [
        '35% average increase in customer order values',
        'Sub-second instant product search filtering',
        'Dynamic custom cart & frictionless checkouts'
      ],
      techStack: ['Shopify Plus', 'MedusaJS', 'Stripe API', 'Redis', 'Elasticsearch', 'NextJS'],
      x: 0, y: 0,
      icon: ShoppingBag
    },
    {
      id: 'integration',
      name: 'Platform Integration',
      shortDesc: 'Unifying CRMs, ERPs, and external APIs',
      description: 'Orchestrating disparate enterprise technologies, data silos, payment processors, and custom internal systems into a single seamless network.',
      businessOutcomes: [
        'Eliminated manual administrative tasks',
        'Real-time automated transaction synchronicity',
        'Highly resilient message brokers for data safety'
      ],
      techStack: ['Apache Kafka', 'GraphQL Mesh', 'MuleSoft', 'Salesforce API', 'RabbitMQ', 'gRPC'],
      x: 0, y: 0,
      icon: Layers
    }
  ];

  // Distribute nodes around the central orbit
  const nodesWithCoordinates = serviceNodes.map((node, index) => {
    const angleOffset = (index * (360 / serviceNodes.length)) * (Math.PI / 180);
    const radAngle = (orbitAngle * (Math.PI / 180)) + angleOffset;
    const radiusX = 220; // horizontal orbital radius
    const radiusY = 160; // vertical orbital radius
    
    return {
      ...node,
      coordX: Math.cos(radAngle) * radiusX,
      coordY: Math.sin(radAngle) * radiusY,
      angleOffset
    };
  });

  const selectedNode = serviceNodes.find(n => n.id === selectedNodeId) || serviceNodes[0];
  const SelectedIcon = selectedNode.icon;

  return (
    <section className="py-24 bg-transparent relative overflow-hidden border-t border-white/10" id="services-galaxy-section">
      {/* Dynamic ambient galaxy background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(109,40,217,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(6,182,212,0.05),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16 md:mb-24" id="galaxy-header">
          <span className="text-[10px] font-mono tracking-[0.2em] text-slate-500 uppercase font-bold">Protocol Capabilities</span>
          <h2 className="text-3xl md:text-5xl font-sans text-white mt-3 mb-4 font-black tracking-tighter uppercase leading-[1.05]">
            Our Orchestrated Engineering Capabilities
          </h2>
          <p className="text-slate-400 max-w-2xl text-base font-light leading-relaxed">
            Hover or click on any node orbiting the central core to inspect tech stacks and specific corporate business outcomes.
          </p>
        </div>

        {/* Outer Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" id="galaxy-layout-grid">
          
          {/* Orbital Visualization Area (Desktop only, falls back to responsive interactive map/grid on mobile) */}
          <div className="lg:col-span-7 h-[500px] hidden md:flex items-center justify-center relative bg-gradient-to-br from-white/5 to-transparent rounded-3xl border border-white/10 overflow-hidden shadow-inner group/galaxy bg-dot-pattern"
               onMouseEnter={() => setIsPaused(true)}
               onMouseLeave={() => setIsPaused(false)}
               id="orbital-galaxy-desktop"
          >
            {/* Tech grid decoration */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.01)_1px,transparent_1px)] bg-[size:24px_24px]" />
            
            {/* Orbital Tracks */}
            <div className="absolute w-[440px] h-[320px] rounded-full border border-dashed border-slate-900/80 pointer-events-none" />
            <div className="absolute w-[280px] h-[200px] rounded-full border border-dotted border-slate-800/40 pointer-events-none" />

            {/* Central Core */}
            <div className="absolute z-20 flex flex-col items-center justify-center" id="galaxy-central-core">
              {/* Outer pulsing rings */}
              <div className="absolute w-24 h-24 bg-purple-600/10 rounded-full animate-ping pointer-events-none" />
              <div className="absolute w-16 h-16 bg-cyan/15 rounded-full blur-md pointer-events-none animate-pulse" />
              
              <div className="relative w-16 h-16 rounded-full bg-slate-900 border-2 border-cyan shadow-[0_0_25px_rgba(6,182,212,0.3)] flex items-center justify-center cursor-pointer group-hover/galaxy:scale-105 transition-transform duration-500">
                <Zap className="w-6 h-6 text-cyan animate-pulse" />
              </div>
              <span className="font-mono text-[10px] text-cyan font-bold uppercase tracking-widest mt-3 bg-slate-950/90 px-2 py-0.5 border border-slate-800/80 rounded">NUCLEUS</span>
            </div>

            {/* Orbiting Nodes */}
            {nodesWithCoordinates.map((node) => {
              const Icon = node.icon;
              const isSelected = node.id === selectedNodeId;

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  onMouseEnter={() => setSelectedNodeId(node.id)}
                  className="absolute z-30 flex flex-col items-center"
                  style={{
                    transform: `translate(${node.coordX}px, ${node.coordY}px)`,
                    transition: isPaused ? 'transform 0.1s ease-out' : 'none'
                  }}
                  id={`orbit-node-${node.id}`}
                >
                  {/* Dynamic glow connector to center core */}
                  {isSelected && (
                    <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none overflow-visible" style={{ transform: `rotate(${-node.angleOffset}rad)` }}>
                      <line x1="150" y1="150" x2="150" y2="150 - 150" stroke="url(#node-glow-grad)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                      <defs>
                        <linearGradient id="node-glow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#EC4899" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>
                    </svg>
                  )}

                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isSelected
                      ? 'bg-slate-900 border-2 border-pink-500 text-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.4)] scale-110'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-500 hover:scale-105'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className={`font-display text-[10px] font-bold tracking-wide mt-2 px-1.5 py-0.5 rounded transition-all duration-300 ${
                    isSelected
                      ? 'text-white bg-pink-500/10 border border-pink-500/20'
                      : 'text-slate-400 bg-slate-950/80 border border-transparent'
                  }`}>
                    {node.name.split(' & ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Fallback layout for mobile - grid list of items */}
          <div className="md:hidden flex flex-col gap-3" id="orbital-galaxy-mobile">
            {serviceNodes.map((node) => {
              const Icon = node.icon;
              const isSelected = node.id === selectedNodeId;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                    isSelected
                      ? 'bg-slate-900/60 border-cyan text-white shadow-lg'
                      : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white'
                  }`}
                  id={`mobile-service-node-${node.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan/10 text-cyan' : 'bg-slate-900 text-slate-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-semibold text-white">{node.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{node.shortDesc}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSelected ? 'rotate-90 text-cyan' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Detailed Outcomes Panel (Interactive HUD) */}
          <div className="lg:col-span-5 flex flex-col h-full" id="service-outcomes-hud">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl min-h-[460px] justify-between"
                id="outcome-panel-card"
              >
                {/* Tech HUD accents */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-500/10 to-transparent pointer-events-none" />
                <div className="absolute top-3 right-4 font-mono text-[9px] text-slate-600 tracking-wider">SEC_REF // 0x{selectedNode.id.toUpperCase().substring(0,4)}</div>

                <div>
                  {/* Service Header */}
                  <div className="flex items-center gap-4 mb-6" id="hud-panel-header">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/15 to-pink-500/15 border border-purple-500/30 flex items-center justify-center text-pink-500 shadow-md">
                      <SelectedIcon className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-cyan uppercase font-bold">NODE SERVICE</span>
                      <h3 className="text-xl md:text-2xl font-display text-white font-bold tracking-tight">{selectedNode.name}</h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 border-l-2 border-slate-800 pl-4">
                    {selectedNode.description}
                  </p>

                  {/* Business Outcomes */}
                  <div className="mb-8" id="hud-outcomes-container">
                    <span className="block font-mono text-[10px] tracking-widest text-pink-500 uppercase font-bold mb-4">EXPECTED BUSINESS OUTCOMES</span>
                    <div className="flex flex-col gap-3">
                      {selectedNode.businessOutcomes.map((outcome, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-slate-300 text-xs md:text-sm">
                          <CheckCircle2 className="w-5 h-5 text-cyan shrink-0 mt-0.5" />
                          <span className="leading-normal">{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tech Stack Footer */}
                <div className="border-t border-slate-900 pt-6 mt-auto" id="hud-tech-stack-container">
                  <span className="block font-mono text-[10px] tracking-widest text-slate-500 uppercase font-bold mb-3">ENGINEERING TECH STACK</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[10px] text-cyan bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 px-2.5 py-1 rounded transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
