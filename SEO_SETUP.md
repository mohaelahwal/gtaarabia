# GTA Arabia SEO — Arabic first / العربية أولاً

Canonical domain: https://www.gtaarabia.com

## Included
- Unique Arabic titles/descriptions, full canonical URLs, Open Graph and Twitter cards on each content page.
- Readable static HTML article bodies, sources, dates and linked section lists before JavaScript runs.
- JSON-LD Organization, WebSite, WebPage/CollectionPage, BreadcrumbList and Article/NewsArticle as appropriate. No invented ratings, authors, publication times or video upload dates.
- sitemap.xml index, sitemap-ar.xml and sitemap-en.xml with absolute URLs and page images. Article lastmod uses recorded publication/modification dates; it is not reset on every build.
- Real translated introductory guides: /guide/index.html (Arabic) and /en/index.html (English), with reciprocal ar/en/x-default hreflang. Other pages remain Arabic, rather than claiming nonexistent English translations.
- robots.txt allows public pages and assets, including AI search crawling, while excluding duplicate build/source directories.
- llms.txt is an optional readable content directory, not a Google requirement or a guarantee of AI citation. sitemap.html and RSS offer standard discovery routes.
- Sitemaps/structured data regenerate with npm run build, including future scheduled articles.

## Launch steps — خطوات الإطلاق
1. Deploy dist/ to the public domain with HTTPS. On XAMPP, the project root also contains the generated pages and SEO files.
2. Redirect the bare gtaarabia.com domain to https://www.gtaarabia.com at your host. Ensure localhost/staging is not publicly indexed. Canonicals already point to the public domain.
3. Verify domain ownership in Google Search Console and Bing Webmaster Tools using DNS. This requires the domain owner's account; it has not been submitted from this environment.
4. Submit https://www.gtaarabia.com/sitemap.xml. Inspect the homepage, an article and the English guide with URL Inspection; use Google's Rich Results Test for article markup.
5. Confirm every sitemap URL responds 200, missing URLs return a real404, HTTPS works, and hosting/firewall does not block legitimate search crawlers.
6. Add authentic author/contact details and actual social URLs when ready. Continue publishing useful original sourced reporting; monitor indexing, search queries, page speed and broken links.

لا يمكن ضمان الترتيب الأول في Google أو الظهور في إجابات الذكاء الاصطناعي. يعتمد ذلك أيضاً على جودة المحتوى والمنافسة وروابط المواقع الأخرى والفهرسة وثقة المصادر. لم يُنشر الموقع أو يُرسل لمحركات البحث في هذه الجلسة.

## Sources
https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
https://developers.google.com/search/docs/appearance/structured-data/article
https://developers.google.com/search/docs/appearance/ai-features
https://developers.openai.com/api/docs/bots

## Map
The SVG is a real path trace, not a raster embedded in an SVG wrapper. It scales without pixel blocks, but small letters and symbols are approximate because tracing cannot restore information absent from the source. Location info appears on pointer hover and keyboard focus; click/tap selects and centers a location. The original supplied image remains bundled as a reference.
