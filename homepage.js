(function () {
    'use strict';

    if (window.__M2M_HOMEPAGE_JS) {
        return;
    }
    window.__M2M_HOMEPAGE_JS = true;

    // ASCII + \u escapes so phrases stay correct even if the JS file
    // is decoded with a non-UTF-8 charset after SPA navigation.
    var PHRASES = [
        "Workers of the world, unite!",
        "Proletarier aller L\u00e4nder, vereinigt euch!",
        "Prol\u00e9taires de tous les pays, unissez-vous!",
        "\u041f\u0440\u043e\u043b\u0435\u0442\u0430\u0440\u0438\u0438 \u0432\u0441\u0435\u0445 \u0441\u0442\u0440\u0430\u043d, \u0441\u043e\u0435\u0434\u0438\u043d\u044f\u0439\u0442\u0435\u0441\u044c!",
        "\u00a1Proletarios de todos los pa\u00edses, un\u00edos!",
        "Proletari di tutti i paesi, unitevi!",
        "\u5168\u4e16\u754c\u65e0\u4ea7\u8005\uff0c\u8054\u5408\u8d77\u6765\uff01",
        "\u4e07\u56fd\u306e\u52b4\u50cd\u8005\u3088\u3001\u56e3\u7d50\u305b\u3088\uff01",
        "\u064a\u0627 \u0639\u0645\u0627\u0644 \u0627\u0644\u0639\u0627\u0644\u0645\u060c \u0627\u062a\u062d\u062f\u0648\u0627!",
        "Trabalhadores do mundo, uni-vos!",
        "Proletariusze wszystkich kraj\u00f3w, \u0142\u0105czcie si\u0119!",
        "Proletari\u00ebrs aller landen, verenigt u!",
        "Prolet\u00e4rer i alla l\u00e4nder, f\u00f6renen eder!",
        "\u03a0\u03c1\u03bf\u03bb\u03b5\u03c4\u03ac\u03c1\u03b9\u03bf\u03b9 \u03cc\u03bb\u03c9\u03bd \u03c4\u03c9\u03bd \u03c7\u03c9\u03c1\u03ce\u03bd, \u03b5\u03bd\u03c9\u03b8\u03b5\u03af\u03c4\u03b5!",
        "B\u00fct\u00fcn \u00fclkelerin i\u015f\u00e7ileri, birle\u015fin!",
        "\ub9cc\uad6d\uc758 \ub178\ub3d9\uc790\uc5ec, \ub2e8\uacb0\ud558\ub77c!",
        "V\u00f4 s\u1ea3n t\u1ea5t c\u1ea3 c\u00e1c n\u01b0\u1edbc, \u0111o\u00e0n k\u1ebft l\u1ea1i!",
        "\u0926\u0941\u0928\u093f\u092f\u093e \u0915\u0947 \u092e\u091c\u0926\u0942\u0930\u094b\u0902, \u090f\u0915 \u0939\u094b!",
        "Prolet\u00e1\u0159i v\u0161ech zem\u00ed, spojte se!",
        "Vil\u00e1g prolet\u00e1rjai, egyes\u00fcljetek!",
        "Proletari din toate \u021b\u0103rile, uni\u021bi-v\u0103!",
        "Kaikkien maiden proletaarit, liittyk\u00e4\u00e4 yhteen!",
        "Proletarer i alle land, foren dere!",
        "Proletarer i alle lande, for\u00e9n jer!",
        "Proletoj el \u0109iuj landoj, unui\u011du!",
        "\u041f\u0440\u043e\u043b\u0435\u0442\u0430\u0440\u0456 \u0432\u0441\u0456\u0445 \u043a\u0440\u0430\u0457\u043d, \u0454\u0434\u043d\u0430\u0439\u0442\u0435\u0441\u044f!",
        "\u041f\u0440\u043e\u043b\u0435\u0442\u0430\u0440\u0438\u0438 \u043e\u0442 \u0432\u0441\u0438\u0447\u043a\u0438 \u0441\u0442\u0440\u0430\u043d\u0438, \u0441\u044a\u0435\u0434\u0438\u043d\u044f\u0432\u0430\u0439\u0442\u0435 \u0441\u0435!",
        "Proleteri svih zemalja, ujedinite se!",
        "\u00a1Trabajadores del mundo, un\u00edos!",
        "Travailleurs du monde, unissez-vous!"
    ];

    var flashTimer = null;
    var openPanel = null;
    var lastTrigger = null;

    function stopUniteFlash() {
        if (flashTimer != null) {
            clearInterval(flashTimer);
            flashTimer = null;
        }
    }

    function startUniteFlash() {
        stopUniteFlash();
        var el = document.getElementById('unite-flash');
        if (!el) {
            return;
        }
        var preferReduced =
            window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (preferReduced) {
            return;
        }
        var i = 0;
        flashTimer = window.setInterval(function () {
            var live = document.getElementById('unite-flash');
            if (!live) {
                stopUniteFlash();
                return;
            }
            i = (i + 1) % PHRASES.length;
            live.textContent = PHRASES[i];
        }, 90);
    }

    function setExpanded(category, expanded) {
        var triggers = document.querySelectorAll('.category-trigger');
        for (var i = 0; i < triggers.length; i++) {
            if (triggers[i].getAttribute('data-category') === category) {
                triggers[i].setAttribute('aria-expanded', expanded ? 'true' : 'false');
            }
        }
    }

    function closeCategory() {
        if (!openPanel || !document.body.contains(openPanel)) {
            openPanel = null;
            document.body.classList.remove('category-open');
            var staleBackdrop = document.getElementById('category-backdrop');
            if (staleBackdrop) {
                staleBackdrop.classList.remove('is-open');
                staleBackdrop.hidden = true;
            }
            return;
        }
        var id = openPanel.id;
        var category = id.replace(/^panel-/, '');
        openPanel.classList.remove('is-open');
        openPanel.hidden = true;
        var backdrop = document.getElementById('category-backdrop');
        if (backdrop) {
            backdrop.classList.remove('is-open');
            backdrop.hidden = true;
        }
        document.body.classList.remove('category-open');
        setExpanded(category, false);
        openPanel = null;
        if (lastTrigger && document.body.contains(lastTrigger)) {
            lastTrigger.focus();
        }
        lastTrigger = null;
    }

    function openCategory(category, trigger) {
        var panel = document.getElementById('panel-' + category);
        var backdrop = document.getElementById('category-backdrop');
        if (!panel || !backdrop) {
            return;
        }
        if (openPanel && openPanel !== panel) {
            openPanel.classList.remove('is-open');
            openPanel.hidden = true;
            setExpanded(openPanel.id.replace(/^panel-/, ''), false);
        }
        openPanel = panel;
        lastTrigger = trigger || null;
        panel.hidden = false;
        backdrop.hidden = false;
        document.body.classList.add('category-open');
        void panel.offsetWidth;
        panel.classList.add('is-open');
        backdrop.classList.add('is-open');
        setExpanded(category, true);
        var closeBtn = panel.querySelector('[data-close-panel]');
        if (closeBtn) {
            closeBtn.focus();
        }
    }

    function onDocumentClick(event) {
        var target = event.target;
        if (!target || !target.closest) {
            return;
        }
        if (target.closest('[data-close-panel]')) {
            closeCategory();
            return;
        }
        if (target.closest('#category-backdrop')) {
            closeCategory();
            return;
        }
        var trigger = target.closest('.category-trigger');
        if (!trigger) {
            return;
        }
        var category = trigger.getAttribute('data-category');
        if (!category) {
            return;
        }
        if (openPanel && openPanel.id === 'panel-' + category) {
            closeCategory();
            return;
        }
        openCategory(category, trigger);
    }

    function onDocumentKeydown(event) {
        if (event.key === 'Escape') {
            closeCategory();
        }
    }

    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', onDocumentKeydown);

    function initHomepage() {
        openPanel = null;
        lastTrigger = null;
        closeCategory();
        startUniteFlash();
    }

    window.M2M_initHomepage = initHomepage;

    var prevAfterNav = window.M2M_afterNavigation;
    window.M2M_afterNavigation = function () {
        if (typeof prevAfterNav === 'function') {
            prevAfterNav();
        }
        initHomepage();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHomepage);
    } else {
        initHomepage();
    }
})();
