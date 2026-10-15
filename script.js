// ==========================================
// LOADING SCREEN
// ==========================================

const loadScreen = document.getElementById('loader');
const loadBar = document.getElementById('loader-bar');

let loadingTimeout = null;
let activeLoaderListener = null;

function playLoader() {

  // Cancel any previous loading sequence
  clearTimeout(loadingTimeout);

  if (activeLoaderListener) {
    loadBar.removeEventListener(
      'animationend',
      activeLoaderListener
    );
    activeLoaderListener = null;
  }

  // Instantly reset the loading screen mask
  loadScreen.style.transition = 'none';
  loadScreen.classList.remove('is-hidden');

  // Reset loading bar animation
  loadBar.classList.remove('is-loading');

  // Force the browser to apply the reset
  void loadScreen.offsetWidth;
  void loadBar.offsetWidth;

  // Restore the mask transition
  loadScreen.style.transition = '';

  // Wait for the bar to completely finish
  activeLoaderListener = function(event) {

    if (
      event.target !== loadBar ||
      event.animationName !== 'load-bar'
    ) {
      return;
    }

    loadBar.removeEventListener(
      'animationend',
      activeLoaderListener
    );

    activeLoaderListener = null;

    // Hold the completed bar briefly
    loadingTimeout = setTimeout(() => {

      // Wipe the mask upward
      loadScreen.classList.add('is-hidden');

    }, 100);

  };

  // Register listener before starting
  loadBar.addEventListener(
    'animationend',
    activeLoaderListener
  );

  // Begin loading animation
  loadBar.classList.add('is-loading');
}

// Start on initial page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', playLoader);
} else {
  playLoader();
}


// ==========================================
// NAVIGATION MENU
// ==========================================

const nav = document.getElementById('nav');
const toggle = document.getElementById('nav-toggle');

function setOpen(open) {

  nav.classList.toggle('is-open', open);

  toggle.setAttribute(
    'aria-expanded',
    String(open)
  );

  toggle.setAttribute(
    'aria-label',
    open ? 'Close menu' : 'Open menu'
  );

}

// Toggle navigation
toggle.addEventListener('click', () => {
  setOpen(!nav.classList.contains('is-open'));
});

// Close when a navigation link is clicked
nav.addEventListener('click', (e) => {

  if (e.target.closest('.nav-panel a')) {
    setOpen(false);
  }

});

// Close with Escape key
document.addEventListener('keydown', (e) => {

  if (
    e.key === 'Escape' &&
    nav.classList.contains('is-open')
  ) {
    setOpen(false);
    toggle.focus();
  }

});

// Close when clicking outside
document.addEventListener('click', (e) => {

  if (!nav.contains(e.target)) {
    setOpen(false);
  }

});


// ==========================================
// SCROLL STORY
// ==========================================

