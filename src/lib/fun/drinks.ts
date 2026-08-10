export type DrinkCategory =
  | "spirit_mixer"
  | "beer_wine"
  | "no_alcohol"
  | "sweet";

export type DrinkRecipe = {
  id: string;
  name: string;
  tagline: string;
  category: DrinkCategory;
  minutes: number;
  servings: string;
  ingredients: string[];
  steps: string[];
  tips: string[];
};

export const DRINK_CATEGORIES: Array<{
  id: DrinkCategory | "all";
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "spirit_mixer", label: "Spirit + mixer" },
  { id: "beer_wine", label: "Beer & wine" },
  { id: "sweet", label: "Sweet & easy" },
  { id: "no_alcohol", label: "Zero proof" },
];

/** Bachelor-friendly pours — cup, spoon, fridge only. No shaker, blender, or bar tools. */
export const BACHELOR_DRINKS: DrinkRecipe[] = [
  {
    id: "vodka-soda-lime",
    name: "Vodka Soda + Lime",
    tagline: "Clean, cold, and ready in under a minute.",
    category: "spirit_mixer",
    minutes: 1,
    servings: "1 glass",
    ingredients: [
      "2 oz (60 ml) vodka",
      "4–6 oz chilled soda water",
      "1 lime wedge (or a squeeze of bottled lime)",
      "Ice cubes",
    ],
    steps: [
      "Fill a glass with ice.",
      "Pour in the vodka.",
      "Top with soda water.",
      "Squeeze the lime over the top and drop it in. Swirl once with a spoon or the lime wedge.",
    ],
    tips: [
      "Colder soda = less dilution taste.",
      "No lime? A splash of lemon-lime soda still works.",
    ],
  },
  {
    id: "rum-and-coke",
    name: "Rum & Coke",
    tagline: "The classic dorm pour. Ratio is the whole recipe.",
    category: "spirit_mixer",
    minutes: 1,
    servings: "1 glass",
    ingredients: [
      "2 oz (60 ml) rum (dark or gold)",
      "4–5 oz cold cola",
      "Ice",
      "Optional: lime wedge",
    ],
    steps: [
      "Add ice to a tall glass.",
      "Pour rum first.",
      "Top with cola and give one gentle stir.",
      "Add lime if you have it.",
    ],
    tips: [
      "Start 1:2 rum to cola; adjust sweeter or stronger to taste.",
      "Cherry cola or ginger ale are solid swaps.",
    ],
  },
  {
    id: "whiskey-ginger",
    name: "Whiskey Ginger",
    tagline: "Spicy-sweet highball with zero technique.",
    category: "spirit_mixer",
    minutes: 1,
    servings: "1 glass",
    ingredients: [
      "2 oz whiskey or bourbon",
      "4 oz ginger ale (or ginger beer for more kick)",
      "Ice",
      "Optional: lemon wedge",
    ],
    steps: [
      "Fill a glass with ice.",
      "Pour whiskey.",
      "Top with ginger ale.",
      "Squeeze lemon over the top if using, then stir once.",
    ],
    tips: [
      "Ginger beer makes it closer to a Moscow Mule vibe — still no copper mug needed.",
    ],
  },
  {
    id: "gin-tonic",
    name: "Gin & Tonic",
    tagline: "Bubbly and bitter-bright. Build it in the glass.",
    category: "spirit_mixer",
    minutes: 1,
    servings: "1 glass",
    ingredients: [
      "2 oz gin",
      "4 oz tonic water",
      "Ice",
      "Lime or lemon wedge",
    ],
    steps: [
      "Pack a glass with ice.",
      "Add gin, then tonic.",
      "Squeeze citrus over the drink and drop the wedge in.",
      "Stir once — don’t kill the bubbles.",
    ],
    tips: [
      "Cheap gin still works; cold tonic matters more.",
      "No tonic? Club soda + a splash of grapefruit juice is a fine stand-in.",
    ],
  },
  {
    id: "tequila-soda",
    name: "Ranch Water (cup version)",
    tagline: "Tequila, lime, soda — Texas-simple.",
    category: "spirit_mixer",
    minutes: 2,
    servings: "1 glass",
    ingredients: [
      "2 oz blanco tequila",
      "Juice of ½ lime (or 1 tbsp bottled)",
      "Top with sparkling water / Topo Chico if you’ve got it",
      "Ice",
      "Pinch of salt (optional)",
    ],
    steps: [
      "Ice in the glass.",
      "Add tequila and lime juice.",
      "Top with sparkling water.",
      "Tiny pinch of salt on top if you want that salty-sour edge. Stir once.",
    ],
    tips: [
      "Too sharp? Add a splash of orange juice.",
    ],
  },
  {
    id: "screwdriver",
    name: "Screwdriver",
    tagline: "Breakfast-approved. Juice does the work.",
    category: "spirit_mixer",
    minutes: 1,
    servings: "1 glass",
    ingredients: [
      "2 oz vodka",
      "4–5 oz orange juice",
      "Ice",
    ],
    steps: [
      "Ice, vodka, orange juice — in that order.",
      "Stir with a spoon until it looks even.",
    ],
    tips: [
      "Pulp OJ tastes fresher; no pulp is smoother.",
      "Add a splash of cranberry for a “madras” vibe.",
    ],
  },
  {
    id: "mike-hard-lemonade",
    name: "Hard Lemonade Cup",
    tagline: "Vodka + lemonade when you want sweet and simple.",
    category: "sweet",
    minutes: 1,
    servings: "1 glass",
    ingredients: [
      "2 oz vodka",
      "5 oz lemonade (bottled or powder mix)",
      "Ice",
      "Optional: splash of soda for fizz",
    ],
    steps: [
      "Fill glass with ice.",
      "Add vodka and lemonade.",
      "Add a splash of soda if you want bubbles. Stir.",
    ],
    tips: [
      "Pink lemonade + vodka is the same idea with better vibes.",
    ],
  },
  {
    id: "spiked-arnold",
    name: "Spiked Arnold Palmer",
    tagline: "Half tea, half lemonade, plus a shot.",
    category: "sweet",
    minutes: 2,
    servings: "1 glass",
    ingredients: [
      "2 oz vodka or bourbon",
      "3 oz iced tea (sweet or unsweet)",
      "3 oz lemonade",
      "Ice",
    ],
    steps: [
      "Ice in a tall glass.",
      "Pour spirit, then tea, then lemonade.",
      "Stir until the colors blend.",
    ],
    tips: [
      "Bourbon leans cozy; vodka stays light.",
    ],
  },
  {
    id: "beer-michelada-lite",
    name: "Michelada Lite",
    tagline: "Beer + lime + hot sauce — no shaker, no fancy glassware.",
    category: "beer_wine",
    minutes: 2,
    servings: "1 bottle / can pour",
    ingredients: [
      "1 cold lager or Mexican-style beer",
      "Juice of ½ lime",
      "2–4 dashes hot sauce",
      "Pinch of salt",
      "Ice (optional)",
    ],
    steps: [
      "In a glass, squeeze lime juice, add hot sauce and a pinch of salt.",
      "Pour beer slowly over it.",
      "Give one gentle swirl. Drink cold.",
    ],
    tips: [
      "No hot sauce? Black pepper + more lime still works.",
      "Tajín on the rim is optional flex — lick a plate of salt if that’s all you’ve got.",
    ],
  },
  {
    id: "beer-shandy",
    name: "Shandy",
    tagline: "Beer cut with lemonade for hot nights.",
    category: "beer_wine",
    minutes: 1,
    servings: "1 glass",
    ingredients: [
      "6 oz cold lager or wheat beer",
      "6 oz lemonade or lemon soda",
      "Ice (optional)",
    ],
    steps: [
      "Pour beer into a glass.",
      "Top with lemonade.",
      "Stir once. Done.",
    ],
    tips: [
      "Ginger ale + beer is a “snakebite-adjacent” cousin if lemonade is gone.",
    ],
  },
  {
    id: "wine-spritz-cup",
    name: "Wine Spritz Cup",
    tagline: "Wine + bubbles when Aperol isn’t in the fridge.",
    category: "beer_wine",
    minutes: 1,
    servings: "1 glass",
    ingredients: [
      "4 oz white wine or cheap prosecco",
      "2–3 oz soda water",
      "Ice",
      "Orange or lemon slice if available",
    ],
    steps: [
      "Ice in a wine glass or any tall cup.",
      "Pour wine, top with soda.",
      "Add citrus if you have it. Stir once.",
    ],
    tips: [
      "A splash of orange juice makes it closer to a mimosa-spritz hybrid.",
    ],
  },
  {
    id: "kalimotxo",
    name: "Kalimotxo",
    tagline: "Red wine + cola. Spanish dorm classic.",
    category: "beer_wine",
    minutes: 1,
    servings: "1 glass",
    ingredients: [
      "4 oz red wine (any table wine)",
      "4 oz cola",
      "Ice",
      "Optional: lemon wedge",
    ],
    steps: [
      "Ice in a glass.",
      "Equal parts wine and cola.",
      "Stir. Add lemon if you’ve got it.",
    ],
    tips: [
      "Don’t use expensive wine — this is a fridge-clearing move.",
    ],
  },
  {
    id: "espresso-cup-martini",
    name: "Cup “Espresso Martini”",
    tagline: "No shaker — cold coffee + vodka + sweetener, shaken by swirling.",
    category: "sweet",
    minutes: 3,
    servings: "1 glass",
    ingredients: [
      "2 oz vodka",
      "2 oz cold coffee or leftover espresso (cooled)",
      "1 tsp sugar, simple syrup, or coffee creamer",
      "Ice",
    ],
    steps: [
      "Put ice, vodka, coffee, and sweetener in a jar or sturdy cup with a lid if you have one.",
      "Screw the lid on and shake hard for 10 seconds — or stir vigorously with a spoon for 20 seconds.",
      "Strain into a glass by pouring carefully past the ice (or just drink over ice).",
    ],
    tips: [
      "Instant coffee dissolved in a little cold water works in a pinch.",
      "A splash of chocolate milk is chaotic but good.",
    ],
  },
  {
    id: "white-russian-cup",
    name: "White Russian (cup)",
    tagline: "Coffee liqueur vibes with milk — layered or stirred.",
    category: "sweet",
    minutes: 2,
    servings: "1 glass",
    ingredients: [
      "2 oz vodka",
      "1 oz coffee liqueur (Kahlúa) — or 1 tbsp instant coffee + 1 tsp sugar mixed into 1 oz water",
      "1–2 oz milk or half-and-half",
      "Ice",
    ],
    steps: [
      "Ice + vodka + coffee liqueur (or coffee syrup) in a glass.",
      "Stir.",
      "Float milk on top by pouring slowly over the back of a spoon — or just stir it all together.",
    ],
    tips: [
      "Oat milk works if dairy is gone.",
    ],
  },
  {
    id: "hot-toddy-mug",
    name: "Mug Hot Toddy",
    tagline: "Sick-day classic. Microwave or kettle only.",
    category: "spirit_mixer",
    minutes: 3,
    servings: "1 mug",
    ingredients: [
      "1.5–2 oz whiskey",
      "1 tbsp honey or sugar",
      "Juice of ¼ lemon (or 1 tsp bottled)",
      "6 oz hot water",
    ],
    steps: [
      "Put honey/sugar and lemon in a mug.",
      "Add a splash of hot water and stir until dissolved.",
      "Add whiskey, then fill with hot water. Stir.",
    ],
    tips: [
      "A tea bag steeped in the water makes it more “medicinal” in a good way.",
    ],
  },
  {
    id: "agua-fresca-zero",
    name: "Lime Soda Cooler",
    tagline: "Zero-proof, still feels like a drink.",
    category: "no_alcohol",
    minutes: 2,
    servings: "1 glass",
    ingredients: [
      "Juice of 1 lime (or 2 tbsp bottled)",
      "1 tsp sugar or honey",
      "6 oz cold soda water",
      "Ice",
      "Pinch of salt (optional)",
    ],
    steps: [
      "In the glass, mix lime juice and sugar until mostly dissolved.",
      "Add ice and soda water.",
      "Pinch of salt if you want a salty-lime kick. Stir.",
    ],
    tips: [
      "Swap lime for orange juice + soda for an easy “mocktail spritz.”",
    ],
  },
  {
    id: "virgin-mule",
    name: "Virgin Mule",
    tagline: "Ginger beer + lime. No copper mug required.",
    category: "no_alcohol",
    minutes: 1,
    servings: "1 glass",
    ingredients: [
      "6 oz ginger beer",
      "Juice of ½ lime",
      "Ice",
    ],
    steps: [
      "Ice in glass.",
      "Lime juice in, ginger beer on top.",
      "Stir once.",
    ],
    tips: [
      "Add vodka later if the night upgrades.",
    ],
  },
  {
    id: "chocolate-milk-spike",
    name: "Spiked Chocolate Milk",
    tagline: "Dessert drink energy. Shame optional.",
    category: "sweet",
    minutes: 1,
    servings: "1 glass",
    ingredients: [
      "6 oz chocolate milk",
      "1.5 oz vodka, rum, or whiskey",
      "Ice (optional)",
    ],
    steps: [
      "Pour chocolate milk into a glass.",
      "Add spirit.",
      "Stir well. Ice if you want it colder.",
    ],
    tips: [
      "Baileys or coffee creamer instead of chocolate milk is also valid bachelor math.",
    ],
  },
];

export function getDrinkById(id: string): DrinkRecipe | undefined {
  return BACHELOR_DRINKS.find((drink) => drink.id === id);
}

export function filterDrinks(
  category: DrinkCategory | "all",
  query: string
): DrinkRecipe[] {
  const normalized = query.trim().toLowerCase();
  return BACHELOR_DRINKS.filter((drink) => {
    const categoryOk = category === "all" || drink.category === category;
    if (!categoryOk) return false;
    if (!normalized) return true;
    const haystack = [
      drink.name,
      drink.tagline,
      ...drink.ingredients,
      ...drink.steps,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}
