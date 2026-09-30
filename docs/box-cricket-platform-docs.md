# Box Cricket Platform: Product & Technical Documentation

**Stack:** Next.js + TypeScript, PostgreSQL (PostGIS), Cloudinary
**Roles:** Player, Box Owner, Admin
**Version:** 1.3 (business decisions finalized, see Section 12)

---

## 1. Problem & Vision

**Problem:** Player ko nearby box cricket ka number, availability aur slot pata nahi hota. Owners ko baar-baar calls aati hain. Team mein 14 players chahiye aur 7 hi hain to plan cancel ho jata hai.

**Vision:** Ek jagah jahan player (1) nearby box dhoondhe, (2) slot book kare, (3) missing players dhoondhe, (4) doosri team ko challenge kare, (5) review de. Owner ko digital bookings mile, bina padhe-likhe hue bhi (Admin help se).

**Unique Selling Points:** Box booking + player matching + team challenge, sab ek app mein.

---

## 2. Analysis: Idea ki Strengths, Gaps aur Suggestions

### Strengths
- Real daily pain point hai, aur teeno cheezein (booking, players, challenge) ek jagah koi nahi deta.
- Admin-assisted onboarding zaroori hai kyunki owners tech-savvy nahi hote.

### Gaps / Improvements (important)

| # | Gap | Suggestion |
|---|-----|-----------|
| 1 | **Cold start:** Shuru mein boxes kam honge to players nahi aayenge | Ek city (Surat) se start karo, Admin khud 30-50 boxes onboard kare |
| 2 | **Double booking:** 2 log same slot book kar lein | DB transaction + slot lock (5-10 min hold) + unique constraint |
| 3 | **Team ko players chahiye:** Aapne "akela player team dhoondhe" bola, par ulta case (team ko 7 players chahiye) bhi main problem hai | **"Team Post"** add karo: "Aaj 9 PM, 7 players chahiye" |
| 4 | **Privacy:** Player ki exact location/number dikhna nahi chahiye | Sirf approx distance dikhao; number request accept hone ke baad hi |
| 5 | **Fake reviews** | Sirf completed booking wale player review de sakein |
| 6 | **No-show risk** | Owner-optional advance payment (Section 4.4) + repeated no-show pe player restrict |
| 7 | **Owner unstudied:** app use nahi kar sakta | Admin panel + WhatsApp/SMS notifications + Hindi/Gujarati language + simple UI |
| 8 | **Player status expiry:** "Finding" status purana ho jata hai | Status ka time window rakho (jaise aaj 8-11 PM), auto-expire |
| 9 | **Safety/Abuse:** spam requests, fake profiles | Phone OTP login, block/report, request rate-limit |
| 10 | **Owner ke offline bookings:** Walk-in ya phone bookings | Owner/Admin manual slot "blocked/booked" mark kar sake, warna calendar galat hoga |
| 11 | **Cancellation/refund** | FINAL: har owner apni refund policy khud set karega; app default suggestion dega (Section 4.4) |
| 12 | **Challenge feature ko engagement chahiye** | Match result + team leaderboard (Phase 3) |

### Revenue Model (FINAL)
- **Player se koi charge/commission nahi.**
- **Owner se sirf 5% per booking** (app se aayi completed booking par). Offline/walk-in par kuch nahi. Detail Section 4.10.
- Future: featured listing (optional).

### Login
Sab roles ke liye **phone number + OTP** (email nahi). Sirf phone hi identity hai.

---

## 3. Roles & Permissions

| Role | Kya kar sakta hai |
|------|-------------------|
| **Player** | Search, book, team banana, availability post, request bhejna, challenge, review |
| **Box Owner** | Apne ground/boxes manage, slots/price set, bookings dekhna/accept, reviews dekhna |
| **Admin** | Sab kuch: owners register karna, owner ki taraf se edit, verify, disputes, reports, ban |

---