(function story() {

  const about = document.getElementById('about');
  if (!about) return;

  const stage = about.querySelector('.about-stage');
  const timeline = document.getElementById('timeline');
  const timelineStage = timeline ? timeline.querySelector('.timeline-stage') : null;
  const timelineTrack = document.getElementById('timeline-track');
  const badges = document.getElementById('badges');
  const footer = document.getElementById('footer') || document.getElementById('contact');
  const para = about.querySelector('[data-fly]');
  const mail = about.querySelector('.mail-drop');

  // Scroll animation settings
  const LERP = 3; // restored to original smooth feel for the rest of the site
  const WORDS_END = 0.72;
  const MAIL_AT = 0.75;
  const WORD_SPAN = 0.14;

  // Utility functions
  const clamp = (v, a, b) =>
    Math.min(b, Math.max(a, v));

  const easeOut = (t) =>
    1 - Math.pow(1 - t, 3);


  // ==========================================
  // SPLIT PARAGRAPH INTO WORDS
  // ==========================================

  const list = para.textContent.trim().split(/\s+/);

  para.textContent = '';

  const words = list.map((w, i) => {

    const el = document.createElement('span');

    el.className = 'word';
    el.textContent = w;

    para.append(
      el,
      i < list.length - 1 ? ' ' : ''
    );

    return el;

  });


  // Accessibility: reduced motion
  if (
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
  ) {
    return;
  }


  // ==========================================
  // SCROLL MEASUREMENTS
  // ==========================================

  let A0 = 0;
  let pinnedEnd = 0;
  let T0 = 0;
  let B0 = 0;
  let pinnedEndT;
  let maxPanX = 0;
  let F = 0;
  let max = 0;

  function measure() {

    A0 = about ? about.offsetTop : 0;

    pinnedEnd =
      A0 +
      (about ? about.offsetHeight : 0) -
      (stage ? stage.offsetHeight : 0);

    T0 = timeline ? timeline.offsetTop : 0;
    B0 = badges ? badges.offsetTop : 0;

    if (timeline && timelineStage && timelineTrack) {
      if (typeof measureTimelineBounds === 'function') {
        measureTimelineBounds();
      } else {
        const viewportW = timelineStage.querySelector('.timeline-viewport')
          ? timelineStage.querySelector('.timeline-viewport').clientWidth
          : innerWidth;
        maxPanX = Math.max(0, timelineTrack.scrollWidth - viewportW + 60);
      }
    }

    max =
      document.documentElement.scrollHeight -
      innerHeight;

    F = Math.min(
      footer ? footer.offsetTop : max,
      max
    );

  }


  // ==========================================
  // WORD AND MAIL ANIMATIONS
  // ==========================================

  let mailOn = false;

  function render(y) {

    const p = clamp(
      (y - A0) / Math.max(1, pinnedEnd - A0),
      0,
      1
    );

    const w = innerWidth;

    // Do not overwrite animated words if game is active or departing
    if (
      !about.classList.contains('game-active') &&
      !about.classList.contains('mail-leave-left') &&
      !document.body.classList.contains('game-open')
    ) {
      // Animate each word
      words.forEach((el, i) => {

        const start =
          (i / Math.max(1, words.length - 1)) *
          (WORDS_END - WORD_SPAN);

        const t = easeOut(
          clamp(
            (p - start) / WORD_SPAN,
            0,
            1
          )
        );

        el.style.opacity = Math.min(1, t * 4);

        el.style.transform =
          'translateX(' +
          (1 - t) * w +
          'px)';

      });

      // Mail entrance
      const on = p >= MAIL_AT;

      if (on !== mailOn) {

        mailOn = on;

        about.classList.toggle('mail-in', on);
        about.classList.toggle('mail-out', !on);

      }
    }

    // ==========================================
    // PARALLAX EFFECT FOR FOOTER
    // (Timeline and Badges now live inside desktop windows)
    // ==========================================

    if (footer) {
      const fRect = footer.getBoundingClientRect();
      const distFromBottomF = innerHeight - fRect.top;
      if (distFromBottomF > 0) {
        // Footer reveals from behind with a distinct parallax depth
        const footerParallax = Math.max(-40, distFromBottomF * -0.18);
        const bar = footer.querySelector('.footer-bar');
        if (bar) {
          bar.style.transform = 'translateY(' + footerParallax.toFixed(1) + 'px)';
        }
      }
    }

  }


  // ==========================================
  // MAIL EXIT
  // ==========================================

  mail.addEventListener('animationend', (e) => {

    if (e.animationName === 'mail-leave') {
      about.classList.remove('mail-out');
    }

  });


  // ==========================================
  // SMOOTH SCROLL ENGINE
  // ==========================================

  let current = scrollY;
  let target = scrollY;
  let running = false;
  let last = 0;

  function tick(now) {

    const dt = Math.min(
      (now - last) / 1000,
      0.05
    );

    last = now;

    current +=
      (target - current) *
      (1 - Math.exp(-LERP * dt));

    if (Math.abs(target - current) < 0.3) {
      current = target;
    }

    scrollTo(0, current);

    render(current);

    if (current !== target) {
      requestAnimationFrame(tick);
    } else {
      running = false;
    }

  }

  function kick() {

    if (running) return;

    running = true;
    last = performance.now();

    requestAnimationFrame(tick);

  }

  function go(y) {

    target = clamp(y, 0, max);
    kick();

  }

  function push(delta) {

    go(target + delta);

  }


  // ==========================================
  // MOUSE WHEEL SCROLLING
  // ==========================================

  addEventListener('wheel', (e) => {

    if (e.ctrlKey) return;

    // If mouse is directly over scrollable desktop windows, let them scroll naturally
    if (e.target && e.target.closest && e.target.closest('.game-log, .game-sidebar, .timeline-viewport, .win-app-body, .win-settings-content')) {
      return;
    }

    e.preventDefault();

    const unit =
      e.deltaMode === 1
        ? 16
        : e.deltaMode === 2
          ? innerHeight
          : 1;

    push(e.deltaY * unit);

  }, { passive: false });


  // ==========================================
  // KEYBOARD SCROLLING
  // ==========================================

  addEventListener('keydown', (e) => {

    if (
      document.body.classList.contains('game-open') ||
      e.altKey ||
      e.ctrlKey ||
      e.metaKey ||
      e.target.closest(
        'button, a, input, textarea, select, #game'
      )
    ) {
      return;
    }

    const page = innerHeight * 0.9;

    const steps = {
      ArrowDown: 80,
      ArrowUp: -80,
      PageDown: page,
      PageUp: -page,
      ' ': e.shiftKey ? -page : page
    };

    if (e.key in steps) {

      e.preventDefault();
      push(steps[e.key]);

    } else if (e.key === 'Home') {

      e.preventDefault();
      go(0);

    } else if (e.key === 'End') {

      e.preventDefault();
      go(max);

    }

  });


  // ==========================================
  // NAVIGATION LINKS
  // ==========================================

  const anchors = {
    '#top': () => 0,
    '#about': () => pinnedEnd,
    '#update': () => {
      const u = document.getElementById('update');
      return u ? u.offsetTop : pinnedEnd;
    },
    '#timeline': () => pinnedEnd,
    '#badges': () => pinnedEnd,
    '#footer': () => F,
    '#contact': () => F
  };

  // Timeline and Badges are apps on the desktop: scroll there, then ask game.js to open them
  const appAnchors = {
    '#timeline': 'timeline',
    '#badges': 'badges'
  };

  document.addEventListener('click', (e) => {

    const a = e.target.closest('a[href^="#"]');

    if (!a || !(a.hash in anchors)) {
      return;
    }

    e.preventDefault();

    go(anchors[a.hash]());

    if (a.hash in appAnchors) {
      const app = appAnchors[a.hash];
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-app', { detail: app }));
      }, 900);
    }

  });


  // ==========================================
  // NATIVE SCROLL SYNC
  // ==========================================

  addEventListener('scroll', () => {

    if (running) return;

    current = target = scrollY;

    render(scrollY);

  }, { passive: true });


  // ==========================================
  // TIMELINE CONNECTOR LINES
  // ==========================================

  function drawTimelineConnectors() {
    const svg = document.getElementById('timeline-svg');
    const tree = document.getElementById('timeline-tree');
    if (!svg || !tree) return;

    // Branching connections come from the shared story graph (story.js)
    const connections = (window.NOVEL && window.NOVEL.connections) || [];

    const track = document.getElementById('timeline-track');
    if (!track) return;

    // Temporarily reset track and tree transform so getBoundingClientRect returns true unshifted coordinates
    const prevTransform = track.style.transform;
    const prevTreeTransform = tree.style.transform;
    track.style.transform = 'none';
    tree.style.transform = 'none';

    const trackRect = track.getBoundingClientRect();
    const trackW = Math.round(trackRect.width);
    const trackH = Math.round(trackRect.height);

    svg.setAttribute('width', trackW);
    svg.setAttribute('height', trackH);
    svg.setAttribute('viewBox', '0 0 ' + trackW + ' ' + trackH);

    let paths = '';
    connections.forEach(([fromId, toId], idx) => {
      const fromEl = tree.querySelector('[data-node="' + fromId + '"]');
      const toEl = tree.querySelector('[data-node="' + toId + '"]');
      if (!fromEl || !toEl) return;

      const fChoice = fromEl.querySelector('.timeline-node-choice') || fromEl;
      const tChoice = toEl.querySelector('.timeline-node-choice') || toEl;
      const fRect = fChoice.getBoundingClientRect();
      const tRect = tChoice.getBoundingClientRect();

      // Connector starts at right edge center of parent header, ends at left edge center of child header
      const x1 = fRect.right - trackRect.left + 8;
      const y1 = fRect.top + fRect.height / 2 - trackRect.top;
      const x2 = tRect.left - trackRect.left - 8;
      const y2 = tRect.top + tRect.height / 2 - trackRect.top;

      // Compute distinct midX turning point per parent & child pair to guarantee no two lines share the same vertical channel
      const siblingIndex = connections.filter(c => c[0] === fromId).findIndex(c => c[1] === toId);
      const totalSiblings = connections.filter(c => c[0] === fromId).length;
      const stepRatio = totalSiblings > 1 ? 0.35 + (siblingIndex / (totalSiblings - 1)) * 0.32 : 0.48;
      const midX = x1 + (x2 - x1) * stepRatio;
      const dy = y2 - y1;
      let d = '';

      if (Math.abs(dy) < 4) {
        // Direct horizontal pipe
        d = 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2;
      } else {
        const r = Math.min(16, Math.abs(dy) / 2, Math.abs(x2 - x1) / 4);
        const sign = dy > 0 ? 1 : -1;

        d = 'M ' + x1 + ' ' + y1 +
            ' L ' + (midX - r) + ' ' + y1 +
            ' Q ' + midX + ' ' + y1 + ' ' + midX + ' ' + (y1 + sign * r) +
            ' L ' + midX + ' ' + (y2 - sign * r) +
            ' Q ' + midX + ' ' + y2 + ' ' + (midX + r) + ' ' + y2 +
            ' L ' + x2 + ' ' + y2;
      }

      paths += '<path data-from="' + fromId + '" data-to="' + toId + '" d="' + d + '" />';
    });

    // Restore track and tree transform
    track.style.transform = prevTransform;
    tree.style.transform = prevTreeTransform;

    svg.innerHTML = paths;

    if (window.NOVEL) {
      window.NOVEL.applyLit();
    }
  }


  // ==========================================
  // TIMELINE DRAGGABLE SCROLLBAR & ZOOM CONTROLS
  // ==========================================

  const scrollTrack = document.getElementById('timeline-scroll-track');
  const scrollThumb = document.getElementById('timeline-scroll-thumb');
  const zoomOutBtn = document.getElementById('btn-zoom-out');
  const zoomInBtn = document.getElementById('btn-zoom-in');
  const zoomResetBtn = document.getElementById('btn-zoom-reset');
  const zoomText = document.getElementById('timeline-zoom-text');
  const fitTreeBtn = document.getElementById('btn-fit-tree');
  const focusLatestBtn = document.getElementById('btn-focus-latest');
  const btnPanLeft = document.getElementById('btn-pan-left');
  const btnPanRight = document.getElementById('btn-pan-right');
  const btnScrollLeft = document.getElementById('btn-scroll-left');
  const btnScrollRight = document.getElementById('btn-scroll-right');
  const timelineViewport = timelineStage ? timelineStage.querySelector('.timeline-viewport') : null;
  const timelineTree = document.getElementById('timeline-tree');

  let timelineZoom = 0.70; // 70% scale by default for comfortable overview
  let panX = 0;
  let panY = 0;
  let maxPanY = 0;
  let timelinePanProgress = 0; // 0 to 1

  function getTrackBounds() {
    let maxNodeX = 2400;
    if (timelineTree) {
      const nodes = timelineTree.querySelectorAll('.timeline-node');
      nodes.forEach(n => {
        const left = parseFloat(n.style.left) || 0;
        const w = n.offsetWidth || 240;
        if (left + w > maxNodeX) maxNodeX = left + w;
      });
    }
    // Generous right breathing room so all ending nodes can be scrolled completely into view
    const treeW = Math.max(2900, maxNodeX + 460);
    const treeH = 580;
    const padX = 480; // 40px left + 440px right padding
    const padY = 48;
    return {
      w: treeW + padX,
      h: treeH + padY
    };
  }

  function measureTimelineBounds() {
    if (!timelineViewport || !timelineTrack) return;
    const viewportW = timelineViewport.clientWidth || 800;
    const viewportH = timelineViewport.clientHeight || 500;
    const bounds = getTrackBounds();

    const visibleW = viewportW / timelineZoom;
    const visibleH = viewportH / timelineZoom;

    maxPanX = Math.max(0, bounds.w - visibleW);
    maxPanY = Math.max(0, bounds.h - visibleH);

    panX = maxPanX > 0 ? clamp(timelinePanProgress * maxPanX, 0, maxPanX) : 0;
    panY = maxPanY > 0 ? clamp(panY, 0, maxPanY) : 0;

    updateTimelineTransform();
  }

  function updateTimelineTransform() {
    if (!timelineTrack) return;

    const viewportW = timelineViewport ? timelineViewport.clientWidth : 800;
    const viewportH = timelineViewport ? timelineViewport.clientHeight : 500;
    const bounds = getTrackBounds();
    const visibleW = viewportW / timelineZoom;
    const visibleH = viewportH / timelineZoom;

    let renderPanX = panX;
    let renderPanY = panY;

    // Center horizontally if viewport is wider than tree
    if (visibleW > bounds.w) {
      renderPanX = -((visibleW - bounds.w) / 2);
    }
    // Center vertically if viewport is taller than tree
    if (visibleH > bounds.h) {
      renderPanY = -((visibleH - bounds.h) / 2);
    }

    const translateX = (-renderPanX).toFixed(2);
    const translateY = (-renderPanY).toFixed(2);

    timelineTrack.style.transform =
      'scale(' + timelineZoom.toFixed(2) + ') translate(' + translateX + 'px, ' + translateY + 'px)';

    if (scrollThumb) {
      scrollThumb.style.left = (timelinePanProgress * 100).toFixed(2) + '%';
      scrollThumb.setAttribute('aria-valuenow', Math.round(timelinePanProgress * 100));
    }
  }

  function setTimelinePan(p) {
    timelinePanProgress = clamp(p, 0, 1);
    panX = maxPanX > 0 ? timelinePanProgress * maxPanX : 0;
    updateTimelineTransform();
  }

  function panTimelineBy(deltaPx) {
    if (maxPanX <= 0) {
      measureTimelineBounds();
    }
    if (maxPanX <= 0) return;
    const targetPanX = clamp(panX + deltaPx, 0, maxPanX);
    setTimelinePan(targetPanX / maxPanX);
  }

  function setTimelineZoom(z) {
    timelineZoom = clamp(Math.round(z * 100) / 100, 0.35, 1.25);
    if (zoomText) {
      zoomText.textContent = Math.round(timelineZoom * 100) + '%';
    }
    measureTimelineBounds();
  }

  function fitTimelineView() {
    if (!timelineViewport) return;
    const viewportW = timelineViewport.clientWidth || 800;
    const viewportH = timelineViewport.clientHeight || 500;
    const bounds = getTrackBounds();

    const zX = (viewportW - 40) / bounds.w;
    const zY = (viewportH - 40) / bounds.h;
    const bestZoom = clamp(Math.min(zX, zY), 0.35, 1.0);

    setTimelineZoom(bestZoom);
    setTimelinePan(0);
    panY = 0;
    updateTimelineTransform();
  }

  function focusLatestTimelineNode() {
    if (!timelineTree || !timelineViewport) return;
    const nodes = Array.from(timelineTree.querySelectorAll('.timeline-node:not(.is-locked)'));
    const targetNode = nodes.length > 0 ? nodes[nodes.length - 1] : timelineTree.querySelector('.timeline-node');
    if (!targetNode) return;

    const nodeLeft = parseFloat(targetNode.style.left) || 0;
    const nodeTop = parseFloat(targetNode.style.top) || 0;
    const nodeW = 240;
    const nodeH = 52;

    const viewportW = timelineViewport.clientWidth || 800;
    const viewportH = timelineViewport.clientHeight || 500;
    const visibleW = viewportW / timelineZoom;
    const visibleH = viewportH / timelineZoom;

    const targetCenterX = nodeLeft + nodeW / 2 + 40; // + 40 for track padding-left
    const targetCenterY = nodeTop + nodeH / 2 + 24;  // + 24 for track padding-top

    const desiredPanX = targetCenterX - visibleW / 2;
    const desiredPanY = targetCenterY - visibleH / 2;

    if (maxPanX > 0) {
      setTimelinePan(clamp(desiredPanX / maxPanX, 0, 1));
    }
    if (maxPanY > 0) {
      panY = clamp(desiredPanY, 0, maxPanY);
    }
    updateTimelineTransform();

    // Pulse highlight
    targetNode.classList.remove('is-pulse');
    void targetNode.offsetWidth;
    targetNode.classList.add('is-pulse');
    setTimeout(() => targetNode.classList.remove('is-pulse'), 1200);
  }

  // Zoom toolbar buttons
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => setTimelineZoom(timelineZoom - 0.15));
  }
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => setTimelineZoom(timelineZoom + 0.15));
  }
  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', () => setTimelineZoom(0.70));
  }
  if (fitTreeBtn) {
    fitTreeBtn.addEventListener('click', fitTimelineView);
  }
  if (focusLatestBtn) {
    focusLatestBtn.addEventListener('click', focusLatestTimelineNode);
  }

  // Toolbar pan buttons
  if (btnPanLeft) {
    btnPanLeft.addEventListener('click', () => panTimelineBy(-240));
  }
  if (btnPanRight) {
    btnPanRight.addEventListener('click', () => panTimelineBy(240));
  }

  // Scrollbar step buttons (◀ and ▶)
  if (btnScrollLeft) {
    btnScrollLeft.addEventListener('click', () => panTimelineBy(-240));
  }
  if (btnScrollRight) {
    btnScrollRight.addEventListener('click', () => panTimelineBy(240));
  }

  // Bottom draggable scrollbar
  if (scrollTrack && scrollThumb && timelineTrack) {
    let isThumbDragging = false;
    let thumbStartX = 0;
    let thumbStartProgress = 0;

    const startThumbDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      isThumbDragging = true;
      thumbStartX = e.clientX;
      thumbStartProgress = timelinePanProgress;
      scrollThumb.classList.add('is-dragging');
    };

    scrollThumb.addEventListener('pointerdown', startThumbDrag);
    scrollThumb.addEventListener('mousedown', startThumbDrag);

    const onThumbMove = (e) => {
      if (!isThumbDragging) return;
      const rect = scrollTrack.getBoundingClientRect();
      if (rect.width <= 0) return;
      const deltaX = e.clientX - thumbStartX;
      const deltaProgress = deltaX / rect.width;
      setTimelinePan(thumbStartProgress + deltaProgress);
    };

    const stopThumbDrag = () => {
      if (!isThumbDragging) return;
      isThumbDragging = false;
      scrollThumb.classList.remove('is-dragging');
    };

    window.addEventListener('pointermove', onThumbMove);
    window.addEventListener('mousemove', onThumbMove);
    window.addEventListener('pointerup', stopThumbDrag);
    window.addEventListener('mouseup', stopThumbDrag);
    window.addEventListener('pointercancel', stopThumbDrag);

    // Clicking anywhere along the scrollbar track jumps directly to that percentage
    scrollTrack.addEventListener('pointerdown', (e) => {
      if (e.target === scrollThumb || scrollThumb.contains(e.target)) return;
      const rect = scrollTrack.getBoundingClientRect();
      if (rect.width <= 0) return;
      const progress = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      setTimelinePan(progress);
      isThumbDragging = true;
      thumbStartX = e.clientX;
      thumbStartProgress = progress;
      scrollThumb.classList.add('is-dragging');
    });

    scrollThumb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        panTimelineBy(160);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        panTimelineBy(-160);
      }
    });
  }

  // Direct canvas drag-to-pan & wheel scroll on timeline
  function handleTimelineWheel(e) {
    // Zoom with Ctrl / Command / Pinch-to-zoom
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
      setTimelineZoom(timelineZoom + zoomDelta);
      return;
    }

    // Explicit vertical intent with Alt key when vertical overflow exists
    if (e.altKey && maxPanY > 0) {
      e.preventDefault();
      panY = clamp(panY + (e.deltaY / timelineZoom) * 0.75, 0, maxPanY);
      updateTimelineTransform();
      return;
    }

    // Horizontal panning: mouse wheel roll down OR trackpad horizontal swipe
    if (maxPanX <= 0) {
      measureTimelineBounds();
    }
    if (maxPanX > 0) {
      e.preventDefault();
      let delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (e.deltaMode === 1) delta *= 33; // DOM_DELTA_LINE
      else if (e.deltaMode === 2) delta *= 400; // DOM_DELTA_PAGE
      const deltaPx = (delta / timelineZoom) * 0.75;
      panTimelineBy(deltaPx);
    }
  }

  let hasCanvasDragged = false;

  if (timelineViewport) {
    let isCanvasDragging = false;
    let startX = 0;
    let startY = 0;
    let startPanX = 0;
    let startPanY = 0;

    const startCanvasDrag = (e) => {
      // Don't drag if clicking buttons, links, or scroll slider
      if (e.target.closest('button, a, [role="slider"]')) return;
      isCanvasDragging = true;
      hasCanvasDragged = false;
      startX = e.clientX;
      startY = e.clientY;
      startPanX = panX;
      startPanY = panY;
      timelineViewport.style.cursor = 'grabbing';
    };

    timelineViewport.addEventListener('pointerdown', startCanvasDrag);
    timelineViewport.addEventListener('mousedown', startCanvasDrag);

    const onCanvasDragMove = (e) => {
      if (!isCanvasDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasCanvasDragged = true;
      }

      if (maxPanX <= 0) measureTimelineBounds();

      const newPanX = clamp(startPanX - (dx / timelineZoom), 0, Math.max(1, maxPanX));
      const newPanY = clamp(startPanY - (dy / timelineZoom), 0, maxPanY);

      panX = newPanX;
      timelinePanProgress = maxPanX > 0 ? panX / maxPanX : 0;
      panY = newPanY;

      updateTimelineTransform();
    };

    const stopCanvasDrag = () => {
      if (!isCanvasDragging) return;
      isCanvasDragging = false;
      timelineViewport.style.cursor = '';
    };

    window.addEventListener('pointermove', onCanvasDragMove);
    window.addEventListener('mousemove', onCanvasDragMove);
    window.addEventListener('pointerup', stopCanvasDrag);
    window.addEventListener('mouseup', stopCanvasDrag);
    window.addEventListener('pointercancel', stopCanvasDrag);

    timelineViewport.addEventListener('wheel', handleTimelineWheel, { passive: false });
  }

  if (timelineStage) {
    timelineStage.addEventListener('wheel', (e) => {
      if (!e.target.closest('.timeline-viewport')) {
        handleTimelineWheel(e);
      }
    }, { passive: false });
  }

  // Keyboard navigation when timeline app is active
  window.addEventListener('keydown', (e) => {
    const timelineDialog = document.getElementById('win-timeline-app');
    if (!timelineDialog || !timelineDialog.classList.contains('is-active')) return;
    if (e.target.closest('input, textarea, select')) return;

    if (e.key === 'ArrowRight' || e.key === 'KeyD') {
      panTimelineBy(160);
    } else if (e.key === 'ArrowLeft' || e.key === 'KeyA') {
      panTimelineBy(-160);
    } else if (e.key === 'PageDown') {
      panTimelineBy(420);
    } else if (e.key === 'PageUp') {
      panTimelineBy(-420);
    } else if (e.key === 'Home') {
      setTimelinePan(0);
    } else if (e.key === 'End') {
      setTimelinePan(1);
    }
  });

  // Clicking a timeline node toggles it expanded/collapsed (ignored if user was dragging)
  if (timeline) {
    timeline.addEventListener('click', (e) => {
      if (hasCanvasDragged) return;
      const node = e.target.closest('.timeline-node');
      if (!node) return;
      const wasExpanded = node.classList.contains('is-expanded');
      timeline.querySelectorAll('.timeline-node.is-expanded').forEach(n => {
        if (n !== node) n.classList.remove('is-expanded');
      });
      node.classList.toggle('is-expanded', !wasExpanded);
    });
  }

  window.__measureTimelineBounds = measureTimelineBounds;
  window.__focusLatestTimelineNode = focusLatestTimelineNode;


  // ==========================================
  // RESIZE AND REFRESH
  // ==========================================

  function refresh() {

    drawTimelineConnectors();

    if (typeof measureTimelineBounds === 'function') {
      measureTimelineBounds();
    }

    measure();

    target = clamp(target, 0, max);
    current = clamp(current, 0, max);

    render(scrollY);

  }

  addEventListener('resize', refresh);
  addEventListener('load', refresh);

  // Lets game.js re-measure the timeline when its window opens
  window.__refreshTimeline = refresh;

  // Initial draw once styles and fonts settle
  setTimeout(refresh, 100);
  setTimeout(refresh, 500);

  refresh();

})();