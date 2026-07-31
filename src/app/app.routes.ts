import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/unauthorized/unauthorized').then((m) => m.Unauthorized),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    canActivate: [authGuard],
    children: [
      {
        path: 'player',
        canActivate: [roleGuard],
        data: { roles: ['PLAYER'] },
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () =>
              import('./features/player/player-dashboard/player-dashboard').then((m) => m.PlayerDashboard),
          },
          {
            path: 'venues/:id',
            pathMatch: 'full',
            loadComponent: () =>
              import('./features/player/venue-courts/venue-courts').then((m) => m.VenueCourts),
          },
          {
            path: 'venues/:id/courts/:courtId',
            loadComponent: () =>
              import('./features/player/court-slots-browse/court-slots-browse').then((m) => m.CourtSlotsBrowse),
          },
          {
            path: 'bookings',
            loadComponent: () =>
              import('./features/player/my-bookings/my-bookings').then((m) => m.MyBookings),
          },
        ],
      },
      {
        path: 'owner',
        canActivate: [roleGuard],
        data: { roles: ['VENUE_OWNER'] },
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () =>
              import('./features/owner/owner-dashboard/owner-dashboard').then((m) => m.OwnerDashboard),
          },
          {
            path: 'venues/:id',
            pathMatch: 'full',
            loadComponent: () =>
              import('./features/owner/venue-detail/venue-detail').then((m) => m.VenueDetail),
          },
          {
            path: 'venues/:venueId/sports/:sportId/courts',
            loadComponent: () =>
              import('./features/owner/sport-courts/sport-courts').then((m) => m.SportCourts),
          },
          {
            path: 'venues/:venueId/courts/:courtId/slots',
            loadComponent: () =>
              import('./features/owner/court-slots/court-slots').then((m) => m.CourtSlots),
          },
          {
            path: 'bookings',
            loadComponent: () =>
              import('./features/owner/owner-bookings/owner-bookings').then((m) => m.OwnerBookings),
          },
        ],
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () =>
              import('./features/admin/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
          },
          {
            path: 'venues',
            loadComponent: () =>
              import('./features/admin/venue-approval/venue-approval').then((m) => m.VenueApproval),
          },
          {
            path: 'sports',
            loadComponent: () =>
              import('./features/admin/sport-management/sport-management').then((m) => m.SportManagement),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