## 4. Feature Modules (Detailed)

### 4.1 Auth & Profile
- Phone OTP login (SMS/WhatsApp provider), role select karke signup.
- Player profile: name, photo, city, playing role (batsman/bowler/all-rounder), skill level, default location.
- Owner profile: name, phone, business name.

### 4.2 Box Ground Management (Owner / Admin)
**Ground (venue) level:** name, description, phone, address (line, area, city, state, pincode), map location (lat/lng via current location ya map pin), amenities (parking, washroom, lights, water, seating), images, open days.

**Box (unit) level, ek ground mein 1..N boxes:**
- Name (Box A, Box B)
- Type: Open / Closed / 360°
- Size: width x height (feet)
- Max players (e.g. 6v6, 7v7)
- Price per slot (weekday / weekend / peak-hour pricing optional)
- Images (multiple, Cloudinary)
- Active / Inactive

**Availability:**
- Weekly timing template (e.g. Mon-Sun, 6 AM-2 AM).
- Slot duration (60/90/120 min) per box.
- Holiday / maintenance block.
- Manual block for offline bookings.

**Payment Settings (Owner / Admin, per ground):**
- UPI ID + account name, aur/ya apna **QR image upload** (Cloudinary).
- Pay-at-venue (cash/UPI) hamesha allowed.
- **Advance payment: ON/OFF toggle** (owner ki marzi). ON ho to type (% ya fixed ₹) aur value set kare. Koi hard limit nahi, app **suggestion** dikhata hai (10-50%).
- **Refund policy:** owner apne tiers khud set kare (Section 4.4). App pre-filled suggestion dikhata hai jise owner edit kar sakta hai.

### 4.3 Discovery (Player)
- Location: current location ya city/area search.
- Radius filter (2, 5, 10, 20 km).
- Filters: box type, price range, date/time, amenities, rating.
- Sort: distance, rating, price.
- Ground detail page: photos, boxes, price, slots, reviews, map, call button.

### 4.4 Booking & Payments (Direct-to-Owner)
**Platform payment gateway nahi use karta. Paisa seedha owner ke UPI/QR mein jata hai.**

**Booking flow:**
1. Player date + box + slot select karta hai.
2. **Auto-confirm:** slot owner ki available timing ke andar ho to booking turant confirm (owner approval nahi).
3. Slot hold hota hai: 10 min (no advance) ya 15 min (advance required).
4. Player ko owner ka contact + address dikhta hai; owner ko notification.

**Case A: Advance OFF (default):** booking turant `CONFIRMED`, poora payment venue par.

**Case B: Advance ON (owner ne enable kiya):**
1. Booking screen par advance amount dikhta hai (jaise total ₹800, advance 30% = ₹240).
2. Player "Pay via UPI" dabata hai (UPI deep link, amount prefilled) ya owner ka QR scan karta hai.
3. Payment ke baad player **UTR / transaction ID** daalta hai (screenshot optional) aur "I have paid" dabata hai.
4. Booking turant `CONFIRMED` (auto-confirm, player ko wait nahi karna).
5. Owner dashboard mein "Advance received ✅ / Not received ❌" mark karta hai (owner ke bank/UPI app se match karke).
6. "Not received" mark hone par booking cancel, slot free, player ko notification, Admin ko dispute flag.
- Same UTR dobara use nahi ho sakta (unique check).
- Advance ka time-out hold: 15 min mein "I have paid" nahi kiya to slot free.

**Cancellation & Refund Policy (owner-configurable, advance amount par):**
- Har owner (ya Admin uski taraf se) apni policy set karta hai: "start se kitne ghante pehle cancel par kitna % refund".
- Owner ke liye **pre-filled suggestion** (edit kar sakta hai, ya "No refund" chun sakta hai):

| Cancel timing (start se pehle) | Suggested refund of advance |
|---|---|
| 12 ghante ya zyada | 30% |
| 3 se 12 ghante | 20% |
| 1 se 3 ghante | 10% |
| 1 ghante se kam | 0% |

