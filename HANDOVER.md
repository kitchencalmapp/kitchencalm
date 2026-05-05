# Kitchen Calm — Project Handover

**Date:** May 2026 (updated after May build sprints)
**Status:** Live and in active development

---

## App Overview

**Name:** Kitchen Calm
**URL:** https://kitchencalm.app
**Tagline:** One step at a time

Kitchen Calm is a mobile-first web app that helps adults with ADHD get dinner (or breakfast) on the table without getting overwhelmed. Instead of showing a wall of recipes, it matches meals to how the user feels right now — energy level, dietary needs, and what they already have in the cupboard. The experience is designed to reduce decision fatigue and prevent the common ADHD cooking failure mode: standing in the kitchen, frozen, unable to start.

---

## Target Audience

- **Primary:** Adults with ADHD who struggle to cook dinner after a long day
- **Dietary:** Halal households — all meals are labelled, and the food type categories (Lamb & Beef, Chicken, Fish) are weighted toward halal-friendly options
- **Geography:** UK — ingredient names, spelling, and product references are UK English
- **Device:** Mobile-first; desktop shows a QR code banner prompting users to scan and open on their phone

---

## Features Built

### Core flow
- **Collapsible home screen** — Accordion layout with five sections. Section 1 (always visible): app header + meal type tabs. Section 2 "⚡ Energy Level" (collapsible): energy buttons with taglines ("Nearly empty", "Getting there", "Full tank"). Section 3 "🔍 Filters" (collapsible): all filters, food type, portion size. Section 4 (always visible): CTA button (`.home-cta-wrap`). Section 5 (always visible): cook history and bottom actions. First-time users see Energy expanded and Filters collapsed; return users restore saved state. State stored in `kc_accordion`.
- **Meal type tabs** — Breakfast / Lunch / Dinner toggle on the home screen. Active tab is filled green with white text and a ✓ badge (`.meal-type-tab.active::after`). Count on the CTA button updates in real time as tabs and filters change.
- **Live CTA button count** — Shows "(12 options)" instantly when any filter or energy level changes. Turns amber for 1–2 matches ("⚠️ Only 2 meals match"), turns red/orange for zero matches ("No meals match — try fewer filters").
- **Energy selection** — Low / Medium / High energy levels, picked on the home screen accordion or dedicated energy screen. All energy levels now show one meal at a time with prev/next navigation (not batch shuffle).
- **Meal navigation** — Universal prev/next for all energy levels. "← Previous" / "Next option →" buttons. "Option X of Y" counter. When all meals are seen it loops back with a toast. Low energy picks the best single option first; medium/high picks randomly from the pool. A persistent "🔄 Start over — change energy or filters" button always appears below the nav; tapping it goes to the home screen (`go('home')`). The shuffle button (`btn-shuffle`) has been fully removed — deleted from HTML, all JS references stripped, and CSS rule deleted.
- **Meals screen** — Meal cards with prep time, cook time, cleanup badge, halal/vegan/vegetarian labels, pantry readiness badge, and star rating if previously cooked.
- **Recipe screen** — Ingredients checklist (tap to tick off), numbered steps with progress bar, cleanup plan, portion scaling, wakelock indicator.

### Cooking support
- **Cook Mode** — Full-screen, one-step-at-a-time guided cooking. Progress bar at top. Previous step shown as context. Wakelock keeps screen on. Paywall triggers after 3 uses.
- **Rescue Mode** — Ultra-minimal one-step view with 3–5-word rescue steps. Large text, zero visual noise. Accessible from the home screen and the recipe screen. Always free.
- **Inline timers** — Auto-parsed from step text (detects "5 minutes", "2–3 min", "until golden"). Tap any timer pill to open a countdown sheet. Multiple simultaneous timers. Vibrate + audio chime + screen flash on completion.
- **Interruption recovery** — "I got interrupted" button saves current meal to localStorage. A resume card appears on the home screen next visit.

