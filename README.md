# Resume Maker

Resume Maker is a fully frontend-only Angular application for creating polished resumes, previewing them live, and exporting them as PDF or DOCX files in the browser. It is designed for static hosting on Firebase without backend services or persistence.

## Features

- Template library with predefined ATS-friendly layouts
- Responsive resume builder with live preview
- PDF export via browser-side rendering
- DOCX export via the docx library
- Light/dark theme support
- No backend, no database, and no persisted resume data across refreshes

## Local development

```bash
npm install
npm start
```

Then open http://localhost:4200/

## Production build

```bash
npm run build
```

## Firebase Hosting

This project includes a static hosting configuration for Firebase Hosting.
