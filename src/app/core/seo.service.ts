import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

interface PageMetadata {
  title: string;
  description: string;
  robots?: string;
}

const SEARCH_KEYWORDS = [
  'MakeMyResume',
  'Make My Resume',
  'resume builder',
  'free resume builder',
  'online resume builder',
  'resume maker',
  'free resume maker',
  'online resume maker',
  'resume creator',
  'CV maker',
  'CV builder',
  'free CV maker',
  'resume templates',
  'free resume templates',
  'ATS resume',
  'ATS-friendly resume',
  'ATS-friendly resume template',
  'professional resume',
  'professional resume template',
  'resume design',
  'resume format',
  'resume examples',
  'resume sample',
  'resume writing',
  'resume creator online',
  'create a resume online',
  'build a resume',
  'job resume',
  'job application resume',
  'entry-level resume',
  'student resume',
  'graduate resume',
  'executive resume',
  'modern resume template',
  'simple resume template',
  'classic resume template',
  'minimal resume template',
  'two-column resume',
  'single-column resume',
  'resume PDF',
  'download resume PDF',
  'Word resume',
  'downloadable resume template',
  'editable resume template',
  'resume builder free download',
  'resume with no account',
  'free CV templates',
  'online CV builder',
  'resume for job seekers',
  'MakeMyResume resume builder'
] as const;

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  setPage({ title, description, robots = 'index, follow' }: PageMetadata): void {
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: SEARCH_KEYWORDS.join(', ') });
    this.meta.updateTag({ name: 'robots', content: robots });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:site_name', content: 'MakeMyResume' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }
}
