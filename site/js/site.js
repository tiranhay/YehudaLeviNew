// site.js — יהודה לוי ז"ל — אתר הנצחה

// ── Hesped modal ──
function openHesped(key) {
  const [name, role] = NAMES[key] || [key, ''];
  document.getElementById('modalTitle').textContent = name;
  document.getElementById('modalRole').textContent = role;

  // Render paragraphs (\n\n = paragraph break, \n = line break within paragraph)
  const text = HESPEDIM[key] || 'תוכן לא נמצא';
  const container = document.getElementById('modalText');
  container.innerHTML = text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => '<p>' + p.replace(/\n/g, '<br>') + '</p>')
    .join('');

  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Image modal ──
function openImg(url, caption) {
  document.getElementById('modalImg').src = url;
  var cap = document.getElementById('imgCaption');
  if (cap) cap.textContent = caption || '';
  document.getElementById('imgModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeImgModal() {
  document.getElementById('imgModal').classList.remove('open');
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

// ── Gallery carousel ──
(function () {
  var inner = document.getElementById('galleryInner');
  var dotsEl = document.getElementById('galleryDots');
  if (!inner) return;

  var ITEM_W = 150;
  var containerW = document.querySelector('.gallery-carousel') 
    ? document.querySelector('.gallery-carousel').offsetWidth 
    : 860;
  var VISIBLE = Math.max(1, Math.floor(containerW / ITEM_W));
  var items = inner.querySelectorAll('.gallery-item');
  var total = items.length;
  var maxOffset = Math.max(0, total - VISIBLE);
  var current = 0;

  // Dots
  var pages = Math.ceil(total / VISIBLE);
  for (var i = 0; i < pages; i++) {
    var dot = document.createElement('div');
    dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
    (function(pageIdx) {
      dot.onclick = function() { goTo(pageIdx * VISIBLE); };
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
    // RTL: scroll left in RTL = positive translateX
    inner.style.transform = 'translateX(' + (current * ITEM_W) + 'px)';
    updateDots();
  }

  window.galleryScroll = function(dir) {
    goTo(current + dir * VISIBLE);
  };

  // Mouse drag
  var startX = 0, startOffset = 0, dragging = false;
  inner.addEventListener('mousedown', function(e) {
    dragging = true;
    startX = e.clientX;
    startOffset = current;
    inner.classList.add('dragging');
    e.preventDefault();
  });
  window.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    var delta = (startX - e.clientX) / ITEM_W;
    current = Math.max(0, Math.min(startOffset + delta, maxOffset));
    inner.style.transform = 'translateX(' + (current * ITEM_W) + 'px)';
  });
  window.addEventListener('mouseup', function() {
    if (!dragging) return;
    dragging = false;
    inner.classList.remove('dragging');
    goTo(Math.round(current));
  });

  // Touch
  var touchStartX = 0, touchStartOffset = 0;
  inner.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartOffset = current;
  }, { passive: true });
  inner.addEventListener('touchmove', function(e) {
    var delta = (touchStartX - e.touches[0].clientX) / ITEM_W;
    current = Math.max(0, Math.min(touchStartOffset + delta, maxOffset));
    inner.style.transform = 'translateX(' + (current * ITEM_W) + 'px)';
  }, { passive: true });
  inner.addEventListener('touchend', function() {
    goTo(Math.round(current));
  });
})();

// ── Keyboard ──
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') { closeModal(); closeImgModal(); }
});
