import React from 'react';
import {
  Clock,
  Camera,
  CheckCircle,
  Plus,
  Trash2,
  ChevronRight,
  Sparkles,
  Zap,
  Info,
  Check
} from 'lucide-react';
import { PROTOCOL_MEAL_SLOTS, MealSlotBaseline, LoggedMealRecord } from '../types';

interface MealScheduleTimelineProps {
  loggedMeals: LoggedMealRecord[];
  onScanForSlot: (slot: MealSlotBaseline) => void;
  onViewMealDetails: (meal: LoggedMealRecord) => void;
  onDeleteMeal: (mealId: string) => void;
  onQuickLoadBaseline: (slot: MealSlotBaseline) => void;
}

export const MealScheduleTimeline: React.FC<MealScheduleTimelineProps> = ({
  loggedMeals,
  onScanForSlot,
  onViewMealDetails,
  onDeleteMeal,
  onQuickLoadBaseline,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-[#1A1C1E] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#006C4C]" />
            7-Slot Shift &amp; Lift Schedule
          </h2>
          <p className="text-xs text-[#5E6266] mt-0.5">
            Precision nutrient timing calibrated for 03:35 early lift and industrial 4-day shift endurance
          </p>
        </div>
        <div className="text-xs text-[#5E6266] font-mono">
          Protocol Sum: <span className="text-[#1A1C1E] font-bold">3,400 kcal</span> • <span className="text-[#006C4C] font-bold">230g P</span> • <span className="text-[#006A6A] font-bold">376g C</span> • <span className="text-[#5D4037] font-bold">100g F</span>
        </div>
      </div>

      {/* Slots List */}
      <div className="space-y-3">
        {PROTOCOL_MEAL_SLOTS.map((slot) => {
          const logged = loggedMeals.find((m) => m.slotName === slot.name || m.slotId === slot.id);

          return (
            <div
              key={slot.id}
              className={`rounded-xl border transition-all duration-150 ${
                logged
                  ? 'bg-[#E7F3EF] border-[#E1E3E1] border-l-4 border-l-[#006C4C] shadow-sm'
                  : 'bg-white border-[#E1E3E1] border-l-4 border-l-transparent hover:border-[#006C4C]/40 shadow-sm'
              }`}
            >
              <div className="p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  
                  {/* Slot Time & Name */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-white border border-[#E1E3E1] flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-[9px] uppercase font-bold text-[#8E918F]">Slot</span>
                      <span className="text-sm font-black text-[#006C4C] leading-none">#{slot.slotNumber}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white text-[#1A1C1E] border border-[#E1E3E1] flex items-center gap-1 shadow-sm">
                          <Clock className="w-3 h-3 text-[#006C4C]" /> {slot.time}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-[#1A1C1E] truncate">
                          {slot.name}
                        </h3>
                        {logged ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#006C4C] text-white">
                            <Check className="w-3 h-3" /> Logged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F1F3F4] text-[#5E6266] border border-[#E1E3E1]">
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Suggested baseline foods or logged meal title */}
                      <p className="text-xs text-[#5E6266] mt-1 line-clamp-1">
                        {logged ? (
                          <span>
                            Detected: <strong className="text-[#1A1C1E] font-semibold">{logged.mealAnalysis.meal_name}</strong>
                          </span>
                        ) : (
                          <span>
                            Baseline: <strong className="text-[#1A1C1E] font-medium">{slot.suggestedFoods}</strong>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Macros Display & Variance Badges */}
                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                    
                    {/* Baseline / Actual Target Values */}
                    <div className="bg-white px-3 py-1.5 rounded-lg border border-[#E1E3E1] flex items-center gap-3 font-mono text-xs shadow-sm">
                      <div>
                        <span className="text-[9px] text-[#8E918F] block uppercase font-bold">Calories</span>
                        <span className="font-bold text-[#1A1C1E]">
                          {logged ? logged.mealAnalysis.meal_totals.calories : slot.calories} <span className="text-[9px] text-[#8E918F] font-normal">kcal</span>
                        </span>
                      </div>
                      <div className="h-5 w-px bg-[#E1E3E1]" />
                      <div>
                        <span className="text-[9px] text-[#006C4C] block uppercase font-bold">Protein</span>
                        <span className="font-bold text-[#1A1C1E]">
                          {logged ? logged.mealAnalysis.meal_totals.protein_g : slot.protein_g}g
                        </span>
                      </div>
                      <div className="h-5 w-px bg-[#E1E3E1]" />
                      <div>
                        <span className="text-[9px] text-[#006A6A] block uppercase font-bold">Carbs</span>
                        <span className="font-bold text-[#1A1C1E]">
                          {logged ? logged.mealAnalysis.meal_totals.carbs_g : slot.carbs_g}g
                        </span>
                      </div>
                      <div className="h-5 w-px bg-[#E1E3E1]" />
                      <div>
                        <span className="text-[9px] text-[#5D4037] block uppercase font-bold">Fats</span>
                        <span className="font-bold text-[#1A1C1E]">
                          {logged ? logged.mealAnalysis.meal_totals.fat_g : slot.fat_g}g
                        </span>
                      </div>
                    </div>

                    {/* Variance Badge if Logged */}
                    {logged && (
                      <div className="hidden sm:flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#E1E3E1] text-xs font-mono shadow-sm">
                        <span className="text-[#5E6266] text-[10px] uppercase font-bold">Variance:</span>
                        <span
                          className={`font-bold ${
                            logged.mealAnalysis.slot_variance.calorie_difference === 0
                              ? 'text-[#006C4C]'
                              : logged.mealAnalysis.slot_variance.calorie_difference > 0
                              ? 'text-[#E46962]'
                              : 'text-[#006A6A]'
                          }`}
                        >
                          {logged.mealAnalysis.slot_variance.calorie_difference > 0 ? '+' : ''}
                          {logged.mealAnalysis.slot_variance.calorie_difference} kcal
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      {logged ? (
                        <>
                          <button
                            onClick={() => onViewMealDetails(logged)}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F8F9FA] text-xs font-semibold text-[#1A1C1E] border border-[#E1E3E1] flex items-center gap-1 transition-colors shadow-sm"
                            title="View Ingredient Breakdown & Variance"
                          >
                            Details
                            <ChevronRight className="w-3.5 h-3.5 text-[#5E6266]" />
                          </button>
                          <button
                            onClick={() => onDeleteMeal(logged.id)}
                            className="p-1.5 rounded-lg text-[#8E918F] hover:text-[#E46962] hover:bg-white border border-[#E1E3E1] transition-colors"
                            title="Remove meal from slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onScanForSlot(slot)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#006C4C] text-white hover:bg-[#00573D] shadow-sm transition-all active:scale-95"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            Scan Image
                          </button>
                          <button
                            onClick={() => onQuickLoadBaseline(slot)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#F8F9FA] text-[#1A1C1E] border border-[#E1E3E1] transition-colors shadow-sm"
                            title="Quick load baseline sample meal"
                          >
                            <Zap className="w-3.5 h-3.5 text-[#006C4C]" />
                            <span className="hidden sm:inline">Baseline</span>
                          </button>
                        </>
                      )}
                    </div>

                  </div>

                </div>

                {/* Sub-description */}
                <div className="mt-2.5 pt-2.5 border-t border-[#E1E3E1]/70 flex items-center justify-between text-[11px] text-[#5E6266]">
                  <span className="flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-[#8E918F]" />
                    {slot.description}
                  </span>
                  {logged && (
                    <span className="text-[#5E6266] font-mono text-[10px]">
                      {logged.mealAnalysis.ingredients.length} ingredients detected
                    </span>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
