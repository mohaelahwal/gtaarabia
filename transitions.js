const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let navigating=false;
export function navigate(url){
 if(navigating)return;
 if(reduced()){location.assign(url);return;}
 navigating=true;document.documentElement.classList.add('page-leaving');
 window.setTimeout(()=>location.assign(url),160);
}
document.addEventListener('click',event=>{
 if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const link=event.target.closest('a[href]');if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self')||link.classList.contains('skip'))return;
 const url=new URL(link.href,document.baseURI);if(url.origin!==location.origin||!/^https?:$/.test(url.protocol))return;
 if(url.pathname===location.pathname&&url.search===location.search)return;
 event.preventDefault();navigate(url.href);
});
window.addEventListener('pageshow',()=>{navigating=false;document.documentElement.classList.remove('page-leaving')});
