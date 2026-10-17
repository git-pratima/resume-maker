import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';
import { ResumeTemplate, TemplateService } from '../../core/template.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="shell page section">
      <div class="page-head">
        <div>
          <p class="eyebrow">Resume templates</p>
          <h1>Choose a layout that fits your story.</h1>
        </div>
        @if (templates.selected(); as selected) {
          <div class="selection-pill">
            <span>Current selection</span>
            <strong>{{ selected.name }}</strong>
          </div>
        }
      </div>

      <div class="filters" aria-label="Template filters">
        <label class="field">
          <span>Category</span>
          <select [value]="category()" (change)="category.set($any($event.target).value)">
            <option value="All">All</option>
            @for (item of categories; track item) {
              <option [value]="item">{{ item }}</option>
            }
          </select>
        </label>

        <label class="field">
          <span>Layout</span>
          <select [value]="layout()" (change)="layout.set($any($event.target).value)">
            <option value="All">All</option>
            @for (item of layouts; track item) {
              <option [value]="item">{{ item }}</option>
            }
          </select>
        </label>

        <label class="field">
          <span>Sort by</span>
          <select [value]="sortBy()" (change)="sortBy.set($any($event.target).value)">
            <option value="name">Name</option>
            <option value="category">Category</option>
          </select>
        </label>

      </div>

      @if (filteredTemplates().length) {
        <div class="template-grid">
          @for (template of filteredTemplates(); track template.id) {
            <article class="template-card" [class.is-selected]="templates.selected()?.id === template.id">
              <div class="template-preview" [style.--accent]="template.accent" aria-hidden="true">
                <div class="template-preview-sheet" [class.two-column]="template.layout === 'Two-column'">
                  <header class="sample-header">
                    <strong>{{ template.sample.name }}</strong>
                    <span>{{ template.sample.contact }}</span>
                    <small>{{ template.sample.title }}</small>
                  </header>
                  <div class="sample-summary">
                    <b>PROFILE</b>
                    <p>{{ template.sample.summary }}</p>
                  </div>
                  <div class="sample-details">
                    <div>
                      <b>EXPERIENCE</b>
                      <p>{{ template.sample.experience }}</p>
                    </div>
                    <div>
                      <b>SKILLS</b>
                      <p>{{ template.sample.skills }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div class="card-header">
                  <div>
                    <h2>{{ template.name }}</h2>
                    <p class="meta">{{ template.category }} · {{ template.layout }}</p>
                  </div>
                  @if (template.atsFriendly) {
                    <span class="ats-badge">ATS</span>
                  }
                </div>
                <p class="description">{{ template.description }}</p>
                <div class="card-actions">
                  <a class="button button-secondary button-small" [routerLink]="['/builder']" [queryParams]="{ template: template.id }">Preview</a>
                  <button type="button" class="button button-small" (click)="useTemplate(template)">
                    {{ templates.selected()?.id === template.id ? 'Selected' : 'Use this template' }}
                  </button>
                </div>
              </div>
            </article>
          }
        </div>
      } @else {
        <div class="empty-state">
          <h3>No templates match these filters.</h3>
          <p>Try choosing a different category or layout.</p>
        </div>
      }
    </section>
  `,
  styleUrl: './templates.page.scss'
})
export class TemplatesPage {
  protected readonly templates = inject(TemplateService);
  protected readonly category = signal('All');
  protected readonly layout = signal('All');
  protected readonly sortBy = signal<'name' | 'category'>('name');

  protected readonly categories = Array.from(new Set(this.templates.templates.map((template) => template.category)));
  protected readonly layouts = Array.from(new Set(this.templates.templates.map((template) => template.layout)));

  constructor() {
    inject(SeoService).setPage({
      title: 'Free ATS-Friendly Resume Templates | MakeMyResume',
      description:
        'Browse free, professional ATS-friendly resume templates for students and experienced professionals. Choose a layout and customize your resume with MakeMyResume.'
    });
  }

  protected readonly filteredTemplates = computed(() => {
    const category = this.category();
    const layout = this.layout();
    const sortBy = this.sortBy();

    let results = this.templates.templates.filter((template) => {
      const matchesCategory = category === 'All' || template.category === category;
      const matchesLayout = layout === 'All' || template.layout === layout;
      return matchesCategory && matchesLayout;
    });

    results = [...results].sort((a, b) => {
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });

    return results;
  });

  protected useTemplate(template: ResumeTemplate): void {
    this.templates.select(template.id);
  }
}
