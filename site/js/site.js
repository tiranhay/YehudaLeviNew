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
  var prev = document.getElementById('imgNavPrev');
  var next = document.getElementById('imgNavNext');
  if (prev) prev.disabled = idx === 0;
  if (next) next.disabled = idx === IMG_LIST.length - 1;
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
}

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
