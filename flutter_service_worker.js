'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "favicon.png": "245902ad1e5ce2ecab85784b16bf3a6b",
"manifest.json": "bd02a6d15ff2bacad4a9b8b04f379101",
"version.json": "6a79530c71326abb6e08c612078a2471",
"splash/style.css": "3e8699dd65a865ff991ec5b47a93643d",
"splash/img/light-3x.png": "c6aaee8ea3a35aa89ae62b10e3adb096",
"splash/img/light-2x.png": "d770b122ddfbcefcf168626f8ccc36ed",
"splash/img/dark-3x.png": "c6aaee8ea3a35aa89ae62b10e3adb096",
"splash/img/dark-1x.png": "9c2b2817b055e2bf4cddd9ccad3c643f",
"splash/img/light-1x.png": "9c2b2817b055e2bf4cddd9ccad3c643f",
"splash/img/light-4x.png": "4caff1f9bfd32d50ec50654bb1fe906f",
"splash/img/dark-4x.png": "4caff1f9bfd32d50ec50654bb1fe906f",
"splash/img/dark-2x.png": "d770b122ddfbcefcf168626f8ccc36ed",
"splash/splash.js": "123c400b58bea74c1305ca3ac966748d",
"canvaskit/canvaskit.js": "97937cb4c2c2073c968525a3e08c86a3",
"canvaskit/canvaskit.wasm": "3de12d898ec208a5f31362cc00f09b9e",
"canvaskit/profiling/canvaskit.js": "c21852696bc1cc82e8894d851c01921a",
"canvaskit/profiling/canvaskit.wasm": "371bc4e204443b0d5e774d64a046eb99",
"flutter.js": "a85fcf6324d3c4d3ae3be1ae4931e9c5",
"assets/FontManifest.json": "7b2a36307916a9721811788013e65289",
"assets/CHANGELOG.md": "92264207ab5698535a67022a45aa0c06",
"assets/Contributors.md": "15d7069cd7b9617ac0a560460d893f33",
"assets/assets/markdown/how_to_contribute.md": "bac17879cd1e49fa3588b815bb88074b",
"assets/assets/svg/password_illustration.svg": "c75c278dafcaf9fffc191d6975a67554",
"assets/assets/svg/success_illustration.svg": "e11af632045735bc0c1d867556fa7f22",
"assets/assets/svg/empty_illustration.svg": "d14b9ebb8e424730ce6e50b43b8ae583",
"assets/assets/images/placeholder.png": "545a89115bbbb9281c6908b08abd1e80",
"assets/assets/images/star_grey.png": "5907071338581de54071114ab2af5ff5",
"assets/assets/images/star_yellow.png": "e879217f29ed29bb1e19297ce920b532",
"assets/assets/images/github.png": "064ace4777ac86d7627f455f36975452",
"assets/assets/images/gits-light.png": "b034769fe919659bb6537a19c44d232b",
"assets/assets/images/github-mark.png": "eb94bb97c3410733ce017b184d314723",
"assets/assets/images/gits-dark.png": "2681bccb87c98de44c4f465fcb20f9d6",
"assets/NOTICES": "54ffed59a7a32fd7ca3978dd7aaece9a",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/AssetManifest.json": "82801d0db320e7ee5b5b28fee53253d6",
"index.html": "a863b2628edc055ca25b06347ceba4dd",
"/": "a863b2628edc055ca25b06347ceba4dd",
"main.dart.js": "a382120a00af279e2bb1c83661af4f03",
"icons/Icon-512.png": "96eee214578dd7224ae7bc31bd9522f3",
"icons/Icon-maskable-192.png": "8154e63d50bb3ba9cf9434cf433b98a7",
"icons/Icon-maskable-512.png": "96eee214578dd7224ae7bc31bd9522f3",
"icons/Icon-192.png": "8154e63d50bb3ba9cf9434cf433b98a7"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
