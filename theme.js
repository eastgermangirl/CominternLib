(function () {
    'use strict';
    var STORAGE_KEY = 'theme';
    var COOKIE_NAME = 'marx2mao_theme';
    var COOKIE_MAX_AGE = 31536000;
    var THEME_IMAGE_FADE_MS = 160;
    function readTheme() {
        try {
            var t = localStorage.getItem(STORAGE_KEY);
            if (t === 'dark' || t === 'light') return t;
        } catch (e) {}
        try {
            var m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_NAME + '=(dark|light)(?:;|$)'));
            if (m) return m[1];
        } catch (e2) {}
        return 'dark';
    }
    function writeTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) {}
        try {
            document.cookie = COOKIE_NAME + '=' + theme + '; path=/; max-age=' + COOKIE_MAX_AGE + '; SameSite=Lax';
        } catch (e2) {}
    }
    function applyTheme(theme, animateImage) {
        var body = document.body;
        if (!body) return;
        var themeToggle = document.getElementById('theme-toggle');
        var isDark = theme === 'dark';
        if (isDark) body.classList.add('dark-theme');
        else body.classList.remove('dark-theme');
        if (themeToggle) themeToggle.checked = isDark;
        var mainImage = document.getElementById('mainImage');
        if (!mainImage) return;
        var darkSrc = mainImage.getAttribute('data-dark-src');
        var lightSrc = mainImage.getAttribute('data-light-src');
        var targetSrc = isDark ? darkSrc || mainImage.src : lightSrc || mainImage.src;
        if (!animateImage || (!darkSrc && !lightSrc)) {
            mainImage.src = targetSrc;
            mainImage.style.opacity = '1';
            return;
        }
        var current = mainImage.getAttribute('src') || mainImage.src;
        var base = current.split('/').pop();
        var targetFile = targetSrc.split('/').pop();
        if (base === targetFile || current.endsWith(targetFile)) {
            mainImage.style.opacity = '1';
            return;
        }
        function fadeInWhenReady() {
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    mainImage.style.opacity = '1';
                });
            });
        }
        function assignAndReveal() {
            var loader = new Image();
            loader.onload = function () {
                mainImage.src = targetSrc;
                fadeInWhenReady();
            };
            loader.onerror = function () {
                mainImage.src = targetSrc;
                fadeInWhenReady();
            };
            loader.src = targetSrc;
        }
        var fadeOutDone = false;
        function afterFadeOut(ev) {
            if (ev && ev.propertyName !== 'opacity') return;
            if (fadeOutDone) return;
            fadeOutDone = true;
            mainImage.removeEventListener('transitionend', afterFadeOut);
            assignAndReveal();
        }
        mainImage.addEventListener('transitionend', afterFadeOut);
        mainImage.style.opacity = '0';
        window.setTimeout(afterFadeOut, THEME_IMAGE_FADE_MS + 50);
    }

    window.M2M_afterNavigation = function () {
        applyTheme(readTheme(), false);
        if (typeof window.M2M_setupTopNavAutoHide === 'function') {
            window.M2M_setupTopNavAutoHide();
        }
    };

    if (!window.__M2M_THEME_DELEGATION) {
        window.__M2M_THEME_DELEGATION = true;
        document.addEventListener('change', function (e) {
            var t = e.target;
            if (!t || t.id !== 'theme-toggle') return;
            var theme = t.checked ? 'dark' : 'light';
            writeTheme(theme);
            applyTheme(theme, true);
        });
    }
    if (!window.__M2M_THEME_STORAGE) {
        window.__M2M_THEME_STORAGE = true;
        window.addEventListener('storage', function (e) {
            if (e.key === STORAGE_KEY && (e.newValue === 'dark' || e.newValue === 'light')) {
                applyTheme(e.newValue, true);
            }
        });
    }

    applyTheme(readTheme(), false);
})();
