(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    const stage = document.querySelector('deck-stage');
    if (!stage) return;

    const W = parseInt(stage.getAttribute('width')) || 1920;
    const H = parseInt(stage.getAttribute('height')) || 1080;
    const slides = Array.from(stage.querySelectorAll(':scope > section'));
    const total = slides.length;
    let current = 0;

    // Stage base dimensions
    stage.style.width = W + 'px';
    stage.style.height = H + 'px';
    stage.style.display = 'block';
    stage.style.position = 'absolute';
    stage.style.overflow = 'hidden';

    // CSS handles section layout; ensure no residual inline display
    slides.forEach(function (s) { s.style.display = ''; });

    // Scale stage to fit viewport, centered
    function scale() {
      var sw = window.innerWidth;
      var sh = window.innerHeight;
      var ratio = Math.min(sw / W, sh / H);
      var left = (sw - W * ratio) / 2;
      var top = (sh - H * ratio) / 2;
      stage.style.transform = 'scale(' + ratio + ')';
      stage.style.transformOrigin = 'top left';
      stage.style.left = left + 'px';
      stage.style.top = top + 'px';
    }

    window.addEventListener('resize', scale);
    scale();

    // Slide counter
    var counter = document.createElement('div');
    counter.style.cssText = [
      'position:fixed', 'bottom:18px', 'right:22px',
      'font:12px/1 "Courier Prime",monospace',
      'color:rgba(255,255,255,0.35)', 'z-index:9999',
      'letter-spacing:0.12em', 'pointer-events:none',
      'user-select:none'
    ].join(';');
    document.body.appendChild(counter);

    function show(idx) {
      slides[current].classList.remove('active');
      current = idx;
      slides[current].classList.add('active');
      counter.textContent = (current + 1) + ' \u2014 ' + total;

      // Sync speaker notes if panel open
      refreshNotes();
    }

    // Speaker notes panel (press N to toggle)
    var notes = [];
    try {
      var notesEl = document.getElementById('speaker-notes');
      if (notesEl) notes = JSON.parse(notesEl.textContent);
    } catch (e) {}

    var notesPanel = document.createElement('div');
    notesPanel.style.cssText = [
      'position:fixed', 'bottom:0', 'left:0', 'right:0',
      'max-height:180px', 'overflow-y:auto',
      'background:rgba(10,8,6,0.92)',
      'color:#c8b99a',
      'font:18px/1.55 "Courier Prime",monospace',
      'padding:20px 28px', 'z-index:9998',
      'letter-spacing:0.03em',
      'border-top:1px solid rgba(200,150,80,0.2)',
      'display:none'
    ].join(';');
    document.body.appendChild(notesPanel);
    var notesVisible = false;

    function refreshNotes() {
      if (notes[current]) notesPanel.textContent = notes[current];
      else notesPanel.textContent = '';
    }

    function toggleNotes() {
      notesVisible = !notesVisible;
      notesPanel.style.display = notesVisible ? 'block' : 'none';
      if (notesVisible) refreshNotes();
    }

    function next() { if (current < total - 1) show(current + 1); }
    function prev() { if (current > 0) show(current - 1); }

    document.addEventListener('keydown', function (e) {
      switch (e.key) {
        case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown':
          e.preventDefault(); next(); break;
        case 'ArrowLeft': case 'ArrowUp': case 'Backspace': case 'PageUp':
          e.preventDefault(); prev(); break;
        case 'n': case 'N':
          toggleNotes(); break;
        case 'Home':
          e.preventDefault(); show(0); break;
        case 'End':
          e.preventDefault(); show(total - 1); break;
      }
    });

    // Click/tap to advance (right half = next, left half = prev)
    stage.addEventListener('click', function (e) {
      var mid = stage.offsetWidth / 2;
      if (e.offsetX >= mid) next(); else prev();
    });

    slides[0].classList.add('active');
    counter.textContent = '1 \u2014 ' + total;
    refreshNotes();
  }
})();
