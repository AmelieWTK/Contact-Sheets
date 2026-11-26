/* Lightbox for the contact sheet.
   Without JavaScript every frame is still a normal link to the large image. */
(() => {
  'use strict';

  const dialog = document.getElementById('lightbox');
  const links = Array.from(document.querySelectorAll('.frames .frame'));
  if (!dialog || !links.length || typeof dialog.showModal !== 'function') return;

  const image = dialog.querySelector('.lb-image');
  const counter = dialog.querySelector('.lb-count');
  const caption = dialog.querySelector('.lb-caption');
  const stage = dialog.querySelector('.lb-stage');
  const root = document.documentElement;
  const total = links.length;

  let index = 0;
  let opener = null;
  let token = 0;

  const wrap = (i) => (i + total) % total;

  function setHash(value) {
    try {
      history.replaceState(null, '', value ? '#' + value : location.pathname + location.search);
    } catch (e) {
      /* some browsers block this on local files; the viewer still works */
    }
  }

  function show(i) {
    index = wrap(i);
    const link = links[index];
    const thumb = link.querySelector('img');
    const mine = ++token;
    const ready = () => { if (mine === token) image.classList.remove('is-loading'); };

    image.classList.add('is-loading');
    image.alt = thumb ? thumb.alt : '';
    image.src = link.href;
    if (image.decode) image.decode().then(ready, ready);
    else image.addEventListener('load', ready, { once: true });

    counter.textContent = (index + 1) + ' of ' + total;
    const text = link.dataset.caption || '';
    caption.textContent = text;
    caption.hidden = !text;

    setHash('frame-' + (index + 1));

    [index - 1, index + 1].forEach((n) => {
      const next = new Image();
      next.src = links[wrap(n)].href;
    });
  }

  function open(i, trigger) {
    if (trigger) opener = trigger;
    if (!dialog.open) {
      dialog.showModal();
      root.classList.add('lb-open');
    }
    show(i);
  }

  dialog.addEventListener('close', () => {
    root.classList.remove('lb-open');
    setHash('');
    if (opener) opener.focus();
  });

  links.forEach((link, i) => {
    link.addEventListener('click', (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      open(i, link);
    });
  });

  dialog.querySelector('.lb-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.lb-prev').addEventListener('click', () => show(index - 1));
  dialog.querySelector('.lb-next').addEventListener('click', () => show(index + 1));

  document.addEventListener('keydown', (e) => {
    if (!dialog.open) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
  });

  /* Swipe on touch screens */
  let start = null;
  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    start = { x: e.clientX, y: e.clientY };
  });
  stage.addEventListener('pointerup', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(index + (dx < 0 ? 1 : -1));
  });
  stage.addEventListener('pointercancel', () => { start = null; });

  /* Deep link: projects/cyprus.html#frame-7 opens frame 7 */
  const match = /^#frame-(\d+)$/.exec(location.hash);
  if (match) {
    const n = parseInt(match[1], 10);
    if (n >= 1 && n <= total) open(n - 1, links[n - 1]);
  }
})();
