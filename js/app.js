// Kitchen Calm — App Logic

const App = (() => {
  const state = {
    energy:             null,
    visibleCount:       6,
    sortBy:             'default',
    homeEnergy:         null,
    mealType:           'dinner',
    filters:            new Set(),
    prepFilter:         null,
    portionSize:        null,
    activeCategory:     null,
    pool:               [],
    displayed:          [],
    selectedMeal:       null,
    interrupted:        null,
    checkedIngredients: new Set(),
    doneSteps:          new Set(),
    shuffleCount:       0,
    seenMealIds:        new Set(),
    mealHistory:        [],
    mealHistoryIndex:   -1,
    cookMode: {
      meal:       null,
      stepIndex:  0,
      totalSteps: 0
    },
    rescue: {
      meal:      null,
      steps:     [],
      stepIndex: 0
    },
    ttsAutoRead: false
  };

  let toastTimer    = null;
  let _wakeLock     = null;
  let _timerCounter = 0;
  const _timers     = [];
  let _activeTimerId = null;
  let _cachedVoices  = [];

  const GENERIC_RESCUE_STEPS = [
    'Take three deep breaths',
    'Open the fridge',
    'Pick one ingredient',
    'Keep it really simple',
    'One thing at a time'
  ];

  // ── Navigation ──────────────────────────────────────────────

  function go(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('screen-' + screenId);
    if (!target) return;
    target.classList.add('active');

    const scrollArea = target.querySelector('.screen-content, .home-content, .cook-body, .rescue-screen');
    if (scrollArea) scrollArea.scrollTop = 0;

    if (screenId === 'recipe' || screenId === 'cook') _acquireWakeLock();
    else if (screenId !== 'rescue')                   _releaseWakeLock();

    if (screenId === 'pantry')   _renderPantry();
    if (screenId === 'shopping') _renderShopping();
  }

  // ── WakeLock ─────────────────────────────────────────────────

  async function _acquireWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try {
      _wakeLock = await navigator.wakeLock.request('screen');
      const el = document.getElementById('wakelock-indicator');
      if (el) el.hidden = false;
      _wakeLock.addEventListener('release', () => {
        const el2 = document.getElementById('wakelock-indicator');
        if (el2) el2.hidden = true;
      });
    } catch (_) {}
  }

  function _releaseWakeLock() {
    if (_wakeLock) { _wakeLock.release().catch(() => {}); _wakeLock = null; }
    const el = document.getElementById('wakelock-indicator');
    if (el) el.hidden = true;
  }

  function leaveRecipe() {
    if (state.selectedMeal) {
      const safe = window.confirm('Is anything still on the stove? 🔥\n\nPress OK once everything is safe.');
      if (!safe) return;
    }
    go('meals');
  }

  // ── Meal type tabs ───────────────────────────────────────────

  function setMealType(type) {
    state.mealType = type;
    _syncMealTypeTabs();
    _updateHeroCTA();
    _savePrefs();
  }

  function _syncMealTypeTabs() {
    document.querySelectorAll('.meal-type-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.type === state.mealType);
    });
  }

  // ── Dietary filters ──────────────────────────────────────────

  function toggleFilter(key) {
    if (state.filters.has(key)) {
      state.filters.delete(key);
    } else {
      state.filters.add(key);
    }
    _syncFilterButtons();
    _updateHeroCTA();
    _updateAccordionSubtitles();
    _savePrefs();
  }

  function _syncFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', state.filters.has(btn.dataset.filter));
    });
  }

  // ── Prep time filter ─────────────────────────────────────────

  function setPrepFilter(key) {
    state.prepFilter = (state.prepFilter === key) ? null : key;
    _syncPrepFilterButtons();
    _updateHeroCTA();
    _updateAccordionSubtitles();
    _savePrefs();
  }

  function _syncPrepFilterButtons() {
    document.querySelectorAll('.prep-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.prep === state.prepFilter);
    });
  }

  // ── Portion size ─────────────────────────────────────────────

  function setPortionSize(size) {
    state.portionSize = (state.portionSize === size) ? null : size;
    _syncPortionButtons();
    _updateHeroCTA();
    _savePrefs();
  }

  function _syncPortionButtons() {
    document.querySelectorAll('.portion-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.size) === state.portionSize);
    });
  }

  // ── Category filter ───────────────────────────────────────────

  function setCategory(cat) {
    if (!cat || cat === 'all') {
      state.activeCategory = null;
    } else {
      state.activeCategory = (state.activeCategory === cat) ? null : cat;
    }
    _renderAllCategoryRows();
    _updateHeroCTA();
    _updateAccordionSubtitles();
    if (state.energy) pickEnergy(state.energy);
    else              _showAllMeals();
  }

  function filterMealGrid(cat) {
    if (!cat || cat === 'all') {
      state.activeCategory = null;
    } else {
      state.activeCategory = (state.activeCategory === cat) ? null : cat;
    }
    state.visibleCount = 6;
    _renderCategoryRow();
    // Always rebuild from all energy buckets so category filter shows all matches
    let pool = [...(MEALS.low || []), ...(MEALS.medium || []), ...(MEALS.high || [])]
      .filter(m => m.mealType === state.mealType);
    if (pool.length === 0) {
      pool = [...(MEALS.low || []), ...(MEALS.medium || []), ...(MEALS.high || [])]
        .filter(m => m.mealType === 'dinner');
    }
    const filtered = _applyFilters(pool);
    const hasFilters = state.filters.size > 0 || state.prepFilter || state.activeCategory;
    if (filtered.length === 0 && hasFilters) {
      state.pool = pool;
      _renderEmptyFilterState();
      return;
    }
    state.pool = filtered.length ? filtered : pool;
    state.seenMealIds = new Set();
    _renderGrid();
    _syncGridFilterButtons();
  }

  function _syncCategories() {
    document.querySelectorAll('.category-pill').forEach(pill => {
      const cat = pill.dataset.category;
      const active = cat === 'all'
        ? !state.activeCategory
        : state.activeCategory === cat;
      pill.classList.toggle('active', active);
    });
  }

  const CATEGORIES = [
    { key: 'all',         label: 'All',           emoji: '✨' },
    { key: 'chicken',     label: 'Chicken',        emoji: '🐔' },
    { key: 'lamb-beef',   label: 'Lamb & Beef',    emoji: '🥩' },
    { key: 'fish-seafood',label: 'Fish',           emoji: '🐟' },
    { key: 'eggs',        label: 'Eggs',           emoji: '🥚' },
    { key: 'vegetarian',  label: 'Vegetarian',     emoji: '🥗' },
    { key: 'pasta-rice',  label: 'Pasta & Rice',   emoji: '🍝' },
    { key: 'soups-stews', label: 'Soups & Stews',  emoji: '🍲' }
  ];

  function _renderCategoryRow() {
    _renderCategoryRowInto('category-row');
  }

  function _renderHomeCategoryRow() {
    _renderCategoryRowInto('home-category-row');
  }

  function _renderCategoryRowInto(id) {
    const row = document.getElementById(id);
    if (!row) return;
    const handler = id === 'home-category-row' ? 'App.setCategory' : 'App.filterMealGrid';
    row.innerHTML = CATEGORIES.map(c => {
      const isActive = c.key === 'all' ? !state.activeCategory : state.activeCategory === c.key;
      return `<button class="category-pill${isActive ? ' active' : ''}"
              data-category="${c.key}"
              onclick="${handler}('${c.key}')"
              aria-pressed="${isActive}">
        <span>${c.emoji}</span>${c.label}
      </button>`;
    }).join('');
  }

  function _renderAllCategoryRows() {
    _renderCategoryRow();
    _renderHomeCategoryRow();
  }

  // ── Apply all filters ────────────────────────────────────────

  function _applyFilters(meals) {
    return meals.filter(meal => {
      if (state.filters.has('low-carb')       && !meal.lowCarb)                    return false;
      if (state.filters.has('grain-free')      && !meal.grainFree)                  return false;
      if (state.filters.has('clean-eating')    && !meal.cleanEating)                return false;
      if (state.filters.has('quick')           && meal.time >= 20)                  return false;
      if (state.filters.has('minimal-washing') && meal.cleanupScore !== 'green')    return false;
      if (state.filters.has('halal-friendly')  && !(meal.labels && meal.labels.includes('halal'))) return false;
      if (state.prepFilter === 'no-prep'    && (meal.prepTime || 0) > 2)            return false;
      if (state.prepFilter === 'quick-prep' && (meal.prepTime || 0) > 5)            return false;
      if (state.prepFilter === 'some-prep'  && (meal.prepTime || 0) > 10)           return false;
      if (state.activeCategory && meal.category !== state.activeCategory)            return false;
      return true;
    });
  }

  // ── Energy selection ─────────────────────────────────────────

  function pickEnergy(level) {
    state.energy = level;

    let pool = (MEALS[level] || []).filter(m => m.mealType === state.mealType);
    if (pool.length === 0) pool = (MEALS[level] || []).filter(m => m.mealType === 'dinner');

    const filtered   = _applyFilters(pool);
    const hasFilters = state.filters.size > 0 || state.prepFilter || state.activeCategory;

    if (filtered.length === 0 && hasFilters) {
      state.pool = pool;
      go('meals');
      _renderCategoryRow();
      _renderEmptyFilterState();
      return;
    }

    state.pool         = filtered.length ? filtered : pool;
    state.seenMealIds  = new Set();
    state.visibleCount = 6;
    _renderGrid();
    go('meals');
    _renderCategoryRow();
    _syncGridFilterButtons();

    // Low-match banner: show when active filters leave only 1-2 results
    if (hasFilters && filtered.length > 0 && filtered.length < 3) {
      _appendLowMatchBanner(filtered.length);
    }
  }

  function _renderEmptyFilterState() {
    const chipConfig = {
      low:    { label: '🌙 Low Energy',    cls: 'low'    },
      medium: { label: '🌤 Medium Energy', cls: 'medium' },
      high:   { label: '⚡ High Energy',   cls: 'high'   }
    };
    const chip   = chipConfig[state.energy] || chipConfig.medium;
    const chipEl = document.getElementById('energy-chip');
    if (chipEl) { chipEl.textContent = chip.label; chipEl.className = 'energy-chip ' + chip.cls; }

    const titleEl = document.getElementById('meals-title');
    if (titleEl) titleEl.textContent = 'No meals match these filters';



    const navRow = document.getElementById('meal-nav-row');
    if (navRow) navRow.hidden = true;

    const navCounter = document.getElementById('meal-nav-counter');
    if (navCounter) navCounter.hidden = true;

    const filterPills = _getActiveFilterNames().map(f =>
      `<button class="filter-remove-pill" onclick="App.removeFilter('${f.key}')">${_escape(f.label)} ✕</button>`
    ).join('');

    document.getElementById('meals-list').innerHTML = `
      <div class="meals-empty-state">
        <div class="meals-empty-icon">🤔</div>
        <p class="meals-empty-sub">No meals match these filters. Remove one to see more options.</p>
        ${filterPills ? `<div class="low-match-pills" style="margin-top:6px">${filterPills}</div>` : ''}
        <button class="btn-clear-filters" onclick="App.clearAllFilters()">Clear all filters</button>
      </div>`;
  }

  function _getActiveFilterNames() {
    const names = [];
    const filterLabels = {
      'low-carb': 'Low Carb', 'grain-free': 'Grain Free',
      'clean-eating': 'Clean', 'quick': 'Quick', 'minimal-washing': 'Easy wash', 'halal-friendly': 'Halal'
    };
    state.filters.forEach(key => {
      if (filterLabels[key]) names.push({ key: 'filter:' + key, label: filterLabels[key] });
    });
    if (state.prepFilter) {
      const prepLabels = { 'no-prep': 'No prep', 'quick-prep': 'Quick prep', 'some-prep': 'Some prep' };
      names.push({ key: 'prep:' + state.prepFilter, label: prepLabels[state.prepFilter] || state.prepFilter });
    }
    if (state.activeCategory) {
      const cat = CATEGORIES.find(c => c.key === state.activeCategory);
      names.push({ key: 'cat:' + state.activeCategory, label: cat ? cat.emoji + ' ' + cat.label : state.activeCategory });
    }
    return names;
  }

  function removeFilter(filterKey) {
    if (filterKey.startsWith('filter:')) {
      state.filters.delete(filterKey.slice(7));
      _syncFilterButtons();
    } else if (filterKey.startsWith('prep:')) {
      state.prepFilter = null;
      _syncPrepFilterButtons();
    } else if (filterKey.startsWith('cat:')) {
      state.activeCategory = null;
      _renderAllCategoryRows();
    }
    _savePrefs();
    _updateHeroCTA();
    if (state.energy) pickEnergy(state.energy);
  }

  function _appendLowMatchBanner(count) {
    const list = document.getElementById('meals-list');
    if (!list) return;
    const filterPills = _getActiveFilterNames().map(f =>
      `<button class="filter-remove-pill" onclick="App.removeFilter('${f.key}')">${_escape(f.label)} ✕</button>`
    ).join('');
    list.insertAdjacentHTML('beforeend', `
      <div class="low-match-banner">
        <p class="low-match-msg">Only ${count} meal${count !== 1 ? 's' : ''} match all your filters</p>
        <p class="low-match-hint">Remove a filter to see more options</p>
        ${filterPills ? `<div class="low-match-pills">${filterPills}</div>` : ''}
      </div>`);
  }

  function clearAllFilters() {
    state.filters.clear();
    state.prepFilter     = null;
    state.activeCategory = null;
    _syncFilterButtons();
    _syncPrepFilterButtons();
    _renderAllCategoryRows();
    _updateHeroCTA();
    _savePrefs();
    pickEnergy(state.energy);
  }

  function _pickBestLow(pool) {
    const ideal = pool.filter(m => m.cleanupScore === 'green' && m.time <= 15);
    const src = ideal.length ? ideal : pool;
    return src[Math.floor(Math.random() * src.length)];
  }

  // ── Meal picking ─────────────────────────────────────────────

  function _pick3(pool) {
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
  }

  function shuffle() { nextMeal(); }

  function surpriseMeFromHome() {
    let pool = [...(MEALS.low || []), ...(MEALS.medium || []), ...(MEALS.high || [])]
      .filter(m => m.mealType === state.mealType);
    if (pool.length === 0) {
      pool = [...(MEALS.low || []), ...(MEALS.medium || []), ...(MEALS.high || [])]
        .filter(m => m.mealType === 'dinner');
    }
    const filtered  = _applyFilters(pool);
    state.pool      = filtered.length ? filtered : pool;
    state.seenMealIds = new Set();
    state.visibleCount = state.pool.length;
    const meal      = state.pool[Math.floor(Math.random() * state.pool.length)];
    state.displayed = [meal];
    state.selectedMeal = meal;
    selectMeal(0);
  }

  function surpriseMe() {
    if (!state.pool || !state.pool.length) return;
    const meal = state.pool[Math.floor(Math.random() * state.pool.length)];
    const idx  = state.displayed.findIndex(m => m.id === meal.id);
    if (idx >= 0) {
      selectMeal(idx);
    } else {
      state.visibleCount = state.pool.length;
      _renderGrid();
      const newIdx = state.displayed.findIndex(m => m.id === meal.id);
      selectMeal(newIdx >= 0 ? newIdx : 0);
    }
  }

  function nextMeal() {
    // Navigate forward in already-seen history
    if (state.mealHistoryIndex < state.mealHistory.length - 1) {
      state.mealHistoryIndex++;
      _renderMeals([state.mealHistory[state.mealHistoryIndex]]);
      return;
    }
    // Pick a new unseen meal
    const unseen = state.pool.filter(m => !state.seenMealIds.has(m.id));
    if (unseen.length >= 1) {
      const meal = unseen[Math.floor(Math.random() * unseen.length)];
      state.mealHistory.push(meal);
      state.mealHistoryIndex = state.mealHistory.length - 1;
      state.seenMealIds.add(meal.id);
      _renderMeals([meal]);
      return;
    }
    // All seen — loop back to the beginning
    _toast('Showing from the beginning again');
    state.seenMealIds   = new Set();
    state.mealHistory   = [];
    state.mealHistoryIndex = -1;
    const meal = state.pool[Math.floor(Math.random() * state.pool.length)];
    state.mealHistory      = [meal];
    state.mealHistoryIndex = 0;
    state.seenMealIds.add(meal.id);
    _renderMeals([meal]);
  }

  function previousMeal() {
    if (state.mealHistoryIndex <= 0) return;
    state.mealHistoryIndex--;
    _renderMeals([state.mealHistory[state.mealHistoryIndex]]);
  }

  function startOver() { go('home'); }

  function _renderExhausted() {

    const startOverBtn = document.getElementById('btn-start-over');
    if (startOverBtn) startOverBtn.hidden = false;

    document.getElementById('meals-list').innerHTML = `
      <div class="meals-exhausted">
        <div class="meals-exhausted-icon">🧐</div>
        <h2 class="meals-exhausted-title">You've seen all suggestions!</h2>
        <p class="meals-exhausted-sub">Try changing your filters or energy level for more options.</p>
        <button class="btn-exhausted-action" onclick="App.go('energy')">Change energy level →</button>
        <button class="btn-exhausted-filters" onclick="App.clearAllFilters()">Clear all filters →</button>
      </div>`;
  }

  function selectMeal(index) {
    const meal = state.displayed[index];
    if (!meal) return;

    const cards = document.querySelectorAll('.meal-card');
    if (cards[index]) cards[index].classList.add('is-selecting');

    setTimeout(() => {
      state.selectedMeal = meal;
      _saveToHistory(meal, state.energy);
      _renderRecipe(meal);
      go('recipe');
    }, 140);
  }

  // ── Home energy widget ───────────────────────────────────────

  function setHomeEnergy(level) {
    state.homeEnergy = (state.homeEnergy === level) ? null : level;
    _syncEnergyWidget();
    _updateHeroCTA();
    _updateAccordionSubtitles();
    _savePrefs();
  }

  function heroCTA() {
    state.activeCategory = null;
    if (state.homeEnergy) {
      pickEnergy(state.homeEnergy);
    } else {
      _showAllMeals();
    }
  }

  function _showAllMeals() {
    state.energy = null;
    let pool = [...(MEALS.low || []), ...(MEALS.medium || []), ...(MEALS.high || [])]
      .filter(m => m.mealType === state.mealType);
    if (pool.length === 0) {
      pool = [...(MEALS.low || []), ...(MEALS.medium || []), ...(MEALS.high || [])]
        .filter(m => m.mealType === 'dinner');
    }
    const filtered   = _applyFilters(pool);
    const hasFilters = state.filters.size > 0 || state.prepFilter || state.activeCategory;
    if (filtered.length === 0 && hasFilters) {
      state.pool = pool;
      go('meals');
      _renderCategoryRow();
      _renderEmptyFilterState();
      return;
    }
    state.pool         = filtered.length ? filtered : pool;
    state.seenMealIds  = new Set();
    state.visibleCount = 6;
    _renderGrid();
    go('meals');
    _renderCategoryRow();
    _syncGridFilterButtons();
  }

  function _applySort(meals) {
    if (state.sortBy === 'quickest') {
      return [...meals].sort((a, b) => (a.time || 999) - (b.time || 999));
    }
    if (state.sortBy === 'fewest-ingredients') {
      return [...meals].sort((a, b) => (a.ingredients ? a.ingredients.length : 0) - (b.ingredients ? b.ingredients.length : 0));
    }
    return [...meals];
  }

  function _renderGrid() {
    const sorted   = _applySort(state.pool);
    const visible  = sorted.slice(0, state.visibleCount);
    _renderMeals(visible);
    const showMoreBtn = document.getElementById('btn-show-more');
    if (showMoreBtn) {
      if (visible.length < sorted.length) {
        const remaining       = sorted.length - visible.length;
        const next            = Math.min(6, remaining);
        showMoreBtn.textContent = `Show ${next} more meal${next !== 1 ? 's' : ''} (${remaining} remaining)`;
        showMoreBtn.hidden    = false;
      } else {
        showMoreBtn.hidden = true;
      }
    }
  }

  function showMore() {
    state.visibleCount += 6;
    _renderGrid();
  }

  function setSort(key) {
    state.sortBy       = key;
    state.visibleCount = 6;
    _renderGrid();
  }

  function toggleGridFilter(key) {
    if (state.filters.has(key)) state.filters.delete(key);
    else                        state.filters.add(key);
    state.visibleCount = 6;
    if (state.energy) pickEnergy(state.energy);
    else              _showAllMeals();
  }

  function _syncGridFilterButtons() {
    document.querySelectorAll('[data-grid-filter]').forEach(btn => {
      const key = btn.getAttribute('data-grid-filter');
      btn.classList.toggle('active', state.filters.has(key));
    });
  }

  function _syncEnergyWidget() {
    document.querySelectorAll('.eq-btn').forEach(btn => btn.classList.remove('selected'));
    if (state.homeEnergy) {
      const btn = document.querySelector('.eq-btn.' + state.homeEnergy);
      if (btn) btn.classList.add('selected');
    }
  }

  function _updateHeroCTA() {
    const mealIcons  = { breakfast: '🍳', lunch: '🥗', dinner: '🍽️' };
    const mealLabels = { breakfast: "What's for breakfast?", lunch: "What's for lunch?", dinner: "What's for dinner?" };
    const labelEl = document.querySelector('.btn-hero-label');
    const btn     = document.querySelector('.btn-hero');
    if (!labelEl) return;

    const icon  = mealIcons[state.mealType]  || '🍽️';
    const label = mealLabels[state.mealType] || "What's for dinner?";

    if (state.homeEnergy) {
      // Use actual mealType; fall back to dinner pool if no meals of that type exist
      let pool = (MEALS[state.homeEnergy] || []).filter(m => m.mealType === state.mealType);
      if (pool.length === 0) pool = (MEALS[state.homeEnergy] || []).filter(m => m.mealType === 'dinner');
      const filtered = _applyFilters(pool);
      const count    = filtered.length;

      if (count === 0) {
        labelEl.textContent = 'No meals match — try fewer filters';
        btn && btn.classList.add('btn-hero-zero');
        btn && btn.classList.remove('btn-hero-low');
      } else if (count <= 2) {
        labelEl.textContent = `⚠️ Only ${count} meal${count !== 1 ? 's' : ''} match these filters`;
        btn && btn.classList.add('btn-hero-low');
        btn && btn.classList.remove('btn-hero-zero');
      } else {
        labelEl.textContent = icon + ' ' + label + ` (${count} options)`;
        btn && btn.classList.remove('btn-hero-zero', 'btn-hero-low');
      }
    } else {
      labelEl.textContent = icon + ' ' + label;
      btn && btn.classList.remove('btn-hero-zero', 'btn-hero-low');
    }
  }

  // ── Ingredient scaling ───────────────────────────────────────

  function _scaleIngredients(ingredients, scaleFactor) {
    if (!scaleFactor || Math.abs(scaleFactor - 1) < 0.01) return [...ingredients];

    const unicodeFracs = {
      '½': 0.5, '⅓': 1/3, '¼': 0.25, '¾': 0.75,
      '⅔': 2/3, '⅛': 0.125, '⅜': 3/8, '⅝': 5/8, '⅞': 7/8
    };
    const displayFracs = [
      [0.125,'⅛'],[0.25,'¼'],[1/3,'⅓'],[0.375,'⅜'],
      [0.5,'½'],[0.625,'⅝'],[2/3,'⅔'],[0.75,'¾'],[0.875,'⅞']
    ];

    function fmt(n) {
      if (n <= 0) return '0';
      const whole = Math.floor(n);
      const frac  = n - whole;
      if (frac < 0.04) return String(whole || '');
      if (frac > 0.96) return String(whole + 1);
      const best = displayFracs.reduce((b,c) => Math.abs(c[0]-frac) < Math.abs(b[0]-frac) ? c : b);
      if (Math.abs(best[0] - frac) < 0.07) return whole > 0 ? `${whole}${best[1]}` : best[1];
      return String(Math.round(n * 4) / 4);
    }

    return ingredients.map(ing => {
      let s = ing;
      for (const [uni, val] of Object.entries(unicodeFracs)) {
        s = s.replace(new RegExp(uni, 'g'), String(val));
      }
      const rng = s.match(/^([\d.]+)\s*[–\-]\s*([\d.]+)/);
      if (rng) {
        const lo = fmt(parseFloat(rng[1]) * scaleFactor);
        const hi = fmt(parseFloat(rng[2]) * scaleFactor);
        return lo + '–' + hi + s.slice(rng[0].length);
      }
      const num = s.match(/^([\d.]+)/);
      if (num) return fmt(parseFloat(num[1]) * scaleFactor) + s.slice(num[0].length);
      const wordM = s.match(/^(half)\b/i);
      if (wordM) return fmt(0.5 * scaleFactor) + s.slice(wordM[0].length);
      return ing;
    });
  }

  // ── Interruption recovery ────────────────────────────────────

  const INTERRUPTED_KEY = 'kc_interrupted';

  function saveInterruption() {
    const meal = state.selectedMeal;
    if (!meal) return;
    const data = {
      mealId: meal.id, energy: state.energy, mealType: state.mealType,
      mealName: meal.name, emoji: meal.emoji
    };
    try { localStorage.setItem(INTERRUPTED_KEY, JSON.stringify(data)); } catch(_) {}
    state.interrupted = data;
    _renderResumeCard();
    _toast('Saved! Tap "Resume cooking" on the home screen.');
  }

  function resumeCooking() {
    const data = state.interrupted;
    if (!data) return;
    const level = data.energy || 'medium';
    const meal  = (MEALS[level] || []).find(m => m.id === data.mealId);
    if (!meal) { clearInterruption(); return; }
    state.energy       = level;
    state.mealType     = data.mealType || 'dinner';
    state.selectedMeal = meal;
    _renderRecipe(meal);
    go('recipe');
  }

  function clearInterruption() {
    state.interrupted = null;
    try { localStorage.removeItem(INTERRUPTED_KEY); } catch(_) {}
    const section = document.getElementById('resume-section');
    if (section) section.setAttribute('hidden', '');
  }

  function _loadInterrupted() {
    try {
      const raw = JSON.parse(localStorage.getItem(INTERRUPTED_KEY));
      if (raw && raw.mealId) { state.interrupted = raw; _renderResumeCard(); }
    } catch(_) {}
  }

  function _renderResumeCard() {
    const section = document.getElementById('resume-section');
    const card    = document.getElementById('resume-card');
    if (!section || !card || !state.interrupted) return;
    section.removeAttribute('hidden');
    card.innerHTML = `
      <button class="resume-card-btn" onclick="App.resumeCooking()">
        <span class="resume-emoji" aria-hidden="true">${state.interrupted.emoji}</span>
        <div class="resume-info">
          <span class="resume-label">Resume cooking 👉</span>
          <span class="resume-name">${_escape(state.interrupted.mealName)}</span>
        </div>
        <button class="resume-clear" onclick="event.stopPropagation(); App.clearInterruption()" aria-label="Dismiss">✕</button>
      </button>`;
  }

  // ── History ──────────────────────────────────────────────────

  const HISTORY_KEY = 'kc_history';

  function _saveToHistory(meal, energy) {
    try {
      let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      history = history.filter(h => h.id !== meal.id);
      history.unshift({ id: meal.id, energy, mealType: meal.mealType, name: meal.name, emoji: meal.emoji, time: meal.time });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
    } catch (_) {}
  }

  function _loadHistory() {
    try {
      const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      const history = raw.filter(h => (MEALS[h.energy] || []).some(m => m.id === h.id));
      if (history.length === 0) return;

      document.getElementById('last-cooked-section').removeAttribute('hidden');
      const display = history.slice(0, 3);
      const hasMore = history.length > 3;

      const itemsHtml = display.map(item => {
        const rating  = _loadRating(item.id);
        const stars   = rating ? '★'.repeat(rating) + '☆'.repeat(5 - rating) : '';
        const starsEl = stars ? `<span class="lc-stars">${stars}</span>` : '';
        return `
        <button class="last-cooked-item" onclick="App.cookAgain('${item.id}', '${item.energy}')">
          <span class="lc-emoji" aria-hidden="true">${item.emoji}</span>
          <div class="lc-info">
            <span class="lc-name">${_escape(item.name)}</span>
            <span class="lc-meta">⏱ ${item.time} min ${starsEl}</span>
          </div>
          <span class="lc-arrow" aria-hidden="true">→</span>
        </button>`;
      }).join('');

      const seeAllHtml = hasMore
        ? `<button class="btn-see-all-history" onclick="App.openHistory()">See all ${history.length} meals →</button>`
        : '';

      document.getElementById('last-cooked-list').innerHTML = itemsHtml + seeAllHtml;
    } catch (_) {}
  }

  function openHistory() {
    try {
      const raw     = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      const history = raw.filter(h => Object.values(MEALS).flat().some(m => m.id === h.id));
      const el      = document.getElementById('history-screen-list');
      if (el) {
        if (history.length === 0) {
          el.innerHTML = `<p style="text-align:center;color:var(--text-2);padding:32px 0;font-size:14px;">No meals cooked yet.</p>`;
        } else {
          el.innerHTML = history.map(item => {
            const rating  = _loadRating(item.id);
            const stars   = rating ? '★'.repeat(rating) + '☆'.repeat(5 - rating) : '';
            const starsEl = stars ? `<span class="lc-stars">${stars}</span>` : '';
            return `
            <button class="last-cooked-item" onclick="App.cookAgain('${item.id}', '${item.energy}'); App.closeHistory();">
              <span class="lc-emoji" aria-hidden="true">${item.emoji}</span>
              <div class="lc-info">
                <span class="lc-name">${_escape(item.name)}</span>
                <span class="lc-meta">⏱ ${item.time} min ${starsEl}</span>
              </div>
              <span class="lc-arrow" aria-hidden="true">→</span>
            </button>`;
          }).join('');
        }
      }
    } catch(_) {}
    go('history');
  }

  function closeHistory() { go('home'); }

  function cookAgain(mealId, energy) {
    const meal = (MEALS[energy] || []).find(m => m.id === mealId);
    if (!meal) return;
    state.energy       = energy;
    state.mealType     = meal.mealType || 'dinner';
    state.selectedMeal = meal;
    _renderRecipe(meal);
    go('recipe');
  }

  // ── Recipe Rating ────────────────────────────────────────────

  const RATINGS_KEY = 'kc_ratings';

  function _saveRating(mealId, stars) {
    try {
      const ratings = JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}');
      ratings[mealId] = stars;
      localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
    } catch (_) {}
  }

  function _loadRating(mealId) {
    try {
      const ratings = JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}');
      return ratings[mealId] || 0;
    } catch (_) { return 0; }
  }

  // ── Renderers ─────────────────────────────────────────────────

  const CLEANUP_SCORE_CONFIG = {
    green:  { icon: '🟢', label: 'Easy cleanup' },
    yellow: { icon: '🟡', label: 'Some washing up' },
    red:    { icon: '🔴', label: 'More washing up' }
  };

  const CLEANUP_NOTES = {
    green:  { during: 'While you eat: just a quick rinse needed.', after: 'After eating: 1–2 items. Done in under 2 minutes.' },
    yellow: { during: 'While you eat: put the pans in water to soak.', after: 'After eating: 3–4 items to wash. About 5 minutes.' },
    red:    { during: 'While you eat: start soaking the pans now.', after: 'After eating: work through items one at a time. No rush.' }
  };

  function _servesLabel(n) {
    if (!n) return '';
    if (n === 1) return 'Serves 1';
    if (n >= 4)  return 'Serves 4+';
    return `Serves ${n}`;
  }

  function _renderMeals(meals) {
    // All energy levels now show 1 meal at a time with prev/next navigation
    meals.forEach(m => state.seenMealIds.add(m.id));
    state.displayed = [...meals];

    const chipConfig = {
      low:    { label: '🌙 Low Energy',    cls: 'low'    },
      medium: { label: '🌤 Medium Energy', cls: 'medium' },
      high:   { label: '⚡ High Energy',   cls: 'high'   }
    };
    const chipEl = document.getElementById('energy-chip');
    if (state.energy && chipEl) {
      const chip = chipConfig[state.energy] || chipConfig.medium;
      chipEl.textContent = chip.label;
      chipEl.className   = 'energy-chip ' + chip.cls;
      chipEl.hidden      = false;
    } else if (chipEl) {
      chipEl.hidden = true;
    }

    const titleEl = document.getElementById('meals-title');
    if (titleEl) {
      const mealWord = state.mealType === 'breakfast' ? 'breakfast' : state.mealType === 'lunch' ? 'lunch' : 'dinner';
      const total    = state.pool ? state.pool.length : meals.length;
      const cat      = state.activeCategory ? CATEGORIES.find(c => c.key === state.activeCategory) : null;
      const catLabel = cat ? ` · ${cat.emoji} ${cat.label}` : '';
      titleEl.textContent = `${total} ${mealWord} meal${total !== 1 ? 's' : ''}${catLabel}`;
    }

    // Always hide batch-shuffle button; always show prev/next nav




    const navRow = document.getElementById('meal-nav-row');
    if (navRow) navRow.hidden = true;

    const atFirst = state.mealHistoryIndex <= 0;
    const prevBtn = document.getElementById('btn-prev-meal');
    if (prevBtn) {
      prevBtn.textContent = '← Previous';
      prevBtn.disabled    = atFirst;
      prevBtn.classList.toggle('nav-btn-disabled', atFirst);
    }

    const nextBtn = document.getElementById('btn-next-meal');
    if (nextBtn) {
      nextBtn.textContent = 'Next option →';
      nextBtn.disabled    = false;
      nextBtn.classList.remove('nav-btn-disabled');
    }

    // Counter: "Option X of Y"
    const navCounter = document.getElementById('meal-nav-counter');
    if (navCounter) {
      const total = state.pool.length;
      if (total > 1) {
        navCounter.hidden      = false;
        navCounter.textContent = `Option ${state.mealHistoryIndex + 1} of ${total}`;
      } else {
        navCounter.hidden = true;
      }
    }

    const startOverBtn = document.getElementById('btn-start-over');
    if (startOverBtn) startOverBtn.hidden = false;

    const dietDefs = {
      halal:      { text: '✓ Halal',      cls: 'chip-diet chip-halal' },
      vegetarian: { text: '🌿 Vegetarian', cls: 'chip-diet chip-veg'  },
      vegan:      { text: '🌱 Vegan',      cls: 'chip-diet chip-vegan' }
    };

    document.getElementById('meals-list').innerHTML = state.displayed.map((meal, i) => {
      const dietChips = (meal.labels || [])
        .filter(l => dietDefs[l])
        .map(l => `<span class="${dietDefs[l].cls}">${dietDefs[l].text}</span>`)
        .join('');

      const readiness = Pantry.getMealReadiness(meal);
      let badgeHtml = '';
      if (readiness.status === 'ready') {
        badgeHtml = `<span class="meal-badge badge-ready">✓ Ready to cook</span>`;
      } else if (readiness.status === 'close') {
        badgeHtml = `<span class="meal-badge badge-close">Missing ${readiness.missing.length} item${readiness.missing.length > 1 ? 's' : ''}</span>`;
      }

      const cs           = meal.cleanupScore || 'yellow';
      const csc          = CLEANUP_SCORE_CONFIG[cs];
      const cleanupBadge = `<span class="chip-cleanup chip-cleanup-${cs}">${csc.icon} ${csc.label}</span>`;

      let sweetBadge = '';
      if (meal.containsSugar)        sweetBadge = `<span class="chip-sugar">⚠️ Contains sugar</span>`;
      else if (meal.naturallySweet)  sweetBadge = `<span class="chip-natural-sweet">🍯 Naturally sweet</span>`;

      const filterChips = [];
      if (meal.grainFree)                      filterChips.push(`<span class="chip-filter">Grain-free</span>`);
      if (meal.lowCarb)                         filterChips.push(`<span class="chip-filter">Low carb</span>`);
      if (meal.cleanEating && !meal.grainFree)  filterChips.push(`<span class="chip-filter">Clean</span>`);

      const prepChip   = meal.prepTime != null ? `<span class="chip-prep">✂️ ${meal.prepTime}m prep</span>` : '';
      const cookChip   = meal.cookTime != null ? `<span class="chip-cook">🍳 ${meal.cookTime}m cook</span>` : `<span class="chip-time">⏱ ${meal.time} min</span>`;
      const servesChip = meal.serves ? `<span class="chip-serves">👥 ${_servesLabel(meal.serves)}</span>` : '';

      const rating     = _loadRating(meal.id);
      const ratingHtml = rating ? `<div class="meal-card-rating">${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</div>` : '';

      const hasImg = meal.mealType === 'dinner' || meal.mealType === 'lunch' || meal.mealType === 'breakfast';
      const imgHtml = hasImg
        ? `<div class="meal-img-wrap"><img class="meal-img" src="Images/${meal.id}.webp" loading="lazy" decoding="async" alt="${_escape(meal.name)}" onerror="this.closest('.meal-img-wrap').style.display='none'"></div>`
        : '';

      return `
      <article class="meal-card" role="listitem">
        ${imgHtml}
        <div class="meal-card-body">
          ${badgeHtml}
          ${ratingHtml}
          <div class="meal-head">
            <span class="meal-emoji" aria-hidden="true">${meal.emoji}</span>
            <div class="meal-details">
              <div class="meal-name">${_escape(meal.name)}</div>
              <div class="meal-chips">
                ${prepChip}${cookChip}${servesChip}${cleanupBadge}${sweetBadge}${dietChips}${filterChips.join('')}
              </div>
            </div>
          </div>
          <p class="meal-desc">${_escape(meal.description)}</p>
          <button class="btn-cook" onclick="App.selectMeal(${i})" aria-label="Cook ${_escape(meal.name)}">
            Let's make this →
          </button>
        </div>
      </article>`;
    }).join('');
  }

  function _renderRecipe(meal) {
    state.checkedIngredients.clear();
    state.doneSteps.clear();

    const scaleFactor        = state.portionSize && meal.serves ? state.portionSize / meal.serves : 1;
    const scaledIngredients  = _scaleIngredients(meal.ingredients, scaleFactor);
    const portionNote        = (scaleFactor !== 1 && state.portionSize)
      ? `<div class="recipe-portion-note">📐 Scaled for ${state.portionSize} ${state.portionSize === 1 ? 'person' : 'people'} (recipe serves ${meal.serves})</div>`
      : '';

    const ingredientItems = scaledIngredients.map((ing, i) => `
        <li class="ing-item" onclick="App.toggleIngredient(${i})" role="button" aria-pressed="false">
          <span class="ing-check-icon" aria-hidden="true"></span>
          <span class="ing-text">${_escape(ing)}</span>
        </li>`).join('');

    const totalSteps = meal.steps.length;
    const stepItems  = meal.steps.map((step, i) => `
        <li class="${i === 0 ? 'step-current' : ''}" onclick="App.toggleStep(${i})" role="button">
          <span class="step-text">${_boldAmounts(step)}</span>
        </li>`).join('');

    const recipeDietDefs = {
      halal:      { text: '✓ Halal',      cls: 'chip-diet chip-halal' },
      vegetarian: { text: '🌿 Vegetarian', cls: 'chip-diet chip-veg'  },
      vegan:      { text: '🌱 Vegan',      cls: 'chip-diet chip-vegan' }
    };
    const recipeDietChips = (meal.labels || [])
      .filter(l => recipeDietDefs[l])
      .map(l => `<span class="${recipeDietDefs[l].cls}">${recipeDietDefs[l].text}</span>`)
      .join('');

    let sweetHtml = '';
    if (meal.containsSugar) {
      sweetHtml = `<div class="recipe-sugar-warning">⚠️ Contains refined sugar — swap for honey or dates if you prefer</div>`;
    } else if (meal.naturallySweet) {
      sweetHtml = `<div class="recipe-natural-sweet">🍯 Naturally sweet — uses honey, dates, or natural sweeteners only</div>`;
    }

    const cs      = meal.cleanupScore || 'yellow';
    const csnotes = CLEANUP_NOTES[cs];
    const csc     = CLEANUP_SCORE_CONFIG[cs];
    const cleanupHtml = `
      <div class="recipe-cleanup">
        <div class="recipe-cleanup-title">${csc.icon} Cleanup plan</div>
        <div class="recipe-cleanup-item">${_escape(csnotes.during)}</div>
        <div class="recipe-cleanup-item">${_escape(csnotes.after)}</div>
      </div>`;

    const readiness    = Pantry.getMealReadiness(meal);
    const missingNames = Pantry.getMissingNames(meal);
    let shopBtnHtml = '';
    if (readiness.status === 'close' || readiness.status === 'needs') {
      shopBtnHtml = `
        <button class="btn-add-shopping" onclick="App.addToShopping()">
          🛒 Add ${missingNames.length} missing item${missingNames.length !== 1 ? 's' : ''} to list
        </button>`;
    }

    const prepBadge   = meal.prepTime != null ? `<span class="recipe-time-badge recipe-prep-badge">✂️ Prep ${meal.prepTime} min</span>` : '';
    const cookBadge   = meal.cookTime != null ? `<span class="recipe-time-badge recipe-cook-badge">🍳 Cook ${meal.cookTime} min</span>` : `<span class="recipe-time-badge">⏱ ${meal.time} min</span>`;
    const servesBadge = meal.serves ? `<span class="recipe-time-badge recipe-serves-badge">👥 ${_servesLabel(meal.serves)}</span>` : '';

    document.getElementById('recipe-content').innerHTML = `
      <div class="recipe-hero">
        <span class="recipe-emoji" aria-hidden="true">${meal.emoji}</span>
        <h1 class="recipe-name">${_escape(meal.name)}</h1>
        <div class="recipe-meta">
          ${prepBadge}${cookBadge}${servesBadge}
          ${recipeDietChips}
        </div>
      </div>

      <button class="btn-start-cook" onclick="App.startCookMode()">
        👨‍🍳 Start Cooking
      </button>

      <button class="btn-rescue-recipe" onclick="App.startRescueMode('current')">
        🆘 I'm overwhelmed — rescue mode
      </button>

      ${portionNote}
      ${sweetHtml}
      ${shopBtnHtml}

      <div class="recipe-section">
        <div class="recipe-section-header">
          <h2 class="recipe-section-title">Ingredients</h2>
          <button class="btn-reset-ingredients" onclick="App.resetIngredients()">↺ Reset</button>
        </div>
        <ul class="ingredient-list">${ingredientItems}</ul>
      </div>

      <div class="recipe-section">
        <div class="recipe-section-header">
          <h2 class="recipe-section-title">Steps</h2>
          <span class="step-counter-label" id="step-counter">0 of ${totalSteps}</span>
        </div>
        <div class="step-progress-bar">
          <div class="step-progress-fill" id="step-progress-fill" style="width:0%"></div>
        </div>
        <ol class="steps-list">${stepItems}</ol>
      </div>

      ${cleanupHtml}

      <div class="recipe-section">
        <button class="btn-interrupt" onclick="App.saveInterruption()">
          ⏸ I got interrupted
        </button>
      </div>
    `;
  }

  // ── Ingredient checklist ─────────────────────────────────────

  function toggleIngredient(index) {
    if (state.checkedIngredients.has(index)) {
      state.checkedIngredients.delete(index);
    } else {
      state.checkedIngredients.add(index);
    }
    const li      = document.querySelectorAll('.ingredient-list .ing-item')[index];
    if (!li) return;
    const checked = state.checkedIngredients.has(index);
    li.classList.toggle('ing-checked', checked);
    li.setAttribute('aria-pressed', String(checked));
    const icon = li.querySelector('.ing-check-icon');
    if (icon) icon.textContent = checked ? '✓' : '';
  }

  function resetIngredients() {
    state.checkedIngredients.clear();
    document.querySelectorAll('.ingredient-list .ing-item').forEach(li => {
      li.classList.remove('ing-checked');
      li.setAttribute('aria-pressed', 'false');
      const icon = li.querySelector('.ing-check-icon');
      if (icon) icon.textContent = '';
    });
  }

  // ── Step progress ─────────────────────────────────────────────

  function toggleStep(index) {
    if (state.doneSteps.has(index)) {
      state.doneSteps.delete(index);
    } else {
      state.doneSteps.add(index);
    }
    _updateStepProgress();
  }

  function _updateStepProgress() {
    const lis   = document.querySelectorAll('.steps-list li');
    const total = lis.length;
    const done  = state.doneSteps.size;

    let firstUndone = -1;
    for (let i = 0; i < total; i++) {
      if (!state.doneSteps.has(i)) { firstUndone = i; break; }
    }

    lis.forEach((li, i) => {
      li.classList.toggle('step-done',    state.doneSteps.has(i));
      li.classList.toggle('step-current', i === firstUndone);
    });

    const counter = document.getElementById('step-counter');
    if (counter) counter.textContent = `${done} of ${total}`;

    const fill = document.getElementById('step-progress-fill');
    if (fill) fill.style.width = total > 0 ? `${(done / total) * 100}%` : '0%';
  }

  // ── Amount bolding ────────────────────────────────────────────

  function _boldAmounts(text) {
    const escaped = _escape(text);
    return escaped.replace(
      /(\d[\d./]*\s*(?:tbsp|tsp|cups?|g(?=[^a-z]|$)|ml(?=[^a-z]|$)|oz\b|kg\b))/gi,
      '<strong class="step-amount">$1</strong>'
    );
  }

  // ── Timer parsing ─────────────────────────────────────────────

  const _SUGGESTED_TIMERS = [
    { re: /\buntil golden(?:\s+brown)?\b/gi,       secs: 5*60,  label: 'Suggested: 5 min'  },
    { re: /\buntil cooked?\s+through\b/gi,          secs: 8*60,  label: 'Suggested: 8 min'  },
    { re: /\buntil (?:just\s+)?softened?\b/gi,      secs: 5*60,  label: 'Suggested: 5 min'  },
    { re: /\bbring(?:ing)?\s+to\s+(?:a\s+)?boil\b/gi, secs: 5*60, label: 'Suggested: 5 min' },
    { re: /\buntil browned?\b/gi,                   secs: 4*60,  label: 'Suggested: 4 min'  },
    { re: /\buntil tender\b/gi,                     secs: 6*60,  label: 'Suggested: 6 min'  },
    { re: /\buntil fragrant\b/gi,                   secs: 60,    label: 'Suggested: 1 min'  },
    { re: /\buntil crispy\b/gi,                     secs: 5*60,  label: 'Suggested: 5 min'  },
  ];

  function _injectTimers(html, stepIndex) {
    const exactBtn = (secs, label) =>
      ` <button class="timer-pill" onclick="App.startStepTimer(${stepIndex}, ${secs}, 'Step ${stepIndex + 1}')" type="button">⏱ ${label}</button>`;

    const suggestBtn = (secs, label) =>
      ` <button class="timer-pill-suggested" onclick="App.startStepTimer(${stepIndex}, ${secs}, 'Step ${stepIndex + 1}')" type="button">⏱ ${label}</button>`;

    // Exact time patterns first
    let result = html.replace(
      /\b(?:(\d+)\s*[-–]\s*(\d+)\s*min(?:utes?)?|(\d+)\s*min(?:utes?)?|(\d+)\s*sec(?:onds?)?|(\d+)\s*hour?s?)\b/gi,
      (match, lo, hi, m, s, h) => {
        if (lo !== undefined && hi !== undefined) {
          return match + exactBtn(parseInt(hi) * 60, `${hi} min`);
        } else if (m !== undefined) {
          return match + exactBtn(parseInt(m) * 60, `${m} min`);
        } else if (s !== undefined) {
          return match + exactBtn(parseInt(s), `${s}s`);
        } else if (h !== undefined) {
          return match + exactBtn(parseInt(h) * 3600, h === '1' ? '1 hr' : `${h} hrs`);
        }
        return match;
      }
    );

    // Suggested timers for vague phrases
    _SUGGESTED_TIMERS.forEach(({ re, secs, label }) => {
      result = result.replace(re, match => match + suggestBtn(secs, label));
    });

    return result;
  }

  // ── COOK MODE ─────────────────────────────────────────────────

  const COOK_USES_KEY = 'kc_cook_uses';
  const STREAK_KEY    = 'kc_streak';

  function _loadStreak() {
    try { return JSON.parse(localStorage.getItem(STREAK_KEY)) || { count: 0, lastDate: null }; }
    catch (_) { return { count: 0, lastDate: null }; }
  }

  function _saveStreak(data) {
    try { localStorage.setItem(STREAK_KEY, JSON.stringify(data)); } catch (_) {}
  }

  function _updateStreak() {
    const today = new Date().toISOString().slice(0, 10);
    const s     = _loadStreak();
    if (s.lastDate === today) return s;
    const days  = s.lastDate
      ? Math.round((new Date(today) - new Date(s.lastDate)) / 86400000)
      : 999;
    const count = days === 1 ? s.count + 1 : days === 2 ? s.count : 1;
    const updated = { count, lastDate: today };
    _saveStreak(updated);
    return updated;
  }

  function _renderStreakBadge() {
    const el = document.getElementById('streak-badge');
    if (!el) return;
    const s = _loadStreak();
    if (s.count >= 1) {
      const msg = s.count === 1
        ? '🔥 1 day streak — cook again tomorrow to keep it going'
        : `🔥 ${s.count} day streak — keep it up!`;
      el.textContent = msg;
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  }

  function startCookMode() {
    const meal = state.selectedMeal;
    if (!meal) return;

    const uses = parseInt(localStorage.getItem(COOK_USES_KEY) || '0');
    if (uses >= 1) {
      _showPaywall();
      return;
    }

    _enterCookMode(meal);
  }

  function _enterCookMode(meal) {
    try {
      const uses = parseInt(localStorage.getItem(COOK_USES_KEY) || '0');
      localStorage.setItem(COOK_USES_KEY, String(uses + 1));
    } catch(_) {}

    state.cookMode.meal          = meal;
    state.cookMode.stepIndex     = 0;
    state.cookMode.totalSteps    = meal.steps.length;
    state.cookMode.stepStartedAt = Date.now();

    _cancelAllTimers();
    go('cook');
    _syncTTSToggle();
    _renderCookStep();
  }

  function exitCookMode() {
    _cancelAllTimers();
    stopSpeaking();
    _stopVoiceRecognition();
    go('recipe');
  }

  function nextCookStep() {
    const { stepIndex, totalSteps } = state.cookMode;

    if (stepIndex >= totalSteps - 1) {
      _showCookCompletion();
      return;
    }

    state.cookMode.stepIndex++;
    state.cookMode.stepStartedAt = Date.now();
    _renderCookStep();
    if (state.ttsAutoRead) speakCurrentStep();
  }

  function _renderCookStep() {
    const { meal, stepIndex, totalSteps } = state.cookMode;
    if (!meal) return;

    const progress = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;
    const fill = document.getElementById('cook-progress-fill');
    if (fill) fill.style.width = progress + '%';

    const counter = document.getElementById('cook-step-counter');
    if (counter) counter.textContent = `Step ${stepIndex + 1} of ${totalSteps}`;

    const body = document.getElementById('cook-body');
    if (!body) return;

    const stepText    = meal.steps[stepIndex];
    const stepHtml    = _injectTimers(_boldAmounts(stepText), stepIndex);

    let prevHtml = '';
    if (stepIndex > 0) {
      prevHtml = `<div class="cook-prev-step">${_escape(meal.steps[stepIndex - 1])}</div>`;
    }

    body.innerHTML = `
      ${prevHtml}
      <div class="cook-current-step">
        <span class="cook-step-number">${stepIndex + 1}</span>
        <div class="cook-step-text">${stepHtml}</div>
        <button class="btn-speak-step" onclick="App.speakCurrentStep()" aria-label="Read this step aloud">🔊 Listen</button>
      </div>`;

    const footer = document.getElementById('cook-footer');
    if (footer) {
      const isLast = stepIndex >= totalSteps - 1;
      footer.innerHTML = `
        <button class="btn-distraction-recover" onclick="App.recoverDistraction()">
          😵‍💫 Lost? Tap here
        </button>
        <button class="btn-next-step" onclick="App.nextCookStep()">
          ${isLast ? 'All done! 🎉' : 'Next Step →'}
        </button>`;
    }
  }

  function _showCookCompletion() {
    const meal   = state.cookMode.meal;
    const rating = _loadRating(meal ? meal.id : '');
    const streak = _updateStreak();
    const streakHtml = streak.count >= 2
      ? `<div class="cook-streak-badge">🔥 ${streak.count} day streak!</div>`
      : streak.count === 1
      ? `<div class="cook-streak-badge">🔥 Streak started — cook again tomorrow!</div>`
      : '';

    const body = document.getElementById('cook-body');
    if (body) {
      body.innerHTML = `
        <div class="cook-completion">
          <span class="cook-complete-emoji">🎉</span>
          <h2 class="cook-complete-title">You did it!</h2>
          ${streakHtml}
          <p class="cook-complete-sub">${state.mealType === 'breakfast' ? 'Breakfast is served.' : state.mealType === 'lunch' ? 'Lunch is served.' : 'Dinner is served.'}</p>
          <div class="cook-rating">
            <div class="cook-rating-label">How did it go?</div>
            <div class="cook-rating-stars">
              ${[1,2,3,4,5].map(n => `
              <button class="cook-star-btn${rating >= n ? ' lit' : ''}" data-star="${n}"
                      onclick="App.rateCookMeal(${n})" aria-label="${n} star">★</button>`).join('')}
            </div>
          </div>
        </div>`;
    }

    const footer = document.getElementById('cook-footer');
    if (footer) {
      footer.innerHTML = `
        <div class="cook-complete-actions">
          <button class="btn-cook-again" onclick="App.cookModeAgain()">🔄 Cook Again</button>
          <button class="btn-cook-home"  onclick="App.exitCookToHome()">🏠 Home</button>
        </div>`;
    }

    const fill = document.getElementById('cook-progress-fill');
    if (fill) fill.style.width = '100%';
  }

  function rateCookMeal(stars) {
    const meal = state.cookMode.meal;
    if (!meal) return;
    _saveRating(meal.id, stars);
    document.querySelectorAll('.cook-star-btn').forEach(btn => {
      btn.classList.toggle('lit', parseInt(btn.dataset.star) <= stars);
    });
    _toast('Rating saved 💚');
    _loadHistory();
  }

  function cookModeAgain() {
    state.cookMode.stepIndex = 0;
    state.cookMode.stepStartedAt = Date.now();
    _renderCookStep();
  }

  function recoverDistraction() {
    var meal = state.cookMode.meal;
    if (!meal) return;
    var stepIndex    = state.cookMode.stepIndex;
    var stepText     = meal.steps[stepIndex];
    var elapsedSecs  = Math.floor((Date.now() - (state.cookMode.stepStartedAt || Date.now())) / 1000);
    var elapsedLabel = elapsedSecs < 60
      ? elapsedSecs + 's'
      : Math.floor(elapsedSecs / 60) + 'm ' + (elapsedSecs % 60) + 's';

    // Build recovery message
    var prevStepLabel = '';
    if (stepIndex > 0) {
      prevStepLabel = '<div class="recover-prev">✅ You finished: <em>' + _escape(meal.steps[stepIndex - 1]) + '</em></div>';
    }

    var body = document.getElementById('cook-body');
    if (body) {
      body.innerHTML = `
        <div class="recovery-panel">
          <div class="recovery-head">
            <span class="recovery-emoji">💚</span>
            <div>
              <h2 class="recovery-title">No worries — you're right here</h2>
              <p class="recovery-elapsed">You've been on this step for ${elapsedLabel}</p>
            </div>
          </div>
          ${prevStepLabel}
          <div class="recovery-current">
            <span class="cook-step-number">${stepIndex + 1}</span>
            <div class="recovery-step-text">${_injectTimers(_boldAmounts(stepText), stepIndex)}</div>
          </div>
          <div class="recovery-actions">
            <button class="btn-recovery-listen" onclick="App.speakCurrentStep()">🔊 Read it again</button>
            <button class="btn-recovery-back" onclick="App._restoreCookStep()">← Back to cooking</button>
          </div>
        </div>`;
    }

    // Hide distraction button, show only next step
    var footer = document.getElementById('cook-footer');
    if (footer) {
      footer.innerHTML = `
        <button class="btn-next-step" onclick="App.nextCookStep()">
          Next Step →
        </button>`;
    }

    // Read the step aloud automatically
    if (state.ttsAutoRead) speakCurrentStep();
  }

  // Internal: restore normal cook step view
  function _restoreCookStep() {
    state.cookMode.stepStartedAt = Date.now();
    _renderCookStep();
  }

  function exitCookToHome() {
    _renderStreakBadge();
    _cancelAllTimers();
    stopSpeaking();
    _stopVoiceRecognition();
    go('home');
  }

  // ── Text-to-Speech ─────────────────────────────────────────

  const PREFERRED_VOICE_KEY = 'kc_preferredVoice';
  let _preferredVoiceName = null;

  function _loadPreferredVoice() {
    try {
      _preferredVoiceName = localStorage.getItem(PREFERRED_VOICE_KEY);
    } catch (_) { _preferredVoiceName = null; }
  }

  function _savePreferredVoice(name) {
    try {
      _preferredVoiceName = name;
      localStorage.setItem(PREFERRED_VOICE_KEY, name);
    } catch (_) {}
  }

  function toggleAutoRead() {
    state.ttsAutoRead = !state.ttsAutoRead;
    _syncTTSToggle();
    if (state.ttsAutoRead) {
      var voiceName = _getActiveVoiceName();
      var hint = voiceName ? ' (' + voiceName + ')' : '';
      _toast('Auto-read on — each step will be read aloud' + hint);
      speakCurrentStep();
    } else {
      stopSpeaking();
      _toast('Auto-read off');
    }
  }

  function _syncTTSToggle() {
    var btn = document.getElementById('cook-tts-toggle');
    var icon = btn ? btn.querySelector('.tts-toggle-icon') : null;
    var label = btn ? btn.querySelector('.tts-toggle-label') : null;
    if (btn) {
      btn.classList.toggle('active', state.ttsAutoRead);
      btn.setAttribute('aria-pressed', String(state.ttsAutoRead));
    }
    if (icon) icon.textContent = state.ttsAutoRead ? '🔊' : '🔇';
    if (label) label.textContent = state.ttsAutoRead ? 'Reading' : 'Read aloud';
  }

  function speakCurrentStep() {
    var meal = state.cookMode.meal;
    if (!meal) return;
    var stepText = meal.steps[state.cookMode.stepIndex];
    if (!stepText) return;
    _speak(stepText);
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  function _speak(text) {
    if (!('speechSynthesis' in window)) {
      _toast('Text-to-speech not supported on this device');
      return;
    }
    window.speechSynthesis.cancel();
    var cleanText = text.replace(/<[^>]*>/g, '').trim();
    if (!cleanText) return;
    var utterance = new SpeechSynthesisUtterance(cleanText);
    var voices = _cachedVoices.length > 0 ? _cachedVoices : window.speechSynthesis.getVoices();
    _pickBestVoice(utterance, voices);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  function _getActiveVoiceName() {
    var voices = _cachedVoices.length > 0 ? _cachedVoices : window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    return _pickBestVoiceName(voices);
  }

  function _pickBestVoiceName(voices) {
    if (!voices.length) return null;

    // 1) User's saved preference (sticky across sessions)
    if (_preferredVoiceName) {
      var saved = voices.find(function(v) { return v.name === _preferredVoiceName; });
      if (saved) return saved.name;
    }

    // 2) Microsoft natural voices — highest quality on Windows
    //    Names like: "Microsoft Ava Online (Natural HD) - English (United States)"
    //    Prefer Ava HD first, then Ava, then any natural/online voice
    var avaHD = voices.find(function(v) {
      return v.lang.startsWith('en') && /ava.*natural\s*hd/i.test(v.name);
    });
    if (avaHD) return avaHD.name;

    var ava = voices.find(function(v) {
      return v.lang.startsWith('en') && /ava.*(?:natural|online)/i.test(v.name);
    });
    if (ava) return ava.name;

    var onlineNat = voices.find(function(v) {
      return v.lang.startsWith('en') && /online|natural|premium|enhanced/i.test(v.name);
    });
    if (onlineNat) return onlineNat.name;

    // 3) Samantha — best natural voice on macOS/iOS
    var sam = voices.find(function(v) {
      return v.lang.startsWith('en') && v.name === 'Samantha';
    });
    if (sam) return sam.name;

    // 4) Google voices — best on Android
    var gg = voices.find(function(v) {
      return v.lang.startsWith('en') && /google/i.test(v.name);
    });
    if (gg) return gg.name;

    // 5) Microsoft Zira — solid en-US voice, often the best on Windows
    var zira = voices.find(function(v) {
      return v.lang.startsWith('en-US') && /zira/i.test(v.name);
    });
    if (zira) return zira.name;

    // 6) British English — often sounds pleasant on some systems
    var gb = voices.find(function(v) {
      return v.lang.startsWith('en-GB') || v.lang.startsWith('en_GB');
    });
    if (gb) return gb.name;

    // 6) Any en-US English voice (including Microsoft Zira if nothing better found)
    var usOk = voices.find(function(v) {
      return v.lang.startsWith('en-US');
    });
    if (usOk) return usOk.name;

    // 7) Any English voice
    var anyEn = voices.find(function(v) { return v.lang.startsWith('en'); });
    if (anyEn) return anyEn.name;

    // 8) Absolute fallback
    return voices[0].name;
  }

  function _pickBestVoice(utterance, voices) {
    var name = _pickBestVoiceName(voices);
    if (!name) return;
    var pick = voices.find(function(v) { return v.name === name; });
    if (pick) {
      utterance.voice = pick;
      // Remember this voice for next time
      if (name !== _preferredVoiceName) _savePreferredVoice(name);
    }
  }

  // ── Voice Commands ────────────────────────────────────────

  let _voiceRecognition = null;

  function toggleVoiceCommands() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      _toast('Voice commands not supported on this browser');
      return;
    }
    if (_voiceRecognition) {
      _stopVoiceRecognition();
    } else {
      _startVoiceRecognition();
    }
  }

  function _startVoiceRecognition() {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onresult = function(event) {
      var last = event.results[event.results.length - 1];
      if (!last.isFinal) return;
      var transcript = (last[0].transcript || '').toLowerCase().trim();
      if (!transcript) return;
      _showVoiceHeard(transcript);
      _handleVoiceCommand(transcript);
    };

    rec.onerror = function(event) {
      if (event.error === 'no-speech') return; // Silent — user just didn't speak
      if (event.error === 'aborted') return;    // We stopped it intentionally
      if (event.error === 'not-allowed') {
        _toast('Microphone access denied — check browser permissions');
        _stopVoiceRecognition();
        return;
      }
      // Network or other error — restart
      console.warn('Voice recognition error:', event.error);
      setTimeout(function() {
        if (_voiceRecognition) _voiceRecognition.start();
      }, 500);
    };

    rec.onend = function() {
      // Auto-restart if still active (not intentionally stopped)
      if (_voiceRecognition === rec) {
        try { rec.start(); } catch(_) {}
      }
    };

    _voiceRecognition = rec;
    try { rec.start(); } catch(_) {
      _toast('Could not start microphone');
      _voiceRecognition = null;
      return;
    }

    _syncVoiceToggle();
    _showVoiceIndicator('Listening...', '');
  }

  function _stopVoiceRecognition() {
    if (_voiceRecognition) {
      _voiceRecognition.onend = null; // Prevent auto-restart
      _voiceRecognition.abort();
      _voiceRecognition = null;
    }
    _syncVoiceToggle();
    _hideVoiceIndicator();
  }

  function _syncVoiceToggle() {
    var btn   = document.getElementById('cook-voice-toggle');
    var icon  = btn ? btn.querySelector('.voice-toggle-icon') : null;
    var label = btn ? btn.querySelector('.voice-toggle-label') : null;
    var active = !!_voiceRecognition;
    if (btn) {
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    }
    if (icon)  icon.textContent  = active ? '🎤' : '🎤';
    if (label) label.textContent = active ? 'Listening' : 'Voice';
  }

  function _showVoiceIndicator(label, cmd) {
    var el    = document.getElementById('cook-voice-indicator');
    var lbl   = document.getElementById('voice-indicator-label');
    var cmdEl = document.getElementById('voice-indicator-cmd');
    if (el) el.hidden = false;
    if (lbl) lbl.textContent = label;
    if (cmdEl) cmdEl.textContent = cmd ? 'Heard: "' + cmd + '"' : '';
  }

  function _hideVoiceIndicator() {
    var el = document.getElementById('cook-voice-indicator');
    if (el) el.hidden = true;
  }

  function _showVoiceHeard(transcript) {
    _showVoiceIndicator('Got it!', transcript);
    clearTimeout(window.__voiceHeardTimer);
    window.__voiceHeardTimer = setTimeout(function() {
      if (_voiceRecognition) _showVoiceIndicator('Listening...', '');
    }, 2000);
  }

  function _handleVoiceCommand(transcript) {
    // "next" / "next step"
    if (/\bnext\b/.test(transcript)) {
      nextCookStep();
      return;
    }
    // "repeat" / "again" / "read" / "say it"
    if (/\b(repeat|again|read|say)\b/.test(transcript)) {
      speakCurrentStep();
      return;
    }
    // "timer [N]" / "start timer [N]" / "set timer [N]"
    var timerMatch = transcript.match(/\btimer\s*(\d+)\b/);
    if (timerMatch) {
      var minutes = parseInt(timerMatch[1]);
      if (minutes > 0 && minutes <= 120) {
        startStepTimer(state.cookMode.stepIndex, minutes * 60, minutes + ' min timer');
        _toast('Timer set: ' + minutes + ' min');
      }
      return;
    }
    // "stop" / "pause" / "shut up" / "quiet"
    if (/\b(stop|pause|shut\s*up|quiet)\b/.test(transcript)) {
      stopSpeaking();
      return;
    }
    // "lost" / "where am I" / "help"
    if (/\b(lost|where|help)\b/.test(transcript)) {
      recoverDistraction();
      return;
    }
    // "back" / "previous"
    if (/\b(back|previous)\b/.test(transcript)) {
      if (state.cookMode.stepIndex > 0) {
        state.cookMode.stepIndex--;
        state.cookMode.stepStartedAt = Date.now();
        _renderCookStep();
        if (state.ttsAutoRead) speakCurrentStep();
      }
      return;
    }
  }

  // ── Paywall ───────────────────────────────────────────────────

  function _showPaywall() {
    const overlay = document.getElementById('paywall-overlay');
    if (overlay) overlay.removeAttribute('hidden');
  }

  function paywallPro() {
    const overlay = document.getElementById('paywall-overlay');
    if (overlay) overlay.setAttribute('hidden', '');
    document.getElementById('waitlist-form').hidden    = false;
    document.getElementById('waitlist-success').hidden = true;
    document.getElementById('waitlist-error').hidden   = true;
    go('waitlist');
  }

  function paywallContinue() {
    const overlay = document.getElementById('paywall-overlay');
    if (overlay) overlay.setAttribute('hidden', '');
    const meal = state.selectedMeal;
    if (meal) _enterCookMode(meal);
  }

  // ── Timers ────────────────────────────────────────────────────

  function startStepTimer(stepIndex, seconds, label) {
    const id    = ++_timerCounter;
    const timer = {
      id,
      label: label || `Timer ${id}`,
      total: seconds,
      remaining: seconds,
      running:   true,
      done:      false,
      intervalId: setInterval(() => _tickTimer(id), 1000)
    };
    _timers.push(timer);
    _activeTimerId = id;
    _showTimerSheet(id);
    _renderTimerPills();
  }

  function _tickTimer(id) {
    const timer = _timers.find(t => t.id === id);
    if (!timer || !timer.running) return;
    timer.remaining--;
    if (timer.remaining <= 0) {
      _completeTimer(timer);
    } else {
      _renderTimerPills();
      if (_activeTimerId === id) _updateTimerSheet(timer);
    }
  }

  function _completeTimer(timer) {
    clearInterval(timer.intervalId);
    timer.remaining = 0;
    timer.running   = false;
    timer.done      = true;
    _renderTimerPills();
    _updateTimerSheet(timer);
    _playTimerChime();
    _flashScreen();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 300]);
    // Show sheet if not already open
    if (!document.getElementById('timer-overlay') || document.getElementById('timer-overlay').hasAttribute('hidden')) {
      _showTimerSheet(timer.id);
    }
    setTimeout(() => {
      _timers.splice(_timers.indexOf(timer), 1);
      _renderTimerPills();
      if (_activeTimerId === timer.id) closeTimerSheet();
    }, 4000);
  }

  function _playTimerChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx   = new AudioCtx();
      const notes = [523.25, 659.25, 783.99]; // C5 E5 G5 — soft major chord
      notes.forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.28;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        osc.start(t);
        osc.stop(t + 1.0);
      });
    } catch (_) {}
  }

  function _flashScreen() {
    const el = document.createElement('div');
    el.className = 'timer-complete-flash';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  }

  function _formatTime(secs) {
    const s = Math.max(0, secs);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, '0')}`;
  }

  function _renderTimerPills() {
    const container = document.getElementById('cook-timer-pills');
    if (!container) return;
    container.innerHTML = _timers.map(t => `
      <button class="timer-mini-pill${t.done ? ' done' : ''}"
              onclick="App.openTimer(${t.id})" type="button">
        ${t.done ? 'Done! ✓' : '⏱ ' + _formatTime(t.remaining)}
      </button>`).join('');
  }

  function _showTimerSheet(id) {
    _activeTimerId = id;
    const overlay = document.getElementById('timer-overlay');
    if (overlay) overlay.removeAttribute('hidden');
    const timer = _timers.find(t => t.id === id);
    if (timer) _updateTimerSheet(timer);
  }

  function _updateTimerSheet(timer) {
    const label  = document.getElementById('timer-sheet-label');
    const disp   = document.getElementById('timer-display');
    const pause  = document.getElementById('btn-timer-pause');
    if (label) label.textContent = timer.done ? '✓ Time\'s up!' : timer.label;
    if (disp) {
      disp.textContent = timer.done ? 'Done! ✓' : _formatTime(timer.remaining);
      disp.style.color = timer.done ? 'var(--primary)' : '';
    }
    if (pause) {
      pause.textContent        = timer.done ? 'Close' : (timer.running ? 'Pause' : 'Resume');
      pause.onclick            = timer.done ? closeTimerSheet : toggleActiveTimer;
    }
  }

  function openTimer(id) {
    _activeTimerId = id;
    _showTimerSheet(id);
  }

  function closeTimerSheet() {
    const overlay = document.getElementById('timer-overlay');
    if (overlay) overlay.setAttribute('hidden', '');
    _activeTimerId = null;
  }

  function toggleActiveTimer() {
    const timer = _timers.find(t => t.id === _activeTimerId);
    if (!timer || timer.done) return;
    timer.running = !timer.running;
    if (timer.running) {
      timer.intervalId = setInterval(() => _tickTimer(timer.id), 1000);
    } else {
      clearInterval(timer.intervalId);
    }
    _updateTimerSheet(timer);
  }

  function cancelActiveTimer() {
    const timer = _timers.find(t => t.id === _activeTimerId);
    if (timer) {
      clearInterval(timer.intervalId);
      _timers.splice(_timers.indexOf(timer), 1);
    }
    closeTimerSheet();
    _renderTimerPills();
  }

  function _cancelAllTimers() {
    _timers.forEach(t => clearInterval(t.intervalId));
    _timers.length = 0;
    _activeTimerId = null;
    _renderTimerPills();
    closeTimerSheet();
  }

  // ── Rescue Mode ───────────────────────────────────────────────

  function startRescueMode(source) {
    let steps;
    let meal = null;

    if (source === 'current' && state.selectedMeal) {
      meal  = state.selectedMeal;
      steps = meal.rescueSteps || meal.minSteps || GENERIC_RESCUE_STEPS;
    } else {
      // Try last cooked meal
      try {
        const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        if (raw.length > 0) {
          const last = raw[0];
          const found = Object.values(MEALS).flatMap(l => l).find(m => m.id === last.id);
          if (found) {
            meal  = found;
            steps = found.rescueSteps || found.minSteps || GENERIC_RESCUE_STEPS;
          }
        }
      } catch(_) {}

      if (!steps) steps = GENERIC_RESCUE_STEPS;
    }

    state.rescue.meal      = meal;
    state.rescue.steps     = steps;
    state.rescue.stepIndex = 0;

    go('rescue');
    _renderRescueStep();
  }

  function _renderRescueStep() {
    const { steps, stepIndex } = state.rescue;
    const total = steps.length;
    const step  = steps[stepIndex];

    const body = document.getElementById('rescue-body');
    if (!body) return;

    const isLast = stepIndex >= total - 1;

    body.innerHTML = `
      <p class="rescue-calm-msg">One thing at a time. You've got this 💚</p>
      <p class="rescue-step-count">${stepIndex + 1} of ${total}</p>
      <p class="rescue-step-text">${_escape(step)}</p>
      <p class="rescue-encouragement">Take your time with this one.</p>
      <button class="btn-rescue-next" onclick="App.nextRescueStep()">
        ${isLast ? 'All done ✓' : 'Done ✓  What\'s next?'}
      </button>
      <button class="btn-rescue-exit" onclick="App.exitRescueMode()">Exit rescue mode</button>`;
  }

  function nextRescueStep() {
    const { steps, stepIndex } = state.rescue;
    if (stepIndex >= steps.length - 1) {
      exitRescueMode();
      return;
    }
    state.rescue.stepIndex++;
    _renderRescueStep();
  }

  function exitRescueMode() {
    stopSpeaking();
    if (state.selectedMeal) {
      go('recipe');
    } else {
      go('home');
    }
  }

  // ── Persist preferences ───────────────────────────────────────

  const PREFS_KEY = 'kc_prefs';

  function _savePrefs() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({
        homeEnergy:  state.homeEnergy,
        filters:     [...state.filters],
        prepFilter:  state.prepFilter,
        portionSize: state.portionSize,
        mealType:    state.mealType
      }));
    } catch (_) {}
  }

  function _loadPrefs() {
    try {
      const raw = JSON.parse(localStorage.getItem(PREFS_KEY));
      if (!raw) return false;
      let restored = false;
      if (raw.homeEnergy)                                       { state.homeEnergy  = raw.homeEnergy;  restored = true; }
      if (Array.isArray(raw.filters) && raw.filters.length > 0) { state.filters = new Set(raw.filters); restored = true; }
      if (raw.prepFilter)                                       { state.prepFilter  = raw.prepFilter;   restored = true; }
      if (raw.portionSize)                                      { state.portionSize = raw.portionSize;  restored = true; }
      if (raw.mealType)                                         { state.mealType    = raw.mealType; }
      return restored;
    } catch (_) { return false; }
  }

  // ── Accordion ────────────────────────────────────────────────

  const ACCORDION_KEY = 'kc_accordion';

  function _loadAccordionState() {
    try {
      const raw = JSON.parse(localStorage.getItem(ACCORDION_KEY));
      if (raw && typeof raw === 'object') return { energy: !!raw.energy, filters: !!raw.filters };
    } catch(_) {}
    return null;
  }

  function _saveAccordionState(s) {
    try { localStorage.setItem(ACCORDION_KEY, JSON.stringify(s)); } catch(_) {}
  }

  function toggleAccordion(name) {
    const current = _loadAccordionState() || { energy: false, filters: true };
    current[name] = !current[name];
    _saveAccordionState(current);
    _applyOneAccordion(name, current[name], true);
  }

  function _applyOneAccordion(name, expanded, animate) {
    const body    = document.getElementById('acc-' + name + '-body');
    const chevron = document.getElementById('acc-' + name + '-chevron');
    const sub     = document.getElementById('acc-' + name + '-sub');
    const header  = document.getElementById('acc-' + name + '-header');
    if (!body) return;

    if (!animate) {
      body.style.transition = 'none';
      body.style.maxHeight  = expanded ? '600px' : '0px';
      void body.offsetHeight;
      body.style.transition = '';
    } else {
      body.style.maxHeight = expanded ? '600px' : '0px';
    }

    if (chevron) chevron.textContent = expanded ? '▲' : '▼';
    if (header)  header.setAttribute('aria-expanded', String(expanded));
    if (sub)     sub.textContent = expanded ? '' : _getAccordionSubtitle(name);
  }

  function _getAccordionSubtitle(name) {
    if (name === 'energy') {
      const icons = { low: '🌙 Low', medium: '🌤 Medium', high: '⚡ High' };
      return state.homeEnergy ? '— ' + (icons[state.homeEnergy] || '') : '';
    }
    if (name === 'filters') {
      const parts = [];
      const fl = { 'low-carb': 'Low Carb', 'grain-free': 'Grain Free', 'clean-eating': 'Clean', 'quick': 'Quick', 'minimal-washing': 'Easy wash', 'halal-friendly': 'Halal' };
      state.filters.forEach(k => { if (fl[k]) parts.push(fl[k]); });
      const pl = { 'no-prep': 'No prep', 'quick-prep': 'Quick prep', 'some-prep': 'Some prep' };
      if (state.prepFilter && pl[state.prepFilter]) parts.push(pl[state.prepFilter]);
      if (state.activeCategory) {
        const cat = CATEGORIES.find(c => c.key === state.activeCategory);
        if (cat) parts.push(cat.label);
      }
      return parts.length ? '— ' + parts.join(' · ') : '';
    }
    return '';
  }

  function _updateAccordionSubtitles() {
    const stored = _loadAccordionState() || { energy: false, filters: false };
    if (!stored.energy) {
      const sub = document.getElementById('acc-energy-sub');
      if (sub) sub.textContent = _getAccordionSubtitle('energy');
    }
    if (!stored.filters) {
      const sub = document.getElementById('acc-filters-sub');
      if (sub) sub.textContent = _getAccordionSubtitle('filters');
    }
  }

  function _initAccordion() {
    const stored     = _loadAccordionState();
    const isFirst    = stored === null;
    const accState   = stored || { energy: true, filters: false };
    if (isFirst) _saveAccordionState(accState);
    _applyOneAccordion('energy',  accState.energy,  false);
    _applyOneAccordion('filters', accState.filters, false);
  }

  // ── Pantry ───────────────────────────────────────────────────

  const CATEGORY_LABELS = {
    fridge:  '🧊 Fridge',
    pantry:  '🫙 Cupboard',
    produce: '🥦 Produce',
    protein: '🥩 Protein'
  };

  function _renderPantry() {
    let welcomed = false;
    try { welcomed = !!localStorage.getItem('kc_pantry_welcomed'); } catch(_) {}
    const owned = Pantry.getOwned();
    let html = '';
    if (!welcomed) {
      html += `
        <div class="pantry-welcome-banner" id="pantry-welcome-banner">
          <div class="pantry-welcome-icon">🧺</div>
          <h2 class="pantry-welcome-title">What's in your cupboard?</h2>
          <p class="pantry-welcome-desc">We've ticked the basics to get you started. Update the list to match what you actually have — the app will then show exactly what you can cook and what to buy.</p>
          <button class="btn-pantry-welcome" onclick="App.dismissPantryWelcome()">Got it — let me update this →</button>
        </div>`;
    }
    Object.entries(PANTRY_ITEMS).forEach(([cat, items]) => {
      html += `<div class="pantry-section">
        <div class="pantry-section-label">${CATEGORY_LABELS[cat] || cat}</div>
        <div class="pantry-items-grid">`;
      items.forEach(item => {
        const checked = owned.has(item.id);
        html += `
          <button class="pantry-item${checked ? ' owned' : ''}"
                  onclick="App.togglePantry('${item.id}')"
                  aria-pressed="${checked}">
            <span class="pi-check" aria-hidden="true">${checked ? '✓' : ''}</span>
            <span class="pi-name">${_escape(item.name)}</span>
          </button>`;
      });
      html += `</div></div>`;
    });
    document.getElementById('pantry-items').innerHTML = html;
    _updatePantryMatchBar();
  }

  function togglePantry(id) {
    Pantry.toggle(id);
    _renderPantry();
    _updatePantryMatchBar();
  }

  // ── Photo Pantry ────────────────────────────────────────────

  function openPantryCamera() {
    var input = document.getElementById('pantry-photo-input');
    if (input) input.click();
  }

  function handlePantryPhoto(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      var preview = document.getElementById('pantry-photo-preview');
      var img     = document.getElementById('pantry-photo-img');
      var btn     = document.querySelector('.btn-photo-capture');
      if (preview) preview.hidden = false;
      if (btn)     btn.style.display = 'none';
      if (img)     img.src = e.target.result;
      _updatePantryMatchBar();
    };
    reader.readAsDataURL(file);
    // Reset file input so re-taking the same photo works
    event.target.value = '';
  }

  function clearPantryPhoto() {
    var preview = document.getElementById('pantry-photo-preview');
    var btn     = document.querySelector('.btn-photo-capture');
    if (preview) preview.hidden = true;
    if (btn)     btn.style.display = '';
    var matchBar = document.getElementById('pantry-match-bar');
    if (matchBar) matchBar.hidden = true;
  }

  function _updatePantryMatchBar() {
    // Only show when a photo is present
    var preview = document.getElementById('pantry-photo-preview');
    if (!preview || preview.hidden) return;

    var owned = Pantry.getOwned();
    if (owned.size === 0) return;

    // Count how many meals are fully cookable with current pantry
    var allMeals = [].concat(MEALS.low || [], MEALS.medium || [], MEALS.high || []);
    var cookable = allMeals.filter(function(meal) {
      return meal.ingredientIds && meal.ingredientIds.length > 0 &&
        meal.ingredientIds.every(function(id) { return owned.has(id); });
    });

    var bar = document.getElementById('pantry-match-bar');
    var text = document.getElementById('pantry-match-text');
    if (!bar || !text) return;

    if (cookable.length === 0) {
      // Show how many items away they are
      var closest = null;
      var closestMissing = Infinity;
      allMeals.forEach(function(meal) {
        if (!meal.ingredientIds) return;
        var missing = meal.ingredientIds.filter(function(id) { return !owned.has(id); });
        if (missing.length < closestMissing) {
          closestMissing = missing.length;
          closest = meal;
        }
      });
      if (closest && closestMissing <= 3) {
        text.textContent = '🛒 Almost! \u201c' + closest.name + '\u201d needs ' + closestMissing + ' more item' + (closestMissing !== 1 ? 's' : '');
        bar.style.background = '#FFF8E8';
        bar.style.color = '#B07A10';
      } else {
        text.textContent = '📸 Got the photo! Now tick what you see.';
        bar.style.background = 'var(--surface-2)';
        bar.style.color = 'var(--text-2)';
        bar.hidden = false;
        return;
      }
    } else {
      text.textContent = '✅ You can cook ' + cookable.length + ' meal' + (cookable.length !== 1 ? 's' : '') + ' with what you have!';
      bar.style.background = 'var(--success-bg)';
      bar.style.color = 'var(--success)';
    }
    bar.hidden = false;
  }

  // ── Shopping List ─────────────────────────────────────────────

  function addToShopping() {
    const meal = state.selectedMeal;
    if (!meal) return;
    const added = Pantry.addMealToShoppingList(meal);
    if (added > 0) {
      _toast(`Added ${added} item${added !== 1 ? 's' : ''} to shopping list`);
    } else {
      _toast('Already on your list!');
    }
  }

  function _renderShopping() {
    const list    = Pantry.getShoppingList();
    const countEl = document.getElementById('shopping-count');
    if (countEl) countEl.textContent = list.length ? `${list.length} item${list.length !== 1 ? 's' : ''}` : '';

    if (!list.length) {
      document.getElementById('shopping-list').innerHTML =
        `<p class="shopping-empty">Your shopping list is empty.<br>Add missing ingredients from any recipe.</p>`;
      const doneBtn = document.getElementById('btn-done-shopping');
      if (doneBtn) doneBtn.style.display = 'none';
      return;
    }

    const byCategory = {};
    list.forEach(item => {
      const cat = item.category || 'pantry';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item);
    });

    let html = '';
    Object.entries(byCategory).forEach(([cat, items]) => {
      html += `<div class="shop-section">
        <div class="shop-section-label">${CATEGORY_LABELS[cat] || cat}</div>`;
      items.forEach(item => {
        html += `
          <div class="shop-item${item.checked ? ' checked' : ''}">
            <button class="shop-check" onclick="App.toggleShopItem('${item.id}')" aria-label="Toggle ${_escape(item.name)}">
              <span class="shop-check-icon">${item.checked ? '✓' : ''}</span>
            </button>
            <span class="shop-name">${_escape(item.name)}</span>
            <button class="shop-remove" onclick="App.removeShopItem('${item.id}')" aria-label="Remove">✕</button>
          </div>`;
      });
      html += `</div>`;
    });
    document.getElementById('shopping-list').innerHTML = html;

    const hasChecked = list.some(i => i.checked);
    const doneBtn    = document.getElementById('btn-done-shopping');
    if (doneBtn) doneBtn.style.display = hasChecked ? 'flex' : 'none';
  }

  function toggleShopItem(id) { Pantry.toggleShoppingItem(id); _renderShopping(); }
  function removeShopItem(id) { Pantry.removeShoppingItem(id); _renderShopping(); }

  function doneShopping() {
    Pantry.completeShopping();
    _renderShopping();
    _toast('Cupboard updated!');
    _updatePantryMatchBar();
  }

  // ── Feedback ─────────────────────────────────────────────────

  function openFeedback() {
    // Reset to form state when opening
    const formEl    = document.getElementById('feedback-form');
    const successEl = document.getElementById('feedback-success');
    const errorEl   = document.getElementById('feedback-error');
    if (formEl)    formEl.hidden    = false;
    if (successEl) successEl.hidden = true;
    if (errorEl)   errorEl.hidden   = true;
    const consentErr = document.getElementById('feedback-consent-error');
    if (consentErr) consentErr.hidden = true;
    const btn = document.querySelector('.btn-submit-feedback');
    if (btn) { btn.textContent = 'Send feedback →'; btn.disabled = false; }
    go('feedback');
  }

  async function submitFeedback() {
    const consentEl = document.getElementById('feedback-consent');
    const errorEl   = document.getElementById('feedback-consent-error');
    if (!consentEl.checked) {
      const row = consentEl.closest('.feedback-consent-row');
      if (row) { row.classList.remove('shake'); void row.offsetWidth; row.classList.add('shake'); }
      if (errorEl) errorEl.hidden = false;
      return;
    }
    if (errorEl) errorEl.hidden = true;

    const rating  = document.querySelector('.star-btn.selected')?.dataset.value || '';
    const message = document.getElementById('feedback-missing')?.value  || '';
    const email   = document.getElementById('feedback-email')?.value    || '';

    const data = new FormData();
    data.append('rating',  rating ? rating + '/5' : 'Not given');
    data.append('message', message);
    data.append('email',   email);
    data.append('consent', 'yes');

    const btn = document.querySelector('.btn-submit-feedback');
    if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }

    try {
      const res = await fetch('https://formspree.io/f/xrejpoyg', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('bad response');
      document.getElementById('feedback-form').hidden    = true;
      document.getElementById('feedback-success').hidden = false;
    } catch (_) {
      document.getElementById('feedback-form').hidden  = true;
      document.getElementById('feedback-error').hidden = false;
    }
  }

  async function submitWaitlist() {
    const emailEl = document.getElementById('waitlist-email');
    const btn     = document.querySelector('.btn-submit-waitlist');
    const email   = emailEl ? emailEl.value.trim() : '';
    if (!email || !email.includes('@')) {
      emailEl.focus();
      return;
    }
    btn.textContent = 'Joining…';
    btn.disabled    = true;
    const data = new FormData();
    data.append('email',    email);
    data.append('_subject', 'Kitchen Calm Pro — Waitlist signup');
    data.append('source',   'pro-waitlist');
    try {
      const res = await fetch('https://formspree.io/f/xrejpoyg', {
        method: 'POST',
        body:   data,
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('bad response');
      document.getElementById('waitlist-form').hidden    = true;
      document.getElementById('waitlist-success').hidden = false;
    } catch (_) {
      document.getElementById('waitlist-form').hidden  = true;
      document.getElementById('waitlist-error').hidden = false;
      btn.textContent = 'Join the waitlist →';
      btn.disabled    = false;
    }
  }

  function retryWaitlist() {
    document.getElementById('waitlist-form').hidden  = false;
    document.getElementById('waitlist-error').hidden = true;
  }

  function retryFeedback() {
    document.getElementById('feedback-form').hidden  = false;
    document.getElementById('feedback-error').hidden = true;
    const btn = document.querySelector('.btn-submit-feedback');
    if (btn) { btn.textContent = 'Send feedback →'; btn.disabled = false; }
  }

  function toggleStar(val) {
    document.querySelectorAll('.star-btn').forEach(btn => {
      btn.classList.toggle('selected', parseInt(btn.dataset.value) <= val);
    });
  }

  // ── Pantry welcome ───────────────────────────────────────
  function dismissPantryWelcome() {
    try { localStorage.setItem('kc_pantry_welcomed', '1'); } catch(_) {}
    const banner = document.getElementById('pantry-welcome-banner');
    if (banner) banner.remove();
  }

  // ── Coming soon ──────────────────────────────────────────────

  function comingSoon(title, icon, desc) {
    document.getElementById('soon-icon').textContent  = icon;
    document.getElementById('soon-title').textContent = title + ' — Coming Soon';
    document.getElementById('soon-desc').textContent  = desc;
    go('soon');
  }

  // ── Desktop Warning Banner ───────────────────────────────────

  function _initDesktopBanner() {
    if (window.innerWidth < 520) return;
    try { if (localStorage.getItem('kc_desktopBannerDismissed')) return; } catch(_) {}
    const panel = document.getElementById('desktop-panel');
    if (panel) panel.classList.remove('dismissed');
  }

  function dismissDesktopBanner() {
    try { localStorage.setItem('kc_desktopBannerDismissed', '1'); } catch(_) {}
    const panel = document.getElementById('desktop-panel');
    if (panel) panel.classList.add('dismissed');
  }

  // ── Onboarding ───────────────────────────────────────────────

  let _onboardingSlide = 0;

  function _initOnboarding() {
    try { if (localStorage.getItem('kc_onboardingDone')) { _hideOnboarding(); return; } } catch(_) {}
    // Overlay is visible by default; nothing to do
  }

  function _hideOnboarding() {
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) overlay.hidden = true;
  }

  function _setOnboardingSlide(idx) {
    const track = document.getElementById('onboarding-track');
    if (track) track.style.transform = `translateX(-${idx * 100}%)`;

    document.querySelectorAll('.odot').forEach((dot, i) => dot.classList.toggle('active', i === idx));

    const btn = document.getElementById('btn-onboarding-next');
    if (btn) {
      if (idx === 0) btn.textContent = "Let's get started →";
      else if (idx === 1) btn.textContent = 'Next →';
      else btn.textContent = 'Start Cooking →';
    }
  }

  function nextOnboardingSlide() {
    _onboardingSlide++;
    if (_onboardingSlide >= 3) {
      _completeOnboarding();
      return;
    }
    _setOnboardingSlide(_onboardingSlide);
  }

  function skipOnboarding() { _completeOnboarding(); }

  function _completeOnboarding() {
    try { localStorage.setItem('kc_onboardingDone', '1'); } catch(_) {}
    _hideOnboarding();
  }

  // ── Toast ────────────────────────────────────────────────────

  function _toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('visible'), 2800);
  }

  // ── Utilities ────────────────────────────────────────────────

  function _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Init ─────────────────────────────────────────────────────

  // Cache speech voices (Chrome loads them async)
  _loadPreferredVoice();
  if ('speechSynthesis' in window) {
    _cachedVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = function() {
      _cachedVoices = window.speechSynthesis.getVoices();
    };
    // Chrome sometimes fires onvoiceschanged before our handler is set;
    // force a second fetch after a short delay to catch late-loading voices
    setTimeout(function() {
      var fresh = window.speechSynthesis.getVoices();
      if (fresh.length > 0) { _cachedVoices = fresh; }
    }, 600);
  }

  Pantry.load();
  _renderStreakBadge();
  _loadHistory();
  _loadInterrupted();
  const _prefsRestored = _loadPrefs();
  _syncEnergyWidget();
  _syncFilterButtons();
  _syncPrepFilterButtons();
  _syncPortionButtons();
  _syncMealTypeTabs();
  _updateHeroCTA();
  _renderHomeCategoryRow();
  _initDesktopBanner();
  _initOnboarding();
  _initAccordion();
  if (_prefsRestored) {
    setTimeout(() => _toast('Preferences remembered 💚'), 700);
  }

  // ── Public API ───────────────────────────────────────────────

  return {
    go, leaveRecipe,
    pickEnergy, shuffle, surpriseMe, surpriseMeFromHome, showMore, setSort, toggleGridFilter, selectMeal, comingSoon, cookAgain,
    setHomeEnergy, heroCTA, setMealType,
    toggleFilter, setPrepFilter, setPortionSize,
    setCategory, filterMealGrid, clearAllFilters,
    togglePantry, addToShopping,
    openPantryCamera, handlePantryPhoto, clearPantryPhoto,
    toggleShopItem, removeShopItem, doneShopping,
    saveInterruption, resumeCooking, clearInterruption,
    dismissPantryWelcome,
    openFeedback, submitFeedback, toggleStar,
    toggleIngredient, resetIngredients,
    toggleStep,
    // Cook mode
    startCookMode, exitCookMode, nextCookStep,
    cookModeAgain, exitCookToHome, rateCookMeal,
    recoverDistraction, _restoreCookStep,
    paywallPro, paywallContinue, submitWaitlist, retryWaitlist,
    toggleAutoRead, speakCurrentStep, stopSpeaking,
    toggleVoiceCommands,
    // Timers
    startStepTimer, openTimer, closeTimerSheet,
    toggleActiveTimer, cancelActiveTimer,
    // Rescue
    startRescueMode, nextRescueStep, exitRescueMode,
    // Accordion
    toggleAccordion,
    // Banner & onboarding
    dismissDesktopBanner, nextOnboardingSlide, skipOnboarding,
    // Shuffle & navigation
    startOver, nextMeal, previousMeal,
    // History
    openHistory, closeHistory,
    // Filter removal
    removeFilter,
    // Feedback
    retryFeedback
  };
})();
