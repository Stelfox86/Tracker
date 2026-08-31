import React, { useState } from 'react';
import {
  Flame,
  Trophy,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Zap,
  Award,
  ChevronRight,
  ShieldCheck,
  Clock,
  Info
} from 'lucide-react';
import { StreakStats, LoggedMealRecord } from '../types';
import confetti from 'canvas-confetti';

interface StreakTrackerCardProps {
  streakStats: StreakStats;
  loggedMeals: LoggedMealRecord[];
  shiftDay: number;
  onOpenStreakDetails: () => void;
  onOpenGymProgress: () => void;
}

export const StreakTrackerCard: React.FC<StreakTrackerCardProps> = ({
  streakStats,
  loggedMeals,
  shiftDay,
  onOpenStreakDetails,
  onOpenGymProgress,
}) => {
  const primaryMealsLogged = loggedMeals.filter((m) => !m.slotId.startsWith('snack-')).length;
  const snacksLogged = loggedMeals.filter((m) => m.slotId.startsWith('snack-') || m.slotName.toLowerCase().includes('snack') || m.slotName.toLowerCase().includes('shake')).length;
  const totalLoggedToday = loggedMeals.length;

  // Streak status calculation
  const streak = Math.max(1, streakStats.currentStreak);
  const isCompleteToday = primaryMealsLogged >= 6;

  const getTier = (days: number) => {
    if (days >= 30) return { title: 'Elite Shift Athlete', color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' };
    if (days >= 14) return { title: 'Protocol Master', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
    if (days >= 7) return { title: 'Shift Champion', color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' };
    if (days >= 3) return { title: 'Consistency Builder', color: 'text-[#006C4C]', bg: 'bg-[#E7F3EF] border-[#006C4C]/20' };
    return { title: 'Shift Starter', color: 'text-[#5E6266]', bg: 'bg-slate-50 border-slate-200' };
  };

  const tier = getTier(streak);

  // Generate last 7 days visual matrix
  const daysArray = [
    { label: 'D1', dayNum: 1, active: shiftDay >= 1, isCurrent: shiftDay === 1 },
    { label: 'D2', dayNum: 2, active: shiftDay >= 2, isCurrent: shiftDay === 2 },
    { label: 'D3', dayNum: 3, active: shiftDay >= 3, isCurrent: shiftDay === 3 },
    { label: 'D4', dayNum: 4, active: shiftDay >= 4, isCurrent: shiftDay === 4 },
  ];

  return (
    <div className="bg-gradient-to-r from-[#006C4C]/10 via-[#006A6A]/5 to-transparent rounded-2xl border border-[#006C4C]/25 p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Streak Flame & Status */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md transform transition-transform hover:scale-105">
              <Flame className="w-7 h-7 animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-white text-[#1A1C1E] border border-amber-400 font-mono text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
              {streak}d
            </span>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-extrabold text-[#1A1C1E] flex items-center gap-1.5">
                <span>{streak} Day Logging Streak</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.bg} ${tier.color}`}>
                  {tier.title}
                </span>
              </h3>
            </div>
            <p className="text-xs text-[#5E6266] flex items-center gap-2 flex-wrap">
              <span>Shift Day {shiftDay}: <strong className="text-[#1A1C1E] font-semibold">{primaryMealsLogged}/7</strong> schedule meals</span>
              {snacksLogged > 0 && (
                <span className="text-[#006C4C] font-semibold">+{snacksLogged} snack/shake</span>
              )}
              <span className="text-[#8E918F] hidden sm:inline">•</span>
              <span className="text-[#5E6266] text-[11px]">Best: {Math.max(streak, streakStats.longestStreak)} days</span>
            </p>
          </div>
        </div>

        {/* Middle: Shift 4-Day Cycle Adherence Indicators */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3 py-2 rounded-xl border border-[#E1E3E1] shadow-2xs self-start lg:self-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E6266] mr-1 hidden sm:inline">
            4-Day Cycle:
          </span>
          <div className="flex items-center gap-1.5">
            {daysArray.map((d) => (
              <div
                key={d.dayNum}
                className={`w-7 h-7 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all ${
                  d.isCurrent
                    ? 'bg-[#006C4C] text-white ring-2 ring-[#006C4C]/30 shadow-xs'
                    : d.active
                    ? 'bg-[#E7F3EF] text-[#006C4C] border border-[#006C4C]/30'
                    : 'bg-[#F1F3F4] text-[#8E918F] border border-dashed border-[#E1E3E1]'
                }`}
                title={`Shift Day ${d.dayNum}`}
              >
                <span>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={onOpenGymProgress}
            className="px-3.5 py-2 rounded-xl bg-[#1A1C1E] hover:bg-[#2D3135] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Gym Progress AI</span>
          </button>

          <button
            onClick={onOpenStreakDetails}
            className="px-3 py-2 rounded-xl bg-white hover:bg-[#F8F9FA] text-[#1A1C1E] border border-[#E1E3E1] text-xs font-bold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Streak Stats</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#5E6266]" />
          </button>
        </div>

      </div>
    </div>
  );
};
