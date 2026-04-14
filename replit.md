# GymQuest - Fitness Tracking App

## Overview

GymQuest is a mobile-first gamified fitness tracking app built with Expo (React Native). It features a dark neon gaming aesthetic with 5 main tabs.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: Expo (React Native) with expo-router
- **State**: AsyncStorage for persistence, React Context for shared state
- **API framework**: Express 5 (shared API server, not used by mobile yet)
- **Database**: PostgreSQL + Drizzle ORM (available but not used by mobile)

## App Structure

### Tabs
1. **Workouts** (`app/(tabs)/index.tsx`) - Grouped workout routines with GO button
2. **Exercises** (`app/(tabs)/exercises.tsx`) - Searchable exercise library (52+ exercises)
3. **Logs** (`app/(tabs)/logs.tsx`) - Calendar view of completed workouts
4. **Stats** (`app/(tabs)/stats.tsx`) - Volume, frequency, muscle group charts, body weight tracker, PRs
5. **Profile** (`app/(tabs)/profile.tsx`) - XP, level, streak, achievements

### Screens
- **Active Workout** (`app/active-workout.tsx`) - Live workout logging with rest timer
- **Settings** (`app/settings.tsx`) - Rest timer, defaults, units, RPE, 1RM calculator, plate calculator

### Design
- Background: #0a0a0a
- Cards: #141414 with neon border glow
- Accent colors: Purple (#a855f7), Cyan (#06b6d4), Pink (#f43f5e), Lime (#84cc16)
- Font: Inter (400/500/600/700)

### Data Layer
- `store/types.ts` - TypeScript interfaces
- `store/sampleData.ts` - Pre-loaded sample exercises, workouts, logs
- `store/AppContext.tsx` - React Context with AsyncStorage persistence

### Components
- `components/GlowCard.tsx` - Card with neon border glow
- `components/NeonButton.tsx` - Styled button with haptic feedback
- `components/XPBar.tsx` - XP progress bar
- `components/RestTimer.tsx` - Countdown rest timer

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
