(function () {
    'use strict';

    if (window.__M2M_MUSIC_PLAYER) {
        return;
    }

    var LS_KEY = 'm2m_music_player_v1';
    var COOKIE_MAX_AGE_SEC = 365 * 24 * 60 * 60;
    var SAVE_INTERVAL_MS = 400;

    function cookieGet(name) {
        var m = document.cookie.match(
            new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
        );
        return m ? decodeURIComponent(m[1]) : null;
    }

    function cookieSet(name, value) {
        document.cookie =
            name +
            '=' +
            encodeURIComponent(value) +
            ';path=/;max-age=' +
            COOKIE_MAX_AGE_SEC +
            ';SameSite=Lax';
    }

    var scriptEl = document.currentScript;
    if (!scriptEl || !scriptEl.src) {
        return;
    }
    var assetBase = new URL('.', scriptEl.src);
    var audioSrc = new URL('music.mp3', assetBase).href;
    var thumbSrc = new URL('music_thumbnail.jpg', assetBase).href;

    function parseStoredState(raw) {
        if (!raw) return null;
        try {
            var o = JSON.parse(raw);
            if (!o || typeof o !== 'object') return null;
            return {
                t: typeof o.t === 'number' && isFinite(o.t) ? o.t : 0,
                v: typeof o.v === 'number' && isFinite(o.v) ? Math.min(1, Math.max(0, o.v)) : 0.85,
                playing: o.playing === true,
                collapsed: o.collapsed === true
            };
        } catch (e) {
            return null;
        }
    }

    function loadState() {
        try {
            var fromLs = parseStoredState(localStorage.getItem(LS_KEY));
            if (fromLs) return fromLs;
        } catch (e) {}
        return parseStoredState(cookieGet(LS_KEY));
    }

    function saveState(state) {
        var s = JSON.stringify(state);
        try {
            localStorage.setItem(LS_KEY, s);
        } catch (e) {}
        try {
            cookieSet(LS_KEY, s);
        } catch (e) {}
    }

    var stored = loadState();
    var intendedPlaying = stored ? stored.playing === true : false;
    var state = {
        t: stored ? stored.t : 0,
        v: stored ? stored.v : 0.85,
        collapsed: stored ? stored.collapsed : false
    };

    var root = document.createElement('div');
    root.className = 'm2m-music-player' + (state.collapsed ? ' m2m-music-player--collapsed' : '');
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', 'Sovietwave Radio, site music');

    root.innerHTML =
        '<button type="button" class="m2m-music-player__peek" aria-label="Expand music player" title="Show player">' +
        '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg></button>' +
        '<div class="m2m-music-player__panel">' +
        '<p class="m2m-music-player__title">Sovietwave Radio</p>' +
        '<button type="button" class="m2m-music-player__minimize" aria-label="Minimize music player" title="Hide player">' +
        '<svg class="m2m-music-player__icon-min" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg></button>' +
        '<div class="m2m-music-player__row">' +
        '<div class="m2m-music-player__cover-wrap">' +
        '<img class="m2m-music-player__cover" src="' +
        thumbSrc +
        '" alt="" width="64" height="64" decoding="async">' +
        '</div>' +
        '<button type="button" class="m2m-music-player__play" aria-label="Play" data-playing="false">' +
        '<svg class="m2m-music-player__icon-play" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
        '<svg class="m2m-music-player__icon-pause" style="display:none" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>' +
        '</button></div>' +
        '<label class="m2m-music-player__vol"><span class="visually-hidden">Volume</span>' +
        '<input type="range" min="0" max="1" step="0.01" aria-label="Volume"></label></div>';

    var audio = document.createElement('audio');
    audio.setAttribute('data-m2m-music', '');
    audio.preload = 'auto';
    audio.loop = true;
    audio.src = audioSrc;

    var linkPreload = document.createElement('link');
    linkPreload.rel = 'preload';
    linkPreload.as = 'audio';
    linkPreload.href = audioSrc;
    document.head.appendChild(linkPreload);

    var btnPeek = root.querySelector('.m2m-music-player__peek');
    var btnMin = root.querySelector('.m2m-music-player__minimize');
    var btnPlay = root.querySelector('.m2m-music-player__play');
    var iconPlay = root.querySelector('.m2m-music-player__icon-play');
    var iconPause = root.querySelector('.m2m-music-player__icon-pause');
    var volInput = root.querySelector('.m2m-music-player__vol input');

    volInput.value = String(state.v);
    audio.volume = state.v;

    var lastSave = 0;
    function persist() {
        var audioT = audio.currentTime;
        if (!isFinite(audioT) || audioT < 0) {
            audioT = 0;
        }
        var t;
        if (!appliedSeek || audio.seeking) {
            t = typeof state.t === 'number' && isFinite(state.t) ? Math.max(0, state.t) : 0;
        } else {
            t = audioT;
            state.t = t;
        }
        saveState({
            t: t,
            v: audio.volume,
            playing: intendedPlaying,
            collapsed: root.classList.contains('m2m-music-player--collapsed')
        });
    }

    window.M2M_flushMusicState = persist;

    function persistThrottled() {
        var now = Date.now();
        if (now - lastSave < SAVE_INTERVAL_MS) return;
        lastSave = now;
        persist();
    }

    function setPlayUi(playing) {
        btnPlay.setAttribute('data-playing', playing ? 'true' : 'false');
        btnPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play');
        iconPlay.style.display = playing ? 'none' : 'block';
        iconPause.style.display = playing ? 'block' : 'none';
    }

    setPlayUi(false);

    var appliedSeek = false;

    function applySeekAndMaybePlay() {
        if (appliedSeek) return;
        var dur = audio.duration;
        if (!isFinite(dur) || dur <= 0) return;
        appliedSeek = true;
        try {
            if (state.t > 0) {
                audio.currentTime = Math.min(state.t, Math.max(0, dur - 0.05));
                state.t = audio.currentTime;
            }
        } catch (e) {}
        if (intendedPlaying) {
            var p = audio.play();
            if (p && typeof p.then === 'function') {
                p.then(function () {
                    intendedPlaying = true;
                    setPlayUi(true);
                    persist();
                }).catch(function () {
                    setPlayUi(false);
                    persist();
                    tryResumeOnGesture();
                });
            }
        } else {
            setPlayUi(false);
        }
    }

    var gestureHooked = false;
    function tryResumeOnGesture() {
        if (gestureHooked || !intendedPlaying) return;
        gestureHooked = true;
        function once() {
            if (!intendedPlaying || !audio.paused) return;
            audio.play().then(function () {
                intendedPlaying = true;
                setPlayUi(true);
                persist();
            }).catch(function () {});
        }
        document.addEventListener('click', once, true);
        document.addEventListener('keydown', once, true);
        document.addEventListener('touchstart', once, true);
    }

    audio.addEventListener('loadedmetadata', applySeekAndMaybePlay);
    audio.addEventListener('canplay', function () {
        if (!appliedSeek) applySeekAndMaybePlay();
    });
    audio.addEventListener('durationchange', function () {
        if (!appliedSeek) applySeekAndMaybePlay();
    });

    setTimeout(function () {
        if (appliedSeek) return;
        var dur = audio.duration;
        if (isFinite(dur) && dur > 0) {
            applySeekAndMaybePlay();
            return;
        }
        appliedSeek = true;
        if (intendedPlaying) {
            audio.play().then(function () {
                intendedPlaying = true;
                setPlayUi(true);
                persist();
            }).catch(function () {
                setPlayUi(false);
                persist();
                tryResumeOnGesture();
            });
        } else {
            setPlayUi(false);
        }
    }, 8000);

    audio.addEventListener('play', function () {
        intendedPlaying = true;
        setPlayUi(true);
        persist();
    });
    audio.addEventListener('pause', function () {
        setPlayUi(false);
        persist();
    });
    audio.addEventListener('timeupdate', persistThrottled);
    audio.addEventListener('ended', persist);

    btnPlay.addEventListener('click', function () {
        if (audio.paused) {
            audio.play().then(function () {
                intendedPlaying = true;
                persist();
            }).catch(function () {});
        } else {
            intendedPlaying = false;
            audio.pause();
            persist();
        }
    });

    volInput.addEventListener('input', function () {
        var v = parseFloat(volInput.value);
        if (!isFinite(v)) return;
        audio.volume = v;
        persist();
    });

    btnMin.addEventListener('click', function () {
        root.classList.add('m2m-music-player--collapsed');
        persist();
    });

    btnPeek.addEventListener('click', function () {
        root.classList.remove('m2m-music-player--collapsed');
        persist();
    });

    window.addEventListener('pagehide', persist);
    window.addEventListener('beforeunload', persist);
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') persist();
    });
    audio.addEventListener('seeked', function () {
        if (appliedSeek) persist();
    });
    window.addEventListener('pageshow', function (ev) {
        if (ev.persisted) persist();
    });

    var htmlEl = document.documentElement;
    htmlEl.appendChild(audio);
    htmlEl.appendChild(root);

    window.__M2M_MUSIC_PLAYER = true;
})();
