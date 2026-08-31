import React, { useState } from 'react';
import {
  Coffee,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Clock,
  Camera,
  Info,
  X
} from 'lucide-react';
import {
  SnackPreset,
  PROTOCOL_SNACK_PRESETS,
  LoggedMealRecord,
  MealAnalysisResult
} from '../types';
import confetti from 'canvas-confetti';

interface SnacksSectionProps {
  loggedMeals: LoggedMealRecord[];
  shiftDay: number;
  onLogSnackPreset: (preset: SnackPreset) => void;
  onLogCustomSnack: (custom: {
    name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    notes?: string;
  }) => void;
  onDeleteMeal: (mealId: string) => void;
  onScanSnackWithVision: () => void;
  onViewMealDetails: (meal: LoggedMealRecord) => void;
}

export const SnacksSection: React.FC<SnacksSectionProps> = ({
  loggedMeals,
  shiftDay,
  onLogSnackPreset,
  onLogCustomSnack,
  onDeleteMeal,
  onScanSnackWithVision,
  onViewMealDetails,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'shake' | 'bar' | 'food' | 'drink'>('all');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [justLoggedId, setJustLoggedId] = useState<string | null>(null);

  // Custom Snack Form State
  const [customName, setCustomName] = useState<string>('');
  const [customCalories, setCustomCalories] = useState<string>('220');
  const [customProtein, setCustomProtein] = useState<string>('25');
  const [customCarbs, setCustomCarbs] = useState<string>('15');
  const [customFat, setCustomFat] = useState<string>('5');
  const [customNotes, setCustomNotes] = useState<string>('');

  // Filter logged snacks (slotId starting with 'snack-' or category/slotName containing 'Snack' or 'Shake')
  const loggedSnacks = loggedMeals.filter(
    (m) =>
      m.slotId.startsWith('snack-') ||
      m.slotName.toLowerCase().includes('snack') ||
      m.slotName.toLowerCase().includes('shake') ||
      m.slotName.toLowerCase().includes('drink')
  );

  // Calculate totals from snacks
  const snackTotals = loggedSnacks.reduce(
    (acc, m) => {
      const mt = m.mealAnalysis.meal_totals;
      return {
        calories: acc.calories + (mt.calories || 0),
        protein_g: acc.protein_g + (mt.protein_g || 0),
        carbs_g: acc.carbs_g + (mt.carbs_g || 0),
        fat_g: acc.fat_g + (mt.fat_g || 0),
      };
    },
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  const filteredPresets = PROTOCOL_SNACK_PRESETS.filter((p) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'shake') return p.category === 'shake';
    if (selectedFilter === 'drink') return p.category === 'drink';
    if (selectedFilter === 'bar') return p.category === 'bar';
    if (selectedFilter === 'food') return p.category === 'food';
    return true;
  });

  const handleQuickLog = (preset: SnackPreset) => {
    onLogSnackPreset(preset);
    setJustLoggedId(preset.id);

    confetti({
      particleCount: 40,
      spread: 45,
      origin: { y: 0.7 },
    });

    setTimeout(() => {
      setJustLoggedId(null);
    }, 2000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    onLogCustomSnack({
      name: customName.trim(),
      calories: Math.max(0, parseInt(customCalories, 10) || 0),
      protein_g: Math.max(0, parseFloat(customProtein) || 0),
      carbs_g: Math.max(0, parseFloat(customCarbs) || 0),
      fat_g: Math.max(0, parseFloat(customFat) || 0),
      notes: customNotes.trim() || undefined,
    });

    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 },
    });

    // Reset & close
    setCustomName('');
    setCustomCalories('220');
    setCustomProtein('25');
    setCustomCarbs('15');
    setCustomFat('5');
    setCustomNotes('');
    setIsCustomModalOpen(false);
  };

  return (
    <section className="bg-white rounded-2xl border border-[#E1E3E1] p-5 sm:p-6 shadow-sm space-y-6">
      
      {/* Header with Title & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E1E3E1]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E7F3EF] border border-[#006C4C]/20 flex items-center justify-center text-[#006C4C] shadow-sm">
              <Zap className="w-5 h-5 text-[#006C4C]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1C1E] flex items-center gap-2">
                Protein Drinks &amp; Mid-Shift Snacks
                {loggedSnacks.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#006C4C] text-white">
                    {loggedSnacks.length} logged
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#5E6266]">
                Flexible protein shakes, intra-shift drinks, and snacks contributing directly to your 3,400 kcal &amp; 230g protein goal
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={onScanSnackWithVision}
            className="px-3.5 py-2 rounded-lg bg-[#006C4C] hover:bg-[#00573D] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Scan custom snack or drink with Vision AI"
          >
            <Camera className="w-3.5 h-3.5" />
            Scan Snack (AI)
          </button>

          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-[#F8F9FA] border border-[#E1E3E1] text-[#1A1C1E] text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#006C4C]" />
            Custom Snack / Shake
          </button>
        </div>
      </div>

      {/* Live Snack Contribution Summary Bar (if any logged) */}
      {loggedSnacks.length > 0 && (
        <div className="rounded-xl border border-[#006C4C]/20 bg-[#E7F3EF]/50 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#006C4C] uppercase tracking-wider">
              Total Added from Snacks (Shift Day {shiftDay}):
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono font-bold text-[#1A1C1E] flex-wrap">
            <span className="flex items-center gap-1 text-[#1A1C1E] bg-white px-2.5 py-1 rounded-lg border border-[#E1E3E1] shadow-xs">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              +{snackTotals.calories} kcal
            </span>
            <span className="flex items-center gap-1 text-[#006C4C] bg-white px-2.5 py-1 rounded-lg border border-[#E1E3E1] shadow-xs">
              <Beef className="w-3.5 h-3.5 text-[#006C4C]" />
              +{snackTotals.protein_g}g Protein
            </span>
            <span className="flex items-center gap-1 text-[#006A6A] bg-white px-2.5 py-1 rounded-lg border border-[#E1E3E1] shadow-xs">
              <Wheat className="w-3.5 h-3.5 text-[#006A6A]" />
              +{snackTotals.carbs_g}g Carbs
            </span>
            <span className="flex items-center gap-1 text-[#5D4037] bg-white px-2.5 py-1 rounded-lg border border-[#E1E3E1] shadow-xs">
              <Droplets className="w-3.5 h-3.5 text-[#5D4037]" />
              +{snackTotals.fat_g}g Fat
            </span>
          </div>
        </div>
      )}

      {/* Active Logged Snacks Cards (Shift Day) */}
      {loggedSnacks.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#5E6266] flex items-center justify-between">
            <span>Consumed Snacks &amp; Drinks Today:</span>
            <span className="text-[11px] font-medium text-[#5E6266]">
              All items synced to daily macro progress
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {loggedSnacks.map((meal) => {
              const mt = meal.mealAnalysis.meal_totals;
              const formattedTime = new Date(meal.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={meal.id}
                  className="rounded-xl border border-[#006C4C]/25 bg-white p-3.5 flex items-center justify-between gap-3 shadow-xs hover:border-[#006C4C]/50 transition-all"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#1A1C1E] truncate">
                        {meal.mealAnalysis.meal_name}
                      </span>
                      <span className="text-[10px] font-mono text-[#5E6266] bg-[#F1F3F4] px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#006C4C]" /> {formattedTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
                      <span className="font-bold text-[#1A1C1E]">
                        {mt.calories} kcal
                      </span>
                      <span className="text-[#8E918F]">•</span>
                      <span className="font-bold text-[#006C4C]">
                        {mt.protein_g}g P
                      </span>
                      <span className="text-[#8E918F]">•</span>
                      <span className="text-[#006A6A]">
                        {mt.carbs_g}g C
                      </span>
                      <span className="text-[#8E918F]">•</span>
                      <span className="text-[#5D4037]">
                        {mt.fat_g}g F
                      </span>
                    </div>

                    {meal.notes && (
                      <p className="text-[11px] text-[#5E6266] italic truncate">
                        "{meal.notes}"
                      </p>
                    )}
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onViewMealDetails(meal)}
                      className="p-1.5 text-xs text-[#006C4C] hover:bg-[#E7F3EF] rounded-lg transition-colors font-semibold cursor-pointer"
                      title="Inspect macro breakdown"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onDeleteMeal(meal.id)}
                      className="p-1.5 text-[#8E918F] hover:text-[#BA1A1A] hover:bg-[#FCE8E6] rounded-lg transition-colors cursor-pointer"
                      title="Remove snack"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 1-Tap Quick Log Preset Catalog */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5E6266]">
              Quick 1-Tap Protein Shakes &amp; Snack Presets:
            </h3>
            <p className="text-[11px] text-[#5E6266]">
              Calibrated sports nutrition essentials. Click to log instantly.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: 'all', label: 'All' },
              { key: 'shake', label: '🥤 Shakes' },
              { key: 'drink', label: '⚡ Drinks / Hydration' },
              { key: 'bar', label: '🍫 Bars' },
              { key: 'food', label: '🥣 Real Food' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedFilter(key as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedFilter === key
                    ? 'bg-[#006C4C] text-white shadow-xs'
                    : 'bg-[#F1F3F4] text-[#5E6266] hover:text-[#1A1C1E] hover:bg-[#E1E3E1]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPresets.map((preset) => {
            const isRecentlyLogged = justLoggedId === preset.id;

            return (
              <div
                key={preset.id}
                className={`rounded-xl border p-3.5 flex flex-col justify-between gap-3 transition-all hover:shadow-sm ${
                  preset.highlight
                    ? 'bg-gradient-to-br from-white to-[#E7F3EF]/30 border-[#006C4C]/30'
                    : 'bg-white border-[#E1E3E1] hover:border-[#006C4C]/40'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-[#1A1C1E] leading-snug">
                      {preset.name}
                    </h4>
                    {preset.highlight && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-[#006C4C] text-white flex-shrink-0">
                        Popular
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[#5E6266] leading-tight">
                    {preset.portion}
                  </p>

                  {/* Macro Pill Badges */}
                  <div className="flex items-center gap-1.5 font-mono text-xs flex-wrap pt-1">
                    <span className="font-bold text-[#1A1C1E] bg-[#F1F3F4] px-2 py-0.5 rounded">
                      {preset.calories} kcal
                    </span>
                    <span className="font-extrabold text-[#006C4C] bg-[#E7F3EF] px-2 py-0.5 rounded">
                      {preset.protein_g}g Protein
                    </span>
                    <span className="text-[11px] text-[#5E6266]">
                      {preset.carbs_g}g C • {preset.fat_g}g F
                    </span>
                  </div>
                </div>

                {/* 1-Tap Log Button */}
                <button
                  type="button"
                  onClick={() => handleQuickLog(preset)}
                  className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs ${
                    isRecentlyLogged
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#006C4C] hover:bg-[#00573D] text-white'
                  }`}
                >
                  {isRecentlyLogged ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Added to Day {shiftDay}!
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Quick Log (+{preset.protein_g}g P)
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Snack Modal */}
      {isCustomModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCustomModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl border border-[#E1E3E1] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-5 py-4 border-b border-[#E1E3E1] flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E7F3EF] text-[#006C4C] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1C1E]">
                    Add Custom Snack or Protein Drink
                  </h3>
                  <p className="text-xs text-[#5E6266]">
                    Logs custom macros directly into Shift Day {shiftDay}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1.5 text-[#5E6266] hover:text-[#1A1C1E] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5E6266] uppercase tracking-wider mb-1">
                  Snack / Shake Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PhD Diet Plant Shake, MyProtein Layered Bar, etc."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-white border border-[#E1E3E1] rounded-lg px-3 py-2 text-xs text-[#1A1C1E] placeholder-[#8E918F] focus:outline-none focus:border-[#006C4C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5E6266] uppercase tracking-wider mb-1">
                    Calories (kcal):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="3000"
                    required
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    className="w-full bg-white border border-[#E1E3E1] rounded-lg px-3 py-2 text-xs text-[#1A1C1E] font-mono focus:outline-none focus:border-[#006C4C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#006C4C] uppercase tracking-wider mb-1">
                    Protein (g):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="200"
                    required
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="w-full bg-white border border-[#006C4C]/40 bg-[#E7F3EF]/20 rounded-lg px-3 py-2 text-xs text-[#006C4C] font-mono font-bold focus:outline-none focus:border-[#006C4C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#006A6A] uppercase tracking-wider mb-1">
                    Carbs (g):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="300"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="w-full bg-white border border-[#E1E3E1] rounded-lg px-3 py-2 text-xs text-[#1A1C1E] font-mono focus:outline-none focus:border-[#006C4C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5D4037] uppercase tracking-wider mb-1">
                    Fat (g):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="200"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    className="w-full bg-white border border-[#E1E3E1] rounded-lg px-3 py-2 text-xs text-[#1A1C1E] font-mono focus:outline-none focus:border-[#006C4C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5E6266] uppercase tracking-wider mb-1">
                  Optional Notes (Serving size, flavor, etc.):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Salted caramel flavor, mixed with 300ml cold water"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full bg-white border border-[#E1E3E1] rounded-lg px-3 py-2 text-xs text-[#1A1C1E] placeholder-[#8E918F] focus:outline-none focus:border-[#006C4C]"
                />
              </div>

              <div className="pt-3 border-t border-[#E1E3E1] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-[#E1E3E1] text-[#5E6266] hover:text-[#1A1C1E] text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#006C4C] hover:bg-[#00573D] text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log to Day {shiftDay}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </section>
  );
};
