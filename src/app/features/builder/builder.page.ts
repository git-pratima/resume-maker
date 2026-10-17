import { Component, computed, ElementRef, inject, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SeoService } from '../../core/seo.service';
import { Document as DocxDocument, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
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

interface EditableTableRow { id: string; label: string; value: string; }

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

          @if (isStudentTemplate()) {
            <div class="reference-fields student-editor">
              <p class="customization-hint">Every field below is editable. Use one line for each bullet or resume entry.</p>
              <label><span>Education heading</span><input formControlName="studentEducationTitle" /></label>
              <div class="education-editor">
                <label>
                  <span>Education</span>
                  <small>Select any text and use the Bold button, or type <code>**text**</code> to make just that part bold. Press Enter for a new line; spaces and indentation are kept exactly as typed.</small>
                  <textarea id="student-education-editor" formControlName="studentEducation" wrap="off"></textarea>
                </label>
                <button type="button" class="format-button" (click)="toggleEducationBold()"><strong>B</strong> Bold selected text</button>
              </div>
              <label><span>Technical skills heading</span><input formControlName="studentSkillsTitle" /></label>
              <label><span>Technical skills (one skill per line)</span><textarea formControlName="studentSkills"></textarea></label>
              <label><span>Certifications heading</span><input formControlName="studentCertificationsTitle" /></label>
              <label><span>Certifications (one per line)</span><textarea formControlName="studentCertifications"></textarea></label>
              <label><span>Projects heading</span><input formControlName="studentProjectsTitle" /></label>
              <label><span>Projects (one per line)</span><textarea formControlName="studentProjects"></textarea></label>
              <div class="form-grid two-up">
                <label><span>Internship heading</span><input formControlName="studentInternshipTitle" /></label>
                <label><span>Extracurricular heading</span><input formControlName="studentActivitiesTitle" /></label>
                <label><span>Internship (one item per line)</span><textarea formControlName="studentInternship"></textarea></label>
                <label><span>Activities (one item per line)</span><textarea formControlName="studentActivities"></textarea></label>
              </div>
              <label><span>Declaration heading</span><input formControlName="studentDeclarationTitle" /></label>
              <label><span>Declaration</span><textarea formControlName="studentDeclaration"></textarea></label>
              <div class="form-grid two-up">
                <label><span>Place</span><input formControlName="studentPlace" /></label>
                <label><span>Date</span><input formControlName="studentDate" /></label>
                <label><span>Signature</span><input formControlName="studentSignature" /></label>
              </div>
            </div>
          } @else if (isStructuredTemplate()) {
            <div class="reference-fields">
              @if (isTraditionalC()) {
                <label>
                  <span>Objective title</span>
                  <input [value]="sectionTitle('objective', 'Objective')" (input)="updateSectionTitle('objective', $any($event.target).value)" />
                </label>
              }
              <label>
                <span>Career objective</span>
                <textarea formControlName="referenceObjective"></textarea>
              </label>

              <div class="form-grid two-up">
                @if (isTraditionalC()) {
                  <label>
                    <span>Experience summary title</span>
                    <input [value]="sectionTitle('experienceSummary', 'Experience Summary')" (input)="updateSectionTitle('experienceSummary', $any($event.target).value)" />
                  </label>
                }
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
                @if (isTraditionalC()) {
                  <label>
                    <span>Technical skills title</span>
                    <input [value]="sectionTitle('technicalSkills', 'Technical Skills')" (input)="updateSectionTitle('technicalSkills', $any($event.target).value)" />
                  </label>
                  <p class="customization-hint">Edit, remove, or add rows for the Traditional-C technical-skills table.</p>
                  @for (row of technicalSkillRows(); track row.id) {
                    <div class="editable-table-row">
                      <input [value]="row.label" aria-label="Technical skill row label" (input)="updateTechnicalSkillRow(row.id, 'label', $any($event.target).value)" />
                      <input [value]="row.value" aria-label="Technical skill row value" (input)="updateTechnicalSkillRow(row.id, 'value', $any($event.target).value)" />
                      <button type="button" class="button button-secondary button-small" (click)="removeTechnicalSkillRow(row.id)">Remove</button>
                    </div>
                  }
                  <button type="button" class="button button-secondary add-project-button" (click)="addTechnicalSkillRow()">Add skill row</button>
                } @else {
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
                }
              </div>

              <div class="reference-field-group">
                <h2>Work history</h2>
                @if (isTraditionalC()) {
                  <label>
                    <span>Work experience title</span>
                    <input [value]="sectionTitle('workExperience', 'Work Experience')" (input)="updateSectionTitle('workExperience', $any($event.target).value)" />
                  </label>
                }
                <label>
                  <span>Work experience (one point per line)</span>
                  <textarea formControlName="referenceWorkHistory"></textarea>
                </label>
              </div>

              <div class="reference-field-group">
                <h2>Professional experience and training</h2>
                @if (isTraditionalC()) {
                  <label>
                    <span>Professional experience title</span>
                    <input [value]="sectionTitle('professionalExperience', 'Professional Experience:')" (input)="updateSectionTitle('professionalExperience', $any($event.target).value)" />
                  </label>
                }
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
                @for (project of visibleProjectForms(); track project.key; let index = $index) {
                  <fieldset [formGroupName]="project.key">
                    <legend>Project {{ index + 1 }}</legend>
                    @if (isTraditionalC()) {
                      <label>
                        <span>Project section title</span>
                        <input [value]="sectionTitle('project', 'Project')" (input)="updateSectionTitle('project', $any($event.target).value)" />
                      </label>
                      <p class="customization-hint">Customize this project table’s rows, labels, and values.</p>
                      @for (row of editableProjectRows(project.key); track row.id) {
                        <div class="editable-table-row">
                          <input [value]="row.label" aria-label="Project row label" (input)="updateProjectRow(project.key, row.id, 'label', $any($event.target).value)" />
                          <input [value]="row.value" aria-label="Project row value" (input)="updateProjectRow(project.key, row.id, 'value', $any($event.target).value)" />
                          <button type="button" class="button button-secondary button-small" (click)="removeProjectRow(project.key, row.id)">Remove</button>
                        </div>
                      }
                      <button type="button" class="button button-secondary add-project-button" (click)="addProjectRow(project.key)">Add project row</button>
                    } @else {
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
                    }
                  </fieldset>
                }
                @if (visibleProjectForms().length < projectForms.length) {
                  <button type="button" class="button button-secondary add-project-button" (click)="addProject()">
                    Add Project
                  </button>
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

          <div class="preview-viewport">
            <div
            #resumePreview
            class="resume-preview"
            [class.pdf-export]="isPdfExporting()"
            [class.traditional-c-template]="selectedTemplate()?.id === 'traditional-c'"
            [attr.data-template]="previewTemplateId()">
            @if (isStudentTemplate()) {
              <article class="student-resume">
                <header class="student-header">
                  <h2>{{ form.controls.fullName.value || 'Your Name' }}</h2>
                  <div>{{ form.controls.email.value }} &nbsp; | &nbsp; {{ form.controls.phone.value }} &nbsp; | &nbsp; {{ form.controls.website.value }} &nbsp; | &nbsp; {{ form.controls.location.value }}</div>
                </header>
                <section><h3>{{ form.controls.studentEducationTitle.value }}</h3><div class="student-education">@for (line of educationLines(form.controls.studentEducation.value); track $index) { <p [class.empty-line]="!line.trim()">@for (part of educationParts(line); track $index) { @if (part.bold) { <strong>{{ part.text }}</strong> } @else { <span>{{ part.text }}</span> } }</p> }</div></section>
                <section><h3>{{ form.controls.studentSkillsTitle.value }}</h3><ul>@for (line of splitLines(form.controls.studentSkills.value); track $index) { <li>{{ line }}</li> }</ul></section>
                <section><h3>{{ form.controls.studentCertificationsTitle.value }}</h3><ul>@for (line of splitLines(form.controls.studentCertifications.value); track $index) { <li>{{ line }}</li> }</ul></section>
                <section><h3>{{ form.controls.studentProjectsTitle.value }}</h3><ul>@for (line of splitLines(form.controls.studentProjects.value); track $index) { <li>{{ line }}</li> }</ul></section>
                <div class="student-two-column"><section><h3>{{ form.controls.studentInternshipTitle.value }}</h3><ul>@for (line of splitLines(form.controls.studentInternship.value); track $index) { <li>{{ line }}</li> }</ul></section><section><h3>{{ form.controls.studentActivitiesTitle.value }}</h3><ul>@for (line of splitLines(form.controls.studentActivities.value); track $index) { <li>{{ line }}</li> }</ul></section></div>
                <section class="student-declaration"><h3>{{ form.controls.studentDeclarationTitle.value }}</h3><p>{{ form.controls.studentDeclaration.value }}</p><p>Place: {{ form.controls.studentPlace.value }}</p><p>Date: {{ form.controls.studentDate.value }}</p><strong>{{ form.controls.studentSignature.value }}</strong></section>
              </article>
            } @else if (isStructuredTemplate()) {
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
                  <h3 class="traditional-section-title">{{ sectionTitle('objective', 'Objective') }}</h3>
                  <section class="structured-box traditional-objective-value">
                    <p>{{ form.controls.referenceObjective.value }}</p>
                  </section>
                </div>

                <div class="traditional-experience-group">
                  <h3 class="traditional-section-title">{{ sectionTitle('experienceSummary', 'Experience Summary') }}</h3>
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
                  <h3 class="traditional-section-title">{{ sectionTitle('technicalSkills', 'Technical Skills') }}</h3>
                  <div class="structured-skill-grid">
                    @for (skill of displayedTechnicalSkillRows(); track skill.id) {
                      @if (skill.value) {
                        <div class="structured-skill-row">
                          <strong>{{ skill.label }}</strong>
                          <span>{{ skill.value }}</span>
                        </div>
                      }
                    }
                  </div>
                </section>

                <section class="structured-section traditional-section">
                  <h3 class="traditional-section-title">{{ sectionTitle('workExperience', 'Work Experience') }}</h3>
                  <ul class="traditional-work-table">
                    @for (entry of splitLines(form.controls.referenceWorkHistory.value); track $index) {
                      <li>{{ entry }}</li>
                    }
                  </ul>
                </section>

                <section class="structured-section traditional-section">
                  <h3 class="traditional-section-title">{{ sectionTitle('professionalExperience', 'Professional Experience:') }}</h3>
                  @if (form.controls.referenceTraining.value) {
                    <p>{{ form.controls.referenceTraining.value }}</p>
                  }
                  @if (form.controls.referenceTrainingTechnologies.value || form.controls.referenceTrainingTools.value) {
                    <p><strong>Technology and tools used during training</strong></p>
                    <ul class="traditional-professional-list">
                      @for (entry of splitItems(form.controls.referenceTrainingTechnologies.value); track $index) {
                        <li><span class="traditional-list-marker" aria-hidden="true">➢</span>{{ entry }}</li>
                      }
                      @for (entry of splitItems(form.controls.referenceTrainingTools.value); track $index) {
                        <li><span class="traditional-list-marker" aria-hidden="true">➢</span>{{ entry }}</li>
                      }
                    </ul>
                  }
                </section>

                @for (project of structuredProjects; track project.key; let projectIndex = $index) {
                  @if (hasProjectContent(project)) {
                    <section
                      class="structured-project"
                      [class.structured-project-page-start]="projectIndex > 0"
                      [class.structured-project-page-end]="projectIndex < structuredProjects.length - 1">
                      @if (projectIndex > 0) {
                        <div class="pdf-page-start-rule" aria-hidden="true"></div>
                      }
                      <h3 class="traditional-section-title">{{ sectionTitle('project', 'Project') }} - {{ project.number }}</h3>
                      <dl>
                        @for (field of displayedProjectRows(project); track field.id) {
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
                      @if (projectIndex === structuredProjects.length - 1) {
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
                      }
                    </section>
                  }
                }

                @if (structuredProjects.length === 0) {
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
                }
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
          </div>
          <div class="actions-row preview-actions">
            <button type="button" class="button button-secondary" (click)="resetForm()">Reset</button>
            <button type="button" class="button" (click)="printResume()">Save high-quality PDF</button>
            <button type="button" class="button" (click)="downloadDocx()">Download DOCX</button>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./builder.page.scss', './traditional-c-template.scss']
})
export class BuilderPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  protected readonly templates = inject(TemplateService);
  protected readonly selectedTemplate = computed(() => this.templates.selected());
  protected readonly isStructuredTemplate = computed(
    () => ['structured-professional', 'traditional-c'].includes(this.selectedTemplate()?.id ?? '')
  );
  protected readonly isTraditionalC = computed(() => this.selectedTemplate()?.id === 'traditional-c');
  protected readonly isStudentTemplate = computed(() => this.selectedTemplate()?.id === 'student');
  protected readonly previewTemplateId = computed(() =>
    this.isStructuredTemplate() ? 'structured-professional' : (this.selectedTemplate()?.id ?? 'classic')
  );
  protected readonly skillCategories = [
    { label: 'Languages and technologies', control: 'referenceTechnologies' },
    { label: 'Tools', control: 'referenceTools' },
    { label: 'Databases', control: 'referenceDatabases' },
    { label: 'Operating systems', control: 'referenceOperatingSystems' }
  ] as const;
  private readonly customSectionTitles = signal<Record<string, string>>({});
  protected readonly technicalSkillRows = signal<EditableTableRow[]>([
    { id: 'technologies', label: 'Languages and technologies', value: 'JavaScript, TypeScript, Angular, Node.js, REST APIs' },
    { id: 'tools', label: 'Tools', value: 'Git, VS Code, Postman, Jira' },
    { id: 'databases', label: 'Databases', value: 'PostgreSQL, MySQL' },
    { id: 'operating-systems', label: 'Operating systems', value: 'Windows, macOS, Linux' }
  ]);
  private readonly customProjectRows = signal<Record<string, EditableTableRow[]>>({});
  protected readonly projectForms = [
    { key: 'projectOne', number: 1 },
    { key: 'projectTwo', number: 2 },
    { key: 'projectThree', number: 3 }
  ] as const;
  private readonly visibleProjectCount = signal(0);
  protected readonly visibleProjectForms = computed(() =>
    this.projectForms.slice(0, this.visibleProjectCount())
  );

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
    projects: ['MakeMyResume · Built a responsive resume generator with live preview and export features.\nPortfolio Redesign · Reworked design system for 3 product lines and launched an improved mobile experience.'],
    skills: ['UX strategy, Figma, Design systems, Prototyping, Research synthesis, Product thinking'],
    studentEducationTitle: ['EDUCATION'],
    studentEducation: ['**Bachelor of Technology (B.Tech) in Computer Science**\n  Indian Institute of Technology (IIT), Delhi\n  Expected Graduation: May 2027\n  CGPA: 8.7/10  |  Relevant Coursework: Data Structures, Algorithms, Databases, Machine\n  Learning, Web Development\n\n**Senior Secondary (Class XII)**\n  Delhi Public School, RK Puram\n  Percentage: 92% (CBSE Board)\n\n**Matriculation (Class X)**\n  St. Xavier\'s School, New Delhi\n  Score: 95%'],
    studentSkillsTitle: ['TECHNICAL SKILLS'],
    studentSkills: ['Programming Languages: Java, Python, C++\nWeb Development: Angular, Spring Boot, HTML, CSS, JavaScript\nDatabases: PostgreSQL, MySQL\nTools & Platforms: Git, Docker, Google Cloud Platform'],
    studentCertificationsTitle: ['CERTIFICATIONS'],
    studentCertifications: ['Certified in Machine Learning by Coursera\nWeb Development Certificate from Udemy'],
    studentProjectsTitle: ['PROJECTS'],
    studentProjects: ['MakeMyResume Web Application · Built using Angular and Spring Boot. Generated resumes in PDF/Word formats.\nSmart Attendance System · Developed a face-recognition based attendance tracker using Python and OpenCV.'],
    studentInternshipTitle: ['INTERNSHIP'],
    studentInternship: ['Software Development Intern · Infosys, Bengaluru\nJune 2026 – August 2026\nWorked on backend APIs using Spring Boot.\nImproved query performance by 25%.'],
    studentActivitiesTitle: ['EXTRACURRICULAR ACTIVITIES'],
    studentActivities: ['Member, Coding Club IIT Delhi – Organized hackathons.\nVolunteer, Teach for India – Tutored underprivileged students\nSports: Represented college in Badminton (Inter-IIT Tournament)'],
    studentDeclarationTitle: ['DECLARATION'],
    studentDeclaration: ['I hereby declare that the information given above is true and correct to the best of my knowledge and belief.'],
    studentPlace: ['Bengaluru'],
    studentDate: ['[Date]'],
    studentSignature: ['Rahul Sharma'],
    referenceObjective: ['Software professional focused on building dependable, user-friendly applications and delivering practical solutions in collaborative teams.'],
    referenceYears: ['5 years of experience'],
    referenceExperienceSummary: ['Experience delivering web applications across the full development lifecycle.\nComfortable working with modern front-end, back-end, and API technologies.\nCollaborates effectively with product, QA, and engineering teams.'],
    referenceTechnologies: ['JavaScript, TypeScript, Angular, Node.js, REST APIs'],
    referenceTools: ['Git, VS Code, Postman, Jira'],
    referenceDatabases: ['PostgreSQL, MySQL'],
    referenceOperatingSystems: ['Windows, macOS, Linux'],
    referenceWorkHistory: ['Software Developer · Example Company · 2022–Present\nJunior Developer · Example Studio · 2020–2022'],
    referenceTraining: ['Completed practical full-stack development training focused on building and supporting production-ready web applications.'],
    referenceTrainingTechnologies: ['Angular, TypeScript, Node.js, REST APIs'],
    referenceTrainingTools: ['Git, VS Code, Postman'],
    referenceGithub: [''],
    referenceDeclaration: ['I, Piyush Kumar hereby declare that all of the above statements are correct and true to the best of my knowledge.'],
    referencePlace: ['Bengaluru'],
    referenceSignature: ['Piyush Kumar'],
    projectOne: this.createProjectGroup(true),
    projectTwo: this.createProjectGroup(),
    projectThree: this.createProjectGroup()
  });

  private readonly previewRef = viewChild<ElementRef<HTMLDivElement>>('resumePreview');
  protected readonly isPdfExporting = signal(false);

  constructor() {
    inject(SeoService).setPage({
      title: 'Free Online Resume Builder | MakeMyResume',
      description:
        'Create and customize a resume with MakeMyResume, then download it as a PDF or Word document.',
      keywords:
        'MakeMyResume resume builder, online resume builder, free resume maker, create a resume, resume PDF download, Word resume builder',
      robots: 'noindex, follow'
    });

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

  protected sectionTitle(key: string, fallback: string): string {
    return this.customSectionTitles()[key] || fallback;
  }

  protected updateSectionTitle(key: string, value: string): void {
    this.customSectionTitles.update((titles) => ({ ...titles, [key]: value }));
  }

  protected displayedTechnicalSkillRows(): EditableTableRow[] {
    if (this.isTraditionalC()) {
      return this.technicalSkillRows();
    }
    return this.skillCategories.map(({ label, control }) => ({ id: control, label, value: this.form.controls[control].value ?? '' }));
  }

  protected updateTechnicalSkillRow(id: string, field: 'label' | 'value', value: string): void {
    this.technicalSkillRows.update((rows) => rows.map((row) => row.id === id ? { ...row, [field]: value } : row));
  }

  protected addTechnicalSkillRow(): void {
    this.technicalSkillRows.update((rows) => [...rows, { id: `skill-${Date.now()}`, label: 'New skill', value: '' }]);
  }

  protected removeTechnicalSkillRow(id: string): void {
    this.technicalSkillRows.update((rows) => rows.filter((row) => row.id !== id));
  }

  protected editableProjectRows(key: string): EditableTableRow[] {
    return this.customProjectRows()[key] ?? this.defaultProjectRows(key);
  }

  protected displayedProjectRows(project: StructuredProject): EditableTableRow[] {
    return this.isTraditionalC() ? this.editableProjectRows(project.key) : this.projectFields(project);
  }

  protected updateProjectRow(projectKey: string, id: string, field: 'label' | 'value', value: string): void {
    this.customProjectRows.update((rows) => ({
      ...rows,
      [projectKey]: this.editableProjectRows(projectKey).map((row) => row.id === id ? { ...row, [field]: value } : row)
    }));
  }

  protected addProjectRow(projectKey: string): void {
    this.customProjectRows.update((rows) => ({
      ...rows,
      [projectKey]: [...this.editableProjectRows(projectKey), { id: `project-row-${Date.now()}`, label: 'New field', value: '' }]
    }));
  }

  protected removeProjectRow(projectKey: string, id: string): void {
    this.customProjectRows.update((rows) => ({ ...rows, [projectKey]: this.editableProjectRows(projectKey).filter((row) => row.id !== id) }));
  }

  protected resetForm(): void {
    this.form.reset();
    this.visibleProjectCount.set(0);
  }

  protected addProject(): void {
    const nextProject = this.projectForms[this.visibleProjectCount()];
    if (!nextProject) {
      return;
    }

    this.form.controls[nextProject.key].reset(this.projectSample());
    this.visibleProjectCount.update((count) => count + 1);
  }

  protected get structuredProjects(): StructuredProject[] {
    return this.visibleProjectForms().map(({ key, number }) => {
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

  private defaultProjectRows(key: string): EditableTableRow[] {
    const projectControl = key === 'projectOne'
      ? this.form.controls.projectOne
      : key === 'projectTwo'
        ? this.form.controls.projectTwo
        : key === 'projectThree'
          ? this.form.controls.projectThree
          : null;
    const project = projectControl?.getRawValue();
    if (!project) {
      return [];
    }
    return [
      { id: 'client', label: 'Client', value: project.client ?? '' },
      { id: 'project', label: 'Project', value: project.name ?? '' },
      { id: 'type', label: 'Type', value: project.type ?? '' },
      { id: 'technology', label: 'Technology Used', value: project.technologies ?? '' },
      { id: 'database', label: 'Database', value: project.database ?? '' },
      { id: 'role', label: 'Role', value: project.role ?? '' },
      { id: 'tools', label: 'Tools', value: project.tools ?? '' }
    ];
  }

  protected projectFields(project: StructuredProject): EditableTableRow[] {
    return [
      { id: 'client', label: 'Client', value: project.client },
      { id: 'project', label: 'Project', value: project.name },
      { id: 'type', label: 'Type', value: project.type },
      { id: 'technology', label: 'Technology Used', value: project.technologies },
      { id: 'database', label: 'Database', value: project.database },
      { id: 'role', label: 'Role', value: project.role },
      { id: 'tools', label: 'Tools', value: project.tools }
    ];
  }

  protected splitLines(value: string | null | undefined): string[] {
    return (value ?? '')
      .split(/\n|\r\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  protected splitItems(value: string | null | undefined): string[] {
    return (value ?? '')
      .split(/[,\n\r]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  protected educationParts(line: string): { text: string; bold: boolean }[] {
    return line.split(/(\*\*.+?\*\*)/g).filter(Boolean).map((part) => {
      const bold = part.startsWith('**') && part.endsWith('**');
      return { text: bold ? part.slice(2, -2) : part, bold };
    });
  }

  protected educationLines(value: string | null | undefined): string[] {
    return (value ?? '').replace(/\r\n/g, '\n').split('\n');
  }

  protected toggleEducationBold(): void {
    if (typeof document === 'undefined') {
      return;
    }
    const editor = document.getElementById('student-education-editor') as HTMLTextAreaElement | null;
    if (!editor) {
      return;
    }
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const value = editor.value;
    const selected = value.slice(start, end);
    const updated = `${value.slice(0, start)}**${selected}**${value.slice(end)}`;
    this.form.controls.studentEducation.setValue(updated);
    requestAnimationFrame(() => {
      editor.focus();
      const caret = selected ? end + 4 : start + 2;
      editor.setSelectionRange(caret, caret);
    });
  }

  protected async downloadPdf(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    const element = this.previewRef();
    if (!element) {
      return;
    }

    this.isPdfExporting.set(this.isStructuredTemplate() || this.isStudentTemplate());
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const html2pdf = (await import('html2pdf.js')).default;
    const options = {
      margin: this.isStructuredTemplate() ? 0 : 2,
      filename: `${(this.form.get('fullName')?.value || 'resume').trim() || 'resume'}.pdf`,
      // html2pdf paints the resume into a canvas before writing the PDF.
      // Use a lossless image and a higher capture scale: resumes contain small
      // text, for which JPEG artifacts are especially noticeable in print.
      image: { type: 'png' as const },
      html2canvas: {
        scale: 4,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        // html2canvas uses a cloned document, where flex baselines differ from
        // the browser preview. Use a conventional inline-block line box and
        // extra lower padding so title text never overlaps its lower border.
        onclone: (document: Document) => {
          const resume = document.querySelector<HTMLElement>(
            ".resume-preview[data-template='structured-professional']"
          );
          resume?.classList.add('pdf-export');
          document
            .querySelectorAll<HTMLElement>(
              ".resume-preview[data-template='structured-professional'] .structured-project-page-start"
            )
            .forEach((project) => {
              project.style.setProperty('margin-top', '0', 'important');
              project.style.setProperty('padding-top', '18mm', 'important');

              const rule = project.querySelector<HTMLElement>('.pdf-page-start-rule');
              rule?.style.setProperty('display', 'block', 'important');
              rule?.style.setProperty('border-top', '1px solid #dfe7f2', 'important');
              rule?.style.setProperty('margin-bottom', '2mm', 'important');
            });
          document
            .querySelectorAll<HTMLElement>(
              ".resume-preview[data-template='structured-professional'] .traditional-section-title"
            )
            .forEach((title) => {
              title.style.setProperty('display', 'inline-block', 'important');
              title.style.setProperty('box-sizing', 'border-box', 'important');
              title.style.setProperty('align-self', 'flex-start', 'important');
              title.style.setProperty('width', 'max-content', 'important');
              title.style.setProperty('max-width', '100%', 'important');
              title.style.setProperty('margin', '0 0 0.12rem', 'important');
              title.style.setProperty('padding', '0.04rem 0.45rem 0.24rem', 'important');
              title.style.setProperty('font-size', '10pt', 'important');
              title.style.setProperty('line-height', '1', 'important');
            });
          document
            .querySelectorAll<HTMLElement>(
              ".resume-preview[data-template='structured-professional'] .structured-project-page-start > .structured-footer"
            )
            .forEach((footer) => {
              footer.style.setProperty('padding-bottom', '22mm', 'important');
              footer.style.setProperty('border-bottom', '1px solid #111', 'important');
              footer.style.setProperty('transform', 'translateY(-25mm)', 'important');
            });

        }
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const, compress: false },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    try {
      await html2pdf().set(options).from(element.nativeElement).save();
    } finally {
      this.isPdfExporting.set(false);
    }
  }

  protected printResume(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
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

    const doc = new DocxDocument({
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

  private createProjectGroup(includeSample = false) {
    const sample = includeSample ? this.projectSample() : undefined;
    return this.fb.group({
      client: [sample?.client ?? ''],
      name: [sample?.name ?? ''],
      type: [sample?.type ?? ''],
      technologies: [sample?.technologies ?? ''],
      database: [sample?.database ?? ''],
      role: [sample?.role ?? ''],
      tools: [sample?.tools ?? ''],
      responsibilities: [sample?.responsibilities ?? ''],
      description: [sample?.description ?? '']
    });
  }

  private projectSample() {
    return {
      client: 'Example Client',
      name: 'Sample Project',
      type: 'Web Application',
      technologies: 'Angular, TypeScript, REST APIs',
      database: 'PostgreSQL',
      role: 'Software Developer',
      tools: 'VS Code, Git, Postman',
      responsibilities: 'Built reusable user-interface components\nWorked with APIs and tested feature flows',
      description: 'A sample project entry showing how project details, responsibilities, and descriptions appear in the Traditional template.'
    };
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

    addSection(this.sectionTitle('objective', 'Objective'), [this.form.controls.referenceObjective.value ?? '']);
    addSection(this.sectionTitle('experienceSummary', 'Experience Summary'), [
      this.form.controls.referenceYears.value ?? '',
      ...this.splitLines(this.form.controls.referenceExperienceSummary.value)
    ]);
    addSection(this.sectionTitle('technicalSkills', 'Technical Skills'), this.displayedTechnicalSkillRows().map(({ label, value }) => `${label}: ${value}`));
    addSection(this.sectionTitle('workExperience', 'Work Experience'), this.splitLines(this.form.controls.referenceWorkHistory.value));
    addSection(this.sectionTitle('professionalExperience', 'Professional Experience:'), [
      this.form.controls.referenceTraining.value ?? '',
      `Technologies: ${this.form.controls.referenceTrainingTechnologies.value ?? ''}`,
      `Tools: ${this.form.controls.referenceTrainingTools.value ?? ''}`
    ]);

    for (const project of this.structuredProjects) {
      if (!this.hasProjectContent(project)) {
        continue;
      }
      addSection(`${this.sectionTitle('project', 'Project')} ${project.number}`, [
        ...this.displayedProjectRows(project).map(({ label, value }) => `${label}: ${value}`),
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
