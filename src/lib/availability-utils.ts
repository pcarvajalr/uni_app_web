import type {
  AvailableHours,
  DayOfWeek,
  SlotRange,
  ALL_DAYS,
  ALL_SLOTS,
  DAY_LABELS,
  SLOT_LABELS,
} from '@/types/tutoring.types';

// Re-export for convenience
export { ALL_DAYS, ALL_SLOTS, DAY_LABELS, SLOT_LABELS } from '@/types/tutoring.types';

/**
 * Parse available_hours string from database to AvailableHours object
 */
export function parseAvailableHours(jsonString: string | null): AvailableHours {
  if (!jsonString) return {};

  try {
    const parsed = JSON.parse(jsonString);
    return validateAvailableHours(parsed);
  } catch (error) {
    console.error('Error parsing available_hours:', error);
    return {};
  }
}

/**
 * Stringify AvailableHours object for database storage
 */
export function stringifyAvailableHours(hours: AvailableHours): string {
  return JSON.stringify(hours);
}

/**
 * Validate and sanitize AvailableHours object
 */
export function validateAvailableHours(hours: unknown): AvailableHours {
  if (!hours || typeof hours !== 'object') return {};

  const validDays: DayOfWeek[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];
  const validSlots: SlotRange[] = ['06:00-10:00', '10:00-14:00', '14:00-18:00', '18:00-22:00'];

  const result: AvailableHours = {};

  for (const day of validDays) {
    const dayValue = (hours as Record<string, unknown>)[day];
    if (Array.isArray(dayValue)) {
      const validatedSlots = dayValue.filter(
        (slot): slot is SlotRange => validSlots.includes(slot as SlotRange)
      );
      if (validatedSlots.length > 0) {
        result[day] = validatedSlots;
      }
    }
  }

  return result;
}

/**
 * Check if a specific day has any availability
 */
export function hasAvailabilityOnDay(hours: AvailableHours, day: DayOfWeek): boolean {
  return Array.isArray(hours[day]) && hours[day]!.length > 0;
}

/**
 * Get all available days from AvailableHours
 */
export function getAvailableDays(hours: AvailableHours): DayOfWeek[] {
  const validDays: DayOfWeek[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];
  return validDays.filter(day => hasAvailabilityOnDay(hours, day));
}

/**
 * Get available slots for a specific day
 */
export function getSlotsForDay(hours: AvailableHours, day: DayOfWeek): SlotRange[] {
  return hours[day] || [];
}

/**
 * Check if a specific time is within a slot range
 */
export function isTimeInSlot(time: string, slot: SlotRange): boolean {
  const [slotStart, slotEnd] = slot.split('-');
  return time >= slotStart && time < slotEnd;
}

/**
 * Get the slot range that contains a specific time
 */
export function getSlotForTime(time: string): SlotRange | null {
  const validSlots: SlotRange[] = ['06:00-10:00', '10:00-14:00', '14:00-18:00', '18:00-22:00'];
  return validSlots.find(slot => isTimeInSlot(time, slot)) || null;
}

/**
 * Generate 1-hour time slots within a slot range
 */
export function generateHourlySlots(slotRange: SlotRange): string[] {
  const [start, end] = slotRange.split('-');
  const startHour = parseInt(start.split(':')[0], 10);
  const endHour = parseInt(end.split(':')[0], 10);

  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    slots.push(time);
  }

  return slots;
}

/**
 * Get all available 1-hour booking slots for a specific day
 */
export function getBookingSlotsForDay(hours: AvailableHours, day: DayOfWeek): string[] {
  const daySlots = getSlotsForDay(hours, day);
  return daySlots.flatMap(generateHourlySlots);
}

/**
 * Format time for display (e.g., "14:00" -> "2:00 PM")
 */
export function formatTimeForDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get day of week from a date string (YYYY-MM-DD format)
 */
export function getDayOfWeekFromDate(dateString: string): DayOfWeek {
  const date = new Date(dateString + 'T00:00:00');
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

/**
 * Check if a date has available slots
 */
export function hasAvailabilityOnDate(hours: AvailableHours, dateString: string): boolean {
  const day = getDayOfWeekFromDate(dateString);
  return hasAvailabilityOnDay(hours, day);
}

/**
 * Get available booking slots for a specific date
 */
export function getBookingSlotsForDate(hours: AvailableHours, dateString: string): string[] {
  const day = getDayOfWeekFromDate(dateString);
  return getBookingSlotsForDay(hours, day);
}

/**
 * Format availability summary for display
 * Returns a human-readable summary like "Lun, Mié, Vie 10AM-2PM"
 */
export function formatAvailabilitySummary(hours: AvailableHours): string {
  const availableDays = getAvailableDays(hours);

  if (availableDays.length === 0) {
    return 'Sin disponibilidad';
  }

  const dayLabelsShort: Record<DayOfWeek, string> = {
    monday: 'Lun',
    tuesday: 'Mar',
    wednesday: 'Mié',
    thursday: 'Jue',
    friday: 'Vie',
    saturday: 'Sáb',
    sunday: 'Dom',
  };

  const daysList = availableDays.map(d => dayLabelsShort[d]).join(', ');
  return daysList;
}

/**
 * Get formatted slots for a day for display
 */
export function formatDaySlots(hours: AvailableHours, day: DayOfWeek): string {
  const slots = getSlotsForDay(hours, day);
  if (slots.length === 0) return '';

  const slotLabels: Record<SlotRange, string> = {
    '06:00-10:00': '6-10 AM',
    '10:00-14:00': '10AM-2PM',
    '14:00-18:00': '2-6 PM',
    '18:00-22:00': '6-10 PM',
  };

  return slots.map(s => slotLabels[s]).join(', ');
}

/**
 * Toggle a slot in the available hours
 */
export function toggleSlot(
  hours: AvailableHours,
  day: DayOfWeek,
  slot: SlotRange
): AvailableHours {
  const currentSlots = hours[day] || [];
  const hasSlot = currentSlots.includes(slot);

  const newSlots = hasSlot
    ? currentSlots.filter(s => s !== slot)
    : [...currentSlots, slot].sort();

  return {
    ...hours,
    [day]: newSlots.length > 0 ? newSlots : undefined,
  };
}

/**
 * Check if availability is empty
 */
export function isAvailabilityEmpty(hours: AvailableHours): boolean {
  return getAvailableDays(hours).length === 0;
}
