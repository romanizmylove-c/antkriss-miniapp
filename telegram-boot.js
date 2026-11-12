/* Telegram Mini App lifecycle: fullscreen, scroll isolation and safe areas. */
(() => {
  'use strict';

  function initTelegramShell() {
    const webApp = window.Telegram && window.Telegram.WebApp;
    const launchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
    const isTelegramLaunch = Boolean(webApp && (
      webApp.initData || launchParams.has('tgWebAppPlatform') || hashParams.has('tgWebAppPlatform')
    ));
    if (!isTelegramLaunch) return;

    const root = document.documentElement;
    root.classList.add('antkris-telegram');

    function updateViewport() {
      const fullscreen = Boolean(webApp.isFullscreen);
      root.classList.toggle('antkris-fullscreen', fullscreen);
      const stable = Number(webApp.viewportStableHeight) || 0;
      const visible = window.visualViewport ? Number(window.visualViewport.height) : 0;
      const height = fullscreen && visible > 200 ? visible : (stable > 200 ? stable : visible);
      if (height > 200) {
        root.style.setProperty('--antkris-viewport-height', `${Math.round(height)}px`);
      } else {
        root.style.removeProperty('--antkris-viewport-height');
      }
      const safe = webApp.safeAreaInset || {};
      const content = webApp.contentSafeAreaInset || {};
      const inset = (side) => Math.max(0, Number(safe[side]) || 0) + Math.max(0, Number(content[side]) || 0);
      for (const side of ['top', 'bottom', 'left', 'right']) {
        root.style.setProperty(`--antkris-safe-${side}`, `${inset(side)}px`);
      }
    }

    try { webApp.setBackgroundColor?.('#ffffff'); } catch (_) {}
    try { webApp.setHeaderColor?.('#ffffff'); } catch (_) {}
    try { webApp.setBottomBarColor?.('#ffffff'); } catch (_) {}

    for (const event of ['viewportChanged', 'safeAreaChanged', 'contentSafeAreaChanged', 'fullscreenChanged', 'fullscreenFailed', 'activated']) {
      try { webApp.onEvent?.(event, updateViewport); } catch (_) {}
    }
    window.addEventListener('resize', updateViewport, { passive: true });
    window.visualViewport?.addEventListener('resize', updateViewport, { passive: true });
    window.addEventListener('pageshow', updateViewport, { passive: true });

    updateViewport();
    try { webApp.ready?.(); } catch (_) {}
    try { webApp.expand?.(); } catch (_) {}
    try {
      if (typeof webApp.disableVerticalSwipes === 'function' &&
          (!webApp.isVersionAtLeast || webApp.isVersionAtLeast('7.7'))) {
        webApp.disableVerticalSwipes();
      }
    } catch (_) {}
    try {
      if (!webApp.isFullscreen && typeof webApp.requestFullscreen === 'function' &&
          (!webApp.isVersionAtLeast || webApp.isVersionAtLeast('8.0'))) {
        webApp.requestFullscreen();
      }
    } catch (_) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTelegramShell, { once: true });
  } else {
    initTelegramShell();
  }
})();
