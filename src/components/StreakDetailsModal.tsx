import React from 'react';
import {
  Flame,
  Trophy,
  Award,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Zap,
  X,
  Target,
  ShieldCheck,
  Dumbbell,
  Clock
} from 'lucide-react';
import { StreakStats, LoggedMealRecord } from '../types';

interface StreakDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakStats: StreakStats;
  loggedMeals: LoggedMealRecord[];
  shiftDay: number;
}

export const StreakDetailsModal: React.FC<StreakDetailsModalProps> = ({
  isOpen,
  onClose,
  streakStats,
  loggedMeals,
  shiftDay,
}) => {
  if (!isOpen) return null;

  const currentStreak = Math.max(1, streakStats.currentStreak);
  const longestStreak = Math.max(currentStreak, streakStats.longestStreak || 1);
  const totalDaysLogged = Math.max(1, streakStats.totalDaysLogged || currentStreak);
  const totalMealsLogged = streakStats.totalMealsLogged || loggedMeals.length;

  const milestones = [
    {
      id: 'm1',
      title: 'Shift Starter',
      desc: 'Log meals on 3 consecutive shift days',
      reqDays: 3,
      icon: '🔥',
      unlocked: currentStreak >= 3,
    },
    {
      id: 'm2',
      title: 'Protocol Engine',
      desc: 'Maintain a 7-day unbroken nutrition streak',
      reqDays: 7,
      icon: '⚡',
      unlocked: currentStreak >= 7,
    },
    {
      id: 'm3',
      title: 'Early Lift Master',
      desc: 'Complete 14 days with 04:00 AM lifting & 230g protein',
      reqDays: 14,
      icon: '🏆',
      unlocked: currentStreak >= 14,
    },
    {
      id: 'm4',
      title: 'Iron Discipline',
      desc: '30 consecutive days of 3,400 kcal shift execution',
      reqDays: 30,
      icon: '💎',
      unlocked: currentStreak >= 30,
    },
  ];

  // 14-day adherence calendar simulator
  const recentDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const isToday = i === 13;
    const isLogged = (13 - i) < currentStreak;
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weekday: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      isToday,
      isLogged,
    };
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl border border-[#E1E3E1] shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E1E3E1] flex items-center justify-between bg-gradient-to-r from-amber-50 to-rose-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1A1C1E] flex items-center gap-2">
                Shift Nutrition Streak &amp; Consistency
              </h2>
              <p className="text-xs text-[#5E6266]">
                Building daily commitment to your 3,400 kcal &amp; 230g protein protocol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5E6266] hover:text-[#1A1C1E] hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E1E3E1] text-center space-y-1">
              <span className="text-[10px] font-bold text-[#5E6266] uppercase tracking-wider block">
                Current Streak
              </span>
              <div className="text-2xl font-black text-amber-600 font-mono flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                {currentStreak}d
              </div>
              <span className="text-[10px] text-[#5E6266] block">Active consecutive</span>
            </div>

            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E1E3E1] text-center space-y-1">
              <span className="text-[10px] font-bold text-[#5E6266] uppercase tracking-wider block">
                Best Streak
              </span>
              <div className="text-2xl font-black text-[#1A1C1E] font-mono flex items-center justify-center gap-1">
                <Trophy className="w-5 h-5 text-amber-500" />
                {longestStreak}d
              </div>
              <span className="text-[10px] text-[#5E6266] block">Record peak</span>
            </div>

            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E1E3E1] text-center space-y-1">
              <span className="text-[10px] font-bold text-[#5E6266] uppercase tracking-wider block">
                Days Logged
              </span>
              <div className="text-2xl font-black text-[#006C4C] font-mono flex items-center justify-center gap-1">
                <Calendar className="w-5 h-5 text-[#006C4C]" />
                {totalDaysLogged}
              </div>
              <span className="text-[10px] text-[#5E6266] block">Total logged</span>
            </div>

            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E1E3E1] text-center space-y-1">
              <span className="text-[10px] font-bold text-[#5E6266] uppercase tracking-wider block">
                Total Meals
              </span>
              <div className="text-2xl font-black text-[#006A6A] font-mono flex items-center justify-center gap-1">
                <Zap className="w-5 h-5 text-[#006A6A]" />
                {totalMealsLogged}
              </div>
              <span className="text-[10px] text-[#5E6266] block">Meals scanned/logged</span>
            </div>
          </div>

          {/* 14-Day Visual Heatmap Matrix */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#1A1C1E] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#006C4C]" />
                14-Day Activity Matrix
              </h4>
              <span className="text-[11px] text-[#5E6266]">
                Shift Day {shiftDay} in progress
              </span>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 bg-[#F8F9FA] p-3 rounded-xl border border-[#E1E3E1]">
              {recentDays.map((d, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-center transition-all ${
                    d.isToday
                      ? 'bg-[#006C4C] text-white ring-2 ring-[#006C4C]/40 shadow-xs'
                      : d.isLogged
                      ? 'bg-[#E7F3EF] text-[#006C4C] border border-[#006C4C]/30'
                      : 'bg-white text-[#8E918F] border border-[#E1E3E1]'
                  }`}
                  title={`${d.date}: ${d.isLogged ? 'Logged' : 'No logs'}`}
                >
                  <span className="text-[9px] font-bold uppercase">{d.weekday}</span>
                  <div className="my-0.5">
                    {d.isLogged ? (
                      <CheckCircle2 className={`w-3.5 h-3.5 ${d.isToday ? 'text-white' : 'text-[#006C4C]'}`} />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-dashed border-[#8E918F]" />
                    )}
                  </div>
                  <span className="text-[8px] font-mono">{d.date.split(' ')[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone Badges */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1A1C1E] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Consistency Milestones &amp; Badges
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    m.unlocked
                      ? 'bg-gradient-to-r from-amber-50/70 to-emerald-50/70 border-emerald-300'
                      : 'bg-[#F8F9FA] border-[#E1E3E1] opacity-60'
                  }`}
                >
                  <div className="text-2xl">{m.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-[#1A1C1E] truncate">
                        {m.title}
                      </h5>
                      {m.unlocked ? (
                        <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase bg-emerald-600 text-white rounded">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#5E6266]">
                          {m.reqDays} days req
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5E6266] leading-tight">
                      {m.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shift Coach Tip */}
          <div className="p-3.5 rounded-xl bg-[#E7F3EF] border border-[#006C4C]/25 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#006C4C] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#006C4C] space-y-1">
              <span className="font-bold block">Why daily consistency is essential for 4-Day Shifts:</span>
              <p className="leading-relaxed">
                With a 03:00 AM wake-up and heavy 04:00 AM lifts, missing meal slots leads to intra-shift fatigue and muscle catabolism. Hitting your 7 slots keeps amino acid flux elevated and powers shift performance.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E1E3E1] bg-[#F8F9FA] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#006C4C] hover:bg-[#00573D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Got It, Keep Pushing
          </button>
        </div>

      </div>
    </div>
  );
};
