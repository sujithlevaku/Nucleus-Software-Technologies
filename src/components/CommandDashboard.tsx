import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Users, Award, Shield, Percent, Cpu, Activity, Circle } from 'lucide-react';
import { SystemVital } from '../types';

export default function CommandDashboard() {
  const [torontoTime, setTorontoTime] = useState('');
  const [utcTime, setUtcTime] = useState('');
  const [activeDeployments, setActiveDeployments] = useState<string[]>([]);
  const [systemUptime, setSystemUptime] = useState('99.9984%');

  // Logs stream simulator
  const logEvents = [
    'INFRA_REPLICATED_US_EAST // STABLE',
    'ISO_27001_COMPLIANCE_VERIFIED // 100% PASS',
    'RAG_SEMANTIC_INDEX_REFRESH // OK',
    'PIPELINE_STAGING_DEPLOY_SUCCESS',
    'PROD_DB_CLUSTER_HEALTH // OPTIMAL',
    'SECURITY_FIREWALL_ZERO_TRUST_PASS',
    'K8S_NODE_AUTOSCALE_TRIGGERED // +2 NODES',
    'AGILE_SPRINT_INTEGRITY_INDEX_100'
  ];

  useEffect(() => {
    // Times Tick
    const updateTime = () => {
      const now = new Date();
      
      // Toronto (EST/EDT)
      const torontoOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Toronto',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setTorontoTime(new Intl.DateTimeFormat('en-US', torontoOptions).format(now));

      // UTC
      setUtcTime(now.toISOString().replace('T', ' ').substring(11, 19) + ' UTC');
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    // Logs Ticker
    const logInterval = setInterval(() => {
      const nextLog = logEvents[Math.floor(Math.random() * logEvents.length)];
      const timestamp = new Date().toISOString().substring(11, 19);
      setActiveDeployments(prev => [`[${timestamp}] ${nextLog}`, ...prev.slice(0, 4)]);
      
      // Slightly fluctuate uptime to simulate live data
      const base = 99.998;
      const variation = Math.random() * 0.0019;
      setSystemUptime(`${(base + variation).toFixed(4)}%`);
    }, 3500);

    // Initial logs seed
    setActiveDeployments([
      `[${new Date().toISOString().substring(11, 19)}] PIPELINE_STAGING_DEPLOY_SUCCESS`,
      `[${new Date().toISOString().substring(11, 19)}] SECURITY_FIREWALL_ZERO_TRUST_PASS`,
      `[${new Date().toISOString().substring(11, 19)}] ISO_27001_COMPLIANCE_VERIFIED // 100% PASS`
    ]);

    return () => {
      clearInterval(timeInterval);
      clearInterval(logInterval);
    };
  }, []);

  const vitals: (SystemVital & { icon: any; color: string; desc: string })[] = [
    {
      id: 'loc',
      label: 'HEADQUARTERS',
      value: 'Toronto, Canada',
      desc: 'CAN + US Timezone Coverage',
      status: 'ONLINE',
      icon: Clock,
      color: 'text-cyan border-cyan/20'
    },
    {
      id: 'talent',
      label: 'SENIOR ENGINEERING',
      value: '40+ Architects',
      desc: 'No PM "translators". Pure developers.',
      status: 'ACTIVE',
      progress: 95,
      icon: Users,
      color: 'text-purple-400 border-purple-500/20'
    },
    {
      id: 'experience',
      label: 'DEVELOPMENT MATURITY',
      value: '10+ Year Median',
      desc: 'Deep enterprise system familiarity',
      status: 'OPTIMAL',
      progress: 92,
      icon: Award,
      color: 'text-pink-500 border-pink-500/20'
    },
    {
      id: 'retention',
      label: 'PARTNER SYNDICATION',
      value: '98% Client Retention',
      desc: '15+ Years of trusted collaboration',
      status: 'OPTIMAL',
      progress: 98,
      icon: Percent,
      color: 'text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'compliance',
      label: 'STANDARDS AUDITING',
      value: 'ISO 27001 Certified',
      desc: 'Agile workflows, absolute compliance',
      status: 'SECURED',
      icon: Shield,
      color: 'text-blue-400 border-blue-500/20'
    }
  ];

  return (
    <section className="py-24 bg-transparent relative overflow-hidden border-t border-white/10" id="command-dashboard-section">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(6,182,212,0.06),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16" id="dashboard-header">
          <span className="text-[10px] font-mono tracking-[0.2em] text-slate-500 uppercase font-bold">Enterprise Capacity</span>
          <h2 className="text-3xl md:text-5xl font-sans text-white mt-3 mb-4 font-black tracking-tighter uppercase leading-[1.05]">System Live-Status</h2>
          <p className="text-slate-400 max-w-xl text-base font-light leading-relaxed">
            Real-time telemetry feeds displaying corporate operational parameters, experience depth, and client compliance metrics.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="dashboard-bento">
          
          {/* Main Clock Widget */}
          <div className="md:col-span-8 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden min-h-[250px] shadow-2xl bg-dot-pattern" id="bento-clock">
            {/* Cyber grid bg */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(244,63,94,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(244,63,94,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#06B6D4]/5 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between z-10" id="clock-widget-hdr">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#06B6D4] animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#06B6D4] font-bold">SYSTEM TIME COMMAND</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[9px] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>UPTIME_OK: {systemUptime}</span>
              </div>
            </div>

            <div className="my-6 z-10" id="clock-widget-body">
              <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4">
                <span className="font-mono text-4xl md:text-6xl font-black text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  {torontoTime || '00:00:00'}
                </span>
                <span className="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Toronto / EST Sync
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-2 tracking-wider">
                COORDINATED TIME: <span className="text-[#06B6D4] font-bold">{utcTime || '00:00:00 UTC'}</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 flex items-center justify-between text-[9px] font-mono text-slate-500 z-10" id="clock-widget-ftr">
              <span>ACTIVE REGIONAL CORES: ONTARIO (CAN) + EAST US</span>
              <span className="hidden sm:inline">CYCLE_ID // NUCLEUS_SYS_v2026.1</span>
            </div>
          </div>

          {/* Location Vitals Widget */}
          {vitals.slice(0, 1).map(vital => {
            const Icon = vital.icon;
            return (
              <div key={vital.id} className="md:col-span-4 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl bg-dot-pattern" id="bento-location">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase font-bold">{vital.label}</span>
                  <div className="flex items-center gap-1.5 bg-[#06B6D4]/10 border border-[#06B6D4]/20 px-2.5 py-1 rounded-full text-[#06B6D4] font-mono text-[9px] font-bold">
                    <Circle className="w-1.5 h-1.5 fill-[#06B6D4] stroke-[#06B6D4] animate-pulse" />
                    <span>{vital.status}</span>
                  </div>
                </div>
                <div className="my-4">
                  <h3 className="text-xl md:text-2xl font-sans font-black text-white mb-1 uppercase tracking-tight">{vital.value}</h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">{vital.desc}</p>
                </div>
                <div className="text-[9px] font-mono text-slate-500 border-t border-white/10 pt-3">
                  SYNC_INDEX // EASTERN_STANDARD_98%_A_LIGN
                </div>
              </div>
            );
          })}

          {/* Experience, Talent, Retention Widgets (Staggered mini stats card) */}
          <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6" id="bento-skills">
            {vitals.slice(1, 4).map(vital => {
              const Icon = vital.icon;
              return (
                <div key={vital.id} className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-md bg-dot-pattern" id={`stat-box-${vital.id}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[9px] tracking-widest text-slate-500 uppercase font-bold">{vital.label}</span>
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-sans font-black text-white mb-1 uppercase tracking-tight">{vital.value}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3 font-light">{vital.desc}</p>
                    
                    {/* Glowing progress slider bar */}
                    {vital.progress && (
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-[#6D28D9] to-[#EC4899] rounded-full" style={{ width: `${vital.progress}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live System Log Ticker Widget */}
          <div className="md:col-span-6 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden min-h-[250px] shadow-2xl bg-dot-pattern" id="bento-telemetry">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-pink-500 animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#EC4899] font-bold">PIPELINE TELEMETRY LOGS</span>
              </div>
              <span className="font-mono text-[9px] text-slate-500">FEED_SECURE_AUTH</span>
            </div>

            {/* Scrolling code list */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 font-mono text-[10px] text-slate-400 flex flex-col gap-2.5 overflow-hidden" id="live-terminal-ticker">
              {activeDeployments.map((log, index) => (
                <motion.div
                  key={log + index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1 - index * 0.2, x: 0 }}
                  className={`flex items-start gap-2 ${index === 0 ? 'text-[#06B6D4] font-bold' : ''}`}
                >
                  <span className="text-slate-600 shrink-0">&gt;</span>
                  <span className="leading-normal break-all">{log}</span>
                </motion.div>
              ))}
            </div>

            <div className="text-[9px] font-mono text-slate-500 mt-3 flex items-center justify-between">
              <span>SAMPLING RATE // 0.28 SECONDS</span>
              <span className="text-emerald-400 font-bold">HEALTH: 100% SECURE</span>
            </div>
          </div>

          {/* Compliance & Standards Widget (Agile + ISO Audit) */}
          <div className="md:col-span-12 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl bg-dot-pattern" id="bento-compliance">
            {/* Holographic glowing lines */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan/2 via-transparent to-purple-500/2 pointer-events-none" />
            
            <div className="flex items-center gap-4 text-center md:text-left" id="compliance-text">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 border border-white/15 flex items-center justify-center text-blue-400 shrink-0 shadow-md">
                <Shield className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="block font-mono text-[9px] tracking-widest text-slate-500 uppercase font-bold">COMPLIANCE ASSURANCE</span>
                <h3 className="text-lg font-sans font-extrabold text-white mb-0.5 uppercase tracking-tight">ISO 27001 Security Standard & Agile Workflow</h3>
                <p className="text-xs text-slate-400 font-light">Our software processes undergo rigorous, continuous internal auditing and agile cycle integrations.</p>
              </div>
            </div>
            
            <div className="flex gap-3 shrink-0" id="compliance-badges">
              <span className="font-mono text-[10px] text-[#06B6D4] bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg font-bold uppercase">
                ISO_27001_ACTIVE
              </span>
              <span className="font-mono text-[10px] text-purple-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg font-bold uppercase">
                AGILE_SPRINTS_FAST
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
