# GTA Arabia

Arabic RTL fan website. Buildless HTML/CSS/JavaScript, locally stored fonts and artwork, JSON content. No npm dependencies. Node 22+ is needed only for build/tests/automation, not to view the site through XAMPP.

## Open on Windows / XAMPP

1. Extract the project folder to `C:\xampp\htdocs\gta_arabia`.
2. Start Apache from the XAMPP Control Panel.
3. Open `http://localhost/gta_arabia/`.
4. The prebuilt production version is also available at `http://localhost/gta_arabia/dist/` and contains standalone article pages. Do not open index.html using file://.

The delivered files were created in a remote workspace, not directly on your Windows drive.

## Included

- Arabic RTL responsive site; navy, pink and purple neon styling inspired by the references.
- Cairo body and Changa display fonts, stored locally. The source references did not identify an exact Arabic font.
- Temporary GTA Arabia text logo in `assets/logo.svg`; replace with your final attached logo when available.
- Local-midnight release countdown, 6 sourced editorial articles, 8 character profiles, legacy-character status section.
- An illustrative, unofficial regional map: drag, zoom, rotation, six pins, regional filters, keyboard controls.
- Visual vehicle and weapon catalogs with individual files, filters, search, sources and side-by-side comparison.
- 23 verified YouTube entries: 4 official Rockstar videos plus independent analyses. Search, filters, Arabic descriptions, modal players, muted autoplay on opening, original YouTube fallback. Arabic subtitle availability belongs to the video publisher.
- Sharing on articles, sections, character/video details and footer.
- Social, subscription and donation controls. Unconfigured links show honest “coming soon” states.
- Static article exports, RSS, configurable canonical URLs and sitemap on build.
- Gemini content/image-generation scripts and disabled-by-default daily GitHub workflow.

## Configure links

Edit `data/config.json`:

- `siteUrl`: full HTTPS domain, optionally including a GitHub repository subpath.
- `socials`: youtube / instagram / tiktok / facebook / x URLs.
- `subscribeUrl`: your channel subscription URL or hosted email subscription form.
- `donationUrl`: your chosen support/payment page.
- `releaseDate`, `releaseSource`, `releaseVerifiedAt`: verified release information.

No email collection is implemented. Until a subscription service is configured, users can use the RSS feed. For externally usable RSS links and a sitemap, set siteUrl before building.

## Content and build

Edit `data/posts.json`, `data/videos.json`, and `data/research.json`. Images are under assets/. Catalog records are in data/catalog.json; map presentation is in app.js. All unknown values are intentionally labeled. Do not invent stats, map coordinates or returning characters.

```
npm test
npm run build
```

The `dist/` folder contains only public static files. Upload its contents to a host. It does not need PHP, a database, or Node on the hosting server. When working with XAMPP, rebuild after editing data if you use the /dist/ URL.

## GitHub and domain setup (later)

1. Create a repository with the project contents at its root, using branch `main`. Include hidden `.github/` files.
2. In GitHub Settings → Pages, select **GitHub Actions** as the deployment source.
3. Push to main; `.github/workflows/pages.yml` validates, builds and deploys `dist/`.
4. Set your domain through GitHub Pages settings and your registrar’s DNS using GitHub’s current instructions. Set the same URL in config, then rebuild.
5. Do not put API keys in config, app.js, the public directory or Git history.

## Daily Gemini articles and images

Nothing is scheduled or enabled in a real repository yet. Workflow files are prepared only.

GitHub Settings → Secrets and variables → Actions:

| Setting | Type | Value |
|---|---|---|
| GEMINI_API_KEY | Secret | Your Gemini API key |
| GEMINI_TEXT_MODEL | Variable | Exact currently enabled model ID supporting generateContent JSON output |
| GEMINI_IMAGE_MODEL | Variable | Exact enabled Gemini image model ID; leave empty to retain official fallback art |
| AUTOMATION_ENABLED | Variable | `true` to permit the daily job |
| AUTO_PUBLISH | Variable | Start with `false`; set `true` after reviewing successful drafts |

The daily workflow runs at 10:17 UTC (scheduled jobs may be delayed). It discovers relevant links on configured official sites, reads allowlisted new source URLs, skips previously covered sources, generates one Arabic article, checks its structure and requests a second source-based review. When an image model is configured, it generates a clearly labeled editorial illustration. If any required step fails, the article is not published. It may skip a day when there is no verifiable new material; it does not invent news to meet a quota.

Draft mode uploads drafts/ as a GitHub Actions artifact. A generated draft image is in drafts/images; when manually approving a draft, move it to its recorded assets/generated path before inserting the post into posts.json. Auto-publish mode writes JSON and assets, commits to main and invokes the reusable Pages deployment workflow explicitly. This avoids relying on a bot commit to trigger another workflow.

