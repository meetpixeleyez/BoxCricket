# BoxKhel - Surat's Premier Box Cricket Platform 🏏

A modern, full-stack, mobile-first Box Cricket booking, player matchmaking, and team challenges platform tailored for Surat (Mota Varachha, Adajan, Vesu, Katargam, Pal).

---

## 🌟 Key Features

1. **Turf & Slot Booking Engine**:
   - Live availability & floodlit night slots.
   - 360° netting specs, dimensions, surface type & amenities.
   - Dynamic pricing (Daytime, Prime Floodlight, Weekend).
   - Direct-to-Owner UPI settlement (0% player fee) with customizable advance deposit (e.g. 30%) and 15-minute slot hold timer.

2. **Player & Squad Matchmaking (Find Players Hub)**:
   - **I Need a Team**: Solo players posting availability with skill levels & preferred areas.
   - **Team Needs Players**: Captains posting urgent squad openings with fee splits and auto-filled progress bars.

3. **Teams & Friendly Match Challenges**:
   - Team registration with player roster.
   - Send challenges to rival teams with match date, overs, time, and venue.
   - Live city leaderboard & scorecard tracking.

4. **Production Phone + OTP Authentication**:
   - Secure Phone + 6-digit OTP verification.
   - JWT session management with httpOnly cookies via `jose`.
   - PostgreSQL database schema with Prisma ORM.

5. **Box Ground Owner Registration**:
   - Multi-step onboarding workflow for turf owners with Gujarati/Hindi language support.
   - Instant UPI payout configuration with automatic 3-month platform fee trial waiver.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Vanilla CSS (Mobile-First Stitch Design System)
- **Database**: PostgreSQL with PostGIS support
- **ORM**: Prisma 6
- **Auth**: Phone + OTP + JOSE JWT encrypted session cookies
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- PostgreSQL (running locally or cloud instance)

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your database credentials:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5433/boxkhel_db?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5433/boxkhel_db?schema=public"
NEXTAUTH_SECRET="your_production_secret_jwt_key_2026"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup & Seeding
```bash
# Push schema to PostgreSQL database
npx prisma db push

# Seed initial demo accounts and ground data
npx tsx prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Mobile App UI
Designed with responsive mobile container (`max-w-[480px]`) and fixed 5-tab bottom navigation (`Home`, `Players`, `Bookings`, `Teams`, `Profile`).

---

## 📄 License
MIT License © 2026 BoxKhel Platform.
