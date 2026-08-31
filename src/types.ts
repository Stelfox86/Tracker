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

// ==========================================
// GYM PHYSIQUE PROGRESS TRACKER INTERFACES
// ==========================================

export interface PhysiqueVisualMetrics {
  definitionScore: number; // 1 - 100
  fullnessScore: number; // 1 - 100
  symmetryScore: number; // 1 - 100
  vascularityScore: number; // 1 - 100
  deltaScore: number; // Positive = progress, 0 = baseline
}

export interface PhysiqueMuscleGroups {
  chestShoulders: string;
  arms: string;
  coreAbs: string;
  backVascularity: string;
  legsQuads: string;
}

export interface PhysiqueProtocolAdvice {
  nutritionCoaching: string;
  trainingCoaching: string;
  sleepShiftRecovery: string;
  actionItems: string[];
}

export interface PhysiqueAnalysisResult {
  status: 'gained_muscle' | 'lost_fat_leaner' | 'recomposition' | 'maintenance' | 'initial_baseline';
  statusLabel: string;
  confidenceScore: number; // 1-100
  estimatedBodyFat: string; // e.g. "13.5%"
  estimatedBodyFatDelta: string; // e.g. "-1.2% leaner" or "Baseline"
  estimatedLeanMassChange: string; // e.g. "+0.8 kg estimated lean tissue"
  visualMetrics: PhysiqueVisualMetrics;
  muscleGroups: PhysiqueMuscleGroups;
  comparisonSummary: string;
  protocolAdvice: PhysiqueProtocolAdvice;
}

export interface PhysiqueCheckIn {
  id: string;
  timestamp: string; // ISO date
  dateFormatted: string; // e.g. "2026-08-31"
  weekNumber: number;
  weightKg?: number;
  pose: 'front_relaxed' | 'front_flexed' | 'side_profile' | 'back_double_biceps' | 'side_chest' | 'other';
  poseLabel: string;
  imageUrl: string; // base64 or URL
  notes?: string;
  analysisResult?: PhysiqueAnalysisResult;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalDaysLogged: number;
  totalMealsLogged: number;
  shiftCyclesCompleted: number;
  lastLoggedDate: string;
  historyDates: string[];
}

// Sample presets for physique comparison demos
export interface SamplePhysiquePreset {
  id: string;
  title: string;
  subtitle: string;
  weekLabel: string;
  weightKg: number;
  pose: 'front_relaxed' | 'front_flexed' | 'side_profile' | 'back_double_biceps';
  imageUrl: string;
  notes: string;
  expectedAnalysis: PhysiqueAnalysisResult;
}

