import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputDirectory = resolve('dist/resume-maker/browser');
const configuredSiteUrl = process.env.SITE_URL || process.env.URL;
const robotsPath = resolve(outputDirectory, 'robots.txt');

if (!configuredSiteUrl) {
  console.warn(
    'SITE_URL/URL is not set; skipping canonical URLs and sitemap. Netlify sets URL automatically for deploy builds.'
  );
  process.exit(0);
}

const siteUrl = new URL(configuredSiteUrl);
if (!['https:', 'http:'].includes(siteUrl.protocol) || siteUrl.pathname !== '/' || siteUrl.search || siteUrl.hash) {
  throw new Error('SITE_URL/URL must be an absolute site origin, for example https://example.netlify.app');
}

const origin = siteUrl.origin;
const pages = [
  { path: '/', file: 'index.html' },
  { path: '/templates/', file: 'templates/index.html' }
];
const logoUrl = new URL('/logo.png', origin).href;

function setMeta(html, attribute, name, content) {
  const matcher = new RegExp(`<meta ${attribute}="${name}"[^>]*>`, 'i');
  const tag = `<meta ${attribute}="${name}" content="${content}">`;
  return matcher.test(html) ? html.replace(matcher, tag) : html.replace('</head>', `  ${tag}\n</head>`);
}

for (const page of pages) {
  const filePath = resolve(outputDirectory, page.file);
  let html = await readFile(filePath, 'utf8');
  const canonical = new URL(page.path, origin).href;

  html = html.replace(/<link rel="canonical"[^>]*>\s*/i, '');
  html = html.replace(/<script type="application\/ld\+json" data-seo-schema>[\s\S]*?<\/script>\s*/i, '');
  html = setMeta(html, 'property', 'og:image', logoUrl);
  html = setMeta(html, 'name', 'twitter:image', logoUrl);
  html = setMeta(html, 'name', 'twitter:image:alt', 'MakeMyResume logo');
  html = setMeta(html, 'property', 'og:image:alt', 'MakeMyResume logo');
  const schema =
    page.path === '/'
      ? `<script type="application/ld+json" data-seo-schema>${JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              '@id': `${origin}/#organization`,
              name: 'MakeMyResume',
              url: origin,
              logo: logoUrl
            },
            {
              '@type': 'WebSite',
              '@id': `${origin}/#website`,
              name: 'MakeMyResume',
              alternateName: 'Make My Resume',
              url: origin,
              publisher: { '@id': `${origin}/#organization` }
            },
            {
              '@type': 'WebApplication',
              '@id': `${origin}/#application`,
              name: 'MakeMyResume',
              url: canonical,
              description:
                'Make a job-ready resume with MakeMyResume, a free online ATS-friendly resume builder. Customize professional resume templates and download your resume as PDF or Word.',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Any',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              publisher: { '@id': `${origin}/#organization` }
            }
          ]
        }).replace(/</g, '\\u003c')}</script>`
      : '';

  if (!html.includes('</head>')) {
    throw new Error(`No closing head tag found in ${page.file}`);
  }

  html = html.replace(
    '</head>',
    `  <link rel="canonical" href="${canonical}">\n  ${schema}\n</head>`
  );
  await writeFile(filePath, html);
}

const sitemap = pages
  .map(({ path }) => `  <url><loc>${new URL(path, origin).href}</loc></url>`)
  .join('\n');
await writeFile(
  resolve(outputDirectory, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap}\n</urlset>\n`
);
await writeFile(robotsPath, `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
