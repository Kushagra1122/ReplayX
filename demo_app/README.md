# Demo App

ReplayX uses this intentionally buggy demo app to prove the diagnosis and fix loop during the hackathon.

## Stack

- Node.js
- TypeScript
- native `node:http` server
- no web framework and no database

## Start

```bash
pnpm demo-app
```

The app serves:

- `GET /health`
- `GET /api/repro/checkout-race?mode=concurrent|serial`
- `GET /api/repro/auth-refresh?idleMinutes=30`
- `GET /checkout/summary?fixture=missing-taxes|complete-quote`

## Incident Mapping

- `incident-checkout-race-001` -> [demo_app/src/checkout/submit-order.ts](/Users/sourabhkapure/Desktop/ReplayX/demo_app/src/checkout/submit-order.ts), [demo_app/src/inventory/reserve-stock.ts](/Users/sourabhkapure/Desktop/ReplayX/demo_app/src/inventory/reserve-stock.ts), [demo_app/src/queue/checkout-worker.ts](/Users/sourabhkapure/Desktop/ReplayX/demo_app/src/queue/checkout-worker.ts)
  The bug is a stale inventory snapshot check before an async delay, so concurrent orders can drive inventory negative.
- `incident-auth-session-002` -> [demo_app/src/auth/refresh-session.ts](/Users/sourabhkapure/Desktop/ReplayX/demo_app/src/auth/refresh-session.ts), [demo_app/src/auth/token-store.ts](/Users/sourabhkapure/Desktop/ReplayX/demo_app/src/auth/token-store.ts), [demo_app/src/middleware/require-session.ts](/Users/sourabhkapure/Desktop/ReplayX/demo_app/src/middleware/require-session.ts)
  The bug is that idle-session refresh reuses the old expired access token instead of rotating a new one.
- `incident-null-shape-003` -> [demo_app/src/orders/quote-adapter.ts](/Users/sourabhkapure/Desktop/ReplayX/demo_app/src/orders/quote-adapter.ts), [demo_app/src/orders/build-summary.ts](/Users/sourabhkapure/Desktop/ReplayX/demo_app/src/orders/build-summary.ts), [demo_app/src/routes/order-summary.tsx](/Users/sourabhkapure/Desktop/ReplayX/demo_app/src/routes/order-summary.tsx)
  The bug is a null `taxes` array from upstream that is used with `.reduce()` without normalization.

## Repro Commands

- `pnpm demo-app:checkout-race`
- `pnpm demo-app:auth-refresh -- --idle-minutes 30`
- `pnpm demo-app:null-shape -- --fixture missing-taxes`
