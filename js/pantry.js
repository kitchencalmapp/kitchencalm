// Kitchen Calm — Pantry & Shopping List

const PANTRY_ITEMS = {
  fridge: [
    { id: 'eggs',         name: 'Eggs'              },
    { id: 'butter',       name: 'Butter'            },
    { id: 'cheese',       name: 'Cheese'            },
    { id: 'milk',         name: 'Milk'              },
    { id: 'yogurt',       name: 'Greek Yogurt'      },
    { id: 'sour-cream',   name: 'Sour Cream'        },
    { id: 'cream-cheese', name: 'Cream Cheese'      },
    { id: 'mayo',         name: 'Mayo'              }
  ],
  pantry: [
    { id: 'bread',             name: 'Bread'               },
    { id: 'pasta',             name: 'Pasta'               },
    { id: 'rice',              name: 'Rice'                },
    { id: 'oats',              name: 'Rolled Oats'         },
    { id: 'rice-cakes',        name: 'Rice Cakes'          },
    { id: 'chia-seeds',        name: 'Chia Seeds'          },
    { id: 'oil',               name: 'Olive / Veg Oil'     },
    { id: 'soy-sauce',         name: 'Soy Sauce'           },
    { id: 'pasta-sauce',       name: 'Jarred Pasta Sauce'  },
    { id: 'canned-tomatoes',   name: 'Canned Tomatoes'     },
    { id: 'canned-beans',      name: 'Canned Beans'        },
    { id: 'canned-chickpeas',  name: 'Canned Chickpeas'    },
    { id: 'red-lentils',       name: 'Red Lentils'         },
    { id: 'tortillas',         name: 'Tortillas'           },
    { id: 'hummus',            name: 'Hummus'              },
    { id: 'pita',              name: 'Pita Bread'          },
    { id: 'veggie-stock',      name: 'Veggie Stock'        },
    { id: 'parmesan',          name: 'Parmesan'            },
    { id: 'peanut-butter',     name: 'Peanut Butter'       },
    { id: 'honey',             name: 'Honey'               },
    { id: 'dates',             name: 'Dates'               },
    { id: 'almonds',           name: 'Almonds'             },
    { id: 'nuts',              name: 'Mixed Nuts'          },
    { id: 'paprika',           name: 'Paprika'             },
    { id: 'cumin',             name: 'Cumin'               },
    { id: 'turmeric',          name: 'Turmeric'            },
    { id: 'garlic-powder',     name: 'Garlic Powder'       },
    { id: 'taco-seasoning',    name: 'Taco Seasoning'      },
    { id: 'italian-seasoning', name: 'Italian Seasoning'   }
  ],
  produce: [
    { id: 'garlic',      name: 'Garlic'       },
    { id: 'onion',       name: 'Onion'        },
    { id: 'lemon',       name: 'Lemon'        },
    { id: 'avocado',     name: 'Avocado'      },
    { id: 'banana',      name: 'Banana'       },
    { id: 'potato',      name: 'Potato'       },
    { id: 'sweet-potato',name: 'Sweet Potato' },
    { id: 'tomato',      name: 'Tomato'       },
    { id: 'cucumber',    name: 'Cucumber'     },
    { id: 'lettuce',     name: 'Lettuce'      },
    { id: 'mixed-veg',   name: 'Mixed Veg'    },
    { id: 'bell-pepper', name: 'Bell Pepper'  },
    { id: 'zucchini',    name: 'Zucchini'     },
    { id: 'broccoli',    name: 'Broccoli'     },
    { id: 'cauliflower', name: 'Cauliflower'  },
    { id: 'asparagus',   name: 'Asparagus'    }
  ],
  protein: [
    { id: 'chicken-breast',  name: 'Halal Chicken Breast'  },
    { id: 'chicken-thighs',  name: 'Halal Chicken Thighs'  },
    { id: 'ground-beef',     name: 'Halal Ground Beef/Lamb' },
    { id: 'turkey-breast',   name: 'Halal Turkey Deli'      },
    { id: 'halal-sausages',  name: 'Halal Sausages'         },
    { id: 'salmon',          name: 'Salmon Fillet'          },
    { id: 'smoked-salmon',   name: 'Smoked Salmon'          },
    { id: 'cod',             name: 'Cod / White Fish'       },
    { id: 'prawns',          name: 'Prawns'                 }
  ]
};

