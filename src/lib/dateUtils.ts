/**
 * Utility functions for 12-hour time and date formatting across BoxKhel
 */

export function formatTime12h(time24: string): string {
  if (!time24) return '';
  const parts = time24.trim().split(':');
  if (parts.length < 2) return time24;
  
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return time24;

  const ampm = hours >= 12 && hours < 24 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 or 24 -> 12

  const minStr = minutes === '00' ? '' : `:${minutes}`;
  return `${hours}${minStr} ${ampm}`;
}

export function formatSlotTimeRange(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return '';
  return `${formatTime12h(startTime)} - ${formatTime12h(endTime)}`;
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!year || !month || !day) return dateStr;

    const d = new Date(year, month - 1, day);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const today = new Date();
    const isToday = today.getFullYear() === year && today.getMonth() === month - 1 && today.getDate() === day;
    
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const isTomorrow = tomorrow.getFullYear() === year && tomorrow.getMonth() === month - 1 && tomorrow.getDate() === day;

    const dayPrefix = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : days[d.getDay()];
    return `${dayPrefix}, ${day} ${months[month - 1]}`;
  } catch (e) {
    return dateStr;
  }
}

export function getTodayDateString(offsetDays: number = 0): string {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseTimeToMinutes(tStr: string): number {
  if (!tStr) return 0;
  const match = tStr.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = match[3]?.toUpperCase();

  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function isTimeInPastForDate(dateStr: string, timeStr: string): boolean {
  if (!dateStr || !timeStr) return false;
  const todayStr = getTodayDateString();

  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const timeMinutes = parseTimeToMinutes(timeStr);
  return timeMinutes <= currentMinutes;
}

export function isTimeWindowInPastForDate(dateStr: string, fromTimeStr: string, toTimeStr: string): boolean {
  if (!dateStr) return false;
  const todayStr = getTodayDateString();

  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const fromMinutes = parseTimeToMinutes(fromTimeStr);
  const toMinutes = parseTimeToMinutes(toTimeStr);

  // Overnight slot (e.g. 11:00 PM to 02:00 AM)
  if (toMinutes < fromMinutes && fromMinutes >= 720) {
    return false;
  }

  // A match time window is expired if its start time has already passed today
  return fromMinutes <= currentMinutes;
}

export const TIME_SLOTS_12H = [
  '12:00 AM', '12:30 AM', '01:00 AM', '01:30 AM', '02:00 AM', '02:30 AM',
  '03:00 AM', '03:30 AM', '04:00 AM', '04:30 AM', '05:00 AM', '05:30 AM',
  '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
  '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'
];

export function suggestEndTime(fromTimeStr: string, durationHours: number = 2): string {
  const fromMinutes = parseTimeToMinutes(fromTimeStr);
  const targetMinutes = (fromMinutes + durationHours * 60) % (24 * 60);
  
  let closest = TIME_SLOTS_12H[0];
  let minDiff = 9999;
  for (const slot of TIME_SLOTS_12H) {
    const slotMins = parseTimeToMinutes(slot);
    const diff = Math.abs(slotMins - targetMinutes);
    if (diff < minDiff) {
      minDiff = diff;
      closest = slot;
    }
  }
  return closest;
}

export function isSameOrInvalidTimeRange(fromTimeStr: string, toTimeStr: string): { isInvalid: boolean; errorMsg?: string } {
  if (!fromTimeStr || !toTimeStr) return { isInvalid: true, errorMsg: 'Please select both start and end times.' };
  
  if (fromTimeStr.trim() === toTimeStr.trim()) {
    return { isInvalid: true, errorMsg: 'From Time and To Time cannot be identical. Match must have a duration.' };
  }

  const fromMinutes = parseTimeToMinutes(fromTimeStr);
  const toMinutes = parseTimeToMinutes(toTimeStr);

  // Overnight match slot (e.g. 11:00 PM to 02:00 AM)
  const isOvernight = fromMinutes >= 720 && toMinutes <= 360;

  if (!isOvernight && toMinutes <= fromMinutes) {
    return { isInvalid: true, errorMsg: 'To Time must be after From Time.' };
  }

  return { isInvalid: false };
}


