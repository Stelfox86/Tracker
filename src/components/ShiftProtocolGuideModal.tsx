import React from 'react';
import { X, BookOpen, Clock, Flame, Beef, Wheat, Droplets, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { PROTOCOL_DAILY_TARGETS, PROTOCOL_MEAL_SLOTS } from '../types';

interface ShiftProtocolGuideModalProps {
  onClose: () => void;
}

export const ShiftProtocolGuideModal: React.FC<ShiftProtocolGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#E1E3E1] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-[#1A1C1E]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E1E3E1] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E7F3EF] text-[#006C4C] flex items-center justify-center border border-[#006C4C]/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1C1E]">
                4-Day Shift &amp; Early Lift Nutrition Protocol
              </h2>
              <p className="text-xs text-[#5E6266]">
                Master Schedule Architecture &amp; Macronutrient Blueprint
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5E6266] hover:text-[#1A1C1E] hover:bg-[#F1F3F4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Daily Targets Summary Card */}
          <div className="bg-[#F8F9FA] rounded-2xl border border-[#E1E3E1] p-5">
            <h3 className="text-xs uppercase font-bold text-[#006C4C] tracking-wider mb-3">
              Daily Target Macronutrient Calibration
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-xl border border-[#E1E3E1] text-center shadow-sm">
                <div className="flex items-center justify-center gap-1 text-[#006C4C] text-xs font-bold mb-1">
                  <Flame className="w-3.5 h-3.5" /> Calories
                </div>
                <div className="text-xl font-black text-[#1A1C1E] font-mono">
                  {PROTOCOL_DAILY_TARGETS.calories.toLocaleString()}
                </div>
                <span className="text-[10px] text-[#5E6266]">kcal / day</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#E1E3E1] text-center shadow-sm">
                <div className="flex items-center justify-center gap-1 text-[#006C4C] text-xs font-bold mb-1">
                  <Beef className="w-3.5 h-3.5" /> Protein
                </div>
                <div className="text-xl font-black text-[#1A1C1E] font-mono">
                  {PROTOCOL_DAILY_TARGETS.protein_g}g
                </div>
                <span className="text-[10px] text-[#5E6266]">~27% of energy</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#E1E3E1] text-center shadow-sm">
                <div className="flex items-center justify-center gap-1 text-[#006A6A] text-xs font-bold mb-1">
                  <Wheat className="w-3.5 h-3.5" /> Carbs
                </div>
                <div className="text-xl font-black text-[#1A1C1E] font-mono">
                  {PROTOCOL_DAILY_TARGETS.carbs_g}g
                </div>
                <span className="text-[10px] text-[#5E6266]">~44% of energy</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#E1E3E1] text-center shadow-sm">
                <div className="flex items-center justify-center gap-1 text-[#5D4037] text-xs font-bold mb-1">
                  <Droplets className="w-3.5 h-3.5" /> Fats
                </div>
                <div className="text-xl font-black text-[#1A1C1E] font-mono">
                  {PROTOCOL_DAILY_TARGETS.fat_g}g
                </div>
                <span className="text-[10px] text-[#5E6266]">~26% of energy</span>
              </div>
            </div>
          </div>

          {/* 7 Target Meal Schedule & Baselines Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#1A1C1E] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#006C4C]" />
              Detailed 7-Slot Schedule &amp; Physiological Strategy
            </h3>

            <div className="space-y-2.5">
              {PROTOCOL_MEAL_SLOTS.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E1E3E1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#E7F3EF] text-[#006C4C] border border-[#006C4C]/20">
                        {slot.time}
                      </span>
                      <h4 className="text-sm font-bold text-[#1A1C1E]">{slot.name}</h4>
                    </div>
                    <p className="text-xs text-[#1A1C1E]">
                      <strong>Baseline Foods:</strong> {slot.suggestedFoods}
                    </p>
                    <p className="text-[11px] text-[#5E6266]">{slot.description}</p>
                  </div>

                  <div className="bg-white px-3 py-2 rounded-lg border border-[#E1E3E1] font-mono text-xs text-right whitespace-nowrap shadow-sm">
                    <div className="font-bold text-[#006C4C]">{slot.calories} kcal</div>
                    <div className="text-[11px] text-[#5E6266]">
                      <span className="text-[#006C4C] font-semibold">{slot.protein_g}g P</span> •{' '}
                      <span className="text-[#006A6A] font-semibold">{slot.carbs_g}g C</span> •{' '}
                      <span className="text-[#5D4037] font-semibold">{slot.fat_g}g F</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shift Worker Recovery Rules */}
          <div className="bg-[#E7F3EF]/40 rounded-xl p-4 border border-[#006C4C]/20 text-xs text-[#1A1C1E] space-y-2">
            <h4 className="font-bold text-[#006C4C] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#006C4C]" />
              Key Rules for 4-Day Extended Industrial Shift Rotation:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[#5E6266]">
              <li><strong>03:35 Pre-Gym Hydration:</strong> Consume at least 500ml water with sodium/electrolytes to offset overnight dehydration before resistance training.</li>
              <li><strong>05:15 Post-Gym Glycogen Window:</strong> High glycemic carbs (honey/tortillas) and fast whey promote rapid glycogen restoration before shift commencement.</li>
              <li><strong>16:00 Energy Bridge:</strong> Wholemeal complex carbs and peanut butter fats stabilize blood glucose to prevent afternoon fatigue spikes during high-intensity shift tasks.</li>
              <li><strong>21:30 Pre-Bed Recovery:</strong> Slow-digesting micellar casein (quark/cottage cheese) supplies prolonged amino acid levels throughout the night until early wake-up.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};