const PANTRY_LOOKUP = {};
Object.entries(PANTRY_ITEMS).forEach(([cat, items]) => {
  items.forEach(item => { PANTRY_LOOKUP[item.id] = { name: item.name, category: cat }; });
});

const PANTRY_DEFAULTS = [
  'eggs','butter','cheese','bread','pasta','rice','oats','oil',
  'paprika','cumin','soy-sauce','honey','yogurt'
];

const PANTRY_KEY   = 'kc_pantry';
const SHOPPING_KEY = 'kc_shopping';

const Pantry = (() => {

  let _owned    = new Set();
  let _shopping = [];

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(PANTRY_KEY));
      _owned = new Set(Array.isArray(raw) ? raw : PANTRY_DEFAULTS);
    } catch (_) {
      _owned = new Set(PANTRY_DEFAULTS);
    }
    if (!localStorage.getItem(PANTRY_KEY)) {
      _save();
    }
    try {
      const rawS = JSON.parse(localStorage.getItem(SHOPPING_KEY));
      _shopping = Array.isArray(rawS) ? rawS : [];
    } catch (_) {
      _shopping = [];
    }
  }

  function _save() {
    localStorage.setItem(PANTRY_KEY, JSON.stringify([..._owned]));
  }

  function _saveShopping() {
    localStorage.setItem(SHOPPING_KEY, JSON.stringify(_shopping));
  }

  function has(id)    { return _owned.has(id); }
  function getOwned() { return new Set(_owned); }

  function toggle(id) {
    if (_owned.has(id)) { _owned.delete(id); } else { _owned.add(id); }
    _save();
  }

  function getMealReadiness(meal) {
    const ids = meal.ingredientIds || [];
    if (!ids.length) return { status: 'unknown', missing: [], have: 0, total: 0 };
    const missing = ids.filter(id => !_owned.has(id));
    const have    = ids.length - missing.length;
    let status;
    if      (missing.length === 0) status = 'ready';
    else if (missing.length <= 2)  status = 'close';
    else                           status = 'needs';
    return { status, missing, have, total: ids.length };
  }

  function getMissingNames(meal) {
    return (meal.ingredientIds || [])
      .filter(id => !_owned.has(id))
      .map(id => PANTRY_LOOKUP[id] ? PANTRY_LOOKUP[id].name : id);
  }

  function getShoppingList() { return [..._shopping]; }

  function addMealToShoppingList(meal) {
    const missing = (meal.ingredientIds || []).filter(id => !_owned.has(id));
    let added = 0;
    missing.forEach(id => {
      if (!_shopping.find(s => s.id === id)) {
        const info = PANTRY_LOOKUP[id] || { name: id, category: 'pantry' };
        _shopping.push({ id, name: info.name, category: info.category, checked: false, mealId: meal.id });
        added++;
      }
    });
    _saveShopping();
    return added;
  }

  function toggleShoppingItem(id) {
    const item = _shopping.find(s => s.id === id);
    if (item) { item.checked = !item.checked; _saveShopping(); }
  }

  function removeShoppingItem(id) {
    _shopping = _shopping.filter(s => s.id !== id);
    _saveShopping();
  }

  function completeShopping() {
    _shopping.filter(s => s.checked).forEach(s => _owned.add(s.id));
    _shopping = _shopping.filter(s => !s.checked);
    _save();
    _saveShopping();
  }

  function clearShopping() {
    _shopping = [];
    _saveShopping();
  }

  return {
    load,
    has,
    toggle,
    getOwned,
    getMealReadiness,
    getMissingNames,
    getShoppingList,
    addMealToShoppingList,
    toggleShoppingItem,
    removeShoppingItem,
    completeShopping,
    clearShopping
  };
})();
