import React from 'react';
import { motion } from 'motion/react';
import { EvidenceNode, EvidenceLink } from '../services/geminiService';
import { Share2, AlertTriangle, MessageSquare, Terminal, Map as MapIcon, Clock, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils.ts';

export const EvidenceBoard: React.FC<{ nodes: EvidenceNode[], links: EvidenceLink[] }> = ({ nodes, links }) => {
  // Generate random positions once with better spread
  const positions = React.useMemo(() => {
    return nodes.reduce((acc, node, idx) => {
      // Use more spread out logic
      const x = 5 + (idx * 27 + Math.random() * 20) % 85; 
      const y = 10 + (idx * 31 + Math.random() * 25) % 75;
      acc[node.id] = { x, y };
      return acc;
    }, {} as Record<string, { x: number, y: number }>);
  }, [nodes]);

  return (
    <div className="relative w-full aspect-video bg-[#08090a] border border-hacker-dim overflow-hidden rounded-xl shadow-2xl">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {links.map((link, idx) => {
          const from = positions[link.from];
          const to = positions[link.to];
          if (!from || !to) return null;
          
          return (
            <motion.line
              key={`link-${idx}`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ delay: 0.5 + idx * 0.1, duration: 1.5 }}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke="#ff3e3e"
              strokeWidth="2"
              strokeLinecap="round"
              className="drop-shadow-[0_0_3px_red]"
            />
          );
        })}
      </svg>

      <div className="relative h-full w-full p-8">
        {nodes.map((node, idx) => {
          const pos = positions[node.id];
          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              className={cn(
                "absolute z-10 p-2 bg-[#f4f4f4] text-black border-2 border-white/20 shadow-[5px_5px_15px_rgba(0,0,0,0.5)] cursor-default group hover:scale-105 transition-all",
                idx % 2 === 0 ? "rotate-[-3deg]" : "rotate-[2deg]"
              )}
              style={{
                top: `${pos.y}%`,
                left: `${pos.x}%`,
                maxWidth: '140px'
              }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center">
                 <div className="w-2 h-2 bg-red-600 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
              </div>
              
              <div className="text-[7px] uppercase font-mono opacity-60 mb-0.5 border-b border-black/10">{node.type}</div>
              <div className="text-[10px] font-black leading-tight tracking-tighter uppercase break-words">{node.label}</div>
              
              {/* Fake tape effect */}
              <div className="absolute -top-1 -right-2 w-6 h-2 bg-white/20 backdrop-blur-sm border border-white/10 rotate-[45deg]" />
            </motion.div>
          );
        })}
      </div>
      
      <div className="absolute top-4 left-4 flex flex-col gap-1">
        <div className="flex items-center gap-2 px-2 py-1 bg-black/60 rounded border border-white/5">
          <Terminal size={10} className="text-hacker-green" />
          <span className="text-[8px] font-mono text-hacker-green uppercase tracking-widest">RELATIONAL_ARRAY_ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export const ThreatMeter: React.FC<{ level: string }> = ({ level }) => {
  const levels = ['HARMLESS', 'SUSPICIOUS', 'HIGHLY SUSPICIOUS', 'REALITY DISTORTION'];
  const currentIndex = levels.indexOf(level);
  const colors = ['#22c55e', '#eab308', '#ef4444', '#7c3aed'];
  
  return (
    <div className="w-full bg-[#111] p-4 rounded-xl border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-conspiracy-red/10 rounded-lg">
             <AlertTriangle size={16} className="text-conspiracy-red" />
          </div>
          <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Stability Metric</span>
        </div>
        <motion.span 
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-xs font-black tracking-widest text-conspiracy-red"
        >
          {level}
        </motion.span>
      </div>
      
      <div className="flex gap-1 h-2">
        {levels.map((_, i) => (
          <div 
            key={i} 
            className="flex-1 rounded-sm overflow-hidden bg-white/5"
          >
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: i <= currentIndex ? 1 : 0 }}
              className="h-full origin-left"
              style={{ 
                backgroundColor: colors[i],
                boxShadow: i === currentIndex ? `0 0 15px ${colors[i]}` : 'none'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
