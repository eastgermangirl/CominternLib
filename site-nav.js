(function () {
    'use strict';

    var topNavScrollHandler = null;
    var topNavResizeHandler = null;
    var topNavBound = false;

    function setupTopNavAutoHide() {
        var nav = document.querySelector('.m2m-top-nav');
        if (!nav) {
            document.documentElement.classList.remove('m2m-has-top-nav');
            document.documentElement.style.removeProperty('--m2m-top-nav-pad');
            if (topNavBound && topNavScrollHandler) {
                window.removeEventListener('scroll', topNavScrollHandler);
                window.removeEventListener('resize', topNavResizeHandler);
                if (window.visualViewport) {
                    window.visualViewport.removeEventListener('scroll', topNavScrollHandler);
                    window.visualViewport.removeEventListener('resize', topNavResizeHandler);
                }
                topNavBound = false;
                topNavScrollHandler = null;
                topNavResizeHandler = null;
            }
            return;
        }

        if (topNavBound && topNavScrollHandler) {
            window.removeEventListener('scroll', topNavScrollHandler);
            window.removeEventListener('resize', topNavResizeHandler);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('scroll', topNavScrollHandler);
                window.visualViewport.removeEventListener('resize', topNavResizeHandler);
            }
        }

        document.documentElement.classList.add('m2m-has-top-nav');

        function scrollYNow() {
            return window.pageYOffset || window.scrollY || document.documentElement.scrollTop || 0;
        }

        var lastY = scrollYNow();
        var collapsed = false;
        var navH = 0;
        var scrollTicking = false;

        function measureNavHeight() {
            var wasHidden = nav.classList.contains('m2m-top-nav--scroll-hidden');
            nav.classList.remove('m2m-top-nav--scroll-hidden');
            navH = Math.round(nav.getBoundingClientRect().height);
            if (wasHidden) {
                nav.classList.add('m2m-top-nav--scroll-hidden');
            }
            if (!collapsed) {
                document.documentElement.style.setProperty('--m2m-top-nav-pad', navH + 'px');
            }
        }

        function setCollapsed(c) {
            if (c === collapsed) {
                return;
            }
            collapsed = c;
            if (c) {
                nav.classList.add('m2m-top-nav--scroll-hidden');
                document.documentElement.style.setProperty('--m2m-top-nav-pad', '0px');
            } else {
                nav.classList.remove('m2m-top-nav--scroll-hidden');
                document.documentElement.style.setProperty('--m2m-top-nav-pad', navH + 'px');
            }
        }

        function onScrollFrame() {
            scrollTicking = false;
            var y = scrollYNow();
            var dy = y - lastY;
            lastY = y;
            var narrow =
                typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 768px)').matches;
            var topZone = narrow ? 14 : 10;
            var downTh = narrow ? 4 : 6;
            var upTh = narrow ? -4 : -5;
            if (y <= topZone) {
                setCollapsed(false);
                return;
            }
            if (dy > downTh) {
                setCollapsed(true);
            } else if (dy < upTh) {
                setCollapsed(false);
            }
        }

        function onScroll() {
            if (!scrollTicking) {
                scrollTicking = true;
                requestAnimationFrame(onScrollFrame);
            }
        }

        function onResize() {
            measureNavHeight();
            if (!collapsed) {
                document.documentElement.style.setProperty('--m2m-top-nav-pad', navH + 'px');
            }
        }

        measureNavHeight();
        topNavScrollHandler = onScroll;
        topNavResizeHandler = onResize;
        window.addEventListener('scroll', topNavScrollHandler, { passive: true });
        window.addEventListener('resize', topNavResizeHandler);
        if (window.visualViewport) {
            window.visualViewport.addEventListener('scroll', topNavScrollHandler, { passive: true });
            window.visualViewport.addEventListener('resize', topNavResizeHandler);
        }
        topNavBound = true;
    }

    window.M2M_setupTopNavAutoHide = setupTopNavAutoHide;

    function getSiteRootPath() {
        var host = location.hostname;
        if (host.slice(-10) === 'github.io') {
            var parts = location.pathname.split('/').filter(Boolean);
            if (parts.length && !/\.(html?|htm)$/i.test(parts[0])) {
                return '/' + parts[0];
            }
        }
        return '';
    }

    function stripSiteRootSegments(segs) {
        var root = getSiteRootPath();
        if (!root) {
            return segs;
        }
        var rootParts = root.split('/').filter(Boolean);
        if (
            segs.length >= rootParts.length &&
            segs.slice(0, rootParts.length).join('/') === rootParts.join('/')
        ) {
            return segs.slice(rootParts.length);
        }
        return segs;
    }

    function normalizePagePathname(pathname) {
        var root = getSiteRootPath();
        var path = pathname || '/';
        if (path === '/' || path === root || path === root + '/') {
            return root + '/index.html';
        }
        if (!/\.(html?|htm)$/i.test(path) && /\/Index$/i.test(path.replace(/\/+$/, ''))) {
            return path.replace(/\/+$/, '') + '.html';
        }
        return path;
    }

    function resolveFetchUrl(url) {
        var resolved = new URL(url, location.href);
        resolved.pathname = normalizePagePathname(resolved.pathname);
        return resolved;
    }

    function m2mCollectionIndexHref() {
        var segs = stripSiteRootSegments(
            location.pathname.replace(/\/+$/, '').split('/').filter(Boolean)
        );
        if (!segs.length) {
            return 'index.html';
        }
        var last = segs[segs.length - 1];
        if (/\.(html?|htm)$/i.test(last) || last === 'Index') {
            segs.pop();
        }
        if (!segs.length) {
            return 'index.html';
        }
        return 'Index.html';
    }

    var TOP_NAV_CHROME_HTML =
        '<nav class="m2m-top-nav" aria-label="Site">' +
        '<div class="home-anchor-slot">' +
        '<a class="home-button" href="#">Back</a>' +
        '</div>' +
        '<div class="theme-toggle-container">' +
        '<input class="theme-toggle-checkbox" id="theme-toggle" type="checkbox"/>' +
        '<label class="theme-toggle-label" for="theme-toggle">' +
        '<div class="theme-toggle-slider">' +
        '<svg class="sun-icon" fill="none" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="12" cy="12" fill="#FDB813" r="5"></circle>' +
        '<path d="M12 1V3M12 21V23M23 12H21M3 12H1M20.485 3.515L19.071 4.929M4.929 19.071L3.515 20.485M20.485 20.485L19.071 19.071M4.929 4.929L3.515 3.515" stroke="#FDB813" stroke-linecap="round" stroke-width="2"></path>' +
        '</svg>' +
        '<svg class="moon-icon" fill="none" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#FDB813"></path>' +
        '</svg>' +
        '</div>' +
        '</label>' +
        '</div>' +
        '</nav>';

    function rewriteRelativeResourceUrls(root, fetchedPageUrl) {
        var base;
        try {
            base = new URL(fetchedPageUrl, location.href);
        } catch (e) {
            return;
        }
        function rewriteOne(el, attr) {
            if (!el.hasAttribute(attr)) {
                return;
            }
            var raw = el.getAttribute(attr);
            if (raw == null) {
                return;
            }
            var val = raw.trim();
            if (!val) {
                return;
            }
            var lower = val.toLowerCase();
            if (
                lower.indexOf('javascript:') === 0 ||
                lower.indexOf('mailto:') === 0 ||
                lower.indexOf('data:') === 0 ||
                lower.indexOf('about:') === 0
            ) {
                return;
            }
            if (val.charAt(0) === '#') {
                return;
            }
            try {
                var resolved = new URL(val, base);
                if (resolved.origin !== location.origin) {
                    el.setAttribute(attr, resolved.href);
                    return;
                }
                el.setAttribute(attr, resolved.href);
            } catch (err) {}
        }
        var links = root.getElementsByTagName('a');
        for (var a = 0; a < links.length; a++) {
            var linkEl = links[a];
            if (linkEl.classList) {
                if (
                    linkEl.classList.contains('home-button') ||
                    linkEl.classList.contains('collection-recommended-btn') ||
                    linkEl.classList.contains('featured-button')
                ) {
                    continue;
                }
            }
            rewriteOne(linkEl, 'href');
        }
        var media = root.querySelectorAll('img[src], source[src], video[src], audio[src]');
        for (var m = 0; m < media.length; m++) {
            rewriteOne(media[m], 'src');
        }
    }

    function ensureFloatingChrome(pageUrl) {
        if (document.getElementById('theme-toggle')) {
            return false;
        }
        try {
            document.body.insertAdjacentHTML('afterbegin', TOP_NAV_CHROME_HTML);
            var backA = document.querySelector('.m2m-top-nav .home-button');
            if (backA) {
                backA.setAttribute('href', m2mCollectionIndexHref());
            }
            rewriteRelativeResourceUrls(document.body, pageUrl);
            return true;
        } catch (e) {
            return false;
        }
    }

    function bootNavChrome() {
        if (ensureFloatingChrome(location.href) && typeof window.M2M_afterNavigation === 'function') {
            window.M2M_afterNavigation();
        } else {
            setupTopNavAutoHide();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootNavChrome);
    } else {
        bootNavChrome();
    }

    var navInFlight = false;
    var scrollByUrl = {};

    function rememberScroll() {
        scrollByUrl[location.href] = window.scrollY;
    }

    function sameDocumentUrl(a, b) {
        try {
            var ua = new URL(a, location.href);
            var ub = new URL(b, location.href);
            return ua.origin === ub.origin && ua.pathname === ub.pathname && ua.search === ub.search;
        } catch (e) {
            return false;
        }
    }

    function stripPersistentScripts(bodyEl) {
        var scripts = bodyEl.querySelectorAll('script[src]');
        for (var i = scripts.length - 1; i >= 0; i--) {
            var src = scripts[i].getAttribute('src') || '';
            if (/music-player\.js|theme\.js|site-nav\.js/i.test(src)) {
                scripts[i].parentNode.removeChild(scripts[i]);
            }
        }
    }

    function syncPageHead(fromDoc) {
        document.title = fromDoc.title;
        var oldPageStyles = document.head.querySelectorAll('style[data-m2m-page]');
        for (var o = 0; o < oldPageStyles.length; o++) {
            oldPageStyles[o].parentNode.removeChild(oldPageStyles[o]);
        }
        var newStyles = fromDoc.head.querySelectorAll('style');
        for (var s = 0; s < newStyles.length; s++) {
            var clone = newStyles[s].cloneNode(true);
            clone.setAttribute('data-m2m-page', '');
            document.head.appendChild(clone);
        }
    }

    function applyFetchedPage(doc, pageUrl, scrollTop) {
        syncPageHead(doc);
        var newBody = doc.body.cloneNode(true);
        stripPersistentScripts(newBody);
        document.body.className = doc.body.className;
        document.body.innerHTML = newBody.innerHTML;
        rewriteRelativeResourceUrls(document.body, pageUrl);
        if (typeof window.M2M_afterNavigation === 'function') {
            window.M2M_afterNavigation();
        }
        window.scrollTo(0, scrollTop === undefined ? 0 : scrollTop);
    }

    function navigateTo(url, options) {
        options = options || {};
        var resolved;
        try {
            resolved = new URL(url, location.href);
        } catch (e) {
            location.href = url;
            return;
        }
        if (resolved.origin !== location.origin) {
            location.href = resolved.href;
            return;
        }
        if (!options.popstate && sameDocumentUrl(resolved.href, location.href)) {
            if (resolved.hash) {
                location.hash = resolved.hash;
            }
            return;
        }
        if (navInFlight) {
            return;
        }
        if (!options.popstate) {
            rememberScroll();
        }
        navInFlight = true;
        var fetchUrl = resolveFetchUrl(resolved.href);
        fetch(fetchUrl.href, { credentials: 'same-origin', headers: { Accept: 'text/html' } })
            .then(function (res) {
                if (!res.ok) {
                    throw new Error('HTTP ' + res.status);
                }
                return res.text();
            })
            .then(function (html) {
                var doc = new DOMParser().parseFromString(html, 'text/html');
                var scrollTarget = options.popstate ? scrollByUrl[resolved.href] || 0 : 0;
                applyFetchedPage(doc, fetchUrl.href, scrollTarget);
                if (!options.popstate) {
                    history.pushState({ m2m: true }, '', fetchUrl.href);
                }
            })
            .catch(function () {
                location.href = fetchUrl.href;
            })
            .finally(function () {
                navInFlight = false;
            });
    }

    function findNavAnchor(target) {
        var el = target;
        while (el && el !== document) {
            if (el.nodeType === 1 && el.tagName === 'A') {
                return el;
            }
            el = el.parentNode;
        }
        return null;
    }

    function shouldInterceptLink(a, ev) {
        if (!a || !a.href) {
            return false;
        }
        if (a.hasAttribute('download')) {
            return false;
        }
        var target = (a.getAttribute('target') || '').toLowerCase();
        if (target && target !== '_self') {
            return false;
        }
        if (ev && (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey)) {
            return false;
        }
        var href = a.getAttribute('href');
        if (!href || href.charAt(0) === '#') {
            return false;
        }
        var lower = href.trim().toLowerCase();
        if (
            lower.indexOf('javascript:') === 0 ||
            lower.indexOf('mailto:') === 0 ||
            lower.indexOf('tel:') === 0
        ) {
            return false;
        }
        try {
            var url = new URL(href, location.href);
            if (url.origin !== location.origin) {
                return false;
            }
            if (url.pathname === location.pathname && url.search === location.search && url.hash) {
                return false;
            }
            var path = normalizePagePathname(url.pathname);
            return /\.(html?|htm)$/i.test(path) || path === getSiteRootPath() + '/index.html';
        } catch (err) {
            return false;
        }
    }

    if (!window.__M2M_NAVIGATION) {
        window.__M2M_NAVIGATION = true;
        document.addEventListener('click', function (ev) {
            var a = findNavAnchor(ev.target);
            if (!shouldInterceptLink(a, ev)) {
                return;
            }
            ev.preventDefault();
            navigateTo(a.href);
        });
        window.addEventListener('popstate', function () {
            navigateTo(location.href, { popstate: true });
        });
    }
})();
