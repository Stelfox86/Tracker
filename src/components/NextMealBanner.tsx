import React, { useState, useEffect } from 'react';
import {
  Clock,
  Bell,
  BellRing,
  Sparkles,
  ChevronRight,
  Flame,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import {
  MealSlotBaseline,
  ReminderSettings,
  LoggedMealRecord,
  PROTOCOL_MEAL_SLOTS
} from '../types';
import { getNextMealInfo } from '../utils/reminderService';

interface NextMealBannerProps {
  loggedMeals: LoggedMealRecord[];
  reminderSettings: ReminderSettings;
  onOpenReminderModal: () => void;
  onScanForSlot: (slot: MealSlotBaseline) => void;
}

export const NextMealBanner: React.FC<NextMealBannerProps> = ({
  loggedMeals,
  reminderSettings,
  onOpenReminderModal,
  onScanForSlot,
}) => {
  const [timeState, setTimeState] = useState<{
    nextSlot: MealSlotBaseline;
    diffMinutes: number;
    hoursRemaining: number;
    minsRemaining: number;
    isImminent: boolean;
    isLogged: boolean;
  }>({
    nextSlot: PROTOCOL_MEAL_SLOTS[0],
    diffMinutes: 0,
    hoursRemaining: 0,
    minsRemaining: 0,
    isImminent: false,
    isLogged: false,
  });

  // Recalculate upcoming slot every 10 seconds
  useEffect(() => {
    const update = () => {
      const info = getNextMealInfo(reminderSettings.advanceMinutes);
      if (!info) return;

      const hours = Math.floor(info.diffMinutes / 60);
      const mins = info.diffMinutes % 60;
      const isLogged = loggedMeals.some(
        (m) => m.slotName === info.slot.name || m.slotId === info.slot.id
      );

      setTimeState({
        nextSlot: info.slot,
        diffMinutes: info.diffMinutes,
        hoursRemaining: hours,
        minsRemaining: mins,
        isImminent: info.isImminent,
        isLogged,
      });
    };

    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, [reminderSettings.advanceMinutes, loggedMeals]);

  const { nextSlot, hoursRemaining, minsRemaining, isImminent, isLogged } = timeState;

  // Format countdown string
  let countdownText = '';
  if (hoursRemaining > 0) {
    countdownText = `in ${hoursRemaining}h ${minsRemaining}m`;
  } else if (minsRemaining > 0) {
    countdownText = `in ${minsRemaining} mins`;
  } else {
    countdownText = 'Active right now!';
  }

  return (
    <div className={`rounded-2xl border transition-all p-4 sm:p-5 shadow-sm overflow-hidden relative ${
      isImminent && !isLogged
        ? 'bg-gradient-to-r from-amber-50 via-white to-amber-50/30 border-amber-300 ring-1 ring-amber-300/50'
        : isLogged
        ? 'bg-white border-[#E1E3E1]'
        : 'bg-white border-[#E1E3E1]'
    }`}>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        
        {/* Left: Next Meal Info & Countdown */}
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-mono text-xs font-extrabold ${
            isImminent && !isLogged
              ? 'bg-amber-500 text-white shadow-md animate-pulse'
              : isLogged
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-[#E7F3EF] text-[#006C4C] border border-[#006C4C]/20'
          }`}>
            {isLogged ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : isImminent ? (
              <BellRing className="w-5 h-5 text-white" />
            ) : (
              <Clock className="w-5 h-5 text-[#006C4C]" />
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E6266]">
                {isLogged ? 'Target Meal Window Logged' : isImminent ? '🔔 Imminent Meal Alert' : 'Next Protocol Window'}
              </span>

              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                isImminent && !isLogged
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-[#F1F3F4] text-[#1A1C1E]'
              }`}>
                {countdownText}
              </span>

              {reminderSettings.enabled && (
                <button
                  type="button"
                  onClick={onOpenReminderModal}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#006C4C] bg-[#E7F3EF] px-2 py-0.5 rounded-full hover:bg-[#006C4C] hover:text-white transition-colors"
                  title="Configure 30-min reminders"
                >
                  <Bell className="w-3 h-3" />
                  {reminderSettings.advanceMinutes}m Alert Active
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[#1A1C1E] tracking-tight">
                {nextSlot.name}
              </h3>
              <span className="text-xs text-[#5E6266] font-medium hidden sm:inline">
                ({nextSlot.calories} kcal • {nextSlot.protein_g}g Protein)
              </span>
            </div>

            <p className="text-xs text-[#5E6266] truncate max-w-xl">
              <strong>Suggested:</strong> {nextSlot.suggestedFoods}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0">
          {!isLogged ? (
            <button
              onClick={() => onScanForSlot(nextSlot)}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#006C4C] hover:bg-[#00573D] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Scan Meal for {nextSlot.time}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Logged for Today
            </span>
          )}

          <button
            onClick={onOpenReminderModal}
            className="p-2 rounded-lg border border-[#E1E3E1] bg-white hover:bg-[#F8F9FA] text-[#5E6266] hover:text-[#1A1C1E] transition-colors cursor-pointer"
            title="Configure Meal Reminders & Alarms"
          >
            <Bell className="w-4 h-4 text-[#006C4C]" />
          </button>
        </div>

      </div>

    </div>
  );
};
