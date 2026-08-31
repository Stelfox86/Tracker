export interface DailyTargets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export const PROTOCOL_DAILY_TARGETS: DailyTargets = {
  calories: 3400,
  protein_g: 230,
  carbs_g: 376,
  fat_g: 100,
};

export interface MealSlotBaseline {
  id: string;
  slotNumber: number;
  name: string; // e.g. "Pre-Gym Fuel (03:35)"
  time: string; // "03:35"
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  suggestedFoods: string; // e.g. "Banana, Peanut Butter, Water/Electrolytes"
  description: string;
  category: 'pre-workout' | 'post-workout' | 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'bedtime';
}

export const PROTOCOL_MEAL_SLOTS: MealSlotBaseline[] = [
  {
    id: 'slot-1',
    slotNumber: 1,
    name: 'Pre-Gym Fuel (03:35)',
    time: '03:35',
    calories: 190,
    protein_g: 4,
    carbs_g: 31,
    fat_g: 8,
    suggestedFoods: 'Banana, Peanut Butter, Water/Electrolytes',
    description: 'Fast-digesting simple carbs and light healthy fats to jumpstart glycogen before 04:00 lift without GI distress.',
    category: 'pre-workout',
  },
  {
    id: 'slot-2',
    slotNumber: 2,
    name: 'Post-Gym Exit (05:15)',
    time: '05:15',
    calories: 480,
    protein_g: 35,
    carbs_g: 72,
    fat_g: 6,
    suggestedFoods: 'Whey Protein, 2 Tortilla Wraps + Honey',
    description: 'Rapid post-workout protein synthesis & glycogen replenishment immediately following early training.',
    category: 'post-workout',
  },
  {
    id: 'slot-3',
    slotNumber: 3,
    name: 'Work Arrival / Breakfast (07:00)',
    time: '07:00',
    calories: 660,
    protein_g: 42,
    carbs_g: 70,
    fat_g: 24,
    suggestedFoods: '4 Boiled Eggs, 100g Oats, 50g Berries',
    description: 'Substantial complex carbs, whole egg micronutrients, and fiber to power through shift onset.',
    category: 'breakfast',
  },
  {
    id: 'slot-4',
    slotNumber: 4,
    name: 'Work Lunch (12:00)',
    time: '12:00',
    calories: 680,
    protein_g: 50,
    carbs_g: 75,
    fat_g: 18,
    suggestedFoods: '200g Lean Pork Mince/Chicken, 250g Cooked Rice, 100g Greens, Olive Oil',
    description: 'Major midday shift anchor meal rich in lean protein, complex starch, and anti-inflammatory greens.',
    category: 'lunch',
  },
  {
    id: 'slot-5',
    slotNumber: 5,
    name: 'Afternoon Work Fuel (16:00)',
    time: '16:00',
    calories: 450,
    protein_g: 15,
    carbs_g: 58,
    fat_g: 18,
    suggestedFoods: '2 Slices Wholemeal Bread, 30g Peanut Butter, Banana',
    description: 'Sustained energy bridge to prevent shift fatigue, maintain blood glucose, and fight mental slump.',
    category: 'snack',
  },
  {
    id: 'slot-6',
    slotNumber: 6,
    name: 'Post-Work Dinner (20:15)',
    time: '20:15',
    calories: 600,
    protein_g: 46,
    carbs_g: 60,
    fat_g: 12,
    suggestedFoods: '2 Tins Mackerel/Pollock, 350g Roasted Potatoes, Green Veg',
    description: 'Omega-3 fatty acids, potassium-dense roasted potatoes, and lean fish protein for muscular recovery.',
    category: 'dinner',
  },
  {
    id: 'slot-7',
    slotNumber: 7,
    name: 'Pre-Bed Recovery (21:30)',
    time: '21:30',
    calories: 340,
    protein_g: 38,
    carbs_g: 10,
    fat_g: 14,
    suggestedFoods: '250g Quark/Cottage Cheese, 25g Peanuts/PB',
    description: 'Slow-digesting micellar casein & healthy fats for sustained overnight muscle protein synthesis before early 03:00 wake-up.',
    category: 'bedtime',
  },
];