- Policy player ko **booking se pehle** ground page aur payment screen par clearly dikhti hai.
- Booking ke time ki policy booking ke saath **snapshot** hoti hai; baad mein owner badle to purani booking par purani policy lagu.
- Advance nahi liya gaya ho to cancel free, koi refund/penalty nahi.
- **Owner ki taraf se cancel** (ground band, maintenance, weather for open box): **100% refund**.
- Refund owner khud UPI se karta hai (policy ke hisab se amount app calculate karke dikhata hai); app mein "Refund due ₹X" dikhta hai aur owner "Refunded" mark karta hai. Pending refund par Admin nazar rakhta hai.
- Cancelled slot turant dobara book ho sakta hai.
- Repeated no-show / false payment claim par player restrict.

**Booking status:** `HELD → CONFIRMED → COMPLETED / CANCELLED / NO_SHOW`
**Payment status:** `UNPAID → ADVANCE_PAID → FULLY_PAID` (ya `REFUND_DUE → REFUNDED`)

### 4.5 Find Players (Aapka "Finding for playing" feature)
**A. Solo player (availability post):**
- Player post karta hai: date, time window, home location, **radius** (e.g. 5 km), skill, role.
- **Matching rule (dono taraf ka radius):** Player ko wahi teams dikhein jinki booking/post player ke radius ke andar ho, aur team ko wahi player dikhein jiske radius mein team ka location aata ho.
- Player "Join request" bhejta hai; team leader **Accept / Reject (with message)** karta hai.
- **Phone number pehle se visible:** request ke time bhi aur profile par bhi number dikhta hai, taaki accept se pehle call karke baat ho sake. Signup par consent checkbox: "mera number platform ke doosre users ko dikhega".

**B. Team post (jo aapne miss kiya):**
- Team leader post karta hai: "Aaj 9 PM, Box X, 7 players chahiye", ya booking se auto-link.
- Nearby available players ko notification.
- Slots fill hone par post auto-close.

### 4.6 Teams & Challenges
- Team create: name, logo, members (invite by phone), captain.
- **Challenge:** Team A apni team vs Team B ko challenge kare: date, time, box (optional), overs. **Sirf friendly match, koi entry fee / prize money nahi.**
- Team B: Accept / Decline / Counter (different time).
- Accept hone par box booking flow (ek captain book kare; payment aapas mein, platform split nahi karta).
- Match ke baad score/result submit (dono captains confirm karein) → team stats.

### 4.7 Reviews & Ratings
- Booking `COMPLETED` hone ke baad hi review.
- Rating (1-5), comment, photos (team photo).
- Owner reply kar sakta hai.
- Admin abusive review hide kar sakta hai.
- Average rating ground par dikhe.

### 4.8 Admin Panel
- Dashboard: bookings, revenue, new users, active grounds.
- **Owner onboarding on behalf:** owner ka phone + ground details bharo, images upload, boxes/slots setup. Owner ko OTP login se access milta hai (claim account).
- Ground verify / suspend, owner edit ("act as owner" with audit log).
- User management: block/unblock, reports.
- Bookings & disputes, manual refund marking.
- Review moderation.
- Broadcast notifications.
- **Audit log:** admin ne owner ki taraf se kya change kiya.

### 4.9 Notifications
Push/SMS/WhatsApp: booking confirmed, owner ko new booking, request received/accepted/rejected, challenge received, reminder (booking se 2 ghante pehle), review reminder.

