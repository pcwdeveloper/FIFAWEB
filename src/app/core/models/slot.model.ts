export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED';

export type TimeOfDay = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';

export const TIME_OF_DAY_INFO: Record<TimeOfDay, { label: string; icon: string }> = {
  MORNING: { label: 'Morning', icon: 'wb_sunny' },
  AFTERNOON: { label: 'Afternoon', icon: 'light_mode' },
  EVENING: { label: 'Evening', icon: 'wb_twilight' },
  NIGHT: { label: 'Night', icon: 'nights_stay' },
};

/** Pre-filled starting point in the bulk-generate dialog — the owner can freely edit these. */
export const TIME_OF_DAY_DEFAULTS: Record<TimeOfDay, { startTime: string; endTime: string }> = {
  MORNING: { startTime: '06:00', endTime: '12:00' },
  AFTERNOON: { startTime: '12:00', endTime: '17:00' },
  EVENING: { startTime: '17:00', endTime: '21:00' },
  NIGHT: { startTime: '21:00', endTime: '23:59' },
};

export interface Slot {
  id: number;
  courtId: number;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  timeOfDay: TimeOfDay;
  status: SlotStatus;
}

export interface SlotStatusUpdateRequest {
  status: Extract<SlotStatus, 'AVAILABLE' | 'BLOCKED'>;
}

export interface BulkSlotCategoryConfig {
  enabled: boolean;
  startTime: string | null;
  endTime: string | null;
  price: number | null;
}

export interface BulkSlotRequest {
  year: number;
  month: number;
  intervalMinutes: number;
  morning: BulkSlotCategoryConfig;
  afternoon: BulkSlotCategoryConfig;
  evening: BulkSlotCategoryConfig;
  night: BulkSlotCategoryConfig;
}

export interface BulkSlotCreateResponse {
  created: Slot[];
  skippedCount: number;
}

export interface BulkSlotDeleteRequest {
  year: number;
  month: number;
  categories: TimeOfDay[];
}

export interface BulkSlotDeleteResponse {
  deletedCount: number;
  skippedCount: number;
}

export interface BulkSlotBlockRequest {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface BulkSlotBlockResponse {
  blockedCount: number;
  skippedCount: number;
}
