/* ── Detroit Performs: Live From Marygrove — Episode Guide ─────────── */

// ── State ────────────────────────────────────────────────────────────
const state = {
  season: 'all',
  video:  'all',
  genre:  'all',
  curator:'all',
  search: ''
};

// ── DOM refs ──────────────────────────────────────────────────────────
const grid         = document.getElementById('episodes-grid');
const noResults    = document.getElementById('no-results');
const resultsCount = document.getElementById('results-count');
const clearBtn     = document.getElementById('clear-filters');
const noResClr     = document.getElementById('no-results-clear');
const genreSelect  = document.getElementById('select-genre');
const curatorSelect= document.getElementById('select-curator');
const searchInput  = document.getElementById('search-artist');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose   = document.getElementById('modal-close');
const modalVideo   = document.getElementById('modal-video-wrap');
const modalMeta    = document.getElementById('modal-meta');

// ── Helpers ───────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function seasonClass(season) {
  return `s${season}`;
}

function youtubeThumb(id) {
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

// ── Populate filter dropdowns ─────────────────────────────────────────
function populateFilters() {
  const genres   = new Set();
  const curators = new Set();
  EPISODES.forEach(ep => {
    ep.genres.forEach(g => genres.add(g));
    curators.add(ep.curator);
  });
  [...genres].sort().forEach(g => {
    const opt = document.createElement('option');
    opt.value = g; opt.textContent = g;
    genreSelect.appendChild(opt);
  });
  [...curators].sort().forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    curatorSelect.appendChild(opt);
  });
}

