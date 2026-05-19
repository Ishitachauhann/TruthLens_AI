import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils.ts';

export const CRTOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_100%)] opacity-20" />
      <div className="scanline" />
      <div className="absolute inset-0 bg-black opacity-[0.01] crt-flicker" />
    </div>
  );
};

export const RedactedText: React.FC<{ text: string }> = ({ text }) => {
  // Simple regex to redact parts of the text randomly or specific keywords
  const parts = text.split(/(\[REDACTED\])/);
  return (
    <span>
      {parts.map((part, i) => (
        part === '[REDACTED]' ? (
          <span key={i} className="redacted inline-block px-1 mx-0.5 rounded-sm">REDACTED</span>
        ) : part
      ))}
    </span>
  );
};

export const GlitchHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <div className={cn("relative group block", className)}>
      <h1 className="relative z-10 glitch-text uppercase italic font-black text-white leading-[0.9] tracking-tighter">
        {children}
      </h1>
      <motion.div 
        animate={{ 
          x: [0, -1, 1, -1, 1, 0],
          y: [0, 1, -1, 0],
          opacity: [0.3, 0.1, 0.3, 0.2, 0.3]
        }}
        transition={{ repeat: Infinity, duration: 0.4 }}
        className="absolute inset-0 text-conspiracy-red/40 z-0 select-none pointer-events-none uppercase italic font-black leading-[0.9] tracking-tighter"
        aria-hidden="true"
      >
        {children}
      </motion.div>
    </div>
  );
};
