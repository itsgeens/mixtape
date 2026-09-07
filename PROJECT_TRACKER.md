# Project Tracker: Mixtape Memories

> **Application**: Retro Digital Audio Guestbook Web App  
> **Tech Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Web Audio API, Supabase Database & Storage (with offline LocalStorage fallback), Google Fonts (Outfit, Share Tech Mono, VT323), QRCode Generator  
> **Repository Root**: `file:///c:/Users/User/OneDrive/Documents/Mixtape`

---

## 📊 Quick Status Summary

| Feature / Component | Status | Description |
| :--- | :---: | :--- |
| **Realistic Physical Cassette Visual** | ✅ Complete | Rebuilt [`SpinningReels.tsx`](file:///c:/Users/User/OneDrive/Documents/Mixtape/src/components/cassette/SpinningReels.tsx) to render a physical cassette tape (plastic shell, C-90 sticker label, oval pill window, spinning 3-spoke hubs) |
| **Clean Minimalist Deck UI** | ✅ Complete | Rebuilt [`CassetteDeck.tsx`](file:///c:/Users/User/OneDrive/Documents/Mixtape/src/components/cassette/CassetteDeck.tsx) with cassette, digital counter timer, and 3 circular tactile buttons (Stop, Record, Play Review) |
| **Sequential 4-Step Guest Flow** | ✅ Complete | Step 1: Name Entry -> Step 2: Prompt Card + Shuffle/Record side-by-side -> Step 3: Record Audio & Submit -> Step 4: Optional Polaroid Photo -> Step 5: Saved |
| **Admin Panel & QR Generator** | ✅ Complete | `/admin` dashboard with continuous master tape player, prompt manager (add/delete), and downloadable QR code generator |
| **Supabase SQL Database & Bucket** | ✅ Executed | [`supabase/schema.sql`](file:///c:/Users/User/OneDrive/Documents/Mixtape/supabase/schema.sql) tables (`events`, `prompts`, `recordings`) & `mixtape-recordings` bucket RLS policies executed successfully |
| **Cloud & Offline Storage Engine** | ✅ Complete | Supabase API integration with graceful local storage fallback if env variables are not set |
| **Web Audio Recorder Engine** | ✅ Complete | Native `MediaRecorder` hook + Web Audio API synthesizer for tactile button clicks |
| **Newlywed Master Tape Player** | ✅ Complete | Continuous auto-advance playback engine with timestamped interactive timeline |
| **Dynamic Event Routing** | ✅ Complete | `/e/[eventId]` dynamic guest landing page for multi-wedding support |
| **Production Build Verification** | ✅ Complete | `npm run build` static & dynamic route generation verified clean with zero errors |

---

## 📁 Key File Map

### Core Architecture & Database
* [`supabase/schema.sql`](file:///c:/Users/User/OneDrive/Documents/Mixtape/supabase/schema.sql) - Database tables and storage bucket RLS policies.
* [`src/lib/storage-service.ts`](file:///c:/Users/User/OneDrive/Documents/Mixtape/src/lib/storage-service.ts) - Supabase upload/fetch methods for recordings and prompts with local fallback.
* [`src/types/index.ts`](file:///c:/Users/User/OneDrive/Documents/Mixtape/src/types/index.ts) - TypeScript interfaces (`Recording`, `Prompt`, `EventConfig`).

### Skeuomorphic Audio Components
* [`src/components/cassette/SpinningReels.tsx`](file:///c:/Users/User/OneDrive/Documents/Mixtape/src/components/cassette/SpinningReels.tsx) - Physical cassette tape visual component.
* [`src/components/cassette/CassetteDeck.tsx`](file:///c:/Users/User/OneDrive/Documents/Mixtape/src/components/cassette/CassetteDeck.tsx) - Recorder UI with timer and 3 circular tactile buttons.
* [`src/components/playback/MasterTapePlayer.tsx`](file:///c:/Users/User/OneDrive/Documents/Mixtape/src/components/playback/MasterTapePlayer.tsx) - Master tape continuous playback component.
* [`src/components/playback/InteractiveTimeline.tsx`](file:///c:/Users/User/OneDrive/Documents/Mixtape/src/components/playback/InteractiveTimeline.tsx) - Timeline navigation for recordings.
* [`src/components/polaroid/PolaroidCapture.tsx`](file:///c:/Users/User/OneDrive/Documents/Mixtape/src/components/polaroid/PolaroidCapture.tsx) - Vintage camera snapshot component.

### Page Routes
* [`src/app/page.tsx`](file:///c:/Users/User/OneDrive/Documents/Mixtape/src/app/page.tsx) - Main guest recording page (`/`).
* [`src/app/e/[eventId]/page.tsx`](file:///c:/Users/User/OneDrive/Documents/Mixtape/src/app/e/%5BeventId%5D/page.tsx) - Dynamic event guest recording page (`/e/[eventId]`).
* [`src/app/admin/page.tsx`](file:///c:/Users/User/OneDrive/Documents/Mixtape/src/app/admin/page.tsx) - Admin Panel (`/admin`) for QR Code generation, Prompts management, and Master Tape playback.

---

## 🚀 How to Run & Test

1. **Development Server**:
   ```bash
   npm run dev
   ```
   * Guest Landing Page: `http://localhost:3000`
   * Dynamic Event Page: `http://localhost:3000/e/sarah-john-2026`
   * Admin Panel: `http://localhost:3000/admin`

2. **Supabase Environment Setup** (Optional for live cloud deployment):
   Add to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Production Build Verification**:
   ```bash
   npm run build
   ```
