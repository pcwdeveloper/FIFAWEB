const SPORT_ICONS: Record<string, string> = {
  badminton: 'sports_tennis',
  tennis: 'sports_tennis',
  football: 'sports_soccer',
  soccer: 'sports_soccer',
  cricket: 'sports_cricket',
  basketball: 'sports_basketball',
  volleyball: 'sports_volleyball',
  hockey: 'sports_hockey',
  baseball: 'sports_baseball',
  golf: 'sports_golf',
  rugby: 'sports_rugby',
  'table tennis': 'sports_tennis',
};

export function sportIcon(sportName: string): string {
  return SPORT_ICONS[sportName.trim().toLowerCase()] ?? 'sports';
}
