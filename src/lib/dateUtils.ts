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
