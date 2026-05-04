"use client";

import { useState, useRef, useEffect } from "react";
import { ExternalLink, X, CheckCircle2, Lock } from "lucide-react";
import gsap from "gsap";
import { useAuth } from "@/lib/auth-context";
import { PremiumPurchaseModal } from "@/components/premium-purchase-modal";
import { NODES, EDGES, DIFF_COLORS, TopicNode } from "./dsa-data";

export default function DsaRoadmap() {
  const [selectedNode, setSelectedNode] = useState<TopicNode | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  useEffect(() => {
    if (user?.email) {
      fetch("/api/user/sync").then(r => r.json()).then(d => setIsPremium(d.isPremium)).catch(() => {});
    }
  }, [user]);

  const totalProblems = NODES.reduce((a, n) => a + n.problems.length, 0);
  const solvedCount = completed.size;
  const easy = NODES.flatMap(n => n.problems).filter(p => p.difficulty === "Easy").length;
  const med = NODES.flatMap(n => n.problems).filter(p => p.difficulty === "Medium").length;
  const hard = NODES.flatMap(n => n.problems).filter(p => p.difficulty === "Hard").length;

  useEffect(() => {
    const measure = () => {
      if (!treeContainerRef.current) return;
      const container = treeContainerRef.current.getBoundingClientRect();
      const newLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
      EDGES.forEach(edge => {
        const fromEl = nodeRefs.current[edge.from];
        const toEl = nodeRefs.current[edge.to];
        if (!fromEl || !toEl) return;
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        newLines.push({
          x1: fromRect.left + fromRect.width / 2 - container.left,
          y1: fromRect.top + fromRect.height - container.top,
          x2: toRect.left + toRect.width / 2 - container.left,
          y2: toRect.top - container.top,
        });
      });
      setLines(newLines);
    };
    const timeout = setTimeout(measure, 100);
    window.addEventListener("resize", measure);
    return () => { clearTimeout(timeout); window.removeEventListener("resize", measure); };
  }, []);

  useEffect(() => {
    if (selectedNode && panelRef.current) {
      gsap.fromTo(panelRef.current, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" });
    }
  }, [selectedNode]);

  const toggleProblem = (key: string) => {
    setCompleted(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };

  const ROW_HEIGHT = 75;
  const PADDING_TOP = 20;

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative w-full max-w-[100vw] overflow-x-hidden">
      <PremiumPurchaseModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex gap-4 text-xs sm:text-sm">
            <span className="text-green-400">Easy <span className="text-white/70">{easy}</span></span>
            <span className="text-yellow-400">Med <span className="text-white/70">{med}</span></span>
            <span className="text-red-400">Hard <span className="text-white/70">{hard}</span></span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-white">{solvedCount}</span>
            <span className="text-white/40">/{totalProblems}</span>
            <span className="text-xs text-white/40 ml-1">Solved</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <div ref={treeContainerRef} className="min-w-[640px] relative" style={{ height: `${PADDING_TOP + 8 * ROW_HEIGHT + 30}px` }}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              {lines.map((line, i) => {
                const midY = (line.y1 + line.y2) / 2;
                return (
                  <path key={i}
                    d={`M ${line.x1} ${line.y1} C ${line.x1} ${midY}, ${line.x2} ${midY}, ${line.x2} ${line.y2}`}
                    fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                );
              })}
            </svg>
            {NODES.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const nodeSolved = node.problems.filter(p => completed.has(`${node.id}-${p.name}`)).length;
              const allDone = nodeSolved === node.problems.length && node.problems.length > 0;
              const isFreeNode = node.id === "arrays" || node.id === "two-pointers";
              const isLocked = !isFreeNode && !isPremium;

              return (
                <button key={node.id} ref={el => { nodeRefs.current[node.id] = el; }}
                  onClick={() => {
                    if (isLocked) {
                      setIsPremiumModalOpen(true);
                      return;
                    }
                    setSelectedNode(node);
                  }}
                  className={`absolute transform -translate-x-1/2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all hover:scale-110 border z-10 flex items-center gap-1.5 ${
                    isSelected ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] z-20"
                    : allDone ? "bg-green-600/80 border-green-400/50 text-white"
                    : isLocked ? "bg-[#1a1d2e] border-white/10 text-white/40 cursor-not-allowed"
                    : "bg-[#2a2d4a] border-white/20 text-white/90 hover:border-purple-400/50"
                  }`}
                  style={{ left: `${node.x}%`, top: `${PADDING_TOP + node.y * ROW_HEIGHT}px` }}>
                  {isLocked && <Lock className="w-3 h-3 text-white/30" />}
                  {node.label}
                  {allDone && <CheckCircle2 className="w-3 h-3 text-green-300" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedNode && (
        <div ref={panelRef} className="w-full lg:w-[420px] shrink-0 bg-[#1a1d2e] border border-white/10 rounded-2xl overflow-hidden lg:sticky lg:top-4 self-start max-h-[80vh] flex flex-col">
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">{selectedNode.label}</h3>
              <p className="text-xs text-white/40">{selectedNode.problems.filter(p => completed.has(`${selectedNode.id}-${p.name}`)).length} / {selectedNode.problems.length} solved</p>
            </div>
            <button onClick={() => setSelectedNode(null)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20"><X className="w-4 h-4 text-white/60" /></button>
          </div>
          <div className="px-4 sm:px-5 py-3 border-b border-white/10">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${(selectedNode.problems.filter(p => completed.has(`${selectedNode.id}-${p.name}`)).length / selectedNode.problems.length) * 100}%` }} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full">
              <thead><tr className="text-xs text-white/40 border-b border-white/10"><th className="text-left py-2 px-4 w-10">✓</th><th className="text-left py-2">Problem</th><th className="text-right py-2 px-4">Difficulty</th></tr></thead>
              <tbody>
                {selectedNode.problems.map((problem) => {
                  const key = `${selectedNode.id}-${problem.name}`;
                  const isDone = completed.has(key);
                  return (
                    <tr key={problem.name} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${isDone ? "bg-green-500/5" : ""}`}>
                      <td className="px-4 py-3"><button onClick={() => toggleProblem(key)} className="hover:scale-110 transition-transform">{isDone ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <div className="w-4 h-4 rounded border border-white/20" />}</button></td>
                      <td className="py-3 pr-2"><a href={problem.url} target="_blank" rel="noopener noreferrer" className={`text-sm hover:text-purple-400 transition-colors inline-flex items-center gap-1.5 ${isDone ? "text-white/50 line-through" : "text-white"}`}>{problem.name}<ExternalLink className="w-3 h-3 text-white/30" /></a></td>
                      <td className={`text-right px-4 py-3 text-xs font-medium ${DIFF_COLORS[problem.difficulty]}`}>{problem.difficulty}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
