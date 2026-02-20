/**
 * HomeCinema — HTML5 media interop bridge
 *
 * Exposes window.homeCinema.* functions called via IJSRuntime from Blazor.
 * Works for both <video> and <audio> elements.
 */
window.homeCinema = (() => {
    let _el = null;

    function attach(id) {
        _el = document.getElementById(id);
        return _el;
    }

    return {
        /** Attach to a <video> element and begin playback. */
        init(id) {
            const el = attach(id);
            if (el) el.play().catch(() => {});
        },

        /** Attach to an <audio> element and begin playback. */
        initAudio(id) {
            const el = attach(id);
            if (el) el.play().catch(() => {});
        },

        /** Swap the src and play (used when skipping tracks in the queue). */
        loadSrc(src) {
            if (!_el) return;
            _el.src = src;
            _el.load();
            _el.play().catch(() => {});
        },

        play()  { _el?.play(); },
        pause() { _el?.pause(); },

        /** seekTo(posMs: number) — seek to absolute position in milliseconds. */
        seekTo(ms) {
            if (_el) _el.currentTime = ms / 1000;
        },

        /** setSpeed(rate: number) — playback rate, e.g. 0.5, 1.0, 1.5, 2.0. */
        setSpeed(rate) {
            if (_el) _el.playbackRate = rate;
        },

        /** setVolume(vol: number) — 0.0 to 1.0. */
        setVolume(vol) {
            if (_el) _el.volume = Math.max(0, Math.min(1, vol));
        },

        /** Returns current position in milliseconds (integer). */
        getPosition() {
            if (!_el || isNaN(_el.currentTime)) return 0;
            return Math.round(_el.currentTime * 1000);
        },

        /** Returns total duration in milliseconds (integer). */
        getDuration() {
            if (!_el || isNaN(_el.duration) || !isFinite(_el.duration)) return 0;
            return Math.round(_el.duration * 1000);
        },

        /** Detach the current element reference (call on page dispose). */
        dispose() {
            _el = null;
        },
    };
})();
