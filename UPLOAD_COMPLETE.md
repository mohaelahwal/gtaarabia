# GTA Arabia — complete upload package

This ZIP contains the entire site plus both automation scripts. Its top level is the repository root: index.html, data/, assets/, scripts/, .github/ and the rest.

1. GitHub Desktop: Fetch origin, then Pull origin if offered.
2. Make a backup of your repository folder. If you edited content since this bundle was prepared, merge your newer data/posts.json, data/videos.json, data/catalog.json and data/research.json rather than overwriting them.
3. Repository > Show in Explorer. Extract this ZIP there and merge/replace the included files. Keep your existing .git folder; none is included in this ZIP. Include the .github folder.
4. Commit and Push origin. Publish website will rebuild and deploy the updated site.
5. Check the gold التسريبات tab. Two eligible public leak claims are included, with a four-card limit. Both remain explicitly unconfirmed.
6. Actions > Daily Arabic content > Run workflow > main > draft. Keep AUTOMATION_ENABLED and AUTO_PUBLISH unset/false until a successful draft has been reviewed.

Your GitHub secret and Pages custom-domain setting are not changed by this ZIP.

Known limits: the two current media files could not be downloaded (CDN HTTP 403), so they reference original media URLs and show a fallback if blocked. A live Gemini draft has not passed yet. See AUTOPILOT_SETUP.md for full setup, reports and schedule controls.
