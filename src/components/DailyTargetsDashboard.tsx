import React from 'react';
import { Flame, Beef, Wheat, Droplets, CheckCircle2, AlertCircle } from 'lucide-react';
import { PROTOCOL_DAILY_TARGETS, LoggedMealRecord } from '../types';

interface DailyTargetsDashboardProps {
  loggedMeals: LoggedMealRecord[];
  shiftDay: number;
}

export const DailyTargetsDashboard: React.FC<DailyTargetsDashboardProps> = ({
  loggedMeals,
  shiftDay,
}) => {
  // Aggregate consumed macros
  const totals = loggedMeals.reduce(
    (acc, meal) => {
      const mt = meal.mealAnalysis.meal_totals;
      return {
        calories: acc.calories + (mt.calories || 0),
        protein_g: acc.protein_g + (mt.protein_g || 0),
        carbs_g: acc.carbs_g + (mt.carbs_g || 0),
        fat_g: acc.fat_g + (mt.fat_g || 0),
      };
    },
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  const targets = PROTOCOL_DAILY_TARGETS;

  const calPct = Math.min(Math.round((totals.calories / targets.calories) * 100), 100);
  const proPct = Math.min(Math.round((totals.protein_g / targets.protein_g) * 100), 100);
  const carbPct = Math.min(Math.round((totals.carbs_g / targets.carbs_g) * 100), 100);
  const fatPct = Math.min(Math.round((totals.fat_g / targets.fat_g) * 100), 100);

  const calRemaining = targets.calories - totals.calories;
  const proRemaining = Math.max(0, Math.round((targets.protein_g - totals.protein_g) * 10) / 10);
  const carbRemaining = Math.max(0, Math.round((targets.carbs_g - totals.carbs_g) * 10) / 10);
  const fatRemaining = Math.max(0, Math.round((targets.fat_g - totals.fat_g) * 10) / 10);

  // Status computation
  const primarySlotsLoggedCount = loggedMeals.filter((m) => !m.slotId.startsWith('snack-')).length;
  const snacksLoggedCount = loggedMeals.filter((m) => m.slotId.startsWith('snack-') || m.slotName.toLowerCase().includes('snack') || m.slotName.toLowerCase().includes('shake')).length;
  const isCalorieSurplus = totals.calories > targets.calories;
  const isComplete = primarySlotsLoggedCount >= 7 && totals.calories >= targets.calories * 0.95;

  return (
    <section className="bg-white rounded-xl border border-[#E1E3E1] p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-[#E1E3E1] gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-[#1A1C1E]">
              Shift Day {shiftDay} Protocol Targets
            </h2>
            {isComplete ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E7F3EF] text-[#006C4C] border border-[#006C4C]/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Target Achieved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F1F3F4] text-[#5E6266] border border-[#E1E3E1]">
                {primarySlotsLoggedCount} of 7 Schedule Slots
              </span>
            )}
            {snacksLoggedCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E7F3EF] text-[#006C4C] border border-[#006C4C]/20">
                +{snacksLoggedCount} {snacksLoggedCount === 1 ? 'Snack/Shake' : 'Snacks/Shakes'}
              </span>
            )}
          </div>
          <p className="text-xs text-[#5E6266] mt-0.5">
            Calibrated for 03:35 Early Lift &amp; 4-Day Extended Industrial Shift Workload
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#5E6266]">Total Daily Calories</span>
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-2xl font-black text-[#1A1C1E]">{totals.calories.toLocaleString()}</span>
            <span className="text-sm font-medium text-[#8E918F]">/ {targets.calories.toLocaleString()} kcal</span>
          </div>
        </div>
      </div>

      {/* 4 Core Macro Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        
        {/* Calories Card */}
        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E1E3E1] relative overflow-hidden transition-all hover:border-[#006C4C]/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E7F3EF] text-[#006C4C] flex items-center justify-center border border-[#006C4C]/20">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#5E6266] uppercase tracking-wider">Calories</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#006C4C]">{calPct}%</span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div className="text-2xl font-black text-[#1A1C1E] font-mono">
              {totals.calories}
            </div>
            <div className="text-xs text-[#8E918F] font-mono">
              Target: <strong className="text-[#1A1C1E]">{targets.calories}</strong>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[#E1E3E1] rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCalorieSurplus ? 'bg-[#E46962]' : 'bg-[#006C4C]'
              }`}
              style={{ width: `${Math.min(calPct, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#5E6266] mt-2 font-mono">
            <span>Remaining:</span>
            <span className={calRemaining >= 0 ? 'text-[#006C4C] font-semibold' : 'text-[#E46962] font-semibold'}>
              {calRemaining >= 0 ? `${calRemaining} kcal` : `+${Math.abs(calRemaining)} over`}
            </span>
          </div>
        </div>

        {/* Protein Card */}
        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E1E3E1] relative overflow-hidden transition-all hover:border-[#006C4C]/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E7F3EF] text-[#006C4C] flex items-center justify-center border border-[#006C4C]/20">
                <Beef className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#5E6266] uppercase tracking-wider">Protein</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#006C4C]">{proPct}%</span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div className="text-2xl font-black text-[#1A1C1E] font-mono">
              {Math.round(totals.protein_g)}<span className="text-sm font-medium text-[#8E918F] ml-0.5">g</span>
            </div>
            <div className="text-xs text-[#8E918F] font-mono">
              Target: <strong className="text-[#1A1C1E]">{targets.protein_g}g</strong>
            </div>
          </div>

          <div className="w-full h-1.5 bg-[#E1E3E1] rounded-full mt-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#006C4C] transition-all duration-500"
              style={{ width: `${Math.min(proPct, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#5E6266] mt-2 font-mono">
            <span>Remaining:</span>
            <span className={proRemaining === 0 ? 'text-[#006C4C] font-semibold' : 'text-[#1A1C1E]'}>
              {proRemaining === 0 ? 'Target Hit! 🎯' : `${proRemaining}g left`}
            </span>
          </div>
        </div>

        {/* Carbohydrates Card */}
        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E1E3E1] relative overflow-hidden transition-all hover:border-[#006A6A]/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E0F2F1] text-[#006A6A] flex items-center justify-center border border-[#006A6A]/20">
                <Wheat className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#5E6266] uppercase tracking-wider">Carbs</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#006A6A]">{carbPct}%</span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div className="text-2xl font-black text-[#1A1C1E] font-mono">
              {Math.round(totals.carbs_g)}<span className="text-sm font-medium text-[#8E918F] ml-0.5">g</span>
            </div>
            <div className="text-xs text-[#8E918F] font-mono">
              Target: <strong className="text-[#1A1C1E]">{targets.carbs_g}g</strong>
            </div>
          </div>

          <div className="w-full h-1.5 bg-[#E1E3E1] rounded-full mt-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#006A6A] transition-all duration-500"
              style={{ width: `${Math.min(carbPct, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#5E6266] mt-2 font-mono">
            <span>Remaining:</span>
            <span className={carbRemaining === 0 ? 'text-[#006A6A] font-semibold' : 'text-[#1A1C1E]'}>
              {carbRemaining === 0 ? 'Target Hit! 🎯' : `${carbRemaining}g left`}
            </span>
          </div>
        </div>

        {/* Fats Card */}
        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E1E3E1] relative overflow-hidden transition-all hover:border-[#006C4C]/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EFEBE9] text-[#5D4037] flex items-center justify-center border border-[#5D4037]/20">
                <Droplets className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#5E6266] uppercase tracking-wider">Fats</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#5D4037]">{fatPct}%</span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div className="text-2xl font-black text-[#1A1C1E] font-mono">
              {Math.round(totals.fat_g)}<span className="text-sm font-medium text-[#8E918F] ml-0.5">g</span>
            </div>
            <div className="text-xs text-[#8E918F] font-mono">
              Target: <strong className="text-[#1A1C1E]">{targets.fat_g}g</strong>
            </div>
          </div>

          <div className="w-full h-1.5 bg-[#E1E3E1] rounded-full mt-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#5D4037] transition-all duration-500"
              style={{ width: `${Math.min(fatPct, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#5E6266] mt-2 font-mono">
            <span>Remaining:</span>
            <span className={fatRemaining === 0 ? 'text-[#006C4C] font-semibold' : 'text-[#1A1C1E]'}>
              {fatRemaining === 0 ? 'Target Hit! 🎯' : `${fatRemaining}g left`}
            </span>
          </div>
        </div>

      </div>

      {/* Macro Ratio Split Bar */}
      <div className="mt-4 pt-4 border-t border-[#E1E3E1] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-[#5E6266]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-[#1A1C1E] uppercase text-[10px] tracking-wider">Macro Split:</span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006C4C] inline-block" />
            Protein: {totals.calories > 0 ? Math.round(((totals.protein_g * 4) / totals.calories) * 100) : 0}% (Target 27%)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006A6A] inline-block" />
            Carbs: {totals.calories > 0 ? Math.round(((totals.carbs_g * 4) / totals.calories) * 100) : 0}% (Target 44%)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5D4037] inline-block" />
            Fats: {totals.calories > 0 ? Math.round(((totals.fat_g * 9) / totals.calories) * 100) : 0}% (Target 26%)
          </span>
        </div>

        <div className="text-[#8E918F] text-[11px] font-mono">
          03:35 Lift + Shift Schedule Architecture
        </div>
      </div>
    </section>
  );
};