### 4.10 Platform Fee (Owner only)
- **Player: hamesha free.**
- **Owner: 5% per booking**, sirf app se aayi **COMPLETED** booking ke total amount par (jaise ₹800 booking = ₹40 fee).
- Offline/walk-in/manual-blocked booking, cancelled booking aur owner-cancelled booking par **koi fee nahi**.
- **Onboarding offer (FINAL):** owner ke register hone (ground VERIFIED hone) ke din se pehle **3 mahine 0% fee**. Uske baad 5% lagu.
- Ledger mein in 3 mahine ki bookings bhi record hongi (fee = 0, status `WAIVED`), taaki owner ko dashboard par dikhe "itna fee bach gaya". DB mein `owners.fee_free_until` date rakho.
- Kyunki payment seedha owner ke paas jata hai, fee **monthly invoice** se lete hain: dashboard par booking-wise hisab (booking amount, 5%, total) dikhta hai, owner platform UPI/QR par pay karta hai. Unstudied owners ke liye Admin collect karke "Paid" mark kar sakta hai.
- Late payment: reminder → grace period → phir hi listing hide (delete nahi). Admin waive kar sakta hai.
- Fee % config mein rakho (env/DB), taaki baad mein badalna aasan ho.

---

## 5. User Stories (with Acceptance Criteria)

### Auth
- **US-1** Player ke roop mein, main phone OTP se login karna chahta hu taaki email ki zaroorat na ho.
  *AC:* Valid OTP par login; 3 galat OTP par 10 min lock; OTP 5 min mein expire.
- **US-2** Owner ke roop mein, main same phone OTP se login karna chahta hu, aur mera Admin-created account mujhe mil jaye.
  *AC:* Phone match hone par existing ground linked dikhe.

### Owner
- **US-3** Owner ke roop mein, main apna ground register karna chahta hu (naam, address, location, photos).
  *AC:* Required fields validate; location map pin ya "use current location" se; min 1 image.
- **US-4** Owner ke roop mein, main ek ground mein multiple boxes add karna chahta hu, har ek ka size/type/price alag.
  *AC:* Box type (Open/Closed/360), width-height, price, max players, images per box.
- **US-5** Owner ke roop mein, main timing aur slot duration set karna chahta hu.
  *AC:* Weekly schedule; holiday block; slots auto-generate.
- **US-6** Owner ke roop mein, main apni bookings dekhna aur offline booking manually block karna chahta hu.
  *AC:* Calendar view; manual block slot player ko unavailable dikhe.
- **US-7** Owner ke roop mein, main reviews par reply karna chahta hu.

### Admin
- **US-8** Admin ke roop mein, main owner ki taraf se ground register kar sakun jab owner khud nahi kar sakta.
  *AC:* Admin owner ka phone daale; ground aur boxes create; audit log entry; owner baad mein login karke dekh sake.
- **US-9** Admin ke roop mein, main kisi ground ko verify/suspend kar sakun.
- **US-10** Admin ke roop mein, main reports/abusive users/reviews handle kar sakun.
- **US-11** Admin ke roop mein, main dashboard se platform metrics dekh sakun.

### Player: Discovery & Booking
- **US-12** Player ke roop mein, main apne nearby box cricket radius ke andar dekhna chahta hu.
  *AC:* Location permission ya manual location; radius filter; distance sorted list.
- **US-13** Player ke roop mein, main ground ki photos, box details, price aur reviews dekhna chahta hu.
- **US-14** Player ke roop mein, main kisi date par available slots dekhna chahta hu.
  *AC:* Booked/blocked/held slots disabled.
- **US-15** Player ke roop mein, main slot book karna chahta hu, aur booking owner ki timing ke andar auto-confirm ho.
  *AC:* Double booking impossible; hold expire hone par slot free; confirmation notification par; owner ka phone/address dikhe.
- **US-16** Player ke roop mein, main booking cancel karna chahta hu aur policy ke hisab se refund mile.
- **US-17** Player ke roop mein, main owner ko seedha call kar sakun.

### Player: Finding Players
- **US-18** Solo player ke roop mein, main apni availability (time + radius) post karna chahta hu.
  *AC:* Radius set; status auto-expire.
