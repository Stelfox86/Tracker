import React from 'react';
import {
  Flame,
  Clock,
  BookOpen,
  RotateCcw,
  Download,
  Sparkles,
  Calendar,
  Activity,
  Bell,
  BellRing,
  Trophy,
  Dumbbell
} from 'lucide-react';
import { PROTOCOL_MEAL_SLOTS, ReminderSettings, StreakStats } from '../types';

interface HeaderProps {
  shiftDay: number;
  reminderSettings: ReminderSettings;
  streakStats: StreakStats;
  onSelectShiftDay: (day: number) => void;
  onOpenGuide: () => void;
  onOpenSchemaModal: () => void;
  onOpenReminders: () => void;
  onOpenStreakDetails: () => void;
  onOpenGymProgress: () => void;
  onResetDay: () => void;
  onExportJson: () => void;
  onQuickAnalyzeClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  shiftDay,
  reminderSettings,
  streakStats,
  onSelectShiftDay,
  onOpenGuide,
  onOpenSchemaModal,
  onOpenReminders,
  onOpenStreakDetails,
  onOpenGymProgress,
  onResetDay,
  onExportJson,
  onQuickAnalyzeClick,
}) => {
  // Determine current active/next slot based on local time
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentMinutesTotal = currentHours * 60 + currentMinutes;

  const currentSlot = PROTOCOL_MEAL_SLOTS.find((slot) => {
    const [h, m] = slot.time.split(':').map(Number);
    const slotMins = h * 60 + m;
    return Math.abs(currentMinutesTotal - slotMins) <= 90;
  }) || PROTOCOL_MEAL_SLOTS[0];

  const streakDays = Math.max(1, streakStats?.currentStreak || 1);

  return (
    <header className="bg-white border-b border-[#E1E3E1] sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Brand & Shift Clock */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#006C4C] rounded-lg flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold tracking-tight text-[#1A1C1E]">
                  VITAL<span className="text-[#006C4C]">VISION</span>
                  <span className="text-xs font-medium text-[#5E6266] ml-2 hidden sm:inline">• ShiftLift</span>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E7F3EF] text-[#006C4C] border border-[#006C4C]/20">
                  4-Day Shift Protocol
                </span>

                {/* Header Streak Flame Badge */}
                <button
                  onClick={onOpenStreakDetails}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-amber-500/10 to-rose-500/10 text-amber-700 border border-amber-400/40 hover:bg-amber-100/60 transition-all cursor-pointer shadow-2xs"
                  title="View streak details & milestones"
                >
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                  <span>{streakDays}d Streak</span>
                </button>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#5E6266] mt-0.5 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#006C4C]" />
                  Active Window: <strong className="text-[#1A1C1E] font-semibold">{currentSlot.name}</strong>
                </span>
                <span className="hidden sm:inline text-[#8E918F]">•</span>
                <span className="hidden sm:inline text-[#5E6266] text-[11px] font-mono">3,400 kcal / 230g P Baseline</span>
              </div>
            </div>
          </div>

          {/* Shift Day Selector & Action Controls */}
          <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-between md:justify-end">
            
            {/* Shift Day 1-4 Pill Selector */}
            <div className="flex items-center bg-[#F1F3F4] p-1 rounded-lg border border-[#E1E3E1]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E6266] px-2 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#5E6266]" />
                Shift:
              </span>
              {[1, 2, 3, 4].map((day) => (
                <button
                  key={day}
                  onClick={() => onSelectShiftDay(day)}
                  className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
                    shiftDay === day
                      ? 'bg-[#006C4C] text-white shadow-sm'
                      : 'text-[#5E6266] hover:text-[#1A1C1E] hover:bg-[#E1E3E1]/60'
                  }`}
                  title={`Switch to Shift Day ${day}`}
                >
                  Day {day}
                </button>
              ))}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={onQuickAnalyzeClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#006C4C] hover:bg-[#00573D] text-white shadow-sm transition-all active:scale-95 cursor-pointer"
                title="Scan meal with Vision AI"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Scan Meal
              </button>

              <button
                onClick={onOpenGymProgress}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1A1C1E] hover:bg-[#2D3135] text-white shadow-sm transition-all active:scale-95 cursor-pointer"
                title="Gym progress photo comparison AI"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Gym Progress</span>
              </button>

              <button
                onClick={onOpenReminders}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  reminderSettings.enabled
                    ? 'bg-[#E7F3EF] border-[#006C4C]/30 text-[#006C4C] hover:bg-[#006C4C] hover:text-white'
                    : 'bg-white border-[#E1E3E1] text-[#5E6266] hover:bg-[#F8F9FA]'
                }`}
                title={`Configure Meal Reminders (${reminderSettings.advanceMinutes}m advance)`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Reminders</span>
                <span className="text-[10px] font-bold px-1 rounded bg-black/10">
                  {reminderSettings.advanceMinutes}m
                </span>
              </button>

              <button
                onClick={onOpenGuide}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1A1C1E] bg-white hover:bg-[#F8F9FA] border border-[#E1E3E1] transition-colors cursor-pointer"
                title="View Protocol Guide & Baseline Schedule"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#006A6A]" />
                <span className="hidden lg:inline">Guide</span>
              </button>

              <button
                onClick={onOpenSchemaModal}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-[#1A1C1E] bg-white hover:bg-[#F8F9FA] border border-[#E1E3E1] transition-colors"
                title="View Vision API JSON Schema"
              >
                <span className="font-mono text-[10px] text-[#006C4C] font-bold">{'{ }'}</span>
                <span className="hidden xl:inline">API</span>
              </button>

              <button
                onClick={onExportJson}
                className="p-1.5 rounded-lg text-[#5E6266] hover:text-[#1A1C1E] hover:bg-[#F1F3F4] border border-[#E1E3E1] transition-colors"
                title="Export Day Log to JSON"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={onResetDay}
                className="p-1.5 rounded-lg text-[#5E6266] hover:text-[#E46962] hover:bg-[#F1F3F4] border border-[#E1E3E1] transition-colors"
                title="Reset Day Logs"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
