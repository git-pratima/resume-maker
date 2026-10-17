import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  template: `
    <footer>
      <div class="shell footer-content">
        <p>
          <img class="footer-logo" src="/logo.png" alt="MakeMyResume — We Build Your Career" width="64" height="64">
        </p>
        <nav aria-label="Footer navigation">
          <a routerLink="/templates">Templates</a>
          <a routerLink="/builder">Builder</a>
          <a routerLink="/" [fragment]="'faq'">FAQ</a>
        </nav>
      </div>
    </footer>
  `,
  styleUrl: './site-footer.component.scss'
})
export class SiteFooterComponent {}
