export interface AdminStats {
  totalPlayers: number;
  totalOwners: number;
  pendingVenues: number;
  approvedVenues: number;
  rejectedVenues: number;
  totalSports: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
}

export interface OwnerStats {
  totalVenues: number;
  approvedVenues: number;
  pendingVenues: number;
  totalCourts: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
}
