import { Component, computed, ElementRef, inject, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { TemplateService } from '../../core/template.service';

interface StructuredProject {
  key: string;
  number: number;
  client: string;
  name: string;
  type: string;
  technologies: string;
  database: string;
  role: string;
  tools: string;
  responsibilities: string;
  description: string;
}

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

          @if (isStructuredTemplate()) {
            <div class="reference-fields">
              <label>
                <span>Career objective</span>
                <textarea formControlName="referenceObjective"></textarea>
              </label>

              <div class="form-grid two-up">
                <label>
                  <span>Total experience</span>
                  <input formControlName="referenceYears" />
                </label>
                <label>
                  <span>GitHub or profile link</span>
                  <input formControlName="referenceGithub" />
                </label>
              </div>

              <label>
                <span>Experience summary (one point per line)</span>
                <textarea formControlName="referenceExperienceSummary"></textarea>
              </label>

              <div class="reference-field-group">
                <h2>Technical skills</h2>
                <label>
                  <span>Languages and technologies</span>
                  <textarea formControlName="referenceTechnologies"></textarea>
                </label>
                <label>
                  <span>Tools</span>
                  <textarea formControlName="referenceTools"></textarea>
                </label>
                <label>
                  <span>Databases</span>
                  <textarea formControlName="referenceDatabases"></textarea>
                </label>
                <label>
                  <span>Operating systems</span>
                  <textarea formControlName="referenceOperatingSystems"></textarea>
                </label>
              </div>

              <div class="reference-field-group">
                <h2>Work history</h2>
                <label>
                  <span>Work experience (one point per line)</span>
                  <textarea formControlName="referenceWorkHistory"></textarea>
                </label>
              </div>

              <div class="reference-field-group">
                <h2>Professional experience and training</h2>
                <label>
                  <span>Training or experience details</span>
                  <textarea formControlName="referenceTraining"></textarea>
                </label>
                <label>
                  <span>Technologies used</span>
                  <textarea formControlName="referenceTrainingTechnologies"></textarea>
                </label>
                <label>
                  <span>Tools used</span>
                  <textarea formControlName="referenceTrainingTools"></textarea>
                </label>
              </div>

              <div class="reference-field-group">
                <h2>Project details</h2>
                @for (project of projectForms; track project.key; let index = $index) {
                  <fieldset [formGroupName]="project.key">
                    <legend>Project {{ index + 1 }}</legend>
                    <label>
                      <span>Client</span>
                      <input formControlName="client" />
                    </label>
                    <label>
                      <span>Project name</span>
                      <input formControlName="name" />
                    </label>
                    <label>
                      <span>Project type</span>
                      <input formControlName="type" />
                    </label>
                    <label>
                      <span>Technologies</span>
                      <input formControlName="technologies" />
                    </label>
                    <label>
                      <span>Database</span>
                      <input formControlName="database" />
                    </label>
                    <label>
                      <span>Role</span>
                      <input formControlName="role" />
                    </label>
                    <label>
                      <span>Tools</span>
                      <input formControlName="tools" />
                    </label>
                    <label>
                      <span>Responsibilities (one point per line)</span>
                      <textarea formControlName="responsibilities"></textarea>
                    </label>
                    <label>
                      <span>Description</span>
                      <textarea formControlName="description"></textarea>
                    </label>
                  </fieldset>
                }
              </div>

              <div class="form-grid two-up">
                <label>
                  <span>Declaration</span>
                  <textarea formControlName="referenceDeclaration"></textarea>
                </label>
                <label>
                  <span>Place</span>
                  <input formControlName="referencePlace" />
                </label>
                <label>
                  <span>Signature</span>
                  <input formControlName="referenceSignature" />
                </label>
              </div>
            </div>
          } @else {
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
          }

        </form>

        <div class="preview-panel" [class.reference-template-active]="isStructuredTemplate()">
          <div class="preview-toolbar">
            <span>Live preview</span>
            <span class="preview-template">{{ selectedTemplate()?.name ?? 'Classic' }}</span>
          </div>

          <div #resumePreview class="resume-preview" [attr.data-template]="selectedTemplate()?.id ?? 'classic'">
            @if (isStructuredTemplate()) {
              <article class="structured-resume">
                <header class="structured-header">
                  <div class="traditional-identity">
                    <h2>{{ form.controls.fullName.value || 'Your Name' }}</h2>
                    <p>{{ form.controls.title.value || 'Professional Title' }}</p>
                  </div>
                  <div class="structured-contact">
                    @if (form.controls.location.value) { <span>{{ form.controls.location.value }}</span> }
                    @if (form.controls.email.value) { <span>{{ form.controls.email.value }}</span> }
                    @if (form.controls.phone.value) { <span>{{ form.controls.phone.value }}</span> }
                    @if (form.controls.website.value) { <span>{{ form.controls.website.value }}</span> }
                  </div>
                </header>

                <div class="traditional-box-group">
                  <h3 class="traditional-section-title">Objective</h3>
                  <section class="structured-box traditional-objective-value">
                    <p>{{ form.controls.referenceObjective.value }}</p>
                  </section>
                </div>

                <div class="traditional-experience-group">
                  <h3 class="traditional-section-title">Experience Summary</h3>
                  <section class="structured-box traditional-experience">
                    <div class="traditional-experience-content">
                      @if (form.controls.referenceYears.value) {
                        <p class="structured-years">{{ form.controls.referenceYears.value }}</p>
                      }
                      <ul>
                        @for (entry of splitLines(form.controls.referenceExperienceSummary.value); track $index) {
                          <li>{{ entry }}</li>
                        }
                      </ul>
                    </div>
                  </section>
                </div>

                <section class="structured-section traditional-section">
                  <h3 class="traditional-section-title">Technical Skills</h3>
                  <div class="structured-skill-grid">
                    @for (skill of skillCategories; track skill.label) {
                      @if (form.controls[skill.control].value) {
                        <div class="structured-skill-row">
                          <strong>{{ skill.label }}</strong>
                          <span>{{ form.controls[skill.control].value }}</span>
                        </div>
                      }
                    }
                  </div>
                </section>

                <section class="structured-section traditional-section">
                  <h3 class="traditional-section-title">Work Experience</h3>
                  <ul class="traditional-work-table">
                    @for (entry of splitLines(form.controls.referenceWorkHistory.value); track $index) {
                      <li>{{ entry }}</li>
                    }
                  </ul>
                </section>

                <section class="structured-section traditional-section">
                  <h3 class="traditional-section-title">Professional Experience</h3>
                  @if (form.controls.referenceTraining.value) {
                    <p>{{ form.controls.referenceTraining.value }}</p>
                  }
                  @if (form.controls.referenceTrainingTechnologies.value) {
                    <p><strong>Technologies:</strong> {{ form.controls.referenceTrainingTechnologies.value }}</p>
                  }
                  @if (form.controls.referenceTrainingTools.value) {
                    <p><strong>Tools:</strong> {{ form.controls.referenceTrainingTools.value }}</p>
                  }
                </section>

                @for (project of structuredProjects; track project.key) {
                  @if (hasProjectContent(project)) {
                    <section class="structured-project">
                      <h3 class="traditional-section-title">Project - {{ project.number }}</h3>
                      <dl>
                        @for (field of projectFields(project); track field.label) {
                          @if (field.value) {
                            <div>
                              <dt>{{ field.label }}</dt>
                              <dd>{{ field.value }}</dd>
                            </div>
                          }
                        }
                      </dl>
                      @if (project.responsibilities) {
                        <div class="structured-project-copy">
                          <strong>Responsibilities:</strong>
                          <ul>
                            @for (entry of splitLines(project.responsibilities); track $index) {
                              <li>{{ entry }}</li>
                            }
                          </ul>
                        </div>
                      }
                      @if (project.description) {
                        <p class="structured-project-copy"><strong>Description:</strong> {{ project.description }}</p>
                      }
                    </section>
                  }
                }

                <footer class="structured-footer">
                  @if (form.controls.referenceGithub.value) {
                    <p><strong>GitHub:</strong> {{ form.controls.referenceGithub.value }}</p>
                  }
                  @if (form.controls.referenceDeclaration.value) {
                    <p><strong>Declaration:</strong> {{ form.controls.referenceDeclaration.value }}</p>
                  }
                  <div class="structured-signoff">
                    @if (form.controls.referencePlace.value) { <span>Place: {{ form.controls.referencePlace.value }}</span> }
                    @if (form.controls.referenceSignature.value) { <span>Signature: {{ form.controls.referenceSignature.value }}</span> }
                  </div>
                </footer>
              </article>
            } @else {
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
            }
          </div>
          <div class="actions-row preview-actions">
            <button type="button" class="button button-secondary" (click)="resetForm()">Reset</button>
            <button type="button" class="button" (click)="downloadPdf()">Download PDF</button>
            <button type="button" class="button" (click)="downloadDocx()">Download DOCX</button>
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
  protected readonly isStructuredTemplate = computed(
    () => this.selectedTemplate()?.id === 'structured-professional'
  );
  protected readonly skillCategories = [
    { label: 'Languages and technologies', control: 'referenceTechnologies' },
    { label: 'Tools', control: 'referenceTools' },
    { label: 'Databases', control: 'referenceDatabases' },
    { label: 'Operating systems', control: 'referenceOperatingSystems' }
  ] as const;
  protected readonly projectForms = [
    { key: 'projectOne', number: 1 },
    { key: 'projectTwo', number: 2 },
    { key: 'projectThree', number: 3 }
  ] as const;

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
    skills: ['UX strategy, Figma, Design systems, Prototyping, Research synthesis, Product thinking'],
    referenceObjective: [''],
    referenceYears: [''],
    referenceExperienceSummary: [''],
    referenceTechnologies: [''],
    referenceTools: [''],
    referenceDatabases: [''],
    referenceOperatingSystems: [''],
    referenceWorkHistory: [''],
    referenceTraining: [''],
    referenceTrainingTechnologies: [''],
    referenceTrainingTools: [''],
    referenceGithub: [''],
    referenceDeclaration: [''],
    referencePlace: [''],
    referenceSignature: [''],
    projectOne: this.createProjectGroup(),
    projectTwo: this.createProjectGroup(),
    projectThree: this.createProjectGroup()
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
    this.form.reset();
  }

  protected get structuredProjects(): StructuredProject[] {
    return this.projectForms.map(({ key, number }) => {
      const project = this.form.controls[key].getRawValue();
      return {
        key,
        number,
        client: project.client ?? '',
        name: project.name ?? '',
        type: project.type ?? '',
        technologies: project.technologies ?? '',
        database: project.database ?? '',
        role: project.role ?? '',
        tools: project.tools ?? '',
        responsibilities: project.responsibilities ?? '',
        description: project.description ?? ''
      };
    });
  }

  protected hasProjectContent(project: StructuredProject): boolean {
    return Object.entries(project).some(([key, value]) => key !== 'key' && key !== 'number' && Boolean(value));
  }

  protected projectFields(project: StructuredProject): Array<{ label: string; value: string }> {
    return [
      { label: 'Client', value: project.client },
      { label: 'Project', value: project.name },
      { label: 'Type', value: project.type },
      { label: 'Technology Used', value: project.technologies },
      { label: 'Database', value: project.database },
      { label: 'Role', value: project.role },
      { label: 'Tools', value: project.tools }
    ];
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
      margin: this.isStructuredTemplate() ? 0 : 2,
      filename: `${(this.form.get('fullName')?.value || 'resume').trim() || 'resume'}.pdf`,
      // html2pdf first paints the resume into a canvas. High-resolution PNGs can
      // exceed some PDF viewers' canvas/image limits and display as coloured
      // stripes. A high-quality JPEG at print-safe resolution is reliable across
      // browsers and still keeps the small resume text crisp.
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const, compress: false },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    await html2pdf().set(options).from(element.nativeElement).save();
  }

  protected async downloadDocx(): Promise<void> {
    const fullName = (this.form.get('fullName')?.value || 'Resume').trim() || 'Resume';
    const children = this.isStructuredTemplate()
      ? this.structuredDocxChildren(fullName)
      : [
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
        ];

    const doc = new Document({
      sections: [
        {
          children
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

  private createProjectGroup() {
    return this.fb.group({
      client: [''],
      name: [''],
      type: [''],
      technologies: [''],
      database: [''],
      role: [''],
      tools: [''],
      responsibilities: [''],
      description: ['']
    });
  }

  private structuredDocxChildren(fullName: string): Paragraph[] {
    const paragraphs = [
      new Paragraph({
        children: [new TextRun({ text: fullName, bold: true, size: 32, color: '1f2937' })],
        spacing: { after: 100 }
      }),
      new Paragraph({ text: this.form.controls.title.value ?? '' }),
      new Paragraph({
        text: [
          this.form.controls.location.value,
          this.form.controls.email.value,
          this.form.controls.phone.value,
          this.form.controls.website.value
        ].filter(Boolean).join(' | '),
        spacing: { after: 160 }
      })
    ];
    const addSection = (title: string, content: string[]): void => {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 21 })],
          shading: { fill: 'D1D5DB' },
          spacing: { before: 120, after: 60 }
        }),
        ...content.filter(Boolean).map((line) => new Paragraph({ text: line, spacing: { after: 40 } }))
      );
    };

    addSection('Career Objective', [this.form.controls.referenceObjective.value ?? '']);
    addSection('Experience Summary', [
      this.form.controls.referenceYears.value ?? '',
      ...this.splitLines(this.form.controls.referenceExperienceSummary.value)
    ]);
    addSection('Technical Skills', this.skillCategories.map(({ label, control }) =>
      `${label}: ${this.form.controls[control].value ?? ''}`
    ));
    addSection('Work Experience', this.splitLines(this.form.controls.referenceWorkHistory.value));
    addSection('Professional Experience and Training', [
      this.form.controls.referenceTraining.value ?? '',
      `Technologies: ${this.form.controls.referenceTrainingTechnologies.value ?? ''}`,
      `Tools: ${this.form.controls.referenceTrainingTools.value ?? ''}`
    ]);

    for (const project of this.structuredProjects) {
      if (!this.hasProjectContent(project)) {
        continue;
      }
      addSection(`Project ${project.number}`, [
        ...this.projectFields(project).map(({ label, value }) => `${label}: ${value}`),
        ...this.splitLines(project.responsibilities).map((line) => `Responsibility: ${line}`),
        project.description ? `Description: ${project.description}` : ''
      ]);
    }
    addSection('Additional Details', [
      this.form.controls.referenceGithub.value ? `GitHub: ${this.form.controls.referenceGithub.value}` : '',
      this.form.controls.referenceDeclaration.value ? `Declaration: ${this.form.controls.referenceDeclaration.value}` : '',
      this.form.controls.referencePlace.value ? `Place: ${this.form.controls.referencePlace.value}` : '',
      this.form.controls.referenceSignature.value ? `Signature: ${this.form.controls.referenceSignature.value}` : ''
    ]);
    return paragraphs;
  }
}
