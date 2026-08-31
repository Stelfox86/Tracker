import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Check,
  Clock,
  Download,
  ExternalLink,
  Info,
  Smartphone,
  Volume2,
  VolumeX,
  X,
  AlertCircle,
  Sparkles,
  Calendar
} from 'lucide-react';
import {
  ReminderSettings,
  PROTOCOL_MEAL_SLOTS,
  MealSlotBaseline
} from '../types';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  sendSystemNotification,
  playNotificationChime,
  downloadIcsScheduleFile,
  getGoogleCalendarLinkForSlot
} from '../utils/reminderService';

interface MealReminderModalProps {
  settings: ReminderSettings;
  onUpdateSettings: (newSettings: ReminderSettings) => void;
  onClose: () => void;
}

export const MealReminderModal: React.FC<MealReminderModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<string>('default');
  const [testSent, setTestSent] = useState<boolean>(false);
  const [copiedLinkSlot, setCopiedLinkSlot] = useState<string | null>(null);

  useEffect(() => {
    setPermissionStatus(getNotificationPermissionStatus());
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
    if (granted) {
      if (settings.soundEnabled) playNotificationChime();
      sendSystemNotification('ShiftLift Meal Reminders Active!', {
        body: `You will receive a notification ${settings.advanceMinutes} minutes before each scheduled meal.`,
      });
    }
  };

  const handleSendTestNotification = () => {
    if (settings.soundEnabled) {
      playNotificationChime();
    }
    
    sendSystemNotification(`⏰ 30-Min Meal Reminder: Work Arrival / Breakfast (07:00)`, {
      body: `Target: 660 kcal (42g P, 70g C, 24g F) • 4 Boiled Eggs, 100g Oats, 50g Berries`,
    });

    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleToggleMaster = (enabled: boolean) => {
    onUpdateSettings({ ...settings, enabled });
  };

  const handleAdvanceChange = (mins: number) => {
    onUpdateSettings({ ...settings, advanceMinutes: mins });
  };

  const handleToggleSound = () => {
    const newSound = !settings.soundEnabled;
    onUpdateSettings({ ...settings, soundEnabled: newSound });
    if (newSound) playNotificationChime();
  };

  const handleToggleSlot = (slotId: string) => {
    const current = !!settings.enabledSlots[slotId];
    onUpdateSettings({
      ...settings,
      enabledSlots: {
        ...settings.enabledSlots,
        [slotId]: !current,
      },
    });
  };

  const handleToggleAllSlots = (enableAll: boolean) => {
    const updated: Record<string, boolean> = {};
    PROTOCOL_MEAL_SLOTS.forEach((s) => {
      updated[s.id] = enableAll;
    });
    onUpdateSettings({ ...settings, enabledSlots: updated });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl border border-[#E1E3E1] shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E1E3E1] flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E7F3EF] border border-[#006C4C]/20 flex items-center justify-center text-[#006C4C] shadow-sm">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1C1E] flex items-center gap-2">
                Meal Schedule Reminders
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E7F3EF] text-[#006C4C]">
                  {settings.advanceMinutes}m Prior
                </span>
              </h2>
              <p className="text-xs text-[#5E6266]">
                Get prompt alerts on your phone or computer before each protocol meal window.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#5E6266] hover:text-[#1A1C1E] hover:bg-[#E1E3E1] rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Master Enable & System Permission Banner */}
          <div className="p-4 rounded-xl border border-[#E1E3E1] bg-[#F8F9FA] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${permissionStatus === 'granted' ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-amber-400 ring-4 ring-amber-100'}`} />
                <div>
                  <h4 className="text-sm font-bold text-[#1A1C1E]">
                    Device Notifications
                  </h4>
                  <p className="text-xs text-[#5E6266]">
                    {permissionStatus === 'granted'
                      ? 'Push notifications are active for this device'
                      : permissionStatus === 'denied'
                      ? 'Notifications are blocked in browser settings'
                      : 'Permission needed to display on-screen alerts'}
                  </p>
                </div>
              </div>

              {permissionStatus !== 'granted' ? (
                <button
                  onClick={handleRequestPermission}
                  className="px-3.5 py-1.5 rounded-lg bg-[#006C4C] hover:bg-[#00573D] text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  Enable Notifications
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#006C4C] bg-[#E7F3EF] px-2.5 py-1 rounded-full">
                  <Check className="w-3.5 h-3.5" /> Enabled
                </span>
              )}
            </div>

            {permissionStatus === 'granted' && (
              <div className="pt-2 border-t border-[#E1E3E1] flex items-center justify-between">
                <span className="text-xs text-[#5E6266]">
                  Verify how alerts look on your screen:
                </span>
                <button
                  onClick={handleSendTestNotification}
                  className="px-3 py-1 text-xs font-bold text-[#006C4C] hover:bg-[#E7F3EF] border border-[#006C4C]/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {testSent ? 'Test Alert Sent!' : 'Send Test Notification'}
                </button>
              </div>
            )}
          </div>

          {/* Reminder Timing & Lead Time */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-[#5E6266] uppercase tracking-wider">
              Reminder Lead Time (When to notify you):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { mins: 15, label: '15 Mins Before' },
                { mins: 30, label: '30 Mins (Recommended)', highlight: true },
                { mins: 45, label: '45 Mins Before' },
                { mins: 60, label: '1 Hour Before' },
                { mins: 0, label: 'Exact Meal Time' },
              ].map(({ mins, label, highlight }) => {
                const isSelected = settings.advanceMinutes === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleAdvanceChange(mins)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-[#006C4C] border-[#006C4C] text-white shadow-sm'
                        : 'bg-white border-[#E1E3E1] text-[#1A1C1E] hover:border-[#006C4C]/50 hover:bg-[#F8F9FA]'
                    }`}
                  >
                    <span className="text-sm font-extrabold">{mins === 0 ? 'Exact' : `${mins}m`}</span>
                    <span className="text-[10px] opacity-85 font-medium leading-tight">
                      {mins === 0 ? 'On Schedule' : 'Prior to slot'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio Chime Settings */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E1E3E1] bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#F1F3F4] text-[#1A1C1E]">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#006C4C]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[#8E918F]" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A1C1E]">Audio Chime Alert</h4>
                <p className="text-[11px] text-[#5E6266]">
                  Plays a subtle acoustic chime when meal reminders trigger
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {settings.soundEnabled && (
                <button
                  type="button"
                  onClick={playNotificationChime}
                  className="text-[11px] font-semibold text-[#006C4C] hover:underline px-2 py-1"
                >
                  Preview Chime
                </button>
              )}
              <button
                type="button"
                onClick={handleToggleSound}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.soundEnabled ? 'bg-[#006C4C]' : 'bg-[#C4C7C5]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Slot-by-Slot Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#5E6266] uppercase tracking-wider">
                Target Meal Slots to Remind (7 Protocols):
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleToggleAllSlots(true)}
                  className="text-[#006C4C] hover:underline font-semibold"
                >
                  All On
                </button>
                <span className="text-[#E1E3E1]">|</span>
                <button
                  type="button"
                  onClick={() => handleToggleAllSlots(false)}
                  className="text-[#5E6266] hover:underline font-semibold"
                >
                  All Off
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PROTOCOL_MEAL_SLOTS.map((slot) => {
                const isEnabled = !!settings.enabledSlots[slot.id];
                return (
                  <div
                    key={slot.id}
                    onClick={() => handleToggleSlot(slot.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isEnabled
                        ? 'bg-[#E7F3EF]/40 border-[#006C4C]/30 text-[#1A1C1E]'
                        : 'bg-white border-[#E1E3E1] text-[#8E918F] opacity-75'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[#006C4C] bg-white px-1.5 py-0.5 rounded border border-[#E1E3E1]">
                          {slot.time}
                        </span>
                        <span className="text-xs font-bold text-[#1A1C1E] truncate">
                          {slot.name.split(' (')[0]}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5E6266] truncate">
                        {slot.calories} kcal • {slot.protein_g}g P • {slot.suggestedFoods.split(',')[0]}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                        isEnabled
                          ? 'bg-[#006C4C] border-[#006C4C] text-white'
                          : 'border-[#C4C7C5] bg-white'
                      }`}
                    >
                      {isEnabled && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Native Phone Calendar Sync Option */}
          <div className="rounded-xl border border-[#006C4C]/20 bg-gradient-to-br from-[#E7F3EF]/60 to-[#E7F3EF]/20 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#006C4C] text-white shadow-sm flex-shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#1A1C1E]">
                  Guaranteed Native Phone Lock-Screen Reminders
                </h4>
                <p className="text-xs text-[#5E6266] leading-relaxed">
                  Export the complete 4-Day Shift Schedule to your <strong>Apple Calendar (iPhone)</strong> or <strong>Google Calendar (Android)</strong>. This guarantees system-level lock screen notifications and alarms <strong>{settings.advanceMinutes} minutes before every meal</strong> even when your browser is closed.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => downloadIcsScheduleFile(settings.advanceMinutes)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#006C4C] hover:bg-[#00573D] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download 4-Day Calendar (.ics) with {settings.advanceMinutes}m Alarms
              </button>

              <a
                href={getGoogleCalendarLinkForSlot(PROTOCOL_MEAL_SLOTS[2])}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-lg bg-white hover:bg-[#F8F9FA] border border-[#E1E3E1] text-[#1A1C1E] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#5E6266]" />
                Google Calendar
              </a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F8F9FA] border-t border-[#E1E3E1] flex items-center justify-between">
          <span className="text-[11px] text-[#5E6266]">
            Active for Shift Days 1–4 • Real-time background sync
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#006C4C] hover:bg-[#00573D] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Save &amp; Close
          </button>
        </div>

      </div>
    </div>
  );
};