export const SAMPLE_PHYSIQUE_PRESETS: SamplePhysiquePreset[] = [
  {
    id: 'physique-week-1',
    title: 'Baseline (Week 1 - Shift Start)',
    subtitle: 'Initial 3,400 kcal & 04:00 early lift kickoff',
    weekLabel: 'Week 1',
    weightKg: 82.5,
    pose: 'front_relaxed',
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
    notes: 'Starting baseline before entering 4-day early shift rotation. 04:00 AM lifting routine beginning.',
    expectedAnalysis: {
      status: 'initial_baseline',
      statusLabel: 'Baseline Calibration Established',
      confidenceScore: 94,
      estimatedBodyFat: '15.2%',
      estimatedBodyFatDelta: 'Baseline Reference',
      estimatedLeanMassChange: 'Baseline Reference Point',
      visualMetrics: {
        definitionScore: 68,
        fullnessScore: 72,
        symmetryScore: 82,
        vascularityScore: 60,
        deltaScore: 0,
      },
      muscleGroups: {
        chestShoulders: 'Solid clavicular foundation with moderate upper chest thickness; anterior delt caps developing.',
        arms: 'Balanced bicep/tricep ratio; good peak symmetry with moderate forearm vascularity.',
        coreAbs: 'Visible upper abdominal wall under relaxed lighting; slight lower abdominal softness typical of high-calorie bulk.',
        backVascularity: 'Wide lat sweep originating at mid-thoracic spine; clean rhomboid definition.',
        legsQuads: 'Substantial quad teardrop (vastus medialis) density from squat volume.',
      },
      comparisonSummary: 'Starting reference point established for the 4-Day Shift & Early Lift Protocol. Musculature exhibits solid baseline fullness with moderate subcutaneous water retention. Current 3,400 kcal intake will fuel intense early-morning training sessions.',
      protocolAdvice: {
        nutritionCoaching: 'Ensure the 03:35 Pre-Gym meal (190 kcal banana & peanut butter) is consumed 25-30 minutes prior to warm-ups for immediate glycogen availability.',
        trainingCoaching: 'Focus on compound progressive overload (squats, bench, deadlifts, overhead press) in the 6-10 rep range during early shifts.',
        sleepShiftRecovery: 'Prioritize in-bed sleep by 21:45 directly after the 21:30 Quark/Casein recovery meal to hit 5.5-6.5h restorative sleep before 03:00 wake-up.',
        actionItems: [
          'Log every meal across all 7 protocol slots to hit 230g protein consistently',
          'Weigh in 2x weekly under identical morning fasted conditions',
          'Take repeat physique photos in identical lighting and posture every 2-4 weeks',
        ],
      },
    },
  },
  {
    id: 'physique-week-4',
    title: 'Mid-Cycle Check-In (Week 4)',
    subtitle: 'Lean mass accrual with improved shoulder striations',
    weekLabel: 'Week 4',
    weightKg: 83.2,
    pose: 'front_flexed',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
    notes: 'Consistent adherence to 3,400 kcal & 230g protein over 4 full shift cycles. Strength up on all lifts.',
    expectedAnalysis: {
      status: 'gained_muscle',
      statusLabel: 'Lean Hypertrophy & Enhanced Deltoid Fullness',
      confidenceScore: 96,
      estimatedBodyFat: '14.4%',
      estimatedBodyFatDelta: '-0.8% estimated reduction',
      estimatedLeanMassChange: '+0.7 kg lean muscular tissue',
      visualMetrics: {
        definitionScore: 78,
        fullnessScore: 86,
        symmetryScore: 88,
        vascularityScore: 74,
        deltaScore: 14,
      },
      muscleGroups: {
        chestShoulders: 'Pronounced lateral deltoid roundness ("cannonball" cap) and deeper sternal chest striations.',
        arms: 'Tricep lateral head exhibits clearer separation; increased bicep brachialis thickness.',
        coreAbs: 'Sharper linea alba demarcation and tightened serratus anterior ribs.',
        backVascularity: 'Deeper spinal erector groove and enhanced superficial forearm cephalic vein visibility.',
        legsQuads: 'Increased outer quad sweep flare with firmer rectus femoris definition.',
      },
      comparisonSummary: 'Distinct positive progression observed compared to Week 1 baseline. Body composition shows classic lean recomposition/surplus adaptation: muscle belly glycogen fullness is visibly enhanced without adverse visceral fat gain, confirming the 3,400 kcal surplus is being utilized for muscular hypertrophy rather than adipose storage.',
      protocolAdvice: {
        nutritionCoaching: 'The 05:15 Post-Gym exit fuel (Whey + 2 Tortillas & Honey) is working exceptionally well for rapid intra-shift glycogen replenishment. Continue maintaining 376g daily carbs.',
        trainingCoaching: 'Increase volume on lagging upper chest and lateral delts using drop-sets or myo-reps on shift days 1 and 3.',
        sleepShiftRecovery: 'Maintain high intra-shift hydration (minimum 3.5L water + electrolytes) to support elevated nitrogen retention and cellular cell volumization.',
        actionItems: [
          'Continue sticking to 230g daily protein baseline across 7 slots',
          'Add 1 extra set of lateral raises to early morning push sessions',
          'Monitor morning waist measurement to verify lean surplus trajectory',
        ],
      },
    },
  },
  {
    id: 'physique-week-8',
    title: 'Peak Conditioning (Week 8)',
    subtitle: 'Vascular definition, dense V-taper & deep abdominal separation',
    weekLabel: 'Week 8',
    weightKg: 83.8,
    pose: 'front_flexed',
    imageUrl: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=600&q=80',
    notes: '8 weeks consistent 4-day shift protocol. High energy, zero afternoon shift crashes.',
    expectedAnalysis: {
      status: 'recomposition',
      statusLabel: 'Peak Athletic Density & Vascular Definition',
      confidenceScore: 98,
      estimatedBodyFat: '13.1%',
      estimatedBodyFatDelta: '-2.1% total reduction',
      estimatedLeanMassChange: '+1.3 kg total lean tissue gain',
      visualMetrics: {
        definitionScore: 89,
        fullnessScore: 92,
        symmetryScore: 94,
        vascularityScore: 88,
        deltaScore: 24,
      },
      muscleGroups: {
        chestShoulders: 'Upper chest shelf fully filled in; full 3D deltoid separation with visible tie-in striations.',
        arms: 'Peak bicep height and distinct horse-shoe tricep definition with prominent forearm vascular networks.',
        coreAbs: 'Complete 6-pack abdominal grid visible with tight inguinal hip taper and pronounced obliques.',
        backVascularity: 'V-taper ratio significantly widened; upper traps and mid-back rhomboids show dense muscular knotting.',
        legsQuads: 'Deep intermuscular separation between vastus lateralis and rectus femoris.',
      },
      comparisonSummary: 'Outstanding 8-week transformation. The combination of early 04:00 AM lifting and strict nutrient timing (3,400 kcal, 230g protein split across 7 structured meals + intra-shift snacks) has resulted in substantial lean tissue accrual coupled with progressive adipose reduction.',
      protocolAdvice: {
        nutritionCoaching: 'You have attained an optimal metabolic rate. If bodyweight plateaus for more than 14 days, consider bumping daily carbs by +25g (e.g. adding 1 extra snack preset like Rice Cakes with Peanut Butter).',
        trainingCoaching: 'Deload for 3-4 days at the start of next month to let connective tissues and CNS recover from heavy early morning sessions.',
        sleepShiftRecovery: 'Maintain magnesium and slow casein intake before bed (Slot 7 at 21:30) to maximize deep slow-wave sleep phases.',
        actionItems: [
          'Celebrate 8-week milestone! You have maintained an elite shift-worker physique',
          'Schedule a 4-day active recovery phase before next training block',
          'Export your nutrition logs and progress photos for long-term records',
        ],
      },
    },
  },
];
