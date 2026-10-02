---
name: BoxKhel Mobile System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#3f493f'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#6f7a6f'
  outline-variant: '#becabc'
  surface-tint: '#006d36'
  primary: '#005f2e'
  on-primary: '#ffffff'
  primary-container: '#0b7a3e'
  on-primary-container: '#a4ffb8'
  inverse-primary: '#7adb93'
  secondary: '#9c4500'
  on-secondary: '#ffffff'
  secondary-container: '#ff7a1b'
  on-secondary-container: '#5e2700'
  tertiary: '#684e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#866500'
  on-tertiary-container: '#ffe9bd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#96f7ad'
  primary-fixed-dim: '#7adb93'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005227'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb68e'
  on-secondary-fixed: '#331200'
  on-secondary-fixed-variant: '#773300'
  tertiary-fixed: '#ffdf9a'
  tertiary-fixed-dim: '#f4bf32'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#5a4300'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
  surface-bg: '#F6F8F7'
  surface-card: '#FFFFFF'
  text-muted: '#6B7280'
  border-light: '#E5E7EB'
  status-success: '#16A34A'
  status-warning: '#F59E0B'
  status-error: '#DC2626'
  status-info: '#2563EB'
  slot-available: '#ECFDF5'
  slot-booked: '#F3F4F6'
  slot-selected: '#0B7A3E'
typography:
  display:
    fontFamily: Outfit
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  price-display:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 22px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The brand personality is energetic, hyper-local, dependable, and athletic. Tailored specifically for the passionate box cricket subculture in Surat (spanning Mota Varachha, Adajan, Vesu, Katargam, and Pal), the interface marries the vibrant rush of night-turf floodlight cricket with the straightforward clarity demanded by everyday players and ground managers. 

The aesthetic style is **Modern Athletic Functionalism**:
- High-contrast hierarchy prioritizing quick decision-making under outdoor daylight or late-night floodlights.
- Tactile, rounded card surfaces (16px radius) that feel approachable and physical.
- Multilingual accessibility engineered directly into tap targets, spacing, and micro-copy (supporting English, Gujarati, and Hindi seamlessly).
- Trust-first visual cues across advance UPI workflows, venue verification badges, and slot reservations to ensure confidence between local venue owners and community teams.

## Colors

The color palette grounds the experience in the visual language of competitive turf cricket:
- **Primary Turf Green (`#0B7A3E`)**: Represents manicured grass and pitch integrity. Used for key navigation elements, primary headers, active selection states, and verification indicators.
- **Secondary Energy Orange (`#FF7A1A`)**: High-impact accent for primary transaction triggers, match requests, challenge alerts, and booking checkout actions.
- **Accent Yellow (`#FFC93C`)**: Reserved for star ratings, MVP highlights, and urgent status badges.
- **Base Canvas (`#F6F8F7`) & Pure Card Surface (`#FFFFFF`)**: A light, cool-tinted neutral floor that keeps content readable and lets turf greens and vibrant orange CTAs pop cleanly.
- **Text & Structure (`#111827`, `#6B7280`)**: High-contrast slate charcoal for readability under direct sun, balanced by muted slate for secondary metadata, rupee details, and Surat neighborhood tags.

## Typography

Typography pairs geometric, sporty display power (`Outfit`) with clean, utilitarian legibility (`Inter`):
- **Outfit (Headlines & Pricing)**: Delivers an energetic, athletic stance across screen titles, card headers, and Rupee price indicators (`₹`). Its rounded geometry maintains readability without becoming cartoonish.
- **Inter (Body, Forms & Data Tables)**: Guarantees rock-solid clarity across compact mobile screens, complex slot grids, refund tier tables, and multi-language Gujarati/Hindi script renderings.
- All numbers, especially times (`08:00 PM`), slot countdowns (`14:59`), and currencies (`₹1,200`), utilize proportional, legible figures with elevated weights for rapid scanning.

## Layout & Spacing

