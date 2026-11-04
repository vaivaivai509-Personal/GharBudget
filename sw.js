/* Cache only the public app shell. Google API data and tokens never enter this cache. */
const PREFIX='ghar-'+encodeURIComponent(self.registration.scope)+'-shell-';
const CACHE=PREFIX+'2.5.0';
const FILES=['./','./index.html','./app-config.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png'];
const URLS=new Set(FILES.map(file=>new URL(file,self.registration.scope).href));
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('message',event=>{if(event.data&&event.data.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);url.search='';url.hash='';
  if(request.method!=='GET'||request.headers.has('Authorization')||!URLS.has(url.href))return;
  event.respondWith(fetch(request).then(response=>{
    if(response.ok&&response.type==='basic'){
      const key=request.mode==='navigate'?new URL('./index.html',self.registration.scope).href:url.href;
      const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(key,copy)));
    }
    return response;
  }).catch(()=>caches.open(CACHE).then(cache=>cache.match(request.mode==='navigate'?new URL('./index.html',self.registration.scope).href:url.href)).then(response=>response||Response.error())));
});
