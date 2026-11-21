# 038 — Desktop and mobile apps

Status: proposed
Date: 2026-11-21

## Goal

Ship Mindboop as a desktop app and a mobile app on the same Rails API with the lowest barrier of entry.

- **Desktop:** the same UI as the web app, plus desktop features.
- **Mobile:** a new UI designed for phones, built from the existing UI components.

## Starting point

- The Rails 8.1 JSON API under `/api` uses Rails 8 cookie-session auth. The session cookie is `httponly` with
  `same_site: :lax`, and CSRF is on.
- The axios client (`apis/axios.ts`) reads the CSRF token from the `<meta>` tag in the HTML that Rails serves,
  and calls the relative base path `/api`.
- The UI is built with React 19 + Vite, shadcn/Radix, Tailwind v4, Tiptap, dnd-kit, react-big-calendar and
  Zustand. All of these are DOM-based.
- The code is layered as `apis/` → `hooks/reactQuery/` → components, so the data layer has no UI in it.
- A `packages/*` pnpm workspace is configured but empty.

## Decisions

| Area | Choice |
| --- | --- |
| Desktop shell | **Electron.** Everything stays in TypeScript and Node, with no new language. It loads the existing Vite build almost unchanged, and its tray, notification, global-shortcut, auto-launch and auto-update APIs are mature and well documented |
| Mobile shell | **Capacitor** (Ionic's runtime, without the Ionic UI kit). The same React + Tailwind + shadcn code runs in a native WebView, so the components carry over. Plugins cover what the timer needs: Local Notifications, Haptics, Preferences/secure storage, Status Bar and App Badge |
| One model | Both shells wrap a Vite build. That means one build tool, one test stack (Vitest + Playwright) and one way of thinking about the app on every platform |
| Rejected: Tauri 2 | Smaller and faster than Electron, and it targets mobile too. But native work needs Rust, and its mobile plugin ecosystem is thinner than Capacitor's. Revisit only if bundle size or memory use becomes a problem |
| Rejected: React Native / Expo | A better native feel, but none of the DOM components (shadcn, Radix, Tiptap, dnd-kit) carry over. Only `apis/`, the query hooks, Zod schemas, constants and utils could be shared. Revisit only if a fully native mobile feel becomes the priority |
| Auth | Add bearer-token auth for native clients alongside the cookie session (see Step 1). The web app keeps cookies + CSRF |
| Code sharing | Move shared code into workspace packages (see Step 3). Each app owns its own screens and routing |
| Platform features | Put them behind a small adapter interface with one implementation each for web, Electron and Capacitor, so feature code never branches on the platform |

## Steps

### 1. Token auth for native clients (backend)

A packaged app loads from `file://` or `capacitor://localhost`, not the Rails origin. So the CSRF `<meta>` tag
is missing, and the `SameSite=Lax` cookie is not sent cross-site.

- `POST /api/session` returns a bearer token when a native client asks for one (for example
  `client: "native"`). The token is backed by the existing `Session` record, as a signed id or a new token
  column.
- `Authentication#resume_session` also accepts `Authorization: Bearer <token>`. CSRF verification is skipped
  only for bearer-authenticated requests.
- `DELETE /api/session` revokes the token.
- Tests cover login with a token, an invalid or revoked token, and CSRF still enforced for cookie requests.
  Update `docs/api.md`.

### 2. Portable API client

- `baseURL` comes from build-time config (`VITE_API_URL`): relative `/api` on web, the absolute Railway URL in
  native builds.
- Auth headers are pluggable: the CSRF header on web, the bearer token on native.
- The token is stored in the OS keychain: Electron `safeStorage` on desktop, a secure-storage plugin on
  Capacitor.

### 3. Extract shared packages

```
packages/
├── core/      # apis/, apis/types.ts, hooks/reactQuery/, constants (QUERY_KEYS), Zod schemas, utils
└── ui/        # components/ui (shadcn), Tailwind theme + styles, reusable pieces (Timer Dial, Clock, …)
app/frontend/  # web app (Rails + vite_ruby), imports @mindboop/core and @mindboop/ui
apps/
├── desktop/   # Electron main + preload, renders the web app's screens
└── mobile/    # Capacitor, new mobile screens and routing
```

- Move code in small steps, keeping `pnpm lint && pnpm typecheck && pnpm test` green after each one.
- Update `.agents/rules/code-standards.md` with the new layout.

### 4. Platform adapters

The interface, implemented for web, Electron and Capacitor:

- `notify(title, body)`
- `scheduleSessionEnd(endsAt)` / `cancelSessionEnd()`
- `playSound(name)`
- `secureStorage.get/set/remove`

On mobile, JS is suspended in the background, so the "session ended" alert is a scheduled local notification,
not a JS timer.

### 5. Desktop app (Electron)

- **First cut:** point the window at the deployed Railway URL, so cookies work unchanged. This ships
  desktop-only features early.
- **Desktop features:**
  - tray/menu-bar timer showing the remaining time
  - native notifications on session end
  - global shortcut for quick-capture to the Parking Lot
  - always-on-top mini timer window
  - auto-launch
  - auto-update (electron-updater)
- **Then:** switch to the bundled build and token auth once Steps 1–3 land, so the app starts offline-fast.
- **Packaging:** electron-builder; macOS signing and notarisation.

### 6. Mobile app (Capacitor)

- New phone-first screens built from `@mindboop/ui`:
  - bottom tab navigation (Timer, Inbox, Parking Lot, Calendar)
  - sheets and drawers in place of sidebars and panes
- **Calendar:** a day/agenda view. react-big-calendar does not suit phones.
- **dnd-kit:** configure touch sensors with an activation delay.
- **Tiptap:** test with the on-screen keyboard and safe areas.
- **Native features:**
  - local notifications for session end
  - haptics on start, finish and bail-out
  - status bar styling
  - app badge for active sessions
- **Builds:** iOS and Android through Xcode and Android Studio, with TestFlight / internal testing tracks.

### 7. Tests and CI

- Vitest for the shared packages and each app's screens.
- Playwright for the web app as today. Electron can run Playwright's Electron support.
- CI builds the desktop and mobile web bundles. Signed native builds are a manual release step at first.

## Out of scope

- Offline mode and local sync. The apps need the network, as the web app does.
- Push notifications from the server (only on-device scheduled notifications for now).
- iOS Live Activities and widgets. These need native Swift and can come later as a Capacitor plugin.
