import { Component, computed, ElementRef, inject, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { TemplateService } from '../../core/template.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="shell builder-page section">
      <div class="page-heading">
        <div>
          <p class="eyebrow">Resume builder</p>
          <h1>Build your resume.</h1>
        </div>
        <div class="template-picker" aria-label="Selected template">
          @for (template of templates.templates; track template.id) {
            <button
              type="button"
              class="template-button"
              [class.active]="selectedTemplate()?.id === template.id"
              [style.--accent]="template.accent"
              (click)="selectTemplate(template.id)"
            >
              {{ template.name }}
            </button>
          }
        </div>
      </div>

      <div class="builder-layout">
        <form class="resume-form" [formGroup]="form">
          <div class="form-grid two-up">
            <label>
              <span>Full name</span>
              <input formControlName="fullName" />
            </label>
            <label>
              <span>Professional title</span>
              <input formControlName="title" />
            </label>
            <label>
              <span>Email</span>
              <input formControlName="email" type="email" />
            </label>
            <label>
              <span>Phone</span>
              <input formControlName="phone" />
            </label>
            <label>
              <span>Location</span>
              <input formControlName="location" />
            </label>
            <label>
              <span>Portfolio or website</span>
              <input formControlName="website" />
            </label>
          </div>

          <label>
            <span>Professional summary</span>
            <textarea formControlName="summary"></textarea>
          </label>

          <label>
            <span>Experience</span>
            <textarea formControlName="experience"></textarea>
          </label>

          <label>
            <span>Education</span>
            <textarea formControlName="education"></textarea>
          </label>

          <label>
            <span>Projects</span>
            <textarea formControlName="projects"></textarea>
          </label>

          <label>
            <span>Skills</span>
            <textarea formControlName="skills"></textarea>
          </label>

          <div class="actions-row">
            <button type="button" class="button button-secondary" (click)="resetForm()">Reset</button>
            <button type="button" class="button" (click)="downloadPdf()">Download PDF</button>
            <button type="button" class="button" (click)="downloadDocx()">Download DOCX</button>
          </div>
        </form>

        <div class="preview-panel">
          <div class="preview-toolbar">
            <span>Live preview</span>
            <span class="preview-template">{{ selectedTemplate()?.name ?? 'Classic' }}</span>
          </div>

          <div #resumePreview class="resume-preview" [attr.data-template]="selectedTemplate()?.id ?? 'classic'">
            <header class="resume-header">
              <div>
                <h2>{{ form.get('fullName')?.value || 'Your Name' }}</h2>
                <p>{{ form.get('title')?.value || 'Professional Title' }}</p>
              </div>
              <div class="resume-contact">
                <span>{{ form.get('email')?.value || 'you@example.com' }}</span>
                <span>{{ form.get('phone')?.value || '+1 (555) 123-4567' }}</span>
                <span>{{ form.get('location')?.value || 'City, Country' }}</span>
              </div>
            </header>

            <div class="resume-body">
              <section>
                <h3>Summary</h3>
                <p>{{ form.get('summary')?.value || 'Add a concise statement about your experience and strengths.' }}</p>
              </section>

              <section>
                <h3>Experience</h3>
                @for (entry of splitLines(form.get('experience')?.value); track entry) {
                  <p>{{ entry }}</p>
                }
              </section>

              <section>
                <h3>Education</h3>
                @for (entry of splitLines(form.get('education')?.value); track entry) {
                  <p>{{ entry }}</p>
                }
              </section>

              <section>
                <h3>Projects</h3>
                @for (entry of splitLines(form.get('projects')?.value); track entry) {
                  <p>{{ entry }}</p>
                }
              </section>

              <section>
                <h3>Skills</h3>
                <p>{{ form.get('skills')?.value || 'Add your most relevant technical and soft skills.' }}</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './builder.page.scss'
})
export class BuilderPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  protected readonly templates = inject(TemplateService);
  protected readonly selectedTemplate = computed(() => this.templates.selected());

  protected readonly form = this.fb.group({
    fullName: ['Jordan Lee'],
    title: ['Product Designer'],
    email: ['jordan.lee@email.com'],
    phone: ['+1 (415) 555-0187'],
    location: ['San Francisco, CA'],
    website: ['portfolio.jordanlee.design'],
    summary: ['Product designer with 6+ years of experience creating inclusive user journeys for SaaS products and mobile experiences.'],
    experience: ['Senior Product Designer · Northstar Labs · 2022–Present\nDesigned onboarding and dashboard flows that improved activation by 24%.\nLed A/B testing across three key conversion journeys.'],
    education: ['B.A. in Interaction Design · University of Washington · 2018'],
    projects: ['Resume Maker · Built a responsive resume generator with live preview and export features.\nPortfolio Redesign · Reworked design system for 3 product lines and launched an improved mobile experience.'],
    skills: ['UX strategy, Figma, Design systems, Prototyping, Research synthesis, Product thinking']
  });

  private readonly previewRef = viewChild<ElementRef<HTMLDivElement>>('resumePreview');

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const templateId = params.get('template');
      if (templateId) {
        this.templates.select(templateId);
      }
    });
  }

  protected selectTemplate(templateId: string): void {
    this.templates.select(templateId);
  }

  protected resetForm(): void {
    this.form.reset({
      fullName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      summary: '',
      experience: '',
      education: '',
      projects: '',
      skills: ''
    });
  }

  protected splitLines(value: string | null | undefined): string[] {
    return (value ?? '')
      .split(/\n|\r\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  protected async downloadPdf(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    const element = this.previewRef();
    if (!element) {
      return;
    }

    const html2pdf = (await import('html2pdf.js')).default;
    const options = {
      margin: 10,
      filename: `${(this.form.get('fullName')?.value || 'resume').trim() || 'resume'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    await html2pdf().set(options).from(element.nativeElement).save();
  }

  protected async downloadDocx(): Promise<void> {
    const fullName = (this.form.get('fullName')?.value || 'Resume').trim() || 'Resume';

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({ children: [new TextRun({ text: fullName, bold: true, size: 32, color: '1d4ed8' })], spacing: { after: 200 } }),
            new Paragraph({ text: `${this.form.get('title')?.value || ''}` }),
            new Paragraph({ text: `${this.form.get('email')?.value || ''} | ${this.form.get('phone')?.value || ''}` }),
            new Paragraph({ text: `${this.form.get('location')?.value || ''} | ${this.form.get('website')?.value || ''}` }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: 'Summary', heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: this.form.get('summary')?.value || '' }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: 'Experience', heading: HeadingLevel.HEADING_2 }),
            ...this.splitLines(this.form.get('experience')?.value).map((line) => new Paragraph({ text: line })),
            new Paragraph({ text: '' }),
            new Paragraph({ text: 'Education', heading: HeadingLevel.HEADING_2 }),
            ...this.splitLines(this.form.get('education')?.value).map((line) => new Paragraph({ text: line })),
            new Paragraph({ text: '' }),
            new Paragraph({ text: 'Projects', heading: HeadingLevel.HEADING_2 }),
            ...this.splitLines(this.form.get('projects')?.value).map((line) => new Paragraph({ text: line })),
            new Paragraph({ text: '' }),
            new Paragraph({ text: 'Skills', heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: this.form.get('skills')?.value || '' })
          ]
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fullName.replace(/\s+/g, '-').toLowerCase()}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