export interface Ingredient {
  id?: string;
  name: string;
  estimated_weight_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface MealTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface SlotVariance {
  calorie_difference: number;
  protein_difference_g: number;
  carbs_difference_g: number;
  fat_difference_g: number;
}

export interface MealAnalysisResult {
  meal_name: string;
  matched_slot: string;
  ingredients: Ingredient[];
  meal_totals: MealTotals;
  slot_variance: SlotVariance;
}

export interface LoggedMealRecord {
  id: string;
  timestamp: string; // ISO string
  shiftDay: number; // 1 | 2 | 3 | 4
  slotId: string; // matching PROTOCOL_MEAL_SLOTS id or custom
  slotName: string;
  mealAnalysis: MealAnalysisResult;
  imageThumbnail?: string;
  notes?: string;
}

export interface SamplePresetMeal {
  id: string;
  title: string;
  slotName: string;
  slotId: string;
  imageUrl: string;
  description: string;
  expectedData: MealAnalysisResult;
}

export interface SnackPreset {
  id: string;
  name: string;
  category: 'shake' | 'bar' | 'food' | 'drink';
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  portion: string;
  description: string;
  iconType: 'shake' | 'milk' | 'bar' | 'fruit' | 'meat' | 'egg' | 'cup' | 'sparkles';
  highlight?: boolean;
}

export const PROTOCOL_SNACK_PRESETS: SnackPreset[] = [
  {
    id: 'snack-whey-double',
    name: 'Double Scoop Whey Isolate Shake',
    category: 'shake',
    calories: 240,
    protein_g: 50,
    carbs_g: 4,
    fat_g: 2,
    portion: '2 scoops (60g) in 400ml water',
    description: 'Ultra-pure fast-absorbing protein synthesis booster, ideal mid-shift or post-training.',
    iconType: 'shake',
    highlight: true,
  },
  {
    id: 'snack-whey-milk',
    name: 'Whey Protein + Semi-Skimmed Milk',
    category: 'shake',
    calories: 255,
    protein_g: 34,
    carbs_g: 15,
    fat_g: 6,
    portion: '1 scoop (30g) + 250ml milk',
    description: 'Creamier shake delivering both fast whey and slow casein proteins.',
    iconType: 'milk',
  },
  {
    id: 'snack-clear-whey',
    name: 'Clear Whey Protein Isolate Drink',
    category: 'drink',
    calories: 90,
    protein_g: 20,
    carbs_g: 1,
    fat_g: 0.2,
    portion: '1 scoop (25g) in 500ml ice water',
    description: 'Refreshing fruity hydration with zero fat and instant amino acid delivery.',
    iconType: 'sparkles',
    highlight: true,
  },
  {
    id: 'snack-casein-bedtime',
    name: 'Micellar Casein Night Shake',
    category: 'shake',
    calories: 220,
    protein_g: 44,
    carbs_g: 3,
    fat_g: 2,
    portion: '1.5 scoops (50g) in water/milk',
    description: 'Slow 7-hour amino release to protect muscle tissue during 03:00 wake-up recovery.',
    iconType: 'shake',
  },
  {
    id: 'snack-protein-bar',
    name: 'High-Protein Bar (e.g. Grenade / Barebells)',
    category: 'bar',
    calories: 215,
    protein_g: 20,
    carbs_g: 18,
    fat_g: 8,
    portion: '1 bar (60g)',
    description: 'Convenient pocket-friendly shift fuel with low active sugar and high satiety.',
    iconType: 'bar',
    highlight: true,
  },
  {
    id: 'snack-greek-yogurt-bowl',
    name: '0% Greek Yogurt + Scoop Whey & Berries',
    category: 'food',
    calories: 285,
    protein_g: 45,
    carbs_g: 20,
    fat_g: 2,
    portion: '200g yogurt + 25g whey + 50g berries',
    description: 'High-density creamy protein bowl packed with antioxidants and probiotics.',
    iconType: 'cup',
  },
  {
    id: 'snack-beef-biltong',
    name: 'Lean Beef Biltong / Jerky',
    category: 'food',
    calories: 140,
    protein_g: 26,
    carbs_g: 2,
    fat_g: 2.5,
    portion: '1 bag (50g)',
    description: 'Pure savory lean protein, iron, and zinc without needing refrigeration.',
    iconType: 'meat',
  },
  {
    id: 'snack-boiled-eggs',
    name: 'Hard-Boiled Eggs (2 Large)',
    category: 'food',
    calories: 148,
    protein_g: 13,
    carbs_g: 1,
    fat_g: 10,
    portion: '2 whole eggs',
    description: 'Choline, complete amino profile, and healthy fats for cognitive shift focus.',
    iconType: 'egg',
  },
  {
    id: 'snack-rice-cakes-pb',
    name: 'Rice Cakes (3x) + Peanut Butter',
    category: 'food',
    calories: 290,
    protein_g: 10,
    carbs_g: 32,
    fat_g: 14,
    portion: '3 cakes + 25g peanut butter',
    description: 'Fast energetic crunch providing glycogen top-ups before physical exertion.',
    iconType: 'fruit',
  },
  {
    id: 'snack-bcaa-eaas',
    name: 'EAA / BCAA + Electrolyte Hydration',
    category: 'drink',
    calories: 30,
    protein_g: 7,
    carbs_g: 1,
    fat_g: 0,
    portion: '1 scoop in 750ml water',
    description: 'Intra-shift electrolyte balance and anti-catabolic leucine trigger.',
    iconType: 'sparkles',
  },
];

export interface ReminderSettings {
  enabled: boolean;
  advanceMinutes: number; // e.g. 30, 15, 45, 0
  soundEnabled: boolean;
  enabledSlots: Record<string, boolean>; // slotId -> boolean
  lastTriggered: Record<string, string>; // slotId -> date string YYYY-MM-DD
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  advanceMinutes: 30,
  soundEnabled: true,
  enabledSlots: {
    'slot-1': true,
    'slot-2': true,
    'slot-3': true,
    'slot-4': true,
    'slot-5': true,
    'slot-6': true,
    'slot-7': true,
  },
  lastTriggered: {},
};
