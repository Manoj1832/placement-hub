# PSG Placement Hub

Real interview experiences and preparation resources for PSG College students.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Convex](https://img.shields.io/badge/Convex-Realtime-orange)

## Features

- **Interview Experiences** - Real placement interview stories from PSG students
- **Company Guides** - Company-specific preparation roadmaps (Amazon, Google, Microsoft, etc.)
- **DSA Roadmap** - Structured coding practice path
- **Role-based Paths** - SWE, Data Science, Embedded, DevOps, Frontend
- **Progress Tracking** - XP, levels, streaks, goals, achievements
- **Resume Tips** - Templates and guidance
- **Premium Content** - Paid interview details

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Convex (real-time database)
- **Auth**: JWT with Clerk-style implementation
- **Payments**: Razorpay
- **Email**: Resend
- **Cache**: Upstash Redis

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
├── app/                    # Next.js pages
│   ├── (auth)/           # Protected routes (dashboard, saved, submit)
│   ├── (public)/        # Public routes (browse, experience)
│   ├── api/             # API routes
│   └── roadmap/         # Roadmap pages
├── components/           # React components
│   ├── ui/            # UI primitives
│   └── roadmap/        # Roadmap components
├── lib/                # Utilities
└── convex/            # Backend functions
    ├── tracking.ts     # Progress tracking
    ├── experiences.ts # Experience CRUD
    └── schema.ts    # Database schema
```

## Key Files

- `components/experience-card.tsx` - Experience preview card
- `components/company-logo.tsx` - Company logos from Wikimedia
- `components/roadmap/company-guide.tsx` - Company-specific prep plans
- `components/roadmap/dsa-roadmap.tsx` - DSA practice tree

## Environment Variables

```env
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXTAUTH_SECRET=
RESEND_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Routes

| Route | Description |
|-------|------------|
| `/` | Home page |
| `/browse` | Browse experiences |
| `/experience/[id]` | Experience details |
| `/roadmap` | DSA & role roadmaps |
| `/resources` | Downloadable resources |
| `/dashboard` | Progress tracking |
| `/saved` | Saved experiences |
| `/resume-tips` | Resume templates |

## Progress System

- **XP**: Earned by activities (view, upvote, complete goals, etc.)
- **Levels**: 500 XP per level
- **Streaks**: Consecutive active days
- **Goals**: Daily/weekly targets
- **Achievements**: Badges for milestones

## License

MIT