The design system operates on a rigid 8pt baseline grid tailored for a standard mobile canvas (390x844):
- **Margins & Safe Zones**: Standard horizontal margin is 16px (`margin: 1rem`) on phone viewports to maximize usable surface for multi-column slot pickers and match cards.
- **Touch Ergonomics**: All interactive elements (buttons, chips, calendar date pills, slot triggers) strictly maintain a minimum height of 48px to prevent miss-taps during hurried on-field use.
- **Adaptive Breakpoints**:
  - `Mobile (320px - 480px)`: Single-column feed, sticky bottom checkout sheets, horizontal calendar strips, and scrollable horizontal chips.
  - `Tablet / Web Preview (481px - 1024px)`: 2-column grid for turf browsing and 2-up team challenge dashboards.
  - `Admin Web Dashboard (1440px)`: Fixed 260px left sidebar, fluid 12-column grid container with 24px gutters for dispute, booking, and revenue tables.

## Elevation & Depth

Visual hierarchy uses clean, ambient ground reflections rather than dense, harsh drop shadows:
- **Level 0 (Flat Canvas)**: Hex `#F6F8F7` serves as the canvas background. No elevation.
- **Level 1 (Card & List Elements)**: White surfaces `#FFFFFF` with a 1px soft border in `#E5E7EB` combined with an ambient shadow: `box-shadow: 0 2px 8px -2px rgba(17, 24, 39, 0.05), 0 1px 4px -1px rgba(17, 24, 39, 0.03)`.
- **Level 2 (Dropdowns, Sticky Bottom Bars & Action Triggers)**: Elevated floating bars use `box-shadow: 0 8px 24px -4px rgba(11, 122, 62, 0.12), 0 4px 12px -2px rgba(17, 24, 39, 0.06)`.
- **Level 3 (Modals & Bottom Sheets)**: Overlaid against a 50% backdrop opacity (`rgba(17, 24, 39, 0.5)`), layered sheets carry an elevation of `box-shadow: 0 20px 32px -8px rgba(17, 24, 39, 0.20)`.

## Shapes

The interface embraces a unified curved aesthetic:
- **Cards & Content Blocks**: Fixed 16px corner radius (`rounded-lg` equivalent in this system), providing an approachable, modern app container.
- **Interactive Buttons & Form Fields**: 12px radius on full-width form inputs, text areas, and standard rectangular buttons.
- **Chips, Date Selectors & Badges**: Fully pill-shaped (9999px) for search filter tags, skill role labels (Batsman, Bowler), and slot states to differentiate them from actionable cards.
- **Avatars & Score Indicators**: Circular containers for player profile photos and team crests.

## Components

### Buttons
- **Primary CTA**: Height 48px, background `#FF7A1A`, text `#FFFFFF` (Outfit 16px Semibold), corner radius 12px. Pressed state dims to `#E0650E`.
- **Turf Action / Secondary**: Height 48px, background `#0B7A3E`, text `#FFFFFF`. Used for "Book Slot" and "Confirm Team".
- **Ghost / Outline**: Height 48px, border 1.5px solid `#E5E7EB`, text `#111827`, background `#FFFFFF`.

### Turf Booking Slot Chips
- Grid chips formatted to display time, duration, and pricing:
  - **Available**: White background, `#E5E7EB` border, text `#111827`, green price pill `#ECFDF5`.
  - **Selected**: Background `#0B7A3E`, text `#FFFFFF`, white price pill.
  - **Booked / Held**: Background `#F3F4F6`, border `#E5E7EB`, strikethrough text `#9CA3AF`, unclickable.

### Cards (Ground & Match)
- White container, 16px radius, soft ambient shadow. Top 50% includes ground photo with floating top-left rating badge (`#FFFFFF` pill with `#FFC93C` star + rating text) and top-right area pill (e.g., "Mota Varachha"). Content zone carries ground name, distance, starting price formatted prominently as `₹800/hr`, and quick amenities icons.

### Inputs & Phone Verification
- Form inputs feature 48px height, 12px radius, `#E5E7EB` border, and active focus border in `#0B7A3E`. Phone auth inputs integrate a fixed `+91` flag prefix with bold monospace numeric input.
- OTP verification uses six distinct 48x54px input boxes with smooth auto-advance focus.

### Status Badges & Pills
- **Confirmed**: Background `#DCFCE7`, text `#16A34A`.
- **Pending Verification**: Background `#FEF3C7`, text `#D97706`.
- **Cancelled / Rejected**: Background `#FEE2E2`, text `#DC2626`.
- **Completed**: Background `#F3F4F6`, text `#4B5563`.