- **US-19** Solo player ke roop mein, mujhe sirf woh teams dikhein jinke location par mera radius match kare.
- **US-20** Solo player ke roop mein, main team ko join request bhej sakun.
  *AC:* Ek team ko duplicate request nahi; daily request limit.
- **US-21** Team leader ke roop mein, main request accept ya message ke saath reject kar sakun.
  *AC:* Accept par team ka slot count badhe; full hone par requests auto-close.
- **US-22** Team leader ke roop mein, main "7 players chahiye" post kar sakun.
- **US-23** Nearby player ko team post ka notification mile.

### Teams & Challenge
- **US-24** Player ke roop mein, main team bana kar members add kar sakun.
- **US-25** Captain ke roop mein, main doosri team ko challenge bhej sakun.
- **US-26** Captain ke roop mein, main challenge accept/decline/counter kar sakun.
- **US-27** Captain ke roop mein, main match result submit kar sakun aur doosra captain confirm kare.

### Payments (Direct-to-Owner)
- **US-30** Owner ke roop mein, main apna UPI ID / QR add karna chahta hu taaki payment seedha mere paas aaye.
  *AC:* UPI ID ya QR image (ya dono); Admin bhi owner ki taraf se add kar sake.
- **US-31** Owner ke roop mein, main advance payment ON/OFF kar sakun aur % ya fixed amount set kar sakun.
  *AC:* Toggle OFF ho to player ko advance option nahi dikhe; owner koi bhi value set kar sake; app 10-50% suggestion dikhaye.
- **US-32** Player ke roop mein, advance ON hone par main UPI se pay karke UTR submit kar sakun aur booking turant confirm ho.
  *AC:* UPI deep link amount ke saath; duplicate UTR reject.
- **US-33** Owner ke roop mein, main advance "received / not received" mark kar sakun.
  *AC:* Not received par booking cancel + Admin flag.
- **US-34** Player ke roop mein, main cancel karun to policy ke hisab se refund amount cancel se pehle dikhe.
  *AC:* Refund tier confirm screen par; owner ko "Refund due" dikhe; owner "Refunded" mark kare.
- **US-35** Owner ke roop mein, mera platform fee ka hisab (kitni bookings, kitna fee) dashboard par dikhe.

- **US-36** Owner ke roop mein, main apni refund policy (tiers) khud set kar sakun, app ki suggestion edit karke.
  *AC:* Tiers add/edit/delete; "No refund" option; player ko booking se pehle policy dikhe; purani bookings par purani policy.

### Reviews
- **US-28** Player ke roop mein, match ke baad main rating, comment aur team photo ke saath review de sakun.
  *AC:* Sirf completed booking par; ek booking par ek review.
- **US-29** Player ke roop mein, main reviews dekh kar ground choose kar sakun.

---

## 6. Key Flows

**Booking flow:**
`Search → Ground detail → Pick date → Pick box+slot → Hold (10 min) → Choose payment → Confirm → Notify player+owner → Reminder → Play → Complete → Review prompt`

**Join request flow:**
`Player posts availability → Match engine (mutual radius) → Team leader notified → Request → Accept/Reject(+message) → Contact shared`

**Admin onboarding flow:**
`Admin creates owner (phone) → adds ground/boxes/images/slots → marks verified → Owner logs in via OTP later and sees everything`

**Challenge flow:**
`Team A challenges Team B → B accepts → Book box (one captain pays or split) → Play → Both captains confirm result → Stats updated`

---

## 7. Database Design (PostgreSQL, PostGIS enable karo)

