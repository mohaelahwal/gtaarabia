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
