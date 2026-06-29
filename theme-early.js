(function () {
    'use strict';

    function pathLeafIsDocumentLike(lastSeg) {
        return (
            /\.(html?|htm|ico|css|js|gif|png|jpe?g|webp|svg|woff2?|txt|json|xml|map|pdf|zip)$/i.test(
                lastSeg
            ) || lastSeg === 'Index'
        );
    }

    function computeDirectoryBaseHref() {
        var u = new URL(location.href);
        var path = u.pathname;
        if (path.endsWith('/')) {
            return u.origin + path;
        }
        var parts = path.split('/').filter(function (s) {
            return s.length > 0;
        });
        var last = parts.length ? parts[parts.length - 1] : '';
        if (pathLeafIsDocumentLike(last)) {
            parts.pop();
            if (!parts.length) {
                return u.origin + '/';
            }
            return u.origin + '/' + parts.join('/') + '/';
        }
        return u.origin + path + '/';
    }

    function ensureDirectoryBase() {
        var head = document.head;
        if (!head) {
            return;
        }
        if (head.querySelector('base[href]')) {
            return;
        }
        var baseEl = document.createElement('base');
        baseEl.href = computeDirectoryBaseHref();
        head.insertBefore(baseEl, head.firstChild);
    }

    ensureDirectoryBase();

    var path = location.pathname;
    if (path.length > 1 && !path.endsWith('/')) {
        var lastSeg = path.split('/').pop() || '';
        if (!pathLeafIsDocumentLike(lastSeg)) {
            location.replace(path + '/' + location.search + location.hash);
            return;
        }
    }
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1';
        if (document.head) {
            document.head.appendChild(meta);
        }
    }
    function readTheme() {
        try {
            var t = localStorage.getItem('theme');
            if (t === 'dark' || t === 'light') {
                return t;
            }
        } catch (e) {}
        try {
            var m = document.cookie.match(/(?:^|; )marx2mao_theme=(dark|light)(?:;|$)/);
            if (m) {
                return m[1];
            }
        } catch (e2) {}
        return 'dark';
    }
    function applyBodyTheme() {
        var b = document.body;
        if (!b) {
            return;
        }
        var theme = readTheme();
        if (theme === 'light') {
            b.classList.remove('dark-theme');
        } else {
            b.classList.add('dark-theme');
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyBodyTheme);
    } else {
        applyBodyTheme();
    }
})();
