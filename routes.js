export const characterSlugs=['jason-duval','lucia-caminos','cal-hampton','boobie-ike','drequan-priest','real-dimez','raul-bautista','brian-heder','kodak-black'];
export function routeFile(route='home'){
 const [page,id]=route.replace(/^#/,'').split('/');
 const sections={leaks:'leaks/index.html',home:'index.html',guide:'guide/index.html',english:'en/index.html',news:'news/index.html',map:'map/index.html',cars:'vehicles/index.html',weapons:'weapons/index.html',characters:'characters/index.html',stories:'stories/index.html',videos:'videos/index.html',about:'about/index.html'};
 if(page==='post'&&/^[a-z0-9-]+$/.test(id))return `articles/${id}/index.html`;
 if(page==='video'&&/^[\w-]{11}$/.test(id))return `videos/${id}/index.html`;
 if(page==='character'&&characterSlugs[Number(id)])return `characters/${characterSlugs[Number(id)]}/index.html`;
 if(page==='character'&&/^\d+$/.test(id))return `characters/entry-${id}/index.html`;
 if(page==='vehicle'&&/^[a-z0-9-]+$/.test(id))return `vehicles/${id}/index.html`;
 if(page==='weapon'&&/^[a-z0-9-]+$/.test(id))return `weapons/${id}/index.html`;
 return sections[page]||'404.html';
}
