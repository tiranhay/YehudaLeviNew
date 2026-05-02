// site.js — יהודה לוי ז"ל

// ── Image catalogue (built at runtime from gallery-item elements) ──
// Each entry: { src, caption, group }
var IMG_LIST = [];
var imgCurrent = 0;

function buildImgList() {
  IMG_LIST = [];
  // pics gallery
  document.querySelectorAll('#galleryInner .gallery-item').forEach(function(el) {
    var img = el.querySelector('img');
    var cap = el.querySelector('.gallery-caption');
    // Use the onclick full-res src (data-full attr we set) or fall back to img src
    var full = el.dataset.full || (img ? img.src : '');
    IMG_LIST.push({ src: full, caption: cap ? cap.textContent : '', group: 'pics' });
  });
  // newspaper gallery
  document.querySelectorAll('#newspaperInner .gallery-item').forEach(function(el) {
    var img = el.querySelector('img');
    var cap = el.querySelector('.gallery-caption');
    var full = el.dataset.full || (img ? img.src : '');
    IMG_LIST.push({ src: full, caption: cap ? cap.textContent : '', group: 'newspaper' });
  });
}

// ── Open image modal ──
function openImg(url, caption, group) {
  if (!IMG_LIST.length) buildImgList();
  // Find index of this image
  var idx = -1;
  for (var i = 0; i < IMG_LIST.length; i++) {
    if (IMG_LIST[i].src === url && IMG_LIST[i].group === (group || 'pics')) {
      idx = i; break;
    }
  }
  if (idx === -1) idx = 0;
  imgCurrent = idx;
  showImgAt(imgCurrent);
  document.getElementById('imgModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showImgAt(idx) {
  var item = IMG_LIST[idx];
  var imgEl = document.getElementById('modalImg');
  imgEl.classList.add('loading');
  imgEl.onload = function() { imgEl.classList.remove('loading'); };
  imgEl.src = item.src;
  imgEl.alt = item.caption;
  document.getElementById('imgCaption').textContent = item.caption;
  document.getElementById('imgCounter').textContent = (idx + 1) + ' / ' + IMG_LIST.length;
  // Update nav buttons
  // After RTL swap: #imgNavPrev now triggers NEXT (+1), #imgNavNext triggers PREV (-1)
  var leftBtn = document.getElementById('imgNavPrev');   // visually LEFT, calls imgNav(+1)
  var rightBtn = document.getElementById('imgNavNext');  // visually RIGHT, calls imgNav(-1)
  if (leftBtn)  leftBtn.disabled  = idx === IMG_LIST.length - 1;  // disable at end
  if (rightBtn) rightBtn.disabled = idx === 0;                    // disable at start
}

function imgNav(dir) {
  var next = imgCurrent + dir;
  if (next < 0 || next >= IMG_LIST.length) return;
  imgCurrent = next;
  showImgAt(imgCurrent);
}

function imgModalBgClick(e) {
  // Only close if clicking the background itself, not the image or buttons
  if (e.target === document.getElementById('imgModal')) closeImgModal();
}

function closeImgModal() {
  document.getElementById('imgModal').classList.remove('open');
  document.body.style.overflow = '';
  // Reset any in-flight swipe transform
  var imgEl = document.getElementById('modalImg');
  if (imgEl) { imgEl.style.transition = ''; imgEl.style.transform = ''; imgEl.style.opacity = ''; }
}

// ── Swipe support for image modal (mobile) ──
(function setupImgModalSwipe() {
  var modal = document.getElementById('imgModal');
  if (!modal) return;
  var imgEl = document.getElementById('modalImg');

  var startX = 0, startY = 0, startTime = 0;
  var isTracking = false, isHorizontal = false, decided = false;
  var SWIPE_THRESHOLD = 50;     // min horizontal pixels to count as swipe
  var SWIPE_MAX_VERT = 80;      // max vertical drift for a horizontal swipe
  var DECIDE_DIST = 10;         // pixels needed to decide if gesture is horizontal

  function resetImg() {
    if (!imgEl) return;
    imgEl.style.transition = 'transform .25s ease, opacity .25s ease';
    imgEl.style.transform = '';
    imgEl.style.opacity = '';
  }

  modal.addEventListener('touchstart', function(e) {
    if (e.touches.length !== 1) { isTracking = false; return; }
    // Don't capture taps on buttons (close/prev/next) — let them work normally
    var t = e.target;
    if (t && t.closest && t.closest('button')) { isTracking = false; return; }
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTime = Date.now();
    isTracking = true;
    isHorizontal = false;
    decided = false;
    if (imgEl) imgEl.style.transition = 'none';
  }, { passive: true });

  modal.addEventListener('touchmove', function(e) {
    if (!isTracking) return;
    var dx = e.touches[0].clientX - startX;
    var dy = e.touches[0].clientY - startY;
    if (!decided) {
      if (Math.abs(dx) < DECIDE_DIST && Math.abs(dy) < DECIDE_DIST) return;
      isHorizontal = Math.abs(dx) > Math.abs(dy);
      decided = true;
    }
    if (!isHorizontal) return;
    // Visual feedback: drag image with finger
    if (imgEl) {
      // Block at the edges (slight resistance feel)
      var atStart = imgCurrent === 0;
      var atEnd = imgCurrent === IMG_LIST.length - 1;
      // dx>0 (swiping right) = next; dx<0 (swiping left) = previous
      var pull = dx;
      if ((dx > 0 && atEnd) || (dx < 0 && atStart)) pull = dx * 0.3;
      imgEl.style.transform = 'translateX(' + pull + 'px)';
      imgEl.style.opacity = String(Math.max(0.3, 1 - Math.abs(dx) / 400));
    }
  }, { passive: true });

  modal.addEventListener('touchend', function(e) {
    if (!isTracking) return;
    isTracking = false;
    if (!isHorizontal) { resetImg(); return; }
    var dx = (e.changedTouches[0].clientX) - startX;
    var dy = (e.changedTouches[0].clientY) - startY;
    if (Math.abs(dy) > SWIPE_MAX_VERT) { resetImg(); return; }
    if (Math.abs(dx) < SWIPE_THRESHOLD) { resetImg(); return; }
    // Decide direction: swipe right -> next; swipe left -> previous
    var dir = dx > 0 ? 1 : -1;
    var atStart = imgCurrent === 0;
    var atEnd = imgCurrent === IMG_LIST.length - 1;
    if ((dir === -1 && atStart) || (dir === 1 && atEnd)) { resetImg(); return; }
    // Reset transform before changing the image so the next image starts clean
    resetImg();
    imgNav(dir);
  }, { passive: true });

  modal.addEventListener('touchcancel', function() {
    isTracking = false;
    resetImg();
  }, { passive: true });
})();

// ── Hesped modal ──
function openHesped(key) {
  var nameRole = NAMES[key] || [key, ''];
  document.getElementById('modalTitle').textContent = nameRole[0];
  document.getElementById('modalRole').textContent = nameRole[1];
  var text = HESPEDIM[key] || 'תוכן לא נמצא';
  var container = document.getElementById('modalText');
  container.innerHTML = text
    .split(/\n\n+/)
    .map(function(p) { return p.trim(); })
    .filter(Boolean)
    .map(function(p) { return '<p>' + p.replace(/\n/g, '<br>') + '</p>'; })
    .join('');
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Hesped filter ──
function filterHespedim(group, btn) {
  document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('.hesped-card').forEach(function(card) {
    var key = card.dataset.key;
    if (!key) return;
    card.classList.toggle('hidden', group !== 'all' && GROUPS[key] !== group);
  });
  document.querySelectorAll('.group-label').forEach(function(l) {
    l.style.display = group === 'all' ? '' : 'none';
  });
}

// ── Generic carousel factory ──
function makeCarousel(innerId, dotsId, scrollFnName) {
  var inner = document.getElementById(innerId);
  var dotsEl = document.getElementById(dotsId);
  if (!inner) return function() {};

  var ITEM_W = 150;
  var containerW = inner.parentElement ? inner.parentElement.offsetWidth : 860;
  var VISIBLE = Math.max(1, Math.floor(containerW / ITEM_W));
  var total = inner.querySelectorAll('.gallery-item').length;
  var maxOffset = Math.max(0, total - VISIBLE);
  var current = 0;
  var pages = Math.ceil(total / VISIBLE);

  for (var i = 0; i < pages; i++) {
    var dot = document.createElement('div');
    dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
    (function(pi) {
      dot.onclick = function() { goTo(pi * VISIBLE); };
    })(i);
    dotsEl.appendChild(dot);
  }

  function updateDots() {
    var page = Math.min(Math.round(current / VISIBLE), pages - 1);
    dotsEl.querySelectorAll('.gallery-dot').forEach(function(d, i) {
      d.classList.toggle('active', i === page);
    });
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxOffset));
    inner.style.transform = 'translateX(' + (current * ITEM_W) + 'px)';
    updateDots();
  }

  // Mouse drag
  var startX = 0, startOffset = 0, dragging = false;
  inner.addEventListener('mousedown', function(e) {
    dragging = true; startX = e.clientX; startOffset = current;
    inner.classList.add('dragging'); e.preventDefault();
  });
  window.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    current = Math.max(0, Math.min(startOffset + (startX - e.clientX) / ITEM_W, maxOffset));
    inner.style.transform = 'translateX(' + (current * ITEM_W) + 'px)';
  });
  window.addEventListener('mouseup', function() {
    if (!dragging) return;
    dragging = false; inner.classList.remove('dragging'); goTo(Math.round(current));
  });

  // Touch
  var tStartX = 0, tStartOff = 0;
  inner.addEventListener('touchstart', function(e) {
    tStartX = e.touches[0].clientX; tStartOff = current;
  }, { passive: true });
  inner.addEventListener('touchmove', function(e) {
    current = Math.max(0, Math.min(tStartOff + (tStartX - e.touches[0].clientX) / ITEM_W, maxOffset));
    inner.style.transform = 'translateX(' + (current * ITEM_W) + 'px)';
  }, { passive: true });
  inner.addEventListener('touchend', function() { goTo(Math.round(current)); });

  return function(dir) { goTo(current + dir * VISIBLE); };
}

// Init both carousels
window.galleryScroll = makeCarousel('galleryInner', 'galleryDots', 'galleryScroll');
window.newspaperScroll = makeCarousel('newspaperInner', 'newspaperDots', 'newspaperScroll');

// Add data-full to gallery items that don't already have it
// (pics items have their full URL in onclick; newspaper items we set in HTML)
document.querySelectorAll('#galleryInner .gallery-item').forEach(function(el) {
  if (!el.dataset.full) {
    var m = el.getAttribute('onclick').match(/'([^']+)'/);
    if (m) el.dataset.full = m[1];
  }
});

// ── Keyboard ──
document.addEventListener('keydown', function(e) {
  if (document.getElementById('imgModal').classList.contains('open')) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { imgNav(-1); return; }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { imgNav(1);  return; }
    if (e.key === 'Escape') { closeImgModal(); return; }
  }
  if (e.key === 'Escape') closeModal();
});