```
users(id, phone UNIQUE, name, role[PLAYER|OWNER|ADMIN], photo_url, city,
      is_blocked, created_at)
player_profiles(user_id PK, playing_role, skill_level, home_location geography(Point))

grounds(id, owner_id→users, name, description, phone, address_line, area, city,
        state, pincode, location geography(Point), amenities jsonb,
        status[PENDING|VERIFIED|SUSPENDED], created_by_admin_id, avg_rating, created_at)
ground_images(id, ground_id, cloudinary_public_id, url, sort_order)

boxes(id, ground_id, name, type[OPEN|CLOSED|THREE_SIXTY], width_ft, height_ft,
      max_players, base_price, slot_minutes, is_active)
box_images(id, box_id, cloudinary_public_id, url)
box_schedules(id, box_id, day_of_week, open_time, close_time, price_override)
box_blocks(id, box_id, start_at, end_at, reason)   -- holiday/offline booking

bookings(id, box_id, player_id, team_id?, start_at, end_at, amount, advance_amount,
         payment_status[UNPAID|ADVANCE_PAID|FULLY_PAID|REFUND_DUE|REFUNDED],
         refund_policy_snapshot jsonb,
         status[HELD|CONFIRMED|COMPLETED|CANCELLED|NO_SHOW],
         hold_expires_at, created_at)
  -- EXCLUDE constraint: same box_id + overlapping time range for active statuses
owner_payment_settings(ground_id PK, upi_id, upi_name, qr_image_url,
                       advance_enabled, advance_type[PERCENT|FIXED], advance_value,
                       refund_tiers jsonb)   -- [{hours_before, refund_percent}]
booking_payments(id, booking_id, kind[ADVANCE|BALANCE], method[UPI|CASH], amount,
                 utr, screenshot_url, status[SUBMITTED|VERIFIED|NOT_RECEIVED],
                 verified_at)   -- UNIQUE(utr, ground_id)
refunds(id, booking_id, percent, amount, reason[PLAYER_CANCEL|OWNER_CANCEL],
        status[DUE|DONE], done_at)
platform_fee_ledger(id, owner_id, booking_id, booking_amount, fee_percent, amount,
                    status[ACCRUED|INVOICED|PAID|WAIVED], period_month)

teams(id, name, logo_url, captain_id)
team_members(team_id, user_id, role, joined_at)

availability_posts(id, player_id, start_at, end_at, center geography, radius_km,
                   skill, note, status[ACTIVE|EXPIRED|MATCHED])
team_posts(id, team_id, booking_id?, needed_players, location geography,
           start_at, status[OPEN|FILLED|CLOSED])
join_requests(id, availability_post_id, team_post_id, status[PENDING|ACCEPTED|REJECTED],
              reject_message, created_at)

challenges(id, from_team_id, to_team_id, proposed_start_at, overs, box_id?,
           booking_id?, status[PENDING|ACCEPTED|DECLINED|COUNTERED|COMPLETED])
match_results(id, challenge_id, winner_team_id, score_a, score_b, confirmed_by_a, confirmed_by_b)

reviews(id, booking_id UNIQUE, ground_id, player_id, rating, comment, reply, is_hidden)
review_images(id, review_id, url)

notifications(id, user_id, type, payload jsonb, read_at, created_at)
reports(id, reporter_id, target_type, target_id, reason, status)
admin_audit_logs(id, admin_id, action, entity, entity_id, before jsonb, after jsonb, created_at)
otp_codes(id, phone, code_hash, expires_at, attempts)
```

**Important DB points:**
- Radius search: `ST_DWithin(location, user_point, radius_m)` + GiST index.
- Double-booking rokne ke liye `EXCLUDE USING gist (box_id WITH =, tstzrange(start_at,end_at) WITH &&) WHERE status IN ('HELD','CONFIRMED')`.
- Expired holds ko cron/job se release karo.

---

## 8. Architecture (Next.js + TS)