// ── Filter logic ──────────────────────────────────────────────────────
function filteredEpisodes() {
  return EPISODES.filter(ep => {
    if (state.season !== 'all' && ep.season !== Number(state.season)) return false;
    if (state.video  === 'yes' && !ep.youtubeId) return false;
    if (state.genre  !== 'all' && !ep.genres.includes(state.genre)) return false;
    if (state.curator!== 'all' && ep.curator !== state.curator) return false;
    if (state.search) {
      const q = state.search.toLowerCase();
      const searchable = [
        ep.title, ep.curator,
        ...ep.artists, ...ep.genres,
        ep.neighborhood || '', ep.description
      ].join(' ').toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });
}

function isFiltered() {
  return state.season !== 'all' || state.video !== 'all' ||
         state.genre  !== 'all' || state.curator !== 'all' ||
         state.search !== '';
}

// ── Build card HTML ───────────────────────────────────────────────────
function buildCard(ep) {
  const sc = seasonClass(ep.season);
  const hasvid = !!ep.youtubeId;
  const hasPBS = !!ep.pbsUrl;
  const dateStr = formatDate(ep.airDate);

  const thumbHTML = hasvid
    ? `<img class="card-thumb-img" src="${youtubeThumb(ep.youtubeId)}"
            alt="${ep.title} thumbnail" loading="lazy"
            onerror="this.parentElement.innerHTML=\`${noThumbHTML()}\`" />`
    : noThumbHTML();

  const playOverlay = hasvid
    ? `<button class="play-btn" aria-label="Watch ${ep.title}">
        <div class="play-circle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style="margin-left:3px">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
        </div>
      </button>` : '';

  const artistChips = ep.artists.map(a =>
    `<span class="artist-chip">${a}</span>`
  ).join('');

  const genreTags = ep.genres.slice(0,3).map(g =>
    `<span class="genre-tag">${g}</span>`
  ).join('');

  const footerHTML = hasvid
    ? `<button class="watch-btn" data-ytid="${ep.youtubeId}" data-title="${ep.title.replace(/"/g,'&quot;')}" data-meta="Season ${ep.season} · Ep. ${ep.episode} · ${dateStr}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          Watch Episode
        </button>
        ${hasPBS ? `<a href="${ep.pbsUrl}" target="_blank" rel="noopener" class="pbs-link-btn">PBS ↗</a>` : ''}`
    : `<span class="no-video-note">Video not yet available</span>
       ${hasPBS ? `<a href="${ep.pbsUrl}" target="_blank" rel="noopener" class="pbs-link-btn">View on PBS ↗</a>` : ''}`;

  return `
    <article class="episode-card" data-id="${ep.id}">
      <div class="card-thumb" ${hasvid ? `data-ytid="${ep.youtubeId}" data-title="${ep.title.replace(/"/g,'&quot;')}" data-meta="Season ${ep.season} · Ep. ${ep.episode} · ${dateStr}"` : ''} ${hasvid ? 'role="button" tabindex="0" aria-label="Watch '+ep.title+'"' : ''}>
        ${thumbHTML}
        ${playOverlay}
      </div>
      <div class="season-stripe ${sc}"></div>
      <div class="card-body">
        <div class="card-meta-top">
          <span class="card-season-badge ${sc}">S${ep.season} · Ep. ${ep.episode}</span>
          <span class="card-date">${dateStr}</span>
        </div>
        <h2 class="card-title">${ep.title}</h2>
        <p class="card-curator">🎭 ${ep.curator}</p>
        ${artistChips ? `<div class="card-artists">${artistChips}</div>` : ''}
        ${genreTags  ? `<div class="card-genres">${genreTags}</div>`    : ''}
        <p class="card-desc">${ep.description}</p>
      </div>
      <div class="card-footer">
        ${footerHTML}
      </div>
    </article>`;
}

function noThumbHTML() {
  return `<div class="card-thumb-placeholder">
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="m8 21 4-4 4 4M12 17v4"/>
    </svg>
    <span>Marygrove Stage</span>
  </div>`;
}

// ── Render ────────────────────────────────────────────────────────────
function render() {
  const episodes = filteredEpisodes();
  grid.innerHTML = episodes.map(buildCard).join('');
  noResults.hidden = episodes.length > 0;
  const pl = episodes.length === 1 ? 'episode' : 'episodes';
  resultsCount.textContent = `${episodes.length} ${pl}`;
  clearBtn.hidden = !isFiltered();
  attachCardListeners();
}

// ── Card click handlers ───────────────────────────────────────────────
function attachCardListeners() {
  // Thumb click
  grid.querySelectorAll('.card-thumb[data-ytid]').forEach(el => {
    el.addEventListener('click', () => openModal(el.dataset.ytid, el.dataset.title, el.dataset.meta));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openModal(el.dataset.ytid, el.dataset.title, el.dataset.meta);
    });
  });
  // Watch button
  grid.querySelectorAll('.watch-btn[data-ytid]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.ytid, btn.dataset.title, btn.dataset.meta));
  });
}

// ── Modal ─────────────────────────────────────────────────────────────
function openModal(ytid, title, meta) {
  modalVideo.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytid}?autoplay=1&rel=0" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
  modalMeta.innerHTML  = `<h2>${title}</h2><p>${meta}</p>`;
  modalOverlay.hidden  = false;
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeModal() {
  modalOverlay.hidden = true;
  modalVideo.innerHTML = '';
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modalOverlay.hidden) closeModal(); });

// ── Filter event listeners ────────────────────────────────────────────
document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    const filterType = btn.dataset.filter;
    document.querySelectorAll(`.filter-btn[data-filter="${filterType}"]`).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state[filterType] = btn.dataset.value;
    render();
  });
});

genreSelect.addEventListener('change', () => { state.genre = genreSelect.value; render(); });
curatorSelect.addEventListener('change', () => { state.curator = curatorSelect.value; render(); });
searchInput.addEventListener('input', () => { state.search = searchInput.value.trim(); render(); });

function clearFilters() {
  state.season = 'all'; state.video = 'all';
  state.genre = 'all'; state.curator = 'all'; state.search = '';
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.value === 'all');
  });
  genreSelect.value = 'all';
  curatorSelect.value = 'all';
  searchInput.value = '';
  render();
}

clearBtn.addEventListener('click', clearFilters);
noResClr.addEventListener('click', clearFilters);
document.getElementById('no-results-clear')?.addEventListener('click', clearFilters);

// ── Theme toggle ──────────────────────────────────────────────────────
(function(){
  const toggle = document.querySelector('[data-theme-toggle]');
  const root   = document.documentElement;
  let theme    = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  root.setAttribute('data-theme', theme);
  function updateToggle() {
    if (!toggle) return;
    toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    toggle.innerHTML = theme === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
  updateToggle();
  toggle?.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    updateToggle();
  });
})();

// ── Init ──────────────────────────────────────────────────────────────
populateFilters();
render();
