import React, { useState, useEffect } from 'react';
import {
  Header
} from './components/Header';
import {
  DailyTargetsDashboard
} from './components/DailyTargetsDashboard';
import {
  MealScheduleTimeline
} from './components/MealScheduleTimeline';
import {
  VisionMealAnalyzer
} from './components/VisionMealAnalyzer';
import {
  ShiftProtocolGuideModal
} from './components/ShiftProtocolGuideModal';
import {
  RawJsonSchemaModal
} from './components/RawJsonSchemaModal';
import {
  MealDetailModal
} from './components/MealDetailModal';
import {
  MealReminderModal
} from './components/MealReminderModal';
import {
  NextMealBanner
} from './components/NextMealBanner';
import {
  LoggedMealRecord,
  MealSlotBaseline,
  MealAnalysisResult,
  ReminderSettings,
  DEFAULT_REMINDER_SETTINGS,
  PROTOCOL_MEAL_SLOTS
} from './types';
import {
  sendSystemNotification,
  playNotificationChime
} from './utils/reminderService';
import { SAMPLE_PRESET_MEALS } from './data/sampleMeals';
import { Sparkles, Calendar, Plus, RefreshCw, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY_PREFIX = 'shiftlift_meals_day_';
const REMINDERS_STORAGE_KEY = 'shiftlift_reminder_settings';

export default function App() {
  const [shiftDay, setShiftDay] = useState<number>(1);
  const [loggedMeals, setLoggedMeals] = useState<LoggedMealRecord[]>([]);
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState<boolean>(false);
  const [selectedSlotForScan, setSelectedSlotForScan] = useState<MealSlotBaseline | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState<boolean>(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);
  const [inspectingMeal, setInspectingMeal] = useState<LoggedMealRecord | null>(null);

  // Reminder settings state with local persistence
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() => {
    try {
      const saved = localStorage.getItem(REMINDERS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Error reading reminder settings:', e);
    }
    return DEFAULT_REMINDER_SETTINGS;
  });

  const handleUpdateReminderSettings = (newSettings: ReminderSettings) => {
    setReminderSettings(newSettings);
    try {
      localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.warn('Error saving reminder settings:', e);
    }
  };

  // Background timer to trigger live 30-min reminders
  useEffect(() => {
    if (!reminderSettings.enabled) return;

    const checkReminders = () => {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      const currentMinutesTotal = now.getHours() * 60 + now.getMinutes();

      let stateChanged = false;
      const updatedTriggered = { ...(reminderSettings.lastTriggered || {}) };

      PROTOCOL_MEAL_SLOTS.forEach((slot) => {
        if (!reminderSettings.enabledSlots[slot.id]) return;

        const [h, m] = slot.time.split(':').map(Number);
        const slotMinutes = h * 60 + m;
        const reminderTargetMinutes = slotMinutes - reminderSettings.advanceMinutes;

        // Check if current time has hit the reminder window (within 1 minute)
        if (
          currentMinutesTotal >= reminderTargetMinutes &&
          currentMinutesTotal <= reminderTargetMinutes + 1 &&
          updatedTriggered[slot.id] !== todayStr
        ) {
          // Trigger Notification
          sendSystemNotification(
            `⏰ ${reminderSettings.advanceMinutes}-Min Reminder: ${slot.name}`,
            {
              body: `Target: ${slot.calories} kcal (${slot.protein_g}g P, ${slot.carbs_g}g C, ${slot.fat_g}g F) • ${slot.suggestedFoods}`,
            }
          );

          if (reminderSettings.soundEnabled) {
            playNotificationChime();
          }

          updatedTriggered[slot.id] = todayStr;
          stateChanged = true;
        }
      });

      if (stateChanged) {
        handleUpdateReminderSettings({
          ...reminderSettings,
          lastTriggered: updatedTriggered,
        });
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 20000);
    return () => clearInterval(interval);
  }, [reminderSettings]);

  // Load meals from localStorage for the active shift day, or seed initial demo on first launch
  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${shiftDay}`);
    if (saved) {
      try {
        setLoggedMeals(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Error parsing stored meals:', e);
      }
    }

    // Default seed for Day 1 so the app looks populated immediately with real protocol meals
    if (shiftDay === 1) {
      const initialSeed: LoggedMealRecord[] = [
        {
          id: 'seed-1',
          timestamp: new Date().toISOString(),
          shiftDay: 1,
          slotId: 'slot-1',
          slotName: 'Pre-Gym Fuel (03:35)',
          mealAnalysis: SAMPLE_PRESET_MEALS[0].expectedData,
          imageThumbnail: SAMPLE_PRESET_MEALS[0].imageUrl,
          notes: 'Consumed with 500ml electrolyte water before 04:00 lift.',
        },
        {
          id: 'seed-2',
          timestamp: new Date().toISOString(),
          shiftDay: 1,
          slotId: 'slot-2',
          slotName: 'Post-Gym Exit (05:15)',
          mealAnalysis: SAMPLE_PRESET_MEALS[1].expectedData,
          imageThumbnail: SAMPLE_PRESET_MEALS[1].imageUrl,
          notes: 'Fast recovery shake and honey tortillas right after cooldown.',
        },
        {
          id: 'seed-3',
          timestamp: new Date().toISOString(),
          shiftDay: 1,
          slotId: 'slot-3',
          slotName: 'Work Arrival / Breakfast (07:00)',
          mealAnalysis: SAMPLE_PRESET_MEALS[2].expectedData,
          imageThumbnail: SAMPLE_PRESET_MEALS[2].imageUrl,
          notes: 'Shift kickoff breakfast in canteen.',
        },
        {
          id: 'seed-4',
          timestamp: new Date().toISOString(),
          shiftDay: 1,
          slotId: 'slot-4',
          slotName: 'Work Lunch (12:00)',
          mealAnalysis: SAMPLE_PRESET_MEALS[3].expectedData,
          imageThumbnail: SAMPLE_PRESET_MEALS[3].imageUrl,
          notes: 'Meal-prep container reheated on shift.',
        },
      ];
      setLoggedMeals(initialSeed);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}1`, JSON.stringify(initialSeed));
    } else {
      setLoggedMeals([]);
    }
  }, [shiftDay]);

  // Save changes to localStorage
  const saveMealsToStorage = (updatedMeals: LoggedMealRecord[]) => {
    setLoggedMeals(updatedMeals);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${shiftDay}`, JSON.stringify(updatedMeals));
  };

  const handleScanForSlot = (slot: MealSlotBaseline) => {
    setSelectedSlotForScan(slot);
    setIsAnalyzerOpen(true);
  };

  const handleQuickAnalyzeClick = () => {
    setSelectedSlotForScan(null);
    setIsAnalyzerOpen(true);
  };

  const handleSaveMealFromAnalyzer = (
    analysis: MealAnalysisResult,
    imageThumbnail?: string,
    notes?: string
  ) => {
    const targetSlot =
      PROTOCOL_MEAL_SLOTS.find((s) => s.name === analysis.matched_slot) ||
      selectedSlotForScan ||
      PROTOCOL_MEAL_SLOTS[0];

    const newRecord: LoggedMealRecord = {
      id: `meal-${Date.now()}`,
      timestamp: new Date().toISOString(),
      shiftDay,
      slotId: targetSlot.id,
      slotName: analysis.matched_slot || targetSlot.name,
      mealAnalysis: analysis,
      imageThumbnail,
      notes,
    };

    // Filter out existing meal in this slot if any, and replace with newly analyzed meal
    const filtered = loggedMeals.filter(
      (m) => m.slotName !== newRecord.slotName && m.slotId !== newRecord.slotId
    );
    const updated = [...filtered, newRecord].sort((a, b) => {
      const slotA = PROTOCOL_MEAL_SLOTS.find((s) => s.name === a.slotName)?.slotNumber || 0;
      const slotB = PROTOCOL_MEAL_SLOTS.find((s) => s.name === b.slotName)?.slotNumber || 0;
      return slotA - slotB;
    });

    saveMealsToStorage(updated);
    setIsAnalyzerOpen(false);
    setSelectedSlotForScan(null);
  };

  const handleDeleteMeal = (mealId: string) => {
    const updated = loggedMeals.filter((m) => m.id !== mealId);
    saveMealsToStorage(updated);
  };

  const handleQuickLoadBaseline = (slot: MealSlotBaseline) => {
    const sample = SAMPLE_PRESET_MEALS.find((s) => s.slotId === slot.id || s.slotName === slot.name);
    if (!sample) return;

    handleSaveMealFromAnalyzer(sample.expectedData, sample.imageUrl, `Auto-loaded ${slot.name} baseline preset.`);
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  const handleResetDay = () => {
    if (window.confirm(`Reset all logged meals for Shift Day ${shiftDay}?`)) {
      saveMealsToStorage([]);
    }
  };

  const handleExportJson = () => {
    const exportData = {
      protocol: '4-Day Shift & Early Lift Nutrition Protocol',
      shiftDay,
      exportedAt: new Date().toISOString(),
      dailyTargets: {
        calories: 3400,
        protein_g: 230,
        carbs_g: 376,
        fat_g: 100,
      },
      loggedMealsCount: loggedMeals.length,
      loggedMeals,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shift-lift-day-${shiftDay}-nutrition-log.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1C1E] flex flex-col font-sans selection:bg-[#006C4C] selection:text-white">
      
      {/* Top Navigation Bar */}
      <Header
        shiftDay={shiftDay}
        reminderSettings={reminderSettings}
        onSelectShiftDay={(day) => setShiftDay(day)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        onOpenReminders={() => setIsReminderModalOpen(true)}
        onResetDay={handleResetDay}
        onExportJson={handleExportJson}
        onQuickAnalyzeClick={handleQuickAnalyzeClick}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Next Meal & Live Countdown Alert Banner */}
        <NextMealBanner
          loggedMeals={loggedMeals}
          reminderSettings={reminderSettings}
          onOpenReminderModal={() => setIsReminderModalOpen(true)}
          onScanForSlot={handleScanForSlot}
        />

        {/* Daily Macronutrient Targets & Progress Dashboard */}
        <DailyTargetsDashboard loggedMeals={loggedMeals} shiftDay={shiftDay} />

        {/* Embedded Analyzer Trigger Banner */}
        <div className="relative rounded-2xl bg-white border border-[#E1E3E1] p-5 sm:p-6 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E7F3EF] text-[#006C4C] border border-[#006C4C]/20">
                Gemini Vision Engine
              </span>
              <span className="text-xs text-[#5E6266] font-medium">Shift &amp; Lift Precision</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1A1C1E]">
              Analyze Meal Snapshot &amp; Map to 4-Day Shift Protocol
            </h3>
            <p className="text-xs text-[#5E6266] max-w-2xl leading-relaxed">
              Upload a meal photo or take a live camera shot. The vision engine identifies each ingredient, estimates serving weights in grams, calculates exact macros, and matches to your 03:35 - 21:30 schedule slots.
            </p>
          </div>

          <div className="flex items-center gap-2.5 z-10 flex-shrink-0">
            <button
              onClick={handleQuickAnalyzeClick}
              className="px-4 py-2.5 rounded-lg bg-[#006C4C] hover:bg-[#00573D] text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Open Vision Analyzer
            </button>
          </div>

          {/* Background decorative subtle accent */}
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-48 h-48 bg-[#E7F3EF] rounded-full blur-2xl pointer-events-none opacity-60" />
        </div>

        {/* 7 Target Meal Schedule & Baselines Timeline */}
        <MealScheduleTimeline
          loggedMeals={loggedMeals}
          onScanForSlot={handleScanForSlot}
          onViewMealDetails={(meal) => setInspectingMeal(meal)}
          onDeleteMeal={handleDeleteMeal}
          onQuickLoadBaseline={handleQuickLoadBaseline}
        />

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E1E3E1] py-5 mt-12 text-center text-xs text-[#5E6266]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ShiftLift Nutrition Vision API Engine • 4-Day Shift &amp; Early Lift Protocol (3,400 kcal | 230g P | 376g C | 100g F)
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReminderModalOpen(true)}
              className="text-[#006C4C] font-semibold hover:underline text-[11px]"
            >
              Meal Reminders ({reminderSettings.advanceMinutes}m)
            </button>
            <span className="text-[#E1E3E1]">•</span>
            <button
              onClick={() => setIsSchemaModalOpen(true)}
              className="text-[#006C4C] font-semibold hover:underline font-mono text-[11px]"
            >
              Raw JSON Output Schema Specs
            </button>
          </div>
        </div>
      </footer>

      {/* Meal Reminder Modal */}
      {isReminderModalOpen && (
        <MealReminderModal
          settings={reminderSettings}
          onUpdateSettings={handleUpdateReminderSettings}
          onClose={() => setIsReminderModalOpen(false)}
        />
      )}

      {/* Vision Analyzer Modal */}
      {isAnalyzerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-h-[92vh] overflow-y-auto">
            <VisionMealAnalyzer
              initialSlotHint={selectedSlotForScan}
              shiftDay={shiftDay}
              onSaveMeal={handleSaveMealFromAnalyzer}
              onClose={() => {
                setIsAnalyzerOpen(false);
                setSelectedSlotForScan(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Protocol Guide Modal */}
      {isGuideOpen && (
        <ShiftProtocolGuideModal onClose={() => setIsGuideOpen(false)} />
      )}

      {/* Raw JSON Schema Modal */}
      {isSchemaModalOpen && (
        <RawJsonSchemaModal onClose={() => setIsSchemaModalOpen(false)} />
      )}

      {/* Logged Meal Inspection Modal */}
      {inspectingMeal && (
        <MealDetailModal
          meal={inspectingMeal}
          onClose={() => setInspectingMeal(null)}
          onDelete={(id) => {
            handleDeleteMeal(id);
            setInspectingMeal(null);
          }}
        />
      )}

    </div>
  );
}
