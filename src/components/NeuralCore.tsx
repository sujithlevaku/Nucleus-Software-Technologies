import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, RotateCcw, Activity } from 'lucide-react';

interface Node3D {
  x: number;
  y: number;
  z: number;
  px: number; // projected x
  py: number; // projected y
  radius: number;
  color: string;
  id: number;
  pulse: number;
  speed: number;
  name?: string;
}

interface Connection {
  from: Node3D;
  to: Node3D;
  dist: number;
}

interface Packet {
  fromId: number;
  toId: number;
  progress: number; // 0 to 1
  speed: number;
  color: string;
}

export default function NeuralCore() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activePacketsCount, setActivePacketsCount] = useState(0);
  const [coreSpeed, setCoreSpeed] = useState(1);
  
  // State for tracking mouse/drag interaction
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0, isDown: false });
  const rotationRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });

  const coreNodes = [
    "AI_CORE_01", "CLOUD_EDGE_08", "QUANTUM_SEC_03", "RAG_PIPELINE_09",
    "HYPER_COMPUTE_02", "ZERO_TRUST_04", "LOGISTICS_TMS_07", "COGNITIVE_MEM_05"
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;

    // Initialize 3D nodes
    const nodeCount = 90;
    const nodes: Node3D[] = [];
    
    // Golden spiral / Fibonacci sphere
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / nodeCount);
      const theta = Math.PI * (1 + 5 ** 0.5) * (i + 0.5);
      
      const r = 160; // sphere radius
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const isKeyNode = i % 11 === 0;
      const name = isKeyNode ? coreNodes[Math.floor(i / 11) % coreNodes.length] : undefined;

      nodes.push({
        x, y, z,
        px: 0, py: 0,
        radius: isKeyNode ? 5 : 2,
        color: isKeyNode ? '#06B6D4' : (i % 3 === 0 ? '#6D28D9' : '#EC4899'),
        id: i,
        pulse: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
        name
      });
    }

    // Active data packets
    let packets: Packet[] = [];

    // Resize handler
    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Mouse Interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current.px = mouseRef.current.x;
      mouseRef.current.py = mouseRef.current.y;
      mouseRef.current.x = x;
      mouseRef.current.y = y;

      if (mouseRef.current.isDown) {
        const dx = x - mouseRef.current.px;
        const dy = y - mouseRef.current.py;
        rotationRef.current.targetY += dx * 0.005;
        rotationRef.current.targetX -= dy * 0.005;
      }
    };

    const handleMouseDown = () => {
      mouseRef.current.isDown = true;
    };

    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth rotation interpolation
      rotationRef.current.x += (rotationRef.current.targetX - rotationRef.current.x) * 0.1;
      rotationRef.current.y += (rotationRef.current.targetY - rotationRef.current.y) * 0.1;

      // Auto-rotation when not dragging
      if (!mouseRef.current.isDown) {
        rotationRef.current.targetY += 0.002 * coreSpeed;
        rotationRef.current.targetX += 0.0005 * coreSpeed;
      }

      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);
      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);

      // Center coords
      const cx = width / 2;
      const cy = height / 2;

      // Project nodes in 3D
      nodes.forEach(node => {
        // Rotate around Y axis
        let x1 = node.x * cosY - node.z * sinY;
        let z1 = node.x * sinY + node.z * cosY;

        // Rotate around X axis
        let y2 = node.y * cosX - z1 * sinX;
        let z2 = node.y * sinX + z1 * cosX;

        // Perspective projection
        const fov = 350;
        const scale = fov / (fov + z2);
        
        node.px = cx + x1 * scale;
        node.py = cy + y2 * scale;
        node.pulse += node.speed * coreSpeed;

        // Add some organic micro-movement based on sin waves
        node.px += Math.sin(node.pulse) * 1.2;
        node.py += Math.cos(node.pulse) * 1.2;
      });

      // Calculate connections
      const connections: Connection[] = [];
      const threshold = 70;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          
          // 3D distance
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dz = n1.z - n2.z;
          const dist3d = Math.sqrt(dx*dx + dy*dy + dz*dz);

          if (dist3d < threshold) {
            connections.push({ from: n1, to: n2, dist: dist3d });
          }
        }
      }

      // Draw Connection lines with glowing opacity based on distance and depth
      connections.forEach(({ from, to, dist }) => {
        const opacity = (1 - dist / threshold) * 0.25;
        if (opacity <= 0) return;

        ctx.beginPath();
        ctx.moveTo(from.px, from.py);
        ctx.lineTo(to.px, to.py);
        
        // Dynamic gradient based on nodes colors
        const grad = ctx.createLinearGradient(from.px, from.py, to.px, to.py);
        grad.addColorStop(0, `${from.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
        grad.addColorStop(1, `${to.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Generate random packets along connections
      if (connections.length > 0 && packets.length < 25 && Math.random() < 0.08) {
        const conn = connections[Math.floor(Math.random() * connections.length)];
        packets.push({
          fromId: conn.from.id,
          toId: conn.to.id,
          progress: 0,
          speed: 0.015 + Math.random() * 0.02,
          color: conn.from.color === '#06B6D4' ? '#06B6D4' : (Math.random() > 0.5 ? '#EC4899' : '#6D28D9')
        });
      }

      // Update and draw Packets
      packets = packets.filter(packet => {
        packet.progress += packet.speed * coreSpeed;
        if (packet.progress >= 1) return false;

        const fromNode = nodes[packet.fromId];
        const toNode = nodes[packet.toId];
        
        if (fromNode && toNode) {
          const x = fromNode.px + (toNode.px - fromNode.px) * packet.progress;
          const y = fromNode.py + (toNode.py - fromNode.py) * packet.progress;
          
          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = packet.color;
          ctx.shadowColor = packet.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
        return true;
      });

      setActivePacketsCount(packets.length);

      // Draw Nodes
      let currentHovered: string | null = null;
      let minHoverDist = 18;

      nodes.forEach(node => {
        const sizeMultiplier = (node.name ? 1.5 : 1) + Math.sin(node.pulse) * 0.2;
        const size = node.radius * sizeMultiplier;

        // Mouse hover check
        const hx = mouseRef.current.x - node.px;
        const hy = mouseRef.current.y - node.py;
        const hdist = Math.sqrt(hx*hx + hy*hy);
        
        const isHovered = hdist < minHoverDist;
        if (isHovered && node.name) {
          currentHovered = node.name;
        }

        // Draw outer glow glow ring for key nodes
        if (node.name || isHovered) {
          ctx.beginPath();
          ctx.arc(node.px, node.py, size * (isHovered ? 2.5 : 1.8), 0, Math.PI * 2);
          ctx.strokeStyle = `${node.color}55`;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(node.px, node.py, size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.px, node.py, size, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = node.name ? 12 : 4;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow

        // Label for key nodes
        if (node.name) {
          ctx.fillStyle = '#94A3B8';
          ctx.font = '9px "JetBrains Mono"';
          ctx.textAlign = 'center';
          ctx.fillText(node.name, node.px, node.py - size - 8);
        }
      });

      setHoveredNode(currentHovered);
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mousedown', handleMouseDown);
      }
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [coreSpeed]);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center bg-slate-950/20 rounded-3xl border border-slate-900 overflow-hidden backdrop-blur-md shadow-2xl group" ref={containerRef} id="neural-core-container">
      {/* Interactive Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing" id="neural-core-canvas" />

      {/* Cyberpunk grid overlay background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0)_20%,rgba(2,6,23,0.85))] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

      {/* Sci-fi HUD Overlays */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none font-mono text-xs text-slate-400 flex flex-col gap-1.5 border-l-2 border-cyan bg-slate-900/60 p-3 rounded-r-lg backdrop-blur-sm shadow-md" id="hud-vitals">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan animate-ping" />
          <span className="text-white font-bold uppercase tracking-wider text-[10px]">Neural Core Engine</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1">LATENCY: <span className="text-cyan">1.2ms</span></div>
        <div className="text-[10px] text-slate-500">PACKETS: <span className="text-pink-500 font-bold">{activePacketsCount} FLOATING</span></div>
        <div className="text-[10px] text-slate-500">ROTATION: <span className="text-purple-400 font-bold">DYN_AUTO</span></div>
        {hoveredNode && (
          <div className="text-[10px] text-emerald-400 mt-2 font-bold flex items-center gap-1 border-t border-slate-800 pt-1.5">
            <Activity className="w-3 h-3 animate-pulse text-emerald-400" />
            LOCKED: {hoveredNode}
          </div>
        )}
      </div>

      <div className="absolute top-6 right-6 z-20 flex gap-2" id="hud-controls">
        <button
          onClick={() => setCoreSpeed(prev => prev === 0.2 ? 1 : prev === 1 ? 2.5 : 0.2)}
          className="bg-slate-900/80 hover:bg-slate-800 border border-slate-800 p-2 rounded-lg text-slate-400 hover:text-white transition-all pointer-events-auto flex items-center gap-2 text-xs font-mono group/btn shadow-md"
          title="Adjust Cycle Speed"
          id="btn-cycle-speed"
        >
          <Cpu className={`w-4 h-4 text-cyan ${coreSpeed > 1 ? 'animate-spin' : ''}`} />
          <span>CYC_SPD: {coreSpeed === 0.2 ? '0.2x' : coreSpeed === 1 ? '1.0x' : '2.5x'}</span>
        </button>
        <button
          onClick={() => {
            rotationRef.current.targetX = 0.5;
            rotationRef.current.targetY = 0.5;
            setCoreSpeed(1);
          }}
          className="bg-slate-900/80 hover:bg-slate-800 border border-slate-800 p-2 rounded-lg text-slate-400 hover:text-white transition-all pointer-events-auto shadow-md"
          title="Reset Core Alignment"
          id="btn-reset-core"
        >
          <RotateCcw className="w-4 h-4 text-pink-500 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      {/* Cybernetic Frame Elements */}
      <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between text-[10px] font-mono text-slate-500 pointer-events-none" id="hud-footer">
        <div className="flex gap-4">
          <span>SYS_VAL: SECURE</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">GRID_REF: 43.6532° N, 79.3832° W</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 border border-slate-900 rounded text-slate-400">
          <span className="text-[9px]">DRAG CORE TO ROTATE ORBIT</span>
        </div>
      </div>

      {/* Glowing atmospheric dust */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-cyan/10 rounded-full blur-3xl pointer-events-none mix-blend-screen animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen animate-pulse" />
    </div>
  );
}
