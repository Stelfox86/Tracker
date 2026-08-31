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
