# GymQuest — Mobile-first gamified fitness tracking app with dark neon UI.

## Run & Operate
- `pnpm --filter @workspace/mobile run dev` — start Expo mobile app
- `pnpm --filter @workspace/api-server run dev` — start API server
- `pnpm run typecheck` — full typecheck across all packages
- Expo URL: `exp://0e604486-be60-43b5-8e94-0d3f293fd6c9-00-s06m76ny57n5.expo.picard.replit.dev`

## Stack
- **Monorepo**: pnpm workspaces, Node.js 24
- **Mobile**: Expo 54 (React Native) + expo-router v6 (file-based routing)
- **State**: AsyncStorage `@gymquest_data` + React Context (`store/AppContext.tsx`)
- **Animations**: React Native `Animated` API (useNativeDriver: true, no transformOrigin)
- **Gestures**: react-native-gesture-handler `Swipeable`
- **API**: Express 5 + Drizzle ORM + PostgreSQL (not yet used by mobile)

## Where things live
- `artifacts/mobile/` — Expo app root
- `app/(tabs)/` — 5 main tabs: Workouts, Exercises, Logs, Stats, Profile
- `app/exercise/[id].tsx` — exercise detail with animated demo + instructions
- `app/workout/[id].tsx` — workout editor (create/edit/delete, exercise picker modal)
- `app/log/[id].tsx` — log detail (view/edit sets/reps/weight, delete)
- `app/active-workout.tsx` — live workout session with rest timer
- `store/exerciseLibrary.ts` — 100 exercises with full metadata (source of truth, never stored)
- `store/AppContext.tsx` — always merges exerciseLibrary + user custom exercises at load
- `store/sampleData.ts` — empty defaults (workouts/logs start fresh)
- `components/ExerciseDemo.tsx` — 14 movement-pattern animations (proper pivot math)
- `components/SwipeableCard.tsx` — reusable swipe left/right gesture card

## Architecture decisions
- **Exercise library never stored in AsyncStorage** — always loaded from `exerciseLibrary.ts`; only user-added custom exercises are persisted. This prevents stale data on library updates.
- **Pivot animations without transformOrigin** — React Native doesn't support `transformOrigin`; pivots use `[translateY(-half), rotate, translateY(+half)]` transform chains.
- **`useNativeDriver: true` for all animations** — all animated properties are transforms/opacity only, enabling 60fps on the JS thread.
- **Swipeable wraps GlowCard** — `SwipeableCard` is layout-neutral; the inner `GlowCard` handles appearance.
- **Exercises tab only reads from context** — exercise data comes from the library through context, so filters always have full 100 exercises.

## Product
- 100-exercise library with instructions, muscles, tips, movement patterns, animated demos
- Create/edit/delete custom workout routines grouped by program
- Log workouts with sets/reps/weight per exercise, duration, volume tracking
- Calendar view of workout history with per-day drill-down
- Stats: volume charts, muscle group breakdown, body weight tracker, personal records
- Profile: XP/leveling, streaks, achievements
- Settings: rest timer, weight units, RPE, 1RM/plate calculators

## User preferences
- Dark neon theme: bg #0a0a0a, cards #141414, accent purple/cyan/pink/lime
- Font: Inter (400/500/600/700) via @expo-google-fonts
- No sample data on fresh install — user creates their own workouts

## Gotchas
- `useNativeDriver: true` and `false` cannot be mixed on the same `Animated.Value`
- `transformOrigin` is not a React Native StyleSheet property — use translate-rotate-translate
- Exercises must never be saved to AsyncStorage; the library is the source of truth
- The Expo tunnel URL changes only if the Repl restarts from scratch

## Pointers
- `.local/skills/expo` — Expo patterns, permissions, animations
- `.local/skills/react-vite` — not used (mobile only)
