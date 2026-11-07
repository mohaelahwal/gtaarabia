import test from 'node:test';import assert from 'node:assert/strict';import {publisherLinks,articleText} from '../scripts/publisher-discovery.mjs';
test('feed and HTML links filter GTA VI only, deduplicate and enforce hosts',()=>{
 const base='https://kotaku.com/';const data='<rss><item><title><![CDATA[GTA VI news]]></title><link>https://kotaku.com/gta-6-news</link></item></rss><a href="/gta-6-news">GTA 6</a><a href="/gta-5-news">GTA 5</a><a href="https://evil.example/gta-6-news">GTA 6</a><a href="/downloads/gta-6">GTA VI</a>';
 assert.deepEqual(publisherLinks(data,base,['kotaku.com']),['https://kotaku.com/gta-6-news']);
});
test('article body excludes navigation and unrelated footer',()=>{assert.equal(articleText('<nav>GTA 6</nav><article>Actual story</article><footer>Other</footer>'),'Actual story');assert.equal(articleText('<script type="application/ld+json">{"@type":"NewsArticle","articleBody":"Real body"}</script>'),'Real body')});
