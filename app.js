// Notion checkbox debug with slay sound (fixed double triggers)
(function() {
  'use strict';

  const DEBUG_ALERT = true; // show alerts
  const SOUND_URL = 'http://127.0.0.1:5500/sound.mp3'; // Live Server URL for your sound
  const slayAudio = new Audio(SOUND_URL);

  console.log('%c[notion-checkbox-debug] script started', 'color: hotpink; font-weight:bold;', new Date().toISOString());

  function findCheckboxes() {
    try {
      return Array.from(document.querySelectorAll('input[type="checkbox"]'));
    } catch (err) {
      console.error('[notion-checkbox-debug] findCheckboxes error', err);
      return [];
    }
  }

  function attachListeners(cb, idx) {
    if (!cb || cb.dataset._notion_dbg) return;

    cb.dataset._notion_dbg = '1';
    cb.dataset._prevChecked = String(Boolean(cb.checked));

    function maybeSlay(inputEl) {
      const now = inputEl.checked;
      const prev = (inputEl.dataset._prevChecked === 'true');

      if (now && !prev) { // only fire on checking, not unchecking
        // play audio first
        slayAudio.currentTime = 0;
        slayAudio.play().catch(err => console.warn('Audio play failed:', err));

        // then show alert
        if (DEBUG_ALERT) {
          setTimeout(() => {
            alert('✨ Checked! You slay! 💖🌸🎀');
          }, 0);
        }
      }

      inputEl.dataset._prevChecked = String(now);
    }

    // normal checkbox change
    cb.addEventListener('change', () => maybeSlay(cb));

    // parent click fallback
    const parentClickable = cb.closest('.pseudoHover') || cb.parentElement || cb.closest('[data-block-id]') || cb;
    try {
      parentClickable.addEventListener('click', () => {
        setTimeout(() => maybeSlay(cb), 60); // give Notion time to update
      }, { passive: true });
    } catch (err) {
      console.warn('[notion-checkbox-debug] could not attach parentClickable listener', err);
    }
  }

  // attach to existing checkboxes
  findCheckboxes().forEach((cb, i) => attachListeners(cb, i));

  // robust mutation observer
  const observer = new MutationObserver(() => findCheckboxes().forEach((cb, i) => attachListeners(cb, i)));
  const roots = [document.documentElement, document.body];
  roots.forEach(r => {
    if (r) try { observer.observe(r, { childList: true, subtree: true }); } catch {}
  });

  // polling fallback
  let pollCount = 0;
  const pollInterval = setInterval(() => {
    pollCount++;
    findCheckboxes().forEach((cb, i) => attachListeners(cb, i));
    if (pollCount >= 120) clearInterval(pollInterval);
  }, 500);

})();