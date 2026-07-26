export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED';

export interface Slot {
  id: number;
  courtId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
}

export interface SlotRequest {
  date: string;
  startTime: string;
  endTime: string;
}

export interface SlotStatusUpdateRequest {
  status: Extract<SlotStatus, 'AVAILABLE' | 'BLOCKED'>;
}
