import { PROTOCOL_MEAL_SLOTS, MealSlotBaseline, ReminderSettings } from '../types';

// Play a pleasant, modern two-tone notification chime using Web Audio API
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    
    // First tone (D5 - 587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.15, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.36);

    // Second tone (A5 - 880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.56);
  } catch (err) {
    console.warn('Audio chime playback note:', err);
  }
};

// Check if browser notifications are supported and permitted
export const getNotificationPermissionStatus = (): 'granted' | 'denied' | 'default' | 'unsupported' => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

// Request Notification Permission from the user
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    console.error('Error requesting notification permission:', e);
    return false;
  }
};

// Dispatch a system notification
export const sendSystemNotification = (title: string, options?: NotificationOptions) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (e) {
      console.warn('Notification instantiation fallback:', e);
    }
  }
};

// Find the next upcoming meal slot and minutes remaining
export const getNextMealInfo = (advanceMinutes: number = 30) => {
  const now = new Date();
  const currentMinutesTotal = now.getHours() * 60 + now.getMinutes();

  const sortedSlots = [...PROTOCOL_MEAL_SLOTS].map((slot) => {
    const [h, m] = slot.time.split(':').map(Number);
    const slotMinutes = h * 60 + m;
    let diffMinutes = slotMinutes - currentMinutesTotal;
    
    // If the time has already passed today, consider it scheduled for tomorrow
    if (diffMinutes < -15) {
      diffMinutes += 24 * 60;
    }
    
    return {
      slot,
      slotMinutes,
      diffMinutes,
      isImminent: diffMinutes <= advanceMinutes && diffMinutes >= 0,
    };
  }).sort((a, b) => a.diffMinutes - b.diffMinutes);

  const next = sortedSlots[0] || null;
  return next;
};

// Generate an .ICS calendar file for the 4-Day Shift Schedule with customizable 30-min alarm triggers
export const generateIcsSchedule = (advanceMinutes: number = 30): string => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ShiftLift Nutrition//4-Day Shift Protocol//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:ShiftLift 4-Day Nutrition Protocol',
    'X-WR-TIMEZONE:UTC',
  ];

  // Generate calendar events for the next 4 shift days
  for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + dayOffset);
    const dateStr = `${targetDate.getFullYear()}${pad(targetDate.getMonth() + 1)}${pad(targetDate.getDate())}`;

    PROTOCOL_MEAL_SLOTS.forEach((slot, index) => {
      const [h, m] = slot.time.split(':').map(Number);
      const startHour = pad(h);
      const startMin = pad(m);

      // End time 30 mins after start
      const endTotalMins = h * 60 + m + 30;
      const endH = pad(Math.floor(endTotalMins / 60) % 24);
      const endM = pad(endTotalMins % 60);

      const dtStart = `${dateStr}T${startHour}${startMin}00`;
      const dtEnd = `${dateStr}T${endH}${endM}00`;
      const uid = `shiftlift-day${dayOffset + 1}-slot${index + 1}-${dateStr}@shiftlift.app`;

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dateStr}T000000Z`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:🥗 ${slot.name} (${slot.calories} kcal)`,
        `DESCRIPTION:ShiftLift Protocol Shift Day ${dayOffset + 1}\\nTarget Macros: ${slot.calories} kcal | ${slot.protein_g}g Protein | ${slot.carbs_g}g Carbs | ${slot.fat_g}g Fat\\nSuggested Meal: ${slot.suggestedFoods}\\nProtocol Note: ${slot.description}`,
        'STATUS:CONFIRMED',
        // 30-minute VALARM Phone / Calendar Notification Trigger
        'BEGIN:VALARM',
        `TRIGGER:-PT${advanceMinutes}M`,
        'ACTION:DISPLAY',
        `DESCRIPTION:⏰ Reminder: ${slot.name} in ${advanceMinutes} mins! Target: ${slot.calories} kcal (${slot.protein_g}g P)`,
        'END:VALARM',
        'END:VEVENT'
      );
    });
  }

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
};

// Trigger download of the ICS file to the user's phone or computer
export const downloadIcsScheduleFile = (advanceMinutes: number = 30) => {
  const icsData = generateIcsSchedule(advanceMinutes);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shiftlift-meal-reminders-${advanceMinutes}m-alarms.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Create a direct Google Calendar Web link for a given slot
export const getGoogleCalendarLinkForSlot = (slot: MealSlotBaseline, dateOffsetDays = 0) => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + dateOffsetDays);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = `${targetDate.getFullYear()}${pad(targetDate.getMonth() + 1)}${pad(targetDate.getDate())}`;
  
  const [h, m] = slot.time.split(':').map(Number);
  const startHour = pad(h);
  const startMin = pad(m);

  const endTotalMins = h * 60 + m + 30;
  const endH = pad(Math.floor(endTotalMins / 60) % 24);
  const endM = pad(endTotalMins % 60);

  const dates = `${dateStr}T${startHour}${startMin}00/${dateStr}T${endH}${endM}00`;
  const text = encodeURIComponent(`🥗 ${slot.name}`);
  const details = encodeURIComponent(
    `Target: ${slot.calories} kcal | ${slot.protein_g}g P | ${slot.carbs_g}g C | ${slot.fat_g}g F\nSuggested: ${slot.suggestedFoods}\n${slot.description}`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
};
