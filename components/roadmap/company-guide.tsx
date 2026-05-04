"use client";

import { useState, useRef, useEffect } from "react";
import { ExternalLink, X, CheckCircle2, Zap, Target, Lock, ChevronDown, BarChart3, BookOpen, GraduationCap, Lightbulb, ArrowRight, TrendingUp, Layers, Clock, FileText } from "lucide-react";
import gsap from "gsap";
import { useAuth } from "@/lib/auth-context";
import { PremiumPurchaseModal } from "@/components/premium-purchase-modal";
import CompanyLogo from "@/components/company-logo";

type PhaseNode = { id: string; label: string; x: number; y: number; prerequisites?: string[]; focus: string[]; leetcode?: { name: string; url: string }[]; tips: string[] };
type Edge = { from: string; to: string };
type CompanyPlan = { label: string; logo: string; color: string; insights: string[]; topics: string[]; nodes: PhaseNode[] };

const COMPANIES: Record<string, CompanyPlan> = {
  amazon: { label: "Amazon", logo: "https://logo.clearbit.com/amazon.com", color: "from-orange-500 to-yellow-600",
    insights: ["No behavioral Qs in PSG rounds", "Focus on project explanation", "2 rounds: OA + Technical"],
    topics: ["Arrays", "Sorting", "BFS", "Graph", "Stack", "Strings", "Prefix Sum"],
    nodes: [
      { id: "a-dsa", label: "DSA Foundation", x: 50, y: 0, focus: ["Arrays & Strings", "Stack & Queue", "Sorting", "Prefix Sum"], leetcode: [{ name: "Two Sum", url: "https://leetcode.com/problems/two-sum/" }, { name: "Merge Intervals", url: "https://leetcode.com/problems/merge-intervals/" }, { name: "Valid Parentheses", url: "https://leetcode.com/problems/valid-parentheses/" }], tips: ["Solve 2-3 problems daily", "Focus on Medium difficulty"] },
      { id: "a-adv", label: "Advanced DSA", x: 30, y: 1, prerequisites: ["a-dsa"], focus: ["BFS/DFS & Graphs", "DP basics"], leetcode: [{ name: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands/" }, { name: "Dijkstra Variant", url: "https://leetcode.com/problems/network-delay-time/" }], tips: ["Practice explaining approach before coding"] },
      { id: "a-proj", label: "Projects Deep-Dive", x: 70, y: 1, prerequisites: ["a-dsa"], focus: ["Build 2 strong projects", "Know every detail"], tips: ["Know every line of your project code"] },
      { id: "a-mock", label: "OA + Mock Prep", x: 50, y: 2, prerequisites: ["a-adv", "a-proj"], focus: ["Timed HackerRank practice", "Mock interviews", "Review solved problems"], tips: ["Explain solution before coding", "Don't hesitate to ask doubts"] },
    ],
  },
  google: { label: "Google", logo: "https://logo.clearbit.com/google.com", color: "from-blue-500 to-cyan-600",
    insights: ["Strong algorithmic thinking", "Multiple coding rounds", "System design for senior"],
    topics: ["Arrays", "DP", "Graph", "System Design", "Trees", "Binary Search"],
    nodes: [
      { id: "g-basics", label: "DSA Basics", x: 50, y: 0, focus: ["Arrays, Strings, HashMap", "Two Pointers & Sliding Window", "Binary Search"], leetcode: [{ name: "Group Anagrams", url: "https://leetcode.com/problems/group-anagrams/" }, { name: "Binary Search", url: "https://leetcode.com/problems/binary-search/" }], tips: ["Master fundamentals deeply"] },
      { id: "g-trees", label: "Trees & Graphs", x: 30, y: 1, prerequisites: ["g-basics"], focus: ["Binary Trees & BST", "Graph BFS/DFS"], leetcode: [{ name: "LCA Binary Tree", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" }], tips: ["Focus on pattern recognition"] },
      { id: "g-dp", label: "Dynamic Programming", x: 70, y: 1, prerequisites: ["g-basics"], focus: ["1D & 2D DP", "Knapsack variants"], leetcode: [{ name: "Edit Distance", url: "https://leetcode.com/problems/edit-distance/" }, { name: "Coin Change", url: "https://leetcode.com/problems/coin-change/" }], tips: ["Practice 50+ DP problems"] },
      { id: "g-sys", label: "System Design", x: 30, y: 2, prerequisites: ["g-trees"], focus: ["LLD (OOP)", "HLD patterns", "API Design"], tips: ["Study System Design Primer on GitHub"] },
      { id: "g-mock", label: "Final Prep", x: 70, y: 2, prerequisites: ["g-dp"], focus: ["Mock interviews (Pramp)", "Revise weak areas"], tips: ["Communication is as important as the solution"] },
    ],
  },
  amd: { label: "AMD", logo: "https://logo.clearbit.com/amd.com", color: "from-red-500 to-rose-600",
    insights: ["Strong C/C++ and OS focus", "4 rounds incl HR", "COA questions common", "PPO from internship"],
    topics: ["Linked List", "OS", "COA", "CN", "Java Internals", "Memory Mgmt", "System Design"],
    nodes: [
      { id: "d-c", label: "C/C++ & Core CS", x: 50, y: 0, focus: ["C pointers, memory mgmt", "OS: threads, scheduling", "COA: cache, pipelining"], leetcode: [{ name: "Remove LL Elements", url: "https://leetcode.com/problems/remove-linked-list-elements/" }, { name: "Reverse K-Group", url: "https://leetcode.com/problems/reverse-nodes-in-k-group/" }], tips: ["Be strong in C internals"] },
      { id: "d-dsa", label: "DSA + Networks", x: 30, y: 1, prerequisites: ["d-c"], focus: ["Linked Lists deep dive", "Binary Trees", "TCP vs UDP, DNS"], tips: ["Practice whiteboard coding"] },
      { id: "d-java", label: "Java Internals", x: 70, y: 1, prerequisites: ["d-c"], focus: ["Multithreading", "GC lifecycle", "Heap memory"], tips: ["Understand memory lifecycle"] },
      { id: "d-sys", label: "System Design + Projects", x: 50, y: 2, prerequisites: ["d-dsa", "d-java"], focus: ["Design streaming platform", "Project deep-dive"], tips: ["Don't claim to know what you don't"] },
    ],
  },
  microsoft: { label: "Microsoft", logo: "https://logo.clearbit.com/microsoft.com", color: "from-green-500 to-teal-600",
    insights: ["Clean code & OOP focus", "Multiple technical rounds", "Project discussion important"],
    topics: ["Arrays", "Linked List", "Graphs", "System Design", "OOP", "SOLID"],
    nodes: [
      { id: "m-core", label: "DSA Core", x: 50, y: 0, focus: ["Arrays & Linked Lists", "Recursion & Backtracking", "Binary Search"], leetcode: [{ name: "Reverse Linked List", url: "https://leetcode.com/problems/reverse-linked-list/" }, { name: "Subsets", url: "https://leetcode.com/problems/subsets/" }], tips: ["Write clean, readable code"] },
      { id: "m-adv", label: "Advanced DSA + OOP", x: 30, y: 1, prerequisites: ["m-core"], focus: ["Trees & Graphs", "DP", "SOLID & Design Patterns"], tips: ["Practice OO design problems"] },
      { id: "m-lld", label: "Low Level Design", x: 70, y: 1, prerequisites: ["m-core"], focus: ["LLD problems", "Clean architecture"], tips: ["Use SOLID principles consistently"] },
      { id: "m-final", label: "Mock + Behavioral", x: 50, y: 2, prerequisites: ["m-adv", "m-lld"], focus: ["Mock interviews", "Behavioral prep", "Project walkthrough"], tips: ["Use Teams-style interview format"] },
    ],
  },
  cisco: { label: "Cisco", logo: "https://logo.clearbit.com/cisco.com", color: "from-sky-500 to-blue-600",
    insights: ["Networking fundamentals critical", "C/Python coding round", "4 rounds total", "Focus on CN & OS"],
    topics: ["Computer Networks", "OS", "C Programming", "OOP", "Routing", "Debugging"],
    nodes: [
      { id: "ci-cn", label: "Networks Deep Dive", x: 50, y: 0, focus: ["OSI & TCP/IP models", "Routing protocols", "DNS, DHCP, NAT"], leetcode: [{ name: "IP to CIDR", url: "https://leetcode.com/problems/ip-to-cidr/" }], tips: ["Know subnetting cold"] },
      { id: "ci-os", label: "OS & C Programming", x: 30, y: 1, prerequisites: ["ci-cn"], focus: ["Process vs threads", "Memory management", "C pointers & structs"], tips: ["Practice debugging C code"] },
      { id: "ci-coding", label: "Coding Round", x: 70, y: 1, prerequisites: ["ci-cn"], focus: ["Arrays & Strings", "Linked Lists", "Pattern problems"], leetcode: [{ name: "Reverse String", url: "https://leetcode.com/problems/reverse-string/" }, { name: "Remove Duplicates", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/" }], tips: ["Focus on clean C/Python code"] },
      { id: "ci-final", label: "Technical + HR", x: 50, y: 2, prerequisites: ["ci-os", "ci-coding"], focus: ["Project discussion", "Networking scenarios", "Behavioral questions"], tips: ["Prepare real-world networking examples"] },
    ],
  },
  goldman: { label: "Goldman Sachs", logo: "https://logo.clearbit.com/goldmansachs.com", color: "from-yellow-500 to-amber-600",
    insights: ["HackerRank OA first", "CS MCQs on OS/DBMS/CN", "Strong on DBMS & SQL", "Aptitude + coding combo"],
    topics: ["SQL", "DBMS", "OOP", "Java", "DSA", "Aptitude", "OS"],
    nodes: [
      { id: "gs-aptitude", label: "Aptitude & MCQs", x: 50, y: 0, focus: ["Quantitative reasoning", "CS MCQs (OS, DBMS, CN)", "Logical reasoning"], tips: ["Practice IndiaBix & GFG MCQs"] },
      { id: "gs-dsa", label: "DSA + SQL", x: 30, y: 1, prerequisites: ["gs-aptitude"], focus: ["Arrays & HashMap", "Advanced SQL queries", "Join optimizations"], leetcode: [{ name: "Two Sum", url: "https://leetcode.com/problems/two-sum/" }, { name: "Subarray Sum K", url: "https://leetcode.com/problems/subarray-sum-equals-k/" }], tips: ["SQL is heavily weighted"] },
      { id: "gs-java", label: "Java & OOP", x: 70, y: 1, prerequisites: ["gs-aptitude"], focus: ["Java collections", "OOP principles", "Multithreading basics"], tips: ["Know Java internals"] },
      { id: "gs-interview", label: "Tech + HR Interview", x: 50, y: 2, prerequisites: ["gs-dsa", "gs-java"], focus: ["DBMS normalization", "Project deep-dive", "Behavioral (why GS?)"], tips: ["Research Goldman's tech stack"] },
    ],
  },
  fidelity: { label: "Fidelity", logo: "https://logo.clearbit.com/fidelity.com", color: "from-violet-500 to-purple-600",
    insights: ["Full-stack questions common", "React/Angular frontend Qs", "DBMS + SQL heavy", "Cultural fit matters"],
    topics: ["Full Stack", "React", "SQL", "REST APIs", "Java", "DBMS"],
    nodes: [
      { id: "fi-web", label: "Web Fundamentals", x: 50, y: 0, focus: ["HTML/CSS/JS basics", "React or Angular", "REST API design"], tips: ["Build a full-stack project before interview"] },
      { id: "fi-backend", label: "Backend & DBMS", x: 30, y: 1, prerequisites: ["fi-web"], focus: ["Java/Spring basics", "SQL & normalization", "API authentication"], leetcode: [{ name: "LRU Cache", url: "https://leetcode.com/problems/lru-cache/" }], tips: ["Know ACID properties cold"] },
      { id: "fi-dsa", label: "DSA (Medium)", x: 70, y: 1, prerequisites: ["fi-web"], focus: ["Arrays & Strings", "Basic DP", "Trees"], leetcode: [{ name: "Valid Parentheses", url: "https://leetcode.com/problems/valid-parentheses/" }, { name: "Climbing Stairs", url: "https://leetcode.com/problems/climbing-stairs/" }], tips: ["Focus on Medium problems"] },
      { id: "fi-final", label: "Manager + HR", x: 50, y: 2, prerequisites: ["fi-backend", "fi-dsa"], focus: ["System design basics", "Culture fit discussion", "Long-term career goals"], tips: ["Show genuine interest in fintech"] },
    ],
  },
  ti: { label: "Texas Instruments", logo: "https://logo.clearbit.com/ti.com", color: "from-amber-500 to-orange-600",
    insights: ["Embedded systems focus", "C/C++ mandatory", "Digital electronics questions", "Strong on COA"],
    topics: ["Embedded C", "Digital Electronics", "COA", "OS", "DSA", "VLSI basics"],
    nodes: [
      { id: "ti-c", label: "C/C++ & Embedded", x: 50, y: 0, focus: ["C pointers & bitwise", "Embedded protocols (I2C, SPI)", "Memory-mapped I/O"], tips: ["Master bit manipulation in C"] },
      { id: "ti-digital", label: "Digital & COA", x: 30, y: 1, prerequisites: ["ti-c"], focus: ["Boolean algebra & K-maps", "Flip-flops & counters", "Pipeline & cache design"], tips: ["Review GATE-level digital questions"] },
      { id: "ti-dsa", label: "DSA in C", x: 70, y: 1, prerequisites: ["ti-c"], focus: ["Linked Lists", "Sorting in C", "Stack implementations"], leetcode: [{ name: "Reverse Linked List", url: "https://leetcode.com/problems/reverse-linked-list/" }], tips: ["Implement DSA in C, not Python"] },
      { id: "ti-interview", label: "Technical Interview", x: 50, y: 2, prerequisites: ["ti-digital", "ti-dsa"], focus: ["OS internals", "Project explanation", "Problem solving on whiteboard"], tips: ["Be prepared for on-paper coding"] },
    ],
  },
};

export default function CompanyGuide() {
  const [selectedCompany, setSelectedCompany] = useState("amazon");
  const [selectedNode, setSelectedNode] = useState<PhaseNode | null>(null);
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const treeRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  useEffect(() => {
    if (user?.email) {
      fetch("/api/user/sync").then(r => r.json()).then(d => setIsPremium(d.isPremium)).catch(() => {});
    }
  }, [user]);

  const plan = COMPANIES[selectedCompany];
  const nodes = plan?.nodes || [];
  const edges: Edge[] = [];
  nodes.forEach(n => n.prerequisites?.forEach(p => edges.push({ from: p, to: n.id })));
  const progress = nodes.length > 0 ? Math.round((nodes.filter(n => completedNodes.has(n.id)).length / nodes.length) * 100) : 0;

  useEffect(() => {
    const measure = () => {
      if (!treeRef.current) return;
      const container = treeRef.current.getBoundingClientRect();
      const newLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
      edges.forEach(edge => {
        const fromEl = nodeRefs.current[edge.from];
        const toEl = nodeRefs.current[edge.to];
        if (!fromEl || !toEl) return;
        const f = fromEl.getBoundingClientRect();
        const t = toEl.getBoundingClientRect();
        newLines.push({ x1: f.left + f.width / 2 - container.left, y1: f.top + f.height - container.top, x2: t.left + t.width / 2 - container.left, y2: t.top - container.top });
      });
      setLines(newLines);
    };
    const timeout = setTimeout(measure, 100);
    window.addEventListener("resize", measure);
    return () => { clearTimeout(timeout); window.removeEventListener("resize", measure); };
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedNode && panelRef.current) gsap.fromTo(panelRef.current, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" });
  }, [selectedNode]);

  const maxY = Math.max(...nodes.map(n => n.y));
  const ROW = 80, PAD = 20;

  const handleCompanySelect = (key: string) => {
    if (key !== "amazon" && !isPremium) {
      setIsPremiumModalOpen(true);
      return;
    }
    setSelectedCompany(key);
    setSelectedNode(null);
    nodeRefs.current = {};
  };

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden">
      <PremiumPurchaseModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
      <div className="flex justify-center mb-8 mt-2 items-center gap-3">
        <CompanyLogo companyName={plan.label} size="md" />
        <div className="relative w-[240px]">
          <select 
            value={selectedCompany} 
            onChange={(e) => handleCompanySelect(e.target.value)}
            className="w-full appearance-none bg-[#1a1d2e] border border-white/20 text-white rounded-xl px-4 py-3 font-medium outline-none focus:border-purple-500 shadow-lg"
          >
            {Object.entries(COMPANIES).map(([key, c]) => (
              <option key={key} value={key}>
                {c.label} {key !== "amazon" && !isPremium ? " (Premium)" : ""}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
        </div>
      </div>

      {/* Insights */}
      <div className="max-w-3xl mx-auto mb-4 p-4 rounded-xl bg-gradient-to-r from-purple-900/20 to-pink-900/10 border border-purple-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-yellow-400 uppercase tracking-wider font-medium">Key Insights</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {plan.insights.map((tip, i) => <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-zinc-800/50 text-zinc-300 border border-zinc-700">{tip}</span>)}
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex justify-between text-xs text-white/50 mb-2">
          <span className="flex items-center gap-2"><TrendingUp className="w-3 h-3" />{plan.label} Prep Plan</span>
          <span className="font-bold text-white">{progress}%</span>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${plan.color} rounded-full transition-all duration-700`} style={{ width: `${progress}%` }} /></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 overflow-x-auto pb-4">
          <div ref={treeRef} className="min-w-[400px] relative" style={{ height: `${PAD + (maxY + 1) * ROW + 30}px` }}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              {lines.map((l, i) => { const m = (l.y1 + l.y2) / 2; return <path key={i} d={`M ${l.x1} ${l.y1} C ${l.x1} ${m}, ${l.x2} ${m}, ${l.x2} ${l.y2}`} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />; })}
            </svg>
            {nodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const isDone = completedNodes.has(node.id);
              return (
                <button key={node.id} ref={el => { nodeRefs.current[node.id] = el; }} onClick={() => setSelectedNode(node)}
                  className={`absolute transform -translate-x-1/2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all hover:scale-110 border z-10 ${
                    isSelected ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] z-20"
                    : isDone ? "bg-green-600/80 border-green-400/50 text-white"
                    : "bg-[#2a2d4a] border-white/20 text-white/90 hover:border-purple-400/50"
                  }`} style={{ left: `${node.x}%`, top: `${PAD + node.y * ROW}px` }}>
                  {node.label}
                  {isDone && <CheckCircle2 className="w-3 h-3 ml-1 inline text-green-300" />}
                </button>
              );
            })}
          </div>
        </div>

        {selectedNode && (
          <div ref={panelRef} className="w-full lg:w-[380px] shrink-0 bg-[#1a1d2e] border border-white/10 rounded-2xl overflow-hidden lg:sticky lg:top-4 self-start max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{selectedNode.label}</h3>
              <button onClick={() => setSelectedNode(null)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20"><X className="w-4 h-4 text-white/60" /></button>
            </div>
            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-3.5 h-3.5 text-purple-400" />
                  <p className="text-xs text-white/40 uppercase tracking-wider">Focus Areas</p>
                </div>
                {selectedNode.focus.map((f, i) => <div key={i} className="flex items-start gap-2 text-sm text-white/70 mb-1.5"><ArrowRight className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" /><span>{f}</span></div>)}
              </div>
              {selectedNode.leetcode && selectedNode.leetcode.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-orange-400" />
                    <p className="text-xs text-white/40 uppercase tracking-wider">LeetCode Problems</p>
                  </div>
                  <div className="space-y-1.5">
                    {selectedNode.leetcode.map((lc, i) => (
                      <a key={i} href={lc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" /> {lc.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {selectedNode.tips.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    <p className="text-xs text-white/40 uppercase tracking-wider">Tips</p>
                  </div>
                  {selectedNode.tips.map((t, i) => <div key={i} className="flex items-start gap-2 text-xs text-white/50 mb-1.5"><ArrowRight className="w-3 h-3 text-yellow-500 mt-0.5 shrink-0" /><span>{t}</span></div>)}
                </div>
              )}
              <button onClick={() => setCompletedNodes(prev => { const n = new Set(prev); n.has(selectedNode.id) ? n.delete(selectedNode.id) : n.add(selectedNode.id); return n; })}
                className={`w-full py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${completedNodes.has(selectedNode.id) ? "bg-green-600 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}>
                {completedNodes.has(selectedNode.id) ? <><CheckCircle2 className="w-4 h-4" /> Completed</> : "Mark as Complete"}
              </button>
            </div>

            {/* Topics */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-3 h-3 text-cyan-400" />
                <p className="text-[10px] text-white/30 uppercase tracking-wider">Key Topics at {plan.label}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">{plan.topics.map((t, i) => <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{t}</span>)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
