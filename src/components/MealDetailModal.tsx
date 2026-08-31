import React, { useState } from 'react';
import { X, Clock, Trash2, Copy, Check, Code2, Layers, Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { LoggedMealRecord, PROTOCOL_MEAL_SLOTS } from '../types';

interface MealDetailModalProps {
  meal: LoggedMealRecord;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const MealDetailModal: React.FC<MealDetailModalProps> = ({ meal, onClose, onDelete }) => {
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  const slotInfo = PROTOCOL_MEAL_SLOTS.find((s) => s.id === meal.slotId || s.name === meal.slotName);
  const jsonStr = JSON.stringify(meal.mealAnalysis, null, 2);

  const copyJson = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#E1E3E1] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-[#1A1C1E]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E1E3E1] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E7F3EF] text-[#006C4C] flex items-center justify-center border border-[#006C4C]/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#006C4C] px-2 py-0.5 rounded bg-[#E7F3EF] border border-[#006C4C]/20">
                  {meal.slotName}
                </span>
                <span className="text-xs text-[#5E6266]">Shift Day {meal.shiftDay}</span>
              </div>
              <h2 className="text-base font-bold text-[#1A1C1E] mt-0.5">
                {meal.mealAnalysis.meal_name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5E6266] hover:text-[#1A1C1E] hover:bg-[#F1F3F4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Meal Thumbnail & Macros */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#F8F9FA] p-4 rounded-xl border border-[#E1E3E1]">
            {meal.imageThumbnail && (
              <div className="w-28 h-24 rounded-lg overflow-hidden bg-white border border-[#E1E3E1] flex-shrink-0 shadow-sm">
                <img
                  src={meal.imageThumbnail}
                  alt={meal.mealAnalysis.meal_name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="flex-1 w-full">
              <span className="text-[10px] uppercase font-bold text-[#5E6266] block mb-1">
                Meal Totals:
              </span>
              <div className="grid grid-cols-4 gap-2 font-mono text-center">
                <div className="bg-white p-2 rounded-lg border border-[#E1E3E1] shadow-sm">
                  <span className="text-[9px] text-[#5E6266] block uppercase font-bold">Calories</span>
                  <span className="text-xs font-black text-[#006C4C]">
                    {meal.mealAnalysis.meal_totals.calories} <span className="text-[9px] font-normal text-[#8E918F]">kcal</span>
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#E1E3E1] shadow-sm">
                  <span className="text-[9px] text-[#006C4C] block uppercase font-bold">Protein</span>
                  <span className="text-xs font-black text-[#1A1C1E]">
                    {meal.mealAnalysis.meal_totals.protein_g}g
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#E1E3E1] shadow-sm">
                  <span className="text-[9px] text-[#006A6A] block uppercase font-bold">Carbs</span>
                  <span className="text-xs font-black text-[#1A1C1E]">
                    {meal.mealAnalysis.meal_totals.carbs_g}g
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#E1E3E1] shadow-sm">
                  <span className="text-[9px] text-[#5D4037] block uppercase font-bold">Fat</span>
                  <span className="text-xs font-black text-[#1A1C1E]">
                    {meal.mealAnalysis.meal_totals.fat_g}g
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Variance Stats */}
          <div className="bg-[#F8F9FA] p-3 rounded-xl border border-[#E1E3E1] text-xs">
            <span className="text-[10px] uppercase font-bold text-[#5E6266] block mb-1">
              Slot Variance vs Target Baseline:
            </span>
            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
              <span className="text-[#1A1C1E]">
                Calories: <strong className="text-[#006C4C]">{meal.mealAnalysis.slot_variance.calorie_difference > 0 ? '+' : ''}{meal.mealAnalysis.slot_variance.calorie_difference} kcal</strong>
              </span>
              <span className="text-[#1A1C1E]">
                Protein: <strong className="text-[#006C4C]">{meal.mealAnalysis.slot_variance.protein_difference_g > 0 ? '+' : ''}{meal.mealAnalysis.slot_variance.protein_difference_g}g</strong>
              </span>
              <span className="text-[#1A1C1E]">
                Carbs: <strong className="text-[#006A6A]">{meal.mealAnalysis.slot_variance.carbs_difference_g > 0 ? '+' : ''}{meal.mealAnalysis.slot_variance.carbs_difference_g}g</strong>
              </span>
              <span className="text-[#1A1C1E]">
                Fat: <strong className="text-[#5D4037]">{meal.mealAnalysis.slot_variance.fat_difference_g > 0 ? '+' : ''}{meal.mealAnalysis.slot_variance.fat_difference_g}g</strong>
              </span>
            </div>
          </div>

          {/* Ingredients Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5E6266] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#006C4C]" />
                Detected Ingredients ({meal.mealAnalysis.ingredients.length})
              </span>
              <button
                onClick={() => setShowJson(!showJson)}
                className="text-xs text-[#006C4C] font-semibold hover:underline flex items-center gap-1"
              >
                <Code2 className="w-3.5 h-3.5" />
                {showJson ? 'View Ingredients Table' : 'View Raw JSON'}
              </button>
            </div>

            {showJson ? (
              <div className="relative">
                <button
                  onClick={copyJson}
                  className="absolute top-2 right-2 px-2 py-1 bg-white hover:bg-[#F8F9FA] text-xs rounded border border-[#E1E3E1] text-[#1A1C1E] flex items-center gap-1 shadow-sm font-semibold"
                >
                  {copied ? <Check className="w-3 h-3 text-[#006C4C]" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <pre className="p-4 rounded-xl bg-[#1A1C1E] border border-[#E1E3E1] text-[#00FF9C] font-mono text-xs overflow-x-auto max-h-60">
                  {jsonStr}
                </pre>
              </div>
            ) : (
              <div className="border border-[#E1E3E1] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F9FA] text-[#5E6266] font-mono text-[10px] uppercase border-b border-[#E1E3E1]">
                    <tr>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5">Weight (g)</th>
                      <th className="p-2.5">Calories</th>
                      <th className="p-2.5">Macros (P/C/F)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E3E1]">
                    {meal.mealAnalysis.ingredients.map((ing, i) => (
                      <tr key={i} className="hover:bg-[#F8F9FA]">
                        <td className="p-2.5 font-medium text-[#1A1C1E]">{ing.name}</td>
                        <td className="p-2.5 font-mono text-[#006C4C] font-semibold">{ing.estimated_weight_g}g</td>
                        <td className="p-2.5 font-mono text-[#1A1C1E]">{ing.calories} kcal</td>
                        <td className="p-2.5 font-mono text-[#5E6266]">
                          {ing.protein_g}P / {ing.carbs_g}C / {ing.fat_g}F
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* User Notes */}
          {meal.notes && (
            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E1E3E1] text-xs text-[#1A1C1E]">
              <span className="font-bold text-[#5E6266] uppercase tracking-wider block mb-0.5 text-[10px]">Notes:</span>
              <p>{meal.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E1E3E1]">
            <button
              onClick={() => {
                onDelete(meal.id);
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#C5221F] hover:bg-[#FCE8E6] border border-[#E46962]/40 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Remove Logged Meal
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#F1F3F4] hover:bg-[#E1E3E1] text-xs font-bold text-[#1A1C1E] transition-colors border border-[#E1E3E1]"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