API calls and image generation require your own enabled models/quota/billing and have not been executed without a key. Source sites can change markup or block automated retrieval, and model review is not a factual guarantee. Inspect the initial drafts before enabling unattended publication. The automation does not update the release date, map geometry, character roster or performance tables automatically.

## Sources and rights

`data/research.json`, `data/asset-sources.json`, and `data/character-sources.json` record original sources. Research date: 2026-11-05. Game artwork and trademarks belong to Rockstar Games/Take-Two. This is an unofficial fan site. YouTube videos are embedded, never reuploaded. Local Cairo and Changa font files are distributed under SIL Open Font License; license files are included in assets/fonts/.

## Known limits

- The map is an illustrative region explorer, NOT Rockstar’s official map or precise gameplay navigation.
- GTA VI measurement fields are unverified and are intentionally not populated with guesses.
- No confirmed returning legacy protagonists were established in the source review.
- Some YouTube embeds can be restricted by age, geography, publisher settings, or browser policy; use the original video link.
- Your exact GTA Arabia logo and social/subscribe/donation URLs were not supplied.
- Browser autoplay is best-effort; videos start muted after the user opens them.
- No live Gemini calls, GitHub deployment, domain connection or Windows installation was possible without the corresponding account/key/local access.

## Version 2 changes

Every section, article, video, character, vehicle and weapon now has a physical HTML file. Example URLs:

- `/vehicles/index.html`
- `/vehicles/truffade-adder/index.html`
- `/weapons/pistol/index.html`
- `/articles/release-date/index.html`
- `/videos/QdBZY2fkU-0/index.html`
- `/characters/lucia-caminos/index.html`

These work below the XAMPP `/gta_arabia/` subfolder and below a GitHub Pages repository path. Share links use the real file URL, not a fragment. Set `siteUrl` to the final HTTPS base URL before deploying for canonical/Open Graph URLs and sitemap generation.

`templates/index.html` is the shared page shell. `scripts/build.mjs` writes all page files both to the working project and to `dist/`. Source data is `data/catalog.json` (vehicles/weapons), `data/posts.json`, `data/videos.json`, `data/research.json`; source images are in `assets/`. Do not hand-edit generated page files: update the template/data/app and run `npm run build`.

The homepage uses `assets/hero-bg.mp4`, an official 8-second silent Rockstar clip. Source provenance: `data/hero-video-source.json`. It loops muted with a static poster fallback. Headlines rotate every 6.5 seconds; visitors can navigate or pause the carousel and video independently. Reduced-motion preferences pause background motion.

The download includes `INSTALL-WINDOWS.cmd` and `INSTALL-WINDOWS.ps1` next to the `gta_arabia` folder. After extracting the entire ZIP, run the CMD file to copy the project into `C:\xampp\htdocs\gta_arabia`. Existing content is first copied to a timestamped sibling backup. If Windows blocks PowerShell scripts, copy the folder manually instead; the installer does not change your execution policy. The installer has not been executed on your Windows computer from this remote session.


V2 final inventory: 87 separate HTML pages, 26 vehicles, 15 weapons, 23 videos, 8 characters, and 6 articles. Official GTA VI items and GTA V/Online reference entries are labeled separately.


## V3 — news, supplied branding and map
- 20 additional sourced Arabic articles. News, homepage feeds and RSS sort by publication date descending; optional publishedAt provides same-day ordering.
- Supplied logo SVG is used unchanged in the header, footer banner and favicon.
- Footer community block redesigned as a sloped neon panel with official character artwork.
- Uploaded 2048px map replaces the old schematic. 28 labeled locations, drag/pinch/wheel zoom, rotation, keyboard controls, search/category filters and reset. Location sharing opens map/index.html?location=slug.
- Pin coordinates match labels on the supplied image. Image provenance and precise in-game coordinates are not verified; the UI distinguishes officially announced region names from image-only labels.
- New app modules: content.js for chronological sorting, map.js for the map. No API keys or automation settings changed.
- Windows installation is still performed by the included installer on the user's computer; this environment cannot directly access C:\xampp\htdocs.

V3 validated inventory: 107 separate pages; 26 total articles, including 23 on the news page and 3 world stories. Ten automated tests passed. Browser checks covered news ordering, article navigation, map zoom/rotation/filtering, mobile fit and pin deep links.


## V4 — SEO and vector map
Configured canonical domain https://www.gtaarabia.com. Added Arabic-first metadata, structured data, bilingual guide with reciprocal hreflang, sitemap index + Arabic/English sitemap files, image sitemap entries, robots.txt, HTML directory, llms.txt, and SEO_SETUP.md. Public domain has not been deployed or submitted to search engines here. No ranking guarantees.
The map is now a true SVG trace with approximately 19,000 vector paths and no embedded raster. Small source text/icons are approximations. Pins show information on hover/focus and remain selectable by tap.
Validation: 10 automated tests, SEO validation for all 109 primary pages, XML parsing for all sitemaps, browser checks for vector loading, zoom, pin focus previews and English canonical/language markup.
