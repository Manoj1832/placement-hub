# PSG Placement Hub

> Real interview experiences, gamified learning roadmaps, and career services tailored for PSG College students.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Convex](https://img.shields.io/badge/Convex-Realtime-orange?style=for-the-badge)](https://convex.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📖 Complete Documentation

A comprehensive, production-grade documentation covering the system architecture, database models, event-driven design, and security architecture is available in:
👉 **[PROJECT_DOCUMENTATION.md](file:///home/manoj/Documents/placement-hub/docs/PROJECT_DOCUMENTATION.md)**

---

## ✨ Features

- 📂 **Interview Experience Vault** — Filter and search through verified interview reports shared by peers.
- 🗺️ **Interactive Prep Roadmaps** — Gamified skill trees for SWE, DevOps, Embedded, and Data Analyst paths.
- 🎯 **Company preparation Guides** — Specific roadmaps and timelines for companies like Google, Microsoft, and Amazon.
- 🛡️ **Freemium & Paywall Security** — Top 5 upvoted experiences are free previews. Other entries strip critical information server-side for non-premium users.
- ⚡ **Event-Driven Gamification** — Outbox event-driven system calculates XP, levels, learning streaks, and achievements asynchronously.
- 💼 **Audit Services** — Bookings for Resume Reviews, GitHub Audits, and Portfolio Audits.
- 💳 **Tamper-proof Payments** — Razorpay checkout integration with direct server-to-server validation.
- 🔒 **Enterprise-Grade Security** — Redis rate-limiting, custom JWT + Clerk auth, strict CSP headers, and anti-DDoS protections.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (React 19), Tailwind CSS v4, Lucide icons, Framer Motion, GSAP, Anime.js
- **Backend / Database**: Convex (Real-time serverless database & background scheduling)
- **Auth**: Clerk (Primary) + Custom JWT hybrid (`jose` & `bcryptjs` fallback)
- **Caching / Rate Limit**: Upstash Redis
- **File Storage**: Cloudflare R2 (compatible with S3 SDK)
- **Payments**: Razorpay
- **Email Service**: Resend

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory and specify the required API keys (see [PROJECT_DOCUMENTATION.md](file:///home/manoj/Documents/placement-hub/docs/PROJECT_DOCUMENTATION.md#8-deployment--environmental-settings) for details).

### 3. Run the Development Server

```bash
# Start Next.js development server
npm run dev

# Start Convex local development environment (in a separate terminal)
npx convex dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the portal.

---

## 📁 Key Directories

```
├── app/                        # Next.js page routers & API handlers
├── components/                 # Shared frontend UI & roadmap trees
├── convex/                     # Schema, DB triggers & outbox processors
├── docs/                       # Project architecture documentation
└── lib/                        # Redis, S3/R2 client & security utilities
```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.