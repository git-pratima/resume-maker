import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  template: `
    <footer>
      <div class="shell footer-content">
        <p>
          <img class="footer-logo" src="/logo.png" alt="" width="40" height="40">
          <strong>MakeMyResume</strong>
          <span>Build your resume. Showcase your potential.</span>
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
