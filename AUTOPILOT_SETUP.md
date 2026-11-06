# GTA Arabia autopilot — 7 AM Doha / Qatar

## Install this replacement package
1. GitHub Desktop: select gtaarabia > Fetch origin / Pull origin.
2. Repository > Show in Explorer.
3. Extract this ZIP into that folder. Merge folders and replace the included files. Include .github. Do not put the files in an extra nested folder.
4. Commit: Expand GTA Arabia content automation. Push origin.

This patch includes the automation, map data integration, future character routes and event filter. It does NOT replace your posts, videos, catalog, character research, logo or image library. The map-locations.json file migrates the existing 28 pins with their existing positions. If you manually edited those pins after the supplied website version, merge those changes before committing.

## What it covers
| Category | Destination | Rules |
| --- | --- | --- |
| News | Arabic news articles | At most one new article per run; fresh dated evidence within 72 hours |
| Videos | Embedded video library | Original YouTube video linked by a cited source, verified via oEmbed; associated videos are also added once |
| Vehicles | Existing vehicle library | Add new GTA VI entries or update matched entries; no invented specs |
| Weapons | Existing weapon library | Same comparison, source and media gates |
| Characters | Character list and detail pages | Preserve existing character order/URLs; add image and source; distinguish reporting from official introductions |
| Map locations | Interactive pins and selected-photo panel | Preserve existing positions; new positions need manual calibration before publication |
| Events | News + الفعاليات filter | Confirmed date, source, image; event timezone stated when known |

All seven categories are searched every run. No new evidence means no forced content. Up to ten accepted changes per run; remaining discoveries can be picked up later. This is bounded discovery, not a guarantee to find everything on the internet.

Existing English/Arabic names, aliases, IDs and titles are compared; a second model review checks semantic duplication and whether an update adds new facts. Changes show before/after data. Model review reduces mistakes; it does not guarantee accuracy.

Sources: Rockstar Games, PlayStation, Xbox Wire and GTA Wiki/Fandom. News and event reporting needs a recent publisher publication date. Current catalog reference pages may be undated: they are compared against existing data rather than presented as fresh news. Unreadable pages are skipped and recorded. APIs and source availability can change.

## Media is required
- No archival fallback and no generated illustration standing in for a real vehicle, character or place.
- Every accepted item has a downloaded JPEG/PNG/WebP from the cited page, or a verified video's thumbnail. File size/type and approved host checks run before saving.
- The model checks the actual downloaded image against the subject and source context.
- Available relevant publisher-linked YouTube videos are checked for embedding, linked to the article and added to the video section without repeating the video ID.
- An inaccessible, irrelevant or missing image/video holds that item for review. Instagram and other unsupported embeds are not converted to invented YouTube links. oEmbed verification cannot guarantee playback in every region or age setting.
- Media source credit is retained. Linking/credit does not grant a content license; the publisher's permitted use still applies.

## One live draft test first
GEMINI_API_KEY is already in your repository secrets. Do not share it here.

Keep AUTOMATION_ENABLED and AUTO_PUBLISH unset or false.
1. Actions > Daily Arabic content > Run workflow.
2. Branch main, mode draft > Run workflow.
3. Open the completed run, download content-drafts-[run number] under Artifacts.
4. Extract the artifact and open preview.html with its images folder beside it.
5. Review Arabic copy, images, videos, sources, before/after comparison and held reasons. Check report.json for all seven search outcomes. changes.json contains detailed proposals and reviews; proposed-data/ is a preview snapshot, not something to copy over the live site.

Draft mode never changes public data/assets. Missing media or coordinates stays held. No-new-news is a valid no-op, not a successful article test. If every search fails, the workflow fails visibly. Partial source/search problems appear in the report.

Local tests use simulated API responses, not your secret. A real Gemini run is still required. Browser playback and live source extraction have not been verified in this editing session.

## Enable only after reviewing that draft
GitHub > Settings > Secrets and variables > Actions > Variables:

| Variable | Value |
| --- | --- |
| AUTOMATION_ENABLED | true |
| AUTO_PUBLISH | true |

Schedule: cron 0 4 * * *, equivalent to 07:00 Asia/Qatar all year. GitHub may start late; it is not an exact publication guarantee. With AUTOMATION_ENABLED=true and AUTO_PUBLISH=false, daily runs only create drafts. Manual draft mode never publishes, even when AUTO_PUBLISH=true.

Accepted changes pass tests, build and SEO checks before the commit and Pages deployment. Held changes stay in the artifact and do not block unrelated accepted items. Sitemap and RSS rebuild with the site. Keep checking Actions for errors and quota usage. Google API billing is separate from a ChatGPT subscription; seven searches plus generation, fact/media review can consume API quota. The optional GEMINI_TEXT_MODEL variable overrides the configured model with one supporting Google Search, JSON output and image input.

Pause schedule: AUTOMATION_ENABLED=false. Pause publication only: AUTO_PUBLISH=false. Draft artifacts are retained for 14 days; download any you need to keep. No secrets go into artifacts.

## New map locations
The attached community map has its own 2048 × 2048 image coordinate system. Real-world coordinates or a place name do not identify a point on it reliably.

Existing pins retain their positions. New locations appear as held proposals until a human verifies their placement. To approve a position, create data/map-placements.json with the proposed item's exact ID and calibrated image coordinates, for example:

```json
{
  "verified-location-id": {"x": 1000, "y": 1200, "type": "city"}
}
```

Those numbers are format examples, NOT a real location. Allowed map types: city, nature, beach, island, transport. Commit actual verified positions and run another draft. A model-supplied x/y is ignored. Review the resulting pin before enabling publishing.

## References
- https://ai.google.dev/gemini-api/docs/google-search
- https://ai.google.dev/gemini-api/docs/models
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule
