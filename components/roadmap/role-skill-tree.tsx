"use client";

import { useState, useRef, useEffect } from "react";
import { ExternalLink, X, CheckCircle2, BookOpen, Lock, ChevronDown, Code, Database, Cpu, Settings, Palette, Monitor, Sparkles, Trophy, Flame, TrendingUp, Circle } from "lucide-react";
import gsap from "gsap";
import { useAuth } from "@/lib/auth-context";
import { PremiumPurchaseModal } from "@/components/premium-purchase-modal";

const ROLE_STORAGE_KEY = "psg_role_progress";

type RoleProgress = {
  completedNodes: string[];
  lastSolved: number;
  streak: number;
  lastActive: number;
};

type Resource = { name: string; url: string };
type RoleNode = { id: string; label: string; x: number; y: number; prerequisites?: string[]; resources: Resource[]; weeks: number; description: string };
type Edge = { from: string; to: string };

const ROLE_TREES: Record<string, { label: string; icon: React.ElementType; nodes: RoleNode[] }> = {
  swe: { label: "Software Engineer", icon: Code, nodes: [
    { id: "dsa-basics", label: "Arrays & Strings", x: 50, y: 0, weeks: 2, description: "Foundation of coding interviews", resources: [{ name: "Striver SDE Sheet", url: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/" }, { name: "NeetCode 150", url: "https://neetcode.io/" }] },
    { id: "ll-stack", label: "Linked List & Stack", x: 30, y: 1, weeks: 2, prerequisites: ["dsa-basics"], description: "Pointers, stack operations", resources: [{ name: "Striver A2Z", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/" }] },
    { id: "sorting-search", label: "Sorting & Searching", x: 70, y: 1, weeks: 1, prerequisites: ["dsa-basics"], description: "Binary search, quick sort", resources: [{ name: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/sorting-algorithms/" }] },
    { id: "trees-graphs", label: "Trees & Graphs", x: 30, y: 2, weeks: 3, prerequisites: ["ll-stack"], description: "BFS, DFS, BST operations", resources: [{ name: "Aditya Verma Trees", url: "https://www.youtube.com/playlist?list=PL_z_8CaSLPWfxJPz2-YKqL9gXWdgrhvdn" }] },
    { id: "dp", label: "Dynamic Programming", x: 70, y: 2, weeks: 3, prerequisites: ["sorting-search"], description: "Memoization, tabulation patterns", resources: [{ name: "Aditya Verma DP", url: "https://www.youtube.com/playlist?list=PL_z_8CaSLPWekqhdCPmFohncHwz8TY2Go" }] },
    { id: "os", label: "Operating Systems", x: 15, y: 3, weeks: 2, prerequisites: ["trees-graphs"], description: "Threads, scheduling, memory", resources: [{ name: "Gate Smashers OS", url: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p" }] },
    { id: "dbms", label: "DBMS & SQL", x: 50, y: 3, weeks: 2, prerequisites: ["trees-graphs", "dp"], description: "Normalization, joins, indexing", resources: [{ name: "GFG DBMS", url: "https://www.geeksforgeeks.org/dbms/" }] },
    { id: "cn", label: "Computer Networks", x: 85, y: 3, weeks: 2, prerequisites: ["dp"], description: "TCP/UDP, DNS, HTTP", resources: [{ name: "Kunal Kushwaha CN", url: "https://www.youtube.com/watch?v=IPvYjXCsTg8" }] },
    { id: "lld", label: "Low Level Design", x: 30, y: 4, weeks: 2, prerequisites: ["os", "dbms"], description: "OOP, SOLID, design patterns", resources: [{ name: "Sudocode LLD", url: "https://www.youtube.com/@sudocode" }] },
    { id: "hld", label: "System Design", x: 70, y: 4, weeks: 3, prerequisites: ["dbms", "cn"], description: "Scalability, caching, load balancing", resources: [{ name: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" }] },
    { id: "projects", label: "Projects & Resume", x: 35, y: 5, weeks: 2, prerequisites: ["lld"], description: "Build 2-3 strong projects", resources: [{ name: "PSG custResume", url: "/resume-tips" }] },
    { id: "hr-mock", label: "HR & Mock Interviews", x: 65, y: 5, weeks: 1, prerequisites: ["hld"], description: "STAR method, behavioral prep", resources: [{ name: "STAR Method", url: "https://www.themuse.com/advice/star-interview-method" }] },
  ]},
  data: { label: "Data / ML Engineer", icon: Database, nodes: [
    { id: "python", label: "Python Mastery", x: 50, y: 0, weeks: 2, description: "Pandas, NumPy, data wrangling", resources: [{ name: "Kaggle Python", url: "https://www.kaggle.com/learn/python" }] },
    { id: "stats", label: "Statistics", x: 30, y: 1, weeks: 3, prerequisites: ["python"], description: "Probability, distributions, hypothesis", resources: [{ name: "Khan Academy", url: "https://www.khanacademy.org/math/statistics-probability" }] },
    { id: "sql", label: "Advanced SQL", x: 70, y: 1, weeks: 2, prerequisites: ["python"], description: "Joins, window functions, CTEs", resources: [{ name: "Mode SQL", url: "https://mode.com/sql-tutorial/" }] },
    { id: "ml-basics", label: "ML Algorithms", x: 30, y: 2, weeks: 4, prerequisites: ["stats"], description: "Regression, trees, SVM, clustering", resources: [{ name: "Andrew Ng ML", url: "https://www.coursera.org/specializations/machine-learning-introduction" }] },
    { id: "etl", label: "ETL & Pipelines", x: 70, y: 2, weeks: 2, prerequisites: ["sql"], description: "Airflow, Spark, data modeling", resources: [{ name: "DE ZoomCamp", url: "https://github.com/DataTalksClub/data-engineering-zoomcamp" }] },
    { id: "dl", label: "Deep Learning", x: 30, y: 3, weeks: 3, prerequisites: ["ml-basics"], description: "Neural nets, CNNs, transformers", resources: [{ name: "fast.ai", url: "https://www.fast.ai/" }] },
    { id: "cloud", label: "Cloud & Deploy", x: 70, y: 3, weeks: 2, prerequisites: ["etl"], description: "AWS/GCP, Docker, MLOps", resources: [{ name: "AWS ML Specialty", url: "https://aws.amazon.com/certification/certified-machine-learning-specialty/" }] },
    { id: "portfolio", label: "Kaggle & Portfolio", x: 50, y: 4, weeks: 3, prerequisites: ["dl", "cloud"], description: "Competitions, end-to-end projects", resources: [{ name: "Kaggle Competitions", url: "https://www.kaggle.com/competitions" }] },
  ]},
  embedded: { label: "Embedded / Hardware", icon: Cpu, nodes: [
    { id: "e-c", label: "C/C++ Fundamentals", x: 50, y: 0, weeks: 3, description: "Pointers, memory, structs", resources: [{ name: "Learn-C.org", url: "https://www.learn-c.org/" }, { name: "GFG C Programming", url: "https://www.geeksforgeeks.org/c-programming-language/" }] },
    { id: "e-micro", label: "Microprocessors", x: 30, y: 1, weeks: 2, prerequisites: ["e-c"], description: "8086, ARM architecture", resources: [{ name: "Neso Academy", url: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRjMH3mWf6kwqiTbT798eAO" }] },
    { id: "e-os", label: "RTOS & OS Internals", x: 70, y: 1, weeks: 2, prerequisites: ["e-c"], description: "Scheduling, interrupts, RTOS", resources: [{ name: "FreeRTOS Docs", url: "https://www.freertos.org/Documentation/RTOS_book.html" }] },
    { id: "e-coa", label: "Computer Architecture", x: 30, y: 2, weeks: 2, prerequisites: ["e-micro"], description: "Pipelining, cache, memory hierarchy", resources: [{ name: "Gate Smashers COA", url: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiHMonh3G6QNKq53C6oNXGrX" }] },
    { id: "e-embedded", label: "Embedded Systems", x: 70, y: 2, weeks: 3, prerequisites: ["e-os"], description: "I2C, SPI, UART protocols", resources: [{ name: "Embedded Systems Course", url: "https://www.coursera.org/specializations/introduction-embedded-systems" }] },
    { id: "e-projects", label: "Projects & Interview", x: 50, y: 3, weeks: 2, prerequisites: ["e-coa", "e-embedded"], description: "Hardware projects, interview prep", resources: [{ name: "PSG custResume", url: "/resume-tips" }] },
  ]},
  devops: { label: "DevOps Engineer", icon: Settings, nodes: [
    { id: "do-linux", label: "Linux & Shell", x: 50, y: 0, weeks: 2, description: "Bash, filesystem, permissions", resources: [{ name: "Linux Journey", url: "https://linuxjourney.com/" }, { name: "The Linux Command Line", url: "https://linuxcommand.org/tlcl.php" }] },
    { id: "do-git", label: "Git & CI/CD", x: 30, y: 1, weeks: 2, prerequisites: ["do-linux"], description: "GitHub Actions, Jenkins, pipelines", resources: [{ name: "GitHub Actions Docs", url: "https://docs.github.com/en/actions" }] },
    { id: "do-docker", label: "Docker & K8s", x: 70, y: 1, weeks: 3, prerequisites: ["do-linux"], description: "Containers, orchestration", resources: [{ name: "Docker Docs", url: "https://docs.docker.com/get-started/" }, { name: "KodeKloud", url: "https://kodekloud.com/" }] },
    { id: "do-cloud", label: "Cloud (AWS/GCP)", x: 30, y: 2, weeks: 3, prerequisites: ["do-git"], description: "EC2, S3, Lambda, IAM", resources: [{ name: "AWS Free Tier", url: "https://aws.amazon.com/free/" }] },
    { id: "do-monitor", label: "Monitoring & Logging", x: 70, y: 2, weeks: 2, prerequisites: ["do-docker"], description: "Prometheus, Grafana, ELK", resources: [{ name: "Prometheus Docs", url: "https://prometheus.io/docs/" }] },
    { id: "do-iac", label: "IaC & Automation", x: 50, y: 3, weeks: 2, prerequisites: ["do-cloud", "do-monitor"], description: "Terraform, Ansible", resources: [{ name: "Terraform Learn", url: "https://developer.hashicorp.com/terraform/tutorials" }] },
  ]},
  ui: { label: "UI / Frontend Dev", icon: Monitor, nodes: [
    { id: "u-html", label: "HTML/CSS Mastery", x: 50, y: 0, weeks: 2, description: "Semantic HTML, Flexbox, Grid", resources: [{ name: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Learn" }, { name: "CSS Tricks", url: "https://css-tricks.com/" }] },
    { id: "u-js", label: "JavaScript Deep Dive", x: 30, y: 1, weeks: 3, prerequisites: ["u-html"], description: "ES6+, async/await, closures", resources: [{ name: "javascript.info", url: "https://javascript.info/" }] },
    { id: "u-design", label: "UI/UX Principles", x: 70, y: 1, weeks: 2, prerequisites: ["u-html"], description: "Design systems, accessibility", resources: [{ name: "Refactoring UI", url: "https://www.refactoringui.com/" }] },
    { id: "u-react", label: "React & Next.js", x: 30, y: 2, weeks: 4, prerequisites: ["u-js"], description: "Hooks, SSR, state management", resources: [{ name: "React Docs", url: "https://react.dev/" }, { name: "Next.js Docs", url: "https://nextjs.org/docs" }] },
    { id: "u-testing", label: "Testing & Perf", x: 70, y: 2, weeks: 2, prerequisites: ["u-design"], description: "Jest, Lighthouse, Core Web Vitals", resources: [{ name: "Testing Library", url: "https://testing-library.com/" }] },
    { id: "u-portfolio", label: "Portfolio & Deploy", x: 50, y: 3, weeks: 2, prerequisites: ["u-react", "u-testing"], description: "Vercel, Netlify, portfolio site", resources: [{ name: "Vercel Docs", url: "https://vercel.com/docs" }] },
  ]},
};

export default function RoleSkillTree() {
  const [selectedRole, setSelectedRole] = useState("swe");
  const [selectedNode, setSelectedNode] = useState<RoleNode | null>(null);
  const [progress, setProgress] = useState<RoleProgress>({
    completedNodes: [],
    lastSolved: 0,
    streak: 0,
    lastActive: 0,
  });
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const treeRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const lastActive = parsed.lastActive || 0;
        const daysSince = Math.floor((now - lastActive) / dayMs);
        
        if (daysSince <= 1 && lastActive > 0) {
          parsed.streak = parsed.streak || 1;
        } else if (daysSince > 1) {
          parsed.streak = 0;
        }
        setProgress(parsed);
      } catch (e) {
        console.error("Failed to parse progress", e);
      }
    }
  }, []);

  // Save progress
  const saveProgress = (newProgress: RoleProgress) => {
    localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(newProgress));
    setProgress(newProgress);
  };

  // Toggle node completion
  const toggleNodeCompletion = (nodeId: string) => {
    const isCompleted = progress.completedNodes.includes(nodeId);
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const lastActive = progress.lastActive || 0;
    const daysSince = Math.floor((now - lastActive) / dayMs);
    
    let newStreak = progress.streak;
    if (daysSince <= 1 && lastActive > 0) {
      newStreak = progress.streak || 1;
    } else if (daysSince > 1) {
      newStreak = 1;
    }

    let newCompleted: string[];
    if (isCompleted) {
      newCompleted = progress.completedNodes.filter(n => n !== nodeId);
    } else {
      newCompleted = [...progress.completedNodes, nodeId];
    }

    const newProgress: RoleProgress = {
      completedNodes: newCompleted,
      lastSolved: isCompleted ? progress.lastSolved : now,
      streak: newStreak,
      lastActive: now,
    };
    saveProgress(newProgress);
  };

  useEffect(() => {
    if (user?.email) {
      fetch("/api/user/sync").then(r => r.json()).then(d => setIsPremium(d.isPremium)).catch(() => {});
    }
  }, [user]);

  const tree = ROLE_TREES[selectedRole];
  const nodes = tree?.nodes || [];
  const edges: Edge[] = [];
  nodes.forEach(n => n.prerequisites?.forEach(p => edges.push({ from: p, to: n.id })));

  const totalWeeks = nodes.reduce((a, n) => a + n.weeks, 0);
  const doneWeeks = nodes.filter(n => progress.completedNodes.includes(n.id)).reduce((a, n) => a + n.weeks, 0);
  const progressPercent = totalWeeks > 0 ? Math.round((doneWeeks / totalWeeks) * 100) : 0;

  const solvedCount = progress.completedNodes.length;
  const totalNodes = nodes.length;

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
  }, [selectedRole]);

  useEffect(() => {
    if (selectedNode && panelRef.current) gsap.fromTo(panelRef.current, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" });
  }, [selectedNode]);

  const maxY = Math.max(...nodes.map(n => n.y));
  const ROW = 75, PAD = 20;

  const handleRoleSelect = (key: string) => {
    if (key !== "swe" && !isPremium) {
      setIsPremiumModalOpen(true);
      return;
    }
    setSelectedRole(key);
    setSelectedNode(null);
    nodeRefs.current = {};
  };

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden">
      <PremiumPurchaseModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
      <div className="flex justify-center mb-10 mt-2">
        <div className="relative w-[240px]">
          <select 
            value={selectedRole} 
            onChange={(e) => handleRoleSelect(e.target.value)}
            className="w-full appearance-none bg-[#1a1d2e] border border-white/20 text-white rounded-xl px-4 py-3 font-medium outline-none focus:border-purple-500 shadow-lg"
          >
            {Object.entries(ROLE_TREES).map(([key, r]) => (
              <option key={key} value={key}>
                {r.label} {key !== "swe" && !isPremium ? " (Premium)" : ""}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-white">{solvedCount}/{totalNodes}</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-white">{progress.streak || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-white">{progressPercent}%</span>
            </div>
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 overflow-x-auto pb-4">
          <div ref={treeRef} className="min-w-[500px] relative" style={{ height: `${PAD + (maxY + 1) * ROW + 30}px` }}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              {lines.map((l, i) => { const m = (l.y1 + l.y2) / 2; return <path key={i} d={`M ${l.x1} ${l.y1} C ${l.x1} ${m}, ${l.x2} ${m}, ${l.x2} ${l.y2}`} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />; })}
            </svg>
            {nodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const isDone = progress.completedNodes.includes(node.id);
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
          <div ref={panelRef} className="w-full lg:w-[380px] shrink-0 bg-[#1a1d2e] border border-white/10 rounded-2xl overflow-hidden lg:sticky lg:top-4 self-start">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedNode.label}</h3>
                <p className="text-xs text-white/40">{selectedNode.description}</p>
              </div>
              <button onClick={() => setSelectedNode(null)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20"><X className="w-4 h-4 text-white/60" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">Duration</span>
                <span className="text-white font-medium">{selectedNode.weeks} weeks</span>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Resources</p>
                <div className="space-y-2">
                  {selectedNode.resources.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-colors">
                      <BookOpen className="w-4 h-4" /> {r.name} <ExternalLink className="w-3 h-3 ml-auto text-white/30" />
                    </a>
                  ))}
                </div>
              </div>
              <button onClick={() => toggleNodeCompletion(selectedNode.id)}
                className={`w-full py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${progress.completedNodes.includes(selectedNode.id) ? "bg-green-600 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}>
                {progress.completedNodes.includes(selectedNode.id) ? <><CheckCircle2 className="w-4 h-4" /> Completed</> : "Mark as Complete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
