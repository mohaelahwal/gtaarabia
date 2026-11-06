# إعداد الإعلانات لاحقاً / Future AdSense setup

الإعلانات معطلة الآن. لا يتم تحميل Google AdSense ولا إرسال طلبات إعلانية ولا عرض فراغات إعلانية.

To earn from display ads, connect **Google AdSense**, not a Google Ads advertiser campaign.

1. Add and verify the production domain in your AdSense account and complete its site review.
2. Create responsive display units for `contentTop` and `contentBottom`.
3. In `data/config.json`, populate `ads.publisherId` with your real `ca-pub-…` ID and `ads.slots` with the numeric unit IDs. Keep `enabled: false` until ready.
4. Add Google's exact account-provided ads.txt line to a new `ads.txt` at the domain root. No invented publisher record is shipped. If deploying dist, copy that file into dist after the build, or add it to the build copy list.
5. Add the required privacy disclosures and an appropriate consent platform. Its approved consent callback must call `window.gtaArabiaAds?.grantConsent()`. Never call this automatically on page load. The integration is intentionally not activated here. Revoke consent via your consent manager and `window.gtaArabiaAds?.revokeConsent()`; this reloads the page with ad consent unset.
6. Set `ads.enabled: true`, rebuild and deploy only after those steps. Test your consent flow and mobile layout without clicking your own ads.

Two positions are prepared after the page introduction and after the main content. The video library only uses the bottom position so its grid stays near the top. Missing/invalid publisher or slot IDs prevent requests. Disabled slots remain hidden.

Reference: https://support.google.com/adsense/answer/9274019
