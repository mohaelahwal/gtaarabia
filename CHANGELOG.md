# Changes

## 1.0.0 — 2026-11-05
- Built Arabic RTL GTA Arabia website following navy/neon references.
- Added local Cairo/Changa fonts and replaceable SVG logo.
- Added sourced news and story reader, release countdown and eight character profiles.
- Added interactive illustrative six-region map and comparison sections.
- Added 23 verified YouTube links with captions, filtering and embedded players.
- Added global search, sharing, social/subscribe/donation configuration.
- Prepared disabled daily Gemini generation and GitHub Pages workflows.
- Added validation, static article exports, RSS and domain-driven sitemap.
- Documented Windows installation, configuration, rights, sources and limits.

## 2.0.0 — 2026-11-05
- Replaced the small dropdown comparisons with visual catalogs, category filters, search and two-item comparison tables.
- Added individual vehicle and weapon images, sourced facts and item detail pages.
- Replaced hash navigation with generated physical HTML files for sections, articles, videos, characters and catalog items. Each page has its own URL and sharing links.
- Added an official bundled MP4 homepage background and rotating news with previous/next/pause controls.
- Added a Windows install helper that backs up an existing target folder before copying the project.


## V3 — news, supplied branding and map
- 20 additional sourced Arabic articles. News, homepage feeds and RSS sort by publication date descending; optional publishedAt provides same-day ordering.
- Supplied logo SVG is used unchanged in the header, footer banner and favicon.
- Footer community block redesigned as a sloped neon panel with official character artwork.
- Uploaded 2048px map replaces the old schematic. 28 labeled locations, drag/pinch/wheel zoom, rotation, keyboard controls, search/category filters and reset. Location sharing opens map/index.html?location=slug.
- Pin coordinates match labels on the supplied image. Image provenance and precise in-game coordinates are not verified; the UI distinguishes officially announced region names from image-only labels.
- New app modules: content.js for chronological sorting, map.js for the map. No API keys or automation settings changed.
- Windows installation is still performed by the included installer on the user's computer; this environment cannot directly access C:\xampp\htdocs.


Weapon asset update: replaced all 14 GTA V weapon images with locally bundled transparent PNG artwork from MSK Scripts GTA V/FiveM gallery. Original game artwork belongs to Rockstar/Take-Two. Each asset source recorded in data/weapon-image-sources.json and linked on its detail page. Catalog, detail and comparison views use dark purple backgrounds. Ten automated tests passed and catalog image loading visually verified.


## V4 — SEO and vector map
Configured canonical domain https://www.gtaarabia.com. Added Arabic-first metadata, structured data, bilingual guide with reciprocal hreflang, sitemap index + Arabic/English sitemap files, image sitemap entries, robots.txt, HTML directory, llms.txt, and SEO_SETUP.md. Public domain has not been deployed or submitted to search engines here. No ranking guarantees.
The map is now a true SVG trace with approximately 19,000 vector paths and no embedded raster. Small source text/icons are approximations. Pins show information on hover/focus and remain selectable by tap.
Validation: 10 automated tests, SEO validation for all 109 primary pages, XML parsing for all sitemaps, browser checks for vector loading, zoom, pin focus previews and English canonical/language markup.


Navigation/branding update: moved video library before news, pink neon navigation treatment without dot, removed generated header wordmark, installed updated user logo.svg unchanged, and replaced footer background with supplied waterfront image. Added 160ms exit/230ms entrance page fades with reduced-motion support and back/forward restoration. Browser checked navigation and footer; SEO checks passed.

## GTA VI weapon gallery update
- Imported 27 GTA Wiki gallery images and Arabic entries, with per-image source credits.
- Retained 14 GTA V reference entries; added game filters, updated individual pages and sitemap.
- Descriptive community identifications are labelled; no leaked imagery or invented performance statistics.
- ZIP contains the runnable root site and build sources; run npm run build to regenerate dist for deployment.

## Vehicle library, compact video banner and dormant AdSense
- Removed the video-page slogan and reduced its intro to a compact heading.
- Imported 302 illustrated GTA VI gallery entries; retained 24 GTA V reference entries. One wiki entry had no actual image and was excluded. Existing VI detail URLs retained.
- Added Arabic labels/categories, per-image credits, game filters and 36-card incremental loading.
- AdSense slots stay hidden and make no requests while disabled. See ADSENSE_SETUP.md before activation.

## November 5 reader-submitted news
- Added four Arabic articles: Kodak Black reporting, nightclub visual comparison, launch screenshot gallery, and WSJ interview.
- Added Kodak Black as press-reported, with an official gallery image and source attribution; no unverified role details.
- Added the WSJ Events full interview r7BWW8gvxRw to the video library and linked its article; added an interview filter.
- Exact GTA6.only screenshot-compilation Reel could not be resolved. Needs its direct Instagram link; no unrelated video substituted.
- Articles and character/video detail pages have dedicated URLs and sitemap entries.

## Map layout cleanup
- Removed the map explanation note and visible intro heading; map starts directly below navigation.
- Homepage CTA now reads اكتشف خريطة ليونيدا.
