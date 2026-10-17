import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/theme.service';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <div class="shell header-content">
        <a class="brand" routerLink="/" aria-label="MakeMyResume home">
          <img class="brand-logo" src="/logo.png" alt="" width="48" height="48">
          <span>MakeMyResume</span>
        </a>

        <nav aria-label="Main navigation">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
          <a routerLink="/templates" routerLinkActive="active">Templates</a>
          <a routerLink="/builder" routerLinkActive="active">Builder</a>
          <a routerLink="/" [fragment]="'tips'" routerLinkActive="active">Resume tips</a>
          <a routerLink="/" [fragment]="'faq'" routerLinkActive="active">FAQ</a>
        </nav>

        <div class="header-actions">
          <button class="icon-button" type="button" (click)="theme.toggle()" [attr.aria-label]="theme.theme() === 'light' ? 'Switch to dark theme' : 'Switch to light theme'">
            {{ theme.theme() === 'light' ? '☾' : '☀' }}
          </button>
          <a class="button button-small" routerLink="/builder">Create resume</a>
        </div>
      </div>
    </header>
  `,
  styleUrl: './site-header.component.scss'
})
export class SiteHeaderComponent {
  protected readonly theme = inject(ThemeService);
}
