# MakeMyResume

MakeMyResume is a frontend-only Angular application for creating polished resumes, previewing them live, and exporting them as PDF or DOCX files in the browser. The app prerenders its public pages and can be deployed as a static site to Netlify or Firebase without backend services or persistence.

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

The build prerenders the home, templates, and builder pages. When `SITE_URL` or Netlify's `URL` environment variable is available, it also writes canonical URLs, a sitemap, a sitemap reference in `robots.txt`, and MakeMyResume organization/site structured data that references the public logo at `/logo.png`. Set `SITE_URL` to the production origin when building outside Netlify.

The supplied square logo is used in the site header/footer, as the PNG favicon, in social previews, and in organization structured data. Google may take days or weeks to recrawl the site and decide whether to display the favicon or logo in Search. After deploying, verify the production URL and logo in Google Search Console and request indexing of the home page.

## Netlify deployment

The included [netlify.toml](./netlify.toml) configures Netlify to run `npm run build` and publish `dist/resume-maker/browser`. Connect this repository to Netlify and deploy; Netlify supplies the production site URL to generate canonical URLs and the sitemap.

After deployment, add the production site to [Google Search Console](https://search.google.com/search-console) and submit `https://<your-site>/sitemap.xml`. Indexing and ranking are determined by Google and are not guaranteed by deployment.

## Firebase Hosting

The project also includes a static hosting configuration for Firebase Hosting.
