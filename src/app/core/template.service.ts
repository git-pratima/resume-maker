import { Injectable, computed, signal } from '@angular/core';

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  layout: string;
  accent: string;
  atsFriendly: boolean;
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  { id: 'classic', name: 'Classic', description: 'A dependable layout for traditional roles and polished storytelling.', category: 'Corporate', layout: 'Single-column', accent: '#2563eb', atsFriendly: true },
  { id: 'modern', name: 'Modern', description: 'A confident two-column format that highlights impact and achievements.', category: 'Tech', layout: 'Two-column', accent: '#0f766e', atsFriendly: true },
  { id: 'minimal', name: 'Minimal', description: 'A quiet, refined design for clear, elegant career narratives.', category: 'Creative', layout: 'Minimal', accent: '#7c3aed', atsFriendly: true },
  { id: 'executive', name: 'Executive', description: 'A leadership-focused template for managers and senior specialists.', category: 'Leadership', layout: 'Two-column', accent: '#b45309', atsFriendly: true },
  { id: 'student', name: 'Student', description: 'A simple format that keeps internships, education, and skills front and center.', category: 'Entry-level', layout: 'Single-column', accent: '#db2777', atsFriendly: true },
  { id: 'structured-professional', name: 'Structured Professional', description: 'A detailed, table-led resume with a compact header and clearly grouped project experience.', category: 'Corporate', layout: 'Single-column', accent: '#475569', atsFriendly: true }
];

@Injectable({ providedIn: 'root' })
export class TemplateService {
  readonly templates = RESUME_TEMPLATES;
  readonly selected = signal<ResumeTemplate | null>(RESUME_TEMPLATES[0]);
  readonly selectedTemplate = computed(() => this.selected());

  select(id: string): void {
    const template = this.templates.find((item) => item.id === id) ?? null;
    this.selected.set(template);
  }
}
