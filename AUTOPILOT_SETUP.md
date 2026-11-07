# GTA Arabia automation — Groq setup

This replaces earlier Gemini setup instructions. Do not create another Gemini key.

1. Create a free API key at https://console.groq.com/keys .
2. GitHub repository > Settings > Secrets and variables > Actions > New repository secret. Name: GROQ_API_KEY. Paste the key there, never into chat or a file.
3. Upload this complete package, including .github/, commit and push main. Preserve any newer published content and data/automation-state.json from your repository.
4. Actions > Daily Arabic content > Run workflow > main > connection. This makes one authenticated Arabic JSON + image request and publishes nothing. Look for PASS in the summary.
5. After connection passes, run draft. Download the content-drafts artifact and open preview.html. Existing public content is unchanged in draft mode.
6. After reviewing the draft, add repository Actions variables AUTO_PUBLISH=true and AUTOMATION_ENABLED=true to enable publishing and the daily schedule. Manual publish also requires AUTO_PUBLISH=true. Leave both false until the draft succeeds.

## Behaviour
- Scheduled for 07:00 Qatar (04:00 UTC); GitHub may start late.
- Up to TWO new news articles and ONE leak per Qatar calendar day, including manual reruns. Fewer or none when no eligible new evidence exists.
- News discovery fetches IGN and Kotaku directly. No AI search requests. Recent GTA VI stories only; unchanged published sources are skipped.
- Original short Arabic summaries with source attribution, not full article translations. Matching images required; source-linked supported YouTube videos are verified and included in the video library.
- Groq qwen/qwen3.8-27b handles text and images. This is a preview model and may change. Optional GROQ_TEXT_MODEL and GROQ_VISION_MODEL repository variables must name compatible JSON/text and JSON/vision models respectively.
- Requests are spaced 65 seconds apart, timed out after 45 seconds, retried at most twice for temporary failures, and capped at 10 total attempts per run. Normal full drafts can take several minutes because of free-tier pacing.
- Authentication/daily-quota failures stop further AI requests. Invalid, unsupported or incomplete content is held; no fabricated fallback articles are published.
- discovery mode checks publishers without any API key; connection tests the provider; draft creates private artifacts; publish can commit validated results.

## Remaining limitation
The approved X account is still unavailable to automated requests in observed runs (HTTP 403). Groq does not fix that. Existing leaks remain intact and the report says source-unavailable. The script does not sign in, bypass restrictions, substitute sources or guarantee a new leak every day. Current remote leak media may also remain blocked.

## Verification
Automated tests use controlled provider responses. Live Kotaku discovery succeeded locally without an AI key; IGN returned an unavailable page. Authenticated Groq generation has NOT been verified here because your Groq key is not available. The connection workflow is the explicit live check before any article run. The free tier remains subject to Groq account limits and service availability.
