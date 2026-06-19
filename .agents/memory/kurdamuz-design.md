---
name: KURDAMUZ Design System
description: Core design tokens and patterns for the KURDAMUZ platform
---

## Color palette
- Background: `#0a1628` (main), `#0d1f38` (cards/sidebar)
- Primary: emerald-500 `#10b981`, emerald-600 `#059669`
- Text: white (headings), slate-400 (secondary), slate-500 (muted)
- Borders: `border-white/6` to `border-white/12`
- Hover bg: `bg-white/5` to `bg-white/8`

## Page structure pattern
All authenticated pages use a two-column layout:
```
<div class="min-h-screen bg-[#0a1628] flex">
  <aside class="w-60 bg-[#0d1f38] border-r border-white/6 ..."> /* sidebar */
  <main class="flex-1 overflow-auto"> /* content */
```

## Active nav item
```
bg-emerald-500/15 text-emerald-400 border border-emerald-500/20
```

## Card style
```
bg-[#0d1f38] border border-white/8 rounded-2xl
```

## Primary button
```
bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all
```

## Pages built
- Homepage (`[locale]/page.tsx`) — dark hero, XP card, stats, modules
- Login, Signup — centered dark card
- Dashboard — learning path, daily missions, XP stats
- Admin dashboard — sidebar CMS with charts, media manager
- Admin media library — grid/list view, upload queue, file details
- Courses page — course cards with progress bars
- Learning interface — Kurdish text display, audio waveform, quiz
- Leaderboard — podium, rankings table
- Achievements — categorized cards with progress
- Community — social feed with Kurdish text display
- SRS Practice — flashcard sessions, mastery tracking
- Stories library — immersive reading with audio
- Owner dashboard — business intelligence, system health, global reach