### Filtering & personalisation
- **Dietary filters** — Low Carb, Grain Free, Clean, Quick (under 20 min), Easy wash (minimal washing up). All update the CTA count instantly on tap.
- **Prep time filters** — No prep / Quick prep / Some prep.
- **Food type categories** — Chicken, Lamb & Beef, Fish, Eggs, Vegetarian, Pasta & Rice, Soups & Stews, Breakfast (horizontal scroll pill row).
- **Portion size** — Just me / Two of us / Family (1×, 2×, 4×). Ingredients scale automatically including fractions.
- **Smart filter relaxation** — When active filters return 1–2 results, meals are shown alongside a "Only X meal(s) match all your filters" banner with individual removable filter pills. When filters return 0 results, a helpful empty state shows removable pills — never a blank screen.
- **Accordion subtitles** — When the Energy or Filters accordion is collapsed, a subtitle shows the active state at a glance ("— Low 🌙" or "— Low Carb · Quick").
- **Preferences remembered** — All filter/energy/portion/meal-type and accordion state saved to localStorage and restored on next visit.

### Meal library
- **89 meals total** across low, medium, and high energy pools
- **Dinner meals** — wide range across all energy levels including halal chicken, lamb, beef, fish, eggs, vegetarian, pasta, soups
- **Breakfast meals** — 15 meals across all energy levels (in `meals-breakfast.js`)
- **Lunch meals** — 30 meals across all energy levels (5 per energy level added this session); count shown on lunch tab reflects actual lunch meals available
- **10 new halal low-carb quick dinners** added to the low energy pool: Beef Lettuce Wrap Tacos, Garlic Butter Prawns & Courgetti, Spiced Chicken & Cucumber Salad, Tuna & Avocado Bowl, Beef Mince & Egg Scramble, Grilled Lamb Chops & Salad, Prawn & Avocado Lettuce Cups, Spiced Turkey Mince & Cauliflower Rice, Pan-Fried Salmon & Asparagus, Halal Chicken & Vegetable Omelette. All are ≤15 min, `lowCarb: true`, labelled halal, with full steps, ingredients, and rescueSteps.

### Pantry & shopping
- **My Cupboard** — Tap to mark ingredients you have. Grouped by Fridge / Cupboard / Produce / Protein. First-time visitors see a welcome banner ("What's in your cupboard?") explaining defaults; dismissible via "Got it" button which sets `kc_pantry_welcomed` flag.
- **Meal readiness badges** — Meals show "Ready to cook" or "Missing N items" based on pantry.
- **Shopping List** — Add missing ingredients from any recipe with one tap. Check off items while shopping. "Done shopping" updates pantry automatically.

### History & ratings
- **Cook it Again** — Last 3 cooked meals shown on home screen; "See all N meals" opens a full-screen history view (`screen-history`) with back button to home.
- **Recipe ratings** — 1–5 stars on cook completion. Rating displayed on meal cards and history.

### Feedback (GDPR compliant)
- **Formspree form** — Feedback POSTs to `https://formspree.io/f/xrejpoyg` via HTTPS. No email app opens. Fields: star rating, message, optional email, consent checkbox.
- **GDPR consent** — Checkbox required before submit. If unticked: checkbox shakes and error message shows. Privacy notice at top of form ("Your feedback is private and only used to improve Kitchen Calm. We never share your data. 🔒").
- **Success / error states** — On success: "Thank you! 💚" screen with Back to Home button. On failure: friendly error with direct email fallback and Try Again button. No page redirect.

### Onboarding & UX
- **Onboarding overlay** — 3-slide carousel shown once to new users (skippable).
- **App icon** — Single rising-steam design (one wavy amber line over a pot silhouette), replacing the previous three-steam version. Updated in both the home screen brand area and the onboarding slide 1.
- **Desktop QR banner** — Shown on screens wider than 520px; dismissible. On wide desktop (≥900px): side card with camera hint, QR code, "This app works best on your phone" message, and numbered 3-step instructions. On mid-range (520px–899px): compact top banner with small QR image and short message; camera hint and steps are hidden at this size.
- **Toast notifications** — Lightweight status messages (preferences saved, items added, looping back through meals, etc.).

