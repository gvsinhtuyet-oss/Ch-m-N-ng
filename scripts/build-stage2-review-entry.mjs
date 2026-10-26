// Fresh review entry under a path excluded by every existing PWA navigation cache.
// Reuse the exact built app; no duplicate renderer or game data.
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const html=readFileSync('dist/index.html','utf8').replace(/<script[^>]*src="\/registerSW.js"[^>]*><\/script>/g,'');
mkdirSync('dist/api',{recursive:true});
for(const name of ['stage2-match-review-v2.html','stage2-title-fit-v3.html','stage2-title-fit-v4.html'])writeFileSync('dist/api/'+name,html);
