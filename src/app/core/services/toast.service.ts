import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  action?: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<Toast[]>([]);

  /** Drop-in replacement for `MatSnackBar#open` — same (message, action, { duration }) shape. */
  open(message: string, action?: string, opts?: { duration?: number }): void {
    const id = ++this.nextId;
    const duration = opts?.duration ?? 4000;
    this.toasts.update((list) => [...list, { id, message, action, duration }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
