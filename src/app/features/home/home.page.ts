import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TemplateService } from '../../core/template.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="shell hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Build your resume with confidence</p>
          <h1>Create a Professional Resume in Minutes</h1>
          <p class="lede">
            Choose a template, enter your details, preview your resume, and download it as PDF or Word.
            No account required.
          </p>
          <div class="actions">
            <a class="button" routerLink="/builder">Create My Resume</a>
            <a class="button button-secondary" routerLink="/templates">Explore Templates</a>
          </div>
          <div class="trust-row" aria-label="Resume Maker highlights">
            <span class="badge">ATS-friendly</span>
            <span class="badge">Browser-based</span>
            <span class="badge">Instant export</span>
          </div>
        </div>

        <aside class="resume-preview-card" aria-label="Sample resume preview">
          <div class="mini-header">
            <span class="mini-dot"></span>
            <span class="mini-dot"></span>
            <span class="mini-dot"></span>
          </div>
          <div class="resume-preview mock-resume">
            <div class="mock-topbar"></div>
            <div class="mock-name-row">
              <div>
                <strong>Jordan Lee</strong>
                <span>Product Designer</span>
              </div>
              <div class="mock-meta">jordan@resume.com</div>
            </div>
            <div class="mock-lines">
              <i></i>
              <i></i>
              <i class="short"></i>
            </div>
            <div class="mock-columns">
              <div>
                <b></b>
                <b></b>
                <b class="short"></b>
              </div>
              <div>
                <b></b>
                <b></b>
                <b class="short"></b>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <section class="shell section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Featured templates</p>
          <h2>Choose a format that matches your career story.</h2>
        </div>
        <a class="text-link" routerLink="/templates">Browse all templates</a>
      </div>

      <div class="template-grid compact">
        @for (template of featuredTemplates; track template.id) {
          <article class="feature-card">
            <div class="thumb" [style.--accent]="template.accent"></div>
            <div class="card-body">
              <div class="card-head">
                <h3>{{ template.name }}</h3>
                <span class="pill-small">{{ template.layout }}</span>
              </div>
              <p>{{ template.description }}</p>
            </div>
          </article>
        }
      </div>
    </section>

    <section class="section panel-section">
      <div class="shell">
        <p class="eyebrow">How it works</p>
        <h2>From blank page to polished resume in three steps.</h2>
        <div class="steps-grid">
          <article>
            <span class="step-number">01</span>
            <h3>Select a template</h3>
            <p>Pick an original design that fits your industry, role, and level of experience.</p>
          </article>
          <article>
            <span class="step-number">02</span>
            <h3>Fill in your details</h3>
            <p>Add your summary, experience, skills, education, and projects in a clear structure.</p>
          </article>
          <article>
            <span class="step-number">03</span>
            <h3>Download and share</h3>
            <p>Preview your resume and export it as a high-quality PDF or editable Word document.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="shell section">
      <p class="eyebrow">Why it works</p>
      <h2>Everything you need to present your best profile.</h2>
      <div class="benefits-grid">
        <article>
          <h3>Professional templates</h3>
          <p>Original layouts built for students, graduates, managers, and experienced professionals.</p>
        </article>
        <article>
          <h3>Live resume preview</h3>
          <p>See the final document update instantly while you write and refine your content.</p>
        </article>
        <article>
          <h3>Fast exports</h3>
          <p>Download polished PDFs and editable DOCX files directly from the browser in seconds.</p>
        </article>
        <article>
          <h3>Privacy first</h3>
          <p>Everything stays in your current browser session; refresh and start fresh without saved data.</p>
        </article>
      </div>
    </section>

    <section id="tips" class="section panel-section">
      <div class="shell tips-layout">
        <div>
          <p class="eyebrow">Resume tips</p>
          <h2>Make every line count.</h2>
        </div>
        <ul class="tips-list">
          <li>Lead with a clear professional summary that highlights the value you bring.</li>
          <li>Focus on measurable accomplishments instead of duties and responsibilities.</li>
          <li>Tailor keywords to the role so your resume feels relevant and targeted.</li>
          <li>Keep formatting clean and consistent for maximum readability and ATS compatibility.</li>
        </ul>
      </div>
    </section>

    <section id="faq" class="shell section faq-section">
      <p class="eyebrow">FAQ</p>
      <h2>Common questions.</h2>
      <div class="faq-list">
        <div>
          <h3>Does the app save my resume?</h3>
          <p>No. Your information stays in the current browser session only and resets when the page refreshes.</p>
        </div>
        <div>
          <h3>Can I export both PDF and Word?</h3>
          <p>Yes. The builder supports direct PDF and DOCX download without a backend service.</p>
        </div>
        <div>
          <h3>Can I switch templates after editing?</h3>
          <p>Yes. You can change templates at any point while keeping your data intact during the session.</p>
        </div>
      </div>
    </section>
  `,
  styleUrl: './home.page.scss'
})
export class HomePage {
  protected readonly templates = inject(TemplateService);
  protected readonly featuredTemplates = this.templates.templates.slice(0, 3);
}
