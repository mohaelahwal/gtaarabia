# 2026-11-07 — Expanded leak archive

- Added four Arabic editorial reports from PC Gamer, TechRadar and Insider Gaming with original source dates, full article pages and local illustrative images.
- Added two YouTube explainers, metadata verified with oEmbed; Arabic titles/descriptions, original Portuguese/Spanish audio. Embedded in the related leak cards and article views, and listed in the video library.
- Removed the four-card display limit; all six existing and added entries are visible.
- Groq configuration and daily publication limits are unchanged. These are curated additions; automated leak discovery still uses the original X account and may return HTTP 403.
- Validated 52 tests and a 448-page build. Full video playback/region availability is not verified.

# Direct IGN and Kotaku discovery

This configuration supersedes earlier Gemini Search instructions.

- Discovery fetches IGN and Kotaku RSS feeds, with their supplied listing pages as fallback. No Gemini Search calls.
- Only GTA VI stories are considered. Article publication dates must be within 72 hours. Existing unchanged published evidence is skipped. Publisher access errors are reported separately from an empty news day.
- Daily schedule remains 07:00 Qatar. Up to two news articles and one leak per scheduled run, only if eligible. No guaranteed daily output.
- Matching images are required. Supported source-linked YouTube embeds are verified and also added to the video library. Publisher-specific proprietary players are not currently supported.
- Arabic content is an original short summary with source attribution, not a reproduction of the full publisher article.
- Arabic writing/review still uses Gemini. Six-call maximum per workflow, 16-second spacing; news calls now time out after 45 seconds. This DOES NOT fix the unresolved Gemini quota/network issue.
- X leak access remains blocked in observed runs. Existing leaks are preserved; no bypass or sign-in is attempted.

## Next test
1. Copy the complete package into your repository, including .github, then commit and push.
2. Actions > Daily Arabic content > Run workflow > main > mode discovery.
3. This mode uses ZERO Gemini requests, skips the leaks step, and never publishes.
4. Read the summary. If sources were found, download content-drafts and inspect discovered-news.json (links, dates and detected media).
5. Draft mode adds Arabic generation/review; only try it after the Gemini issue is resolved. Publish mode additionally requires AUTO_PUBLISH=true.

Local verification: 42 tests passed, build and SEO checks passed for 442 pages. Live publisher access from GitHub and live Gemini generation are not verified. This environment received access errors for publisher fetches; the new discovery mode isolates that check.


## Earlier notes (superseded above)
# News and leaks automation — November 6, 2026

Current configuration supersedes earlier all-category instructions.

- Only news and leaks are updated automatically. Existing videos, vehicles, weapons, characters, events and map pins remain unchanged.
- Maximum two news articles and one new/changed leak per daily run. News may include a verified source-linked video inside its article.
- Maximum SEVEN Gemini requests per workflow run, with at least 16 seconds between requests. This is a per-run cap, not a project-wide daily quota. Other apps and manual reruns consume the same project quota.
- News requires fresh dated evidence, duplicate checks, supported claims and a verified relevant image. Unchanged previously published evidence skips generation.
- Leaks are restricted to TheMemeVerseHq GTA VI leak claims. Unchanged existing claims skip translation. Media must download successfully for new additions; unavailable items stay unpublished.
- If X refuses public access, preserve existing leaks and report source-unavailable. This does not solve X access restrictions; news can still proceed.
- Gemini 429/401/403 stops further API calls in the run. The report includes the provider error with the key redacted. No automatic retries or key rotation.
- Schedule remains 07:00 Asia/Qatar (04:00 UTC). No remote settings were changed.



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
