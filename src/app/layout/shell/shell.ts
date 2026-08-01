import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

const MODE_ICON: Record<string, string> = {
  system: 'brightness_auto',
  light: 'light_mode',
  dark: 'dark_mode',
};

const MODE_LABEL: Record<string, string> = {
  system: 'Theme: matching system',
  light: 'Theme: light',
  dark: 'Theme: dark',
};

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);

  themeIcon(): string {
    return MODE_ICON[this.themeService.mode()];
  }

  themeLabel(): string {
    return MODE_LABEL[this.themeService.mode()];
  }

  toggleTheme(): void {
    this.themeService.cycle();
  }

  logout(): void {
    this.authService.logout();
  }
}