- **Next.js App Router**, Route Handlers/Server Actions for API, Zod validation.
- **ORM:** Prisma ya Drizzle (PostGIS queries ke liye raw SQL).
- **Auth:** phone OTP + JWT/session (NextAuth custom credentials ya custom sessions), role-based middleware.
- **Images:** Cloudinary signed uploads (client se direct), auto-optimise/resize.
- **Payments:** Koi gateway nahi. UPI deep link (`upi://pay?pa=...&am=...`) + owner-uploaded QR, UTR manual verify by owner.
- **Notifications:** SMS/WhatsApp (MSG91/Twilio), web push (PWA).
- **Background jobs:** hold expiry, reminders, availability expiry (cron / queue).
- **Maps:** Google Maps ya Mapbox/OSM (location pin + geocoding).
- **Deployment:** Vercel + managed Postgres (Neon/Supabase with PostGIS).
- **PWA:** mobile-first UI, kyunki zyadatar players phone par honge.

**Main API groups:** `/auth`, `/grounds`, `/boxes`, `/slots`, `/bookings`, `/payments`, `/availability`, `/team-posts`, `/requests`, `/teams`, `/challenges`, `/reviews`, `/admin/*`, `/notifications`.

---

## 9. Non-Functional Requirements

- Mobile-first, fast (search < 1s), low-data friendly (Cloudinary compressed images).
- Language: English + Hindi + Gujarati.
- Security: rate-limit OTP, RBAC, input validation, webhook signature verify, sensitive data (phone) masked.
- Data privacy: exact location share nahi.
- Reliability: transactional bookings, unique UTR check, idempotent status updates.
- Accessibility: owner UI bahut simple, bade buttons, icons.

---

## 10. Edge Cases

- Player ne UTR submit kiya par owner ko paisa nahi mila → "Not received" flow + Admin dispute.
- Advance hold time-out ke baad player ne pay kar diya → owner manually confirm/refund; Admin dekhe.
- Owner advance ya refund policy badle to purani bookings par purani setting lagu rahe (snapshot).
- Owner slot block kare jab booking already ho → conflict warn karo.
- Team leader ne 7 accept kiye par booking cancel hui → sabko notify.
- User ki location deny → manual city/area.
- Ground timing midnight cross karti hai (e.g. 6 PM-2 AM) → date-boundary handle.
- Timezone: IST fixed store as UTC.
- Duplicate phone / admin-created owner ka claim.
- Player ne request bheji, phir availability expire ho gayi → request auto-cancel.

---

## 11. Phased Roadmap

**Phase 1: MVP (6-8 weeks)**
Phone OTP auth, Owner + Admin onboarding, grounds/boxes/images/slots, radius search, booking (auto-confirm, pay-at-venue + optional advance via owner UPI/QR), owner booking list, basic notifications.

**Phase 2**
Find players (availability posts + team posts + join requests), reviews & ratings, cancellation/refund, reminders.

**Phase 3**
Teams + challenges + results + leaderboard, owner analytics, promotions/coupons, platform fee billing.

**Phase 4**
Tournaments, subscription/membership, referral, native apps.

---

## 12. Final Decisions Log

| # | Topic | Decision |
|---|---|---|
| 1 | Payment settlement | Direct to owner (UPI ID / QR in payment settings). Koi gateway nahi |
| 2 | Revenue | Player free; owner se 5% per completed app booking, pehle 3 mahine 0% (Section 4.10) |
| 3 | Cancellation/refund | Owner apni policy khud set kare; app default suggestion deta hai (Section 4.4) |
| 4 | Launch | Poora Surat (Admin-led onboarding; areas jaise Mota Varachha, Adajan, Vesu, Katargam, Varachha, Pal, Udhna etc. seed list) |
| 5 | Confirmation | Auto-confirm, owner ki available timing ke andar |
| 6 | Phone visibility | Profile aur request dono mein visible (signup par consent) |
| 7 | Challenge | Sirf friendly, koi prize/entry fee nahi |
| 8 | Advance payment | Owner ka optional toggle (OFF/ON, % ya fixed), koi hard limit nahi, app suggestion deta hai |

### Status
Saare business decisions final hain. Agla step: Phase 1 ka Prisma schema / API spec.
