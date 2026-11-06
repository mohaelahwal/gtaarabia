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

## Upload and test
Copy this ZIP's contents into your repository folder, including .github, then commit and push.
Keep your existing GEMINI_API_KEY secret.
GitHub > Actions > Daily Arabic content > Run workflow > branch main > mode draft.
Open the completed run and inspect both news and leaks summaries and the content-drafts artifact.
Do not rerun an old run: launch a new workflow on main to use the updated files.
Only enable AUTOMATION_ENABLED=true and AUTO_PUBLISH=true in repository Actions variables after reviewing a successful draft.

Local verification: 38 tests passed; 442 pages built and SEO checks passed. Live Gemini quota and X access require the GitHub draft test; they are not verified by local tests.
