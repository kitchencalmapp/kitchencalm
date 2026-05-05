// Kitchen Calm — Extra Breakfast Meals (15 new)
// Loaded after meals-data.js — extends existing MEALS arrays

(function () {

  // ── 5 LOW energy breakfast ──────────────────────────────────

  const breakfastLow = [
    {
      id: 'date-banana-overnight-oats',
      name: 'Date & Banana Overnight Oats',
      emoji: '🍌',
      time: 5, prepTime: 5, cookTime: 0, serves: 1,
      tag: 'Prep ahead',
      mealType: 'breakfast',
      labels: ['vegetarian', 'halal'],
      description: 'Naturally sweet from dates and banana. Set it up in two minutes the night before.',
      lowCarb: false, grainFree: false, cleanEating: true, containsSugar: false, naturallySweet: true,
      cleanupScore: 'green',
      category: 'breakfast',
      ingredientIds: ['oats', 'milk', 'dates', 'banana'],
      ingredients: [
        '½ cup rolled oats',
        '½ cup milk or plant milk',
        '2–3 dates (pitted and chopped)',
        '½ banana (mashed)',
        'Pinch of salt'
      ],
      steps: [
        'The night before: put ½ cup oats and ½ cup milk into a jar or bowl.',
        'Pit and roughly chop 2–3 dates.',
        'Mash ½ banana with a fork until smooth.',
        'Stir the dates, mashed banana, and a pinch of salt into the oats.',
        'Cover and refrigerate overnight.',
        'In the morning: give it a stir and eat straight from the jar.'
      ],
      minSteps: ['Mix oats, milk, dates, and mashed banana in a jar.', 'Refrigerate overnight.', 'Stir and eat in the morning.'],
      rescueSteps: ['Oats and milk in jar', 'Mash banana, chop dates', 'Stir everything together', 'Refrigerate overnight']
    },
    {
      id: 'honey-almond-porridge',
      name: 'Honey & Almond Porridge',
      emoji: '🥣',
      time: 8, prepTime: 2, cookTime: 6, serves: 1,
      tag: 'Quick & warming',
      mealType: 'breakfast',
      labels: ['vegetarian', 'halal'],
      description: 'Creamy microwave porridge topped with honey and crunchy almonds. Ready before you\'re properly awake.',
      lowCarb: false, grainFree: false, cleanEating: true, containsSugar: false, naturallySweet: true,
      cleanupScore: 'green',
      category: 'breakfast',
      ingredientIds: ['oats', 'milk', 'honey', 'almonds'],
      ingredients: [
        '½ cup rolled oats',
        '1 cup milk or water',
        '1 tbsp honey',
        'Small handful of almonds',
        'Pinch of salt'
      ],
      steps: [
        'Put ½ cup oats and 1 cup milk into a microwave-safe bowl.',
        'Add a pinch of salt and stir.',
        'Microwave on high for 2 minutes.',
        'Stir, then microwave 1 more minute.',
        'Stir again — it should be thick and creamy. Add a splash more milk if too stiff.',
        'Drizzle 1 tbsp honey over the top.',
        'Scatter a handful of almonds on top. Eat immediately.'
      ],
      minSteps: ['Oats + milk in bowl. Microwave 3 minutes total, stirring once.', 'Drizzle honey on top.', 'Add almonds and eat.'],
      rescueSteps: ['Oats and milk in bowl', 'Microwave 3 minutes', 'Stir once halfway', 'Drizzle honey, add almonds']
    },
    {
      id: 'cream-cheese-cucumber-bagel',
      name: 'Cream Cheese & Cucumber Bagel',
      emoji: '🥯',
      time: 5, prepTime: 5, cookTime: 0, serves: 1,
      tag: 'No cooking',
      mealType: 'breakfast',
      labels: ['vegetarian', 'halal'],
      description: 'Slice, spread, eat. Cool and filling with zero cooking required.',
      lowCarb: false, grainFree: false, cleanEating: true, containsSugar: false, naturallySweet: false,
      cleanupScore: 'green',
      category: 'breakfast',
      ingredientIds: ['cream-cheese', 'cucumber', 'lemon'],
      ingredients: [
        '1 bagel (halved)',
        '3 tbsp cream cheese',
        'Half a cucumber (sliced thin)',
        'Salt & black pepper',
        'Optional: squeeze of lemon juice, chilli flakes'
      ],
      steps: [
        'Slice the bagel in half if not already done.',
        'Spread 3 tbsp cream cheese generously across both halves.',
        'Slice half a cucumber into thin rounds.',
        'Layer cucumber slices over the cream cheese.',
        'Season with salt, black pepper, and a squeeze of lemon if you have it.',
        'Eat immediately.'
      ],
      minSteps: ['Spread cream cheese on bagel.', 'Layer cucumber slices on top.', 'Season with salt, pepper, and lemon.'],
      rescueSteps: ['Bagel halved on plate', 'Spread cream cheese on', 'Layer cucumber slices', 'Season and eat']
    },
    {
      id: 'honey-green-smoothie',
      name: 'Honey Green Smoothie',
      emoji: '🥤',
      time: 5, prepTime: 5, cookTime: 0, serves: 1,
      tag: 'Blender needed',
      mealType: 'breakfast',
      labels: ['vegetarian', 'halal'],
      description: 'Banana and spinach make it creamy and green. Honey balances it perfectly. Filling and surprisingly good.',
      lowCarb: false, grainFree: true, cleanEating: true, containsSugar: false, naturallySweet: true,
      cleanupScore: 'yellow',
      category: 'breakfast',
      ingredientIds: ['banana', 'milk', 'honey'],
      ingredients: [
        '1 ripe banana',
        'Handful of fresh spinach',
        '1 cup milk or plant milk',
        '1 tbsp honey',
        'Optional: pinch of cinnamon or ½ tsp vanilla'
      ],
      steps: [
        'Peel the banana and break into chunks.',
        'Put banana chunks, a large handful of spinach, and 1 cup milk in a blender.',
        'Add 1 tbsp honey.',
        'Add cinnamon or vanilla if using.',
        'Blend until completely smooth — about 30 seconds.',
        'Pour into a glass and drink immediately.'
      ],
      minSteps: ['Banana, spinach, milk, honey into blender.', 'Blend 30 seconds until smooth.', 'Pour and drink.'],
      rescueSteps: ['Everything into blender', 'Blend 30 seconds', 'Pour and drink now']
    },
    {
      id: 'coconut-chia-mango-pudding',
      name: 'Coconut Chia Pudding with Mango',
      emoji: '🥥',
      time: 5, prepTime: 5, cookTime: 0, serves: 1,
      tag: 'Prep ahead',
      mealType: 'breakfast',
      labels: ['vegan', 'halal'],
      description: 'Coconut milk makes this creamier and more indulgent than regular chia pudding. Set it the night before — takes two minutes.',
      lowCarb: false, grainFree: true, cleanEating: true, containsSugar: false, naturallySweet: true,
      cleanupScore: 'green',
      category: 'breakfast',
      ingredientIds: ['chia-seeds', 'honey'],
      ingredients: [
        '3 tbsp chia seeds',
        '1 cup coconut milk (from a can or carton)',
        '1 tbsp honey',
        '½ mango (diced)',
        'Optional: pinch of shredded coconut to top'
      ],
      steps: [
        'The night before: put 3 tbsp chia seeds into a jar.',
        'Pour 1 cup coconut milk over the seeds.',
        'Add 1 tbsp honey and stir thoroughly — make sure no seeds are clumped.',
        'Refrigerate overnight.',
        'In the morning: stir again. It should be thick and pudding-like.',
        'Dice ½ mango and spoon over the top.',
        'Add a pinch of shredded coconut if you like. Eat from the jar.'
      ],
      minSteps: ['Chia seeds + coconut milk + honey in a jar. Stir well.', 'Refrigerate overnight.', 'Top with mango and eat.'],
      rescueSteps: ['Chia seeds in jar', 'Add coconut milk, honey', 'Stir, refrigerate overnight', 'Top with mango']
    }
  ];

  // ── 5 MEDIUM energy breakfast ────────────────────────────────

  const breakfastMedium = [
    {
      id: 'smashed-avocado-poached-eggs',
      name: 'Smashed Avocado with Poached Eggs',
      emoji: '🥑',
      time: 15, prepTime: 5, cookTime: 10, serves: 1,
      tag: 'Weekend favourite',
      mealType: 'breakfast',
      labels: ['vegetarian', 'halal'],
      description: 'Café-style at home. Poaching eggs takes a little practice but the result is very much worth it.',
      lowCarb: false, grainFree: false, cleanEating: true, containsSugar: false, naturallySweet: false,
      cleanupScore: 'yellow',
      category: 'eggs',
      ingredientIds: ['avocado', 'eggs', 'bread', 'lemon'],
      ingredients: [
        '1 ripe avocado',
        '2 eggs',
        '2 thick slices bread',
        'Juice of ¼ lemon',
        'Salt, pepper, chilli flakes',
        '1 tsp white vinegar (helps the eggs hold together)'
      ],
      steps: [
        'Toast 2 slices of bread.',
        'Halve the avocado, remove the pit, and scoop flesh into a bowl.',
        'Add the lemon juice, salt, pepper, and chilli flakes. Smash with a fork — leave it chunky.',
        'Fill a wide pan with water to about 6cm depth. Bring to a gentle simmer over medium heat.',
        'Add 1 tsp white vinegar to the water.',
        'Crack each egg into a small cup. Stir the water in a gentle swirl, then slide each egg in carefully.',
        'Poach 3–4 minutes until whites are just set. Lift out with a slotted spoon.',
        'Spread smashed avocado on toast. Add poached eggs on top. Season and eat immediately.'
      ],
      minSteps: ['Smash avocado with lemon, salt, chilli.', 'Poach eggs in simmering water + vinegar for 3–4 min.', 'Pile avocado on toast, top with eggs.'],
      rescueSteps: ['Toast the bread', 'Smash avocado with lemon', 'Simmer water, add vinegar', 'Poach eggs 3–4 minutes', 'Top toast with everything']
    },
    {
      id: 'berry-smoothie-bowl',
      name: 'Berry Smoothie Bowl',
      emoji: '🫐',
      time: 10, prepTime: 10, cookTime: 0, serves: 1,
      tag: 'No cooking',
      mealType: 'breakfast',
      labels: ['vegetarian', 'halal'],
      description: 'Thick blended berries eaten with a spoon and topped with granola. Feels indulgent but takes 10 minutes.',
      lowCarb: false, grainFree: false, cleanEating: true, containsSugar: false, naturallySweet: true,
      cleanupScore: 'yellow',
      category: 'breakfast',
      ingredientIds: ['milk', 'honey', 'oats', 'banana'],
      ingredients: [
        '1 cup frozen mixed berries',
        '½ banana',
        '¼ cup milk or plant milk',
        '1 tbsp honey',
        '2–3 tbsp granola or toasted oats',
        'Optional: fresh berries, nuts, or seeds to top'
      ],
      steps: [
        'Put 1 cup frozen berries, ½ banana, ¼ cup milk, and 1 tbsp honey in a blender.',
        'Blend until smooth and very thick — it should be scoopable, not drinkable.',
        'If too thick: add a tiny splash more milk. If too thin: add more frozen berries.',
        'Pour into a bowl.',
        'Scatter 2–3 tbsp granola and any extra toppings over the surface.',
        'Eat immediately with a spoon before the granola goes soft.'
      ],
      minSteps: ['Blend frozen berries, banana, milk, honey until very thick.', 'Pour into a bowl.', 'Top with granola and honey, eat immediately.'],
      rescueSteps: ['Frozen berries in blender', 'Add banana, milk, honey', 'Blend until thick', 'Bowl, top with granola']
    },
    {
      id: 'turkish-eggs-cilbir',
      name: 'Turkish Eggs with Yogurt',
      emoji: '🍳',
      time: 15, prepTime: 5, cookTime: 10, serves: 1,
      tag: 'Restaurant at home',
      mealType: 'breakfast',
      labels: ['vegetarian', 'halal'],
      description: 'Poached eggs on warm garlicky yogurt with a red paprika butter drizzle. Looks impressive, tastes like a restaurant.',
      lowCarb: true, grainFree: true, cleanEating: true, containsSugar: false, naturallySweet: false,
      cleanupScore: 'yellow',
      category: 'eggs',
      ingredientIds: ['eggs', 'yogurt', 'butter', 'paprika', 'garlic'],
      ingredients: [
        '2 eggs',
        '½ cup Greek yogurt',
        '1 clove garlic (minced or grated)',
        '1 tbsp butter',
        '½ tsp paprika',
        'Salt, 1 tsp white vinegar for poaching',
        'Optional: fresh dill, flatbread to dip'
      ],
      steps: [
        'Mix ½ cup Greek yogurt with 1 minced garlic clove and a pinch of salt.',
        'Spread the garlic yogurt across a shallow bowl or plate. Set aside.',
        'Fill a small pan with water. Bring to a gentle simmer. Add 1 tsp vinegar.',
        'Crack each egg into a small cup. Gently lower each one into the simmering water.',
        'Poach 3–4 minutes until whites are just set — yolks should still wobble.',
        'Meanwhile: melt 1 tbsp butter in a tiny pan over medium heat. Add ½ tsp paprika. Swirl for 30 seconds until it smells nutty.',
        'Carefully place poached eggs on the yogurt. Drizzle the red paprika butter over everything. Eat immediately.'
      ],
      minSteps: ['Mix yogurt with garlic and salt. Spread in bowl.', 'Poach eggs 3–4 min in water with vinegar.', 'Fry paprika in butter, drizzle over eggs on yogurt.'],
      rescueSteps: ['Mix yogurt with garlic', 'Poach eggs 3 minutes', 'Melt butter, add paprika', 'Drizzle butter over eggs']
    },
    {
      id: 'pb-banana-pancakes',
      name: 'Peanut Butter & Banana Pancakes',
      emoji: '🥞',
      time: 20, prepTime: 5, cookTime: 15, serves: 2,
      tag: '3 ingredients',
      mealType: 'breakfast',
      labels: ['vegetarian', 'halal'],
      description: 'Just banana, egg, and peanut butter — no flour, no sugar. Naturally sweet and actually filling.',
      lowCarb: true, grainFree: true, cleanEating: true, containsSugar: false, naturallySweet: true,
      cleanupScore: 'yellow',
      category: 'breakfast',
      ingredientIds: ['banana', 'eggs', 'peanut-butter', 'honey', 'butter'],
      ingredients: [
        '1 very ripe banana',
        '2 eggs',
        '2 tbsp peanut butter',
        'Pinch of cinnamon',
        'Butter or oil for frying',
        'Honey and sliced banana to serve'
      ],
      steps: [
        'Mash 1 ripe banana thoroughly in a bowl with a fork — no lumps left.',
        'Beat 2 eggs and add to the mashed banana.',
        'Add 2 tbsp peanut butter and a pinch of cinnamon. Mix until combined.',
        'Heat a drizzle of oil or a knob of butter in a non-stick pan over medium-low heat.',
        'Spoon 2–3 tablespoons of batter per pancake into the pan.',
        'Cook 2–3 minutes until small bubbles appear and the edges look set.',
        'Flip carefully — they\'re delicate. Cook 1–2 more minutes.',
        'Serve with a drizzle of honey and extra banana slices.'
      ],
      minSteps: ['Mash banana. Mix with eggs and peanut butter.', 'Spoon into buttered pan, cook 2 min per side.', 'Serve with honey.'],
      rescueSteps: ['Mash banana well', 'Add eggs, peanut butter', 'Spoon into hot pan', 'Cook 2 min each side', 'Serve with honey']
    },
    {
      id: 'sweet-potato-egg-hash',
      name: 'Sweet Potato & Egg Hash',
      emoji: '🍠',
      time: 25, prepTime: 8, cookTime: 17, serves: 2,
      tag: 'One-pan',
      mealType: 'breakfast',
      labels: ['vegetarian', 'halal'],
      description: 'Crispy sweet potato cubes with eggs cracked right into the pan. One pan from start to finish.',
      lowCarb: false, grainFree: true, cleanEating: true, containsSugar: false, naturallySweet: false,
      cleanupScore: 'yellow',
      category: 'eggs',
      ingredientIds: ['sweet-potato', 'eggs', 'oil', 'paprika', 'garlic-powder', 'onion'],
      ingredients: [
        '1 large sweet potato (peeled, diced into 1cm cubes)',
        '½ onion (diced)',
        '3–4 eggs',
        '2 tbsp oil',
        '1 tsp paprika',
        '½ tsp garlic powder',
        'Salt & pepper'
      ],
      steps: [
        'Peel and dice 1 large sweet potato into small 1cm cubes.',
        'Heat 2 tbsp oil in a large pan over medium-high heat.',
        'Add the sweet potato in a single layer. Leave alone for 4 minutes — don\'t stir.',
        'Add the diced onion. Stir and cook another 5 minutes until potato is tender and starting to crisp.',
        'Season with 1 tsp paprika, ½ tsp garlic powder, salt, and pepper. Stir to coat.',
        'Make 3–4 small wells in the mixture.',
        'Crack one egg into each well. Cover the pan and cook 4–5 minutes until egg whites are set but yolks are still runny.'
      ],
      minSteps: ['Fry diced sweet potato in oil for 10 min until golden.', 'Add onion and seasoning.', 'Make wells, crack eggs, cover and cook 4 min.'],
      rescueSteps: ['Dice sweet potato small', 'Fry in oil, no stirring', 'Add onion, add seasoning', 'Make wells, add eggs', 'Cover, cook 4 minutes']
    }
  ];

  // ── 5 HIGH energy breakfast ──────────────────────────────────

  const breakfastHigh = [
    {
      id: 'beef-sausage-omelette',
      name: 'Halal Beef Sausage Omelette',
      emoji: '🍳',
      time: 20, prepTime: 5, cookTime: 15, serves: 1,
      tag: 'High protein',
      mealType: 'breakfast',
      labels: ['halal'],
      description: 'Fluffy omelette stuffed with sliced halal sausage and melted cheese. A genuinely satisfying breakfast.',
      lowCarb: true, grainFree: true, cleanEating: false, containsSugar: false, naturallySweet: false,
      cleanupScore: 'yellow',
      category: 'eggs',
      ingredientIds: ['eggs', 'halal-sausages', 'cheese', 'butter', 'oil'],
      ingredients: [
        '3 eggs',
        '2 halal sausages',
        '2 tbsp shredded cheese',
        '1 tbsp butter',
        'Salt, pepper, pinch of paprika'
      ],
      steps: [
        'Heat a drizzle of oil in a pan over medium heat.',
        'Cook 2 halal sausages for 8–10 minutes, turning occasionally, until browned all over and cooked through.',
        'Remove sausages and slice into rounds. Set aside.',
        'Beat 3 eggs with salt, pepper, and a pinch of paprika.',
        'In the same pan, melt 1 tbsp butter over medium-low heat.',
        'Pour in the beaten eggs. Let them set around the edges — about 1 minute — without stirring.',
        'Scatter the sausage slices and cheese over one half. Fold the omelette over the filling.',
        'Cook 30 more seconds then slide onto a plate.'
      ],
      minSteps: ['Cook and slice halal sausages. Set aside.', 'Beat eggs, pour into buttered pan, let set.', 'Add sausage and cheese to one half, fold over.'],
      rescueSteps: ['Cook sausages, slice them', 'Beat eggs with seasoning', 'Pour into buttered pan', 'Add filling, fold over', 'Slide onto plate']
    },
    {
      id: 'halal-chicken-shakshuka',
      name: 'Halal Chicken Shakshuka',
      emoji: '🍅',
      time: 25, prepTime: 8, cookTime: 17, serves: 2,
      tag: 'High protein',
      mealType: 'breakfast',
      labels: ['halal'],
      description: 'Spiced tomato sauce with chunks of halal chicken and poached eggs. A one-pan breakfast that feels like a real meal.',
      lowCarb: true, grainFree: true, cleanEating: true, containsSugar: false, naturallySweet: false,
      cleanupScore: 'yellow',
      category: 'eggs',
      ingredientIds: ['chicken-breast', 'canned-tomatoes', 'eggs', 'onion', 'garlic', 'paprika', 'cumin', 'oil'],
      ingredients: [
        '1 halal chicken breast (diced into 2cm pieces)',
        '1 can crushed tomatoes (400g)',
        '3 eggs',
        '1 small onion (diced)',
        '2 cloves garlic (minced)',
        '1 tsp paprika',
        '½ tsp cumin',
        'Olive oil, salt, pepper'
      ],
      steps: [
        'Heat 2 tbsp olive oil in a wide pan over medium-high heat.',
        'Season the diced chicken with salt and ½ tsp paprika.',
        'Cook chicken 4–5 minutes until golden and just cooked through. Remove and set aside.',
        'In the same pan, add the onion. Cook 4 minutes until softened.',
        'Add 2 cloves minced garlic, remaining ½ tsp paprika, and ½ tsp cumin. Stir for 1 minute.',
        'Pour in the can of crushed tomatoes. Season with salt. Stir the chicken back in.',
        'Simmer 5 minutes.',
        'Make 3 small wells in the sauce. Crack one egg into each.',
        'Cover the pan. Cook 5–7 minutes until egg whites are set. Serve from the pan.'
      ],
      minSteps: ['Cook diced chicken, set aside.', 'Fry onion + garlic + spices. Add tomatoes + chicken, simmer 5 min.', 'Crack eggs into wells, cover and cook 6 min.'],
      rescueSteps: ['Cook diced chicken', 'Fry onion, garlic, spices', 'Add tomatoes and chicken', 'Make wells, add eggs', 'Cover, cook 6 minutes']
    },
    {
      id: 'beef-bacon-egg-muffin',
      name: 'Halal Beef Bacon & Egg Muffin',
      emoji: '🥚',
      time: 15, prepTime: 3, cookTime: 12, serves: 1,
      tag: 'Weekend treat',
      mealType: 'breakfast',
      labels: ['halal'],
      description: 'Crispy halal beef bacon, a fried egg, and melted cheese in a toasted muffin. Saturday morning sorted.',
      lowCarb: false, grainFree: false, cleanEating: false, containsSugar: false, naturallySweet: false,
      cleanupScore: 'yellow',
      category: 'eggs',
      ingredientIds: ['eggs', 'cheese', 'oil'],
      ingredients: [
        '1 English muffin (halved and toasted)',
        '2–3 slices halal beef bacon or beef rashers',
        '1 egg',
        '1 slice cheese',
        'Salt & pepper',
        'Optional: ketchup or hot sauce'
      ],
      steps: [
        'Heat a drizzle of oil in a pan over medium-high heat.',
        'Add 2–3 halal beef bacon rashers. Cook 2–3 minutes per side until crispy.',
        'Remove bacon and set aside.',
        'In the same pan over medium heat, crack in 1 egg.',
        'Fry to your liking — about 2–3 minutes for a set white with a runny yolk.',
        'Toast the English muffin until golden.',
        'Layer the cheese, then bacon, then egg on the bottom muffin half.',
        'Add sauce if using. Top with the other half and eat immediately.'
      ],
      minSteps: ['Fry halal bacon until crispy. Set aside.', 'Fry egg in same pan. Toast muffin.', 'Stack cheese, bacon, egg in toasted muffin.'],
      rescueSteps: ['Fry bacon until crispy', 'Fry egg in same pan', 'Toast the muffin', 'Stack bacon, egg, cheese', 'Close and eat now']
    },
    {
      id: 'spiced-lamb-hash',
      name: 'Spiced Halal Lamb Hash',
      emoji: '🥩',
      time: 30, prepTime: 8, cookTime: 22, serves: 2,
      tag: 'High protein',
      mealType: 'breakfast',
      labels: ['halal'],
      description: 'Ground halal lamb with diced potato and bold spices, all crisped up in one pan. A breakfast that keeps you going all day.',
      lowCarb: false, grainFree: true, cleanEating: true, containsSugar: false, naturallySweet: false,
      cleanupScore: 'yellow',
      category: 'lamb-beef',
      ingredientIds: ['ground-beef', 'potato', 'onion', 'garlic', 'oil', 'paprika', 'cumin', 'eggs'],
      ingredients: [
        '300g halal lamb or beef mince',
        '1 large potato (diced into 1cm cubes)',
        '1 small onion (diced)',
        '2 cloves garlic (minced)',
        '1 tsp paprika',
        '½ tsp cumin',
        '2 tbsp oil',
        'Salt & pepper',
        '2 eggs (optional — to crack on top)'
      ],
      steps: [
        'Heat 2 tbsp oil in a large pan over medium-high heat.',
        'Add the diced potato in a single layer. Cook 8 minutes without stirring until golden underneath.',
        'Stir the potato, then push to one side of the pan.',
        'Add the diced onion to the empty side. Cook 3 minutes until softened.',
        'Add 300g mince. Break apart with a spoon and cook 5–6 minutes until browned.',
        'Add 2 cloves minced garlic, 1 tsp paprika, ½ tsp cumin, salt, and pepper.',
        'Stir everything together and cook 2 more minutes until crispy.',
        'Optional: make 2 wells and crack an egg into each. Cook 3–4 minutes until set.'
      ],
      minSteps: ['Fry diced potato 8 min until golden.', 'Add mince, onion, garlic, spices — cook through.', 'Crack eggs on top in wells if you like.'],
      rescueSteps: ['Fry potato 8 minutes', 'Add mince, break apart', 'Add onion, garlic, spices', 'Stir and crisp everything', 'Add eggs on top']
    },
    {
      id: 'halal-mortadella-omelette',
      name: 'Halal Mortadella Omelette',
      emoji: '🍳',
      time: 15, prepTime: 5, cookTime: 10, serves: 1,
      tag: 'High protein',
      mealType: 'breakfast',
      labels: ['halal'],
      description: 'A fluffy omelette filled with sliced halal mortadella and melted cheese. Feels fancy with very little effort.',
      lowCarb: true, grainFree: true, cleanEating: false, containsSugar: false, naturallySweet: false,
      cleanupScore: 'green',
      category: 'eggs',
      ingredientIds: ['eggs', 'cheese', 'butter'],
      ingredients: [
        '3 eggs',
        '3–4 slices halal mortadella (torn into strips)',
        '2 tbsp shredded cheese',
        '1 tbsp butter',
        'Salt & pepper',
        'Optional: handful of spinach'
      ],
      steps: [
        'Beat 3 eggs in a bowl with salt and pepper.',
        'Melt 1 tbsp butter in a non-stick pan over medium-low heat.',
        'Pour in the eggs. Tilt the pan to spread them evenly.',
        'Let the edges set — about 1 minute. The centre should still be slightly wet.',
        'Scatter the mortadella strips, cheese, and spinach (if using) across one half.',
        'Fold the empty half over the filling.',
        'Cook 30 more seconds. Slide gently onto a plate and eat immediately.'
      ],
      minSteps: ['Beat eggs. Pour into buttered pan. Let edges set.', 'Add mortadella and cheese to one half.', 'Fold over, slide onto plate.'],
      rescueSteps: ['Beat eggs with seasoning', 'Pour into buttered pan', 'Add mortadella and cheese', 'Fold omelette over', 'Slide onto plate']
    }
  ];

  MEALS.low.push(...breakfastLow);
  MEALS.medium.push(...breakfastMedium);
  MEALS.high.push(...breakfastHigh);

})();
