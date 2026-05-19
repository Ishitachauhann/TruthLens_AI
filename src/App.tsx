/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import { 
  Camera, 
  Upload, 
  AlertCircle, 
  RefreshCcw, 
  Share2, 
  ShieldAlert, 
  Terminal, 
  Radio,
  FileText,
  Clock,
  MessageSquare,
  Network,
  Download,
  X,
  ChevronRight
} from 'lucide-react';
import { cn, resizeImage } from './lib/utils.ts';
import { 
  checkImageSafety, 
  generateConspiracy, 
  ConspiracyTheory 
} from './services/geminiService.ts';
import { CRTOverlay, GlitchHeader, RedactedText } from './components/VisualEffects.tsx';
import { EvidenceBoard, ThreatMeter } from './components/ConspiracyAssets.tsx';

type AppState = 'LANDING' | 'UPLOADING' | 'PROCESSING' | 'RESULTS' | 'ERROR';

const DEMO_IMAGES = [
  { name: 'Coffee Mug', url: 'https://picsum.photos/id/429/400/400' },
  { name: 'Office Chair', url: 'https://picsum.photos/id/1060/400/400' },
  { name: 'Street Sign', url: 'https://picsum.photos/id/230/400/400' },
];

export default function App() {
  const [state, setState] = useState<AppState>('LANDING');
  const [image, setImage] = useState<string | null>(null);
  const [theory, setTheory] = useState<ConspiracyTheory | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isWorseLoading, setIsWorseLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    "DECODING METADATA...",
    "CHECKING SATELLITE ARCHIVES...",
    "SEARCHING HIDDEN FORUMS...",
    "CONSULTING ANONYMOUS SOURCES...",
    "CROSS-REFERENCING LEAKED BLUEPRINTS...",
    "FINALIZING INVESTIGATION REPORT..."
  ];

  const DAILY_THREATS = [
    { name: 'Garden Hose', level: 'CATASTROPHIC' },
    { name: 'Rubber Duck', level: 'REALITY DISTORTION' },
    { name: 'Toaster', level: 'HIGHLY SUSPICIOUS' }
  ];

  const handleFileUpload = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawBase64 = e.target?.result as string;
      
      setImage(rawBase64);
      setState('PROCESSING');
      setLoadingStep(0);
      
      try {
        // Resize image first to avoid network issues with huge blobs
        const resizedBase64 = await resizeImage(rawBase64, 1024, 1024);
        const base64Data = resizedBase64.split(',')[1];
        
        // Start a slow mock progress that we'll manually advance or end
        const progressInterval = setInterval(() => {
          setLoadingStep(prev => prev < loadingSteps.length - 1 ? prev + 1 : prev);
        }, 1500);

        // Step 1: Safety Check
        const safety = await checkImageSafety(base64Data);
        if (!safety.safe) {
          clearInterval(progressInterval);
          setErrorMsg(safety.reason || "Image rejected by moderation safety protocols.");
          setState('ERROR');
          return;
        }

        // Step 2: Generation
        const result = await generateConspiracy(base64Data);
        
        clearInterval(progressInterval);
        setTheory(result);
        setState('RESULTS');
      } catch (err) {
        console.error(err);
        setErrorMsg("The system was unable to decrypt the hidden narrative. Protocol failure.");
        setState('ERROR');
      }
    };
    reader.readAsDataURL(file);
  }, [loadingSteps]);

  const generateWorseTheory = async () => {
    if (!image || !theory) return;
    setIsWorseLoading(true);
    try {
      // Use resizing for the worse theory too
      const resizedBase64 = await resizeImage(image, 1024, 1024);
      const base64Data = resizedBase64.split(',')[1];
      
      const result = await generateConspiracy(base64Data, theory.summary);
      setTheory(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to deepen the investigation. The signal was lost.");
      setState('ERROR');
    } finally {
      setIsWorseLoading(false);
    }
  };

  const addComment = () => {
    if (!newComment.trim() || !theory) return;
    const comment = {
      username: 'Anonymous_' + Math.floor(Math.random() * 1000),
      text: newComment,
      upvotes: '1',
      timestamp: 'Just now'
    };
    setTheory({
      ...theory,
      redditComments: [comment, ...theory.redditComments]
    });
    setNewComment('');
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) handleFileUpload(acceptedFiles[0]);
  }, [handleFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop: (files: File[]) => {
      if (files[0]) handleFileUpload(files[0]);
    }, 
    accept: { 'image/*': ['.jpeg', '.png', '.jpg'] },
    multiple: false
  } as any);

  const reset = () => {
    setState('LANDING');
    setImage(null);
    setTheory(null);
    setErrorMsg(null);
  };

  const [showShareToast, setShowShareToast] = useState(false);

  const handleShare = async () => {
    if (!theory) return;
    const shareData = {
      title: theory.title,
      text: `${theory.shareableHeadline} - Exposed by ConspirAI`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${theory.shareableHeadline} - ${window.location.href}`);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      } catch (err) {
        console.error('Clipboard failed', err);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-hacker-green selection:text-black">
      <CRTOverlay />
      
      <AnimatePresence mode="wait">
        {state === 'LANDING' && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] font-mono text-hacker-green opacity-40">
              <Radio size={12} className="animate-pulse" />
              ENCRYPTED_CONNECTION_ESTABLISHED
            </div>

            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="space-y-6 max-w-2xl"
            >
              <GlitchHeader className="text-5xl md:text-8xl">
                TruthLens_AI
              </GlitchHeader>
              <p className="text-gray-400 font-mono tracking-widest uppercase text-xs md:text-sm">
                Every ordinary object hides a deep-state secret.
              </p>
              
              <div 
                {...getRootProps()} 
                className={cn(
                  "mt-12 p-12 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300",
                  isDragActive ? "border-hacker-green bg-hacker-green/10 scale-105" : "border-hacker-dim hover:border-hacker-green hover:bg-hacker-green/5"
                )}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-hacker-dim rounded-full">
                    <Camera size={32} className="text-hacker-green" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-lg">SCAN OBJECT</p>
                    <p className="text-sm opacity-50 font-mono">Upload to start investigation</p>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <p className="text-[10px] font-mono uppercase opacity-30 mb-4 tracking-tighter">Known Evidence Files</p>
                <div className="flex justify-center gap-4">
                  {DEMO_IMAGES.map((img) => (
                    <button 
                      key={img.name}
                      onClick={() => {
                        setState('PROCESSING');
                        fetch(img.url)
                          .then(r => r.blob())
                          .then(b => {
                            const reader = new FileReader();
                            reader.onload = (e) => handleFileUpload(new File([b], "demo.jpg", { type: "image/jpeg" }));
                            reader.readAsDataURL(b);
                          })
                          .catch(() => {
                            setErrorMsg("The encrypted signal was blocked. Try uploading a manual file.");
                            setState('ERROR');
                          });
                      }}
                      className="group relative"
                    >
                      <img 
                        src={img.url} 
                        alt={img.name} 
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 object-cover rounded-lg border border-hacker-dim group-hover:border-hacker-green grayscale group-hover:grayscale-0 transition-all" 
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-12 border-t border-hacker-dim/30">
                <p className="text-[10px] font-mono uppercase text-conspiracy-red mb-4 animate-pulse">Global Threats of the Day</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {DAILY_THREATS.map((threat) => (
                    <div key={threat.name} className="p-3 bg-white/5 border border-white/10 rounded-xl text-left space-y-1">
                      <p className="text-xs font-bold text-white">{threat.name}</p>
                      <p className="text-[10px] font-mono text-conspiracy-red">{threat.level}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="absolute bottom-6 text-[8px] font-mono opacity-20 uppercase max-w-xs">
              System Disclaimer: All stories generated are fictional satire for entertainment. No actual deep-state assets were harmed.
            </div>
          </motion.div>
        )}

        {state === 'PROCESSING' && (
          <motion.div 
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 space-y-12"
          >
            <div className="relative">
              <div className="relative w-72 h-72 border-2 border-hacker-green/20 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,255,65,0.15)] bg-black/40">
                {image && <img src={image} className="w-full h-full object-cover opacity-60 blur-[1px]" />}
                <div className="absolute inset-0 bg-gradient-to-t from-hacker-bg to-transparent opacity-80" />
                
                {/* Radar sweep */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,255,65,0.2)_360deg)] pointer-events-none"
                />

                <motion.div 
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-1 bg-hacker-green shadow-[0_0_20px_#00ff41] z-10"
                />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-hacker-green border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
              
              {/* Corner brackets */}
              <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-hacker-green/40" />
              <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-hacker-green/40" />
              <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-hacker-green/40" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-hacker-green/40" />
            </div>
            
            <div className="space-y-6 text-center max-w-sm">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-3 text-hacker-green font-mono">
                  <Terminal size={16} className="animate-pulse" />
                  <span className="text-[10px] font-black tracking-[0.4em] uppercase">{loadingSteps[loadingStep]}</span>
                </div>
                <p className="text-[8px] font-mono opacity-30 uppercase tracking-[0.2em]">Bypassing Firewalls... [OK]</p>
              </div>

              <div className="w-64 mx-auto h-0.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                  className="h-full bg-hacker-green shadow-[0_0_10px_#00ff41]"
                />
              </div>
              
              <div className="font-mono text-[9px] text-gray-500 uppercase tracking-tighter flex flex-col gap-1">
                <span>Node: TOR_EXIT_ALPHA_88</span>
                <span>Latency: {Math.floor(Math.random() * 200)}ms</span>
                <span className="text-hacker-green/50 animate-pulse">Scanning Bio-Signatures...</span>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'RESULTS' && theory && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen p-4 md:p-8 space-y-12"
          >
            {/* Header Sticky */}
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <button onClick={reset} className="p-2 bg-hacker-dim hover:bg-hacker-green/20 rounded-lg text-gray-400 hover:text-hacker-green transition-colors">
                  <RefreshCcw size={20} />
                </button>
                <div className="px-3 py-1 bg-conspiracy-red/10 border border-conspiracy-red/50 rounded-full flex items-center gap-2">
                  <AlertCircle size={14} className="text-conspiracy-red" />
                  <span className="text-[10px] font-mono text-conspiracy-red uppercase">Classified Evidence #8271</span>
                </div>
                <button 
                  onClick={handleShare}
                  className="p-2 bg-hacker-green/10 border border-hacker-green/40 rounded-lg text-hacker-green hover:bg-hacker-green/20 transition-all"
                >
                  <Share2 size={20} />
                </button>
              </div>

              <div className="text-center space-y-8 py-10">
                <GlitchHeader className="text-4xl md:text-8xl px-4">
                  {theory.title}
                </GlitchHeader>
                <div className="max-w-md mx-auto">
                  <ThreatMeter level={theory.threatLevel} />
                </div>
                <div className="flex justify-center gap-4">
                   <button 
                    onClick={generateWorseTheory}
                    disabled={isWorseLoading}
                    className="px-6 py-3 bg-conspiracy-red/10 border border-conspiracy-red/40 rounded-full text-conspiracy-red text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-conspiracy-red/20 transition-all disabled:opacity-50"
                  >
                    {isWorseLoading ? "ESCALATING THEORY..." : "GENERATE WORSE THEORY"}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32">
              {/* Left Column: Dossier */}
              <div className="lg:col-span-2 space-y-8">
                <section className="bg-[#12161b] border border-white/5 rounded-2xl p-6 md:p-10 space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <FileText size={120} />
                  </div>
                  <div className="flex items-center gap-3 text-hacker-green mb-2 relative z-10">
                    <Terminal size={18} />
                    <h2 className="uppercase tracking-[0.3em] text-[10px] font-black">Archive_Dossier_402.pdf</h2>
                  </div>
                  <div className="text-gray-300 leading-relaxed font-display text-lg md:text-2xl space-y-6 relative z-10">
                    {theory.summary.split('\n\n').map((para, i) => (
                      <p key={i} className="first-letter:text-5xl first-letter:font-black first-letter:text-hacker-green first-letter:mr-2 first-letter:float-left first-letter:leading-none">{para}</p>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-hacker-green">
                      <Network size={20} />
                      <h2 className="uppercase tracking-[0.2em] text-xs font-bold">Relational Evidence Board</h2>
                    </div>
                    <span className="text-[8px] font-mono opacity-30">UUID: {Math.random().toString(36).substring(7)}</span>
                  </div>
                  <EvidenceBoard nodes={theory.evidenceBoard.nodes} links={theory.evidenceBoard.links} />
                </section>

                <section className="bg-black/60 border border-hacker-dim/30 rounded-2xl p-6 md:p-8">
                  <div className="flex items-center gap-3 text-conspiracy-red mb-6 border-b border-conspiracy-red/20 pb-4">
                    <Radio size={20} className="animate-pulse" />
                    <h2 className="uppercase tracking-[0.2em] text-xs font-bold font-display">Documentary Script (Intercepted)</h2>
                  </div>
                  <div className="font-mono text-xs md:text-sm text-gray-400 leading-relaxed bg-black/40 p-6 rounded-lg border border-white/5 italic">
                    <div className="text-conspiracy-red mb-6 text-[10px] font-bold p-2 bg-conspiracy-red/5 border border-conspiracy-red/20 rounded inline-block">
                      WARNING: VOICEOVER LOGS RECOVERED FROM DEEP-WEB SERVERS
                    </div>
                    {theory.narrationScript}
                  </div>
                </section>
              </div>

              {/* Right Column: Feeds */}
              <div className="space-y-8">
                <section className="bg-[#1a1111] border border-conspiracy-red/20 rounded-2xl p-6 shadow-xl relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-conspiracy-red/30" />
                  <div className="flex items-center gap-3 text-conspiracy-red mb-4">
                    <ShieldAlert size={20} />
                    <h2 className="uppercase tracking-widest text-xs font-bold">Classified Intel</h2>
                  </div>
                  <div className="p-4 rounded border border-conspiracy-red/10 text-xs font-mono leading-relaxed text-gray-400 bg-black/40">
                    <div className="mb-4 border-b border-conspiracy-red/20 pb-2 flex justify-between opacity-50">
                      <span>SEC_LVL_9</span>
                      <span>EYES_ONLY</span>
                    </div>
                    <RedactedText text={theory.classifiedReport} />
                  </div>
                </section>

                <section className="space-y-4">
                   <div className="flex items-center gap-3 text-hacker-green opacity-80 mb-2">
                    <Clock size={18} />
                    <h2 className="uppercase tracking-widest text-[10px] font-black">Anomaly_Log</h2>
                  </div>
                  <div className="space-y-4 relative">
                    <div className="absolute left-[15px] top-2 bottom-2 w-px bg-hacker-green/10" />
                    {theory.timeline.map((event, i) => (
                      <div key={i} className="flex gap-4 items-start relative z-10">
                        <div className="w-8 h-8 rounded-full bg-hacker-bg border border-hacker-green/30 flex items-center justify-center shrink-0 text-[8px] font-mono text-hacker-green group-hover:bg-hacker-green transition-colors">
                          {event.year}
                        </div>
                        <div className="flex-1 p-4 bg-hacker-dim/10 border border-hacker-dim/30 rounded-xl text-[11px] leading-relaxed text-gray-400 hover:text-gray-200 transition-colors">
                          {event.event}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                   <div className="flex items-center gap-3 text-[#ff4500]">
                    <MessageSquare size={18} />
                    <h2 className="uppercase tracking-widest text-[10px] font-black">Social_Leak_Feed</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Intercepted leak..."
                        className="flex-1 bg-black/50 border border-hacker-dim/30 rounded-xl px-4 py-2.5 text-xs font-mono text-hacker-green placeholder:opacity-20 focus:border-hacker-green/50 outline-none transition-all"
                      />
                      <button 
                        onClick={addComment}
                        className="p-2.5 bg-hacker-green/10 border border-hacker-green/30 rounded-xl text-hacker-green hover:bg-hacker-green/20"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                    {theory.redditComments.map((comment, i) => (
                      <div key={i} className="bg-white/5 p-5 rounded-2xl space-y-3 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex justify-between items-center text-[9px] font-mono">
                          <span className="text-hacker-green opacity-80 px-2 py-0.5 bg-hacker-green/5 rounded">u/{comment.username}</span>
                          <span className="opacity-30">{comment.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed italic">"{comment.text}"</p>
                        <div className="text-[8px] font-bold opacity-40 flex items-center gap-2">
                          <Download size={10} className="rotate-180" /> 
                          <span className="tracking-widest">{comment.upvotes} UPVOTES_RECORDED</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
            
            {/* Viral Share Banner */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xl z-50">
               <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="bg-hacker-green p-[2px] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                <div className="bg-[#0d1117] rounded-[14px] p-6 flex items-center gap-6">
                  <div className="w-20 h-20 bg-hacker-dim rounded-xl flex-shrink-0 overflow-hidden border border-hacker-green/20">
                     {image && <img src={image} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[10px] font-mono text-hacker-green uppercase tracking-widest">Share Investigation</p>
                    <p className="font-bold text-lg leading-tight line-clamp-2">{theory.shareableHeadline}</p>
                  </div>
                  <button 
                    onClick={handleShare}
                    className="bg-hacker-green text-black p-3 rounded-xl hover:scale-105 active:scale-95 transition-transform"
                  >
                    <Share2 size={24} />
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {state === 'ERROR' && (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6"
          >
             <div className="p-6 bg-conspiracy-red/10 border border-conspiracy-red rounded-full">
              <ShieldAlert size={48} className="text-conspiracy-red" />
            </div>
            <div className="space-y-2">
              <GlitchHeader className="text-3xl">PROTOCOL VIOLATION</GlitchHeader>
              <p className="text-conspiracy-red font-mono text-sm max-w-sm mx-auto">
                {errorMsg}
              </p>
            </div>
            <button 
              onClick={reset}
              className="px-8 py-3 bg-hacker-dim border border-hacker-green/30 text-hacker-green font-mono uppercase tracking-widest hover:bg-hacker-green/10 transition-colors flex items-center gap-2"
            >
              <RefreshCcw size={18} />
              Re-initialize
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-hacker-bg border border-hacker-green/30 p-8 rounded-3xl max-w-sm w-full space-y-6 relative"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
              
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                   <ShieldAlert size={40} className="text-hacker-green" />
                </div>
                <h3 className="text-xl font-bold">ACCESS RESTRICTED</h3>
                <p className="text-xs font-mono text-gray-500">Authentication required to archive evidence files in the cloud dossier.</p>
              </div>

              <div className="space-y-3">
                <button 
                   onClick={() => setShowAuthModal(false)}
                   className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                >
                  Continue with Google
                </button>
                <p className="text-[10px] text-center opacity-30 font-mono italic">All identities are encrypted via layer-7 proxy.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShareToast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[300] bg-hacker-green text-black px-6 py-2 rounded-full font-mono text-[10px] font-bold shadow-[0_0_20px_rgba(0,255,65,0.4)]"
          >
            EVIDENCE LINK COPIED TO SECURE CLIPBOARD
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="w-full py-12 border-t border-white/5 flex flex-col items-center gap-4 text-[10px] font-mono text-gray-500 relative z-[200]">
        <div className="flex items-center gap-2">
          <span></span>
          <span className="opacity-20"></span>
          <span>PROTOCOL: ALPHA-9</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p>
            Built By <a href="Ishita Chauhan" target="_blank" rel="noopener noreferrer" className="text-hacker-green hover:underline">Ishita Chauhan</a>
          </p>
         
        </div>
      </footer>

      <div className="fixed top-0 left-0 w-full h-[1px] bg-white opacity-[0.05] z-[101]" />
    </div>
  );
}