### Analytics
- **Microsoft Clarity** — Session recording and heatmaps. Tag ID: `wksz03652i`. Loaded in `<head>` of index.html.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Language | Vanilla JavaScript (ES2020, no transpilation) |
| HTML | Single HTML file (`index.html`), all screens in DOM |
| CSS | Custom properties design system (`css/styles.css`) |
| State | In-memory IIFE (`App`) + `localStorage` for persistence |
| Font | Inter via Google Fonts |
| Hosting | Netlify (static, no server-side code) |
| Feedback | Formspree HTTPS POST (`formspree.io/f/xrejpoyg`) |
| Analytics | Microsoft Clarity |
| QR code | `api.qrserver.com` (external, desktop banner only) |
| Build | None — open `index.html` directly or `npx serve .` |

No npm, no bundler, no framework, no backend, no database. Everything runs in the browser.

---

## File Structure

```
index.html                 — All screens (DOM), script tags, Clarity tag
css/
  styles.css               — Design tokens + all component styles
js/
  meals-data.js            — MEALS object: low/medium/high arrays (dinner + lunch meals)
  meals-breakfast.js       — Breakfast meals, injected into MEALS arrays at runtime
  pantry.js                — Pantry module (PANTRY_ITEMS, owned state, shopping list)
  app.js                   — App IIFE: all logic, navigation, rendering
CLAUDE.md                  — Project instructions for Claude Code
HANDOVER.md                — This file
.claude/
  settings.local.json      — Claude Code local settings
```

### Screen IDs in `index.html`

| ID | Purpose |
|---|---|
| `home` | Hub: collapsible energy + filters, CTA button, cook history, actions |
| `energy` | Standalone energy level picker (used when no energy pre-selected) |
| `meals` | Meal cards with prev/next navigation, option counter |
| `recipe` | Full recipe: ingredients, steps, timers, cleanup plan |
| `cook` | Full-screen Cook Mode (one step at a time) |
| `rescue` | Rescue Mode (ultra-minimal, large text) |
| `pantry` | My Cupboard ingredient tracker |
| `shopping` | Shopping list |
| `feedback` | GDPR feedback form (Formspree) with success/error states |
| `history` | Full-screen all cooked meals list with back button |
| `soon` | Generic coming-soon placeholder |

### localStorage keys

| Key | Contents |
|---|---|
| `kc_prefs` | homeEnergy, filters, prepFilter, portionSize, mealType |
| `kc_accordion` | `{ energy: bool, filters: bool }` — accordion open/closed state |
| `kc_history` | Last 20 cooked meals (id, energy, name, emoji, time) |
| `kc_ratings` | Map of mealId → star rating (1–5) |
| `kc_interrupted` | In-progress meal id, energy, name, emoji |
| `kc_cook_uses` | Count of Cook Mode uses (paywall triggers at 3) |
| `kc_onboardingDone` | Flag — onboarding not shown again |
| `kc_desktopBannerDismissed` | Flag — QR banner not shown again |
| `kc_pantry_welcomed` | Flag — Cupboard welcome banner not shown again |

---

## What Still Needs Building

1. **Partner Mode** — Tips for partners/carers on how to help. How to offer choices, when to step in, what not to say. Likely a separate screen accessible from home.
2. **Nutrition estimates** — Rough calories and macros per meal. ADHD and diet intersect a lot; users have asked for this. Needs data added to each meal object.
3. **Cloud sync / accounts** — All data is currently device-local. Syncing across devices requires auth. This is the prerequisite for a proper Pro subscription model.

---

## Monetisation Plan

**Free tier** — Full app access. Cook Mode is free for first 3 uses per device. Timer and Rescue Mode are always free.

