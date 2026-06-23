import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Terminal, CheckCircle2, ChevronRight, MapPin, Mail, Phone, Landmark, Send, Settings, Link2, HelpCircle, Check, Sparkles } from 'lucide-react';

export default function InitiateProject() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    domain: '',
    brief: '',
    scale: 'Enterprise Web Platform'
  });

  const [formStatus, setFormStatus] = useState<'IDLE' | 'COMPILING' | 'SUCCESS'>('IDLE');
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [showMappingConfig, setShowMappingConfig] = useState(false);
  const [mapping, setMapping] = useState(() => {
    const saved = localStorage.getItem('NUCLEUS_FORM_MAPPING');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfKw3LF07oFIOHgD6-8YKE0IHuXmG3oAoMTcwq7SwidhF2Otg/formResponse',
      nameId: 'entry.2005620554',
      emailId: 'entry.1045781291',
      domainId: 'entry.1065046570',
      scaleId: 'entry.1166974658',
      briefId: 'entry.839337160'
    };
  });

  useEffect(() => {
    localStorage.setItem('NUCLEUS_FORM_MAPPING', JSON.stringify(mapping));
  }, [mapping]);

  const [autoPasteText, setAutoPasteText] = useState('');
  const [parseStatus, setParseStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [parsedParams, setParsedParams] = useState<{ id: string; val: string }[]>([]);

  const handleAutoParse = (rawInput: string) => {
    if (!rawInput.trim()) return;
    
    const updatedMapping = { ...mapping };
    let foundAny = false;

    // 1. Extract Google Form URL if found
    const formUrlMatch = rawInput.match(/https:\/\/docs\.google\.com\/forms\/d\/e\/([a-zA-Z0-9_-]+)/);
    if (formUrlMatch) {
      updatedMapping.formUrl = `https://docs.google.com/forms/d/e/${formUrlMatch[1]}/formResponse`;
      foundAny = true;
    }

    // 2. Decode content to handle URL parameters or escaped entities
    const decodedInput = decodeURIComponent(rawInput);

    // 3. Match explicit entry assignments: entry.12345=Value
    const entriesFound: { id: string; val: string }[] = [];
    const paramRegex = /(entry\.[0-9]+)=([^&"'\s>]+)/g;
    let match;
    const matchedIds = new Set<string>();

    while ((match = paramRegex.exec(decodedInput)) !== null) {
      const entryId = match[1];
      const value = match[2];
      entriesFound.push({ id: entryId, val: value });
      matchedIds.add(entryId);
    }

    // Also scan for simple occurrences of "entry.[0-9]+" in case of raw text or custom format
    const allEntriesInText = decodedInput.match(/entry\.[0-9]+/g) || [];
    allEntriesInText.forEach(entryId => {
      if (!matchedIds.has(entryId)) {
        entriesFound.push({ id: entryId, val: '(No value)' });
        matchedIds.add(entryId);
      }
    });

    if (entriesFound.length > 0) {
      setParsedParams(entriesFound);
      foundAny = true;

      // Smart best-guess:
      entriesFound.forEach(item => {
        const valueLower = item.val.toLowerCase();
        if (valueLower.includes('name') || valueLower === 'name' || valueLower.includes('scott') || valueLower.includes('desimone') || valueLower.includes('sujith')) {
          updatedMapping.nameId = item.id;
        } else if (valueLower.includes('email') || valueLower.includes('mail') || valueLower.includes('@')) {
          updatedMapping.emailId = item.id;
        } else if (valueLower.includes('domain') || valueLower.includes('org') || valueLower.includes('readcorp') || valueLower.includes('.com') || valueLower.includes('website') || valueLower.includes('web')) {
          if (!valueLower.includes('@')) {
            updatedMapping.domainId = item.id;
          }
        } else if (valueLower.includes('scale') || valueLower.includes('enterprise') || valueLower.includes('mid') || valueLower.includes('large') || valueLower.includes('platform')) {
          updatedMapping.scaleId = item.id;
        } else if (valueLower.includes('brief') || valueLower.includes('message') || valueLower.includes('constraint') || valueLower.includes('project') || valueLower.includes('desc') || valueLower.includes('about')) {
          updatedMapping.briefId = item.id;
        }
      });

      // Index fallback if 5 elements detected and we have empty placeholder entries
      if (entriesFound.length >= 5) {
        const fields = ['nameId', 'emailId', 'domainId', 'scaleId', 'briefId'] as const;
        // Map in order of appearance
        fields.forEach((field, idx) => {
          if (entriesFound[idx]) {
            updatedMapping[field] = entriesFound[idx].id;
          }
        });
      }

      setMapping(updatedMapping);
      setParseStatus('SUCCESS');
      setAutoPasteText('');
      setTimeout(() => setParseStatus('IDLE'), 3000);
    } else if (foundAny) {
      setMapping(updatedMapping);
      setParseStatus('SUCCESS');
      setTimeout(() => setParseStatus('IDLE'), 3000);
    } else {
      setParseStatus('ERROR');
      setTimeout(() => setParseStatus('IDLE'), 3000);
    }
  };

  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  const googleFormRef = useRef<HTMLFormElement>(null);

  // Custom Interactive Canvas Tactical Radar Map
  useEffect(() => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = canvas.width;
    let height = canvas.height;
    
    // Resize map canvas based on container
    const resizeMap = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      width = rect.width;
      height = 360; // fixed heights
      canvas.width = width;
      canvas.height = height;
    };
    resizeMap();
    window.addEventListener('resize', resizeMap);

    let sweepAngle = 0;
    
    // Core Brampton HQ coordinates relative to local layout
    const hqX = () => width / 2;
    const hqY = () => height / 2;

    // Sub nodes
    const networkNodes = [
      { name: 'Toronto Financial Core', xOffset: 30, yOffset: 60, status: 'SECURE' },
      { name: 'Waterloo AI Hub', xOffset: -120, yOffset: 10, status: 'STABLE' },
      { name: 'Montreal Cloud Node', xOffset: 240, yOffset: -50, status: 'ACTIVE' },
      { name: 'New York Router', xOffset: 110, yOffset: 150, status: 'STABLE' },
      { name: 'Silicon Valley Gateway', xOffset: -260, yOffset: 80, status: 'ACTIVE' }
    ];

    const drawRadar = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = hqX();
      const cy = hqY();

      // 1. Draw digital cyber grids
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.lineWidth = 1;
      
      const gridSize = 24;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Radar concentric distance circles
      const radii = [60, 120, 180, 240];
      radii.forEach(r => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.stroke();
      });

      // 3. Radar sweeping laser line
      sweepAngle += 0.01;
      const sweepX = cx + Math.cos(sweepAngle) * 320;
      const sweepY = cy + Math.sin(sweepAngle) * 320;

      // Draw sweep slice gradient
      const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, 300);
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0.1)');
      gradient.addColorStop(1, 'rgba(6, 182, 212, 0.01)');
      
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, 300, sweepAngle - 0.3, sweepAngle);
      ctx.lineTo(cx, cy);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.05)';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sweepX, sweepY);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 4. Draw network connections from HQ
      networkNodes.forEach(node => {
        const nx = cx + node.xOffset;
        const ny = cy + node.yOffset;

        // Skip rendering if nodes overflow the canvas boundary
        if (nx < 0 || nx > width || ny < 0 || ny > height) return;

        // Draw connecting vector path
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = 'rgba(109, 40, 217, 0.15)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Little dynamic packets flowing from HQ to sub-node
        const packetProgress = (Date.now() * 0.001 * (0.5 + Math.random() * 0.5)) % 1;
        const px = cx + (nx - cx) * packetProgress;
        const py = cy + (ny - cy) * packetProgress;

        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#EC4899';
        ctx.shadowColor = '#EC4899';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw sub-node itself
        ctx.beginPath();
        ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#6D28D9';
        ctx.fill();

        // Sub node halo rings
        ctx.beginPath();
        ctx.arc(nx, ny, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(109, 40, 217, 0.3)';
        ctx.stroke();

        // Text names for nodes
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.font = '8px "JetBrains Mono"';
        ctx.textAlign = 'center';
        ctx.fillText(node.name.toUpperCase(), nx, ny - 12);
      });

      // 5. Draw Brampton Headquarters central beacon
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#06B6D4';
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Concentric pulsing beacon rings
      const pulseSize = (Date.now() * 0.03) % 40;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(6, 182, 212, ${1 - pulseSize/40})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px "JetBrains Mono"';
      ctx.textAlign = 'center';
      ctx.fillText('NUCLEUS_HQ // BRAMPTON', cx, cy - 14);

      animId = requestAnimationFrame(drawRadar);
    };

    drawRadar();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeMap);
    };
  }, []);

  // Form submit trigger
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setFormStatus('COMPILING');
    setSystemLogs([]);

    const logs = [
      'STABILIZING_SECURE_NUCLEUS_TUNNEL... [OK]',
      'ENCRYPTING_MESSAGE_PAYLOAD // SHA-512... [OK]',
      'ESTABLISHING_RELAY_TO_TORONTO_HUB... [OK]',
      'TRANSMITTING_SYSTEM_PARAMETERS... [OK]',
      'NUCLEUS_COGNITIVE_MEM_SYNCED // INITIATED',
      'TRANSMISSION_COMPLETE // EX_SYSTEM_0x09 ✓'
    ];

    // Typelog effect
    logs.forEach((logLine, idx) => {
      setTimeout(() => {
        setSystemLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logLine}`]);
        if (idx === logs.length - 1) {
          setTimeout(() => {
            setFormStatus('SUCCESS');
          }, 600);
        }
      }, (idx + 1) * 400);
    });

    // Programmatically trigger background Google Form submission
    setTimeout(() => {
      if (googleFormRef.current) {
        googleFormRef.current.submit();
      }
    }, 100);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', domain: '', brief: '', scale: 'Enterprise Web Platform' });
    setFormStatus('IDLE');
    setSystemLogs([]);
  };

  return (
    <footer className="py-24 bg-transparent relative overflow-hidden border-t border-white/10" id="contact-footer">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(109,40,217,0.04),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start" id="footer-main-grid">
          
          {/* Contact glass form */}
          <div className="lg:col-span-6 flex flex-col h-full" id="form-column">
            <div>
              <span className="text-[10px] font-mono tracking-[0.2em] text-slate-500 uppercase font-bold">Initiate Project</span>
              <h2 className="text-3xl md:text-5xl font-sans text-white mt-3 mb-6 font-black tracking-tighter uppercase leading-[1.05]">Establish Connection</h2>
              <p className="text-slate-400 text-base font-light leading-relaxed mb-8">
                Ready to deploy custom software platforms? Initialize your secure connection below to log project coordinates directly with our Toronto engineering core.
              </p>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl flex-1 bg-dot-pattern" id="form-container">
              {/* Corner sci fi decors */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/15" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/15" />

              {/* Hidden Iframe & Form for background Google Form submission */}
              <iframe
                name="hidden_google_form_iframe"
                id="hidden_google_form_iframe"
                className="hidden"
                style={{ display: 'none' }}
              />
              <form
                ref={googleFormRef}
                action={mapping.formUrl}
                method="POST"
                target="hidden_google_form_iframe"
                className="hidden"
                style={{ display: 'none' }}
              >
                <input type="hidden" name={mapping.nameId} value={formData.name} />
                <input type="hidden" name={mapping.emailId} value={formData.email} />
                <input type="hidden" name={mapping.domainId} value={formData.domain} />
                <input type="hidden" name={mapping.scaleId} value={formData.scale} />
                <input type="hidden" name={mapping.briefId} value={formData.brief} />
              </form>

              {formStatus === 'IDLE' && (
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-5" id="glass-contact-form">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">COMM_RECIPIENT_NAME</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Scott DeSimone"
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-white/5 border border-white/10 focus:border-[#06B6D4] text-white rounded-xl px-4 py-3 text-sm transition-colors outline-none focus:ring-1 focus:ring-cyan/20"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">COMM_RECIPIENT_EMAIL</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. ceo@readingcorp.com"
                        value={formData.email}
                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-white/5 border border-white/10 focus:border-[#06B6D4] text-white rounded-xl px-4 py-3 text-sm transition-colors outline-none focus:ring-1 focus:ring-cyan/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">ORGANIZATION_DOMAIN</label>
                      <input
                        type="text"
                        placeholder="e.g. readcorp.com"
                        value={formData.domain}
                        onChange={e => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                        className="bg-white/5 border border-white/10 focus:border-[#06B6D4] text-white rounded-xl px-4 py-3 text-sm transition-colors outline-none focus:ring-1 focus:ring-cyan/20"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">MISSION_PARAMETERS_SCALE</label>
                      <select
                        value={formData.scale}
                        onChange={e => setFormData(prev => ({ ...prev, scale: e.target.value }))}
                        className="bg-white/5 border border-white/10 focus:border-[#06B6D4] text-white rounded-xl px-4 py-3 text-sm transition-colors outline-none focus:ring-1 focus:ring-cyan/20 cursor-pointer"
                      >
                        <option value="Enterprise Web Platform" className="bg-[#020617]">Enterprise Web Platform</option>
                        <option value="AI & Machine Learning App" className="bg-[#020617]">AI & Machine Learning App</option>
                        <option value="Mobile App Infrastructure" className="bg-[#020617]">Mobile App Infrastructure</option>
                        <option value="Legacy Stack Modernization" className="bg-[#020617]">Legacy Stack Modernization</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">MISSION_BRIEF (MESSAGE)</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Brief your project objective, technical constraints, or outcomes required..."
                      value={formData.brief}
                      onChange={e => setFormData(prev => ({ ...prev, brief: e.target.value }))}
                      className="bg-white/5 border border-white/10 focus:border-[#06B6D4] text-white rounded-xl px-4 py-3 text-sm transition-colors outline-none focus:ring-1 focus:ring-cyan/20 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-2 bg-gradient-to-r from-cyan to-purple-600 hover:from-cyan/90 hover:to-purple-600/90 text-slate-950 font-sans font-extrabold py-3.5 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer shadow-lg group shadow-cyan/10 text-xs tracking-wider uppercase"
                    id="btn-execute-send"
                  >
                    <span>Execute Message Dispatch</span>
                    <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </form>
              )}

              {/* Secure compiling sequence logs feedback */}
              {formStatus === 'COMPILING' && (
                <div className="p-8 flex flex-col gap-6 min-h-[380px] justify-center font-mono text-xs text-slate-500" id="form-compiling-panel">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan animate-ping" />
                    <span className="text-cyan font-bold tracking-widest text-[10px]">COMPILING SECURE DISPATCH PAYLOAD...</span>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2.5" id="compiling-logs-list">
                    {systemLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-slate-700">&gt;</span>
                        <span className="text-slate-400 break-all leading-normal">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Success Transmission Screen */}
              {formStatus === 'SUCCESS' && (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-6 min-h-[380px]" id="form-success-panel">
                  <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-sans font-extrabold uppercase text-white tracking-tight text-lg mb-1">Transmission Acquired</h3>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                      Coordinates logged successfully. Your mission brief has been routed directly to the Brampton HQ secure routing database. An engineer will respond in sync.
                    </p>
                  </div>
                  <button
                    onClick={resetForm}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-mono text-[10px] px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                    id="btn-re-engage"
                  >
                    RE_ENGAGE_TERMINAL
                  </button>
                </div>
              )}

              {/* Collapsible Connection Mapping Config */}
              <div className="mt-6 border-t border-white/10 pt-4" id="google-form-config-box">
                <button
                  type="button"
                  onClick={() => setShowMappingConfig(!showMappingConfig)}
                  className="text-[10px] font-mono text-cyan hover:text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
                  id="btn-toggle-config"
                >
                  <span>{showMappingConfig ? '▼ Hide' : '▶ Show'} Portal Tunnel Config</span>
                </button>
                
                {showMappingConfig && (
                  <div className="mt-4 p-4 rounded-2xl bg-[#020617]/80 border border-white/10 flex flex-col gap-4 font-mono text-[10px] text-slate-400" id="google-form-config-panel">
                    <div className="text-white font-bold border-b border-white/10 pb-1.5 flex items-center justify-between">
                      <span>GOOGLE_FORM_TUNING_PARAMETERS</span>
                      <span className="text-[9px] text-[#06B6D4] font-light">PERSIST_LOCAL</span>
                    </div>

                    {/* Automatic Link/HTML Parser Box */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2" id="auto-parser-box">
                      <div className="flex items-center justify-between">
                        <span className="text-cyan font-bold uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-cyan" />
                          ⚡ Instant Auto-Map Tunnel
                        </span>
                        {parseStatus === 'SUCCESS' && (
                          <span className="text-emerald-400 text-[9px] uppercase font-bold animate-pulse">✓ MAP ACQUIRED</span>
                        )}
                        {parseStatus === 'ERROR' && (
                          <span className="text-red-400 text-[9px] uppercase font-bold animate-pulse">✗ PARSE FAILED</span>
                        )}
                      </div>
                      
                      <p className="text-[9px] text-slate-500 leading-normal">
                        Generate a <strong className="text-slate-300">"Pre-filled link"</strong> in Google Forms, or copy your public form's <strong className="text-slate-300">HTML Source code</strong>, and paste it below. We will auto-extract and map everything instantly!
                      </p>

                      <div className="flex gap-2">
                        <textarea
                          placeholder="Paste Pre-filled link (e.g. viewform?entry.123=Name&...) or Page HTML Source..."
                          value={autoPasteText}
                          onChange={e => setAutoPasteText(e.target.value)}
                          rows={2}
                          className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-2.5 py-2 text-white text-[10px] outline-none focus:border-cyan resize-none leading-relaxed"
                          id="auto-parse-textarea"
                        />
                        <button
                          type="button"
                          onClick={() => handleAutoParse(autoPasteText)}
                          className="bg-cyan hover:bg-cyan/90 text-slate-950 font-sans font-black uppercase text-[10px] px-3.5 rounded-lg flex items-center justify-center transition-all cursor-pointer select-none"
                          id="btn-auto-parse"
                        >
                          Map
                        </button>
                      </div>
                    </div>

                    {/* Live Parsed Parameters Interactive Section */}
                    {parsedParams.length > 0 && (
                      <div className="bg-cyan/5 border border-cyan/20 rounded-xl p-3.5 flex flex-col gap-2.5" id="interactive-parsed-params">
                        <span className="text-cyan font-bold uppercase text-[9px] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan" />
                          Parsed Form Fields (Click to Assign)
                        </span>
                        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                          {parsedParams.map((param, index) => {
                            const isAssignedToName = mapping.nameId === param.id;
                            const isAssignedToEmail = mapping.emailId === param.id;
                            const isAssignedToDomain = mapping.domainId === param.id;
                            const isAssignedToScale = mapping.scaleId === param.id;
                            const isAssignedToBrief = mapping.briefId === param.id;
                            
                            const assignmentLabel = isAssignedToName ? 'NAME'
                              : isAssignedToEmail ? 'EMAIL'
                              : isAssignedToDomain ? 'DOMAIN'
                              : isAssignedToScale ? 'SCALE'
                              : isAssignedToBrief ? 'BRIEF'
                              : 'UNASSIGNED';

                            return (
                              <div key={`${param.id}-${index}`} className="flex flex-col gap-1.5 p-2 bg-slate-950/60 rounded-lg border border-white/5">
                                <div className="flex items-center justify-between text-[9px]">
                                  <span className="font-mono text-white font-bold">{param.id}</span>
                                  <span className={`px-1.5 py-0.5 rounded font-bold text-[8px] ${
                                    assignmentLabel !== 'UNASSIGNED' ? 'bg-cyan text-slate-950 font-sans' : 'bg-slate-800 text-slate-500'
                                  }`}>
                                    {assignmentLabel}
                                  </span>
                                </div>
                                <div className="text-[9px] text-slate-400 flex items-center gap-1">
                                  <span className="text-slate-500">Prefilled value:</span>
                                  <code className="text-amber-400 font-bold font-mono">"{param.val}"</code>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <button
                                    type="button"
                                    onClick={() => setMapping(prev => ({ ...prev, nameId: param.id }))}
                                    className={`px-1.5 py-0.5 rounded text-[8px] font-sans font-bold cursor-pointer transition-colors ${
                                      isAssignedToName ? 'bg-cyan text-slate-950' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                                    }`}
                                  >
                                    Name
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setMapping(prev => ({ ...prev, emailId: param.id }))}
                                    className={`px-1.5 py-0.5 rounded text-[8px] font-sans font-bold cursor-pointer transition-colors ${
                                      isAssignedToEmail ? 'bg-cyan text-slate-950' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                                    }`}
                                  >
                                    Email
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setMapping(prev => ({ ...prev, domainId: param.id }))}
                                    className={`px-1.5 py-0.5 rounded text-[8px] font-sans font-bold cursor-pointer transition-colors ${
                                      isAssignedToDomain ? 'bg-cyan text-slate-950' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                                    }`}
                                  >
                                    Domain
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setMapping(prev => ({ ...prev, scaleId: param.id }))}
                                    className={`px-1.5 py-0.5 rounded text-[8px] font-sans font-bold cursor-pointer transition-colors ${
                                      isAssignedToScale ? 'bg-cyan text-slate-950' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                                    }`}
                                  >
                                    Scale
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setMapping(prev => ({ ...prev, briefId: param.id }))}
                                    className={`px-1.5 py-0.5 rounded text-[8px] font-sans font-bold cursor-pointer transition-colors ${
                                      isAssignedToBrief ? 'bg-cyan text-slate-950' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                                    }`}
                                  >
                                    Brief
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500 font-bold">FORM_RESPONSE_URL</span>
                      <input
                        type="text"
                        value={mapping.formUrl}
                        onChange={e => setMapping(prev => ({ ...prev, formUrl: e.target.value }))}
                        className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[10px] outline-none focus:border-cyan"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 font-bold">NAME_FIELD_ID</span>
                        <input
                          type="text"
                          value={mapping.nameId}
                          onChange={e => setMapping(prev => ({ ...prev, nameId: e.target.value }))}
                          className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[10px] outline-none focus:border-cyan"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 font-bold">EMAIL_FIELD_ID</span>
                        <input
                          type="text"
                          value={mapping.emailId}
                          onChange={e => setMapping(prev => ({ ...prev, emailId: e.target.value }))}
                          className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[10px] outline-none focus:border-cyan"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 font-bold">DOMAIN_FIELD_ID</span>
                        <input
                          type="text"
                          value={mapping.domainId}
                          onChange={e => setMapping(prev => ({ ...prev, domainId: e.target.value }))}
                          className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[10px] outline-none focus:border-cyan"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 font-bold">SCALE_FIELD_ID</span>
                        <input
                          type="text"
                          value={mapping.scaleId}
                          onChange={e => setMapping(prev => ({ ...prev, scaleId: e.target.value }))}
                          className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[10px] outline-none focus:border-cyan"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-slate-500 font-bold">BRIEF_FIELD_ID</span>
                      <input
                        type="text"
                        value={mapping.briefId}
                        onChange={e => setMapping(prev => ({ ...prev, briefId: e.target.value }))}
                        className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[10px] outline-none focus:border-cyan"
                      />
                    </div>

                    <div className="text-[10px] text-slate-400 mt-2 bg-slate-950/80 p-3.5 rounded-xl leading-relaxed border border-amber-500/10 flex flex-col gap-2">
                      <div>
                        <span className="text-amber-400 font-bold uppercase">⚠️ Why are submissions blank?</span>
                        <p className="mt-1 text-slate-400">
                          Your Google Form has unique field IDs (e.g. <code className="text-cyan">entry.123456789</code>) which are different from other forms. If the IDs configured below do not match your form's fields, Google Forms registers the submission but leaves all fields blank.
                        </p>
                      </div>
                      <div className="mt-1 border-t border-white/5 pt-2">
                        <span className="text-cyan font-bold uppercase">🔧 How to get your prefilled link in 15 seconds:</span>
                        <ol className="list-decimal list-inside space-y-1.5 mt-1.5 text-slate-400">
                          <li>Open your Google Form in editor mode.</li>
                          <li>Click the <strong className="text-white">Three Dots (More)</strong> button in the top-right next to Send.</li>
                          <li>Click <strong className="text-cyan font-mono">Get pre-filled link</strong>.</li>
                          <li>Fill in dummy text like <code className="text-white">Name</code>, <code className="text-white">Email</code>, <code className="text-white">Domain</code>, <code className="text-white">Scale</code>, <code className="text-white">Brief</code>.</li>
                          <li>Click <strong className="text-cyan font-mono">Get link</strong> at the bottom, click <strong className="text-white">Copy link</strong>, and paste it into the "Instant Auto-Map Tunnel" box above!</li>
                        </ol>
                        <p className="mt-2 text-[9px] text-slate-500">
                          The configurations you enter here will persist locally in your browser's local storage.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Tactical Sonar Map Column */}
          <div className="lg:col-span-6 flex flex-col gap-6 h-full" id="map-column">
            <div>
              <span className="text-[10px] font-mono tracking-[0.2em] text-slate-500 uppercase font-bold">Physical Node</span>
              <h2 className="text-3xl md:text-5xl font-sans text-white mt-3 mb-6 font-black tracking-tighter uppercase leading-[1.05]">Headquarters</h2>
              <p className="text-slate-400 text-base font-light leading-relaxed mb-8">
                Operating physically from the Greater Toronto Area (Ontario, Canada). Drop by our central coordination node to align systems in-person.
              </p>
            </div>

            {/* Tactical Radar Map Card */}
            <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl flex flex-col group/map bg-dot-pattern" id="map-card">
              <canvas ref={mapCanvasRef} className="w-full h-[360px] bg-transparent block" id="canvas-tactical-map" />

              {/* Floating coordinates tag overlay */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-20 font-mono text-xs text-slate-300 bg-[#020617]/95 border border-white/15 p-5 rounded-2xl flex flex-col gap-2.5 shadow-2xl pointer-events-none" id="address-overlay-card">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <MapPin className="w-4.5 h-4.5 text-[#06B6D4] animate-pulse" />
                  <span className="text-white font-black tracking-widest uppercase text-[10px]">COORDS_LOCK // BRAMPTON_HQ</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-sm md:text-base text-white font-bold tracking-tight">50 Sunny Meadow Blvd, Suite 308</div>
                  <div className="text-xs md:text-sm text-[#06B6D4] font-medium tracking-wide">Brampton, ON, L6R 0Y7, Canada</div>
                </div>
              </div>
            </div>

            {/* Contact Details HUD rail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2" id="contact-details-grid">
              <a href="mailto:info@nucleussoft.ca" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl p-5 flex items-center gap-4 transition-all duration-300 group shadow-md cursor-pointer">
                <div className="w-10 h-10 bg-cyan/5 border border-white/10 text-cyan rounded-xl flex items-center justify-center shrink-0 group-hover:bg-cyan/10">
                  <Mail className="w-5 h-5 text-[#06B6D4]" />
                </div>
                <div>
                  <span className="block font-mono text-[8px] text-slate-500 font-bold uppercase">SECURE_MAIL</span>
                  <span className="text-slate-300 text-xs font-semibold group-hover:text-white">info@nucleussoft.ca</span>
                </div>
              </a>

              <a href="tel:+14169000000" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl p-5 flex items-center gap-4 transition-all duration-300 group shadow-md cursor-pointer">
                <div className="w-10 h-10 bg-purple-500/5 border border-white/10 text-purple-400 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-purple-500/10">
                  <Phone className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <span className="block font-mono text-[8px] text-slate-500 font-bold uppercase">VOICE_CHANNEL</span>
                  <span className="text-slate-300 text-xs font-semibold group-hover:text-white">+1 (416) 555-0199</span>
                </div>
              </a>
            </div>
          </div>

        </div>

        {/* Traditional Corporate Copyright & Compliance bottom line */}
        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500" id="footer-bottom-info">
          <div>
            Nucleus Software Technologies © 2024 - 2026. Toronto, ON, Canada. All mission systems secured.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-slate-300 cursor-pointer">PRIVACY_POLICY</span>
            <span className="hover:text-slate-300 cursor-pointer">SYSTEMS_AGREEMENT</span>
            <span className="hover:text-slate-300 cursor-pointer">SECURITY_COMPLIANCE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
