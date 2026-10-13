import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
export type Theme = 'light' | 'dark';
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly theme = signal<Theme>('light');
  toggle(): void { this.theme.update((value) => value === 'light' ? 'dark' : 'light'); this.document.documentElement.dataset['theme'] = this.theme(); }
}
