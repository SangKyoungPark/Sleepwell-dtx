// ============================================
// SleepWell DTx - Service Worker
// ============================================

const CACHE_NAME = "sleepwell-v1";
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
	"/",
	"/offline",
	"/manifest.json",
	"/icons/icon.svg",
];

// --- Install: 앱 셸 프리캐시 ---
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(PRECACHE_URLS);
		})
	);
	self.skipWaiting();
});

// --- Activate: 이전 캐시 정리 ---
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((name) => name !== CACHE_NAME)
					.map((name) => caches.delete(name))
			);
		})
	);
	self.clients.claim();
});

// --- Fetch: 네비게이션=network-first, 정적=cache-first, API=패스스루 ---
self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// API 요청은 패스스루
	if (url.pathname.startsWith("/api")) {
		return;
	}

	// 네비게이션 요청: network-first + offline 폴백
	if (request.mode === "navigate") {
		event.respondWith(
			fetch(request)
				.then((response) => {
					// 성공 응답을 캐시에 저장
					const clone = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(request, clone);
					});
					return response;
				})
				.catch(() => {
					// 네트워크 실패 시 캐시 → offline 폴백
					return caches.match(request).then((cached) => {
						return cached || caches.match(OFFLINE_URL);
					});
				})
		);
		return;
	}

	// 정적 리소스: cache-first
	if (
		url.pathname.startsWith("/_next/static") ||
		url.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$/)
	) {
		event.respondWith(
			caches.match(request).then((cached) => {
				if (cached) return cached;
				return fetch(request).then((response) => {
					const clone = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(request, clone);
					});
					return response;
				});
			})
		);
		return;
	}
});

// --- Message: SHOW_NOTIFICATION 수신 ---
self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SHOW_NOTIFICATION") {
		const { title, options } = event.data;
		self.registration.showNotification(title, options);
	}
});

// --- Notification Click: 해당 URL로 포커스/열기 ---
self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	const targetUrl = event.notification.data?.url || "/home";

	event.waitUntil(
		self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
			// 이미 열린 탭이 있으면 포커스
			for (const client of clients) {
				if (new URL(client.url).pathname === targetUrl && "focus" in client) {
					return client.focus();
				}
			}
			// 없으면 새 탭 열기
			if (self.clients.openWindow) {
				return self.clients.openWindow(targetUrl);
			}
		})
	);
});
