import { Routes } from '@angular/router';
import { HomePage } from './features/home/home.page';
import { TemplatesPage } from './features/templates/templates.page';
import { BuilderPage } from './features/builder/builder.page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'templates', component: TemplatesPage },
  { path: 'builder', component: BuilderPage },
  { path: '**', redirectTo: '' }
];
