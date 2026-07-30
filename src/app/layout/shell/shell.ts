import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
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
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule],
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