**Paywall** — After 3 Cook Mode uses, a bottom sheet appears offering Pro. "Continue free" always works and resets the counter to 0 (soft gate, not a hard block — intentional, respects the ADHD user who can't handle friction).

**Pro tier** (not yet built) — Unlimited guided cooking, plus future premium features (nutrition, account sync, advanced timer features, partner mode). Pricing not yet decided.

**Revenue model** — One-time purchase or low monthly subscription. The "aha moment" from competitor research (Sidekick, Mealime) consistently happens during active cooking, not browsing — so Cook Mode is the right thing to gate.

---

## Key Decisions and Why

**No framework, no build step.** Keeps the app simple to run, share, and deploy. No toolchain to break. Easy for a non-developer to open and understand.

**Single HTML file with screen toggling.** `App.go('screen-id')` adds/removes the `active` class. Simple mental model, no routing library needed.

**Collapsible accordion home screen.** The home screen had grown heavy with energy buttons, filters, categories, and portion size all visible at once. Breaking into collapsed sections (Energy / Filters) reduces visual load on return visits while keeping everything accessible. State is persisted so the user's preferred layout is remembered.

**Live CTA button count.** The count updates the instant any filter or energy button is tapped. Color-coded: green for plenty, amber for 1–2 matches, red for zero. This gives immediate feedback that filters are working, reducing the "is it broken?" confusion that was a reported pain point.

**Unified prev/next navigation for all energy levels.** Previously medium/high energy showed 3 meals at once with a batch shuffle. Now all energy levels show one meal at a time with prev/next. This is more consistent, less overwhelming, and loops back with a message when all meals have been seen. The energy level still determines which pool of meals is drawn from.

**Quick filter at under 20 minutes.** The original 15-minute threshold was too restrictive — it excluded many genuinely quick meals. 20 minutes is a more natural threshold for "quick" in a cooking context.

**Smart filter relaxation instead of empty states.** When filters leave only 1–2 results, those meals are shown alongside a banner naming the active filters as removable pills. This is more useful than a blank state and respects that the user might only want to remove one filter, not all of them.

**Formspree for feedback, not mailto.** The original mailto approach opened the user's email app, which broke the in-app experience and had no GDPR-compliant consent mechanism. Formspree gives a proper HTTPS POST with in-app success/error states and no data leaving without consent.

**Soft paywall, not hard block.** "Continue free" always works. ADHD users bounce immediately from friction or guilt. The goal is to make them love the app first, then invite them to support it.

**Halal labels on all qualifying meals.** UK has a large Muslim population with ADHD; halal cooking apps are underserved. Every qualifying meal is tagged and the food type categories (Lamb & Beef etc.) align with halal-friendly cooking.

**Rescue Mode always free.** The user who hits "I'm overwhelmed" is in crisis. Paywalling crisis support would be wrong and would destroy trust.

**Wakelock API.** Cooking with a phone that keeps going to sleep is a major ADHD friction point. Wakelock keeps the screen on during recipe and cook mode; a visible "🔆 Screen on" indicator confirms it's active.

**Inline timer parsing.** Instead of requiring users to manually set timers, the app auto-detects time mentions in step text and injects one-tap timer buttons. Reduces cognitive load mid-cook.

**Portion scaling.** Ingredients scale automatically with fraction formatting (⅓ → ⅙ etc.) because halving a recipe manually is genuinely hard for ADHD brains mid-task.

---

## User Feedback Received

Feedback collected via the in-app Formspree form (sent to feedback@kitchencalm.app). Microsoft Clarity provides session recordings and heatmaps.

Key themes that have shaped development:

- Cook Mode (step-by-step) was the most-requested feature — users wanted something to keep them on track mid-cook
- Timers were requested alongside Cook Mode — users didn't want to context-switch to the clock app
- The home screen felt too heavy on return visits — led to the accordion redesign
- Filter count not updating in real time created confusion about whether filters were working — led to the live CTA count fix
- Halal labelling identified as a gap in competitors (Sidekick, Mealime do not label halal)
- The paywall "Continue free" option was designed around the finding that ADHD users need trust before they'll pay

---

*Last updated: 5 May 2026 (session 2). For questions contact info4rh@gmail.com.*
