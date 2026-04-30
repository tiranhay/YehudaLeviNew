// site.js — יהודה לוי ז"ל — אתר הנצחה

function openHesped(key) {
  const [name, role] = NAMES[key] || [key, ''];
  document.getElementById('modalTitle').textContent = name;
  document.getElementById('modalRole').textContent = role;
  document.getElementById('modalText').textContent = HESPEDIM[key] || 'תוכן לא נמצא';
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}

function openImg(url, caption) {
  document.getElementById('modalImg').src = url;
  const cap = document.getElementById('imgCaption');
  if (cap) cap.textContent = caption || '';
  document.getElementById('imgModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeImgModal() {
  document.getElementById('imgModal').classList.remove('open');
  document.body.style.overflow = '';
}

function filterHespedim(group, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.hesped-card').forEach(card => {
    const key = card.dataset.key;
    if (!key) return;
    card.classList.toggle('hidden', group !== 'all' && GROUPS[key] !== group);
  });
  document.querySelectorAll('.group-label').forEach(l => {
    l.style.display = group === 'all' ? '' : 'none';
  });
}

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeImgModal(); }
});
