const CACHE_NAME = "site-static-v2";
const OFFLINE_URL = "offline.html";


async function cacheOffline(){
    const cache = await caches.open(CACHE_NAME);
    cache.add( OFFLINE_URL );
}

function deleteOldCache(){
    caches.keys()
    .then(keys=>{
        return Promise.all(keys
            .filter(key=>key!==CACHE_NAME)
            .map(key=>caches.delete(key))
        )
    });
}

async function onlineOrOffline(req){
    try {
        // Always try the network first.
        return await fetch(req);
    } catch (error) {
        console.log(error)
        // if there is a network error, respond with offline files
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(OFFLINE_URL);
        return cachedResponse;
    }
}

self.addEventListener("install", (event) => {
    event.waitUntil( cacheOffline() );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil( deleteOldCache() );
});

self.addEventListener("fetch", (event) => {
    
    event.respondWith( onlineOrOffline(event.request) );
});
