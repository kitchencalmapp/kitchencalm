# Kitchen Calm — Claude Code Instructions

## Read this first, every session

Before making any change, identify the exact file and line. Do not read files
you are not changing. Do not suggest improvements beyond the task. Do not add
comments to code. Make the change, verify it, stop.

---

## Project facts

- Vanilla JS, no framework, no build step, no npm
- Single HTML file (`index.html`), all screens toggled by `App.go('screen-id')`
- CSS lives in `css/styles.css` only — no inline styles except `display:none` toggles
- All app logic lives in `js/app.js` as a single IIFE (`const App = (() => { ... })()`)
- Meal data: `js/meals-data.js` (dinner + lunch), `js/meals-breakfast.js` (breakfast)
- Pantry logic: `js/pantry.js`
- No backend, no database, no API calls except Formspree feedback form
- Hosted on Netlify — deploy by pushing to main branch
- Test locally with `npx serve .` then open `http://localhost:3000`

---

## Language and style rules

- UK English throughout — "colour" not "color" in copy, "cupboard" not "cabinet"
- All user-facing text: sentence case, never ALL CAPS, never Title Case
- No emoji in code comments
- Never include the word "Halal" in a meal name — halal status is shown via `labels: ['halal']` which renders as a chip on the card. The app is halal-first by design; the meal name should simply describe the dish (e.g. "Chicken Wrap" not "Halal Chicken Wrap")
- CSS variables only for colours — never hardcode hex in new rules
- Existing hex values (`#4D8B7A`, `#3A6E60` etc.) are only used where CSS variables
  don't exist yet — do not introduce new hardcoded hex values
- JS: `const` and `let` only, no `var`
- No `console.log` left in production code

---

## File change rules

- Only edit files explicitly named in the task
- Never reformat, re-indent, or reorganise code outside the changed lines
- Never rename variables, functions, or CSS classes unless the task says to
- Never add new localStorage keys without adding them to the HANDOVER.md table
- Never add new screen IDs without adding them to the HANDOVER.md table
- When adding a new meal, follow the exact object shape of an existing meal in
  the same energy level array — same keys, same order

---

## Meal data shape (required keys for every meal object)

```js
{
  id: 'unique-kebab-case-id',
  name: 'Meal Name',
  emoji: '🍳',
  description: 'One sentence. Warm, simple, no jargon.',
  mealType: 'dinner',        // 'breakfast' | 'lunch' | 'dinner'
  time: 20,                  // total minutes (integer)
  prepTime: 5,               // prep minutes (integer)
  cookTime: 15,              // cook minutes (integer)
  serves: 2,                 // integer
  cleanupScore: 'green',     // 'green' | 'yellow' | 'red'
  category: 'chicken',       // see CATEGORIES in app.js
  labels: ['halal'],         // array: 'halal' | 'vegetarian' | 'vegan'
  lowCarb: false,            // boolean
  grainFree: false,          // boolean
  cleanEating: false,        // boolean
  naturallySweet: false,     // boolean
  containsSugar: false,      // boolean
  ingredients: ['...'],      // UK English, specific quantities
  steps: ['...'],            // plain sentences, each a single action
  minSteps: ['...'],         // 3–5 ultra-short rescue steps
  rescueSteps: ['...']       // 3–5 calm one-line steps for rescue mode
}
```

---

## CSS variable reference (most used)

```
--bg            page background
--surface       white card background
--surface-2     light grey input background
--primary       #4D8B7A brand green
--primary-dark  #3A6E60
--primary-light #EAF3F1
--low           purple  (low energy)
--low-bg        light purple
--medium        amber   (medium energy)
--medium-bg     light amber
--high          coral   (high energy)
--high-bg       light coral
--text          primary text
--text-2        secondary/muted text
--text-3        hint text
--border        rgba(0,0,0,0.08)
--r             14px border radius
--r-lg          20px border radius
```

---

## What still needs building (do not start unless asked)

1. Partner Mode — tips screen for carers/partners
2. Nutrition estimates — calories/macros per meal object
3. Cloud sync / accounts — prerequisite for Pro tier
4. Cupboard onboarding — first-run prompt to set pantry defaults

---

## Prompt efficiency notes

- When writing meal objects, keep steps arrays single-line (one string per step on one line) rather than multi-line
- Do not read files not mentioned in the prompt
- Make all changes in one pass
- Do not add commentary or explanations after making changes

---

## End of every session — mandatory, no exceptions

When the task is complete, you MUST update `HANDOVER.md`. This is required
even if you think nothing significant changed. Do not skip this. Do not just
update the date. Work through each item below explicitly:

1. **CSS/HTML changes** — update the relevant feature description in
   "Features Built" to reflect the new behaviour. Even small wording changes
   count (e.g. "active tab is now filled green with ✓ badge").
2. **New meals** — update the total count and add meal names to the list.
3. **New features** — add a new bullet under "Features Built".
4. **New localStorage keys** — add to the localStorage keys table.
5. **New screen IDs** — add to the screen IDs table.
6. **What Still Needs Building** — remove anything just completed.
7. **Date** — update to today's date in the format `D Month YYYY`.

After updating HANDOVER.md, print a one-paragraph plain English summary of
every file changed this session and what was changed. This becomes the
handover note for the next session.

## Meal object shape

// KITCHEN CALM — MEAL OBJECT TEMPLATE
// Copy this shape exactly for every new meal.
{
  id: 'kebab-case-unique-id',       // unique, never reuse
  name: 'Display Name',             // describe the dish only — never prefix with "Halal"
  emoji: '🍳',
  time: 20,                         // total minutes (prep + cook)
  prepTime: 5,
  cookTime: 15,
  serves: 2,
  tag: 'Short label',               // e.g. 'Cupboard staple', 'High protein'
  mealType: 'dinner',               // 'breakfast' | 'lunch' | 'dinner'
  labels: ['halal'],                // any of: 'halal','vegetarian','vegan'
  description: 'One sentence. What it is and why it works.',
  lowCarb: false,                   // true if no bread/pasta/rice/potato
  grainFree: false,                 // true if no grains at all
  cleanEating: false,               // true if whole foods, no processed
  containsSugar: false,
  naturallySweet: false,
  cleanupScore: 'yellow',           // 'green'=1 pan | 'yellow'=2-3 | 'red'=4+
  category: 'chicken',              // 'chicken'|'lamb-beef'|'fish-seafood'|
                                    // 'eggs'|'vegetarian'|'pasta-rice'|
                                    // 'soups-stews'|'breakfast'
  ingredientIds: ['chicken-breast', 'rice', 'garlic'],  // IDs from pantry.js only
  ingredients: ['2 chicken breasts', '180g rice', '2 cloves garlic, minced'],
  steps: [
    'Step one written as a full sentence.',
    'Step two. Short, direct, no waffle.',
    'Final step.'
  ],
  minSteps: [
    'One-line summary of steps 1-2.',
    'One-line summary of steps 3-4.',
    'Final action.'
  ],
  rescueSteps: [       // exactly 5 entries, 3-5 words each, imperative
    'Do the first thing',
    'Do the second thing',
    'Do the third thing',
    'Do the fourth thing',
    'Done'
  ]
}