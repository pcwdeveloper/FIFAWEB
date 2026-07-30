import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'fifa_theme_mode';
const CYCLE: ThemeMode[] = ['system', 'light', 'dark'];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>(this.readStored());

  constructor() {
    this.apply(this.mode());
  }

  setMode(mode: ThemeMode): void {
    localStorage.setItem(STORAGE_KEY, mode);
    this.mode.set(mode);
    this.apply(mode);
  }

  /** Cycles system -> light -> dark -> system, for a single toolbar toggle button. */
  cycle(): void {
    const next = CYCLE[(CYCLE.indexOf(this.mode()) + 1) % CYCLE.length];
    this.setMode(next);
  }

  private readStored(): ThemeMode {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  }

  private apply(mode: ThemeMode): void {
    document.documentElement.style.colorScheme = mode === 'system' ? 'light dark' : mode;
  }
}
